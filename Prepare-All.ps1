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
        & $ScriptPath @Arguments | Out-Host
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

$serverArgs = @{ Configuration = "Release" }
if (-not [string]::IsNullOrWhiteSpace($ServerBuildOutput)) { $serverArgs.BuildOutput = $ServerBuildOutput }
if (-not [string]::IsNullOrWhiteSpace($ServerOutputDir)) { $serverArgs.OutputDir = $ServerOutputDir }
if ($SkipServerBuild) { $serverArgs.SkipBuild = $true }
if ($Only -eq "All" -or $Only -eq "Server") {
    $results += Invoke-PrepStep -Name "Serveur" -ScriptPath $serverPrep -Arguments $serverArgs
}

$agentArgs = @{ Configuration = "Release" }
if (-not [string]::IsNullOrWhiteSpace($AgentBuildOutput)) { $agentArgs.AgentBuildOutput = $AgentBuildOutput }
if (-not [string]::IsNullOrWhiteSpace($AgentOutputDir)) { $agentArgs.OutputDir = $AgentOutputDir }
if ($SkipAgentBuild) { $agentArgs.SkipBuild = $true }
if ($Only -eq "All" -or $Only -eq "Agent") {
    $results += Invoke-PrepStep -Name "Agent" -ScriptPath $agentPrep -Arguments $agentArgs
}

Write-Banner "Resume"
$results | Format-Table -AutoSize | Out-String | Write-Host

$hasFail = $results | Where-Object { $_.Status -eq "FAIL" }
if ($hasFail) {
    Write-Host "Une ou plusieurs etapes ont echoue." -ForegroundColor Red
    exit 1
}

Write-Host "Toutes les etapes sont de preparation terminees avec succes." -ForegroundColor Green


