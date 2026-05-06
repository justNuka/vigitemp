# Recette installation offline

## Pré-requis communs

- machine Windows avec droits administrateur
- package offline généré via les scripts `Prepare-*`
- accès aux fichiers de licence si nécessaire
- aucun process parasite utilisant déjà les ports/services ciblés

## 1. Recette package serveur

### 1.1 Génération du package

Commande :

```powershell
powershell -ExecutionPolicy Bypass -File "Vigitemp Serveur\installer\Prepare-ServerBuild.ps1"
```

Vérifier dans le package :

- `Vigitemp Serveur.exe`
- `VigitempServerSetup.exe`
- `installer\Install-VigitempServer.ps1`
- `installer\db\vigisensys_seed.sql` (seed complet MySQL : `vigi_main`, `vigi_mesures`, `vigi_chat`)

### 1.2 Installation via bootstrapper

Action :

- lancer `VigitempServerSetup.exe` en administrateur

Vérifier :

- le bootstrapper affiche le log du script
- le script demande les valeurs attendues
- le service Windows est créé
- le service démarre
- le fichier `Vigitemp Serveur.exe.config` installé contient les clés attendues

Contrôles après installation :

- service `VigitempServeur` présent
- service en état `Running`
- registre : `HKLM\SOFTWARE\Vigitemp\Server`
- log d'installation créé sous `C:\ProgramData\Vigitemp\install-logs`

### 1.3 Mise à jour manuelle

Tester :

1. arrêter le service
2. remplacer les fichiers par un package plus récent
3. redémarrer le service
4. vérifier que le service repart

## 2. Recette package site web

### 2.1 Génération du package

Commande :

```powershell
powershell -ExecutionPolicy Bypass -File "website\installer\Prepare-StandaloneBuild.ps1"
```

Vérifier dans le package :

- `VigitempWebSetup.exe`
- `.next\standalone\server.js`
- `.next\static\...`
- `installer\Install-VigitempWeb.ps1`

### 2.2 Installation via bootstrapper

Action :

- lancer `VigitempWebSetup.exe` en administrateur

Vérifier :

- le bootstrapper affiche le log du script
- le script écrit bien le `.env`
- le service Windows du site est créé/démarré
- le site répond sur le port configuré

Contrôles après installation :

- présence du fichier `.env` installé
- présence des clés suivantes dans `.env` :
  - `DATABASE_CHAT_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `VIGITEMP_AGENT_SECRET`
  - `JWT_SECRET`
  - `HOTLINE_JWT_SECRET`
  - `VIGITEMP_ALLOWED_DEV_ORIGINS`
  - `VIGITEMP_CSP_CONNECT_SRC`
- accès HTTP OK depuis le navigateur
- logs d'installation présents sous `C:\ProgramData\Vigitemp\install-logs`

### 2.3 Mise à jour manuelle

Tester :

1. arrêter le service du site
2. remplacer les fichiers
3. redémarrer le service
4. vérifier le chargement du site et des API

## 3. Recette package agent

### 3.1 Génération du package

Commande :

```powershell
powershell -ExecutionPolicy Bypass -File "Vigitemp agent\installer\Prepare-AgentBuild.ps1"
```

Vérifier dans le package :

- `VigiSensysAgentSetup.exe`

### 3.2 Installation

Action :

- lancer `VigiSensysAgentSetup.exe`

Vérifier :

- copie des fichiers agent
- ajout au démarrage Windows
- entrée de désinstallation Windows
- réservation locale `127.0.0.1:8000`
- agent lancé en fin d'installation

## 4. Tests de non-régression scripts

### 4.1 Prepare-All

Commande :

```powershell
./Prepare-All.ps1
```

Vérifier :

- aucun échec dans le résumé final
- les trois packages sont générés
- les deux nouveaux bootstrappers sont présents :
  - `VigitempServerSetup.exe`
  - `VigitempWebSetup.exe`

### 4.2 Chemins

Vérifier que les sorties sont bien sous :

- `C:\VigitempProject\VigiSensys\...`

et jamais sous :

- `C:\Vigitemp Project\...`

## 5. Points d'attention

- le bootstrapper serveur/web ne remplace pas les scripts : il les lance
- si un prompt d'installation doit évoluer, corriger d'abord le script PowerShell
- si un packaging échoue, vérifier d'abord :
  - `dotnet publish` bootstrapper
  - build composant
  - chemins de sortie
  - présence des payloads attendus

