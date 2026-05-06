Param(
    [string]$SourcePath,
    [string]$InstallDir,
    [string]$ServiceName,
    [int]$Port,
    [string]$NodePath,
    [string]$PnpmPath,
    [string]$EnvFileName,
    [string]$AlarmDispatchSecret,
    [string]$AlarmDispatchSecretFile,
    [switch]$Silent,
    [switch]$Offline,
    [switch]$Standalone
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"


# Force UTF-8 console encoding for correct accents/special characters in logs.
try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }$utf8 = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $utf8
[Console]::InputEncoding = $utf8

$scriptRoot = $PSScriptRoot
$defaultSource = Resolve-Path (Join-Path $scriptRoot "..")

$lang = "fr"
if (-not $Silent) {
    $lang = Read-Host "Langue / Language (fr/en) [fr]"
    if ([string]::IsNullOrWhiteSpace($lang)) { $lang = "fr" }
}
if ([string]::IsNullOrWhiteSpace($lang)) { $lang = "fr" }
$lang = $lang.ToLowerInvariant()
if ($lang -ne "en") { $lang = "fr" }

function T($fr, $en) {
    if ($lang -eq "en") { return $en }
    return $fr
}

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

function Invoke-RobocopySafe {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    & robocopy $Source $Destination /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw (T "robocopy a échoué (code $LASTEXITCODE) source='$Source' destination='$Destination'" "robocopy failed (exit code $LASTEXITCODE) source='$Source' destination='$Destination'")
    }
}

function Test-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Read-InstallValue($label, $defaultValue = $null) {
    if ($Silent) {
        if ([string]::IsNullOrWhiteSpace($defaultValue)) {
            throw (T "Paramètre requis manquant en mode silencieux : $label" "Missing required parameter in silent mode: $label")
        }
        return $defaultValue
    }
    if ([string]::IsNullOrWhiteSpace($defaultValue)) {
        return Read-Host $label
    }
    $value = Read-Host "$label [$defaultValue]"
    if ([string]::IsNullOrWhiteSpace($value)) { return $defaultValue }
    return $value
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

function Read-InstallSecret($label, $defaultValue = $null) {
    if ($Silent) {
        if ([string]::IsNullOrWhiteSpace($defaultValue)) {
            throw (T "Paramètre requis manquant en mode silencieux : $label" "Missing required parameter in silent mode: $label")
        }
        return $defaultValue
    }
    $prompt = $label
    if (-not [string]::IsNullOrWhiteSpace($defaultValue)) {
        $prompt = "$label [$defaultValue]"
    }
    $secure = Read-Host $prompt -AsSecureString
    $value = Convert-SecureStringToPlainText $secure
    if ([string]::IsNullOrWhiteSpace($value) -and -not [string]::IsNullOrWhiteSpace($defaultValue)) {
        return $defaultValue
    }
    return $value
}

function New-RandomSecret([int]$byteLength = 32) {
    $bytes = New-Object byte[] $byteLength
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $base64 = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    return $base64
}

function Resolve-GeneratedSecretValue([string]$label, [string]$defaultValue = "") {
    $secret = $defaultValue
    if (-not $Silent) {
        $secret = Read-InstallSecret "$label ($(T "laisser vide pour g?n?ration auto" "leave blank for auto generation"))" $defaultValue
    }
    if ([string]::IsNullOrWhiteSpace($secret)) {
        $secret = New-RandomSecret
        Write-Log (T "Secret g?n?r? automatiquement pour: $label" "Secret generated automatically for: $label")
    }
    return $secret.Trim()
}

function Resolve-SecretFilePath($customPath, $defaultPath) {
    $path = $customPath
    if ([string]::IsNullOrWhiteSpace($path)) {
        $path = $defaultPath
    }
    return $path
}

function Resolve-DispatchSecret([string]$providedSecret, [string]$providedFilePath, [bool]$interactiveMode, [string]$defaultSharedSecretPath) {
    $secret = $null
    $secretFile = Resolve-SecretFilePath $providedFilePath $defaultSharedSecretPath

    if (-not [string]::IsNullOrWhiteSpace($providedSecret)) {
        $secret = $providedSecret.Trim()
    }

    if ([string]::IsNullOrWhiteSpace($secret) -and -not [string]::IsNullOrWhiteSpace($secretFile) -and (Test-Path $secretFile)) {
        $secret = (Get-Content -Path $secretFile -Raw -ErrorAction SilentlyContinue).Trim()
        if (-not [string]::IsNullOrWhiteSpace($secret)) {
            Write-Log (T "Secret dispatch lu depuis: $secretFile" "Dispatch secret loaded from: $secretFile")
        }
    }

    if ([string]::IsNullOrWhiteSpace($secret) -and $interactiveMode) {
        $typedSecret = Read-InstallSecret (T "Secret dispatch alarmes (laisser vide pour g?n?ration auto)" "Alarm dispatch secret (leave empty for auto generation)") ""
        if (-not [string]::IsNullOrWhiteSpace($typedSecret)) {
            $secret = $typedSecret.Trim()
        }
    }

    if ([string]::IsNullOrWhiteSpace($secret)) {
        $secret = New-RandomSecret
        Write-Log (T "Secret dispatch g?n?r? automatiquement." "Dispatch secret generated automatically.")
    }

    if (-not [string]::IsNullOrWhiteSpace($secretFile)) {
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $secretFile) | Out-Null
        Set-Content -Path $secretFile -Value $secret -Encoding UTF8
        Write-Log (T "Secret dispatch sauvegard?: $secretFile" "Dispatch secret saved: $secretFile")
        Write-Log (T "Copiez ce fichier sur l'autre machine pour r?utiliser le m?me secret." "Copy this file to the other machine to reuse the same secret.")
    }

    return $secret
}

