Param(
    [string]$VcRedistPath,
    [string]$MySqlMsiPath,
    [string]$MainSeedPath,
    [string]$MySqlHost = "127.0.0.1",
    [int]$MySqlPort = 3306,
    [string]$MySqlUser = "root",
    [string]$MySqlPassword
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

function Get-InstalledVCRedistVersion {
    $regPath = "HKLM:\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64"
    try {
        $item = Get-ItemProperty -Path $regPath -ErrorAction Stop
        if ($item -and $item.Version) {
            return $item.Version
        }
    } catch { }
    return $null
}

function Get-MySqlExePath {
    $mysqlCmd = Get-Command "mysql.exe" -ErrorAction SilentlyContinue
    if ($mysqlCmd) { return $mysqlCmd.Source }
    $mysqlBase = Join-Path $env:ProgramFiles "MySQL"
    if (Test-Path $mysqlBase) {
        $candidate = Get-ChildItem -Path $mysqlBase -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName "bin\\mysql.exe" } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
        if ($candidate) { return $candidate }
    }
    return $null
}

function Get-MySqlVersionFromExe([string]$mysqlExe) {
    if (-not $mysqlExe) { return $null }
    try {
        $output = & $mysqlExe --version 2>$null
        if ($output) {
            $match = [regex]::Match($output, "Distrib\\s+(\\d+\\.\\d+\\.\\d+)")
            if ($match.Success) { return $match.Groups[1].Value }
        }
    } catch { }
    return $null
}

function Compare-Version([string]$current, [string]$expected) {
    if ([string]::IsNullOrWhiteSpace($current)) { return -1 }
    try {
        $cur = [Version]$current
        $exp = [Version]$expected
        return $cur.CompareTo($exp)
    } catch { }
    return -1
}

function Convert-SecureStringToPlainText([Security.SecureString]$secureValue) {
    if ($null -eq $secureValue) { return "" }
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($VcRedistPath)) {
    $VcRedistPath = Join-Path $scriptRoot "prereqs\\VC_redist.x64.exe"
    if (-not (Test-Path $VcRedistPath)) {
        $VcRedistPath = Join-Path $scriptRoot "VC_redist.x64.exe"
    }
}
if ([string]::IsNullOrWhiteSpace($MySqlMsiPath)) {
    $MySqlMsiPath = Join-Path $scriptRoot "prereqs\\mysql-8.4.7-winx64.msi"
    if (-not (Test-Path $MySqlMsiPath)) {
        $MySqlMsiPath = Join-Path $scriptRoot "mysql-8.4.7-winx64.msi"
    }
}
if ([string]::IsNullOrWhiteSpace($MainSeedPath)) {
    $MainSeedPath = Join-Path $scriptRoot "db\\vigisensys_seed.sql"
}

if (-not (Test-Path $VcRedistPath)) {
    Write-Error "VC redist introuvable : $VcRedistPath"
}
if (-not (Test-Path $MySqlMsiPath)) {
    Write-Error "MySQL MSI introuvable : $MySqlMsiPath"
}

 $expectedVcVersion = "14.38.33135.0"
 $installedVcVersion = Get-InstalledVCRedistVersion
 if ($installedVcVersion) {
     $vcCompare = Compare-Version $installedVcVersion $expectedVcVersion
     if ($vcCompare -ge 0) {
         Write-Log "VC Redist detecte (version $installedVcVersion). Installation ignoree."
     } else {
         Write-Log "VC Redist detecte (version $installedVcVersion). Mise a jour vers $expectedVcVersion..."
         Start-Process -FilePath $VcRedistPath -ArgumentList @("/install", "/quiet", "/norestart") -Wait -NoNewWindow
         Write-Log "Installation VC Redist terminee."
     }
 } else {
     Write-Log "VC Redist non detecte. Installation en cours..."
     Start-Process -FilePath $VcRedistPath -ArgumentList @("/install", "/quiet", "/norestart") -Wait -NoNewWindow
     Write-Log "Installation VC Redist terminee."
 }

 $expectedMySqlVersion = "8.4.7"
 $mysqlExeExisting = Get-MySqlExePath
 $installedMySqlVersion = Get-MySqlVersionFromExe $mysqlExeExisting
 if ($installedMySqlVersion) {
     $mysqlCompare = Compare-Version $installedMySqlVersion $expectedMySqlVersion
     if ($mysqlCompare -ge 0) {
         Write-Log "MySQL detecte (version $installedMySqlVersion). Installation ignoree."
     } else {
         Write-Log "MySQL detecte (version $installedMySqlVersion). Mise a jour vers $expectedMySqlVersion..."
         Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$MySqlMsiPath`"") -Wait -NoNewWindow
         Write-Log "Installation MySQL terminee."
     }
 } else {
     Write-Log "MySQL non detecte. Installation en cours (interactive)..."
     Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", "`"$MySqlMsiPath`"") -Wait -NoNewWindow
     Write-Log "Installation MySQL terminee."
 }

Write-Log "Lancer le configurateur MySQL et terminer la configuration (port, mot de passe root, service...)."
$null = Read-Host "Appuyez sur Entrée quand la configuration MySQL est terminée"

if (-not (Test-Path $MainSeedPath)) {
    Write-Error "Seed complet introuvable : $MainSeedPath"
}

$mysqlExe = Get-MySqlExePath
if (-not $mysqlExe) {
    Write-Error "mysql.exe introuvable. Ajoutez MySQL au PATH ou indiquez le chemin dans le script."
}

if ([string]::IsNullOrWhiteSpace($MySqlPassword)) {
    $MySqlPassword = Convert-SecureStringToPlainText (Read-Host "Mot de passe MySQL ($MySqlUser)" -AsSecureString)
}

$mysqlArgs = @("--host=$MySqlHost", "--port=$MySqlPort", "--user=$MySqlUser", "--default-character-set=utf8mb4")
if (-not [string]::IsNullOrWhiteSpace($MySqlPassword)) {
    $mysqlArgs += "--password=$MySqlPassword"
}

Write-Log "Import des bases (vigi_main, vigi_mesures, vigi_chat)..."
Get-Content -Path $MainSeedPath -Raw | & $mysqlExe @mysqlArgs
Write-Log "Import termine."


