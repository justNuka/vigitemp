Param(
    [string]$SourcePath,
    [string]$InstallDir,
    [string]$ServiceName,
    [int]$Port,
    [string]$NodePath,
    [string]$PnpmPath,
    [string]$EnvFileName,
    [switch]$Silent,
    [switch]$Offline,
    [switch]$Standalone
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$utf8 = New-Object System.Text.UTF8Encoding $false
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

function Test-Admin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Read-InstallValue($label, $defaultValue = $null) {
    if ($Silent) {
        if ([string]::IsNullOrWhiteSpace($defaultValue)) {
            throw (T "Param?tre requis manquant en mode silencieux : $label" "Missing required parameter in silent mode: $label")
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

if (-not (Test-Admin)) {
    Write-Error (T "Ce script doit ?tre lanc? en tant qu'administrateur." "This installer must be run as Administrator.")
}

$programData = [Environment]::GetFolderPath("CommonApplicationData")
$defaultInstallDir = Join-Path $programData "Vigitemp\\website"
$defaultServiceName = "VigitempWeb"
$defaultPort = 3000

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Read-InstallValue (T "Chemin du site (dossier contenant package.json)" "Path to website source (folder with package.json)") $defaultSource.Path
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
if ([string]::IsNullOrWhiteSpace($EnvFileName)) {
    $EnvFileName = Read-InstallValue (T "Nom du fichier env (.env.local ou .env.production)" "Env filename (.env.local or .env.production)") ".env.production"
}

$standaloneHint = Test-Path (Join-Path $SourcePath ".next\\standalone")
if ($standaloneHint) {
    $Standalone = $true
    $Offline = $true
}
if (-not $Offline -and $Standalone) {
    $Offline = $true
}

if (-not (Test-Path $SourcePath)) {
    Write-Error (T "SourcePath introuvable : $SourcePath" "SourcePath not found: $SourcePath")
}
if (-not (Test-Path (Join-Path $SourcePath "package.json"))) {
    Write-Error (T "package.json introuvable dans SourcePath : $SourcePath" "package.json not found in SourcePath: $SourcePath")
}

$logDir = Join-Path $programData "Vigitemp\\install-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir "install-web-$(Get-Date -Format yyyyMMdd-HHmmss).log"
Start-Transcript -Path $logPath | Out-Null

Write-Log (T "Installation du site Vigitemp vers $InstallDir" "Installing Vigitemp website to $InstallDir")
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Log (T "Copie des fichiers du site..." "Copying website files...")
if ($Offline -and $Standalone) {
    & robocopy (Join-Path $SourcePath ".next") (Join-Path $InstallDir ".next") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    if (Test-Path (Join-Path $SourcePath "public")) {
        & robocopy (Join-Path $SourcePath "public") (Join-Path $InstallDir "public") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    }
    Copy-Item -Path (Join-Path $SourcePath "package.json") -Destination (Join-Path $InstallDir "package.json") -Force
    Copy-Item -Path (Join-Path $SourcePath "next.config.js") -Destination (Join-Path $InstallDir "next.config.js") -Force
    if (Test-Path (Join-Path $SourcePath "installer")) {
        & robocopy (Join-Path $SourcePath "installer") (Join-Path $InstallDir "installer") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    }
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
$dbProvider = Read-InstallValue (T "Type de BDD (mysql/mssql)" "DB provider (mysql/mssql)") "mysql"
$dbProvider = $dbProvider.ToLowerInvariant()
if ($dbProvider -ne "mssql") { $dbProvider = "mysql" }
$dbDefaultPort = if ($dbProvider -eq "mssql") { "1433" } else { "3306" }
$dbPort = Read-InstallValue (T "Port BDD" "DB port") $dbDefaultPort
$dbDefaultUser = if ($dbProvider -eq "mssql") { "sa" } else { "root" }
$dbHost = Read-InstallValue (T "Hote BDD" "DB host") "127.0.0.1"
$dbUser = Read-InstallValue (T "Utilisateur BDD" "DB user") $dbDefaultUser
$dbPassword = Read-InstallValue (T "Mot de passe BDD" "DB password") ""
$dbMain = Read-InstallValue (T "Nom BDD principale" "Main DB name") "vigitemp"
$dbMeasure = Read-InstallValue (T "Nom BDD mesures" "Measure DB name") "vigitemp_mesure"
$cacheTtl = Read-InstallValue (T "Cache TTL (secondes)" "Cache TTL (seconds)") "30"
$dispatchSecret = Read-InstallValue (T "Secret dispatch surveillance (optionnel)" "Surveillance dispatch secret (optional)") ""
$logsDir = Read-InstallValue (T "Dossier des logs" "Logs directory") (Join-Path $programData "Vigitemp\\web-logs")

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

if ($dbProvider -eq "mssql") {
    $databaseUrl = "sqlserver://${dbUser}:${dbPassword}@${dbHost}:${dbPort};database=${dbMain};encrypt=false;trustServerCertificate=true"
    $databaseMesureUrl = "sqlserver://${dbUser}:${dbPassword}@${dbHost}:${dbPort};database=${dbMeasure};encrypt=false;trustServerCertificate=true"
} else {
    $databaseUrl = "mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbMain}"
    $databaseMesureUrl = "mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbMeasure}"
}

$envPath = Join-Path $InstallDir $EnvFileName
$envContent = @"
DATABASE_URL="$databaseUrl"
DATABASE_MESURES_URL="$databaseMesureUrl"
DATABASE_PROVIDER="$dbProvider"
NEXT_PUBLIC_API_BASE_URL="$websiteBaseUrl"
NEXT_PUBLIC_CACHE_TTL=$cacheTtl
VIGITEMP_SURVEILLANCE_DISPATCH_SECRET="$dispatchSecret"
VIGITEMP_LOGS_DIR="$logsDir"
NODE_ENV=production
"@

$envContent | Set-Content -Path $envPath -Encoding UTF8

if ($dbProvider -eq "mssql") {
    Write-Log (T "Attention: Prisma doit etre configure pour SQL Server (schema/provider)." "Warning: Prisma must be configured for SQL Server (schema/provider).")
}

Push-Location $InstallDir
if (-not $Offline) {
    Write-Log (T "Installation des d?pendances..." "Installing dependencies...")
    & $pnpmCmd.Source install | Out-Null

    Write-Log (T "G?n?ration des clients Prisma..." "Generating Prisma clients...")
    & $pnpmCmd.Source prisma:generate | Out-Null

    Write-Log (T "Build de l'app Next.js..." "Building Next.js app...")
    & $pnpmCmd.Source build | Out-Null
} else {
    Write-Log (T "Mode offline : aucune installation ni build, utilisation des fichiers copi?s." "Offline mode: skipping install/build, using copied files.")
}
Pop-Location

if ($Standalone) {
    $standaloneEntry = Join-Path $InstallDir ".next\\standalone\\server.js"
    if (-not (Test-Path $standaloneEntry)) {
        Write-Error (T "Entr?e standalone introuvable : $standaloneEntry" "Standalone entry not found: $standaloneEntry")
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
            Write-Log (T "Attention : dossier .next\\standalone absent. Le site ne d?marrera pas." "Warning: .next\\standalone missing. The site will not start.")
        }
    } else {
        if (-not (Test-Path (Join-Path $InstallDir ".next"))) {
            Write-Log (T "Attention : dossier .next absent. Le site ne d?marrera pas sans build." "Warning: .next folder missing. The site will not start without a build.")
        }
    }
}

$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($null -ne $existingService) {
    $answer = Read-InstallValue (T "Le service $ServiceName existe. Arr?ter et r?installer ? (y/n)" "Service $ServiceName exists. Stop and reinstall? (y/n)") "y"
    if ($answer -ne "y") {
        Write-Error (T "Installation annul?e par l'utilisateur." "Installation cancelled by user.")
    }
    try { Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue } catch { }
    & sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
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

Write-Log (T "Cr�ation du service Windows (WinSW)..." "Creating Windows service (WinSW)...")
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

Stop-Transcript | Out-Null
