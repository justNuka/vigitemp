# Roadmap de sécurisation et refactorisation VigiSensys

> Baseline d'audit : `dev` au commit `78aacf0419714473afcddd4b0fd3e74f0637f345`, après merge de la PR #72 le 28/08/2026.
>
> Les statuts ci-dessous décrivent cette baseline. Avant d'entamer un chantier, vérifier les PR et le code actuels : un point peut avoir été corrigé entre-temps.

## 1. Objectif de la roadmap

Cette roadmap ordonne les chantiers issus de l'audit sécurité/architecture et du complément spécifique à la métrologie.

Elle ne doit pas être transformée en une branche de refactor globale. Chaque étape doit être découpée en PR cohérentes, relisibles et validables indépendamment.

Principes d'ordre :

1. supprimer d'abord les vulnérabilités et comportements de sécurité à impact élevé ;
2. installer ensuite les garde-fous de tests/CI ;
3. corriger les mauvaises frontières architecturales qui rendent les features critiques difficiles à maintenir ;
4. poursuivre les refactors de structure au fil des zones réellement modifiées ;
5. réserver les réécritures technologiques lourdes aux versions prévues pour cela, notamment l'Agent V2.

## 2. Vue synthétique

| Ordre | Chantier | Priorité | Baseline 28/08/2026 | Dépendances principales |
|---|---|---|---|---|
| 1 | Sécuriser `HotlineApiServer` | P0 | À faire | Aucune |
| 2 | Garantir la durée absolue des sessions Web | P0 | À faire / correction précédente incomplète | Tests auth |
| 3 | Séparer la clé de chiffrement applicative | P0 | À faire | Plan de migration des valeurs chiffrées |
| 4 | Durcir les autres secrets/configurations | P1 | À faire | Selon sous-lot |
| 5 | Mettre en place tests/CI permanents | P1 | À faire | Peut commencer en parallèle des P0 si explicitement souhaité |
| 6 | Extraire la couche serveur commune de métrologie | P1 | À faire | Tests de caractérisation matériel/métrologie |
| 7 | Découpler l'API métrologie de l'API Hotline | P1 | À faire | Étape 6 |
| 8 | Mutualiser le runtime Web ajustage/étalonnage | P1/P2 | Partiellement commencé | Étapes 6–7 recommandées |
| 9 | Consolider les fondations Web | P2 | Partiellement en place | Tests/CI |
| 9A | Standardiser les helpers de formatage dates et nombres | P2 | Date partiellement paramétré ; helper numérique canonique absent | Lot 5 puis Lot 9 |
| 10 | Décomposer progressivement les gros composants React | P2 | Partiellement commencé | Au fil des features |
| 11 | Scinder les responsabilités du serveur C# | P2 | À faire progressivement | Tests/CI |
| 12 | Agent V1 : durcissement local ciblé | P1/P2 | À faire | Pas de gros refactor |
| 13 | Agent V2 | Projet ultérieur | À concevoir | Hors refactor V1 |

## 3. Lot 1 — Hotline fail closed et réduction de la surface d'attaque

### Problème observé

`Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` porte une API capable d'effectuer des opérations proches du matériel. L'audit a identifié notamment :

- un listener pouvant être exposé sur toutes les interfaces selon la configuration/default historique ;
- une validation de clé API qui peut devenir permissive lorsque la clé attendue n'est pas configurée ;
- un endpoint de test sonde utilisé également par des workflows de métrologie normaux ;
- trop de responsabilité technique/métier dans le même serveur HTTP.

### PR recommandée 1A — sécurité sans refactor métier

Objectif : corriger la sécurité sans attendre la réarchitecture métrologie.

À vérifier/implémenter selon l'état courant :

- fail closed si Hotline est activée mais que la clé requise est absente/invalide ;
- binding par défaut limité au loopback si aucun accès distant n'est explicitement requis ;
- mode distant explicite et documenté ;
- comparaison de secret en temps constant ;
- limite de taille du body ;
- timeouts serveur ;
- limite de concurrence ;
- rate limiting adapté aux commandes matérielles ;
- journalisation des opérations sensibles sans exposer de secret ;
- allowlist des commandes/operations exposables ;
- si accès distant nécessaire : préparer la trajectoire HTTPS + filtrage réseau/pare-feu.

