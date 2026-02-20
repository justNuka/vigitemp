ï»¿ï»¿# Installateur serveur C# Vigitemp

Ce script installe le service C#, met à jour le App.config et place la licence / clé publique dans ProgramData.

## Prérequis
- Lancer PowerShell en tant qu'administrateur.
- Le dossier de build doit contenir `Vigitemp Serveur.exe` et son `.config`.


## Pre-requis offline (MySQL + VC redist)
Si la machine client n'a pas Internet :
- Placer `mysql-8.4.7-winx64.msi` et `VC_redist.x64.exe` dans `installer\prereqs\`
- Lancer :
```
.\Install-MySQL-And-VCredist.ps1
```

## Lancer
```
cd "Vigitemp Serveur\\installer"
.\\Install-VigitempServer.ps1
```

## Ce que fait le script
- Copie le build dans le dossier d'installation
- Demande les paramétres DB + URL web
- Charge la licence et affiche ses options
- Copie la licence et la clé publique dans ProgramData
- Met à jour les clés App.config
- Installe et démarre le service Windows

## Fichiers
- Licence : `C:\ProgramData\Vigitemp\licenses\<license>.vtlic`
- Clé publique : `C:\ProgramData\Vigitemp\license_keys\public_key`
- Logs install : `C:\ProgramData\Vigitemp\install-logs\install-server-*.log`

## Rollback
- Arrêter et supprimer le service :
```
sc.exe stop VigitempServeur
sc.exe delete VigitempServeur
```
- Supprimer le dossier d'installation et ProgramData si besoin.

## Desinstallation
```
cd "Vigitemp Serveur\installer"
.\Uninstall-VigitempServer.ps1
```
