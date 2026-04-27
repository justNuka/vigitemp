# Installateur serveur C# Vigitemp

Ce script installe le service C#, met a jour le App.config et place la licence / cle publique dans ProgramData.

## Prerequis
- Lancer PowerShell en tant qu'administrateur.
- Le dossier de build doit contenir `Vigitemp Serveur.exe` et son `.config`.

## Pre-requis offline (MySQL + VC redist)
Si la machine client n'a pas Internet :
- Placer `mysql-8.4.7-winx64.msi` et `VC_redist.x64.exe` dans `installer\prereqs\`
- Lancer :
```powershell
.\Install-MySQL-And-VCredist.ps1
```

## Lancer
```powershell
cd "Vigitemp Serveur\\installer"
.\Install-VigitempServer.ps1
```

## Ce que fait le script
- Copie le build dans le dossier d'installation
- Demande les parametres DB + URL web
- Propose un dimensionnement du nombre de workers d'interrogation (`Vigitemp.Workers.Count`)
- Charge la licence et affiche ses options
- Copie la licence et la cle publique dans ProgramData
- Met a jour les cles App.config
- Installe et demarre le service Windows

## Dimensionnement workers (reco)
- `<= 60` sondes : `1` worker
- `61-180` sondes : `2` workers
- `181-350` sondes : `3` workers
- `351-500` sondes : `4` workers
- Si beaucoup de sondes en frequence `<= 5 min` : `+1` worker
- Si machine faible (`<= 2` CPU logiques ou `< 8 Go RAM`) : cap `2` workers
- Si machine solide (`>= 4` CPU logiques et `>= 16 Go RAM`) : cap `6` workers
- Cap technique : `16` workers

## Fichiers
- Licence : `C:\ProgramData\Vigitemp\licenses\<license>.vtlic`
- Cle publique : `C:\ProgramData\Vigitemp\license_keys\public_key.pem`
- Logs install : `C:\ProgramData\Vigitemp\install-logs\install-server-*.log`

## Rollback
- Arreter et supprimer le service :
```powershell
sc.exe stop VigitempServeur
sc.exe delete VigitempServeur
```
- Supprimer le dossier d'installation et ProgramData si besoin.

## Desinstallation
```powershell
cd "Vigitemp Serveur\installer"
.\Uninstall-VigitempServer.ps1
```
