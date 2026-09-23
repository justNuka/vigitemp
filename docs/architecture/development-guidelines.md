# Guide de développement et conventions d'architecture VigiSensys

> Référence pratique avant toute modification de code.
>
> Ce document décrit les conventions observées et la direction retenue lors de l'audit du 28/08/2026. Il ne remplace jamais la vérification du code courant et des PR récentes avant de commencer un lot.

## 1. Avant d'écrire du code

Toujours commencer par :

1. vérifier le HEAD actuel de `dev`, les PR ouvertes et les dernières PR mergées pertinentes ;
2. rechercher une branche déjà liée au sujet ;
3. lire le backlog/document fonctionnel concerné ;
4. rechercher les helpers, composants, services et abstractions déjà existants ;
5. vérifier si le comportement remonté n'a pas déjà été corrigé ;
6. identifier les invariants métier, les impacts droits/licence, dates/fuseaux, performances et compatibilité MySQL/SQL Server ;
7. créer depuis le HEAD courant de `dev` une branche dont le préfixe décrit le type d'opération (`fix/`, `feature/`, `refactor/`, `docs/`, `chore/`, etc.) ; ne pas utiliser `agent/`.

Ne pas décider d'une architecture uniquement à partir du nom d'un fichier. Lire les appels entrants/sortants et les dépendances avant d'extraire quoi que ce soit.

## 2. Principes généraux

### 2.1 Favoriser le monolithe modulaire

VigiSensys est un produit on-premise. L'objectif est une architecture lisible et testable, pas une architecture distribuée.

Préférer :

- des services applicatifs ciblés ;
- des helpers métier explicites ;
- des repositories/gateways aux responsabilités limitées ;
- des composants React organisés par domaine ;
- des interfaces lorsqu'il existe réellement plusieurs implémentations ou un besoin de test/découplage.

Éviter sans besoin démontré :

- microservices ;
- Redis ;
- Kafka ;
- CQRS ;
- interfaces pour chaque fonction pure ;
- frameworks maison qui répliquent Prisma, un ORM ou le système de composants UI.

### 2.2 Refactorer par responsabilités, pas par taille seule

Un gros fichier n'est pas automatiquement mauvais. L'extraction devient prioritaire lorsque le fichier :

- possède plusieurs raisons indépendantes de changer ;
- mélange transport, métier et infrastructure ;
- duplique une logique critique ;
- devient difficile à tester ;
- contient un sous-ensemble réutilisé ailleurs ;
- oblige une modification locale à toucher des zones sans rapport.

Ne pas transformer chaque bloc de 20 lignes en service ou composant. Le but est de rendre les frontières métier visibles.

### 2.3 Conserver une seule source de vérité

Lorsqu'un helper existe déjà, l'améliorer ou le généraliser si nécessaire plutôt que créer un deuxième helper presque identique.

Une nouvelle abstraction ne doit être ajoutée qu'après avoir recherché une abstraction équivalente dans le dépôt.

## 3. Web — Next.js / React / TypeScript

### 3.1 Routes API

Avant toute nouvelle route, lire `website/docs/API_CONVENTIONS.md`.

Réutiliser en priorité :

- `website/src/lib/api-wrappers.ts` pour les wrappers d'authentification, d'autorisation et le comportement commun des routes ;
- `website/src/lib/api-response.ts` pour conserver des réponses API cohérentes ;
- `website/src/lib/api-logger.ts` et les helpers d'audit existants lorsque l'action doit être tracée ;
- `website/src/lib/server-auth.ts`, `authz.ts`, `authorization-domain.ts` et `permissions.ts` pour les contrôles d'accès ;
- `website/src/lib/license-access.ts`, `license-guards.ts` et `parameter-license-guards.ts` pour les règles liées aux licences.

Ne pas réimplémenter manuellement une vérification de profil/droit/licence dans chaque route si une fonction centrale peut porter la règle.

Une route doit principalement :

1. valider l'entrée ;
2. appliquer authentification/autorisation ;
3. appeler le service ou helper métier ;
4. transformer le résultat en réponse HTTP.

Elle ne doit pas devenir le moteur principal d'un workflow complexe.

### 3.2 Requêtes HTTP côté Web

Le point d'entrée commun actuel est `website/src/lib/http.ts`.

Il contient notamment :

- `fetchJson` ;
- `getJson` ;
- `postJson` ;
- la gestion centralisée des erreurs ;
- le comportement commun de refresh / 401.

