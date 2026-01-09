# HTTPS local + domaines dev/test (Windows)

Objectif : 2 instances sur une machine avec HTTPS + hostnames.

- https://test.vigitemp -> prod-like (`next start`)
- https://dev.vigitemp  -> dev (`next dev`)

TLS via Caddy, proxy vers Next en HTTP.

## 1) Prérequis
- Node.js + npm
- `website/` installé
- Caddy installé (recommandé)

## 2) Démarrer Next
Dans `website/` :

- Test (build + start) :
  - `powershell -ExecutionPolicy Bypass -File .\scripts\run-test.ps1`
- Dev :
  - `powershell -ExecutionPolicy Bypass -File .\scripts\run-dev.ps1`

Par défaut :
- test -> 127.0.0.1:3000
- dev  -> 127.0.0.1:3001

## 3) Lancer Caddy
Config : `website/Caddyfile`

- `powershell -ExecutionPolicy Bypass -File .\scripts\run-caddy.ps1`

Puis ouvrir :
- `https://test.vigitemp`
- `https://dev.vigitemp`

## 4) Hosts (serveur + clients)
Fichier : `C:\Windows\System32\drivers\etc\hosts`

Ajouter (adapter l’IP) :
```
192.168.63.144  test.vigitemp
192.168.63.144  dev.vigitemp
```

## 5) Certificat
Caddy utilise `tls internal`.

1) Récupérer le root cert :
   - `C:\Users\<user>\AppData\Roaming\Caddy\pki\authorities\local\root.crt`
2) Copier sur la machine cliente.
3) Importer dans Windows :
   - `certmgr.msc` (user) ou `mmc` (computer)
   - Trusted Root Certification Authorities -> Certificates -> Import

## 6) Variables d’env
Les scripts définissent :
- `NEXT_PUBLIC_APP_URL`

Les cookies sont Secure uniquement si HTTPS est détecté via `x-forwarded-proto`.
