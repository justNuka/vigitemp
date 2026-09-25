$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$threadPath = Join-Path $repoRoot "Vigitemp Serveur\Vigitemp Serveur\ThreadServeur.cs"
$readerPath = Join-Path $repoRoot "Vigitemp Serveur\Vigitemp Serveur\GspPendingConfigurationReader.cs"
$projectPath = Join-Path $repoRoot "Vigitemp Serveur\Vigitemp Serveur\VigitempServeur.csproj"

$thread = Get-Content -Raw -LiteralPath $threadPath
$reader = Get-Content -Raw -LiteralPath $readerPath
$project = Get-Content -Raw -LiteralPath $projectPath
$errors = [System.Collections.Generic.List[string]]::new()

function Assert-Contains([string]$Content, [string]$Expected, [string]$Label) {
    if (-not $Content.Contains($Expected)) {
        $errors.Add("Missing: $Label")
    }
}

Assert-Contains $thread 'public bool ConfigurationOnly { get; set; }' 'configuration-only runtime flag'
Assert-Contains $thread '.Where(s => !s.InProgress && !s.ConfigurationOnly && IsScheduleDue(s, now))' 'normal probes exclude configuration-only schedules'
Assert-Contains $thread 'GspPendingConfigurationReader.GetPendingSchedules()' 'pending configuration discovery'
Assert-Contains $thread 'pending.ManualWorkerId = 1;' 'single worker ownership for configuration-only schedules'
Assert-Contains $thread 'if (!schedule.ConfigurationOnly && GetDatabase().isSondeInNoResponse' 'inactive configuration bypasses stale no-response state'
Assert-Contains $thread 'row.ConfigurationOnly || !row.GspRecoveryPending' 'configuration-only schedules never bootstrap MEMO recovery'
Assert-Contains $thread '!s.ConfigurationOnly &&' 'configuration-only schedules excluded from shared runtime collections'
Assert-Contains $thread '_sondeMetrologyCache.TryRemove(schedule.Serial, out _);' 'fresh metrology settings before/after config push'
Assert-Contains $reader 'AND NOT (l.Lieu_Etat = ''S'' AND s.Etat_Sonde = ''S'')' 'reader/eligibility separates inactive from active surveillance'
Assert-Contains $project '<Compile Include="GspPendingConfigurationReader.cs" />' 'reader compiled in server project'

Assert-Contains $reader 'Server = GetSetting("Vigi.Db.Host", "192.168.63.144")' 'MySQL helper default host aligned with provider'
Assert-Contains $reader 'Password = GetSetting("Vigi.Db.Password", "pass")' 'MySQL helper default password aligned with provider'
Assert-Contains $thread 'activeLieuIds.Add(pending.IdLieu);' 'configuration-only IdLieu deduplication'

$activeGuardCount = ([regex]::Matches($reader, [regex]::Escape("AND NOT (l.Lieu_Etat = 'S' AND s.Etat_Sonde = 'S')"))).Count
if ($activeGuardCount -lt 4) {
    $errors.Add("Expected inactive-surveillance guard in MySQL/MSSQL list + eligibility queries, got $activeGuardCount")
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "GSP configuration-before-surveillance contract OK"
