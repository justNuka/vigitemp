param(
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

Push-Location (Split-Path -Parent $PSScriptRoot)

$env:NODE_ENV = "development"
$env:NEXT_PUBLIC_APP_URL = "https://dev.vigitemp"

Write-Host "[dev] next dev on port $Port (https://dev.vigitemp via Caddy)"
npm run dev -- -p $Port