### Validation

- Hotline correctement configurée fonctionne ;
- Hotline sans clé obligatoire refuse de démarrer ou refuse les appels ;
- aucune commande matérielle non autorisée ne passe ;
- ajustage/étalonnage continuent de fonctionner pendant la période de compatibilité ;
- pas de régression de port COM ou de timeout.

Ne pas profiter de cette PR pour déplacer toute la logique métrologie : ce sera un lot séparé.

## 4. Lot 2 — session Web réellement limitée à 24 h

### Problème observé

Le backlog contient déjà une correction de la durée maximale de session, mais l'audit a identifié un chemin de prolongation restant.

À la baseline :

- `generateAccessToken(payload, sessionExpiresAt?)` sait borner la durée à une échéance absolue seulement si celle-ci lui est transmise ;
- le refresh préserve cette échéance ;
- certains chemins de génération/rotation d'access token, notamment au login et dans `withAuthLogging()`, peuvent créer un nouveau token sans propager cette échéance ;
- une activité régulière peut donc potentiellement continuer à renouveler une fenêtre d'une heure au-delà de l'échéance nominale.

### Cible

Créer une source de vérité unique pour la session :

- `sessionExpiresAt` fixé une fois au login ;
- inclus/préservé dans access token et refresh token ;
- transmis à toute rotation ;
- cookie limité au temps restant ;
- token refusé dès que l'échéance absolue est dépassée, indépendamment de l'activité.

Un `AuthSessionService` est une direction possible, pas un nom imposé.

### Tests obligatoires

Avec horloge contrôlée :

- T0 : login ;
- T+23:59 : session encore valide ;
- appels API réguliers avant l'échéance ;
- T+24:01 : 401 malgré les appels précédents ;
- refresh ne dépasse jamais la deadline ;
- logout reste fonctionnel.

À plus long terme, une table de sessions serveur peut ajouter révocation, logout-all et traçabilité, mais ce n'est pas nécessaire pour corriger le P0.

## 5. Lot 3 — clé dédiée pour le chiffrement des secrets

### Problème observé

`website/src/lib/secret-crypto.ts` utilise une primitive AES-GCM adaptée, mais la résolution historique de clé peut réutiliser une clé d'authentification et/ou disposer d'un fallback codé en dur.

### Cible

- variable dédiée obligatoire, par exemple `VIGISENSYS_SECRET_ENCRYPTION_KEY` ;
- aucune réutilisation de `JWT_SECRET`, Hotline ou Agent ;
- aucun fallback hardcodé ;
- fail fast au démarrage/à l'utilisation en environnement nécessitant le chiffrement ;
- format chiffré versionné permettant la rotation, par exemple conceptuellement `encrypted:v1:<keyId>:<payload>` ;
- procédure de migration/rechiffrement des secrets existants.

### Découpage

Ne pas changer la clé sans stratégie pour les données déjà chiffrées. La PR doit prévoir lecture de l'ancien format pendant la migration si nécessaire, puis suppression explicite de cette compatibilité dans un lot ultérieur.

## 6. Lot 4 — autres durcissements sécurité/configuration

À découper en petites PR selon cohérence :

### Auth / reset mot de passe

- rendre la réponse externe d'une demande de reset indistinguable pour un compte existant/inexistant même lorsque SMTP est indisponible ;
- éviter les fallbacks localhost silencieux pour l'URL publique en production ;
- valider réellement la longueur/qualité minimale de `JWT_SECRET` annoncée par le code ;
- rendre explicites algorithme, issuer, audience et type de token si pertinent ;
- supprimer le JWT du JSON de login si le navigateur n'en a pas besoin et que le cookie HttpOnly suffit.

### Base de données / service C#

- supprimer les mots de passe/hôtes opérationnels de fallback ;
- fail fast si la configuration DB indispensable est absente ;
- utiliser un utilisateur DB de moindre privilège plutôt que `root` / `sa` en production ;
- trajectoire SQL Server : chiffrement activé et certificat vérifié lorsque l'infrastructure client le permet ;
- stocker les secrets de service avec une protection adaptée à Windows/ACL plutôt qu'en clair dans une configuration largement lisible.

