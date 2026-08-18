# Backlog retours terrain — 17/08/2026

## Contexte

Ce document centralise les retours terrain transmis sous forme de captures annotées autour du 17 août 2026.

Objectif : permettre une reprise immédiate du travail dans une nouvelle conversation, sans avoir à reconstituer le contexte. Chaque point décrit donc le symptôme, l'état du code, le comportement attendu, les zones à vérifier, les critères d'acceptation et, lorsqu'il existe, le lot GitHub associé.

## Référence de travail

- Dépôt : `justNuka/vigitemp`
- Branche cible : `dev`
- Workflow : une branche dédiée par lot, PR vers `dev`, puis attente du merge avant de démarrer le lot suivant.
- PR #13 : expiration automatique des sessions de métrologie.
- PR #14 : état `E` des sondes pendant l'étalonnage.
- PR #15 : droits administrateur basés sur les autorisations.
- PR #16 : fiabilisation des états des sondes et de la lecture simple en métrologie.
- PR #17 : corrections affichage mesures, dates, analyse d'impact, superposition de courbes et audit.
- PR #18 : création et centralisation de ce backlog.
- PR #19 : complément B17-006, graphique Surveillance limité aux 125 dernières mesures du jour. **Mergée dans `dev` le 18/08/2026.**
- PR #20 : correction B17-011 sur le temps relatif des alarmes actives du dashboard. **PR ouverte, en attente de validation/merge.**

### Statuts utilisés

- `CORRIGE_DEV` : correctif déjà mergé dans `dev`; validation terrain encore possible.
- `PR_OUVERTE` : correctif implémenté sur une branche et PR ouverte vers `dev`, mais pas encore mergée.
- `A_VALIDER` : un correctif existe ou un ancien backlog indique le point comme traité, mais il faut le retester sur la dernière version de `dev`.
- `A_FAIRE` : comportement non couvert et nécessitant une modification.
- `A_INVESTIGUER` : la cause exacte doit être confirmée avant modification.

---

## B17-001 — Décalage de +2 h dans le détail d'une alarme

**Statut : `CORRIGE_DEV` — PR #17**

### Retour

Dans le détail/analyse d'une alarme, les champs de début et de fin ainsi que les points du graphique apparaissaient environ deux heures après l'heure réellement stockée.

### Cause identifiée

Des `DATETIME` MySQL stockés sans information de fuseau étaient interprétés comme des dates UTC puis reconvertis en heure locale.

### Correctif présent

La PR #17 fait utiliser la sérialisation dédiée aux dates stockées en base (`serializeStoredDbDateTime()`) sur les routes concernées afin de ne plus ajouter artificiellement le décalage local.

### Validation terrain attendue

- comparer `Debut_Alarme` et `Fin_Alarme` en base avec le détail affiché ;
- vérifier la même heure dans le tooltip du graphique ;
- vérifier un cas d'alarme ouverte et un cas d'alarme terminée ;
- aucun décalage de +1 h / +2 h ne doit réapparaître.

---

## B17-002 — Session utilisateur encore utilisable après plus de 24 h

**Statut : `A_INVESTIGUER`**

### Retour

Un poste n'ayant pas accédé à VigiSensys depuis plus de 24 heures peut rouvrir le site et retrouver une session authentifiée sans nouvelle demande d'identifiant/mot de passe.

### Comportement attendu

La durée de session doit être explicite et cohérente avec la politique produit. Si la session applicative est expirée, l'ouverture d'une route protégée doit demander une nouvelle authentification, sauf si un mécanisme SSO volontaire est activé.

### Investigation à mener

- retrouver le mécanisme de création et de validation du cookie/session côté Next.js ;
- vérifier `maxAge`, `expires`, éventuel refresh silencieux et durée du JWT/token ;
- vérifier si la session est prolongée à chaque requête ;
- distinguer authentification interne et éventuel SSO Windows/AD ;
- vérifier la persistance après fermeture complète du navigateur puis après redémarrage du poste.

### Critères d'acceptation

- la durée réelle correspond à la durée configurée/documentée ;
- une session expirée ne donne plus accès aux routes protégées ;
- aucune reconnexion silencieuse n'a lieu hors SSO explicitement configuré ;
- le comportement est identique entre dashboard utilisateur et administration.

---

## B17-003 — Anciennes informations d'ajustage visibles lors d'une nouvelle opération

**Statut : `A_FAIRE`**

### Retour

La page **Réaliser un ajustage** peut afficher, alors qu'aucune nouvelle opération n'est réellement en cours, le bandeau `Ajustage en cours` ainsi que les exports XML issus d'une ancienne session de métrologie.

