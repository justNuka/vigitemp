# Installers Roadmap

## Objectif

Normaliser l'installation offline de trois composants :

- serveur C#
- site web
- agent

L'agent dispose deja d'un installeur EXE complet. Pour le serveur et le site web, le besoin utile est plus simple :

- embarquer le package prepare
- lancer le script PowerShell d'installation correspondant
- garder un recap final lisible
- eviter de dupliquer toute la logique metier d'installation dans du code WinForms

## Recommandation

### 1. Garder la logique d'installation dans les scripts PowerShell

Les scripts suivants restent la source de verite :

- `website/installer/Install-VigitempWeb.ps1`
- `Vigitemp Serveur/installer/Install-VigitempServer.ps1`

Raison :

- ils sont deja utilises
- ils sont faciles a corriger
- ils concentrent les prompts et l'ecriture des configs
- ils sont plus rapides a faire evoluer qu'un wizard C# complet

### 2. Ajouter plus tard un bootstrapper EXE minimal

Le bootstrapper EXE pour `web` et `server` ne doit faire que :

1. extraire les fichiers embarques dans un dossier temporaire
2. lancer `powershell.exe -ExecutionPolicy Bypass -File <script>`
3. afficher l'etat : extraction / execution / resultat
4. afficher le chemin du log a la fin

Il ne doit pas :

- reimplementer les prompts
- reecrire les configs lui-meme
- dupliquer la logique des scripts existants

### 3. Structure cible

#### Web

- `website/installer/Prepare-StandaloneBuild.ps1`
  - build
  - copie du package offline dans `VigiSensys/2 - installation/2 - VigiSensys Serveur Web`
- futur `website/installer/bootstrapper/`
  - EXE unique
  - payload embarque du package prepare
  - lance `Install-VigitempWeb.ps1`

#### Serveur

- `Vigitemp Serveur/installer/Prepare-ServerBuild.ps1`
  - build
  - copie du package offline dans `VigiSensys/2 - installation/1 - VigiSensys Serveur`
- futur `Vigitemp Serveur/installer/bootstrapper/`
  - EXE unique
  - payload embarque du package prepare
  - lance `Install-VigitempServer.ps1`

#### Agent

- deja en place avec `Vigitemp agent/VigitempAgentInstaller/`

## Ordre de mise en oeuvre recommande

1. stabiliser les scripts PowerShell d'installation et prepare
2. figer les variables `.env` / `App.config`
3. ajouter un bootstrapper EXE minimal serveur
4. dupliquer la meme approche pour le web
5. seulement ensuite envisager un vrai assistant graphique plus riche

## Mise a jour

Un EXE de mise a jour dedie n'est pas prioritaire.

Process simple recommande :

1. arreter le service
2. remplacer les fichiers
3. relancer le service
4. verifier les logs

Tant que cette sequence reste simple et robuste, un updater dedie ajoute plus de maintenance que de valeur.

## Decision actuelle

- on garde les scripts PowerShell comme source de verite
- on ne code pas encore un wizard EXE complet pour le serveur/web
- si on fait un EXE, ce sera un bootstrapper minimal qui emballe et lance les scripts existants
