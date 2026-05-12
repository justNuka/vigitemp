# Renommage Vigitemp vers VigiSensys

Date de cartographie : 2026-05-12

## Objectif

Remplacer progressivement l'ancien nom `Vigitemp` par `VigiSensys`.

Convention cible :

- Nom produit visible utilisateur : `VigiSensys`
- Identifiants techniques nouveaux : `vigisensys`
- Dossiers d'installation nouveaux : `C:\ProgramData\VigiSensys\...`
- Executables/services nouveaux, a terme : `VigiSensysWeb`, `VigiSensysServeur`, `VigiSensysAgent`
- Dossier repo cible, en dernier : `C:\VigitempProject\vigisensys`

Le remplacement global automatique est risque. Certaines occurrences sont des contrats techniques existants et doivent garder une compatibilite temporaire.

## Inventaire rapide

Recherche effectuee hors `.git`, `node_modules`, `.next`, `bin`, `obj`, `out`.

- Fichiers touches par le terme : 178
- Occurrences approx. : 1619
- Par zone :
  - `website` : 71 fichiers
  - `Vigitemp Serveur` : 52 fichiers
  - `Vigitemp agent` : 39 fichiers
  - `docs` : 8 fichiers
  - `db` : 2 fichiers
  - scripts racine et outils : quelques fichiers

Top fichiers par volume d'occurrences :

- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`
- `Vigitemp agent/installer/wix/Harvest.wxs`
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs`
- `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.cs`
- `docs/plans/2026-02-24-planning-consignes-impl.md`
- `docs/contexte-reprise-vigisensys.md`
- `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs`
- `INSTALLATION_A_Z.md`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIN.cs`

## Categories de changements

### 1. Branding visible utilisateur

A remplacer en priorite par `VigiSensys`.

Exemples :

- Titres web, textes d'erreur, loaders, pages de licence.
- Sujets de mails : `[VIGITEMP] ...` vers `[VIGISENSYS] ...` ou `[VigiSensys] ...`.
- Corps de mails : `Notification d'alarme Vigitemp`, `Alarme Vigitemp`, etc.
- Agent Windows :
  - tray icon text `Vigitemp Agent`
  - balloon tips
  - MessageBox
  - textes de connexion au portail
- Installateurs :
  - titres de fenetres
  - textes d'etapes
  - messages d'erreur
- Docs publiques / recette / installation.

Points identifies :

- `website/src/components/license/license-gate-loader.tsx`
- `website/src/components/error/error-page-layout.tsx`
- `website/src/lib/alarm-email.ts`
- `website/src/lib/statistics/monthly-report-email.tsx`
- `website/src/app/api/auth/request-password-reset/route.ts`
- `website/src/app/api/email/test/route.ts`
- `website/public/service-worker.js`
- `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
- `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
- `Vigitemp agent/Vigitemp agent/StatusForm.cs`
- installateurs C# et PowerShell.

### 2. Chemins d'installation Windows

Cible : `C:\ProgramData\VigiSensys`.

Occurrences actuelles importantes :

- `C:\ProgramData\Vigitemp\website`
- `C:\ProgramData\Vigitemp\server`
- `C:\ProgramData\Vigitemp\logs`
- `C:\ProgramData\Vigitemp\web-logs`
- `C:\ProgramData\Vigitemp\install-logs`
- `C:\ProgramData\Vigitemp\licenses`
- `C:\ProgramData\Vigitemp\license_keys`
- `C:\ProgramData\Vigitemp\shared-secrets`
- `C:\ProgramData\Vigitemp\Backup_BDD\BACKUP`

Fichiers principaux :

- `website/installer/Install-VigitempWeb.ps1`
- `website/installer/Uninstall-VigitempWeb.ps1`
- `website/WebsiteInstallerBootstrapper/MainForm.cs`
- `website/src/lib/license-server.ts`
- `website/src/app/api/agent/secret/route.ts`
- `website/src/app/api/admin/sauvegardes/route.ts`
- `Vigitemp Serveur/installer/Install-VigitempServer.ps1`
- `Vigitemp Serveur/installer/Uninstall-VigitempServer.ps1`
- `Vigitemp Serveur/Vigitemp Serveur/LicenseManager.cs`

Decision recommandee :

