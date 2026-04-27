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
    if (-not $?) {
        $exitCode = if ($null -ne $LASTEXITCODE) { $LASTEXITCODE } else { -1 }
        throw "Prepare-All a echoue (code $exitCode)."
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
            "/XF", "*setupserver*.exe", "*serversetup*.exe", "VigitempServerSetup.exe", "setupserver.exe"
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

        $webPublic = Join-Path $WebPackageDir "public"
        if (Test-Path $webPublic) {
            $publicPayload = Join-Path $tmpRoot "web-public"
            Write-Step "Construction payload web (public)..."
            Invoke-RobocopySafe -Source $webPublic -Destination $publicPayload -ExtraArgs @("/XD", "uploads")
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

        $localWebPublic = Join-Path $LocalPayloadRoot "web-public"
        if (Test-Path $localWebPublic) {
            Copy-Item -Path $localWebPublic -Destination (Join-Path $RemoteStagingDir "web-public") -Recurse -Force -ToSession $Session
        }
    }
}

function Invoke-RemoteDeploy {
    param(
        [Parameter(Mandatory = $true)]$Session
    )

    if ($Target -eq "All" -or $Target -eq "Server") {
        Write-Step "Deploiement serveur distant..."
        Write-Step "Options serveur: ServerNoService=$([bool]$ServerNoService) ServiceName='$ServerServiceName' ProcessName='$ServerProcessName' Args='$ServerProcessArgs'"
        $serverLogs = Invoke-Command -Session $Session -ScriptBlock {
            param($serviceName, $stagingDir, $installDir, $noService, $serverProcName, $serverProcArgs)

            function Write-RemoteLog {
                param([string]$message)
                $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Write-Output "[$ts] [REMOTE][SERVER] $message"
            }

            function Invoke-RobocopySafeRemote {
                param([string]$src, [string]$dst, [string[]]$extraArgs = @())
                New-Item -ItemType Directory -Force -Path $dst | Out-Null
                $args = @($src, $dst, "/MIR", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS") + $extraArgs
                & robocopy @args | Out-Null
                if ($LASTEXITCODE -ge 8) {
                    throw "robocopy failed with exit code $LASTEXITCODE (source='$src', destination='$dst')"
                }
                Write-RemoteLog "Robocopy serveur OK (code=$LASTEXITCODE) src='$src' dst='$dst'"
            }

            function Stop-ServerProcessFallback {
                param([string]$procName, [string]$targetInstallDir)
                $killedByName = 0
                Get-Process -Name $procName -ErrorAction SilentlyContinue | ForEach-Object {
                    try {
                        Stop-Process -Id $_.Id -Force -ErrorAction Stop
                        $killedByName++
                    } catch { }
                }

                $targetExe = [System.IO.Path]::Combine($targetInstallDir, "Vigitemp Serveur.exe")
                $killedByPath = 0
                Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
                    Where-Object {
                        $_.ExecutablePath -and
                        [string]::Equals($_.ExecutablePath, $targetExe, [System.StringComparison]::OrdinalIgnoreCase)
                    } |
                    ForEach-Object {
                        try {
                            Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
                            $killedByPath++
                        } catch { }
                    }

                Write-RemoteLog "Process fallback stop: procName='$procName' killedByName=$killedByName killedByPath=$killedByPath"
            }

            function Start-ServerProcessFallback {
                param([string]$targetInstallDir, [string]$procArgs)
                $exePath = Join-Path $targetInstallDir "Vigitemp Serveur.exe"
                if (-not (Test-Path $exePath)) {
                    throw "Executable serveur introuvable pour demarrage process: $exePath"
                }

                # Demarrage detache (hors job WinRM) pour eviter l'arret quand la session remoting se ferme.
                $commandLine = if ([string]::IsNullOrWhiteSpace($procArgs)) {
                    "`"$exePath`""
                } else {
                    "`"$exePath`" $procArgs"
                }
                $create = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
                    CommandLine      = $commandLine
                    CurrentDirectory = $targetInstallDir
                }
                if ($create.ReturnValue -ne 0) {
                    throw "Win32_Process.Create a echoue (code=$($create.ReturnValue)) commandLine=$commandLine"
                }
                $startedPid = [int]$create.ProcessId
                Write-RemoteLog "Start process fallback (detache): '$commandLine' pid=$startedPid"

                Start-Sleep -Milliseconds 500
                $running = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
                    Where-Object {
                        $_.ProcessId -eq $startedPid
                    } |
                    Select-Object -First 1
                if ($running) {
                    Write-RemoteLog "Process fallback started OK (pid=$startedPid)."
                } else {
                    Write-RemoteLog "WARN: process fallback start non confirme."
                }

                # Verification retardee: certains process meurent juste apres le bootstrap.
                Start-Sleep -Seconds 5
                $runningAfterDelay = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
                    Where-Object {
                        $_.ProcessId -eq $startedPid
                    } |
                    Select-Object -First 1
                if ($runningAfterDelay) {
                    Write-RemoteLog "Process fallback still running after 5s (pid=$startedPid)."
                } else {
                    $serverLogPath = "C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log"
                    if (Test-Path $serverLogPath) {
                        Write-RemoteLog "Dernieres lignes log serveur:"
                        Get-Content -Path $serverLogPath -Tail 30 | ForEach-Object { Write-Output ("[REMOTE][SERVER][LOG] " + $_) }
                    }
                    throw "Le serveur demarre puis s'arrete rapidement (pid=$startedPid non present apres 5s)."
                }
            }

            $payload = Join-Path $stagingDir "server"
            if (-not (Test-Path $payload)) {
                throw "Payload serveur introuvable: $payload"
            }
            Write-RemoteLog "Payload serveur detecte: $payload"

            $useServiceMode = $false
            if (-not $noService) {
                $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($svc) {
                    Write-RemoteLog "Service '$serviceName' detecte (status=$($svc.Status)). Tentative stop..."
                    try {
                        Stop-Service -Name $serviceName -Force -ErrorAction Stop
                        Start-Sleep -Seconds 2
                        $svcAfterStop = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                        Write-RemoteLog "Service '$serviceName' stop demande (status=$($svcAfterStop.Status))."
                        $useServiceMode = $true
                    } catch {
                        Write-RemoteLog "WARN: echec stop service '$serviceName'. Passage en fallback process."
                        $useServiceMode = $false
                    }
                } else {
                    Write-RemoteLog "Service '$serviceName' non trouve. Mode process fallback."
                }
            } else {
                Write-RemoteLog "Option ServerNoService activee. Mode process fallback."
            }

            if (-not $useServiceMode) {
                Stop-ServerProcessFallback -procName $serverProcName -targetInstallDir $installDir
                Start-Sleep -Seconds 1
            }

            # Ne pas supprimer le .config local (config environnement) pendant le miroir.
            Invoke-RobocopySafeRemote -src $payload -dst $installDir -extraArgs @(
                "/XF", "Vigitemp Serveur.exe.config"
            )

            if ($useServiceMode) {
                Write-RemoteLog "Tentative start service '$serviceName'..."
                try {
                    Start-Service -Name $serviceName -ErrorAction Stop
                    Start-Sleep -Seconds 1
                    $svcAfterStart = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                    Write-RemoteLog "Service '$serviceName' start demande (status=$($svcAfterStart.Status))."
                } catch {
                    # Fallback automatique en mode process si le service ne demarre pas
                    Write-RemoteLog "WARN: echec start service '$serviceName'. Fallback process."
                    Stop-ServerProcessFallback -procName $serverProcName -targetInstallDir $installDir
                    Start-ServerProcessFallback -targetInstallDir $installDir -procArgs $serverProcArgs
                }
            } else {
                Start-ServerProcessFallback -targetInstallDir $installDir -procArgs $serverProcArgs
            }
        } -ArgumentList $ServerServiceName, $RemoteStagingDir, $RemoteServerInstallDir, [bool]$ServerNoService, $ServerProcessName, $ServerProcessArgs
        if ($serverLogs) {
            $serverLogs | ForEach-Object { Write-Step $_ }
        }
    }

    if ($Target -eq "All" -or $Target -eq "Web") {
        Write-Step "Deploiement web distant..."
        $webLogs = Invoke-Command -Session $Session -ScriptBlock {
            param($serviceName, $stagingDir, $installDir)

            function Write-RemoteLog {
                param([string]$message)
                $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Write-Output "[$ts] [REMOTE][WEB] $message"
            }

            function Invoke-RobocopySafeRemote {
                param([string]$src, [string]$dst)
                New-Item -ItemType Directory -Force -Path $dst | Out-Null
                & robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
                if ($LASTEXITCODE -ge 8) {
                    throw "robocopy failed with exit code $LASTEXITCODE (source='$src', destination='$dst')"
                }
                Write-RemoteLog "Robocopy web OK (code=$LASTEXITCODE) src='$src' dst='$dst'"
            }

            function Invoke-RobocopyMergeRemote {
                param([string]$src, [string]$dst, [string[]]$extraArgs = @())
                New-Item -ItemType Directory -Force -Path $dst | Out-Null
                $args = @($src, $dst, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS") + $extraArgs
                & robocopy @args | Out-Null
                if ($LASTEXITCODE -ge 8) {
                    throw "robocopy merge failed with exit code $LASTEXITCODE (source='$src', destination='$dst')"
                }
                Write-RemoteLog "Robocopy web merge OK (code=$LASTEXITCODE) src='$src' dst='$dst'"
            }

            $payloadNext = Join-Path $stagingDir "web\.next"
            if (-not (Test-Path $payloadNext)) {
                throw "Payload web .next introuvable: $payloadNext"
            }
            Write-RemoteLog "Payload web detecte: $payloadNext"
            $payloadPublic = Join-Path $stagingDir "web-public"
            if (Test-Path $payloadPublic) {
                Write-RemoteLog "Payload web public detecte: $payloadPublic"
            }

            $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
            if ($svc) {
                Write-RemoteLog "Service '$serviceName' detecte (status=$($svc.Status)). Tentative stop..."
                Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
                $svcAfterStop = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                Write-RemoteLog "Service '$serviceName' stop demande (status=$($svcAfterStop.Status))."
            } else {
                Write-RemoteLog "Service '$serviceName' non trouve."
            }

            # Evite les melanges de chunks si un node residuel garde des fichiers verrouilles.
            $killedNode = 0
            Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
                Where-Object {
                    $_.Name -eq "node.exe" -and
                    $_.CommandLine -and
                    $_.CommandLine -like "*$installDir*"
                } |
                ForEach-Object {
                    try {
                        Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
                        $killedNode++
                    } catch { }
                }
            Write-RemoteLog "Node residuels tues: $killedNode"

            $currentEnv = Join-Path $installDir ".env"
            $targetNext = Join-Path $installDir ".next"
            $targetPublic = Join-Path $installDir "public"

            if (Test-Path $targetNext) {
                Remove-Item -Path $targetNext -Recurse -Force
                Write-RemoteLog "Ancien dossier .next supprime."
            }

            Invoke-RobocopySafeRemote -src $payloadNext -dst $targetNext

            if (Test-Path $payloadPublic) {
                Invoke-RobocopyMergeRemote -src $payloadPublic -dst $targetPublic -extraArgs @("/XD", "uploads")
            }

            if (Test-Path $currentEnv) {
                $standaloneDir = Join-Path $targetNext "standalone"
                New-Item -ItemType Directory -Force -Path $standaloneDir | Out-Null
                Copy-Item -Path $currentEnv -Destination (Join-Path $standaloneDir ".env") -Force
                Write-RemoteLog "Fichier .env recopie vers standalone."
            }

            if ($svc) {
                Write-RemoteLog "Tentative start service '$serviceName'..."
                Start-Service -Name $serviceName
                Start-Sleep -Seconds 1
                $svcAfterStart = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                Write-RemoteLog "Service '$serviceName' start demande (status=$($svcAfterStart.Status))."
            }
        } -ArgumentList $WebServiceName, $RemoteStagingDir, $RemoteWebInstallDir
        if ($webLogs) {
            $webLogs | ForEach-Object { Write-Step $_ }
        }
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
