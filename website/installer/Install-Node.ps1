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

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($InstallerPath)) {
    $InstallerPath = Join-Path $scriptRoot "prereqs\\node-v24.12.0-x64.msi"
    if (-not (Test-Path $InstallerPath)) {
        $InstallerPath = Join-Path $scriptRoot "node-v24.12.0-x64.msi"
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

