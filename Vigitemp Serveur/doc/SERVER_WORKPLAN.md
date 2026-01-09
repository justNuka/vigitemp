# Vigitemp Serveur - Plan de travaux (roadmap technique)

Ce document décrit les travaux recommandés sur **Vigitemp Serveur** (service Windows C# .NET Framework 4.8) à partir de l’état actuel du code (timers par fréquence, accès MySQL, lecture capteurs série, déclenchement/dispatch alarmes).

## Travaux réalisés (log de chantier)

### 2025-12 - Hardening service & workers

- Stop propre du service : suppression de `Thread.Abort`, remplacement de la gestion threads par des workers (`ThreadServeur` + `CancellationTokenSource`) et arrêt propre (Stop/Dispose).
- Logging fichier : suppression du chemin hardcodé type `C:\Users\User\Desktop\log.txt` au profit d’un fichier sous `%ProgramData%\Vigitemp\logs\vigitemp-serveur.log` (best-effort), et EventLog rendu plus robuste (fallback si droits insuffisants pour créer la source).
- Proxy website : `AlarmWebNotifier` existe (dispatch alarme via secret) ; point de cohérence à surveiller entre `/api/alarms/dispatch` (serveur) et `/api/alarmes/dispatch` (website canon).

### 2025-12 - Fix scheduling par fréquences

- Correction dans `ThreadServeur` : synchronisation `frequencies_status` quand une fréquence est ajoutée/supprimée (évite `IndexOutOfRange`), timer de maintenance (1 min) correctement stoppé/disposé.

### 2025-12 - Durcissement DB (config + robustesse + SQL)

- DB config externalisée dans `App.config` (clés `Vigitemp.Db.*`) : plus de credentials/host hardcodés dans `Database.cs`/`CacheService.cs`.
- Connexions DB plus robustes :
  - `InitConnexion()` retourne `bool` et les appels gèrent le cas échec (retours safe, pas de NullRef).
  - `CloseConnexion()` ferme + dispose + remet les connexions à `null`.
  - timeouts configurables via `Vigitemp.Db.ConnectionTimeoutSeconds` et `Vigitemp.Db.CommandTimeoutSeconds`.
- Paramétrisation de requêtes SQL sensibles :
  - suppression de concaténations `WHERE ... = '...'` sur les endpoints majeurs (`AddMesure`, `getInfos*`, `getLastMeasure`, etc.).

### 2026-01 - Supervision timers (pas de `async void`)

- Suppression des handlers `async void` dans `ThreadServeur` (les timers lancent désormais des `Task` supervisées, avec `try/catch` + logs).
- Ajout d’un `try/catch` dans le timer de maintenance du service (`VigitempServeur.Process`) pour éviter les crash silencieux sur exception.
- Anti-spam agent : envoi `show/hide` aux clients uniquement sur transition d’état (évite d’envoyer à chaque lecture).

### 2026-01 - Centralisation état alarme (préparation machine d’état)

- Centralisation de l’évaluation alarme dans `AlarmStateEvaluator` (déclenchements via transitions d’état au lieu de checks dispersés).
- Ajout d’une policy configurable (`Vigitemp.Alarms.*`) avec valeurs par défaut neutres :
  - `HysteresisDelta=0`, `DebounceSeconds=0` (comportement legacy)
  - `ShowWhileSnoozed=true` (afficher pendant snooze, à ajuster plus tard si besoin)
- Prise en compte des champs lieux Prisma pour le retard d’alarme :
  - `t_lieu.Retard_Alarme_Haut` / `t_lieu.Retard_Alarme_Bas` (en minutes) appliqués comme debounce directionnel avant de déclencher une alarme vraie.

## 0) Objectifs & contraintes

- **Robustesse** : pas de crash silencieux, arrêt propre, gestion des pannes (DB down, capteur absent, port série indispo).
- **Fiabilité fonctionnelle** : détection alarmes cohérente (seuils, hysteresis, anti-spam, snooze/ack/resolve selon le modèle).
- **Observabilité** : logs exploitables + métriques simples.
- **Sécurité** : secrets et accès DB hors code, requêtes paramétrées.
- **Compatibilité** : éviter de casser les producteurs/consommateurs externes (website, agent).

## 1) Configuration & déploiement (P0)

### 1.1 Externaliser la config DB

Clés actuelles (`Vigitemp Serveur/Vigitemp Serveur/App.config`) :

- `Vigitemp.Db.Host`, `Vigitemp.Db.Port`, `Vigitemp.Db.User`, `Vigitemp.Db.Password`
- `Vigitemp.Db.MainDatabase`
- `Vigitemp.Db.MeasureDatabase`
- `Vigitemp.Db.MeasureCacheDatabase` (optionnel)
- `Vigitemp.Db.ConnectionTimeoutSeconds`
- `Vigitemp.Db.CommandTimeoutSeconds`

À faire :

- Supporter un override par variables d’environnement (utile pour CI/ops).

### 1.2 Modes d’exécution (P1)

- Mode `dry-run` :
  - ne pas écrire en DB
  - ne pas notifier (agent + website)
  - logger uniquement ce qui aurait été fait
- Mode `simulate` (optionnel) :
  - injecter des lectures capteurs simulées via fichiers/fixtures

### 1.3 Logs / EventLog (P0-P1)

- Installer la source EventLog via un script/installer (plutôt que runtime).
- Unifier le format de logs (timestamp + idServeur + idLieu + capteur + action).
- Rotation/retention des logs fichiers (si besoin).

## 2) Boucle d’exécution / scheduling (P0-P1)

Constat : un **timer par fréquence** implique des risques de collisions, et l’ancien `async void` pouvait faire remonter des exceptions fatales.

À faire (reste) :

- Ajouter une protection anti-parallélisme par fréquence (mutex/lock par fréquence) si nécessaire (aujourd’hui un `SemaphoreSlim` global sérialise tout un serveur).
- Arrêt propre : cancellation propagée, timers stoppés, ports COM fermés.

## 3) Lecture capteurs & normalisation des mesures (P0-P1)

### 3.1 API capteur homogène

- Définir une interface (conceptuelle) : `ReadAsync(...) -> SensorReadResult`
  - `success`, `value`, `rawFrame`, `durationMs`, `error`, `port`, `sensorSerial`
- Harmoniser :
  - timeouts
  - retries (ex: 1 retry max) + backoff
  - parsing des trames (au même endroit)

### 3.2 Calibration & cache (P1)

Constat : `getCoeffCalibrageBySerialNumber` peut être appelé très souvent.

- Mettre en cache `(coeffX, coeffConstant)` par sonde + TTL (ex: 5 minutes) ou invalidation par date.
- Réduire les accès DB pendant une vague de polling.

### 3.3 Gestion ports série (P0-P1)

- Éviter d’ouvrir/fermer le même port en concurrence (lock par `COMx`).
- Journaliser les erreurs matérielles :
  - port absent / busy / droits / timeouts
- Option pool (si stabilité) : conserver les ports ouverts et gérer proprement les handlers.

## 4) Écriture DB (mesures + cache graphique) (P0-P1)

### 4.1 Connexions DB fiables (P0)

- Encapsuler chaque opération DB dans `using` (connexions courtes) **ou** maintenir des connexions avec :
  - reconnexion
  - timeouts
  - erreurs explicites
- Ajouter retry limité (ex: 3) sur erreurs transitoires.

### 4.2 Normaliser les écritures (P0-P1)

- Définir source de vérité :
  - table(s) cibles (mesures brutes)
  - table `tm_graphique` (cache)
- Documenter la politique de purge/retention (surtout pour `tm_graphique`).

### 4.3 Bufferisation en cas de panne DB (P1)

- Ajouter une file locale (mémoire + éventuellement flush disque) :
  - si DB down : bufferiser N mesures / N minutes
  - dès que DB revient : flush
- Définir les limites (max size) + comportement (drop oldest vs stop service).

## 5) Détection seuils & états d’alarme (P0-P1)

Constat : logique alarmes répartie (capteur + réactivation snooze dans le worker).

Travaux :

- Formaliser une machine d’état par lieu/capteur :
  - `NORMAL`
  - `OUT_OF_RANGE`
  - `SNOOZED`
  - (éventuels) `ACKED`, `RESOLVED`
- Règles de déclenchement :
  - hysteresis (éviter oscillations autour du seuil)
  - debounce (durée hors seuil min avant ON)
  - cooldown (éviter spam notifs)
- Centraliser l’évaluation :
  - 1 fonction qui prend la mesure + limites + état précédent
  - renvoie : nouvel état + actions à faire (notifier/écrire)
- Clarifier le rôle de `notification_active` et `DateHeure_reactivationAlarme` :
  - quelle vérité prévaut ?
  - que faire quand une mesure redevient normale ?

## 6) Dispatch notifications (agent + website) (P0-P1)

### 6.1 Vers l’agent (clients)

Constat : envoi `show/hide` trop souvent -> spam réseau.

- Rendre idempotent :
  - envoyer `show` uniquement sur transition OFF->ON
  - envoyer `hide` uniquement sur transition ON->OFF
- Ajouter timeouts + retry/backoff + logs.

### 6.2 Vers le website (dispatch secret)

- Aligner définitivement l’endpoint côté serveur avec le canon côté website (FR/EN) et documenter la rétro-compat.
- Structurer le payload si nécessaire :
  - `idLieu`, `value`, `unit`, `timestamp`, `severity`, `url`
- Ajouter idempotence côté serveur (partiellement présent via un état `wasActive` à formaliser).

## 7) Sécurité (P0-P2)

- Supprimer toutes les concat SQL restantes (paramétrer partout).
- Retirer les secrets/credentials du code, documenter le provisioning.
- Limiter les privilèges DB (compte dédié : read/write minimal).

## 8) Observabilité & diagnostics (P1)

- Ajouter métriques simples (loggées périodiquement) :
  - mesures/minute
  - taux d’erreurs capteurs
  - latence moyenne read/insert
  - nombre de lieux en alarme
- Ajouter un health report par `idServeur` toutes X minutes.

## 9) Tests & validation (P1-P2)

- Mode simulateur :
  - replay de trames / fixtures
  - validation parsing + calibration + transitions d’alarme
- Outil console minimal :
  - injecter une mesure
  - vérifier actions attendues (DB writes / notifications)
- Tests d’intégration sur une DB de test (si possible).

## 10) Ordre d’exécution recommandé

1. (P0) Config DB + timeouts + logs robustes (sans modifier la logique métier).
2. (P0) Scheduler : suppression des exécutions non supervisées + arrêt propre partout.
3. (P0-P1) Centraliser détection alarmes + anti-spam notifs (agent + website).
4. (P1) Robustesse DB (retries) + bufferisation.
5. (P1-P2) Simulateur + outils de validation.
