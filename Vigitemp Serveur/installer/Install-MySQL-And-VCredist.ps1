Param(
    [string]$VcRedistPath,
    [string]$MySqlMsiPath,
    [string]$MainSeedPath,
    [string]$MySqlHost = "127.0.0.1",
    [int]$MySqlPort = 3306,
    [string]$MySqlUser = "root",
    [string]$MySqlPassword,
    [string]$InstallMode,
    [switch]$SkipDatabaseSeed
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

function Get-InstallerVersionFromFileName([string]$filePath, [string]$pattern) {
    if ([string]::IsNullOrWhiteSpace($filePath) -or -not (Test-Path $filePath)) { return $null }
    $fileName = [System.IO.Path]::GetFileName($filePath)
    $match = [regex]::Match($fileName, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) {
        return $match.Groups["v"].Value
    }
    return $null
}

function Get-BestInstallerFile([string[]]$searchDirectories, [string[]]$patterns, [string]$versionRegex) {
    $candidates = @()
    foreach ($directory in $searchDirectories) {
        if ([string]::IsNullOrWhiteSpace($directory) -or -not (Test-Path $directory)) { continue }
        foreach ($pattern in $patterns) {
            $candidates += Get-ChildItem -Path $directory -File -Filter $pattern -ErrorAction SilentlyContinue
        }
    }

    $candidates = @(
        $candidates |
            Sort-Object -Property FullName -Unique
    )

    if ($candidates.Count -eq 0) {
        return $null
    }

    $bestPath = $null
    $bestVersion = $null
    $bestWriteTime = [datetime]::MinValue
    foreach ($candidate in $candidates) {
        $version = Get-InstallerVersionFromFileName -filePath $candidate.FullName -pattern $versionRegex
        if (-not [string]::IsNullOrWhiteSpace($version)) {
            try {
                $parsed = [Version]$version
                if ($null -eq $bestVersion -or $parsed -gt $bestVersion) {
                    $bestVersion = $parsed
                    $bestPath = $candidate.FullName
                }
                continue
            } catch { }
        }

        if ($null -eq $bestPath -or $candidate.LastWriteTimeUtc -gt $bestWriteTime) {
            $bestPath = $candidate.FullName
            $bestWriteTime = $candidate.LastWriteTimeUtc
        }
    }

    return $bestPath
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

function Read-InstallValue($label, $defaultValue = $null) {
    if ([string]::IsNullOrWhiteSpace($defaultValue)) {
        return Read-Host $label
    }
    $value = Read-Host "$label [$defaultValue]"
    if ([string]::IsNullOrWhiteSpace($value)) { return $defaultValue }
    return $value
}

function Normalize-InstallMode([string]$value, [bool]$skipSeed) {
    if ($skipSeed) { return "update" }
    if ([string]::IsNullOrWhiteSpace($value)) { return "" }
    $normalized = $value.Trim().ToLowerInvariant()
    if ($normalized -in @("update", "upgrade", "migration", "migrate", "maj", "mise-a-jour", "miseajour", "vigitemp-to-vigisensys")) {
        return "update"
    }
    return "normal"
}

if (-not (Test-Admin)) {
    Write-Error "Ce script doit etre lance en tant qu'administrateur."
}

$effectiveInstallMode = Normalize-InstallMode $InstallMode $SkipDatabaseSeed.IsPresent
if ([string]::IsNullOrWhiteSpace($effectiveInstallMode)) {
    $modeAnswer = Read-InstallValue "Mode BDD: normal ou update (migration Vigitemp -> VigiSensys, sans seed SQL)" "normal"
    $effectiveInstallMode = Normalize-InstallMode $modeAnswer $false
}
$skipSeedImport = $effectiveInstallMode -eq "update"
if ($skipSeedImport) {
    Write-Log "Mode migration Vigitemp -> VigiSensys: les seeds SQL ne seront pas importes."
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($VcRedistPath)) {
    $VcRedistPath = Join-Path $scriptRoot "prereqs\\VC_redist.x64.exe"
    if (-not (Test-Path $VcRedistPath)) {
        $VcRedistPath = Join-Path $scriptRoot "VC_redist.x64.exe"
    }
}
if ([string]::IsNullOrWhiteSpace($MySqlMsiPath)) {
    $MySqlMsiPath = Get-BestInstallerFile `
        -searchDirectories @(
            (Join-Path $scriptRoot "prereqs"),
            $scriptRoot
        ) `
        -patterns @("mysql-*-winx64.msi", "mysql-*.msi") `
        -versionRegex '^mysql-(?<v>\d+\.\d+\.\d+)-winx64\.msi$'
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

 $expectedMySqlVersion = Get-InstallerVersionFromFileName -filePath $MySqlMsiPath -pattern '^mysql-(?<v>\d+\.\d+\.\d+)-winx64\.msi$'
 $mysqlExeExisting = Get-MySqlExePath
 $installedMySqlVersion = Get-MySqlVersionFromExe $mysqlExeExisting
 if ($installedMySqlVersion) {
     $mysqlCompare = if ([string]::IsNullOrWhiteSpace($expectedMySqlVersion)) { 0 } else { Compare-Version $installedMySqlVersion $expectedMySqlVersion }
     if ([string]::IsNullOrWhiteSpace($expectedMySqlVersion) -or $mysqlCompare -ge 0) {
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
$null = Read-Host "Appuyez sur Entree quand la configuration MySQL est terminee"

if ($skipSeedImport) {
    Write-Log "Import SQL ignore: bases existantes conservees."
} else {
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
}
