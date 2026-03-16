param(
    [string]$InstallDir = "${env:ProgramFiles}\Vigitemp\Agent",
    [string]$SiteWebUrl,
    [switch]$NoPause
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Admin {
    if (Test-IsAdmin) {
        return
    }

    $argList = @(
        "-ExecutionPolicy", "Bypass",
        "-File", ('"{0}"' -f $PSCommandPath),
        "-InstallDir", ('"{0}"' -f $InstallDir)
    )

    if (-not [string]::IsNullOrWhiteSpace($SiteWebUrl)) {
        $argList += @("-SiteWebUrl", ('"{0}"' -f $SiteWebUrl))
    }

    if ($NoPause) {
        $argList += "-NoPause"
    }

    Start-Process powershell.exe -Verb RunAs -ArgumentList ($argList -join " ")
    exit 0
}

function Remove-UrlAclIfExists {
    param([string]$Url)
    & netsh http delete urlacl url=$Url *> $null
}

function Ensure-LoopbackUrlAcl {
    $existing = & netsh http show urlacl url="http://127.0.0.1:8000/" 2>$null
    if ($LASTEXITCODE -eq 0 -and ($existing | Out-String) -match "127\.0\.0\.1:8000") {
        return
    }

    Write-Log "Ajout URLACL loopback..."
    & netsh http add urlacl url="http://127.0.0.1:8000/" sddl="D:(A;;GX;;;WD)" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Impossible d'ajouter l'URLACL loopback."
    }
}

function Ensure-StartupRegistry {
    param([string]$ExePath)
    $runKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
    $runValue = '"' + $ExePath + '"'
    New-Item -Path $runKey -Force | Out-Null
    Set-ItemProperty -Path $runKey -Name "VigitempAgent" -Value $runValue
}

function Update-AgentConfig {
    param(
        [string]$ConfigPath,
        [string]$Url
    )

    if ([string]::IsNullOrWhiteSpace($Url) -or -not (Test-Path $ConfigPath)) {
        return
    }

    [xml]$config = Get-Content $ConfigPath
    $node = $config.SelectSingleNode("/configuration/appSettings/add[@key='VigitempSiteWebUrl']")
    if ($node -eq $null) {
        throw "Cle VigitempSiteWebUrl introuvable dans le fichier de config."
    }

    $node.SetAttribute("value", $Url)
    $config.Save($ConfigPath)
}

Ensure-Admin

$exePath = Join-Path $InstallDir "VigitempAgent.exe"
$configPath = Join-Path $InstallDir "VigitempAgent.exe.config"
$logDir = Join-Path $env:ProgramData "Vigitemp\logs"
$logPath = Join-Path $logDir "Finalize-AgentInstall.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Start-Transcript -Path $logPath -Append | Out-Null

try {
    Write-Log "Finalisation de l'installation de l'agent"

    if (-not (Test-Path $exePath)) {
        throw "Executable introuvable: $exePath"
    }

    Write-Log "Arret des anciennes instances..."
    Get-Process VigitempAgent -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1

    Write-Log "Suppression des anciennes reservations URLACL..."
    Remove-UrlAclIfExists "http://localhost:8000/"

    $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
            $_.IPAddress -and
            $_.IPAddress -ne "127.0.0.1" -and
            $_.IPAddress -notlike "169.254.*"
        } |
        Select-Object -ExpandProperty IPAddress -Unique

    foreach ($ip in $ips) {
        Remove-UrlAclIfExists ("http://{0}:8000/" -f $ip)
    }

    Ensure-LoopbackUrlAcl

    if (-not [string]::IsNullOrWhiteSpace($SiteWebUrl)) {
        Write-Log "Mise a jour de l'URL du site web..."
        Update-AgentConfig -ConfigPath $configPath -Url $SiteWebUrl
    }

    Write-Log "Configuration du demarrage automatique..."
    Ensure-StartupRegistry -ExePath $exePath

    Write-Log "Lancement de l'agent..."
    Start-Process -FilePath $exePath | Out-Null
    Start-Sleep -Seconds 2

    $running = Get-Process VigitempAgent -ErrorAction SilentlyContinue
    $listening = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue

    $summary = @(
        "Finalisation terminee.",
        "",
        ("Agent installe : {0}" -f ($(if (Test-Path $exePath) { "OK" } else { "ECHEC" }))),
        ("URLACL loopback : {0}" -f ($(if ((& netsh http show urlacl url=http://127.0.0.1:8000/ 2>$null | Out-String) -match "127\.0\.0\.1:8000") { "OK" } else { "ECHEC" }))),
        ("Agent lance : {0}" -f ($(if ($running) { "OK" } else { "ECHEC" }))),
        ("Port 8000 en ecoute : {0}" -f ($(if ($listening) { "OK" } else { "ECHEC" }))),
        "",
        ("Log : {0}" -f $logPath)
    ) -join [Environment]::NewLine

    Write-Host ""
    Write-Host $summary
}
finally {
    Stop-Transcript | Out-Null
}

if (-not $NoPause) {
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
}