- Nouveau setup installe dans `C:\ProgramData\VigiSensys`.
- Garder une lecture fallback sur `C:\ProgramData\Vigitemp` pour les licences, secrets et configs existants.
- Ajouter une migration explicite dans les installateurs si l'ancien dossier existe.

### 3. Services Windows et executables

Noms actuels :

- `VigitempWeb`
- `VigitempServeur`
- `VigitempAgent.exe`
- `Vigitemp Serveur.exe`
- `VigitempWeb.exe`
- `VigitempServerSetup.exe`
- `VigitempWebSetup.exe`
- `VigitempAgentInstaller`
- `VigitempLogTagWorker`

Cible proposee :

- Service web : `VigiSensysWeb`
- Service serveur : `VigiSensysServeur`
- Agent : `VigiSensysAgent.exe`
- Serveur : `VigiSensys Serveur.exe` ou `VigiSensysServer.exe`
- Setup web : `VigiSensysWebSetup.exe`
- Setup serveur : `VigiSensysServerSetup.exe`
- Setup agent : `VigiSensysAgentSetup.exe`
- Worker LogTag : `VigiSensysLogTagWorker`

Risque :

- Renommer les assembly names C# impacte les chemins `.exe.config`, les installateurs, les services, les scripts de build, les raccourcis, le registre et le demarrage automatique Windows.
- A faire par brique, avec build/test a chaque etape.

### 4. Variables d'environnement

Variables actuelles :

- `VIGITEMP_AGENT_SECRET`
- `VIGITEMP_ALARM_DISPATCH_SECRET`
- `VIGITEMP_SURVEILLANCE_DISPATCH_SECRET`
- `VIGITEMP_STATS_REPORT_SECRET`
- `VIGITEMP_EMAIL_TIMEZONE`
- `VIGITEMP_LOGS_DIR`
- `VIGITEMP_LICENSE_PATH`
- `VIGITEMP_LICENSE_PUBLIC_KEY_PATH`
- `VIGITEMP_LICENSE_INSTANCE_PUBLIC_KEY`
- `VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH`
- `VIGITEMP_HOTLINE_API_KEY`
- `VIGITEMP_UPLOADS_DIR`
- `VIGITEMP_BACKUP_ROOT`
- `VIGITEMP_COOKIE_SECURE`
- `VIGITEMP_SKIP_DB_ON_BUILD`
- `VIGITEMP_PROXY_DEBUG`
- `VIGITEMP_REQUEST_ERRORS_PATH`

Cible :

- Ajouter les equivalents `VIGISENSYS_*`.
- Garder les `VIGITEMP_*` en fallback pendant une phase de compatibilite.

Exemple de pattern recommande :

```ts
const value =
  process.env.VIGISENSYS_AGENT_SECRET?.trim() ||
  process.env.VIGITEMP_AGENT_SECRET?.trim() ||
  "";
```

Ne pas supprimer directement les anciennes variables, sinon les installations existantes cassent.

### 5. Headers HTTP internes

Headers actuels :

- `x-vigitemp-secret`
- `x-vigitemp-agent-secret`
- `x-vigitemp-hotline-key`
- `x-vigitemp-client-trace`
- `x-vigitemp-query-client-id`
- `x-vigitemp-boot-id`
- `x-vigitemp-error-id`
- `x-vigitemp-machine-name`
- `x-vigitemp-machine`

Cible :

- Ajouter support des headers `x-vigisensys-*`.
- Garder lecture des anciens `x-vigitemp-*`.
- Les serveurs C# et l'agent doivent envoyer les nouveaux headers en priorite, puis les anciens seulement si necessaire pendant la transition.

Risque :

- Web, serveur C# et agent doivent etre deployes en compatibilite croisee. Exemple : ancien agent avec nouveau web, nouveau agent avec ancien web.

### 6. Events navigateur, localStorage, cookies

Occurrences actuelles :

- `vigitemp:active-alarms`
- `vigitemp:surveillance-range-lock`
- `vigitemp:lieu-updated`
- `vigitemp:alarm-audio-muted`
- `vigitemp:api-error`
- `vigitemp:auth-state`
- `vigitemp:auth-disconnect-reason`
- `vigitemp:admin-expert-layout:v2`
- `vigitemp-theme`
- `vigitemp_release_seen`
- `vigitemp_rq_cache_v1`
- `__vigitempQueryClientId`
- `__vigitempBootId`
- `__vigitemp_console_error_patched__`