### Dépôt

- ignorer les licences `.vtlic` opérationnelles et ne conserver qu'un exemple fictif si nécessaire ;
- ne jamais versionner de licence client réelle ;
- permettre un `.env.example` sûr tout en ignorant les vrais `.env*` ;
- ajouter un contrôle régulier des dépendances.

## 7. Lot 5 — tests, CI et protection de `dev`

Ce chantier doit précéder les gros refactors de métrologie/serveur autant que possible.

### Web CI

Pipeline cible :

1. installation des dépendances ;
2. Prisma generate ;
3. ESLint ;
4. `tsc --noEmit` ;
5. contrôle i18n existant ;
6. tests unitaires/intégration ;
7. `next build`.

### C# CI

Sur runner Windows :

1. restore ;
2. build serveur Release ;
3. build agent Release ;
4. tests C#.

### Priorités de tests

Web :

- auth/session 24 h ;
- permissions/licences ;
- mot de passe/reset ;
- crypto ;
- dates `DATETIME` et formats d'affichage ;
- formatage numérique (précision, locales, fallbacks) ;
- calculs métrologie ;
- runtime/verrous de métrologie.

C# :

- alarmes ;
- GSP/GSO ;
- scheduler/backoff/recovery ;
- coordination ports ;
- contrats repositories MySQL/SQL Server ;
- Hotline auth ;
- future couche commune métrologie.

Quelques E2E à forte valeur : login/dashboard, Surveillance, acquittement alarme, droits admin, expiration/logout.

### Après stabilisation CI

Protéger `dev` :

- PR obligatoire ;
- checks requis ;
- pas de push direct ordinaire.

## 8. Lots 6–8 — chantier métrologie

Ce chantier est détaillé dans `docs/architecture/metrology-refactor.md` et doit être considéré comme prioritaire après les correctifs sécurité et les garde-fous de test.

### 6 — couche C# commune de métrologie

Extraire de `HotlineApiServer` la logique normale de lecture/opération matérielle utilisée par ajustage et étalonnage.

La première extraction peut rester appelée par l'ancien endpoint Hotline afin de conserver la compatibilité pendant le refactor.

### 7 — endpoint/contrat métrologie dédié

Créer un contrat serveur propre aux opérations de métrologie.

Le Web ajustage/étalonnage ne doit plus dépendre de `/api/hotline/sensor-test` pour une lecture métier normale.

### 8 — runtime Web commun

Consolider ensuite les responsabilités communes actuellement réparties entre :

- `metrology-adjustment-session.ts` ;
- `metrology-calibration-session.ts` ;
- `metrology-reading-preview.ts` ;
- `metrology-reading-preview-session.ts` ;
- `metrology-session-watchdog.ts` ;
- helpers GSP/configuration/état déjà existants.

Partager session registry, verrouillage sonde, gateway de lecture et restauration ; garder les calculs et workflow propres à l'ajustage/étalonnage séparés lorsqu'ils sont réellement différents.

## 9. Lot 9 — consolider les fondations Web

À faire après/avec les tests, sans migration massive :

- centraliser définitivement l'émission/rotation des sessions ;
- formaliser un ADR des dates/fuseaux ;
- faire de `website/src/lib/http.ts` la convention claire pour les appels applicatifs standards ;
- converger les helpers `api.ts` / `http.ts` / wrappers plutôt que créer de nouveaux chemins concurrents ;
- centraliser les query keys TanStack Query par domaine ;
- partager les schémas de validation lorsque client/serveur décrivent le même DTO et qu'un partage apporte réellement de la valeur.

### 9A — standardiser les helpers de formatage dates et nombres

Ce chantier est volontairement placé dans les fondations Web, après l'installation des tests/CI et avant une généralisation des refactors de composants. Il est transversal mais suffisamment local pour rester une PR dédiée ou deux petites PR séparées (dates puis nombres) si le diff devient trop large.

#### État actuel

