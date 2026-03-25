Param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",
    [string]$BuildOutput,
    [string]$OutputDir,
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

$scriptRoot = $PSScriptRoot
$serverRoot = Resolve-Path (Join-Path $scriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $serverRoot "..")
$serverProject = Join-Path $serverRoot "Vigitemp Serveur\VigitempServeur.csproj"
$installerProject = Join-Path $serverRoot "VigitempServerInstaller\VigitempServerInstaller.csproj"
$prereqInstallerProject = Join-Path $serverRoot "VigitempPrereqInstaller\VigitempPrereqInstaller.csproj"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $repoRoot "..\VigiSensys\2 - installation\1 - VigiSensys Serveur"
}

if (-not $SkipBuild) {
    if (-not (Test-Path $serverProject)) {
        throw "Projet serveur introuvable: $serverProject"
    }

    Write-Log "Build serveur ($Configuration)..."
    & dotnet build $serverProject -c $Configuration -nologo
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet build serveur a echoue (code $LASTEXITCODE)"
    }

    if (-not (Test-Path $installerProject)) {
        throw "Projet installeur serveur introuvable: $installerProject"
    }
    if (-not (Test-Path $prereqInstallerProject)) {
        throw "Projet installeur prerequis introuvable: $prereqInstallerProject"
    }

    Write-Log "Publish bootstrapper serveur ($Configuration)..."
    & dotnet publish $installerProject -c $Configuration -nologo
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet publish installeur serveur a echoue (code $LASTEXITCODE)"
    }

    Write-Log "Publish bootstrapper prerequis ($Configuration)..."
    & dotnet publish $prereqInstallerProject -c $Configuration -nologo
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet publish installeur prerequis a echoue (code $LASTEXITCODE)"
    }
}

if ([string]::IsNullOrWhiteSpace($BuildOutput)) {
    $BuildOutput = Join-Path $serverRoot "Vigitemp Serveur\bin\$Configuration"
}

$installerOutput = Join-Path $serverRoot "VigitempServerInstaller\bin\$Configuration\net8.0-windows\win-x64\publish\VigitempServerSetup.exe"
$prereqInstallerOutput = Join-Path $serverRoot "VigitempPrereqInstaller\bin\$Configuration\net8.0-windows\win-x64\publish\VigitempPrereqsSetup.exe"

$exePath = Join-Path $BuildOutput "Vigitemp Serveur.exe"
if (-not (Test-Path $exePath)) {
    Write-Error "Executable not found: $exePath"
}

Write-Log "Preparing server package: $OutputDir"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Log "Copying server build output..."
$BuildOutput = (Resolve-Path $BuildOutput).Path
$OutputDir = (Resolve-Path $OutputDir).Path
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
& robocopy @robocopyArgs | Out-Null
$rcCode = $LASTEXITCODE
Write-Log ("Robocopy exit code: {0}" -f $rcCode)
if ($rcCode -ge 8) {
    Write-Error ("Robocopy failed with exit code {0}" -f $rcCode)
}

if (Test-Path $installerOutput) {
    Copy-Item -Path $installerOutput -Destination (Join-Path $OutputDir "VigitempServerSetup.exe") -Force
    Write-Log "Bootstrapper serveur copie dans le package."
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
    & robocopy @installerArgs | Out-Null
    $rcInstallerCode = $LASTEXITCODE
    Write-Log ("Robocopy (installer) exit code: {0}" -f $rcInstallerCode)
    if ($rcInstallerCode -ge 8) {
        Write-Error ("Robocopy (installer) failed with exit code {0}" -f $rcInstallerCode)
    }

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
$seedDest = Join-Path $OutputDir "installer\db"
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

$prereqRoot = Join-Path $repoRoot "..\VigiSensys\1 - prerequis"
$prereqMySqlDir = Join-Path $prereqRoot "mysql"
$prereqVcDir = Join-Path $prereqRoot "vcredist"

Write-Log "Updating shared prerequisites folder (MySQL + VC++)..."
New-Item -ItemType Directory -Force -Path $prereqRoot | Out-Null
New-Item -ItemType Directory -Force -Path $prereqMySqlDir | Out-Null
New-Item -ItemType Directory -Force -Path $prereqVcDir | Out-Null

if (Test-Path $prereqInstallerOutput) {
    Copy-Item -Path $prereqInstallerOutput -Destination (Join-Path $prereqRoot "VigitempPrereqsSetup.exe") -Force
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

