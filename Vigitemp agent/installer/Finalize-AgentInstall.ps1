param(
    [string]$InstallDir,
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

function Resolve-InstallDir {
    param([string]$ProvidedInstallDir)

    if (-not [string]::IsNullOrWhiteSpace($ProvidedInstallDir)) {
        return $ProvidedInstallDir
    }

    $candidates = @()
    if ($env:ProgramFiles -and $env:ProgramFiles.Trim()) {
        $candidates += (Join-Path $env:ProgramData "VigiSensys\agent")
    }
    if (${env:ProgramFiles(x86)} -and ${env:ProgramFiles(x86)}.Trim()) {
        $candidates += (Join-Path ${env:ProgramData} "VigiSensys\agent")
    }

    foreach ($candidate in $candidates | Select-Object -Unique) {
        if (Test-Path (Join-Path $candidate "VigitempAgent.exe")) {
            return $candidate
        }
    }

    if (${env:ProgramFiles(x86)} -and ${env:ProgramFiles(x86)}.Trim()) {
        return (Join-Path ${env:ProgramData} "VigiSensys\agent")
    }

    return (Join-Path $env:ProgramData "VigiSensys\agent")
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

function Test-AgentPortListening {
    param(
        [int]$Port = 8000,
        [int]$TimeoutSeconds = 15
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $getNetTcpConnection = Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue
            if ($getNetTcpConnection) {
                $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
                if ($listener) {
                    return $true
                }
            } else {
                $netstat = netstat -ano -p tcp 2>$null | Select-String (":{0}\s+LISTENING" -f $Port)
                if ($netstat) {
                    return $true
                }
            }
        } catch {
            # ignore and retry until timeout
        }

        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Ensure-StartupRegistry {
    param([string]$ExePath)
    $runKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
    $runValue = '"' + $ExePath + '"'
    New-Item -Path $runKey -Force | Out-Null
    Set-ItemProperty -Path $runKey -Name "VigitempAgent" -Value $runValue
    Remove-ItemProperty -Path $runKey -Name "VigiSensysAgent" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path $runKey -Name "VigiTempAgent" -ErrorAction SilentlyContinue
}

function Ensure-AgentUninstallRegistry {
    param(
        [string]$InstallPath,
        [string]$ExePath
    )

    $uninstallKeyPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VigiSensysAgent"
    $uninstallScriptPath = Join-Path $InstallPath "Uninstall-VigiSensysAgent.ps1"

    $uninstallScript = @"
Param(
    [switch]`$Force
)

Set-StrictMode -Version Latest
`$ErrorActionPreference = 'Stop'

`$installDir = '$InstallPath'
`$runKey = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run'

try { Get-Process VigitempAgent -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue } catch { }

try {
    Remove-ItemProperty -Path `$runKey -Name 'VigitempAgent' -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path `$runKey -Name 'VigiSensysAgent' -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path `$runKey -Name 'VigiTempAgent' -ErrorAction SilentlyContinue
} catch { }

try { & netsh http delete urlacl url='http://127.0.0.1:8000/' | Out-Null } catch { }
try { & netsh http delete urlacl url='http://localhost:8000/' | Out-Null } catch { }

try { Remove-Item -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VigiSensysAgent' -Recurse -Force -ErrorAction SilentlyContinue } catch { }

if (Test-Path `$installDir) {
    Remove-Item -LiteralPath `$installDir -Recurse -Force
}
"@

    Set-Content -Path $uninstallScriptPath -Value $uninstallScript -Encoding UTF8

    $displayVersion = "1.0.0"
    try {
        $displayVersion = (Get-Item $ExePath).VersionInfo.ProductVersion
    } catch { }

    $uninstallCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$uninstallScriptPath`""

    New-Item -Path $uninstallKeyPath -Force | Out-Null
    Set-ItemProperty -Path $uninstallKeyPath -Name "DisplayName" -Value "VigiSensys Agent"
    Set-ItemProperty -Path $uninstallKeyPath -Name "DisplayVersion" -Value $displayVersion
    Set-ItemProperty -Path $uninstallKeyPath -Name "Publisher" -Value "VigiSensys"
    Set-ItemProperty -Path $uninstallKeyPath -Name "InstallLocation" -Value $InstallPath
    Set-ItemProperty -Path $uninstallKeyPath -Name "DisplayIcon" -Value $ExePath
    Set-ItemProperty -Path $uninstallKeyPath -Name "UninstallString" -Value $uninstallCommand
    Set-ItemProperty -Path $uninstallKeyPath -Name "QuietUninstallString" -Value ($uninstallCommand + " -Force")
    Set-ItemProperty -Path $uninstallKeyPath -Name "NoModify" -Value 1 -Type DWord
    Set-ItemProperty -Path $uninstallKeyPath -Name "NoRepair" -Value 1 -Type DWord
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
    $node = $config.SelectSingleNode("/configuration/appSettings/add[@key='VigiSensysSiteWebUrl']")
    if ($node -eq $null) {
        $node = $config.SelectSingleNode("/configuration/appSettings/add[@key='VigitempSiteWebUrl']")
    }
    if ($node -eq $null) {
        throw "Cle VigiSensysSiteWebUrl/VigitempSiteWebUrl introuvable dans le fichier de config."
    }

    $node.SetAttribute("value", $Url)
    $legacyNode = $config.SelectSingleNode("/configuration/appSettings/add[@key='VigitempSiteWebUrl']")
    if ($legacyNode -ne $null) {
        $legacyNode.SetAttribute("value", $Url)
    }
    $config.Save($ConfigPath)
}

if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = Resolve-InstallDir -ProvidedInstallDir $InstallDir
}

Ensure-Admin

$exePath = Join-Path $InstallDir "VigitempAgent.exe"
$configPath = Join-Path $InstallDir "VigitempAgent.exe.config"
$logDir = Join-Path $env:ProgramData "VigiSensys\logs"
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
    Ensure-AgentUninstallRegistry -InstallPath $InstallDir -ExePath $exePath

    Write-Log "Lancement de l'agent..."
    Start-Process -FilePath $exePath | Out-Null
    Start-Sleep -Seconds 2

    $running = Get-Process VigitempAgent -ErrorAction SilentlyContinue
    $listening = Test-AgentPortListening -Port 8000 -TimeoutSeconds 15

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
