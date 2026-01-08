Param(
    [string]$SourcePath,
    [string]$InstallDir,
    [string]$ServiceName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$utf8 = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $utf8
[Console]::InputEncoding = $utf8
try { chcp 65001 | Out-Null } catch { }

$scriptRoot = $PSScriptRoot
$defaultSource = Resolve-Path (Join-Path $scriptRoot "..")

$lang = "fr"
$lang = Read-Host "Langue / Language (fr/en) [fr]"
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
    if ([string]::IsNullOrWhiteSpace($defaultValue)) {
        return Read-Host $label
    }
    $value = Read-Host "$label [$defaultValue]"
    if ([string]::IsNullOrWhiteSpace($value)) { return $defaultValue }
    return $value
}

function Normalize-PathInput($value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return $value }
    return $value.Trim().Trim('"')
}

function ConvertFrom-Base64Url([string]$rawInput) {
    $base64 = $rawInput.Replace('-', '+').Replace('_', '/')
    switch ($base64.Length % 4) {
        2 { $base64 += '==' }
        3 { $base64 += '=' }
    }
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64))
}

function Read-LicensePayload([string]$tokenPath) {
    $token = (Get-Content -Raw -Path $tokenPath).Trim()
    if ([string]::IsNullOrWhiteSpace($token)) { return $null }
    $parts = $token.Split('.')
    if ($parts.Length -ne 3) { return $null }
    $payloadJson = ConvertFrom-Base64Url $parts[1]
    return $payloadJson | ConvertFrom-Json
}

function Set-AppSetting($configPath, $key, $value) {
    $xml = New-Object System.Xml.XmlDocument
    $xml.PreserveWhitespace = $true
    $xml.Load($configPath)

    $appSettings = $xml.configuration.appSettings
    if ($null -eq $appSettings) {
        $appSettings = $xml.CreateElement("appSettings")
        $xml.configuration.AppendChild($appSettings) | Out-Null
    }

    $node = $appSettings.SelectSingleNode("add[@key='$key']")
    if ($null -eq $node) {
        $node = $xml.CreateElement("add")
        $node.SetAttribute("key", $key)
        $appSettings.AppendChild($node) | Out-Null
    }
    $node.SetAttribute("value", $value)
    $xml.Save($configPath)
}

function Write-InstallRegistryInfo($installPath, $version) {
    try {
        $baseKey = "HKLM:\\SOFTWARE\\Vigitemp"
        $serverKey = Join-Path $baseKey "Server"
        New-Item -Path $baseKey -Force | Out-Null
        New-Item -Path $serverKey -Force | Out-Null
        New-ItemProperty -Path $serverKey -Name "InstallPath" -Value $installPath -PropertyType String -Force | Out-Null
        New-ItemProperty -Path $serverKey -Name "Version" -Value $version -PropertyType String -Force | Out-Null
        New-ItemProperty -Path $serverKey -Name "LastInstalledUtc" -Value ([DateTime]::UtcNow.ToString("o")) -PropertyType String -Force | Out-Null
    } catch {
        Write-Log (T "Impossible d'ecrire dans le registre." "Failed to write registry keys.")
    }
}

if (-not (Test-Admin)) {
    Write-Error (T "Ce script doit ?tre lanc? en tant qu'administrateur." "This installer must be run as Administrator.")
}

$programData = [Environment]::GetFolderPath("CommonApplicationData")
$defaultInstallDir = Join-Path $programData "Vigitemp\\server"
$defaultServiceName = "VigitempServeur"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Read-InstallValue (T "Chemin du build serveur (dossier contenant Vigitemp Serveur.exe)" "Path to server build output (folder with Vigitemp Serveur.exe)") $defaultSource.Path
}
 $SourcePath = Normalize-PathInput $SourcePath
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = Read-InstallValue (T "Dossier d'installation" "Install folder") $defaultInstallDir
}
 $InstallDir = Normalize-PathInput $InstallDir
if ([string]::IsNullOrWhiteSpace($ServiceName)) {
    $ServiceName = Read-InstallValue (T "Nom du service Windows" "Windows service name") $defaultServiceName
}

if (-not (Test-Path $SourcePath)) {
    Write-Error (T "SourcePath introuvable : $SourcePath" "SourcePath not found: $SourcePath")
}

$exeName = "Vigitemp Serveur.exe"
$exePath = Join-Path $SourcePath $exeName
if (-not (Test-Path $exePath)) {
    Write-Error (T "Ex?cutable introuvable : $exePath" "Executable not found: $exePath")
}