Pour les appels applicatifs vers les APIs Next.js, utiliser ces helpers lorsque leur contrat correspond au besoin plutôt que multiplier les `fetch()` bruts avec chacun leur logique d'erreur/authentification.

Exception : un flux spécifique peut nécessiter `fetch` directement (streaming, fichier, communication serveur-vers-service externe, etc.). Dans ce cas, documenter la raison si elle n'est pas évidente et réutiliser au minimum les règles d'erreur/authentification pertinentes.

Pour les données client cacheables, TanStack Query doit rester la convention privilégiée. Conserver des hooks métier explicites (`useAlarms`, `useAdjustments`, etc.) mais centraliser :

- la fonction d'accès HTTP ;
- les query keys ;
- l'invalidation ;
- le mapping d'erreurs.

Éviter qu'un composant visuel définisse lui-même toute la stratégie de cache et les règles HTTP.

### 3.3 Prisma et accès aux données

Points d'entrée actuels importants :

- `website/src/lib/prisma.ts` ;
- `website/src/lib/sql-provider.ts` ;
- `website/src/lib/metrology-db.ts` pour une partie des compatibilités SQL de métrologie ;
- `website/src/lib/repositories/` lorsqu'un repository existe déjà.

Règles :

- utiliser des `select` minimaux lorsque les volumes sont importants ;
- éviter les N+1 ;
- conserver la compatibilité MySQL / SQL Server dans les zones où elle est déjà supportée ;
- ne pas disperser des différences de dialecte SQL dans les composants ou routes ;
- paramétrer les valeurs SQL ;
- pour `$queryRawUnsafe`, ne jamais injecter une valeur utilisateur dans la chaîne. Les identifiants dynamiques doivent provenir de helpers contrôlés tels que `quoteIdentifier` / `getTableReference` lorsque ceux-ci sont adaptés au cas.

Ne pas ajouter un repository uniquement pour envelopper une seule ligne Prisma sans bénéfice. En revanche, un repository est pertinent lorsque la requête constitue une frontière métier/infrastructure, doit être partagée, ou possède deux implémentations/provider-specific.

### 3.4 Dates, `DATETIME` et fuseaux horaires

Cette règle est critique : des régressions terrain ont déjà été causées par une interprétation UTC d'un `DATETIME` qui représentait en réalité une heure locale sans fuseau.

Helper canonique actuel : `website/src/lib/date-display.ts`.

Fonctions à connaître :

- `parseDbDateTime` ;
- `serializeDbDateTime` ;
- `serializeStoredDbDateTime` ;
- `parseStoredDbDateTime` ;
- `formatStoredDbDateTime` ;
- `formatDbDateTime` ;
- `formatDbDateTimeIntl`.

`serializeStoredDbDateTime` est spécialement prévu pour les colonnes MySQL/MSSQL `DATETIME` sans fuseau exposées par Prisma sous forme de `Date`. Il lit les composantes UTC du wrapper afin de préserver les composantes d'heure stockées et d'éviter d'ajouter artificiellement le décalage du navigateur/serveur.

`parseStoredDbDateTime` et `formatStoredDbDateTime` prolongent ce contrat côté consommateur lorsqu'une valeur stockée a déjà traversé JSON (par exemple une chaîne ISO terminée par `Z`). Ils préservent les composantes d'heure de la base ; `formatStoredDbDateTime` n'applique jamais de reconversion `timeZone`.

Toujours distinguer deux catégories :

**Instant réel** — JWT, expiration de session, heartbeat, horodatage technique absolu :

- UTC ;
- ISO 8601 avec information de fuseau/`Z` ;
- côté C#, préférer `DateTimeOffset` lorsqu'un instant absolu est représenté.

**Heure locale historique stockée dans un `DATETIME` sans fuseau** :

- préserver les composantes de la base ;
- ne pas faire un `new Date(value)` arbitraire puis laisser JS appliquer un décalage ;
- réutiliser les helpers existants ;
- tester heure d'été, heure d'hiver et transitions DST lorsque le code de date est modifié.

Si une nouvelle convention de stockage est introduite, documenter explicitement la sémantique de la colonne plutôt que compter sur le nom `Date_Heure_*`.

#### Cible du refactor de formatage des dates

Le helper actuel est déjà partiellement paramétrable : `formatDbDateTime` accepte notamment `withSeconds`, `withYear`, `dateOnly`, `timeOnly`, `locale` et `timeZone`, et `formatDbDateTimeIntl` accepte des `Intl.DateTimeFormatOptions`.

