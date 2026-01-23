Param(
    [string]$ServiceName,
    [string]$InstallDir,
    [switch]$RemoveSharedData,
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

$programData = [Environment]::GetFolderPath("CommonApplicationData")
$defaultInstallDir = Join-Path $programData "Vigitemp\\server"
$defaultServiceName = "VigitempServeur"

if ([string]::IsNullOrWhiteSpace($ServiceName)) {
    $ServiceName = $defaultServiceName
}
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = $defaultInstallDir
}

if (-not $Force) {
    $answer = Read-Host "Supprimer le service et les fichiers serveur ? (y/n) [y]"
    if ([string]::IsNullOrWhiteSpace($answer)) { $answer = "y" }
    if ($answer -ne "y") { Write-Log "Annule."; exit 1 }
}

Write-Log "Arret du service $ServiceName..."
try { Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue } catch { }
& sc.exe delete $ServiceName | Out-Null

if (Test-Path $InstallDir) {
    Write-Log "Suppression du dossier: $InstallDir"
    Remove-Item -Path $InstallDir -Recurse -Force
}

if ($RemoveSharedData -or $Force) {
    $logsDir = Join-Path $programData "Vigitemp\\logs"
    $installLogsDir = Join-Path $programData "Vigitemp\\install-logs"
    $licenseDir = Join-Path $programData "Vigitemp\\licenses"
    $licenseKeyDir = Join-Path $programData "Vigitemp\\license_keys"
    foreach ($dir in @($logsDir, $installLogsDir, $licenseDir, $licenseKeyDir)) {
        if (Test-Path $dir) {
            Write-Log "Suppression dossier: $dir"
            Remove-Item -Path $dir -Recurse -Force
        }
    }
}

try {
    $serverKey = "HKLM:\\SOFTWARE\\Vigitemp\\Server"
    if (Test-Path $serverKey) {
        Write-Log "Suppression registre: $serverKey"
        Remove-Item -Path $serverKey -Recurse -Force
    }
} catch {
    Write-Log "Impossible de supprimer la cle de registre."
}

Write-Log "Desinstallation serveur terminee."
