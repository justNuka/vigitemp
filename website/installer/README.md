# Installateur site web VigiSensys

L'installateur Web installe le build Next.js standalone, écrit le fichier `.env`, puis crée le service Windows `VigiSensysWeb`.

Le package de mise en service utilise l'interface `VigiSensysWebSetup.exe`, construite depuis `WebsiteInstallerBootstrapper`. Le script `Install-VigitempWeb.ps1` reste disponible pour les installations manuelles/historiques.

## Prérequis

- lancer l'installateur en tant qu'administrateur ;
- Node.js LTS installé ;
- disposer des fichiers de licence / clés nécessaires ;
- disposer d'un compte SQL dédié et des trois bases attendues.

## Better Auth à la mise en service

Le bootstrapper Web configure automatiquement Better Auth lors de la génération du `.env` standalone :

```env
BETTER_AUTH_ENABLED=true
BETTER_AUTH_PUBLIC_API_ENABLED=false
BETTER_AUTH_SECRET="<secret aléatoire généré par l'installateur>"
BETTER_AUTH_URL="<même valeur que NEXT_PUBLIC_API_BASE_URL>"
```

Règles retenues :

- le secret est généré avec le générateur cryptographiquement sûr déjà utilisé par l'installateur ;
- sa valeur n'est jamais affichée dans les logs ou le résumé de mise en service ;
- `BETTER_AUTH_URL` reprend exactement l'URL publique du site renseignée pour `NEXT_PUBLIC_API_BASE_URL` ;
- le runtime Better Auth est activé sur les nouvelles mises en service ;
- l'API Better Auth brute `/api/auth-v2/*` reste fermée avec `BETTER_AUTH_PUBLIC_API_ENABLED=false` pendant la transition ;
- les JWT historiques restent présents tant que la migration complète de l'authentification n'est pas terminée.

Les installations existantes qui n'ont pas encore ces variables conservent le comportement précédent tant qu'elles ne sont pas remises en service avec un package récent ou configurées explicitement.

## Mode standalone (recommandé)

Le build produit un bundle autonome (`.next/standalone`) qui évite de copier l'ensemble de `node_modules`.

### Préparer le package

```powershell
cd website\installer
.\Prepare-StandaloneBuild.ps1 -DatabaseProvider mysql
```

Utiliser `-DatabaseProvider mssql` pour un package SQL Server.

Le script :

- prépare/génère Prisma pour le provider choisi ;
- construit le site ;
- publie `WebsiteInstallerBootstrapper` ;
- copie le serveur standalone et les assets statiques ;
- ajoute `VigiSensysWebSetup.exe` et `winsw.exe` au package final.

### Installation client

Lancer :

```text
VigiSensysWebSetup.exe
```

Puis renseigner les paramètres demandés par l'assistant de mise en service.

## Script PowerShell historique

Pour une installation manuelle depuis le dépôt :

```powershell
cd website\installer
.\Install-VigitempWeb.ps1 -Standalone -Offline
```

En mode non-standalone / online, le script peut également installer les dépendances et construire l'application localement.

## Fichiers

- installation Web par défaut : `C:\ProgramData\VigiSensys\website` ;
- `.env` standalone : `C:\ProgramData\VigiSensys\website\.next\standalone\.env` ;
- logs application : `C:\ProgramData\VigiSensys\web-logs` par défaut ;
- informations d'installation : registre `HKLM\SOFTWARE\VigiSensys\Web`.

## Rollback / désinstallation

Le bootstrapper génère le script de désinstallation associé au Web. Pour un retrait manuel :

```powershell
sc.exe stop VigiSensysWeb
sc.exe delete VigiSensysWeb
```

Puis supprimer le dossier d'installation si nécessaire.