Le chantier de refactor ne doit donc pas recréer un second système de dates. Il doit rendre **le format d'affichage explicite et homogène** tout en préservant strictement les règles de parsing/sérialisation ci-dessus.

Direction recommandée :

- conserver les fonctions de parsing et de sérialisation séparées des fonctions de présentation ;
- faire évoluer le helper canonique pour accepter un paramètre de format clair, par exemple un preset (`date`, `time`, `dateTime`, `dateTimeSeconds`, etc.) et/ou des options `Intl.DateTimeFormatOptions` ;
- conserver `locale`, `timeZone` et `fallback` comme paramètres explicites lorsque nécessaires ;
- ne pas introduire un format string maison si `Intl.DateTimeFormat` ou quelques presets typés couvrent le besoin ;
- permettre une migration progressive des anciens appels (`withSeconds`, `dateOnly`, etc.) afin d'éviter une PR de remplacement global risquée ;
- utiliser les mêmes presets dans l'UI, les tooltips, les tableaux et les exports destinés à l'humain lorsque la sémantique est identique ;
- ne jamais utiliser un helper de présentation pour décider de la valeur stockée en base ou d'un instant métier.

Exemples conceptuels de cible, les noms exacts restant à confirmer lors du chantier après lecture du code courant :

```ts
formatDbDateTime(value, { format: "date", locale })
formatDbDateTime(value, { format: "dateTimeSeconds", locale })
formatDbDateTimeIntl(value, {
  locale,
  intl: { day: "2-digit", month: "2-digit", year: "numeric" },
})
```

Le refactor doit ajouter des tests couvrant au minimum : formats/presets supportés, fallback invalide, FR/EN, heure d'été/hiver et conservation des `DATETIME` sans fuseau.

### 3.5 Formatage des nombres et valeurs flottantes

Depuis le Lot 9A, `website/src/lib/number-display.ts` est le helper canonique de présentation numérique. Ne pas créer un second moteur de formatage local dans un composant ou une feature : réutiliser `formatNumber` ou un wrapper métier existant comme `formatMeasureValue`.

Le helper est réservé à la **présentation**. Les formats techniques déterministes, arrondis de calcul, protocoles matériels, sérialisations DB/API et exports machine peuvent conserver une logique dédiée lorsque leur contrat l'exige.

L'API doit être paramétrable et rester simple. Elle doit permettre au minimum :

- de choisir le nombre de décimales ;
- si nécessaire, de distinguer nombre minimal et maximal de décimales ;
- de choisir la locale (`fr-FR`, `en-US` ou locale applicative) ;
- de définir un fallback pour `null`, `undefined`, `NaN` ou valeur invalide ;
- de contrôler le séparateur de milliers/grouping lorsque le contexte le nécessite.

API canonique :

```ts
formatNumber(value, { decimals: 2, locale })
formatNumber(value, { minimumDecimals: 0, maximumDecimals: 3, locale })
formatNumber(value, { fallback: "-", grouping: false })
```

Pour les mesures, conserver `formatMeasureValue(value, decimals, locale)` comme wrapper métier : il applique la précision de la sonde sans modifier la valeur brute.

L'implémentation doit privilégier `Intl.NumberFormat` pour l'affichage localisé plutôt que `toFixed()` dans l'UI. `toFixed()` peut rester pertinent pour un format technique/machine explicitement défini, mais ne doit pas devenir la convention d'affichage utilisateur.

Règles importantes :

- **ne jamais arrondir la valeur métier avant les calculs ou avant la persistance uniquement pour l'affichage** ; le helper retourne une représentation, pas une nouvelle valeur de référence ;
- séparer parsing et formatage : accepter `12,5` dans un champ FR relève d'un helper de parsing/validation, pas du helper d'affichage ;
- ne pas concaténer l'unité dans tous les composants si un besoin partagé `formatMeasurement` apparaît, mais ne pas créer ce helper spécialisé avant d'avoir plusieurs usages réels ;
- les exports machine/CSV ne doivent pas hériter aveuglément de la locale de l'UI si leur contrat exige un séparateur ou une précision déterministe ;
- pour les mesures, coefficients et calculs métrologiques, la précision d'affichage doit être un paramètre du contexte et non une constante globale supposée correcte pour tous les types de sonde.

Commande dédiée : `pnpm test:number-display`.

Tests minimum du helper numérique :

