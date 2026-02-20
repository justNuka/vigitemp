Param(
    [string]$WebSourcePath,
    [string]$WebOutputDir,
    [switch]$SkipWebInstall,
    [switch]$SkipWebApproveBuilds,
    [switch]$SkipWebGenerate,
    [switch]$SkipWebBuild,

    [string]$ServerBuildOutput,
    [string]$ServerOutputDir,
    [switch]$SkipServerBuild,

    [string]$AgentBuildOutput,
    [string]$AgentMsiPath,
    [string]$AgentOutputDir,
    [switch]$SkipAgentBuild,

    [ValidateSet("All", "Website", "Server", "Agent")][string]$Only = "All"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"


# Force UTF-8 console encoding for correct accents/special characters in logs.
try { cmd /c chcp 65001 > $null } catch { }
try {
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch { }$scriptRoot = $PSScriptRoot
$webPrep = Join-Path $scriptRoot "website\installer\Prepare-StandaloneBuild.ps1"
$serverPrep = Join-Path $scriptRoot "Vigitemp Serveur\installer\Prepare-ServerBuild.ps1"
$agentPrep = Join-Path $scriptRoot "Vigitemp agent\installer\Prepare-AgentBuild.ps1"

$serverProject = Join-Path $scriptRoot "Vigitemp Serveur\Vigitemp Serveur\VigitempServeur.csproj"
$agentProject = Join-Path $scriptRoot "Vigitemp agent\Vigitemp agent\Vigitemp Agent.csproj"
$agentWixBuild = Join-Path $scriptRoot "Vigitemp agent\installer\wix\build-msi.ps1"

function Write-Banner([string]$title) {
    $line = "=" * 72
    Write-Host "`n$line" -ForegroundColor DarkGray
    Write-Host $title -ForegroundColor Cyan
    Write-Host $line -ForegroundColor DarkGray
}

function Write-Step([string]$text) {
    Write-Host "[RUN] $text" -ForegroundColor Yellow
}

function Write-StepOk([string]$text) {
    Write-Host "[OK] $text" -ForegroundColor Green
}

function Write-StepFail([string]$text) {
    Write-Host "[FAIL] $text" -ForegroundColor Red
}

function Invoke-PrepStep {
    Param(
        [string]$Name,
        [string]$ScriptPath,
        [hashtable]$Arguments
    )

    if (-not (Test-Path $ScriptPath)) {
        throw "Script introuvable: $ScriptPath"
    }

    Write-Step "$Name"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        & $ScriptPath @Arguments
        $sw.Stop()
        Write-StepOk ("{0} termine en {1:n1}s" -f $Name, $sw.Elapsed.TotalSeconds)
        return [pscustomobject]@{ Name = $Name; Status = "OK"; Seconds = [math]::Round($sw.Elapsed.TotalSeconds, 1) }
    }
    catch {
        $sw.Stop()
        Write-StepFail ("{0} en erreur apres {1:n1}s" -f $Name, $sw.Elapsed.TotalSeconds)
        Write-Host $_.Exception.Message -ForegroundColor Red
        return [pscustomobject]@{ Name = $Name; Status = "FAIL"; Seconds = [math]::Round($sw.Elapsed.TotalSeconds, 1) }
    }
}

function Invoke-CommandStep {
    Param(
        [string]$Name,
        [scriptblock]$Command
    )

    Write-Step "$Name"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        & $Command | Out-Host
        $sw.Stop()
        Write-StepOk ("{0} termine en {1:n1}s" -f $Name, $sw.Elapsed.TotalSeconds)
        return [pscustomobject]@{ Name = $Name; Status = "OK"; Seconds = [math]::Round($sw.Elapsed.TotalSeconds, 1) }
    }
    catch {
        $sw.Stop()
        Write-StepFail ("{0} en erreur apres {1:n1}s" -f $Name, $sw.Elapsed.TotalSeconds)
        Write-Host $_.Exception.Message -ForegroundColor Red
        return [pscustomobject]@{ Name = $Name; Status = "FAIL"; Seconds = [math]::Round($sw.Elapsed.TotalSeconds, 1) }
    }
}

Write-Banner "Preparation offline complete (serveur, site web, agent)"

$results = @()