function Write-InstallRegistryInfo($installPath, $version) {
    try {
        $baseKey = "HKLM:\\SOFTWARE\\Vigitemp"
        $webKey = Join-Path $baseKey "Web"
        New-Item -Path $baseKey -Force | Out-Null
        New-Item -Path $webKey -Force | Out-Null
        New-ItemProperty -Path $webKey -Name "InstallPath" -Value $installPath -PropertyType String -Force | Out-Null
        New-ItemProperty -Path $webKey -Name "Version" -Value $version -PropertyType String -Force | Out-Null
        New-ItemProperty -Path $webKey -Name "LastInstalledUtc" -Value ([DateTime]::UtcNow.ToString('o')) -PropertyType String -Force | Out-Null
    } catch {
        Write-Log (T "Impossible d'ecrire dans le registre." "Failed to write registry keys.")
    }
}

function Ensure-ServiceStoppedAndRemoved([string]$serviceName) {
    $existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($null -eq $existingService) {
        return
    }

    $answer = Read-InstallValue (T "Le service $serviceName existe. Arrêter et réinstaller ? (y/n)" "Service $serviceName exists. Stop and reinstall? (y/n)") "y"
    if ($answer -ne "y") {
        throw (T "Installation annulée par l'utilisateur." "Installation cancelled by user.")
    }

    try { Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue } catch { }
    & sc.exe delete $serviceName | Out-Null
    Start-Sleep -Seconds 2
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

function Get-NodeMsiVersionFromName([string]$path) {
    if ([string]::IsNullOrWhiteSpace($path)) { return $null }
    $name = [System.IO.Path]::GetFileName($path)
    $match = [regex]::Match($name, '^node-v(?<v>\d+\.\d+\.\d+)-x64\.msi$', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) { return $match.Groups["v"].Value }
    return $null
}

function Find-RequiredNodeVersionFromMsi([string]$baseDirectory) {
    if ([string]::IsNullOrWhiteSpace($baseDirectory) -or -not (Test-Path $baseDirectory)) {
        return $null
    }

    $searchDirs = @(
        (Join-Path $baseDirectory "prereqs"),
        $baseDirectory
    ) | Where-Object { Test-Path $_ }

    $candidates = @()
    foreach ($dir in $searchDirs) {
        $candidates += Get-ChildItem -Path $dir -File -Filter "node-v*-x64.msi" -ErrorAction SilentlyContinue
    }
    $uniqueCandidates = $candidates | Sort-Object -Property FullName -Unique
    if ($uniqueCandidates.Count -eq 0) { return $null }

    $best = $null
    foreach ($candidate in $uniqueCandidates) {
        $versionText = Get-NodeMsiVersionFromName $candidate.FullName
        if ([string]::IsNullOrWhiteSpace($versionText)) { continue }
        try {
            $versionObj = [version]$versionText
        } catch {
            continue
        }
        if ($null -eq $best -or $versionObj -gt $best.Version) {
            $best = [pscustomobject]@{
                Version = $versionObj
                VersionText = $versionText
                FileName = $candidate.Name
            }
        }
    }

    if ($null -eq $best) { return $null }
    return $best
}

if (-not (Test-Admin)) {
    Write-Error (T "Ce script doit ?tre lanc? en tant qu'administrateur." "This installer must be run as Administrator.")
}

$programData = [Environment]::GetFolderPath("CommonApplicationData")
$defaultInstallDir = Join-Path $programData "Vigitemp\\website"
$defaultServiceName = "VigitempWeb"
$defaultPort = 3000

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Read-InstallValue (T "Chemin du site (code source ou build standalone)" "Path to website (source code or standalone build)") $defaultSource.Path
}
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = Read-InstallValue (T "Dossier d'installation" "Install folder") $defaultInstallDir
}
if ([string]::IsNullOrWhiteSpace($ServiceName)) {
    $ServiceName = Read-InstallValue (T "Nom du service Windows" "Windows service name") $defaultServiceName
}
if (-not $Port) {
    $Port = [int](Read-InstallValue (T "Port HTTP" "HTTP port") $defaultPort)
}
$standaloneHint = Test-Path (Join-Path $SourcePath ".next\\standalone")
if ($standaloneHint) {
    $Standalone = $true
    $Offline = $true
}
if (-not $Offline -and $Standalone) {
    $Offline = $true
}
if (-not $Standalone) {
    if ([string]::IsNullOrWhiteSpace($EnvFileName)) {
        $EnvFileName = Read-InstallValue (T "Nom du fichier env (.env.local ou .env.production)" "Env filename (.env.local or .env.production)") ".env.production"
    }
}