- `website/src/lib/date-display.ts` est le helper date canonique ; ses presets nommés et la migration des appels applicatifs ont été réalisés via les PR #78 et #79, après caractérisation en #77 ;
- `formatDbDateTimeIntl` reste disponible pour les besoins non couverts par les presets ;
- il ne faut donc pas créer un deuxième moteur de dates ;
- `website/src/lib/number-display.ts` est le helper numérique canonique introduit sur `refactor/number-display-helper` ;
- les formats UI `Intl.NumberFormat` / `toLocaleString` ont été centralisés, tandis que les `toFixed(...)` techniques restent volontairement séparés lorsqu'ils participent à un calcul, un protocole, une sérialisation ou un format machine.

#### Cible dates

Faire évoluer le helper existant pour que le format demandé soit explicite et réutilisable :

- presets typés simples (`date`, `time`, `dateTime`, `dateTimeSeconds`, noms exacts à confirmer) et/ou options `Intl.DateTimeFormatOptions` ;
- paramètres `locale`, `timeZone`, `fallback` conservés ;
- compatibilité temporaire des anciennes options pendant la migration si nécessaire ;
- aucune modification de la sémantique critique de `serializeStoredDbDateTime` et des `DATETIME` sans fuseau ;
- pas de format string maison si `Intl.DateTimeFormat` couvre le besoin.

Le format d'affichage doit rester distinct du parsing, de la sérialisation et de la sémantique de stockage.

#### Cible nombres / floats

Introduire une seule source de vérité pour l'affichage numérique, par exemple un helper `number-display.ts` ou `number-format.ts` après vérification finale des noms existants.

Le helper doit accepter au minimum :

- nombre de décimales ;
- éventuellement minimum/maximum de décimales lorsque le contexte le demande ;
- locale ;
- fallback pour valeur absente/invalide ;
- grouping/séparateur de milliers lorsque pertinent.

Privilégier `Intl.NumberFormat` pour la présentation utilisateur. Ne pas utiliser le helper pour modifier la valeur métier : aucun arrondi de stockage ou de calcul ne doit être introduit pour satisfaire un besoin purement visuel.

La précision ne doit pas devenir une constante universelle. Une température, un coefficient d'ajustage, une humidité ou une valeur d'étalon peuvent avoir des besoins d'affichage différents : **le nombre de décimales doit être un paramètre du contexte**.

#### Migration

1. ✅ caractériser le helper date avant modification — PR #77 ;
2. ✅ définir et implémenter les presets date — PR #78 ;
3. ✅ migrer tous les appels applicatifs date vers un format explicite — PR #79 ;
4. ✅ créer `number-display.ts` avec tests — `refactor/number-display-helper` ;
5. ✅ recenser `toFixed`, `toLocaleString`, `Intl.NumberFormat` et distinguer affichage vs contrat technique ;
6. ✅ migrer les usages d'affichage vers le helper canonique sans toucher aux valeurs métier ;
7. ⏳ supprimer les compatibilités date legacy uniquement lorsqu'aucun consommateur utile n'en dépend plus.

#### Tests obligatoires

Dates :

- formats/presets ;
- FR/EN ;
- fallbacks ;
- heure d'été/hiver ;
- `DATETIME` sans fuseau ;
- instant UTC lorsqu'il est explicitement traité comme tel.

Nombres :

- 0 et valeurs négatives/positives ;
- `null`, `undefined`, `NaN` ;
- 0/1/2/3 décimales et précisions supplémentaires si un domaine le demande ;
- arrondis de présentation ;
- `fr-FR` / `en-US` ;
- zéros finaux ;
- grouping des grands nombres.

## 10. Lot 10 — décomposition progressive du frontend

Zones identifiées comme volumineuses ou à responsabilité large :

- `website/src/components/monitoring-card.tsx` (~36 KB à la baseline) ;
- `alarm-acknowledge-dialog.tsx` (~32 KB) ;
- `monitoring-details-modal.tsx` (~25 KB) ;
- `admin-sidebar.tsx` ;
- `app-sidebar.tsx`.

La décomposition de Monitoring a déjà commencé (`components/monitoring-card/`, `components/monitoring-details/`). Continuer ce modèle lorsqu'on touche ces features.

Directions possibles :

**MonitoringCard**

- mesure principale ;
- statut/seuils ;
- métadonnées ;
- actions alarmes ;
- aperçu graphique.

