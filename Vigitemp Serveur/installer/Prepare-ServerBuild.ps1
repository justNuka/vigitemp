Param(
    [string]$BuildOutput,
    [string]$OutputDir
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
$serverRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $serverRoot "..")

if ([string]::IsNullOrWhiteSpace($BuildOutput)) {
    $releaseExe = Join-Path $serverRoot "Vigitemp Serveur\\bin\\Release\\Vigitemp Serveur.exe"
    $debugExe = Join-Path $serverRoot "Vigitemp Serveur\\bin\\Debug\\Vigitemp Serveur.exe"
    if ((Test-Path $releaseExe) -and (Test-Path $debugExe)) {
        $releaseTime = (Get-Item $releaseExe).LastWriteTime
        $debugTime = (Get-Item $debugExe).LastWriteTime
        if ($debugTime -gt $releaseTime) {
            $BuildOutput = Split-Path $debugExe -Parent
        } else {
            $BuildOutput = Split-Path $releaseExe -Parent
        }
    } elseif (Test-Path $releaseExe) {
        $BuildOutput = Split-Path $releaseExe -Parent
    } elseif (Test-Path $debugExe) {
        $BuildOutput = Split-Path $debugExe -Parent
    } else {
        $BuildOutput = Join-Path $serverRoot "Vigitemp Serveur\\bin\\Release"
    }
}
if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\\vigi\\2 - installation\\1 - serveur"
}

$exePath = Join-Path $BuildOutput "Vigitemp Serveur.exe"
if (-not (Test-Path $exePath)) {
    Write-Error "Executable not found: $exePath"
}

Write-Log "Preparing server package: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Log "Copying server build output..."
$BuildOutput = [IO.Path]::GetFullPath($BuildOutput.TrimEnd("\\")) + "\\"
$OutputDir = [IO.Path]::GetFullPath($OutputDir.TrimEnd("\\"))
Write-Log ("BuildOutput: {0}" -f $BuildOutput)
Write-Log ("OutputDir: {0}" -f $OutputDir)
$robocopyArgs = @(
    $BuildOutput,
    $OutputDir,
    "/MIR",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NC",
    "/NS"
)
$rc = & robocopy @robocopyArgs
$rcCode = $LASTEXITCODE
Write-Log ("Robocopy exit code: {0}" -f $rcCode)
if ($rcCode -ge 8) {
    Write-Error ("Robocopy failed with exit code {0}" -f $rcCode)
}

$installerSrc = Join-Path $serverRoot "installer"
if (Test-Path $installerSrc) {
    Write-Log "Copying installer files (without PowerShell/dependency installers)..."
    $installerDest = Join-Path $OutputDir "installer"
    $installerArgs = @(
        $installerSrc,
        $installerDest,
        "/MIR",
        "/NFL",
        "/NDL",
        "/NJH",
        "/NJS",
        "/NC",
        "/NS",
        "/XF",
        "README.md",
        "Prepare-ServerBuild.ps1"
    )
    $rcInstaller = & robocopy @installerArgs
    $rcInstallerCode = $LASTEXITCODE
    Write-Log ("Robocopy (installer) exit code: {0}" -f $rcInstallerCode)
    if ($rcInstallerCode -ge 8) {
        Write-Error ("Robocopy (installer) failed with exit code {0}" -f $rcInstallerCode)
    }

    # Remove local install scripts/dependency installers from 1 - serveur package.
    Get-ChildItem -Path $installerDest -Recurse -File -Include *.ps1,*.msi,*.exe -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { $_.Delete() } catch { }
        }

    $prereqsDest = Join-Path $installerDest "prereqs"
    New-Item -ItemType Directory -Force -Path $prereqsDest | Out-Null
    $mysqlMsi = Join-Path $installerDest "mysql-8.4.7-winx64.msi"
    if (Test-Path $mysqlMsi) {
        Move-Item -Path $mysqlMsi -Destination (Join-Path $prereqsDest "mysql-8.4.7-winx64.msi") -Force
    }
    $vcRedist = Join-Path $installerDest "VC_redist.x64.exe"
    if (Test-Path $vcRedist) {
        Move-Item -Path $vcRedist -Destination (Join-Path $prereqsDest "VC_redist.x64.exe") -Force
    }
}

 $seedSrc = Join-Path $repoRoot "db"
 $seedDest = Join-Path $OutputDir "installer\\db"
 if (Test-Path $seedSrc) {
     $mainSeed = Join-Path $seedSrc "vigi_main_seed.sql"
     $mesuresSeed = Join-Path $seedSrc "vigi_mesures_seed.sql"
     if ((Test-Path $mainSeed) -and (Test-Path $mesuresSeed)) {
         Write-Log "Copying database seeds..."
         New-Item -ItemType Directory -Force -Path $seedDest | Out-Null
         Copy-Item -Path $mainSeed -Destination $seedDest -Force
         Copy-Item -Path $mesuresSeed -Destination $seedDest -Force
     } else {
         Write-Log "Database seeds not found in $seedSrc (expected vigi_main_seed.sql and vigi_mesures_seed.sql)."
     }
 }


$prereqRoot = Join-Path $repoRoot "..\\vigi\\1 - prerequis"
$prereqInstallDir = Join-Path $prereqRoot "install"
$prereqMySqlDir = Join-Path $prereqRoot "mysql"
$prereqVcDir = Join-Path $prereqRoot "vcredist"

Write-Log "Updating shared prerequisites folder (MySQL + VC++)..."
New-Item -ItemType Directory -Force -Path $prereqInstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $prereqMySqlDir | Out-Null
New-Item -ItemType Directory -Force -Path $prereqVcDir | Out-Null

$installDepsScript = Join-Path $installerSrc "Install-MySQL-And-VCredist.ps1"
if (Test-Path $installDepsScript) {
    Copy-Item -Path $installDepsScript -Destination (Join-Path $prereqInstallDir "Install-MySQL-And-VCredist.ps1") -Force
}

$mysqlInstallerSource = Join-Path $installerSrc "mysql-8.4.7-winx64.msi"
if (Test-Path $mysqlInstallerSource) {
    Copy-Item -Path $mysqlInstallerSource -Destination (Join-Path $prereqMySqlDir "mysql-8.4.7-winx64.msi") -Force
}

$vcInstallerSource = Join-Path $installerSrc "VC_redist.x64.exe"
if (Test-Path $vcInstallerSource) {
    Copy-Item -Path $vcInstallerSource -Destination (Join-Path $prereqVcDir "VC_redist.x64.exe") -Force
}

Write-Log "Done. Package ready at: $OutputDir"




