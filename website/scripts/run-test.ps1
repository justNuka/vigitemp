param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

Push-Location (Split-Path -Parent $PSScriptRoot)

$env:NODE_ENV = "production"
$env:NEXT_PUBLIC_APP_URL = "https://test.vigitemp"

Write-Host "[test] build..."
npm run build

Write-Host "[test] start on port $Port (https://test.vigitemp via Caddy)"
npm run start -- -p $Port

