# Installation client (dossier `vigi`)

Ce guide part du principe que tout le contenu est dans un dossier `vigi` copie sur une cle USB.

## Structure attendue

```
vigi/
  build/
    server-offline/
    website-standalone/
  licence/
  public_key/
```

## 1) Installation serveur (C# + MySQL)

1. Lancer `Install-MySQL-And-VCredist.ps1` (dans `build/server-offline/installer`).
2. Le configurateur MySQL s'ouvre : terminer la configuration.
3. Revenir dans le terminal et appuyer sur Entree pour importer les bases `vigi_main` et `vigi_mesures`.
4. Lancer `Install-VigitempServer.ps1`.

Champs importants :
- URL du site web
- Type de BDD (mysql/mssql)
- identifiants DB
- fichier licence `.vtlic`
- cle publique `.pem`

## 2) Installation serveur web (Next.js)

1. Lancer `Install-Node.ps1` (dans `build/website-standalone/installer`).
2. Lancer `Install-VigitempWeb.ps1`.

Champs importants :
- URL publique (IP de la machine si acces reseau)
- type de BDD et identifiants
- chemins de logs

## 3) Verification

### Services
```
Get-Service VigitempServeur
Get-Service VigitempWeb
```

### Logs
- Serveur : `C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log`
- Web : `C:\ProgramData\Vigitemp\website\VigitempWeb.err.log`

### Acces
- Local : `http://localhost:3000`
- Reseau : `http://<IP_MACHINE>:3000`

Pour ouvrir le port sur Windows :
```
New-NetFirewallRule -DisplayName "Vigitemp Web" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## 4) Desinstallation
- `build/server-offline/installer/Uninstall-VigitempServer.ps1`
- `build/website-standalone/installer/Uninstall-VigitempWeb.ps1`

## Notes
- Les installs sont prevues pour fonctionner offline.
- Ne pas modifier les fichiers generes a la main, preferer les scripts.
