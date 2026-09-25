# Serveur — synchronisation GSP avant activation de la surveillance — 15/09/2026

## Contexte

Lors des installations et imports, une GSP peut être créée et affectée à un lieu/module alors que le lieu ou la sonde n'est pas encore en surveillance.

Le Web peut alors positionner :

` t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure = 1 `

pour signaler qu'une configuration doit être envoyée à la sonde. Jusqu'ici, le scheduler du Serveur ne chargeait que les couples lieu/sonde pleinement actifs (`Lieu_Etat = 'S'` et `Etat_Sonde = 'S'`). La configuration restait donc en attente tant que la surveillance n'était pas activée.

Cela crée notamment un mauvais ordre d'opérations lors d'une installation : la sonde peut commencer sa première mesure de Surveillance avant d'avoir reçu ses paramètres et coefficients attendus.

## Branche / PR

- branche : `fix/gsp-config-before-surveillance` ;
- base du lot après reprise : `dev` au commit `179b6a1c3ba121d166c3a573c7d44be9da8a5c49` (merge PR #118) ;
- PR : #119 — `fix(server): synchroniser les GSP dirty avant surveillance`.

## Comportement retenu

Une GSP peut désormais être chargée par le scheduler en mode **configuration uniquement** lorsque :

- `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure = 1` ;
- elle est affectée à un lieu non archivé ;
- la sonde n'est pas réformée ;
- ce n'est pas une GSO ;
- aucune opération métrologique n'est en cours ;
- un module et un port série exploitables sont disponibles ;
- le couple lieu/sonde n'est pas déjà pleinement actif en Surveillance.

Le mode configuration uniquement est volontairement séparé de la Surveillance normale.

### Ce que le Serveur peut faire

- programmer le job de configuration GSP existant ;
- envoyer l'`ECON` complet via `SensorGSP.SynchronizeConfigurationOnlyAsync(true)` ;
- utiliser les mêmes verrous COM et mutex globaux que les interrogations normales ;
- conserver le mécanisme de retry/backoff existant en cas d'échec ;
- remettre `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` à `0` uniquement après synchronisation réussie ;
- retirer ensuite le schedule temporaire tant que la Surveillance reste inactive.

### Ce que ce mode ne doit jamais faire

Une GSP `ConfigurationOnly` :

- ne lance aucune lecture `TEMP` ;
- n'enregistre aucune mesure ;
- ne déclenche aucune alarme de lieu/module ;
- ne lance aucune récupération `MEMO` ;
- n'entre pas dans les calculs de saturation/charge des ports ;
- n'influence pas la répartition automatique des sondes de Surveillance entre workers.

Les schedules temporaires sont découverts uniquement par le worker logique `1`. Les verrous COM existants restent partagés entre workers, ce qui protège également un port utilisé simultanément par des sondes déjà surveillées.

## Revalidation avant commande matérielle

Avant l'envoi de la configuration, le Serveur relit l'état BDD de la sonde.

Si la sonde :

- n'est plus dirty ;
- passe en métrologie ;
- est archivée/réformée ;
- perd son module/port ;
- ou est devenue pleinement active en Surveillance ;

le schedule `ConfigurationOnly` est abandonné. Une erreur de lecture BDD est traitée en **fail-closed** : aucune commande matérielle n'est envoyée si l'état courant ne peut pas être confirmé.

Si la sonde est devenue active, le scheduler normal la reprendra lors de son prochain rafraîchissement.

## Coefficients et caches

Le mode `ConfigurationOnly` ne peuple pas le cache métrologie depuis `SondeScheduleInfo`.

Cette précaution est nécessaire car le schedule historique contient `Coeff_X` et `Coeff_Constant`, mais pas `Coeff_X2`. Avant l'`ECON`, le cache métrologie est invalidé afin que `MetrologyDatabaseProvider` recharge le dernier `t_ajustage` complet et fournisse bien A/B/C, y compris le coefficient quadratique.

Le cache des paramètres du lieu est également invalidé avant le push afin de récupérer les paramètres Surveillance courants utilisés dans la configuration GSP.

Le dirty flag métrologie `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` reste indépendant : ce lot concerne uniquement le dirty flag historique du lieu `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure`.

Une sonde totalement non affectée à un lieu ne possède pas ce flag `t_lieu` et n'entre donc pas dans ce nouveau chemin. Son workflow de coefficients reste celui documenté dans `metrology-coefficients-dirty-28-08-2026.md`.

## Compatibilité BDD

`GspPendingConfigurationReader` dispose des requêtes équivalentes :

- MySQL ;
- SQL Server.

Les valeurs de connexion par défaut du helper sont alignées sur les providers historiques afin de ne pas modifier le comportement d'une installation legacy qui n'aurait pas toutes les clés `Vigi.Db.*` explicites.

## Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/GspPendingConfigurationReader.cs`
- `Vigitemp Serveur/Vigitemp Serveur/SondeScheduleInfo.cs`
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.csproj`
- `Vigitemp Serveur/scripts/Test-GspConfigBeforeSurveillance.ps1`

## Validation technique

GitHub Actions run `34980007105` :

- `git diff --check` : OK ;
- contrat ciblé `Test-GspConfigBeforeSurveillance.ps1` : OK ;
- restauration des dépendances `packages.config` legacy : OK ;
- build Release de `Vigitemp Serveur.sln` : OK.

Le test de contrat verrouille notamment :

- l'exclusion des schedules configuration-only des mesures normales ;
- l'absence de récupération mémoire pour ces schedules ;
- la revalidation BDD avant l'envoi ;
- l'invalidation du cache métrologie ;
- l'affectation au worker 1 ;
- la déduplication des lieux ;
- l'alignement des defaults MySQL ;
- la compilation de `GspPendingConfigurationReader.cs` dans le projet Serveur.

## Checklist de validation terrain

- [ ] créer/affecter une GSP à un lieu sans activer la Surveillance ;
- [ ] vérifier `Infos_Modifiees_Depuis_Derniere_Mesure = 1` ;
- [ ] démarrer/recharger le Serveur et vérifier un log `[SONDE][CFG-JOB] ... configurationOnly=True` ;
- [ ] vérifier l'envoi `ECON` et son ACK ;
- [ ] vérifier le passage du dirty flag à `0` après succès ;
- [ ] confirmer qu'aucune mesure `TEMP`, mesure BDD ou alarme n'a été produite avant activation de la Surveillance ;
- [ ] provoquer un échec de communication et vérifier que le dirty flag reste à `1` avec retry/backoff ;
- [ ] remettre la communication, vérifier que la configuration finit par passer ;
- [ ] passer la sonde en Surveillance alors que le dirty flag est encore présent et vérifier qu'elle bascule proprement vers le scheduler normal ;
- [ ] vérifier une GSP avec coefficients quadratiques afin de confirmer que A/B/C sont envoyés ;
- [ ] vérifier qu'une sonde en métrologie n'est pas configurée par ce chemin ;
- [ ] tester sur MySQL ;
- [ ] tester sur SQL Server.
