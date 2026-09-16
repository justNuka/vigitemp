$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$alarmPath = Join-Path $repoRoot "Vigitemp Serveur\Vigitemp Serveur\AlarmWebNotifier.cs"
$guiInstallerPath = Join-Path $repoRoot "Vigitemp Serveur\VigitempServerInstaller\MainForm.cs"
$psInstallerPath = Join-Path $repoRoot "Vigitemp Serveur\installer\Install-VigitempServer.ps1"

$alarm = Get-Content -Raw -LiteralPath $alarmPath
$gui = Get-Content -Raw -LiteralPath $guiInstallerPath
$installer = Get-Content -Raw -LiteralPath $psInstallerPath

$errors = [System.Collections.Generic.List[string]]::new()
function Assert-Contains([string]$Content, [string]$Expected, [string]$Label) {
    if (-not $Content.Contains($Expected)) { $errors.Add("Missing: $Label") }
}

Assert-Contains $alarm 'private static string BaseUrl => NormalizeBaseUrl(RawBaseUrl);' 'runtime base URL normalization'
Assert-Contains $alarm 'normalized = "http://" + normalized;' 'legacy host:port fallback'
Assert-Contains $alarm 'Uri.TryCreate(normalized, UriKind.Absolute' 'runtime absolute URI validation'
Assert-Contains $alarm 'issue=invalid-base-url' 'runtime invalid URL diagnostic'
Assert-Contains $gui 'TryNormalizeWebsiteBaseUrl' 'GUI installer URL normalizer'
Assert-Contains $gui 'candidate = "http://" + candidate;' 'GUI installer adds http scheme'
Assert-Contains $gui 'URL HTTP/HTTPS valide' 'GUI installer validation message'
Assert-Contains $installer 'function Normalize-WebsiteBaseUrl' 'PowerShell installer URL normalizer'
Assert-Contains $installer '$candidate = "http://$candidate"' 'PowerShell installer adds http scheme'
Assert-Contains $installer '$websiteBaseUrl = Normalize-WebsiteBaseUrl' 'PowerShell installer uses normalized URL'

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host "Alarm web base URL contract OK"
