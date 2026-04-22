Param(
    [ValidateSet("All", "Server", "Web")]
    [string]$Target = "All",

    [string]$DeployHost = "192.168.63.189",

    [string]$ServerPackageDir,
    [string]$WebPackageDir,

    [string]$RemoteStagingDir = "C:\ProgramData\Vigitemp\deploy-staging",
    [string]$RemoteServerInstallDir = "C:\ProgramData\Vigitemp\server",
    [string]$RemoteWebInstallDir = "C:\ProgramData\Vigitemp\website",

    [string]$ServerServiceName = "VigitempServeur",
    [string]$WebServiceName = "VigitempWeb",
    [switch]$ServerNoService,
    [string]$ServerProcessName = "Vigitemp Serveur",
    [string]$ServerProcessArgs = "--console",

    [switch]$WebAsZip = $true,

    [switch]$SkipPrepare,
    [switch]$PrepareOnly,
    [switch]$DeployOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }

function Write-Step([string]$message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $message"
}

function Invoke-RobocopySafe {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [string[]]$ExtraArgs = @()
    )

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    $args = @(
        $Source,
        $Destination,
        "/MIR",
        "/NFL",
        "/NDL",
        "/NJH",
        "/NJS",
        "/NC",
        "/NS"
    ) + $ExtraArgs

    & robocopy @args | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed with exit code $LASTEXITCODE (source='$Source', destination='$Destination')"
    }
}

function New-ZipFromDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$SourceDirectory,
        [Parameter(Mandatory = $true)][string]$ZipPath
    )

    if (-not (Test-Path $SourceDirectory)) {
        throw "Dossier source introuvable pour zip: $SourceDirectory"
    }

    if (Test-Path $ZipPath) {
        Remove-Item -Path $ZipPath -Force
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($SourceDirectory, $ZipPath, [System.IO.Compression.CompressionLevel]::Fastest, $false)
}

function Resolve-LocalDefaultPackageDirs {
    $repoRoot = $PSScriptRoot
    $defaultRoot = Resolve-Path (Join-Path $repoRoot "..\VigiSensys\2 - installation")

    if ([string]::IsNullOrWhiteSpace($script:ServerPackageDir)) {
        $script:ServerPackageDir = Join-Path $defaultRoot "1-serveur"
    }
    if ([string]::IsNullOrWhiteSpace($script:WebPackageDir)) {
        $script:WebPackageDir = Join-Path $defaultRoot "2-web"
    }
}

function Invoke-Prepare {
    if ($DeployOnly) { return }
    if ($SkipPrepare) {
        Write-Step "Prepare ignore (SkipPrepare)."
        return
    }

    $prepareScript = Join-Path $PSScriptRoot "Prepare-All.ps1"
    if (-not (Test-Path $prepareScript)) {
        throw "Prepare-All.ps1 introuvable: $prepareScript"
    }

    $only = switch ($Target) {
        "Server" { "Server" }
        "Web" { "Website" }
        default { "All" }
    }

    Write-Step "Preparation locale demarree (Only=$only)..."
    & $prepareScript -Only $only
    if ($LASTEXITCODE -ne 0) {
        throw "Prepare-All a echoue (code $LASTEXITCODE)."
    }
    Write-Step "Preparation locale terminee."
}

