Param(
    [string]$ServiceName,
    [string]$InstallDir,
    [switch]$RemoveSharedData,
    [switch]$Force
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

function Test-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$programData = [Environment]::GetFolderPath("CommonApplicationData")
$defaultInstallDir = Join-Path $programData "Vigitemp\\website"
$defaultServiceName = "VigitempWeb"

if ([string]::IsNullOrWhiteSpace($ServiceName)) {
    $ServiceName = $defaultServiceName
}
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = $defaultInstallDir
}

if (-not $Force) {
    $answer = Read-Host "Supprimer le service et les fichiers web ? (y/n) [y]"
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
    $logsDir = Join-Path $programData "Vigitemp\\web-logs"
    $installLogsDir = Join-Path $programData "Vigitemp\\install-logs"
    if (Test-Path $logsDir) {
        Write-Log "Suppression logs web: $logsDir"
        Remove-Item -Path $logsDir -Recurse -Force
    }
    if (Test-Path $installLogsDir) {
        Write-Log "Suppression logs install: $installLogsDir"
        Remove-Item -Path $installLogsDir -Recurse -Force
    }
}

try {
    $webKey = "HKLM:\\SOFTWARE\\Vigitemp\\Web"
    if (Test-Path $webKey) {
        Write-Log "Suppression registre: $webKey"
        Remove-Item -Path $webKey -Recurse -Force
    }
} catch {
    Write-Log "Impossible de supprimer la cle de registre."
}

Write-Log "Desinstallation web terminee."

