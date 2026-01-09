Param(
    [string]$InstallerPath,
    [switch]$Interactive,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

function Test-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($InstallerPath)) {
    $InstallerPath = Join-Path $scriptRoot "prereqs\\node-v24.12.0-x64.msi"
}

if (-not (Test-Path $InstallerPath)) {
    Write-Error "Installateur Node introuvable : $InstallerPath"
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd -and -not $Force) {
    try {
        $version = & $nodeCmd.Source --version
        Write-Log "Node deja installe : $version. Utiliser -Force pour reinstaller."
        exit 0
    } catch {
        Write-Log "Node detecte mais version non lisible. Reinstallation forcee."
    }
}

Write-Log "Debut installation Node..."
if ($Interactive) {
    Write-Log "Installation interactive (fenetre MSI)."
    Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$InstallerPath`"") -Wait -NoNewWindow
} else {
    Write-Log "Installation silencieuse (msiexec /quiet)."
    Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$InstallerPath`"", "/quiet", "/norestart") -Wait -NoNewWindow
}

Write-Log "Installation Node terminee."