### Comportement attendu

Une nouvelle entrée sur l'écran d'ajustage ne doit réafficher que :

- une session serveur réellement active et non expirée ; ou
- les données explicitement rattachées à l'opération que l'utilisateur vient de reprendre.

Les exports d'une opération terminée ne doivent pas être présentés comme appartenant à la future opération.

### Pistes de vérification

- état de session d'ajustage côté API/backend ;
- distinction entre dernière opération terminée et session active ;
- données restaurées depuis `localStorage`, `sessionStorage`, React state ou cache de requêtes ;
- logique de chargement de la liste des exports ;
- nettoyage lors de la fin, expiration ou annulation d'une session.

### Critères d'acceptation

- aucune ancienne liste d'exports n'apparaît au démarrage d'une nouvelle opération ;
- une session réellement active reste récupérable après rechargement de page ;
- la fin/annulation/expiration nettoie l'état présenté à l'écran ;
- le nettoyage ne supprime pas les exports historiques enregistrés en base.

---

## B17-004 — Anciennes valeurs de formulaire et anciens points d'ajustage conservés

**Statut : `A_FAIRE` — à traiter avec B17-003 si la cause est commune**

### Retour

Dans l'écran d'ajustage, des informations provenant d'une ancienne session peuvent être retrouvées dans le milieu d'inter-comparaison et dans les points d'ajustage, par exemple des anciennes valeurs de premier/deuxième point.

### Comportement attendu

Lorsqu'une nouvelle opération est créée, les champs spécifiques à l'opération précédente doivent repartir de leur valeur initiale. Une reprise de session ne doit restaurer ces valeurs que si le backend confirme que la session correspondante est toujours active.

### Points à auditer

- initialisation du formulaire ;
- effets React de restauration de session ;
- cache des endpoints métrologie ;
- valeurs par défaut venant de la dernière opération enregistrée ;
- reset effectué après arrêt, annulation et expiration 1 h 30.

### Critères d'acceptation

- nouvelle opération = points d'ajustage vides/non validés ;
- nouvelle opération = aucun état transitoire de l'ancienne opération ;
- reprise d'une session active = valeurs courantes correctement restaurées ;
- terminer puis démarrer une autre session ne mélange aucune donnée entre les deux.

---

## B17-005 — Bandeau global `Ajustage en cours` masque des boutons

**Statut : `A_FAIRE`**

### Retour

