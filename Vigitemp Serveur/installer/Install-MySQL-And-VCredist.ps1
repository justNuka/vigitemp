Param(
    [string]$VcRedistPath,
    [string]$MySqlMsiPath
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
if ([string]::IsNullOrWhiteSpace($VcRedistPath)) {
    $VcRedistPath = Join-Path $scriptRoot "prereqs\\VC_redist.x64.exe"
}
if ([string]::IsNullOrWhiteSpace($MySqlMsiPath)) {
    $MySqlMsiPath = Join-Path $scriptRoot "prereqs\\mysql-8.4.7-winx64.msi"
}

if (-not (Test-Path $VcRedistPath)) {
    Write-Error "VC redist introuvable : $VcRedistPath"
}
if (-not (Test-Path $MySqlMsiPath)) {
    Write-Error "MySQL MSI introuvable : $MySqlMsiPath"
}

Write-Log "Debut installation VC Redist (silencieux)..."
Start-Process -FilePath $VcRedistPath -ArgumentList @("/install", "/quiet", "/norestart") -Wait -NoNewWindow
Write-Log "Installation VC Redist terminee."

Write-Log "Debut installation MySQL (interactive)..."
Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$MySqlMsiPath`"") -Wait -NoNewWindow
Write-Log "Installation MySQL terminee."
