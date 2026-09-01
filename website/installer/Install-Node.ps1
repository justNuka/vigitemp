Param(
    [string]$InstallerPath,
    [switch]$Interactive,
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

function Get-NodeMsiVersionFromName {
    param([Parameter(Mandatory = $true)][string]$Path)
    $name = [System.IO.Path]::GetFileName($Path)
    $match = [regex]::Match($name, '^node-v(?<v>\d+\.\d+\.\d+)-x64\.msi$', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) { return $match.Groups["v"].Value }
    return $null
}

function Find-NodeInstaller {
    param([Parameter(Mandatory = $true)][string]$BasePath)

    $searchDirs = @(
        (Join-Path $BasePath "prereqs"),
        $BasePath
    ) | Where-Object { Test-Path $_ }

    $candidates = @()
    foreach ($dir in $searchDirs) {
        $candidates += Get-ChildItem -Path $dir -File -Filter "node-v*-x64.msi" -ErrorAction SilentlyContinue
        $candidates += Get-ChildItem -Path $dir -File -Filter "node-*.msi" -ErrorAction SilentlyContinue
    }

    $uniqueCandidates = @($candidates | Sort-Object -Property FullName -Unique)
    if ($uniqueCandidates.Count -eq 0) { return $null }

    $decorated = $uniqueCandidates | ForEach-Object {
        $version = Get-NodeMsiVersionFromName -Path $_.FullName
        $versionObject = $null
        if (-not [string]::IsNullOrWhiteSpace($version)) {
            try { $versionObject = [version]$version } catch { $versionObject = $null }
        }
        [pscustomobject]@{
            File = $_
            Version = $version
            VersionObject = $versionObject
            HasVersion = -not [string]::IsNullOrWhiteSpace($version)
            LastWriteTime = $_.LastWriteTimeUtc
        }
    }

    $bestWithVersion = $decorated | Where-Object { $_.VersionObject -ne $null } | Sort-Object -Property @{ Expression = { $_.VersionObject }; Descending = $true } | Select-Object -First 1
    if ($bestWithVersion) {
        return $bestWithVersion.File.FullName
    }

    return ($decorated | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1).File.FullName
}

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($InstallerPath)) {
    $InstallerPath = Find-NodeInstaller -BasePath $scriptRoot
    if (-not [string]::IsNullOrWhiteSpace($InstallerPath)) {
        $detectedVersion = Get-NodeMsiVersionFromName -Path $InstallerPath
        if ($detectedVersion) {
            Write-Log "Installateur Node detecte: $InstallerPath (version $detectedVersion)"
        } else {
            Write-Log "Installateur Node detecte: $InstallerPath"
        }
    }
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
Write-Log "Installation interactive (fenetre MSI)."
Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$InstallerPath`"") -Wait -NoNewWindow

Write-Log "Installation Node terminee."

# Rafraichit le PATH dans la session courante
try {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = @($machinePath, $userPath) -join ";"
    Write-Log "PATH mis a jour dans la session courante."
} catch {
    Write-Log "Impossible de rafraichir le PATH automatiquement."
}

try {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $version = & $nodeCmd.Source --version
        Write-Log "Node detecte apres installation : $version"
    } else {
        Write-Log "Node non detecte dans ce terminal. Fermez/rouvrez le terminal si besoin."
    }
} catch { }