function New-LocalDeployPayload {
    Resolve-LocalDefaultPackageDirs
    $tmpRoot = Join-Path $env:TEMP ("vigitemp-deploy-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
    New-Item -ItemType Directory -Force -Path $tmpRoot | Out-Null

    if ($Target -eq "All" -or $Target -eq "Server") {
        if (-not (Test-Path $ServerPackageDir)) {
            throw "Dossier package serveur introuvable: $ServerPackageDir"
        }
        $serverPayload = Join-Path $tmpRoot "server"
        Write-Step "Construction payload serveur (exclusions appliquees)..."
        Invoke-RobocopySafe -Source $ServerPackageDir -Destination $serverPayload -ExtraArgs @(
            "/XD", "installer",
            "/XF", "*.config", "*setupserver*.exe"
        )
    }

    if ($Target -eq "All" -or $Target -eq "Web") {
        if (-not (Test-Path $WebPackageDir)) {
            throw "Dossier package web introuvable: $WebPackageDir"
        }
        $webNext = Join-Path $WebPackageDir ".next"
        if (-not (Test-Path $webNext)) {
            throw "Package web invalide, .next introuvable: $webNext"
        }
        if ($WebAsZip) {
            $webZip = Join-Path $tmpRoot "web-next.zip"
            Write-Step "Construction payload web (zip depuis package source)..."
            New-ZipFromDirectory -SourceDirectory $webNext -ZipPath $webZip
        } else {
            $webPayload = Join-Path $tmpRoot "web\.next"
            Write-Step "Construction payload web (.next)..."
            Invoke-RobocopySafe -Source $webNext -Destination $webPayload
        }
    }

    return $tmpRoot
}

function Copy-PayloadToRemote {
    param(
        [Parameter(Mandatory = $true)]$Session,
        [Parameter(Mandatory = $true)][string]$LocalPayloadRoot
    )

    Write-Step "Nettoyage staging distant: $RemoteStagingDir"
    Invoke-Command -Session $Session -ScriptBlock {
        param($staging)
        if (Test-Path $staging) {
            Remove-Item -Path $staging -Recurse -Force
        }
        New-Item -ItemType Directory -Force -Path $staging | Out-Null
    } -ArgumentList $RemoteStagingDir | Out-Null

    if ($Target -eq "All" -or $Target -eq "Server") {
        $localServer = Join-Path $LocalPayloadRoot "server"
        $remoteServer = Join-Path $RemoteStagingDir "server"
        Write-Step "Copie payload serveur vers $DeployHost..."
        Copy-Item -Path $localServer -Destination $remoteServer -Recurse -Force -ToSession $Session
    }

    if ($Target -eq "All" -or $Target -eq "Web") {
        $remoteWeb = Join-Path $RemoteStagingDir "web"
        Write-Step "Copie payload web vers $DeployHost..."
        Invoke-Command -Session $Session -ScriptBlock {
            param($remoteWebPath)
            New-Item -ItemType Directory -Force -Path $remoteWebPath | Out-Null
        } -ArgumentList $remoteWeb | Out-Null

        if ($WebAsZip) {
            $localWebZip = Join-Path $LocalPayloadRoot "web-next.zip"
            if (-not (Test-Path $localWebZip)) {
                throw "Archive web introuvable: $localWebZip"
            }
            Copy-Item -Path $localWebZip -Destination (Join-Path $RemoteStagingDir "web-next.zip") -Force -ToSession $Session

            Invoke-Command -Session $Session -ScriptBlock {
                param($stagingDir)
                $zipPath = Join-Path $stagingDir "web-next.zip"
                $extractPath = Join-Path $stagingDir "web\.next"
                if (Test-Path $extractPath) {
                    Remove-Item -Path $extractPath -Recurse -Force
                }
                New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
                Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
            } -ArgumentList $RemoteStagingDir | Out-Null
        } else {
            $localWebNext = Join-Path $LocalPayloadRoot "web\.next"
            Copy-Item -Path $localWebNext -Destination (Join-Path $remoteWeb ".next") -Recurse -Force -ToSession $Session
        }
    }
}

function Invoke-RemoteDeploy {
    param(
        [Parameter(Mandatory = $true)]$Session
    )

    if ($Target -eq "All" -or $Target -eq "Server") {
        Write-Step "Deploiement serveur distant..."
        Invoke-Command -Session $Session -ScriptBlock {
            param($serviceName, $stagingDir, $installDir, $noService, $serverProcName, $serverProcArgs)

            function Invoke-RobocopySafeRemote {
                param([string]$src, [string]$dst)
                New-Item -ItemType Directory -Force -Path $dst | Out-Null
                & robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
                if ($LASTEXITCODE -ge 8) {
                    throw "robocopy failed with exit code $LASTEXITCODE (source='$src', destination='$dst')"
                }
            }

            function Stop-ServerProcessFallback {
                param([string]$procName, [string]$targetInstallDir)
                Get-Process -Name $procName -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

                $targetExe = [System.IO.Path]::Combine($targetInstallDir, "Vigitemp Serveur.exe")
                Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
                    Where-Object {
                        $_.ExecutablePath -and
                        [string]::Equals($_.ExecutablePath, $targetExe, [System.StringComparison]::OrdinalIgnoreCase)
                    } |
                    ForEach-Object {
                        try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch { }
                    }
            }

            function Start-ServerProcessFallback {
                param([string]$targetInstallDir, [string]$procArgs)
                $exePath = Join-Path $targetInstallDir "Vigitemp Serveur.exe"
                if (-not (Test-Path $exePath)) {
                    throw "Executable serveur introuvable pour demarrage process: $exePath"
                }

                if ([string]::IsNullOrWhiteSpace($procArgs)) {
                    Start-Process -FilePath $exePath -WorkingDirectory $targetInstallDir -WindowStyle Hidden | Out-Null
                } else {
                    Start-Process -FilePath $exePath -ArgumentList $procArgs -WorkingDirectory $targetInstallDir -WindowStyle Hidden | Out-Null
                }
            }

            $payload = Join-Path $stagingDir "server"
            if (-not (Test-Path $payload)) {
                throw "Payload serveur introuvable: $payload"
            }

            $useServiceMode = $false
            if (-not $noService) {
                $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($svc) {
                    try {
                        Stop-Service -Name $serviceName -Force -ErrorAction Stop
                        Start-Sleep -Seconds 2
                        $useServiceMode = $true
                    } catch {
                        $useServiceMode = $false
                    }
                }
            }

            if (-not $useServiceMode) {
                Stop-ServerProcessFallback -procName $serverProcName -targetInstallDir $installDir
                Start-Sleep -Seconds 1
            }

            Invoke-RobocopySafeRemote -src $payload -dst $installDir

            if ($useServiceMode) {
                try {
                    Start-Service -Name $serviceName -ErrorAction Stop
                } catch {
                    # Fallback automatique en mode process si le service ne demarre pas
                    Stop-ServerProcessFallback -procName $serverProcName -targetInstallDir $installDir
                    Start-ServerProcessFallback -targetInstallDir $installDir -procArgs $serverProcArgs
                }
            } else {
                Start-ServerProcessFallback -targetInstallDir $installDir -procArgs $serverProcArgs
            }
        } -ArgumentList $ServerServiceName, $RemoteStagingDir, $RemoteServerInstallDir, [bool]$ServerNoService, $ServerProcessName, $ServerProcessArgs | Out-Null
    }

    if ($Target -eq "All" -or $Target -eq "Web") {
        Write-Step "Deploiement web distant..."
        Invoke-Command -Session $Session -ScriptBlock {
            param($serviceName, $stagingDir, $installDir)

            function Invoke-RobocopySafeRemote {
                param([string]$src, [string]$dst)
                New-Item -ItemType Directory -Force -Path $dst | Out-Null
                & robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
                if ($LASTEXITCODE -ge 8) {
                    throw "robocopy failed with exit code $LASTEXITCODE (source='$src', destination='$dst')"
                }
            }

            $payloadNext = Join-Path $stagingDir "web\.next"
            if (-not (Test-Path $payloadNext)) {
                throw "Payload web .next introuvable: $payloadNext"
            }

            $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if ($svc) {
                Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }

            $currentEnv = Join-Path $installDir ".env"
            $targetNext = Join-Path $installDir ".next"

            if (Test-Path $targetNext) {
                Remove-Item -Path $targetNext -Recurse -Force
            }

            Invoke-RobocopySafeRemote -src $payloadNext -dst $targetNext

            if (Test-Path $currentEnv) {
                $standaloneDir = Join-Path $targetNext "standalone"
                New-Item -ItemType Directory -Force -Path $standaloneDir | Out-Null
                Copy-Item -Path $currentEnv -Destination (Join-Path $standaloneDir ".env") -Force
            }

            if ($svc) {
                Start-Service -Name $serviceName
            }
        } -ArgumentList $WebServiceName, $RemoteStagingDir, $RemoteWebInstallDir | Out-Null
    }
}

if ($PrepareOnly -and $DeployOnly) {
    throw "PrepareOnly et DeployOnly ne peuvent pas etre utilises ensemble."
}

Invoke-Prepare
if ($PrepareOnly) {
    Write-Step "Mode PrepareOnly termine."
    exit 0
}

$payloadRoot = $null
$session = $null
try {
    $payloadRoot = New-LocalDeployPayload
    Write-Step "Ouverture session distante vers $DeployHost..."
    $credential = Get-Credential -Message "Identifiants admin du serveur $DeployHost"
    $session = New-PSSession -ComputerName $DeployHost -Credential $credential

    Copy-PayloadToRemote -Session $session -LocalPayloadRoot $payloadRoot
    Invoke-RemoteDeploy -Session $session
    Write-Step "Deploiement termine avec succes."
}
finally {
    if ($session) {
        Remove-PSSession -Session $session
    }
    if ($payloadRoot -and (Test-Path $payloadRoot)) {
        Remove-Item -Path $payloadRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
