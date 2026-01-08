Param(
    [string]$BuildOutput,
    [string]$OutputDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

$scriptRoot = $PSScriptRoot
$serverRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $serverRoot "..")

if ([string]::IsNullOrWhiteSpace($BuildOutput)) {
    $BuildOutput = Join-Path $serverRoot "Vigitemp Serveur\\bin\\Release"
}
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "build\\server-offline"
}

$exePath = Join-Path $BuildOutput "Vigitemp Serveur.exe"
if (-not (Test-Path $exePath)) {
    Write-Error "Executable not found: $exePath"
}

Write-Log "Preparing server package: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Log "Copying server build output..."
& robocopy $BuildOutput $OutputDir /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null

$installerSrc = Join-Path $serverRoot "installer"
if (Test-Path $installerSrc) {
    Write-Log "Copying installer scripts..."
    & robocopy $installerSrc (Join-Path $OutputDir "installer") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
}

Write-Log "Done. Package ready at: $OutputDir"
