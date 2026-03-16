Param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",
    [string]$AgentBuildOutput,
    [string]$MsiPath,
    [string]$OutputDir,
    [string]$FinalizeScriptPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Force UTF-8 console encoding for correct accents/special characters in logs.
try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

function Get-MSBuildPath {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    if (Test-Path $vswhere) {
        $msbuild = & $vswhere -latest -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\MSBuild.exe' | Select-Object -First 1
        if (-not [string]::IsNullOrWhiteSpace($msbuild)) {
            return $msbuild.Trim()
        }
    }

    $command = Get-Command msbuild -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    throw "MSBuild introuvable. Installez les Build Tools Visual Studio ou ajoutez MSBuild au PATH."
}

$scriptRoot = $PSScriptRoot
$agentRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $agentRoot "..")
$agentProjectPath = Join-Path $agentRoot "Vigitemp agent\Vigitemp Agent.csproj"
$buildMsiScriptPath = Join-Path $scriptRoot "wix\build-msi.ps1"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\vigi\2 - installation\3 - agent"
}

if ([string]::IsNullOrWhiteSpace($FinalizeScriptPath)) {
    $FinalizeScriptPath = Join-Path $scriptRoot "Finalize-AgentInstall.ps1"
}

if (-not (Test-Path $agentProjectPath)) {
    throw "Projet agent introuvable: $agentProjectPath"
}

if (-not (Test-Path $buildMsiScriptPath)) {
    throw "Script build MSI introuvable: $buildMsiScriptPath"
}

if (-not (Test-Path $FinalizeScriptPath)) {
    throw "Script de finalisation introuvable: $FinalizeScriptPath"
}

$msbuildPath = Get-MSBuildPath
Write-Log "Build agent ($Configuration) avec MSBuild..."
& $msbuildPath $agentProjectPath /restore /t:Build /p:Configuration=$Configuration /p:Platform=AnyCPU /nologo
if ($LASTEXITCODE -ne 0) {
    throw "Echec du build agent."
}

if ([string]::IsNullOrWhiteSpace($AgentBuildOutput)) {
    $AgentBuildOutput = Join-Path $agentRoot "Vigitemp agent\bin\$Configuration"
}

$agentExe = Join-Path $AgentBuildOutput "VigitempAgent.exe"
if (-not (Test-Path $agentExe)) {
    throw "Agent executable not found: $agentExe"
}

Write-Log "Build MSI..."
powershell -ExecutionPolicy Bypass -File $buildMsiScriptPath -Configuration $Configuration
if ($LASTEXITCODE -ne 0) {
    throw "Echec du build MSI."
}

if ([string]::IsNullOrWhiteSpace($MsiPath)) {
    $MsiPath = Join-Path $agentRoot "installer\wix\out\VigitempAgent.msi"
}

if (-not (Test-Path $MsiPath)) {
    throw "MSI introuvable: $MsiPath"
}

Write-Log "Preparing agent package: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$legacyInstallerDir = Join-Path $OutputDir "installer"
if (Test-Path $legacyInstallerDir) {
    Write-Log "Removing legacy installer folder..."
    Remove-Item -Path $legacyInstallerDir -Recurse -Force
}

Write-Log "Copying MSI installer..."
Copy-Item -Path $MsiPath -Destination $OutputDir -Force

Write-Log "Copying finalization script..."
Copy-Item -Path $FinalizeScriptPath -Destination $OutputDir -Force

Write-Log "Creating finalization launcher..."
$launcherCmdPath = Join-Path $OutputDir "Finalize-AgentInstall.cmd"
$cmdContent = @"
@echo off
powershell.exe -ExecutionPolicy Bypass -File "%~dp0Finalize-AgentInstall.ps1" -InstallDir "%ProgramFiles(x86)%\Vigitemp\Agent"
pause
"@
Set-Content -Path $launcherCmdPath -Value $cmdContent -Encoding ASCII

Write-Log "Done. Package ready at: $OutputDir"
