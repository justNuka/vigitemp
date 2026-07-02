Param(
    [string]$SourcePath,
    [string]$OutputDir,
    [ValidateSet("mysql", "mssql")]
    [string]$DatabaseProvider = "mysql",
    [switch]$SkipInstall,
    [switch]$SkipApproveBuilds,
    [switch]$SkipGenerate,
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }

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
        throw "robocopy failed with exit code $LASTEXITCODE (source='$Source', destination='$Destination')"
    }
}

function Get-NodeMsiVersionFromName {
    param([Parameter(Mandatory = $true)][string]$Path)
    $name = [System.IO.Path]::GetFileName($Path)
    $match = [regex]::Match($name, '^node-v(?<v>\d+\.\d+\.\d+)-x64\.msi$', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) { return $match.Groups["v"].Value }
    return $null
}

function Find-NodeInstaller {
    param([Parameter(Mandatory = $true)][string]$InstallerDirectory)

    if (-not (Test-Path $InstallerDirectory)) { return $null }

    $candidates = @()
    $candidates += Get-ChildItem -Path $InstallerDirectory -File -Filter "node-v*-x64.msi" -ErrorAction SilentlyContinue
    $candidates += Get-ChildItem -Path $InstallerDirectory -File -Filter "node-*.msi" -ErrorAction SilentlyContinue
    $uniqueCandidates = @($candidates | Sort-Object -Property FullName -Unique)
    if ($uniqueCandidates.Count -eq 0) { return $null }

    $decorated = $uniqueCandidates | ForEach-Object {
        $version = Get-NodeMsiVersionFromName -Path $_.FullName
        $versionObject = $null
        if (-not [string]::IsNullOrWhiteSpace($version)) {
            try { $versionObject = [version]$version } catch { $versionObject = $null }
        }
        [pscustomobject]@{
            File = $_
            Version = $version
            VersionObject = $versionObject
            LastWriteTime = $_.LastWriteTimeUtc
        }
    }

    $bestWithVersion = $decorated |
        Where-Object { $_.VersionObject -ne $null } |
        Sort-Object -Property @{ Expression = { $_.VersionObject }; Descending = $true } |
        Select-Object -First 1
    if ($bestWithVersion) {
        return $bestWithVersion.File.FullName
    }

    return ($decorated | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1).File.FullName
}

function Remove-DirectoryWithRetry {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [int]$MaxAttempts = 5,
        [int]$DelaySeconds = 2
    )

    if (-not (Test-Path $Path)) {
        return $true
    }

    $lastErrorMessage = ""
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        } catch {
            $lastErrorMessage = $_.Exception.Message
        }

        if (-not (Test-Path $Path)) {
            return $true
        }

        if ($attempt -eq $MaxAttempts) {
            Write-Log "Could not fully clean '$Path' after $MaxAttempts attempts: $lastErrorMessage"
            return $false
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    return (-not (Test-Path $Path))
}

function Invoke-Pnpm {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [switch]$CaptureOutput
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        if ($CaptureOutput) {
            $commandOutput = @()
            & $pnpmCmd.Source @Arguments 2>&1 | Tee-Object -Variable commandOutput | Out-Null
            return [pscustomobject]@{
                ExitCode = $LASTEXITCODE
                Output = ($commandOutput -join [Environment]::NewLine)
            }
        }

        & $pnpmCmd.Source @Arguments | Out-Null
        return [pscustomobject]@{
            ExitCode = $LASTEXITCODE
            Output = ""
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

$scriptRoot = $PSScriptRoot
$websiteRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $websiteRoot "..")
$installerProject = Join-Path $websiteRoot "WebsiteInstallerBootstrapper\WebsiteInstallerBootstrapper.csproj"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = $websiteRoot.Path
}
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\VigiSensys\2 - installation\2-web"
}

if (-not (Test-Path (Join-Path $SourcePath "package.json"))) {
    Write-Error "package.json not found in SourcePath: $SourcePath"
}

$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
if ($null -eq $pnpmCmd) {
    Write-Error "pnpm not found in PATH. Install pnpm or run from a shell that has it."
}

Push-Location $SourcePath
$buildDistDirName = ".next"

if (-not $SkipInstall) {
    Write-Log "Running pnpm install..."
    $installResult = Invoke-Pnpm -Arguments @("install")
    if ($installResult.ExitCode -ne 0) {
        Write-Error "pnpm install failed (code $($installResult.ExitCode))."
    }
}

if (-not $SkipApproveBuilds) {
    Write-Log "Running pnpm approve-builds (interactive)..."
    $approveResult = Invoke-Pnpm -Arguments @("approve-builds")
    if ($approveResult.ExitCode -ne 0) {
        Write-Error "pnpm approve-builds failed (code $($approveResult.ExitCode))."
    }
}

