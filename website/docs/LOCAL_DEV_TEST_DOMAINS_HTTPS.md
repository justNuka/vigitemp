# HTTPS local + domaines `dev.vigitemp` / `test.vigitemp` (Windows)

Objectif : faire tourner **2 instances** de l’app sur **une seule machine** (LAN), avec un “visuel prod” (HTTPS + noms de domaine) :

- `https://test.vigitemp` → instance “prod-like” (`next start`)
- `https://dev.vigitemp` → instance dev (`next dev`)

On termine TLS via un reverse proxy (Caddy), puis on reverse-proxy vers Next en HTTP local.

## 1) Prérequis

- Node.js + npm installés
- Le repo `website/` déjà installé (`npm install`)
- Caddy installé (recommandé) : https://caddyserver.com/

## 2) Démarrer les 2 instances Next

Dans un terminal PowerShell (dans `website/`) :

- Instance “test” (build + start) :
  - `powershell -ExecutionPolicy Bypass -File .\\scripts\\run-test.ps1`
- Instance “dev” :
  - `powershell -ExecutionPolicy Bypass -File .\\scripts\\run-dev.ps1`

Par défaut :
- test écoute en local sur `127.0.0.1:3000`
- dev écoute en local sur `127.0.0.1:3001`

## 3) Lancer Caddy (HTTPS + hostnames)

Le fichier de config est `website/Caddyfile`.

Lancer Caddy :
- `powershell -ExecutionPolicy Bypass -File .\\scripts\\run-caddy.ps1`

Ensuite :
- ouvrir `https://test.vigitemp`
- ouvrir `https://dev.vigitemp`

## 4) Résolution DNS (hosts) — machine serveur ET machines clientes

Sur **la machine qui héberge** l’app + sur **chaque machine cliente**, ajouter dans le fichier hosts :

- Fichier : `C:\\Windows\\System32\\drivers\\etc\\hosts`
- Ajouter (adapter l’IP) :

```
192.168.63.144  test.vigitemp
192.168.63.144  dev.vigitemp
```

Important :
- Sur la machine hôte, l’IP doit être son IP LAN (pas 127.0.0.1) si tu veux que d’autres machines y accèdent.

## 5) Faire “trust” le certificat (pour éviter l’alerte navigateur)

Comme on utilise `tls internal`, Caddy génère un CA local. Pour éviter l’alerte :

1) Récupérer le certificat racine Caddy sur la machine hôte (chemin typique) :
   - `C:\\Users\\<user>\\AppData\\Roaming\\Caddy\\pki\\authorities\\local\\root.crt`
2) Copier `root.crt` sur la machine cliente.
3) Importer dans Windows :
   - `certmgr.msc` (utilisateur) ou `mmc` + snap-in (ordinateur)
   - `Trusted Root Certification Authorities` → `Certificates` → Importer `root.crt`
4) Redémarrer le navigateur.

## 6) Variables d’environnement importantes

Les scripts définissent :

- `NEXT_PUBLIC_APP_URL` :
  - dev : `https://dev.vigitemp`
  - test : `https://test.vigitemp`

Le cookie d’auth est configuré pour être `Secure` uniquement si la requête arrive en HTTPS (détecté via `x-forwarded-proto` du reverse proxy).

## 7) Notes / pièges courants

- Si tu accèdes en HTTP (ou si ton proxy ne met pas `x-forwarded-proto: https`), tu peux te retrouver en boucle sur `/login` (cookie `Secure` non stocké). Avec Caddy en TLS, tu es en HTTPS.
- Pour Next dev, le warning `allowedDevOrigins` doit inclure `dev.vigitemp` / `https://dev.vigitemp` : c’est déjà listé dans `website/next.config.js`.