$logDir = Join-Path $programData "Vigitemp\\install-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir "install-server-$(Get-Date -Format yyyyMMdd-HHmmss).log"
Start-Transcript -Path $logPath | Out-Null

Write-Log (T "Installation du serveur Vigitemp vers $InstallDir" "Installing Vigitemp server to $InstallDir")
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item -Path (Join-Path $SourcePath '*') -Destination $InstallDir -Recurse -Force

$configPath = Join-Path $InstallDir "$exeName.config"
if (-not (Test-Path $configPath)) {
    Write-Error (T "Fichier config introuvable : $configPath" "Config file not found: $configPath")
}

$websiteBaseUrl = Read-InstallValue (T "URL du site web (ex: http://127.0.0.1:3000)" "Website base URL (example: http://127.0.0.1:3000)") "http://127.0.0.1:3000"
$dbHost = Read-InstallValue (T "H?te BDD" "DB host") "127.0.0.1"
$dbPort = Read-InstallValue (T "Port BDD" "DB port") "3306"
$dbUser = Read-InstallValue (T "Utilisateur BDD" "DB user") "root"
$dbPassword = Read-InstallValue (T "Mot de passe BDD" "DB password") ""
$dbMain = Read-InstallValue (T "Nom BDD principale" "Main DB name") "vigitemp"
$dbMeasure = Read-InstallValue (T "Nom BDD mesures" "Measure DB name") "vigitemp_mesure"
$dbMeasureCache = Read-InstallValue (T "Nom BDD cache mesures (optionnel)" "Measure cache DB name (optional)") "vigitemp_mesures_ifb"
$alarmSecret = Read-InstallValue (T "Secret dispatch alarmes (optionnel)" "Alarm dispatch secret (optional)") ""

$licenseSourcePath = Read-InstallValue (T "Chemin du fichier licence (.vtlic)" "License file path (.vtlic)")
$licenseSourcePath = Normalize-PathInput $licenseSourcePath
if (-not (Test-Path $licenseSourcePath)) {
    Write-Error (T "Fichier licence introuvable : $licenseSourcePath" "License file not found: $licenseSourcePath")
}

$publicKeySourcePath = Read-InstallValue (T "Chemin de la clé publique licence (.pem)" "License public key path (.pem)")
$publicKeySourcePath = Normalize-PathInput $publicKeySourcePath
if (-not (Test-Path $publicKeySourcePath)) {
    Write-Error (T "Clé publique introuvable : $publicKeySourcePath" "Public key file not found: $publicKeySourcePath")
}

$licensePayload = Read-LicensePayload $licenseSourcePath
if ($null -ne $licensePayload) {
    Write-Log (T "Licence charg?e :" "License loaded:")
    Write-Log ("  licenseId: {0}" -f $licensePayload.licenseId)
    Write-Log ("  customerId: {0}" -f $licensePayload.customerId)
    Write-Log ("  edition: {0}" -f $licensePayload.edition)
    Write-Log ("  concurrentAccess: {0}" -f $licensePayload.concurrentAccess)
    Write-Log ("  options: {0}" -f ([string]::Join(',', $licensePayload.options)))
    if ($licensePayload.expiresAt) {
        Write-Log ("  expiresAt: {0}" -f $licensePayload.expiresAt)
    }
    if ($licensePayload.PSObject.Properties.Match("bind").Count -gt 0 -and $licensePayload.bind -and $licensePayload.bind.instancePublicKey) {
        Write-Log ("  bind.instancePublicKey: {0}" -f $licensePayload.bind.instancePublicKey)
    }
}

$instancePublicKey = Read-InstallValue (T "Clé publique instance (optionnel)" "Instance public key (optional)") ""
if ($licensePayload -and $licensePayload.PSObject.Properties.Match("bind").Count -gt 0 -and $licensePayload.bind -and $licensePayload.bind.instancePublicKey) {
    if ([string]::IsNullOrWhiteSpace($instancePublicKey)) {
        Write-Warning (T "La licence exige un binding d'instance. Renseignez la clé pour éviter un refus." "License requires instance binding. Provide instance public key to avoid mismatch.")
    }
}

$licenseDir = Join-Path $programData "Vigitemp\\licenses"
$publicKeyDir = Join-Path $programData "Vigitemp\\license_keys"
New-Item -ItemType Directory -Force -Path $licenseDir | Out-Null
New-Item -ItemType Directory -Force -Path $publicKeyDir | Out-Null

