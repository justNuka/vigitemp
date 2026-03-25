# Prepare / Install / Update

## Objectif

Documenter le flux offline standard pour les trois composants :

- serveur C#
- site web
- agent

Les scripts `Prepare-*` sont la source de vérité pour générer les packages d'installation.
Les scripts `Install-*` sont la source de vérité pour l'installation locale.
Les `.exe` `VigitempServerSetup.exe` et `VigitempWebSetup.exe` sont des bootstrappers qui lancent ces scripts.

## Préparation des packages

### Tous les composants

Depuis la racine du repo :

```powershell
./Prepare-All.ps1
```

Sorties attendues :

- serveur : `..\VigiSensys\2 - installation\1 - VigiSensys Serveur`
- site web : `..\VigiSensys\2 - installation\2 - VigiSensys Serveur Web`
- agent : `..\VigiSensys\2 - installation\3 - VigiSensys Agent`

### Serveur seul

```powershell
powershell -ExecutionPolicy Bypass -File "Vigitemp Serveur\installer\Prepare-ServerBuild.ps1"
```

Le script :

1. build le serveur
2. publish le bootstrapper `VigitempServerSetup.exe`
3. copie le build et les fichiers utiles dans le package offline

### Site web seul

```powershell
powershell -ExecutionPolicy Bypass -File "website\installer\Prepare-StandaloneBuild.ps1"
```

Le script :

1. installe les dépendances si nécessaire
2. génère Prisma
3. build Next standalone
4. publish le bootstrapper `VigitempWebSetup.exe`
5. copie le standalone et les fichiers utiles dans le package offline

### Agent seul

```powershell
powershell -ExecutionPolicy Bypass -File "Vigitemp agent\installer\Prepare-AgentBuild.ps1"
```

Le script :

1. build l'agent
2. build l'installeur EXE agent
3. copie `VigiSensysAgentSetup.exe` dans le package offline

## Installation offline

### Serveur

Depuis le package :

- lancer `VigitempServerSetup.exe`
- ou lancer `installer\Install-VigitempServer.ps1`

Le bootstrapper appelle le script PowerShell et affiche le log en direct.

### Site web

Depuis le package :

- lancer `VigitempWebSetup.exe`
- ou lancer `installer\Install-VigitempWeb.ps1`

Le bootstrapper appelle le script PowerShell avec le mode :

- `-Standalone`
- `-Offline`

### Agent

Depuis le package :

- lancer `VigiSensysAgentSetup.exe`

## Mise à jour manuelle recommandée

### Serveur

1. arrêter le service Windows
2. remplacer les fichiers du dossier d'installation par ceux du nouveau package
3. relancer le service
4. vérifier les logs et l'état du service

### Site web

1. arrêter le service Windows du site
2. remplacer les fichiers du dossier d'installation
3. relancer le service
4. vérifier le port HTTP et les logs

### Agent

1. fermer l'agent si nécessaire
2. relancer l'installeur agent
3. vérifier le démarrage automatique et l'accès local `127.0.0.1:8000`

## Point important sur les chemins

Les packages doivent sortir sous :

- `C:\VigitempProject\VigiSensys\...`

et non sous :

- `C:\Vigitemp Project\VigiSensys\...`

La racine repo attendue est :

- `C:\VigitempProject\vigitemp`

## Variables d'environnement / config

### Site web

Le script d'installation web renseigne désormais aussi :

- `DATABASE_CHAT_URL`
- `NEXT_PUBLIC_APP_URL`
- `VIGITEMP_LICENSE_PATH`
- `VIGITEMP_LICENSE_PUBLIC_KEY_PATH`
- `VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH`
- `VIGITEMP_AGENT_PORT`
- `VIGITEMP_AGENT_TIMEOUT_MS`
- `VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES`
- `VIGITEMP_AGENT_SECRET`
- `JWT_SECRET`
- `HOTLINE_*`
- `VIGITEMP_ALLOWED_DEV_ORIGINS`
- `VIGITEMP_CSP_CONNECT_SRC`

### Serveur

Le script d'installation serveur renseigne désormais aussi :

- `Vigi.Db.ConnectionTimeoutSeconds`
- `Vigi.Db.CommandTimeoutSeconds`
- `Vigi.Db.SqlServer.Encrypt`
- `Vigi.Db.SqlServer.TrustServerCertificate`
- `Vigi.License.HysteresisDelta`
- `Vigi.License.DebounceSeconds`
- `Vigi.License.ShowWhileSnoozed`
- `Vigi.License.SettingsCacheSeconds`
- `Vigitemp.Metrology.LogDetailed`

## Décision actuelle

Pas d'updater EXE dédié pour le moment.

Raison :

- la mise à jour manuelle reste simple
- un updater dédié ajouterait de la maintenance avant d'apporter une vraie valeur