$webArgs = @{}
if (-not [string]::IsNullOrWhiteSpace($WebSourcePath)) { $webArgs.SourcePath = $WebSourcePath }
if (-not [string]::IsNullOrWhiteSpace($WebOutputDir)) { $webArgs.OutputDir = $WebOutputDir }
if ($SkipWebInstall) { $webArgs.SkipInstall = $true }
if ($SkipWebApproveBuilds) { $webArgs.SkipApproveBuilds = $true }
if ($SkipWebGenerate) { $webArgs.SkipGenerate = $true }
if ($SkipWebBuild) { $webArgs.SkipBuild = $true }
if ($Only -eq "All" -or $Only -eq "Website") {
    $results += Invoke-PrepStep -Name "Website" -ScriptPath $webPrep -Arguments $webArgs
}

$serverBuildResult = $null
if (($Only -eq "All" -or $Only -eq "Server") -and -not $SkipServerBuild) {
    $serverBuildResult = Invoke-CommandStep -Name "Build Serveur (Release)" -Command {
        if (-not (Test-Path $serverProject)) {
            throw "Projet serveur introuvable: $serverProject"
        }
        & dotnet build $serverProject -c Release -nologo
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet build serveur a echoue (code $LASTEXITCODE)"
        }
    }
    $results += $serverBuildResult
}

$serverArgs = @{}
if (-not [string]::IsNullOrWhiteSpace($ServerBuildOutput)) { $serverArgs.BuildOutput = $ServerBuildOutput }
if (-not [string]::IsNullOrWhiteSpace($ServerOutputDir)) { $serverArgs.OutputDir = $ServerOutputDir }
$canPrepareServer = ($Only -eq "All" -or $Only -eq "Server") -and ($SkipServerBuild -or $null -eq $serverBuildResult -or $serverBuildResult.Status -eq "OK")
if ($canPrepareServer) {
    $results += Invoke-PrepStep -Name "Serveur" -ScriptPath $serverPrep -Arguments $serverArgs
} elseif ($Only -eq "All" -or $Only -eq "Server") {
    Write-StepFail "Serveur saute (build Release en echec)"
}

$agentBuildResult = $null
if (($Only -eq "All" -or $Only -eq "Agent") -and -not $SkipAgentBuild) {
    $agentBuildResult = Invoke-CommandStep -Name "Build Agent (Release)" -Command {
        if (-not (Test-Path $agentProject)) {
            throw "Projet agent introuvable: $agentProject"
        }

        & dotnet build $agentProject -c Release -nologo /p:GenerateManifests=false
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet build agent a echoue (code $LASTEXITCODE)"
        }

        if (-not (Test-Path $agentWixBuild)) {
            throw "Script WiX introuvable: $agentWixBuild"
        }

        & $agentWixBuild -Configuration Release
        if ($LASTEXITCODE -ne 0) {
            throw "build MSI agent a echoue (code $LASTEXITCODE)"
        }
    }
    $results += $agentBuildResult
}

$agentArgs = @{}
if (-not [string]::IsNullOrWhiteSpace($AgentBuildOutput)) { $agentArgs.AgentBuildOutput = $AgentBuildOutput }
if (-not [string]::IsNullOrWhiteSpace($AgentMsiPath)) { $agentArgs.MsiPath = $AgentMsiPath }
if (-not [string]::IsNullOrWhiteSpace($AgentOutputDir)) { $agentArgs.OutputDir = $AgentOutputDir }
$canPrepareAgent = ($Only -eq "All" -or $Only -eq "Agent") -and ($SkipAgentBuild -or $null -eq $agentBuildResult -or $agentBuildResult.Status -eq "OK")
if ($canPrepareAgent) {
    $results += Invoke-PrepStep -Name "Agent" -ScriptPath $agentPrep -Arguments $agentArgs
} elseif ($Only -eq "All" -or $Only -eq "Agent") {
    Write-StepFail "Agent saute (build Release en echec)"
}

Write-Banner "Resume"
$results | Format-Table -AutoSize | Out-String | Write-Host

$hasFail = $results | Where-Object { $_.Status -eq "FAIL" }
if ($hasFail) {
    Write-Host "Une ou plusieurs etapes ont echoue." -ForegroundColor Red
    exit 1
}

Write-Host "Toutes les etapes sont terminees avec succes." -ForegroundColor Green