if (-not $SkipGenerate) {
    Write-Log "Running pnpm prisma:prepare for provider '$DatabaseProvider'..."
    $prepareResult = Invoke-Pnpm -Arguments @("prisma:prepare", "--provider", $DatabaseProvider)
    if ($prepareResult.ExitCode -ne 0) {
        Write-Error "pnpm prisma:prepare failed (code $($prepareResult.ExitCode))."
    }

    Write-Log "Running pnpm prisma:generate..."
    $generateResult = Invoke-Pnpm -Arguments @("prisma:generate")
    if ($generateResult.ExitCode -ne 0) {
        Write-Error "pnpm prisma:generate failed (code $($generateResult.ExitCode))."
    }
}

if (-not $SkipBuild) {
    Write-Log "Running pnpm build..."
    $previousSkipDb = $env:VIGITEMP_SKIP_DB_ON_BUILD
    $previousLogsDir = $env:VIGITEMP_LOGS_DIR
    $previousDisableTurbo = $env:NEXT_DISABLE_TURBOPACK
    $buildLogsDir = Join-Path $repoRoot "..\VigiSensys\2 - installation\tmp-logs"
    $projectLogsDir = Join-Path $SourcePath "logs"
    $env:VIGITEMP_SKIP_DB_ON_BUILD = "1"
    $env:VIGITEMP_LOGS_DIR = $buildLogsDir
    $env:NEXT_DISABLE_TURBOPACK = "1"
    try {
        if (Test-Path $projectLogsDir) {
            Write-Log "Cleeaning project logs folder before build..."
            Remove-Item -Path $projectLogsDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        if (-not (Test-Path $buildLogsDir)) {
            New-Item -ItemType Directory -Force -Path $buildLogsDir | Out-Null
        }

        $maxBuildAttempts = 3

        for ($attempt = 1; $attempt -le $maxBuildAttempts; $attempt++) {
            $nextBuildDir = Join-Path $SourcePath $buildDistDirName

            if ($attempt -gt 1) {
                Write-Log "Retrying pnpm build after EBUSY lock (attempt $attempt/$maxBuildAttempts)..."
            }

            $cleanResult = Remove-DirectoryWithRetry -Path $nextBuildDir -MaxAttempts 3 -DelaySeconds 1
            if (-not $cleanResult) {
                Write-Log "Continuing build attempt with partial cleanup on $buildDistDirName."
            }

            $buildResult = Invoke-Pnpm -Arguments @("build") -CaptureOutput
            $buildExitCode = $buildResult.ExitCode

            if ($buildExitCode -eq 0) {
                break
            }

            $buildOutputText = $buildResult.Output
            $isBusyLock = $buildOutputText -match "EBUSY" -or $buildOutputText -match "resource busy or locked"

            if (-not $isBusyLock -or $attempt -eq $maxBuildAttempts) {
                $outputTail = ($buildOutputText -split "`r?`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Last 12) -join [Environment]::NewLine
                if ([string]::IsNullOrWhiteSpace($outputTail)) {
                    Write-Error "pnpm build failed (code $buildExitCode)."
                } else {
                    Write-Error "pnpm build failed (code $buildExitCode). Last output lines:`n$outputTail"
                }
            }

            Write-Log "Detected EBUSY lock during build. Waiting before retry..."
            Start-Sleep -Seconds 2
        }
    } finally {
        $env:VIGITEMP_SKIP_DB_ON_BUILD = $previousSkipDb
        $env:VIGITEMP_LOGS_DIR = $previousLogsDir
        $env:NEXT_DISABLE_TURBOPACK = $previousDisableTurbo
    }
}

if (-not (Test-Path $installerProject)) {
    Write-Error "Website installer bootstrapper project not found: $installerProject"
}

Write-Log "Publishing web installer bootstrapper..."
& dotnet publish $installerProject -c Release -nologo | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "dotnet publish bootstrapper web a echoue (code $LASTEXITCODE)"
}

Pop-Location

$standaloneDir = Join-Path $SourcePath (Join-Path $buildDistDirName "standalone")
$staticDir = Join-Path $SourcePath (Join-Path $buildDistDirName "static")

if (-not (Test-Path $standaloneDir)) {
    Write-Error "Missing $buildDistDirName\standalone. Make sure next.config.js has output=standalone and build succeeded."
}
if (-not (Test-Path $staticDir)) {
    Write-Error "Missing $buildDistDirName\static. Build seems incomplete."
}

Write-Log "Preparing output folder: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$installerBootstrapperExe = Join-Path $websiteRoot "WebsiteInstallerBootstrapper\bin\Release\net8.0-windows\win-x64\publish\VigiSensysWebSetup.exe"

$targetNext = Join-Path $OutputDir ".next"
New-Item -ItemType Directory -Force -Path $targetNext | Out-Null

Write-Log "Copying standalone server..."
Invoke-RobocopySafe -Source $standaloneDir -Destination (Join-Path $targetNext "standalone")

Write-Log "Copying static assets..."
Invoke-RobocopySafe -Source $staticDir -Destination (Join-Path $targetNext "static")

Write-Log "Copying static assets into standalone package..."
$standaloneStaticDest = Join-Path $targetNext "standalone\.next\static"
New-Item -ItemType Directory -Force -Path $standaloneStaticDest | Out-Null
Invoke-RobocopySafe -Source $staticDir -Destination $standaloneStaticDest

$standaloneNodeModules = Join-Path $targetNext "standalone\node_modules"
$nextEnvTarget = Join-Path $standaloneNodeModules "@next\env"
if (-not (Test-Path $nextEnvTarget)) {
    $pnpmRoots = @()
    try {
        $pnpmRoot = & $pnpmCmd.Source root 2>$null
        if (-not [string]::IsNullOrWhiteSpace($pnpmRoot)) {
            $pnpmRoots += $pnpmRoot.Trim()
        }
    } catch { }
    $pnpmRoots += (Join-Path $SourcePath "node_modules")
    $pnpmRoots += (Join-Path $repoRoot "node_modules")
    $pnpmRoots = $pnpmRoots | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

    foreach ($root in $pnpmRoots) {
        $directEnv = Join-Path $root "@next\env"
        if (Test-Path $directEnv) {
            Write-Log "Copying @next/env into standalone package..."
            New-Item -ItemType Directory -Force -Path (Split-Path $nextEnvTarget -Parent) | Out-Null
            Invoke-RobocopySafe -Source $directEnv -Destination $nextEnvTarget
            break
        }

        $pnpmStore = Join-Path $root ".pnpm"
        if (Test-Path $pnpmStore) {
            $nextEnvStore = Get-ChildItem -Path $pnpmStore -Directory -Filter "@next+env@*" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($nextEnvStore) {
                $storeEnv = Join-Path $nextEnvStore.FullName "node_modules\@next\env"
                if (Test-Path $storeEnv) {
                    Write-Log "Copying @next/env into standalone package..."
                    New-Item -ItemType Directory -Force -Path (Split-Path $nextEnvTarget -Parent) | Out-Null
                    Invoke-RobocopySafe -Source $storeEnv -Destination $nextEnvTarget
                    break
                }
            }
        }
    }
}

$standaloneEnv = Join-Path $targetNext "standalone\.env"
if (Test-Path $standaloneEnv) {
    Remove-Item -Path $standaloneEnv -Force
}

$installerSrc = Join-Path $SourcePath "installer"

if (Test-Path $installerBootstrapperExe) {
    Copy-Item -Path $installerBootstrapperExe -Destination (Join-Path $OutputDir "VigiSensysWebSetup.exe") -Force
    Write-Log "Copied web installer bootstrapper into package."
}

$winswSource = Join-Path $installerSrc "winsw.exe"
if (Test-Path $winswSource) {
    Copy-Item -Path $winswSource -Destination (Join-Path $OutputDir "winsw.exe") -Force
    Write-Log "Copied winsw.exe into package."
}

foreach ($dirToDrop in @((Join-Path $OutputDir "installer"), (Join-Path $targetNext "standalone\installer"))) {
    if (Test-Path $dirToDrop) {
        try { [System.IO.Directory]::Delete($dirToDrop, $true) } catch { }
    }
}

$prereqRoot = Join-Path $repoRoot "..\VigiSensys\1 - prerequis"
$prereqNodeDir = Join-Path $prereqRoot "node"

Write-Log "Updating shared prerequisites folder (Node)..."
New-Item -ItemType Directory -Force -Path $prereqRoot | Out-Null
New-Item -ItemType Directory -Force -Path $prereqNodeDir | Out-Null


$nodeMsiSource = Find-NodeInstaller -InstallerDirectory $installerSrc
if (-not [string]::IsNullOrWhiteSpace($nodeMsiSource) -and (Test-Path $nodeMsiSource)) {
    Get-ChildItem -Path $prereqNodeDir -File -Filter "node-*.msi" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    $nodeMsiName = [System.IO.Path]::GetFileName($nodeMsiSource)
    Copy-Item -Path $nodeMsiSource -Destination (Join-Path $prereqNodeDir $nodeMsiName) -Force
    $detectedNodeVersion = Get-NodeMsiVersionFromName -Path $nodeMsiSource
    if ($detectedNodeVersion) {
        Write-Log "Node prerequisite copied: $nodeMsiName (version $detectedNodeVersion)"
    } else {
        Write-Log "Node prerequisite copied: $nodeMsiName"
    }
} else {
    Write-Log "No Node MSI found in installer folder. Skipping Node prerequisite sync."
}

Write-Log "Done. Standalone package ready at: $OutputDir"
