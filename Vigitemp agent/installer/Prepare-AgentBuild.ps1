Param(
    [string]$AgentBuildOutput,
    [string]$MsiPath,
    [string]$OutputDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"


# Force UTF-8 console encoding for correct accents/special characters in logs.
try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

$scriptRoot = $PSScriptRoot
$agentRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $agentRoot "..")

if ([string]::IsNullOrWhiteSpace($AgentBuildOutput)) {
    $releaseExe = Join-Path $agentRoot "Vigitemp agent\\bin\\Release\\VigitempAgent.exe"
    $debugExe = Join-Path $agentRoot "Vigitemp agent\\bin\\Debug\\VigitempAgent.exe"
    if ((Test-Path $releaseExe) -and (Test-Path $debugExe)) {
        $releaseTime = (Get-Item $releaseExe).LastWriteTime
        $debugTime = (Get-Item $debugExe).LastWriteTime
        if ($debugTime -gt $releaseTime) {
            $AgentBuildOutput = Split-Path $debugExe -Parent
        } else {
            $AgentBuildOutput = Split-Path $releaseExe -Parent
        }
    } elseif (Test-Path $releaseExe) {
        $AgentBuildOutput = Split-Path $releaseExe -Parent
    } elseif (Test-Path $debugExe) {
        $AgentBuildOutput = Split-Path $debugExe -Parent
    } else {
        $AgentBuildOutput = Join-Path $agentRoot "Vigitemp agent\\bin\\Release"
    }
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\\vigi\\2 - installation\\3 - agent"
}

$agentExe = Join-Path $AgentBuildOutput "VigitempAgent.exe"
if (-not (Test-Path $agentExe)) {
    Write-Error "Agent executable not found: $agentExe"
}

if ([string]::IsNullOrWhiteSpace($MsiPath)) {
    $MsiPath = Join-Path $agentRoot "installer\\wix\\out\\VigitempAgent.msi"
}

if (-not (Test-Path $MsiPath)) {
    Write-Error "MSI introuvable: $MsiPath"
}

$msiDir = Split-Path $MsiPath -Parent
$cabPath = Join-Path $msiDir "cab1.cab"
$pdbPath = Join-Path $msiDir "VigitempAgent.wixpdb"

Write-Log "Preparing agent package: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$legacyInstallerDir = Join-Path $OutputDir "installer"
if (Test-Path $legacyInstallerDir) {
    Write-Log "Removing legacy installer folder..."
    Remove-Item -Path $legacyInstallerDir -Recurse -Force
}

Write-Log "Copying MSI installer..."
Copy-Item -Path $MsiPath -Destination $OutputDir -Force

if (Test-Path $cabPath) {
    Write-Log "Copying cab1.cab..."
    Copy-Item -Path $cabPath -Destination $OutputDir -Force
}

if (Test-Path $pdbPath) {
    Write-Log "Copying wixpdb..."
    Copy-Item -Path $pdbPath -Destination $OutputDir -Force
}

Write-Log "Done. Package ready at: $OutputDir"