- `0`, valeurs positives/négatives ;
- `null` / `undefined` / `NaN` ;
- 0, 1, 2, 3 décimales et valeurs supérieures si un domaine le demande ;
- arrondis aux limites ;
- `fr-FR` et `en-US` ;
- présence/absence de zéros finaux selon les options ;
- grands nombres et grouping si supporté.

### 3.6 Composants React et réutilisation UI

Avant de créer un composant générique, rechercher notamment dans :

- `website/src/components/ui/` ;
- `website/src/components/data-table/` ;
- `website/src/components/page-header-base.tsx` et `page-header.tsx` ;
- `website/src/components/empty-state.tsx` ;
- `website/src/components/status-badge.tsx` ;
- `website/src/components/multi-select-filter.tsx` ;
- `website/src/components/table-search.tsx` ;
- `website/src/components/file-upload-shared.tsx` et `file-upload-shared/` ;
- `website/src/components/stepper-import-shared.tsx` et `stepper-import-shared/`.

Les zones complexes ont déjà commencé leur décomposition. Par exemple :

- `monitoring-card.tsx` possède déjà `components/monitoring-card/monitoring-card-header.tsx`, `monitoring-card-chart-preview.tsx`, `rssi-bars.tsx` et `rssi.ts` ;
- `monitoring-details-modal.tsx` possède déjà un dossier `components/monitoring-details/`.

Lors d'un prochain changement dans ces zones, poursuivre l'extraction existante au lieu de créer un deuxième modèle d'organisation.

Trois niveaux de composants sont recommandés :

1. **primitives UI** : bouton, dialogue, input, table — aucune règle VigiSensys ;
2. **briques partagées neutres** : header de page, status badge, filtre, table, empty state ;
3. **composants de feature** : surveillance, alarmes, métrologie, administration.

Un composant de feature peut connaître le métier. Une primitive UI ne le doit pas.

Extraire lorsqu'une sous-partie :

- a un nom métier clair ;
- possède un état ou comportement autonome ;
- est testable séparément ;
- est réutilisée ;
- rend le composant parent nettement plus lisible.

Ne pas créer un "mega component générique" piloté par des dizaines de flags juste pour mutualiser du JSX visuellement proche.

### 3.7 Organisation par feature

La direction à long terme peut converger progressivement vers :

```text
src/
  app/                    # routes et composition Next.js
  features/
    monitoring/
    alarms/
    metrology/
    administration/
    notifications/
    authentication/
  shared/
    ui/
    api/
    auth/
    dates/
    sensors/
    utils/
```

Cette arborescence est une direction, pas une migration à effectuer en bloc. Déplacer un fichier lorsqu'un chantier fonctionnel/refactor justifie le déplacement et que le diff reste relisible.

### 3.8 Internationalisation

Toute nouvelle chaîne visible par l'utilisateur doit respecter le mécanisme FR/EN existant avec `next-intl`.

Ne pas corriger une interface uniquement en français en introduisant une dette EN, même si le retour terrain initial est en français.

## 4. Métrologie côté Web

Les opérations de métrologie disposent déjà de helpers communs ou spécialisés. Avant toute extraction, inspecter au minimum :

