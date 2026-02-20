Param(
    [string]$SourcePath,
    [string]$OutputDir,
    [switch]$SkipInstall,
    [switch]$SkipApproveBuilds,
    [switch]$SkipGenerate,
    [switch]$SkipBuild
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

$scriptRoot = $PSScriptRoot
$websiteRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $websiteRoot "..")

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = $websiteRoot.Path
}
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\\vigi\\2 - installation\\2 - site web"
}

if (-not (Test-Path (Join-Path $SourcePath "package.json"))) {
    Write-Error "package.json not found in SourcePath: $SourcePath"
}

$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
if ($null -eq $pnpmCmd) {
    Write-Error "pnpm not found in PATH. Install pnpm or run from a shell that has it."
}

Push-Location $SourcePath

if (-not $SkipInstall) {
    Write-Log "Running pnpm install..."
    & $pnpmCmd.Source install | Out-Null
}

if (-not $SkipApproveBuilds) {
    Write-Log "Running pnpm approve-builds (interactive)..."
    & $pnpmCmd.Source approve-builds | Out-Null
}

if (-not $SkipGenerate) {
    Write-Log "Running pnpm prisma:generate..."
    & $pnpmCmd.Source prisma:generate | Out-Null
}

if (-not $SkipBuild) {
    Write-Log "Running pnpm build..."
    $previousSkipDb = $env:VIGITEMP_SKIP_DB_ON_BUILD
    $previousLogsDir = $env:VIGITEMP_LOGS_DIR
    $previousDisableTurbo = $env:NEXT_DISABLE_TURBOPACK
    $buildLogsDir = Join-Path $repoRoot "..\\vigi\\2 - installation\\tmp-logs"
    $projectLogsDir = Join-Path $SourcePath "logs"
    $env:VIGITEMP_SKIP_DB_ON_BUILD = "1"
    $env:VIGITEMP_LOGS_DIR = $buildLogsDir
    $env:NEXT_DISABLE_TURBOPACK = "1"
    try {
        if (Test-Path $projectLogsDir) {
            Write-Log "Cleaning project logs folder before build..."
            Remove-Item -Path $projectLogsDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        if (-not (Test-Path $buildLogsDir)) {
            New-Item -ItemType Directory -Force -Path $buildLogsDir | Out-Null
        }
        & $pnpmCmd.Source build | Out-Null
    } finally {
        $env:VIGITEMP_SKIP_DB_ON_BUILD = $previousSkipDb
        $env:VIGITEMP_LOGS_DIR = $previousLogsDir
        $env:NEXT_DISABLE_TURBOPACK = $previousDisableTurbo
    }
}

Pop-Location

$standaloneDir = Join-Path $SourcePath ".next\\standalone"
$staticDir = Join-Path $SourcePath ".next\\static"
$publicDir = Join-Path $SourcePath "public"

if (-not (Test-Path $standaloneDir)) {
    Write-Error "Missing .next\\standalone. Make sure next.config.js has output=standalone and build succeeded."
}
if (-not (Test-Path $staticDir)) {
    Write-Error "Missing .next\\static. Build seems incomplete."
}

Write-Log "Preparing output folder: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$targetNext = Join-Path $OutputDir ".next"
New-Item -ItemType Directory -Force -Path $targetNext | Out-Null

Write-Log "Copying standalone server..."
& robocopy $standaloneDir (Join-Path $targetNext "standalone") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null

Write-Log "Copying static assets..."
& robocopy $staticDir (Join-Path $targetNext "static") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null

Write-Log "Copying static assets into standalone package..."
$standaloneStaticDest = Join-Path $targetNext "standalone\\.next\\static"
New-Item -ItemType Directory -Force -Path $standaloneStaticDest | Out-Null
& robocopy $staticDir $standaloneStaticDest /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null

$standaloneNodeModules = Join-Path $targetNext "standalone\\node_modules"
$nextEnvTarget = Join-Path $standaloneNodeModules "@next\\env"
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
        $directEnv = Join-Path $root "@next\\env"
        if (Test-Path $directEnv) {
            Write-Log "Copying @next/env into standalone package..."
            New-Item -ItemType Directory -Force -Path (Split-Path $nextEnvTarget -Parent) | Out-Null
            & robocopy $directEnv $nextEnvTarget /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
            break
        }

        $pnpmStore = Join-Path $root ".pnpm"
        if (Test-Path $pnpmStore) {
            $nextEnvStore = Get-ChildItem -Path $pnpmStore -Directory -Filter "@next+env@*" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($nextEnvStore) {
                $storeEnv = Join-Path $nextEnvStore.FullName "node_modules\\@next\\env"
                if (Test-Path $storeEnv) {
                    Write-Log "Copying @next/env into standalone package..."
                    New-Item -ItemType Directory -Force -Path (Split-Path $nextEnvTarget -Parent) | Out-Null
                    & robocopy $storeEnv $nextEnvTarget /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
                    break
                }
            }
        }
    }
}

$standaloneEnv = Join-Path $targetNext "standalone\\.env"
if (Test-Path $standaloneEnv) {
    Remove-Item -Path $standaloneEnv -Force
}

# public/ is already included in .next/standalone; do not copy it separately.

# Installer scripts/dependency installers are centralized in vigi/1 - prerequis.
foreach ($dirToDrop in @((Join-Path $OutputDir "installer"), (Join-Path $targetNext "standalone\installer"))) {
    if (Test-Path $dirToDrop) {
        try { [System.IO.Directory]::Delete($dirToDrop, $true) } catch { }
    }
}

$installerSrc = Join-Path $SourcePath "installer"


$prereqRoot = Join-Path $repoRoot "..\\vigi\\1 - prerequis"
$prereqInstallDir = Join-Path $prereqRoot "install"
$prereqNodeDir = Join-Path $prereqRoot "node"

Write-Log "Updating shared prerequisites folder (Node)..."
New-Item -ItemType Directory -Force -Path $prereqInstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $prereqNodeDir | Out-Null

$installNodeScript = Join-Path $installerSrc "Install-Node.ps1"
if (Test-Path $installNodeScript) {
    Copy-Item -Path $installNodeScript -Destination (Join-Path $prereqInstallDir "Install-Node.ps1") -Force
}

$nodeMsiSource = Join-Path $installerSrc "node-v24.12.0-x64.msi"
if (Test-Path $nodeMsiSource) {
    Copy-Item -Path $nodeMsiSource -Destination (Join-Path $prereqNodeDir "node-v24.12.0-x64.msi") -Force
}

Write-Log "Done. Standalone package ready at: $OutputDir"






