Param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",
    [string]$AgentBuildOutput,
    [string]$OutputDir,
    [string]$InstallerProjectPath,
    [string]$SignCertPath,
    [string]$SignCertPassword,
    [string]$SignThumbprint,
    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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

function Get-SignToolPath {
    $command = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $kitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
    if (Test-Path $kitsRoot) {
        $candidates = Get-ChildItem -Path $kitsRoot -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending
        if ($candidates) {
            return $candidates[0].FullName
        }
    }

    throw "signtool.exe introuvable. Installez le Windows SDK ou ajoutez signtool au PATH."
}

function Sign-File {
    Param(
        [Parameter(Mandatory = $true)][string]$FilePath
    )

    if ([string]::IsNullOrWhiteSpace($SignCertPath) -and [string]::IsNullOrWhiteSpace($SignThumbprint)) {
        return
    }

    $signToolPath = Get-SignToolPath
    $arguments = @("sign", "/fd", "SHA256", "/td", "SHA256", "/tr", $TimestampUrl)

    if (-not [string]::IsNullOrWhiteSpace($SignCertPath)) {
        $arguments += @("/f", $SignCertPath)
        if (-not [string]::IsNullOrWhiteSpace($SignCertPassword)) {
            $arguments += @("/p", $SignCertPassword)
        }
    } elseif (-not [string]::IsNullOrWhiteSpace($SignThumbprint)) {
        $arguments += @("/sha1", $SignThumbprint)
    }

    $arguments += $FilePath

    Write-Log "Signature: $FilePath"
    & $signToolPath @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Echec de la signature pour $FilePath"
    }
}

$scriptRoot = $PSScriptRoot
$agentRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $agentRoot "..")
$agentProjectPath = Join-Path $agentRoot "Vigitemp agent\Vigitemp Agent.csproj"
$installerPayloadRoot = Join-Path $agentRoot "VigitempAgentInstaller\Payload"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\VigiSensys\2 - installation\3-agent"
}

if ([string]::IsNullOrWhiteSpace($InstallerProjectPath)) {
    $InstallerProjectPath = Join-Path $agentRoot "VigitempAgentInstaller\VigitempAgentInstaller.csproj"
}

if (-not (Test-Path $agentProjectPath)) {
    throw "Projet agent introuvable: $agentProjectPath"
}

if (-not (Test-Path $InstallerProjectPath)) {
    throw "Projet installeur EXE introuvable: $InstallerProjectPath"
}

$msbuildPath = Get-MSBuildPath
if (-not $SkipBuild) {
    Write-Log "Build agent ($Configuration) avec MSBuild..."
    & $msbuildPath $agentProjectPath /restore /t:Build /p:Configuration=$Configuration /p:Platform=AnyCPU /nologo /p:GenerateManifests=false /p:SignManifests=false
    if ($LASTEXITCODE -ne 0) {
        throw "Echec du build agent."
    }
}

if ([string]::IsNullOrWhiteSpace($AgentBuildOutput)) {
    $AgentBuildOutput = Join-Path $agentRoot "Vigitemp agent\bin\$Configuration"
}

$agentExe = Join-Path $AgentBuildOutput "VigitempAgent.exe"
if (-not (Test-Path $agentExe)) {
    throw "Executable agent introuvable: $agentExe"
}
$workerExe = Join-Path $AgentBuildOutput "VigitempLogTagWorker.exe"
if (-not (Test-Path $workerExe)) {
    throw "Executable worker introuvable: $workerExe"
}

Sign-File -FilePath $agentExe
Sign-File -FilePath $workerExe

Write-Log "Preparation du payload embarque..."
if (Test-Path $installerPayloadRoot) {
    Remove-Item -Path $installerPayloadRoot -Recurse -Force
}

$agentPayloadDir = Join-Path $installerPayloadRoot "agent"
$driverPayloadDir = Join-Path $installerPayloadRoot "driver"
New-Item -ItemType Directory -Force -Path $agentPayloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $driverPayloadDir | Out-Null

Get-ChildItem -Path $AgentBuildOutput -File | Where-Object {
    $_.Extension -notin @('.pdb', '.xml') -and
    $_.Name -notlike '*.vshost.*'
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $agentPayloadDir $_.Name) -Force
}

Get-ChildItem -Path $AgentBuildOutput -Directory | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $agentPayloadDir $_.Name) -Recurse -Force
}

$driverSource = Get-ChildItem -Path (Join-Path $agentRoot "Vigitemp agent\Resources") -File |
    Where-Object { $_.Name -like '*Cradle*Driver*Installation*.exe' -or $_.Name -like '*Cradle*.exe' } |
    Select-Object -First 1

if (-not $driverSource) {
    throw "Driver cradle introuvable dans Vigitemp agent\\Resources."
}

Copy-Item -Path $driverSource.FullName -Destination (Join-Path $driverPayloadDir $driverSource.Name) -Force

if (-not $SkipBuild) {
    Write-Log "Build installeur EXE..."
    & $msbuildPath $InstallerProjectPath /restore /t:Build /p:Configuration=$Configuration /p:Platform=AnyCPU /nologo
    if ($LASTEXITCODE -ne 0) {
        throw "Echec du build de l'installeur EXE."
    }
}

$installerOutputExe = Join-Path $agentRoot "VigitempAgentInstaller\bin\$Configuration\VigiSensysAgentSetup.exe"
if (-not (Test-Path $installerOutputExe)) {
    throw "Executable installeur introuvable: $installerOutputExe"
}

Sign-File -FilePath $installerOutputExe

Write-Log "Preparation du package final: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
Get-ChildItem -Path $OutputDir -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

Copy-Item -Path $installerOutputExe -Destination (Join-Path $OutputDir 'VigiSensysAgentSetup.exe') -Force

Write-Log "Package pret: $OutputDir"
