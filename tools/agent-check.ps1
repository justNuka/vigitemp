# Verification rapide de l'agent Vigitemp (process, port 8000, URLACL, pare-feu)
# Executer en admin pour un diagnostic complet.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Vérification Vigitemp Agent ===" -ForegroundColor Cyan

# Admin check
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "[WARN] Exécuter en administrateur pour voir URLACL et pare-feu." -ForegroundColor Yellow
}

# Process check
$agentProc = Get-Process -Name "VigitempAgent" -ErrorAction SilentlyContinue
if ($agentProc) {
  Write-Host "[OK] Processus VigitempAgent.exe en cours d'exécution." -ForegroundColor Green
  $agentProc | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize
} else {
  Write-Host "[KO] Processus VigitempAgent.exe introuvable." -ForegroundColor Red
}

# Port 8000 listening
try {
  $listening = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction Stop
  if ($listening) {
    Write-Host "[OK] Port 8000 en écoute." -ForegroundColor Green
    $listening | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table -AutoSize
  } else {
    Write-Host "[KO] Port 8000 pas en écoute." -ForegroundColor Red
  }
} catch {
  Write-Host "[INFO] Impossible de lire l'état du port (droits insuffisants ?)." -ForegroundColor Yellow
}

# URLACL
try {
  Write-Host "--- URLACL (netsh http show urlacl) ---" -ForegroundColor Cyan
  $urlacl = netsh http show urlacl | Out-String
  if ($urlacl -match "8000") {
    Write-Host "[OK] URLACL contient une entrée pour le port 8000." -ForegroundColor Green
  } else {
    Write-Host "[KO] Aucune URLACL detectee pour le port 8000." -ForegroundColor Red
  }
  Write-Host $urlacl
} catch {
  Write-Host "[INFO] Impossible de lire URLACL (droits insuffisants ?)." -ForegroundColor Yellow
}

# Firewall rules
try {
  Write-Host "--- Pare-feu (règles Vigitemp) ---" -ForegroundColor Cyan
  $rules = Get-NetFirewallRule -ErrorAction Stop | Where-Object { $_.DisplayName -like "Vigitemp*" }
  if ($rules) {
    Write-Host "[OK] règles pare-feu Vigitemp trouvées." -ForegroundColor Green
    $rules | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize

    # Details port
    foreach ($r in $rules) {
      $portFilter = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $r -ErrorAction SilentlyContinue
      if ($portFilter) {
        $portFilter | Select-Object LocalPort, Protocol | Format-Table -AutoSize
      }
    }
  } else {
    Write-Host "[KO] Aucune règle pare-feu Vigitemp détectée." -ForegroundColor Red
  }
} catch {
  Write-Host "[INFO] Impossible de lire les règles pare-feu (droits insuffisants ?)." -ForegroundColor Yellow
}

Write-Host "=== Fin diagnostic ===" -ForegroundColor Cyan
Write-Host "Appuyez sur Entrée pour fermer..." -ForegroundColor Yellow
[void](Read-Host)