Pendant un ajustage, le panneau flottant global en haut à droite (`Ajustage en cours`, chronomètre et bouton d'arrêt) recouvre des boutons et zones interactives de la page Surveillance. Il n'est pas déplaçable.

### Comportement attendu

Le suivi de session doit rester disponible partout sans empêcher l'utilisation de l'application.

### Solution UX à privilégier

Rendre le bandeau non bloquant, par exemple :

- panneau déplaçable avec position bornée à la fenêtre ;
- panneau repliable/minimisable avec un état compact ;
- ou emplacement fixe réservé dans la mise en page ne recouvrant pas les actions.

Le choix final doit conserver un accès simple à l'arrêt de l'ajustage et au temps restant.

### Critères d'acceptation

- aucun bouton ne devient inaccessible à cause du bandeau ;
- le bandeau reste visible ou facilement récupérable ;
- son déplacement/repli ne casse pas en responsive ;
- le bouton d'arrêt et le timer restent fonctionnels ;
- la position éventuelle ne peut pas sortir définitivement de l'écran.

---

## B17-006 — Détail Surveillance : plage par défaut du jour + graphique limité aux 125 dernières mesures

**Statut : `CORRIGE_DEV` — PR #19**

### Retour initial

Un clic sur le graphique d'une carte Surveillance pouvait charger l'intégralité de l'historique du lieu dans la modale, notamment dans l'onglet tableau.

### Socle déjà présent dans `dev`

La PR #17 :

- sélectionne automatiquement la journée courante à l'ouverture ;
- construit une vraie plage 00:00:00 → 23:59:59.999 ;
- interroge le backend avec cette plage pour le graphique et le tableau ;
- initialise visuellement le sélecteur sur la journée courante.

### Complément livré par la PR #19

Branche : `agent/surveillance-default-125-measures`

Fichiers principaux :

- `website/src/components/monitoring-details-modal.tsx`
- `website/src/components/monitoring-details/use-monitoring-range-measurements.ts`

Comportement :

- la journée courante reste la plage visible par défaut ;
- le graphique charge au maximum les 125 mesures les plus récentes de cette journée ;
- les points sont retriés chronologiquement avant affichage ;
- le tableau reste indépendant et paginé sur toutes les mesures de la journée ;
- le compteur affiche `X dernières mesures` sur la plage du jour ;
- une autre plage de dates continue à charger l'ensemble de la plage avec le compteur classique.

### Validation terrain à faire

- ouvrir un lieu depuis Surveillance sans changer la plage ;
- vérifier que la plage affichée est aujourd'hui ;
- si au moins 125 mesures existent aujourd'hui, vérifier le libellé `125 dernières mesures` ;
- si moins de 125 mesures existent, vérifier que le nombre réel est affiché ;
- vérifier qu'aucune mesure de la veille ne remonte dans le graphique ;
- ouvrir l'onglet tableau et vérifier qu'il contient bien toutes les mesures de la journée avec pagination ;
- sélectionner une autre plage et vérifier que le graphique recharge toutes les mesures de cette plage avec un compteur de plage classique.

---

## B17-007 — Analyse d'impact : ancienne alarme hors période affichée

**Statut : `CORRIGE_DEV` — PR #17**

### Retour

L'analyse d'impact pouvait inclure une ancienne alarme encore ouverte, par exemple démarrée en mars, dans une analyse portant sur une période de juin/juillet.

### Correctif présent

Les alarmes réelles sont désormais retenues selon leur date de déclenchement dans la période analysée. Une alarme historique dont la fin est `NULL` ne suffit plus à la faire entrer dans une période ultérieure.

### Validation terrain attendue

- analyser une période ne contenant pas le début d'une vieille alarme ouverte ;
- vérifier qu'elle n'apparaît pas ;
- vérifier qu'une alarme réellement déclenchée pendant la période apparaît ;
- vérifier les bornes exactes début/fin de période.

---

## B17-008 — Journal d'audit : identifiants techniques visibles

**Statut : `CORRIGE_DEV` — PR #17**

### Retour

Le journal affichait directement des clés internes comme `dashboard:audit_graph_openings` ou `DASHBOARD:AUDIT_GRAPH_OPENINGS...` ainsi que des valeurs techniques `false/true`.

### Correctif présent

La PR #17 ajoute :

- un mapping explicite pour les ouvertures de graphique ;
- une humanisation des clés inconnues ;
- `Oui/Non` pour les booléens ;
- des blocs Avant/Après plus lisibles.

### Validation terrain attendue

- ouvrir un graphique puis consulter le journal ;
- vérifier qu'aucune clé de code brute n'est visible ;
- vérifier le rendu des paramètres connus et inconnus ;
- vérifier les changements booléens et numériques.

---

## B17-009 — Superposition des courbes : décimales flottantes sur l'axe et les tooltips

**Statut : `CORRIGE_DEV` — PR #17**

### Retour

La superposition pouvait afficher des valeurs telles que `25.800000000000004`, `25.400000000000006`, etc.

### Correctif présent

La PR #17 réutilise les helpers centraux `normalizeMeasureNumber()` et `formatMeasureValue()` pour les datasets, l'axe Y, les infobulles et l'export CSV.

### Validation terrain attendue

- superposer au moins deux courbes avec valeurs décimales ;
- aucune valeur ne doit exposer les artefacts IEEE 754 ;
- vérifier axe Y, tooltip et CSV.

### Note sur `Superposition affichée : 2 lieux`

La capture pointe également le texte de statut sous les contrôles. Aucun besoin fonctionnel explicite de suppression n'est formulé dans l'annotation. Il est donc conservé pour l'instant.

---

## B17-010 — Libellés des seuils/consignes du graphique coupés ou trop proches du bord

**Statut : `A_VALIDER`**

### Retour

Une capture du détail Surveillance montre le libellé de seuil supérieur partiellement hors de la zone visible à gauche du graphique.

### Historique

Le backlog précédent contient déjà des travaux sur :

- l'affichage des tolérances à gauche ;
- le dépassement des libellés par rapport aux pointillés.

Ces points sont indiqués comme faits, mais la capture impose un nouveau test avec la version actuelle de `dev`.

### Zone de code

`website/src/components/monitoring-details/monitoring-graph-tab.tsx`, notamment le positionnement des guide labels (`guideLabelStyle`).

### Critères d'acceptation

- `Max`, `Consigne`, `Min` et éventuelles pré-alarmes restent entièrement lisibles ;
- aucun texte n'est coupé par le bord gauche de la modale ou du canvas ;
- le rendu reste correct en affichage standard et agrandi ;
- vérifier thème clair et sombre.

Si le problème se reproduit sur `dev`, passer le statut à `A_FAIRE` et corriger dans un lot UI graphique.

---

## B17-011 — Dashboard : certaines alarmes actives semblent déclenchées dans le futur

**Statut : `PR_OUVERTE` — PR #20**

Branche : `agent/fix-active-alarm-relative-time`

### Retour

Dans le tableau `Alarmes actives`, la colonne **Déclenchée** pouvait afficher des libellés tels que :

- `dans environ 1 heure` ;
- `dans 29 minutes` ;

alors que l'alarme était déjà active.

### Cause identifiée

La date de début provient d'un `DATETIME` MySQL sans information de fuseau. Prisma représente cette valeur comme un objet `Date` adossé à UTC et React/Next peut également la sérialiser en chaîne ISO terminée par `Z` pendant le passage serveur → client.

Dans le tableau du dashboard, `parseDbDateTime()` était appelé directement sur cette valeur avant `formatDistanceToNow()`. Le navigateur pouvait donc réappliquer son décalage local (+1 h / +2 h en France) à une heure qui représentait déjà l'heure murale stockée en base, ce qui faisait apparaître une alarme passée comme future.

### Correctif PR #20

Fichier principal :

- `website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-alarm-columns.tsx`

Modifications :

- ajout d'un helper local `parseStoredAlarmDate()` spécifique à cette date de `DATETIME` stockée ;
- si la valeur reçue est un `Date` Prisma, ses composantes UTC sont récupérées avec `serializeStoredDbDateTime()` puis reparsées comme heure locale sans fuseau ;
- le même traitement est appliqué aux chaînes ISO UTC (`...Z`) susceptibles de provenir de la sérialisation React Server Components ;
- les chaînes déjà sans fuseau continuent à passer directement par `parseDbDateTime()` ;
- le texte relatif (`il y a ...`) et le tooltip utilisent désormais la même date normalisée.

Le correctif est volontairement local au dashboard afin de ne pas changer la sémantique générale de `parseDbDateTime()` pour les autres types de dates de l'application.

### Vérification technique avant PR

- branche créée depuis le HEAD exact de `dev` après merge #19 : `b8e053c0835619a3953486e83f2830fce8236a7a` ;
- avant mise à jour du backlog : 1 commit d'avance, 0 de retard ;
- un seul fichier applicatif modifié ;
- 18 ajouts / 3 suppressions ;
- aucun changement parasite identifié.

### Validation terrain après merge

- récupérer une alarme active récente et noter `Date_Heure_Debut` directement en base ;
- sur le dashboard, vérifier que le tooltip affiche exactement cette heure murale ;
- vérifier que le texte relatif indique `il y a ...` et jamais `dans ...` pour une alarme déjà active ;
- tester une alarme de moins d'une heure et une alarme de plusieurs heures ;
- comparer la même alarme avec sa page de détail ;
- valider en heure d'été ;
- garder un contrôle lors du passage à l'heure d'hiver afin de s'assurer qu'aucun décalage saisonnier ne revient.

---

## Ordre de traitement actuel

1. **B17-011** — PR #20 ouverte, attendre validation/merge.
2. **B17-003 + B17-004** — nettoyage/reprise d'état d'ajustage, à traiter ensemble si la cause est commune.
3. **B17-005** — bandeau de session d'ajustage non bloquant.
4. **B17-002** — durée réelle des sessions d'authentification, après investigation de la politique actuelle.
5. **B17-010** — validation puis correctif des libellés de seuil si le défaut est encore reproductible.

Les points B17-001, B17-006, B17-007, B17-008 et B17-009 sont déjà corrigés dans `dev` et ne doivent pas être recodés avant validation terrain.

## Règle de workflow GitHub

- avant tout nouveau lot, vérifier le HEAD réel de `dev`, les PR ouvertes/mergées et le statut de ce backlog ;
- chaque lot part du dernier HEAD de `dev` ;
- créer une branche dédiée de type `agent/<sujet>` ;
- limiter le diff au sujet traité ;
- mettre à jour ce backlog dans la même branche ;
- ouvrir une PR vers `dev` à la fin du lot ;
- ne pas démarrer le lot suivant tant que la PR précédente n'est pas mergée, sauf demande explicite contraire ;
- après merge, revérifier que `dev` pointe bien sur le commit de merge avant de créer la branche suivante ;
- pour chaque point traité, renseigner ici la PR, les fichiers principaux, le comportement implémenté et les validations à effectuer.