**Acknowledge dialog**

- résumé de l'alarme ;
- formulaire d'acquittement ;
- snooze ;
- commentaire ;
- hook métier de soumission.

Ne pas faire une PR qui ne contient que des déplacements de dizaines de composants sans bénéfice fonctionnel/testable.

## 11. Lot 11 — serveur C# en monolithe modulaire

### 11A — Interface Segregation DB

Scinder progressivement `IDatabaseProvider` en interfaces par domaine. Les deux providers existants peuvent initialement implémenter toutes les nouvelles interfaces.

### 11B — `ThreadServeur`

Extraire un domaine à la fois, idéalement dans cet ordre selon risque/indépendance :

1. workers d'alarme ;
2. tâches périodiques/statistiques ;
3. GSP recovery/configuration ;
4. caches/settings ;
5. scheduler/coordination ports en dernier, car plus critique pour le matériel.

Adapter l'ordre si le code courant ou une feature rend un autre découpage plus sûr.

### 11C — configuration typée

Introduire des options validées par domaine au fur et à mesure des extractions. Éviter une PR géante qui remplace toutes les clés string à la fois.

## 12. Lot 12 — Agent V1, corrections ciblées

Le V1 reste en maintenance.

Points de sécurité à vérifier :

- authentifier/protéger `/shutdown` ;
- sécuriser le bootstrap/changement de `agent-secret` ;
- limiter strictement les Origins autorisées ;
- supprimer les endpoints legacy lorsqu'ils ne sont plus utilisés ;
- conserver DPAPI pour les secrets/session.

Ne pas migrer le runtime, l'architecture complète ou les notifications dans ce lot.

## 13. Lot 13 — Agent V2

Projet séparé à planifier ultérieurement :

- .NET LTS moderne au moment de l'implémentation ;
- SDK-style ;
- aucune connexion directe à MySQL/SQL Server ;
- communication avec le Web par API authentifiée ;
- notifications Windows natives ;
- services séparés pour enregistrement, session, heartbeat, notifications, API locale et lancement navigateur ;
- processus non élevé autant que possible ;
- revalidation des recommandations Microsoft au moment du chantier.

## 14. Performance et observabilité — transversal

À intégrer dans les PR concernées plutôt que créer une « refonte performance » abstraite :

- préserver la séparation Surveillance récente / historique détaillé ;
- profiler avant d'ajouter cache/index ;
- évaluer keyset pagination pour historique profond ;
- utiliser des `select` Prisma minimaux ;
- surveiller N+1 ;
- analyser contention des locks/connexions C# avant changement ;
- introduire des correlation IDs Web → Serveur → Agent pour les flux alarme/notification lorsque pertinent ;
- définir une politique de logs/PII ;
- ajouter des diagnostics internes de santé : DB principale, DB mesures, licence, SMTP, scheduler, agents, Hotline.

## 15. Découpage des futures PR

Exemples de branches cohérentes :

```text
fix/hotline-security
fix/auth-absolute-session
refactor/secret-encryption-key
chore/ci-quality-gates
refactor/metrology-server-service
refactor/metrology-api-boundary
refactor/metrology-shared-runtime
refactor/formatting-helpers
refactor/database-provider-interfaces
refactor/thread-server-alarm-workers
fix/agent-v1-local-security
```

Les noms sont indicatifs. Le préfixe doit décrire le type d'opération ; ne pas utiliser `agent/`.

Après chaque PR mergée : vérifier réellement le nouveau HEAD de `dev` avant de créer la suivante. Ne pas empiler cinq branches de refactor depuis un ancien `dev`.

## 16. Choses explicitement déconseillées

- réécrire entièrement le service C# maintenant ;
- migrer tout .NET Framework uniquement « pour faire moderne » ;
- faire un `refactor/clean-code` global ;
- déplacer tout le frontend vers `features/` en une fois ;
- dupliquer les helpers métrologie existants sous de nouveaux noms ;
- rendre ajustage et étalonnage identiques artificiellement : partager l'infrastructure commune, pas les règles métier qui diffèrent ;
- paralléliser les lectures matérielles sans maîtriser les ports/modules ;
- optimiser sans mesure ;
- merger automatiquement les PR.
