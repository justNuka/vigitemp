# Reparation URLACL + regles pare-feu Vigitemp Agent (port 8000)
# Executer en administrateur.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Réparation Vigitemp Agent ===" -ForegroundColor Cyan

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "[KO] Ce script doit être exécuté en administrateur." -ForegroundColor Red
  Write-Host "Appuyez sur Entrée pour fermer..." -ForegroundColor Yellow
  [void](Read-Host)
  exit 1
}

# Detecter IP locale (premiere IPv4 non loopback)
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress
if (-not $localIp) { $localIp = '127.0.0.1' }

$serverIp = Read-Host "IP du serveur autorisée (Entrée = IP locale $localIp)"
if ([string]::IsNullOrWhiteSpace($serverIp)) { $serverIp = $localIp }

Write-Host "[INFO] IP locale: $localIp" -ForegroundColor Cyan
Write-Host "[INFO] IP serveur: $serverIp" -ForegroundColor Cyan

# URLACL
Write-Host "--- URLACL ---" -ForegroundColor Cyan
netsh http delete urlacl url="http://$localIp:8000/" | Out-Null
netsh http delete urlacl url="http://127.0.0.1:8000/" | Out-Null
netsh http delete urlacl url="http://+:8000/" | Out-Null

netsh http add urlacl url="http://$localIp:8000/" user="Tout le monde" | Out-Null
netsh http add urlacl url="http://127.0.0.1:8000/" user="Tout le monde" | Out-Null

Write-Host "[OK] URLACL ajoutées pour $localIp et 127.0.0.1" -ForegroundColor Green

# Pare-feu
Write-Host "--- Pare-feu ---" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "Vigitemp receive from server" -ErrorAction SilentlyContinue | Remove-NetFirewallRule | Out-Null
Get-NetFirewallRule -DisplayName "Vigitemp send to server" -ErrorAction SilentlyContinue | Remove-NetFirewallRule | Out-Null

New-NetFirewallRule -DisplayName "Vigitemp receive from server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 -RemoteAddress $serverIp | Out-Null
New-NetFirewallRule -DisplayName "Vigitemp send to server" -Direction Outbound -Action Allow -Protocol TCP -LocalPort 8000 -RemoteAddress $serverIp | Out-Null

Write-Host "[OK] règles pare-feu créées pour le port 8000 (serveur: $serverIp)" -ForegroundColor Green

Write-Host "=== Fin réparation ===" -ForegroundColor Cyan
Write-Host "Appuyez sur Entrée pour fermer..." -ForegroundColor Yellow
[void](Read-Host)