- `website/src/lib/metrology-adjustment-session.ts` ;
- `website/src/lib/metrology-calibration-session.ts` ;
- `website/src/lib/metrology-reading-preview.ts` ;
- `website/src/lib/metrology-reading-preview-session.ts` ;
- `website/src/lib/metrology-session-watchdog.ts` ;
- `website/src/lib/metrology-calibration-calculations.ts` ;
- `website/src/lib/metrology-calibration-sensor-state.ts` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-gsp-configuration-restore.ts` ;
- `website/src/lib/metrology-db.ts`.

Ne pas réécrire ces helpers sous un autre nom sans vérifier ce qu'ils couvrent déjà.

La direction détaillée est décrite dans `docs/architecture/metrology-refactor.md`.

Règle importante : ajustage et étalonnage doivent partager le runtime commun de session/lecture/verrouillage/restauration, mais conserver séparément leurs règles de calcul et leurs workflows métier lorsque ceux-ci diffèrent.

## 5. Serveur C#

### 5.1 Modèle d'accès base actuel

La documentation historique peut encore mentionner `Database.cs`. Ce n'est plus la description correcte de l'architecture actuelle.

Les fichiers centraux sont notamment :

- `Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/MySqlDatabaseProvider.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/MetrologyDatabaseProvider.cs`.

`IDatabaseProvider` regroupe aujourd'hui beaucoup de domaines. La cible est de le scinder progressivement par responsabilités, par exemple :

- `IMeasurementRepository` ;
- `IAlarmRepository` ;
- `ISensorRepository` ;
- `IMetrologyRepository` ;
- `ISettingsRepository` ;
- `IAuditRepository` ;
- `IGspRecoveryRepository`.

Première étape recommandée : permettre aux providers MySQL et SQL Server existants d'implémenter plusieurs petites interfaces sans déplacer immédiatement tout le SQL. La séparation des classes concrètes pourra venir ensuite par domaine.

Ne pas créer d'ORM maison. Garder du SQL explicite lorsque c'est le modèle existant et isoler uniquement les différences réelles de dialecte.

La logique métier commune MySQL/SQL Server doit vivre au-dessus des providers, pas être copiée deux fois dans les deux fichiers SQL.

### 5.2 `ThreadServeur`

`ThreadServeur.cs` concentre actuellement plusieurs responsabilités : scheduling, coordination des ports, GSP recovery/configuration, backoff, caches, polling/retry des alarmes, statistiques périodiques, maintenance, timers.

Refactorer progressivement vers des composants nommés par responsabilité. Exemples de directions, à adapter après lecture du code courant :

- `SensorScheduler` ;
- `PortCoordinator` ;
- `GspRecoveryCoordinator` ;
- `GspConfigurationCoordinator` ;
- `AlarmPollingWorker` ;
- `AlarmRetryWorker` ;
- `MonthlyStatisticsDispatcher` ;
- caches dédiés aux paramètres sondes/métrologie.

La cible de `ThreadServeur` est principalement : démarrer, arrêter et coordonner ces services.

Ne pas réécrire le scheduler, les verrous de ports ou les stratégies de backoff sans tests de caractérisation et compréhension du comportement avec plusieurs centaines de sondes.

### 5.3 Ports série, modules et concurrence

L'accès matériel est une zone critique.

Règles :

- une seule couche doit décider de la coordination d'un même port/module ;
- conserver explicitement les timeouts ;
- les accès concurrents doivent être sérialisés au niveau approprié, pas via des `lock` dispersés dans plusieurs features ;
- toute modification de verrou doit tester simultanéité, timeout, annulation et libération en cas d'exception ;
- ne pas paralléliser des lectures série uniquement pour réduire la durée apparente d'une requête.

Le Web lit actuellement certaines sondes de métrologie séquentiellement précisément pour laisser le serveur C# sérialiser l'accès aux ports partagés. Préserver cet invariant tant que la coordination serveur n'offre pas un contrat plus explicite.

### 5.4 Configuration

Éviter l'accumulation de clés string appelées partout via `GetSetting...`.

La direction recommandée est de regrouper et valider les paramètres au démarrage dans des objets typés, par exemple :

- `ServerOptions` ;
- `SchedulerOptions` ;
- `AlarmOptions` ;
- `GspOptions` ;
- `DatabaseOptions` ;
- `MetrologyOptions` ;
- `HotlineOptions`.

Les noms sont indicatifs. Ne pas créer tous ces objets mécaniquement en une PR.

Une configuration de sécurité indispensable doit **fail closed / fail fast**. Ne pas fournir un mot de passe, une clé API ou un compte administrateur par défaut pour permettre au service de continuer silencieusement.

### 5.5 `HotlineApiServer`

`HotlineApiServer` doit converger vers un rôle d'adaptateur HTTP/diagnostic :

- écouter ;
- authentifier/autoriser ;
- valider le DTO ;
- appliquer les limites HTTP ;
- appeler des services métier/matériels ;
- mapper le résultat ;
- journaliser le diagnostic.

Il ne doit pas être la dépendance métier normale de l'ajustage et de l'étalonnage.

Le chantier de séparation est détaillé dans `docs/architecture/metrology-refactor.md`.

## 6. Agent Windows

### 6.1 V1

Ne pas lancer un gros refactor du V1. Appliquer uniquement les corrections fonctionnelles ou de sécurité nécessaires.

Conserver les bonnes primitives déjà présentes, notamment la protection DPAPI des secrets/session.

Le listener principal est en loopback, mais `localhost` n'est pas une frontière de confiance suffisante à lui seul. Les endpoints locaux sensibles doivent être authentifiés/protégés et les Origins acceptées doivent rester strictes.

### 6.2 V2

La V2 est le bon endroit pour :

- passer sur un .NET LTS moderne supporté au moment de l'implémentation ;
- utiliser un projet SDK-style ;
- supprimer tout accès direct de l'agent aux bases ;
- passer par une API Web authentifiée pour l'enregistrement/session/données ;
- adopter les notifications Windows natives plutôt que les anciens balloon tips ;
- isoler les responsabilités (`NotificationService`, `HeartbeatService`, `LocalApi`, etc.).

Revalider la documentation officielle Microsoft au moment de ce chantier : API Windows App SDK disponible, prérequis de runtime et limitations des notifications pour les processus élevés peuvent évoluer.

## 7. Sécurité

Principes non négociables :

- aucun secret réel, mot de passe DB, clé JWT, clé Hotline, clé Agent ou licence client opérationnelle dans Git ;
- clé de chiffrement applicative distincte des clés d'authentification ;
- fail closed lorsque l'authentification d'un service est mal configurée ;
- comptes DB de moindre privilège, pas `root`/`sa` en production ;
- validation des entrées côté serveur ;
- pas de confiance accordée à une donnée parce qu'elle provient de l'UI ;
- ne jamais logger JWT, mot de passe, clé API ou secret ;
- limiter taille des requêtes, durée, concurrence et fréquence sur les endpoints capables d'agir sur le matériel ;
- utiliser HTTPS lorsque le trafic quitte la machine et que l'environnement de déploiement le permet.

Pour les sessions Web, toute rotation de token doit préserver l'échéance absolue de session ; une activité continue ne doit pas permettre une session infinie.

## 8. Logs et observabilité

Préférer des logs structurés ou au minimum des messages avec identifiants explicites plutôt que des concaténations ambiguës.

Pour une chaîne alarmes/notifications, conserver des identifiants corrélables entre Web, serveur et agent lorsque cela est possible.

Tout cache doit documenter :

- qui l'alimente ;
- qui l'invalide ;
- quand une entrée disparaît ;
- TTL/taille max s'ils existent ;
- comportement après redémarrage.

## 9. Performances

Le produit doit rester utilisable avec plusieurs centaines de sondes et un historique volumineux.

Règles :

- la page Surveillance consomme un ensemble récent et borné ; elle ne doit pas devenir une requête d'historique complet ;
- paginer l'historique détaillé ; pour les très grandes profondeurs, évaluer un curseur/keyset plutôt qu'un `OFFSET` très élevé ;
- mesurer avec slow query log / `EXPLAIN` / profiling avant d'ajouter des indexes ou du cache ;
- éviter les N+1 ;
- ne pas instancier des centaines de graphiques lourds si un aperçu différé suffit ;
- virtualiser uniquement si le profilage montre que c'est nécessaire ;
- côté C#, ne pas changer les connexions/verrous globaux sur intuition : mesurer la contention et tester le comportement matériel.

## 10. Tests

Avant une extraction risquée, ajouter si possible un test de caractérisation qui capture le comportement actuel attendu.

Priorités Web :

- session absolue et refresh ;
- permissions/licences ;
- règles de mot de passe ;
- chiffrement des secrets ;
- helpers de date, leurs formats/presets et les cas `DATETIME` ;
- helper de formatage numérique : décimales, locales, fallbacks et arrondis d'affichage ;
- calculs ajustage/étalonnage ;
- verrouillage/session métrologie.

Priorités C# :

- règles d'alarme ;
- protocoles GSP/GSO ;
- scheduler/backoff/recovery ;
- coordination des ports ;
- repositories MySQL/SQL Server par tests de contrat ;
- authentification Hotline ;
- service commun de lecture métrologique.

Pour les flows critiques, compléter par quelques tests E2E plutôt que chercher à tout reproduire en E2E.

## 11. Checklist avant PR

- Ai-je réutilisé les helpers existants ?
- Ai-je introduit deux sources de vérité ?
- Ma route/composant/provider a-t-il une responsabilité identifiable ?
- Les droits et la licence sont-ils vérifiés ?
- Ai-je distingué instant UTC et `DATETIME` local ?
- Pour un affichage de date/nombre, ai-je utilisé ou amélioré le helper canonique au lieu d'introduire un formatage local (`toFixed`, concaténation, `new Date` + format ad hoc) ?
- Ai-je considéré MySQL et SQL Server si la zone est multi-provider ?
- Ai-je considéré 500–850 sondes / gros historique si la requête est volumétrique ?
- Les timeouts et verrous matériels sont-ils toujours sûrs ?
- Ai-je ajouté/actualisé FR et EN ?
- Les tests couvrent-ils la règle risquée ?
- Le diff contient-il uniquement le lot prévu ?
- La documentation/backlog concerné est-il à jour ?