if (-not (Test-Path $SourcePath)) {
    Write-Error (T "SourcePath introuvable : $SourcePath" "SourcePath not found: $SourcePath")
}
if (-not $Standalone -and -not (Test-Path (Join-Path $SourcePath "package.json"))) {
    Write-Error (T "package.json introuvable dans SourcePath : $SourcePath" "package.json not found in SourcePath: $SourcePath")
}

$logDir = Join-Path $programData "Vigitemp\\install-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir "install-web-$(Get-Date -Format yyyyMMdd-HHmmss).log"
Start-Transcript -Path $logPath | Out-Null

Write-Log (T "Installation du site Vigitemp vers $InstallDir" "Installing Vigitemp website to $InstallDir")
Ensure-ServiceStoppedAndRemoved -serviceName $ServiceName
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Log (T "Copie des fichiers du site..." "Copying website files...")
if ($Offline -and $Standalone) {
    $standaloneSource = Join-Path $SourcePath ".next\\standalone"
    $staticSource = Join-Path $SourcePath ".next\\static"
    if (-not (Test-Path $standaloneSource) -or -not (Test-Path $staticSource)) {
        Write-Error (T "SourcePath invalide : dossier .next\\standalone ou .next\\static manquant. Indiquez le dossier racine du build standalone." "Invalid SourcePath: missing .next\\standalone or .next\\static. Point to the standalone build root folder.")
    }
    Invoke-RobocopySafe -Source (Join-Path $SourcePath ".next") -Destination (Join-Path $InstallDir ".next")
    if (Test-Path (Join-Path $SourcePath "public")) {
        Invoke-RobocopySafe -Source (Join-Path $SourcePath "public") -Destination (Join-Path $InstallDir "public")
    }
    $standaloneStatic = Join-Path $InstallDir ".next\\standalone\\.next\\static"
    if (-not (Test-Path $standaloneStatic)) {
        New-Item -ItemType Directory -Force -Path $standaloneStatic | Out-Null
    }
    Invoke-RobocopySafe -Source (Join-Path $InstallDir ".next\\static") -Destination $standaloneStatic
} else {
    if ($Offline) {
        $excludeDirs = @(".git", "logs")
    } else {
        $excludeDirs = @("node_modules", ".next", "logs", ".git")
    }
    $excludeArgs = $excludeDirs | ForEach-Object { "/XD `"$SourcePath\\$_`"" }
    $robocopyArgs = @(
        "`"$SourcePath`"",
        "`"$InstallDir`"",
        "/MIR",
        "/NFL",
        "/NDL",
        "/NJH",
        "/NJS",
        "/NC",
        "/NS"
    ) + $excludeArgs
    & robocopy @robocopyArgs | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw (T "robocopy a échoué (code $LASTEXITCODE) vers '$InstallDir'" "robocopy failed (exit code $LASTEXITCODE) to '$InstallDir'")
    }
}

$version = ""
try {
    $pkgPath = Join-Path $InstallDir "package.json"
    if (Test-Path $pkgPath) {
        $pkg = Get-Content -Raw -Path $pkgPath | ConvertFrom-Json
        $version = $pkg.version
    }
} catch {
    $version = ""
}

$nodeCmd = $null
if (-not [string]::IsNullOrWhiteSpace($NodePath)) {
    if (-not (Test-Path $NodePath)) {
        Write-Error (T "NodePath introuvable : $NodePath" "NodePath not found: $NodePath")
    }
    $nodeCmd = Get-Command $NodePath -ErrorAction SilentlyContinue
} else {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
}
if ($null -eq $nodeCmd) {
    Write-Error (T "Node.js introuvable dans le PATH. Installer Node.js LTS avant de lancer ce script." "Node.js not found in PATH. Install Node.js LTS before running this script.")
}

$requiredNodeInfo = Find-RequiredNodeVersionFromMsi $scriptRoot
$expectedNodeVersion = if ($null -ne $requiredNodeInfo) { $requiredNodeInfo.VersionText } else { $null }
$installedNodeVersion = $null
try {
    $rawVersion = & $nodeCmd.Source --version
    if ($rawVersion) {
        $installedNodeVersion = $rawVersion.Trim().TrimStart("v")
    }
} catch { }

if ($installedNodeVersion -and $expectedNodeVersion) {
    $nodeCompare = Compare-Version $installedNodeVersion $expectedNodeVersion
    if ($nodeCompare -ge 0) {
        Write-Log (T "Node.js detecte (version $installedNodeVersion). Requis via MSI: $expectedNodeVersion ($($requiredNodeInfo.FileName)). OK." "Node.js detected (version $installedNodeVersion). Required from MSI: $expectedNodeVersion ($($requiredNodeInfo.FileName)). OK.")
    } else {
        Write-Log (T "Node.js detecte (version $installedNodeVersion). Version requise via MSI: $expectedNodeVersion ($($requiredNodeInfo.FileName))." "Node.js detected (version $installedNodeVersion). Required from MSI: $expectedNodeVersion ($($requiredNodeInfo.FileName)).")
    }
} elseif ($installedNodeVersion) {
    Write-Log (T "Node.js detecte (version $installedNodeVersion). Aucun MSI Node versionne detecte pour imposer une version minimale." "Node.js detected (version $installedNodeVersion). No versioned Node MSI found to enforce minimum version.")
} else {
    Write-Log (T "Impossible de lire la version Node.js." "Unable to read Node.js version.")
}

$pnpmCmd = $null
if (-not $Offline) {
    if (-not [string]::IsNullOrWhiteSpace($PnpmPath)) {
        if (-not (Test-Path $PnpmPath)) {
            Write-Error (T "PnpmPath introuvable : $PnpmPath" "PnpmPath not found: $PnpmPath")
        }
        $pnpmCmd = Get-Command $PnpmPath -ErrorAction SilentlyContinue
    } else {
        $pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
    }
    if ($null -eq $pnpmCmd) {
        Write-Log (T "pnpm introuvable dans le PATH. Tentative d'activation de Corepack..." "pnpm not found in PATH. Attempting to enable Corepack...")
        try {
            & $nodeCmd.Source --version | Out-Null
            & corepack enable | Out-Null
            & corepack prepare pnpm@latest --activate | Out-Null
            $pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
        }
        catch {
            Write-Error (T "pnpm introuvable. Installez pnpm ou activez Corepack manuellement." "pnpm not found. Install pnpm or enable Corepack manually.")
        }
    }
}

$websiteBaseUrl = Read-InstallValue (T "URL publique du site (ex: http://127.0.0.1:$Port/)" "Website public URL (example: http://127.0.0.1:$Port/)") "http://127.0.0.1:$Port/"
$appBaseUrl = Read-InstallValue (T "URL applicative publique (liens emails/login)" "Public app URL (email/login links)") $websiteBaseUrl
$dbProvider = Read-InstallValue (T "Type de BDD (mysql/mssql)" "DB provider (mysql/mssql)") "mysql"
$dbProvider = $dbProvider.ToLowerInvariant()
if ($dbProvider -ne "mssql") { $dbProvider = "mysql" }
$dbDefaultPort = if ($dbProvider -eq "mssql") { "1433" } else { "3306" }
$dbPort = Read-InstallValue (T "Port BDD" "DB port") $dbDefaultPort
$dbDefaultUser = if ($dbProvider -eq "mssql") { "sa" } else { "root" }
$dbHost = Read-InstallValue (T "Hote BDD" "DB host") "127.0.0.1"
$dbUser = Read-InstallValue (T "Utilisateur BDD" "DB user") $dbDefaultUser
$dbPassword = Read-InstallSecret (T "Mot de passe BDD" "DB password") ""
$dbMain = Read-InstallValue (T "Nom BDD principale" "Main DB name") "vigi_main"
$dbMeasure = Read-InstallValue (T "Nom BDD mesures" "Measure DB name") "vigi_mesures"
$dbChat = Read-InstallValue (T "Nom BDD chat" "Chat DB name") "vigi_chat"
$cacheTtl = Read-InstallValue (T "Cache TTL (secondes)" "Cache TTL (seconds)") "30"
$logsDir = Read-InstallValue (T "Dossier des logs" "Logs directory") (Join-Path $programData "VigiSensys\web-logs")
$licensePath = Read-InstallValue (T "Chemin licence site (.vtlic)" "Website license path (.vtlic)") (Join-Path $programData "VigiSensys\licenses\license.vtlic")
$licensePublicKeyPath = Read-InstallValue (T "Chemin cle publique licence (.pem)" "License public key path (.pem)") (Join-Path $programData "VigiSensys\license_keys\public_key.pem")
$agentSecretPrivateKeyPath = Read-InstallValue (T "Chemin cle privee secret agent (.pem)" "Agent secret private key path (.pem)") (Join-Path $programData "VigiSensys\license_keys\agent_secret_private.pem")
$agentPort = Read-InstallValue (T "Port agent local" "Local agent port") "8000"
$agentTimeoutMs = Read-InstallValue (T "Timeout agent local (ms)" "Local agent timeout (ms)") "1500"
$agentActiveWindowMinutes = Read-InstallValue (T "Fenetre active agent (minutes)" "Agent active window (minutes)") "15"
$hotlineServerHost = Read-InstallValue (T "Hote serveur hotline" "Hotline server host") "127.0.0.1"
$hotlineServerPort = Read-InstallValue (T "Port serveur hotline" "Hotline server port") "5310"
$hotlineServerTimeoutMs = Read-InstallValue (T "Timeout hotline (ms)" "Hotline timeout (ms)") "10000"
$hotlineAccessTokenTtl = Read-InstallValue (T "TTL access hotline (minutes)" "Hotline access token TTL (minutes)") "15"
$hotlineRefreshTokenTtl = Read-InstallValue (T "TTL refresh hotline (minutes)" "Hotline refresh token TTL (minutes)") "120"
$cspConnectSrc = Read-InstallValue (T "CSP connect-src supplementaires (CSV, optionnel)" "Additional CSP connect-src values (CSV, optional)") "http://127.0.0.1:8000,http://localhost:8000"
$allowedDevOrigins = Read-InstallValue (T "Origins dev autorisees (CSV, optionnel)" "Allowed dev origins (CSV, optional)") ""
if ([string]::IsNullOrWhiteSpace($AlarmDispatchSecretFile)) {
    $AlarmDispatchSecretFile = Join-Path $programData "VigiSensys\shared-secrets\alarm-dispatch-secret.txt"
}
$dispatchSecret = Resolve-DispatchSecret -providedSecret $AlarmDispatchSecret -providedFilePath $AlarmDispatchSecretFile -interactiveMode (-not $Silent) -defaultSharedSecretPath $AlarmDispatchSecretFile
$jwtSecret = Resolve-GeneratedSecretValue -label (T "JWT principal" "Primary JWT")
$hotlineJwtSecret = Resolve-GeneratedSecretValue -label (T "JWT hotline" "Hotline JWT")
$agentSharedSecret = Resolve-GeneratedSecretValue -label (T "Secret partage agent" "Agent shared secret")

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

if ($dbProvider -eq "mssql") {
    $dbUserEscaped = "{$dbUser}"
    $dbPasswordEscaped = "{$dbPassword}"
    $dbMainEscaped = "{$dbMain}"
    $dbMeasureEscaped = "{$dbMeasure}"
    $dbChatEscaped = "{$dbChat}"
    $databaseUrl = "sqlserver://${dbHost}:${dbPort};database=${dbMainEscaped};user=${dbUserEscaped};password=${dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"
    $databaseMesureUrl = "sqlserver://${dbHost}:${dbPort};database=${dbMeasureEscaped};user=${dbUserEscaped};password=${dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"
    $databaseChatUrl = "sqlserver://${dbHost}:${dbPort};database=${dbChatEscaped};user=${dbUserEscaped};password=${dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"
} else {
    $dbUserEscaped = [System.Uri]::EscapeDataString($dbUser)
    $dbPasswordEscaped = [System.Uri]::EscapeDataString($dbPassword)
    $mysqlQuery = "allowPublicKeyRetrieval=true"
    $databaseUrl = "mysql://${dbUserEscaped}:${dbPasswordEscaped}@${dbHost}:${dbPort}/${dbMain}?${mysqlQuery}"
    $databaseMesureUrl = "mysql://${dbUserEscaped}:${dbPasswordEscaped}@${dbHost}:${dbPort}/${dbMeasure}?${mysqlQuery}"
    $databaseChatUrl = "mysql://${dbUserEscaped}:${dbPasswordEscaped}@${dbHost}:${dbPort}/${dbChat}?${mysqlQuery}"
}
$envPath = Join-Path $InstallDir $EnvFileName
$standaloneEnvPath = $null
if ($Standalone) {
    $standaloneEnvPath = Join-Path $InstallDir ".next\\standalone\\.env"
    $envPath = $standaloneEnvPath
}
$envContent = @"
DATABASE_URL="$databaseUrl"
DATABASE_MESURES_URL="$databaseMesureUrl"
DATABASE_CHAT_URL="$databaseChatUrl"
DATABASE_PROVIDER="$dbProvider"
NEXT_PUBLIC_API_BASE_URL="$websiteBaseUrl"
NEXT_PUBLIC_APP_URL="$appBaseUrl"
NEXT_PUBLIC_CACHE_TTL=$cacheTtl
VIGITEMP_LICENSE_PATH="$licensePath"
VIGITEMP_LICENSE_PUBLIC_KEY_PATH="$licensePublicKeyPath"
VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH="$agentSecretPrivateKeyPath"
VIGITEMP_AGENT_PORT=$agentPort
VIGITEMP_AGENT_TIMEOUT_MS=$agentTimeoutMs
VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES=$agentActiveWindowMinutes
VIGITEMP_AGENT_SECRET="$agentSharedSecret"
VIGITEMP_ALARM_DISPATCH_SECRET="$dispatchSecret"
VIGITEMP_SURVEILLANCE_DISPATCH_SECRET="$dispatchSecret"
VIGITEMP_LOGS_DIR="$logsDir"
VIGITEMP_ALLOWED_DEV_ORIGINS="$allowedDevOrigins"
VIGITEMP_CSP_CONNECT_SRC="$cspConnectSrc"
JWT_SECRET="$jwtSecret"
HOTLINE_SERVER_HOST="$hotlineServerHost"
HOTLINE_SERVER_PORT=$hotlineServerPort
HOTLINE_SERVER_TIMEOUT_MS=$hotlineServerTimeoutMs
HOTLINE_JWT_SECRET="$hotlineJwtSecret"
HOTLINE_ACCESS_TOKEN_TTL_MINUTES=$hotlineAccessTokenTtl
HOTLINE_REFRESH_TOKEN_TTL_MINUTES=$hotlineRefreshTokenTtl
NODE_ENV=production
"@

$envContent | Set-Content -Path $envPath -Encoding UTF8

if ($dbProvider -eq "mssql") {
    Write-Log (T "Attention: Prisma doit etre configure pour SQL Server (schema/provider)." "Warning: Prisma must be configured for SQL Server (schema/provider).")
}

Push-Location $InstallDir
if (-not $Offline) {
    Write-Log (T "Installation des dépendances..." "Installing dependencies...")
    & $pnpmCmd.Source install | Out-Null

    Write-Log (T "Génération des clients Prisma..." "Generating Prisma clients...")
    & $pnpmCmd.Source prisma:generate | Out-Null

    Write-Log (T "Build de l'app Next.js..." "Building Next.js app...")
    & $pnpmCmd.Source build | Out-Null
} else {
    Write-Log (T "Mode offline : aucune installation ni build, utilisation des fichiers copiés." "Offline mode: skipping install/build, using copied files.")
}
Pop-Location

if ($Standalone) {
    $standaloneEntry = Join-Path $InstallDir ".next\\standalone\\server.js"
    if (-not (Test-Path $standaloneEntry)) {
        Write-Error (T "Entrée standalone introuvable : $standaloneEntry" "Standalone entry not found: $standaloneEntry")
    }
} else {
    $nextBin = Join-Path $InstallDir "node_modules\\next\\dist\\bin\\next"
    if (-not (Test-Path $nextBin)) {
        Write-Error (T "Binaire Next.js introuvable : $nextBin" "Next.js binary not found: $nextBin")
    }
}

if ($Offline) {
    if ($Standalone) {
        if (-not (Test-Path (Join-Path $InstallDir ".next\\standalone"))) {
            Write-Log (T "Attention : dossier .next\\standalone absent. Le site ne démarrera pas." "Warning: .next\\standalone missing. The site will not start.")
        }
    } else {
        if (-not (Test-Path (Join-Path $InstallDir ".next"))) {
            Write-Log (T "Attention : dossier .next absent. Le site ne démarrera pas sans build." "Warning: .next folder missing. The site will not start without a build.")
        }
    }
}

$nodePathResolved = $nodeCmd.Source
$winswSource = Join-Path $scriptRoot "winsw.exe"
if (-not (Test-Path $winswSource)) {
    $winswSource = Join-Path $SourcePath "installer\\winsw.exe"
}
if (-not (Test-Path $winswSource)) {
    Write-Error (T "winsw.exe introuvable. Placez winsw.exe dans le dossier installer." "winsw.exe not found. Place winsw.exe in the installer folder.")
}

$winswExe = Join-Path $InstallDir ($ServiceName + ".exe")
$winswConfig = Join-Path $InstallDir ($ServiceName + ".xml")
Copy-Item -Path $winswSource -Destination $winswExe -Force

if ($Standalone) {
    $entry = ".next\\standalone\\server.js"
    $serviceArgs = $entry
} else {
    $entry = "node_modules\\next\\dist\\bin\\next"
    $serviceArgs = "$entry start -p $Port -H 0.0.0.0"
}

$xml = @"
<service>
  <id>$ServiceName</id>
  <name>$ServiceName</name>
  <description>Vigitemp Next.js website</description>
  <executable>$nodePathResolved</executable>
  <arguments>$serviceArgs</arguments>
  <workingdirectory>$InstallDir</workingdirectory>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
  <resetfailure>1 day</resetfailure>
  <onfailure action="restart" delay="60000" />
  <env name="NODE_ENV" value="production" />
  <env name="PORT" value="$Port" />
  <env name="HOSTNAME" value="0.0.0.0" />
</service>
"@

$xml | Set-Content -Path $winswConfig -Encoding UTF8

Write-Log (T "Création du service Windows (WinSW)..." "Creating Windows service (WinSW)...")
& $winswExe install | Out-Null
& $winswExe start | Out-Null


Write-InstallRegistryInfo -installPath $InstallDir -version $version

Write-Log (T "Registre: HKLM\\SOFTWARE\\Vigitemp\\Web" "Registry: HKLM\\SOFTWARE\\Vigitemp\\Web")
Write-Log (T "  InstallPath: $InstallDir" "  InstallPath: $InstallDir")
if (-not [string]::IsNullOrWhiteSpace($version)) {
    Write-Log (T "  Version: $version" "  Version: $version")
}
Write-Log (T "  LastInstalledUtc: $([DateTime]::UtcNow.ToString('o'))" "  LastInstalledUtc: $([DateTime]::UtcNow.ToString('o'))")
Write-Log (T "Installation termin?e. Service : $ServiceName" "Install complete. Service: $ServiceName")
if (-not [string]::IsNullOrWhiteSpace($version)) {
    Write-Log (T "Version : $version" "Version: $version")
}
Write-Log (T "Dossier d'installation : $InstallDir" "Install dir: $InstallDir")
Write-Log (T "Fichier env : $envPath" "Env file: $envPath")
Write-Log (T "Dossier logs : $logsDir" "Logs dir: $logsDir")
Write-Log (T "Log : $logPath" "Log: $logPath")

function Confirm-WebInstall {
    Write-Log (T "Verification post-installation..." "Post-install verification...")
    $checks = @()
    $checks += @{ Label = "InstallDir"; Path = $InstallDir }
    $checks += @{ Label = "EnvFile"; Path = $envPath }
    $checks += @{ Label = "WinSW"; Path = $winswExe }
    $checks += @{ Label = "WinSWConfig"; Path = $winswConfig }
    $checks += @{ Label = "NextStatic"; Path = (Join-Path $InstallDir ".next\\static") }
    if ($Standalone) {
        $checks += @{ Label = "StandaloneEntry"; Path = (Join-Path $InstallDir ".next\\standalone\\server.js") }
        $checks += @{ Label = "StandaloneStatic"; Path = (Join-Path $InstallDir ".next\\standalone\\.next\\static") }
    }
    foreach ($check in $checks) {
        if (Test-Path $check.Path) {
            Write-Log (T "OK: $($check.Label) -> $($check.Path)" "OK: $($check.Label) -> $($check.Path)")
        } else {
            Write-Warning (T "Manquant: $($check.Label) -> $($check.Path)" "Missing: $($check.Label) -> $($check.Path)")
        }
    }
    if ($nodeCmd) {
        try {
            $version = & $nodeCmd.Source --version
            Write-Log (T "Node detecte: $version" "Node detected: $version")
        } catch {
            Write-Warning (T "Node non verifiable dans ce terminal." "Node not verifiable in this terminal.")
        }
    }
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Log (T "Service ${ServiceName}: $($svc.Status)" "Service ${ServiceName}: $($svc.Status)")
    } else {
        Write-Warning (T "Service $ServiceName introuvable." "Service $ServiceName not found.")
    }
    if (Test-Path $logsDir) {
        $logFiles = @(Get-ChildItem -Path $InstallDir -Filter "$ServiceName*.log" -ErrorAction SilentlyContinue)
        if ($logFiles.Count -gt 0) {
            Write-Log (T "Logs WinSW: $($logFiles.Count) fichier(s) dans $InstallDir" "WinSW logs: $($logFiles.Count) file(s) in $InstallDir")
        }
    }
}

Confirm-WebInstall

Stop-Transcript | Out-Null



