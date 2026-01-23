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

### 1.1 Build du site web (standalone)
Dans `website/installer/` :
```powershell
.\Prepare-StandaloneBuild.ps1
```

Le package est genere dans :
```
website\build\website-standalone\
```

Contient :
- `.next/standalone`
- `.next/static`
- `public/`
- `installer/` (Install-VigitempWeb.ps1 + winsw.exe)

### 1.2 Build du serveur C#
Compiler la solution sur la machine de dev (Release conseille).
Copier ensuite le dossier de build qui contient :
- `Vigitemp Serveur.exe`
- `Vigitemp Serveur.exe.config`

### 1.3 Preparer la cle USB
Copier sur une cle USB :
```
website\build\website-standalone\
Vigitemp Serveur\installer\
<dossier build serveur C#>
licence\.vtlic
licence\public_key.pem
```

## 2) Installation serveur C# (client)
Dans le dossier `Vigitemp Serveur\installer` :
```powershell
.\Install-VigitempServer.ps1
```

Le script demande :
- chemin du build serveur
- infos BDD (host, port, user, password, nom des bases)
- URL publique du site
- choix du provider BDD (mysql ou mssql)
- fichier de licence + cle publique

Chemins utiles apres install :
- `C:\ProgramData\Vigitemp\server`
- `C:\ProgramData\Vigitemp\licenses\`
- `C:\ProgramData\Vigitemp\license_keys\`
- logs : `C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log`

## 3) Installation web (client)
Dans le dossier `website-standalone\installer` :
```powershell
.\Install-VigitempWeb.ps1
```

Le script demande :
- dossier d'installation
- port HTTP
- URL publique du site
- infos BDD (host, port, user, password, nom des bases)
- choix du provider BDD (mysql ou mssql)
- cache TTL + secret surveillance (optionnel)

Note : en mode offline complet, le script a besoin de `node.exe`. Assurez-vous que Node.js est
dans le PATH ou utilisez l'option `-NodePath` pour indiquer le chemin complet.

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
