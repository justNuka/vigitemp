# Installation A a Z (serveur C# + web)

Ce guide couvre la preparation offline, l'installation chez le client et les verifications de services.

## Prerequis
- PowerShell en administrateur.
- Windows Server ou Windows 10/11.
- Node.js LTS installe (pour le build web sur la machine de preparation).
- Node.js LTS installe sur la machine client si vous lancez l'installateur web (offline ou online).
- Acces au serveur BDD (MySQL ou MSSQL deja installe).
- Fichier de licence `.vtlic` + cle publique `.pem`.

## 1) Preparation offline (machine connectee)

### Option rapide (tout en une commande)
Depuis la racine du repo :
```powershell
.\Prepare-All.ps1
```

Le script affiche l'avancement en temps reel et prepare :
- `vigi\\2 - installation\1 - serveur`
- `vigi\\2 - installation\2 - site web`
- `vigi\\2 - installation\3 - agent`
- `vigi\\1 - prerequis\...`

### Option detaillee

### 1.1 Build du site web (standalone)
Dans `website/installer/` :
```powershell
.\Prepare-StandaloneBuild.ps1
```

Le package est genere dans :
```
vigi\\2 - installation\2 - site web\
```

Contient :
- `.next/standalone`
- `.next/static`
- `installer/` (Install-VigitempWeb.ps1 + winsw.exe)

### 1.2 Build du serveur C#
Compiler la solution sur la machine de dev (Release conseille).
Copier ensuite le dossier de build qui contient :
- `Vigitemp Serveur.exe`
- `Vigitemp Serveur.exe.config`

### 1.3 Preparer la cle USB

En plus des dossiers d'installation, les scripts de preparation remplissent aussi :
```
vigi\\1 - prerequis\
```

Contenu :
- `install\Install-Node.ps1`
- `install\Install-MySQL-And-VCredist.ps1`
- `node\node-vX.Y.Z-x64.msi` (version variable selon le package prepare)
- `mysql\mysql-8.4.7-winx64.msi`
- `vcredist\VC_redist.x64.exe`

Copier sur une cle USB :
```
vigi\2 - installation\1 - serveur\
vigi\2 - installation\2 - site web\
vigi\2 - installation\3 - agent\
vigi\1 - prerequis\
```

## 2) Installation serveur C# (client)
Dans le dossier `vigi\2 - installation\1 - serveur\installer` :
```powershell
.\Install-VigitempServer.ps1
```

Le script demande :
- chemin du build serveur
- infos BDD (host, port, user, password, nom des bases)
- URL publique du site
- choix du provider BDD (mysql ou mssql)
- fichier de licence + cle publique
- secret de dispatch alarmes (partage avec le web)

Chemins utiles apres install :
- `C:\ProgramData\Vigitemp\server`
- `C:\ProgramData\Vigitemp\licenses\`
- `C:\ProgramData\Vigitemp\license_keys\`
- logs : `C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log`

## 3) Installation web (client)
Dans le dossier `vigi\\2 - installation\2 - site web\installer` :
```powershell
.\Install-VigitempWeb.ps1
```

Le script demande :
- dossier d'installation
- port HTTP
- URL publique du site
- infos BDD (host, port, user, password, nom des bases)
- choix du provider BDD (mysql ou mssql)
- cache TTL
- secret de dispatch alarmes (partage avec le serveur C#)

Note : en mode offline complet, le script a besoin de `node.exe`. Assurez-vous que Node.js est
dans le PATH ou utilisez l'option `-NodePath` pour indiquer le chemin complet.

## 3.1 Secret commun serveur/web (obligatoire)
Le serveur C# et le site web doivent utiliser le meme secret pour l'appel `POST /api/alarmes/dispatch`.

Par defaut, les 2 scripts utilisent ce fichier partage :
`C:\ProgramData\Vigitemp\shared-secrets\alarm-dispatch-secret.txt`

Comportement des installateurs :
- si `-AlarmDispatchSecret` est fourni : ce secret est utilise.
- sinon si `-AlarmDispatchSecretFile` existe : le secret est lu depuis ce fichier.
- sinon : le script peut demander la saisie (mode interactif), ou generer un secret automatiquement.
- dans tous les cas : le secret est sauvegarde dans le fichier partage.

Sur 2 machines differentes :
1. lancer le 1er installateur avec `-AlarmDispatchSecretFile "C:\Temp\alarm-dispatch-secret.txt"`
2. copier ce fichier sur l'autre machine
3. lancer l'autre installateur avec le meme parametre `-AlarmDispatchSecretFile`

Variables/elements ecrits :
- web `.env` : `VIGITEMP_ALARM_DISPATCH_SECRET` (et compat `VIGITEMP_SURVEILLANCE_DISPATCH_SECRET`)
- web `.env` : `VIGITEMP_EMAIL_TIMEZONE` (et `TZ`) depuis le setup web, etape `Parametres avances` (defaut `Europe/Paris`)
- serveur C# `.config` : `Vigi.AlarmDispatchSecret`

Chemins utiles apres install :
- `C:\ProgramData\Vigitemp\website`
- `.env.production` dans le dossier d'installation
- logs installer : `C:\ProgramData\Vigitemp\install-logs\install-web-*.log`
- logs service : `C:\ProgramData\Vigitemp\website\VigitempWeb*.log`

## 4) Verification des services

### 4.1 Verification C#
```powershell
Get-Service VigitempServeur
Get-Content "C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log" -Tail 50
```

### 4.2 Verification web
```powershell
Get-Service VigitempWeb
curl http://localhost:3000
```

### 4.3 Evenements systeme (optionnel)
```powershell
Get-WinEvent -LogName System -MaxEvents 20 |
  Where-Object { $_.ProviderName -eq "Service Control Manager" } |
  Select-Object -First 10 | Format-List
```

## 5) Arret / suppression des services (test)
```powershell
sc.exe stop VigitempServeur
sc.exe delete VigitempServeur
sc.exe stop VigitempWeb
sc.exe delete VigitempWeb
```

## 6) Depannage rapide
- Service C# ne demarre pas : verifier `vigitemp-serveur.log` (licence invalide, BDD inaccesible, config).
- Service web ne demarre pas : verifier `VigitempWeb.err.log` dans `C:\ProgramData\Vigitemp\website`.
- Mauvais encodage dans les logs : relancer les services, verifier que les fichiers de logs sont bien en UTF-8.

## 7) Acces par URL (reseau)
Le fichier `hosts` ne s'applique que sur la machine ou il est modifie.
Si vous voulez un nom lisible pour toutes les machines du reseau :

### Option recommandee : DNS interne
- Creer un enregistrement DNS (ex: `vigitemp`) pointant vers l'IP du serveur web.
- Tous les postes pourront acceder a `http://vigitemp`.

### Option alternative : hosts sur chaque poste
- Ajouter une entree `hosts` sur chaque PC :
```
<IP_DU_SERVEUR> vigitemp.local
```
- Acces via `http://vigitemp.local`.

### Notes
- Sans DNS, un reverse proxy ne suffit pas : les postes doivent resoudre le nom.
- L'acces par IP reste la solution la plus simple si aucune infra DNS n'existe.