$licenseDestPath = Join-Path $licenseDir (Split-Path $licenseSourcePath -Leaf)
$publicKeyDestPath = Join-Path $publicKeyDir "license_public.pem"

Copy-Item -Path $licenseSourcePath -Destination $licenseDestPath -Force
Copy-Item -Path $publicKeySourcePath -Destination $publicKeyDestPath -Force

Set-AppSetting $configPath "Vigitemp.WebsiteBaseUrl" $websiteBaseUrl
Set-AppSetting $configPath "Vigitemp.AlarmDispatchSecret" $alarmSecret
Set-AppSetting $configPath "Vigitemp.Db.Host" $dbHost
Set-AppSetting $configPath "Vigitemp.Db.Port" $dbPort
Set-AppSetting $configPath "Vigitemp.Db.User" $dbUser
Set-AppSetting $configPath "Vigitemp.Db.Password" $dbPassword
Set-AppSetting $configPath "Vigitemp.Db.MainDatabase" $dbMain
Set-AppSetting $configPath "Vigitemp.Db.MeasureDatabase" $dbMeasure
Set-AppSetting $configPath "Vigitemp.Db.MeasureCacheDatabase" $dbMeasureCache
Set-AppSetting $configPath "Vigitemp.License.Path" $licenseDestPath
Set-AppSetting $configPath "Vigitemp.License.PublicKeyPath" $publicKeyDestPath
Set-AppSetting $configPath "Vigitemp.License.InstancePublicKey" $instancePublicKey

$serviceExePath = Join-Path $InstallDir $exeName
$version = ""
try {
    $version = (Get-Item $serviceExePath).VersionInfo.ProductVersion
} catch {
    $version = ""
}

$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($null -ne $existingService) {
    $answer = Read-InstallValue (T "Le service $ServiceName existe. Arrêter et réinstaller ? (y/n)" "Service $ServiceName exists. Stop and reinstall? (y/n)") "y"
    if ($answer -ne "y") {
        Write-Error (T "Installation annulée par l'utilisateur." "Installation cancelled by user.")
    }
    try { Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue } catch { }
    & sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

$binPath = '"' + $serviceExePath + '"'
& sc.exe create $ServiceName binPath= $binPath start= auto | Out-Null
& sc.exe description $ServiceName "Vigitemp C# server service" | Out-Null
& sc.exe failure $ServiceName reset= 86400 actions= restart/60000/restart/60000/restart/60000 | Out-Null
& sc.exe failureflag $ServiceName 1 | Out-Null

try {
    Start-Service -Name $ServiceName
} catch {
    Write-Log (T "Impossible de démarrer le service : $ServiceName" "Failed to start service: $ServiceName")
    try {
        $events = Get-WinEvent -LogName System -MaxEvents 5 |
            Where-Object { $_.ProviderName -eq "Service Control Manager" } |
            Select-Object -First 2
        foreach ($evt in $events) {
            Write-Log ($evt.Message)
        }
    } catch { }
    $logPath = Join-Path $programData "Vigitemp\\logs\\vigitemp-serveur.log"
    if (Test-Path $logPath) {
        Write-Log (T "Log serveur: $logPath" "Server log: $logPath")
    }
    throw
}


Write-InstallRegistryInfo -installPath $InstallDir -version $version

Write-Log (T "Registre: HKLM\\SOFTWARE\\Vigitemp\\Server" "Registry: HKLM\\SOFTWARE\\Vigitemp\\Server")
Write-Log (T "  InstallPath: $InstallDir" "  InstallPath: $InstallDir")
if (-not [string]::IsNullOrWhiteSpace($version)) {
    Write-Log (T "  Version: $version" "  Version: $version")
}
Write-Log (T "  LastInstalledUtc: $([DateTime]::UtcNow.ToString(\"o\"))" "  LastInstalledUtc: $([DateTime]::UtcNow.ToString(\"o\"))")
Write-Log (T "Installation terminée. Service : $ServiceName" "Install complete. Service: $ServiceName")
if (-not [string]::IsNullOrWhiteSpace($version)) {
    Write-Log (T "Version : $version" "Version: $version")
}
Write-Log (T "Config : $configPath" "Config: $configPath")
Write-Log (T "Licence : $licenseDestPath" "License: $licenseDestPath")
Write-Log (T "Clé publique : $publicKeyDestPath" "Public key: $publicKeyDestPath")
Write-Log (T "Log : $logPath" "Log: $logPath")

Stop-Transcript | Out-Null
