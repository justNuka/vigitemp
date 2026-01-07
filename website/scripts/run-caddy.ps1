param(
  [string]$CaddyExe = "caddy.exe",
  [string]$ConfigPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "Caddyfile")
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command $CaddyExe -ErrorAction SilentlyContinue)) {
  throw "Caddy not found: '$CaddyExe'. Install Caddy and/or pass -CaddyExe 'C:\\path\\to\\caddy.exe'."
}

Write-Host "[caddy] using config: $ConfigPath"
& $CaddyExe run --config $ConfigPath