Cible :

- Pour les events internes, migration possible vers `vigisensys:*`.
- Pour localStorage/cookies/cache, garder une lecture de l'ancienne cle puis ecrire la nouvelle cle.
- Eviter de perdre les preferences utilisateur : theme, audio mute, changelog vu, layout admin expert.

### 7. Base de donnees, seeds et donnees historiques

Elements a traiter :

- Parametre licence `LICENCE/VIGITEMP` : ne pas renommer sans verifier le format de licence et le code de validation.
- Valeurs visibles :
  - `VigiTemp Type ES`
  - `VigiTemp Type SEF`
  - `Serveur VigiTemp MC2`
  - `Alarme VigiTemp`
  - `noreply@vigitemp.fr`
  - chemins `BackupVigiTempX...`
- Bases historiques dans vieux code agent :
  - `vigitemp`
  - `vigitemp_mesure`
- Bases actuelles deja renommees :
  - `vigi_main`
  - `vigi_mesures`
  - `vigi_chat`
- Fichiers seeds actuels :
  - `db/vigisensys_seed.sql`
  - `db/vigisensys_seed_mssql.sql`

Decision recommandee :

- Garder les noms de tables/colonnes existants.
- Garder `LICENCE/VIGITEMP` tant que le systeme de licence n'a pas ete explicitement migre.
- Nettoyer les libelles visibles dans les seeds.
- Mettre les emails par defaut vers le domaine cible quand il est confirme.

### 8. Code C# serveur

Actuel :

- Dossier : `Vigitemp Serveur`
- Solution : `Vigitemp Serveur.sln`
- Projet : `VigitempServeur.csproj`
- Namespace : `Vigitemp_Serveur`
- Classe principale : `VigitempServeur`
- AssemblyName : `Vigitemp Serveur`
- Config keys : `Vigitemp.*`

Recommandation :

- Phase 1 : changer textes visibles, installateurs, chemins, services avec compatibilite.
- Phase 2 : renommer assembly/projet/classes/namespaces.
- Phase 3 : renommer dossier repo.

Ne pas commencer par les namespaces/classes : gros volume, risque de conflit, faible valeur utilisateur immediate.

### 9. Code C# agent

Actuel :

- Dossier : `Vigitemp agent`
- Solution : `Vigitemp Agent.sln`
- Projet : `Vigitemp Agent.csproj`
- Namespace : `VigitempAgent`
- AssemblyName : `VigitempAgent`
- AppSettings :
  - `VigitempSiteWebUrl`
  - `VigitempAgentSecret`
- Registre / startup :
  - `VigitempAgent`
  - `VigiTempAgent` en compat suppression
- Install dir probable : `C:\Program Files (x86)\Vigitemp\Agent`

Recommandation :

- Ajouter nouvelles cles config :
  - `VigiSensysSiteWebUrl`
  - `VigiSensysAgentSecret`
- Lire les anciennes en fallback.
- Renommer affichage tray et notifications en premier.
- Renommer executable/namespace/projet seulement apres validation installateur.

### 10. Web Next.js

Zones principales :

- Branding visible : composants, emails, service worker.
- Secrets/env vars : `VIGITEMP_*`.
- Headers internes : `x-vigitemp-*`.
- Stockage navigateur : `vigitemp:*`, cookies, localStorage.
- Installateur web : PowerShell + bootstrapper C#.
- Logs : `vigitemp-%DATE%.log`.
- Domaines dev/test :
  - `test.vigitemp`
  - `dev.vigitemp`

Recommandation :

- Introduire des constantes de marque et de prefixe technique.
- Exemple :

```ts
export const APP_BRAND_NAME = "VigiSensys";
export const APP_TECH_PREFIX = "vigisensys";
```

- Eviter les strings dispersees pour les nouveaux developpements.

### 11. Docs et scripts racine

Fichiers visibles :

- `INSTALLATION_A_Z.md`
- `CLAUDE.md`
- `Prepare-All.ps1`
- `Prepare-And-Deploy.ps1`
- `vigitemp.code-workspace`
- `docs/*`

Recommandation :

- Renommer `vigitemp.code-workspace` en `vigisensys.code-workspace`.
- Mettre a jour les chemins dans les scripts apres renommage des dossiers.
- Garder une note "anciennement Vigitemp" dans `docs/contexte-reprise-vigisensys.md`.

