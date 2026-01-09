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

function Write-Log($message) {
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
    $OutputDir = Join-Path $repoRoot "..\\vigi\\build\\website-standalone"
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
    $env:VIGITEMP_SKIP_DB_ON_BUILD = "1"
    try {
        & $pnpmCmd.Source build | Out-Null
    } finally {
        $env:VIGITEMP_SKIP_DB_ON_BUILD = $previousSkipDb
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

if (Test-Path $publicDir) {
    Write-Log "Copying public assets..."
    & robocopy $publicDir (Join-Path $OutputDir "public") /MIR /NFL /NDL /NJH /NJS /NC /NS | Out-Null
}

Copy-Item -Path (Join-Path $SourcePath "package.json") -Destination (Join-Path $OutputDir "package.json") -Force
Copy-Item -Path (Join-Path $SourcePath "next.config.js") -Destination (Join-Path $OutputDir "next.config.js") -Force

$installerSrc = Join-Path $SourcePath "installer"
if (Test-Path $installerSrc) {
    Write-Log "Copying installer files..."
    $installerDest = Join-Path $OutputDir "installer"
    New-Item -ItemType Directory -Force -Path $installerDest | Out-Null
    & robocopy $installerSrc $installerDest /MIR /NFL /NDL /NJH /NJS /NC /NS /XF "README.md" "Prepare-StandaloneBuild.ps1" | Out-Null
}

Write-Log "Done. Standalone package ready at: $OutputDir"
