param(
    [string]$EnvPath = ".env.production",
    [string]$BaseUrl = "",
    [switch]$Disable
)

$ErrorActionPreference = "Stop"

function New-BetterAuthSecret([int]$byteLength = 32) {
    $bytes = New-Object byte[] $byteLength
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }

    return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Unquote-EnvValue([string]$value) {
    $trimmed = $value.Trim()
    if ($trimmed.Length -ge 2) {
        if (
            ($trimmed.StartsWith('"') -and $trimmed.EndsWith('"')) -or
            ($trimmed.StartsWith("'") -and $trimmed.EndsWith("'"))
        ) {
            return $trimmed.Substring(1, $trimmed.Length - 2)
        }
    }
    return $trimmed
}

function Get-EnvValue([System.Collections.Generic.List[string]]$lines, [string]$key) {
    $pattern = "^\s*" + [regex]::Escape($key) + "\s*=\s*(.*)$"
    foreach ($line in $lines) {
        $match = [regex]::Match($line, $pattern)
        if ($match.Success) {
            return Unquote-EnvValue $match.Groups[1].Value
        }
    }
    return $null
}

function Set-EnvValue(
    [System.Collections.Generic.List[string]]$lines,
    [string]$key,
    [string]$value
) {
    $pattern = "^\s*" + [regex]::Escape($key) + "\s*="
    $replacement = "$key=$value"

    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ([regex]::IsMatch($lines[$index], $pattern)) {
            $lines[$index] = $replacement
            return
        }
    }

    $lines.Add($replacement)
}

$resolvedEnvPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EnvPath)
if (-not (Test-Path $resolvedEnvPath)) {
    throw "Fichier env introuvable : $resolvedEnvPath"
}

$lines = [System.Collections.Generic.List[string]]::new()
foreach ($line in [System.IO.File]::ReadAllLines($resolvedEnvPath)) {
    $lines.Add($line)
}

if ($Disable) {
    Set-EnvValue $lines "BETTER_AUTH_ENABLED" "false"
    Set-EnvValue $lines "BETTER_AUTH_PUBLIC_API_ENABLED" "false"
    [System.IO.File]::WriteAllLines($resolvedEnvPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Better Auth désactivé dans $resolvedEnvPath"
    exit 0
}

$existingSecret = Get-EnvValue $lines "BETTER_AUTH_SECRET"
if ([string]::IsNullOrWhiteSpace($existingSecret) -or $existingSecret.Length -lt 32) {
    $existingSecret = New-BetterAuthSecret
}

Set-EnvValue $lines "BETTER_AUTH_ENABLED" "true"
Set-EnvValue $lines "BETTER_AUTH_PUBLIC_API_ENABLED" "false"
Set-EnvValue $lines "BETTER_AUTH_SECRET" "`"$existingSecret`""

if (-not [string]::IsNullOrWhiteSpace($BaseUrl)) {
    try {
        $uri = [Uri]$BaseUrl.Trim()
    } catch {
        throw "BaseUrl invalide : $BaseUrl"
    }

    if ($uri.Scheme -notin @("http", "https")) {
        throw "BaseUrl doit utiliser http ou https."
    }

    $origin = "{0}://{1}" -f $uri.Scheme, $uri.Authority
    Set-EnvValue $lines "BETTER_AUTH_URL" "`"$origin`""
}

[System.IO.File]::WriteAllLines($resolvedEnvPath, $lines, [System.Text.UTF8Encoding]::new($false))

Write-Host "Better Auth activé dans $resolvedEnvPath"
Write-Host "BETTER_AUTH_PUBLIC_API_ENABLED reste désactivé pendant la transition."
Write-Host "Le secret a été généré/conservé sans être affiché. Redémarrez le service Web."