## Ordre de migration recommande

### Etape 0 - Preparation

- Creer une branche dediee.
- S'assurer que web, serveur et agent buildent avant renommage.
- Geler les grosses features pendant le renommage.
- Lister les services/process a arreter sur la machine test.

### Etape 1 - Branding visible uniquement

- Remplacer les textes utilisateur par `VigiSensys`.
- Mails, UI web, agent tray, installateurs.
- Ne pas toucher aux env vars, headers, services, namespaces.
- Tests :
  - `pnpm build`
  - build serveur C#
  - build agent C#
  - installation web en test

### Etape 2 - Compat technique

- Ajouter support `VIGISENSYS_*` en fallback prioritaire.
- Ajouter support `x-vigisensys-*` en fallback prioritaire.
- Continuer a accepter `VIGITEMP_*` et `x-vigitemp-*`.
- Ajouter migration localStorage/cookies si necessaire.

### Etape 3 - Installateurs et chemins Windows

- Nouveaux dossiers `C:\ProgramData\VigiSensys`.
- Nouveaux logs `vigisensys-*.log`.
- Nouveaux services :
  - `VigiSensysWeb`
  - `VigiSensysServeur`
- Migration/fallback depuis `C:\ProgramData\Vigitemp`.
- Script uninstall compatible ancien et nouveau nom.

### Etape 4 - Agent

- Nouveau nom visible `VigiSensys Agent`.
- Nouveau setup `VigiSensysAgentSetup.exe`.
- Lire anciennes cles config.
- Renommer executable seulement apres verification de l'auto-start Windows.

### Etape 5 - Serveur C#

- Nouveau nom visible `VigiSensys Serveur`.
- Renommer service et installateur.
- Renommer AssemblyName/projet/classes seulement si necessaire.

### Etape 6 - Nettoyage DB/seeds

- Nettoyer libelles visibles.
- Garder cles techniques historiques sensibles (`LICENCE/VIGITEMP`) tant que non migrees.
- Ajouter notes de compat dans les seeds.

### Etape 7 - Renommage dossiers repo

A faire en dernier :

- `C:\VigitempProject\vigitemp` vers `C:\VigitempProject\vigisensys`
- `Vigitemp Serveur` vers `VigiSensys Serveur` ou `server`
- `Vigitemp agent` vers `VigiSensys agent` ou `agent`
- `vigitemp.code-workspace` vers `vigisensys.code-workspace`

Risque :

- Beaucoup de chemins relatifs dans `.sln`, `.csproj`, scripts PowerShell, WiX Harvest, docs et raccourcis.
- Les chemins absolus generes dans `Harvest.wxs` doivent etre regeneres, pas simplement remplaces.

## Points a ne pas remplacer brutalement

- `LICENCE/VIGITEMP` sans analyse du code de licence.
- Variables `VIGITEMP_*` sans fallback.
- Headers `x-vigitemp-*` sans compat croisee.
- LocalStorage/cookies/cache sans migration.
- Noms de bases historiques dans vieux utilitaires sans verifier s'ils sont encore utilises.
- `VigiServ`, `VigiTel`, `VigiLog` : ce sont des briques/produits distincts, ne pas renommer en `VigiSensys` par reflexe.
- Fichiers generes (`Harvest.wxs`, `Resources.Designer.cs`) : preferer regeneration quand possible.

## Tests minimum par lot

- Web :
  - `pnpm exec eslint <fichiers touches>`
  - `pnpm build`
  - test login
  - test notification agent
  - test email alarme
  - test dispatch alarme
- Serveur :
  - build Release
  - install service test
  - interrogation GSP/classiques
  - lecture licence
  - logs dans nouveau dossier
- Agent :
  - build Release
  - installation
  - autostart Windows
  - reception notification
  - relecture config ancienne et nouvelle
- Installateurs :
  - installation propre
  - installation par-dessus ancienne version
  - uninstall ancien et nouveau nom

## Recommandation finale

Ne pas faire un `search/replace` global.

Faire le renommage en lots courts :

1. Branding visible.
2. Compat env vars/headers/storage.
3. Installateurs/chemins/services.
4. Agent.
5. Serveur C#.
6. Seeds/docs.
7. Renommage du dossier racine.

Le dossier racine `vigitemp/` doit etre renomme seulement apres stabilisation des chemins internes et des scripts de build/install.
