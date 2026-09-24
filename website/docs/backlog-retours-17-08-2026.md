# Backlog retours terrain — 17/08/2026

## Contexte

Ce document centralise les retours terrain transmis sous forme de captures annotées autour du 17 août 2026.

Objectif : permettre une reprise immédiate du travail dans une nouvelle conversation. Chaque point décrit le symptôme, l’état vérifié dans le code, le comportement attendu, les correctifs déjà livrés, les fichiers principaux et la validation terrain restante.

## Référence de travail

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- Ne pas travailler directement sur `dev`.
- Workflow : vérifier le HEAD réel de `dev` et les PR avant chaque lot, créer `agent/<sujet>`, limiter le diff, mettre à jour ce backlog, ouvrir une PR vers `dev`, attendre le merge utilisateur, puis revérifier `dev` avant le lot suivant.

### PR récentes utiles

- PR #13 : expiration automatique des sessions de métrologie.
- PR #14 : état `E` des sondes pendant l’étalonnage.
- PR #15 : droits administrateur basés sur les autorisations.
- PR #16 : fiabilisation des états des sondes et de la lecture simple en métrologie.
- PR #17 : corrections affichage mesures, dates, analyse d’impact, superposition de courbes et audit.
- PR #18 : création et centralisation de ce backlog.
- PR #19 : B17-006, graphique Surveillance limité aux 125 dernières mesures du jour — **mergée dans `dev`**.
- PR #20 : B17-011, temps relatif des alarmes actives du dashboard — **mergée dans `dev` le 18/08/2026**, merge `3810c88dc4ff52b72432aa74b1333705611a4f61`.
- PR #21 : B17-003 + B17-004, anciennes sessions d’ajustage non restaurées comme session courante — **mergée dans `dev` le 18/08/2026**, merge `11cd817614f00d61dd2ffe2cb341662202d4fa3b`.
- PR #22 : B17-005, suivi global ajustage/étalonnage et panneau déplaçable — **mergée dans `dev` le 18/08/2026**, merge `34bf5979041406ce9045deb542f6b10a58cfcc51`.
- PR #23 : B17-002, borne absolue des sessions utilisateur à 24 h — **mergée dans `dev` le 19/08/2026**, merge `e8972b6dd6e073cb8549077c196f36ac3d0b756f`.
- PR #24 : hotfix du build du panneau de métrologie après #22 — **mergée dans `dev` le 19/08/2026**, merge `27c0a55503b19deb486b955ce36c571a9aab0086`.
- PR #25 : B17-010, libellés de seuils du graphique Surveillance — **mergée dans `dev` le 19/08/2026**, merge `e6867c6c3a72a52d28bde9540160b374ec227646`.
- PR #27 : retours métrologie étalonnage/ajustage, dont feedback visuel de nouvelles mesures — **mergée dans `dev` le 20/08/2026**, merge `a34fee90c63fc5639984c360b9a8b9f0c1ebecd5`.
- PR #32 : fin du nettoyage i18n FR/EN — **mergée dans `dev` le 20/08/2026**, merge `0b12e2c1e025283c6ed105f05b17dc8afc747478`.
- PR #33 : B20-001 + B20-002, exports XML d’ajustage et création GSO simple à l’import — **mergée dans `dev` le 20/08/2026**, merge `5ad7637beee30c8a50b56458f78fd5ffe78251cf`.
- PR #34 : B20-003, export XML multiple des ajustages — **mergée dans `dev` le 20/08/2026**, merge `c75b2d5e655705adb933fc2d1c291393c8cae2f5`.
- PR #35 : B20-004, fondu progressif des cellules de mesure mises à jour — **mergée dans `dev` le 21/08/2026**, merge `a5272678a9c5700e2ea14df53fbb651754194906`.
- PR #36 : B20-005 + B20-006, création rapide Site/Groupe et rappel des groupes dans Mailing — **mergée dans `dev` le 21/08/2026**.
- PR #37 : nettoyage lint Next 16 / diagnostics React Compiler non bloquants — **mergée dans `dev` le 21/08/2026**.
- PR #38 : B21-001, campagne d’étalonnage sur 10 mesures + calculs métrologiques — **mergée dans `dev` le 21/08/2026**, merge `b5ccccb20b6bc28cf1c05db3acaa075a32dc6ec1`.
- PR #39 : B20-007, cohérence des dates dans la liste et la fenêtre d’acquittement — **mergée dans `dev` le 21/08/2026**, merge `dc8ecfd2e08976ddcd192dc8836fe0838a6476a2`.
- PR #40 : B21-002, coefficients métrologiques embarqués dans les GSP / protocole `ECON` étendu — **mergée dans `dev` le 22/08/2026**, merge `c40aeb9dbbb49b32fe669208b2224a60ddc2bafa`.

### Statuts

- `CORRIGE_DEV` : correctif mergé dans `dev`; validation terrain encore possible.
- `PR_OUVERTE` : correctif présent sur une branche avec PR ouverte, pas encore mergée.
- `EN_COURS` : branche en cours de préparation.
- `A_VALIDER` : un correctif existe ou le défaut pourrait déjà être traité; retest nécessaire.
- `A_FAIRE` : modification nécessaire.
- `A_INVESTIGUER` : cause à confirmer avant modification.

---

## B17-001 — Décalage de +2 h dans le détail d’une alarme

**Statut : `CORRIGE_DEV` — PR #17**

### Retour

Les heures de début/fin d’alarme et les points du graphique pouvaient apparaître environ deux heures après les valeurs réellement stockées.

### Cause / correctif

Les `DATETIME` MySQL sans fuseau étaient réinterprétés comme UTC. La PR #17 utilise la sérialisation dédiée aux dates stockées (`serializeStoredDbDateTime()`) afin de préserver l’heure murale de la base.

### Validation terrain

- comparer `Debut_Alarme` / `Fin_Alarme` en base avec le détail;
- contrôler le tooltip du graphique;
- vérifier une alarme ouverte et une terminée;
- garder un contrôle lors du changement heure été/hiver.

---

## B17-002 — Session utilisateur encore utilisable après plus de 24 h

**Statut : `CORRIGE_DEV` — PR #23 — branche `agent/fix-session-expiration`**

### Retour

Après plus de 24 h sans utilisation, un poste pouvait rouvrir VigiSensys et retrouver une session authentifiée sans nouvelle saisie d’identifiants.

### Cause confirmée le 19/08/2026

L’access token expirait bien au bout d’une heure, mais le refresh token restait valable 7 jours et était régénéré avec une nouvelle durée complète à chaque refresh. Le helper HTTP renouvelle automatiquement l’access token après un `401`; la session persistante était donc glissante et pouvait être prolongée au fil des retours dans l’application.

Le verrouillage d’inactivité `TEMPS_DECONNEXION_MINUTES` reste un mécanisme navigateur : il peut déconnecter plus tôt tant que la page est active, mais ne peut pas s’exécuter pendant une fermeture du navigateur ou du poste. Le SSO Windows/LDAP est documenté comme une évolution à implémenter et n’est pas actif dans ce parcours.

### Correctif PR #23

Fichiers principaux :

- `website/src/lib/jwt.ts`;
- `website/src/app/api/auth/refresh/route.ts`;
- `website/src/proxy.ts`.

Comportement :

- la session persistante est bornée à **24 h depuis la connexion**;
- le refresh token transporte une échéance absolue signée `sessionExpiresAt`;
- les rotations de refresh conservent cette échéance au lieu de la repousser;
- un access token renouvelé est lui aussi limité au temps restant avant cette échéance;
- les cookies renouvelés utilisent la durée réellement restante;
- les anciens refresh tokens sans `sessionExpiresAt` restent compatibles, avec leur `iat` comme référence et une borne de 24 h;
- le proxy ne considère plus la seule présence d’un refresh cookie comme suffisante : il contrôle son `exp` et la borne absolue avant de laisser poursuivre une navigation protégée;
- le verrouillage d’inactivité configurable reste inchangé et peut toujours déconnecter plus tôt.

Le build et le déploiement après les PR #23/#24 ont été confirmés comme réussis le 19/08/2026. La validation fonctionnelle nécessitant réellement d’attendre l’échéance de 24 h reste à effectuer.

### Validation terrain restante

- connexion normale : accès immédiat inchangé;
- après expiration de l’access token mais avant 24 h : refresh transparent et poursuite de session;
- vérifier que plusieurs refresh successifs ne décalent jamais l’échéance absolue;
- après 24 h depuis la connexion : Surveillance et Administration redirigent vers la connexion;
- après 24 h, un appel API avec l’ancien cookie obtient `401` et nettoie les cookies;
- fermer complètement le navigateur / redémarrer le poste puis revenir après l’échéance : aucune reconnexion silencieuse;
- vérifier que `TEMPS_DECONNEXION_MINUTES` continue de déconnecter plus tôt lorsqu’il est activé;
- contrôler un refresh proche de la borne de 24 h : le nouvel access token ne doit pas survivre au-delà de la session.

---

## B17-003 — Anciennes informations / exports d’ajustage visibles lors d’une nouvelle opération

**Statut : `CORRIGE_DEV` — PR #21 — branche `agent/clear-stale-adjustment-session`**

### Retour

La page **Réaliser un ajustage** peut réafficher le message de fin et les boutons d’exports XML d’une ancienne opération alors qu’aucun ajustage n’est réellement actif.

### Investigation réalisée le 18/08/2026

La session d’ajustage est conservée dans la map serveur `sessionsByUserId` même après `completed`, `cancelled` ou `failed`. C’est utile juste après la fin pour exposer le message final et les exports, mais `GET /api/metrologie/ajustage/session` renvoyait ensuite encore cette même session lors d’un futur chargement de page.

L’UI lit directement `session.message`, `session.persistedAdjustments` et `session.validatedPoints`. Une session terminale conservée côté serveur était donc présentée comme si elle faisait encore partie du parcours courant.

### Correctif PR #21

Fichier principal :

- `website/src/app/api/metrologie/ajustage/session/route.ts`

Comportement :

- une session `running` ou `idle` reste toujours restaurable après rechargement;
- une session qui vient de terminer reste brièvement exposable afin que le rafraîchissement déclenché immédiatement après la validation conserve le message et les liens XML dans l’écran courant;
- une ancienne session terminale n’est plus restaurée comme session courante lors d’un retour ultérieur sur la page;
- aucun export historique ni ligne `t_ajustage` n’est supprimé de la base;
- le watchdog n’est pas modifié pour les sessions réellement actives.

### Validation terrain

- terminer un ajustage à deux points et vérifier que les exports sont bien proposés immédiatement;
- quitter puis rouvrir **Réaliser un ajustage** : les exports de l’ancienne opération ne doivent plus apparaître comme exports courants;
- recharger pendant une session `running` : la session doit être récupérée normalement;
- annuler/laisser expirer une session puis revenir plus tard : aucun ancien message d’opération courante;
- vérifier que les données historiques et exports enregistrés restent intacts.

---

## B17-004 — Anciennes valeurs / points d’ajustage conservés

**Statut : `CORRIGE_DEV` — PR #21**

### Retour

Lors d’une nouvelle préparation, le premier/deuxième point et d’autres informations d’une ancienne session pouvaient réapparaître.

### Cause commune confirmée

Les inputs des points utilisent en priorité `session.validatedPoints[1/2]`. Tant que l’API renvoyait l’ancienne session terminale, les valeurs validées de l’opération précédente pouvaient être réinjectées dans l’écran.

La restauration des paramètres de formulaire (sondes, opérateur, étalon, milieu, plateau, intervalle) est déjà protégée côté React par `session.status === "running"`; le problème persistant identifié dans le retour est donc principalement la présence de la session terminale dans le payload courant.

### Correctif du lot

Le même filtrage de session côté endpoint empêche les `validatedPoints`, `persistedAdjustments` et messages d’une ancienne session terminale d’être réutilisés lors d’un futur chargement. Une session réellement active reste restaurée avec ses valeurs courantes.

### Validation terrain

- terminer un ajustage avec deux points non triviaux;
- quitter/revenir sur la page et préparer une autre opération;
- vérifier que les points sont vides/non validés avant le nouveau démarrage;
- vérifier qu’un ancien milieu/étalon n’est pas restauré par une session terminale;
- pendant une vraie session active, recharger et vérifier au contraire que les valeurs de session sont conservées;
- démarrer la seconde opération et confirmer qu’aucune donnée transitoire de la première n’est mélangée.

---

## B17-005 — Suivi global des opérations d’ajustage / étalonnage

**Statut : `CORRIGE_DEV` — PR #22 + hotfix #24**

### Retour

Le panneau flottant global de suivi pouvait recouvrir des boutons et n’était pas déplaçable. Le retest du 18/08/2026 a également confirmé une régression plus importante : aucun panneau global n’apparaissait lors d’un étalonnage, alors que l’ajustage et l’étalonnage doivent proposer le même suivi d’opération.

### Cause confirmée le 18/08/2026

Le composant global `AdjustmentOperationTimer`, monté dans les providers de l’application, ne surveillait que `GET /api/metrologie/ajustage/session`. La session d’étalonnage disposait bien de son endpoint `GET /api/metrologie/etalonnage/session`, mais aucun suivi global ne l’utilisait.

### Correctif PR #22

Fichier principal :

- `website/src/components/metrology/adjustment-operation-timer.tsx`

Comportement :

- le panneau global surveille maintenant les sessions d’ajustage **et** d’étalonnage;
- une session `running` d’étalonnage affiche `Étalonnage en cours`, le nombre de sondes, un compte à rebours calculé sur la limite serveur de 90 minutes et une action d’arrêt;
- l’ajustage conserve son compte à rebours basé sur `expiresAt`, son extension conditionnelle de 30 minutes et son arrêt existant;
- les clés React Query utilisées sont les mêmes que dans les écrans métier, ce qui permet au panneau d’être mis à jour immédiatement après le démarrage/arrêt d’une opération dans l’onglet courant;
- le panneau peut être déplacé par sa barre supérieure;
- sa position est bornée à la fenêtre et recalée lors d’un redimensionnement afin qu’il reste récupérable;
- le backend des opérations et les mécanismes de restauration d’état des sondes ne sont pas modifiés.

### Hotfix build PR #24

Après le merge de #22, le build Next.js a révélé une incompatibilité de types dans la mutation d’arrêt commune : les réponses d’ajustage et d’étalonnage exposaient des unions de `status` différentes, alors que TanStack Query devait inférer un unique `TData`.

La PR #24 a limité la mutation à `useMutation<void, Error, OperationType>` et `await` les deux appels `DELETE`; le payload de réponse, inutilisé par l’UI, n’est plus propagé comme résultat de mutation. Aucun comportement backend n’a été modifié.

Le build et le déploiement après #24 ont été confirmés comme réussis le 19/08/2026.

### Validation terrain restante

- démarrer un étalonnage : le panneau global doit apparaître immédiatement avec `Étalonnage en cours`;
- naviguer vers Surveillance pendant l’étalonnage : panneau, timer et arrêt restent disponibles;
- vérifier que le compte à rebours d’étalonnage part de la durée maximale serveur de 1 h 30;
- arrêter l’étalonnage depuis le panneau et confirmer la fin de session ainsi que la restauration des états des sondes;
- démarrer un ajustage et vérifier le même suivi global;
- vérifier que l’extension reste proposée uniquement pour l’ajustage lorsque ses conditions sont remplies;
- déplacer le panneau aux quatre bords de la fenêtre : il ne doit jamais devenir inaccessible;
- redimensionner la fenêtre après déplacement : le panneau doit être recalé dans la zone visible;
- vérifier qu’une session terminée/annulée/échouée n’affiche pas de panneau global;
- thème clair/sombre et affichage FR/EN.

---

## B17-006 — Détail Surveillance : journée courante + 125 dernières mesures

**Statut : `CORRIGE_DEV` — PR #19**

### Comportement livré

- journée actuelle sélectionnée par défaut;
- graphique limité aux 125 mesures les plus récentes de cette journée;
- points retriés chronologiquement;
- compteur `X dernières mesures` sur le jour courant;
- tableau indépendant et paginé sur toutes les mesures de la journée;
- autre plage explicite = chargement complet de cette plage avec compteur classique.

### Fichiers principaux

- `website/src/components/monitoring-details-modal.tsx`
- `website/src/components/monitoring-details/use-monitoring-range-measurements.ts`

### Validation terrain

- aucune mesure de la veille dans le graphique par défaut;
- 125 points maximum si disponibles;
- nombre réel si moins de 125;
- tableau complet de la journée avec pagination;
- autre plage correctement rechargée.

---

## B17-007 — Analyse d’impact : ancienne alarme hors période

**Statut : `CORRIGE_DEV` — PR #17**

Les alarmes réelles sont désormais retenues selon leur date de déclenchement dans la période analysée. Une ancienne alarme ouverte hors période ne doit plus apparaître uniquement parce que sa fin est `NULL`.

### Validation

Tester une vieille alarme ouverte hors période, puis une alarme dont le début appartient réellement à la période.

---

## B17-008 — Journal d’audit : identifiants techniques visibles

**Statut : `CORRIGE_DEV` — PR #17**

La PR #17 ajoute des mappings/humanisations, `Oui/Non` pour les booléens et des blocs Avant/Après lisibles.

### Validation

Ouvrir un graphique puis contrôler le journal : aucune clé brute du type `dashboard:audit_graph_openings`, rendu lisible des paramètres connus/inconnus.

---

## B17-009 — Superposition : artefacts de décimales flottantes

**Statut : `CORRIGE_DEV` — PR #17**

Les helpers `normalizeMeasureNumber()` et `formatMeasureValue()` sont réutilisés pour datasets, axe Y, tooltips et export CSV.

### Validation

Superposer plusieurs courbes décimales et vérifier axe, tooltip et CSV.

---

## B17-010 — Libellés de seuils/consignes coupés sur le graphique

**Statut : `CORRIGE_DEV` — PR #25 — branche `agent/fix-monitoring-guide-labels`**

### Retour

Un libellé de seuil supérieur pouvait apparaître partiellement hors de la zone visible à gauche.

### Cause confirmée le 19/08/2026

Les labels HTML superposés au graphique étaient positionnés avec un décalage horizontal fixe `left: -42px`, tandis que la modale de détail masque le débordement horizontal avec `overflow-x-hidden`. Une partie du label pouvait donc être correctement positionnée verticalement mais coupée par le conteneur.

### Correctif PR #25

Fichier :

- `website/src/components/monitoring-details/monitoring-graph-tab.tsx`.

Comportement :

- suppression du décalage fixe négatif;
- récupération du bord gauche réel de la zone de tracé via `chartRef.current.chartArea.left`;
- ancrage des labels à `chartArea.left + 8px`;
- fallback à `8px` avant disponibilité de `chartArea`;
- calcul vertical, seuils, datasets et zoom inchangés.

### Validation terrain restante

- Max / Consigne / Min / pré-alarmes entièrement lisibles;
- modes standard et agrandi;
- redimensionnement de fenêtre;
- thème clair et sombre;
- FR/EN;
- alignement des labels avec leurs lignes horizontales.

---

## B17-011 — Alarmes actives affichées comme déclenchées dans le futur

**Statut : `CORRIGE_DEV` — PR #20**

### Cause

`Date_Heure_Debut` est un `DATETIME` MySQL sans fuseau. Après Prisma / sérialisation serveur-client, la valeur pouvait être interprétée avec un décalage local avant `formatDistanceToNow()`, donnant `dans ...` pour une alarme déjà passée.

### Correctif

Fichier :

- `website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-alarm-columns.tsx`

Un helper local normalise les `Date` Prisma / chaînes ISO UTC en heure murale de base via `serializeStoredDbDateTime()` puis `parseDbDateTime()`. Le texte relatif et le tooltip utilisent la même date normalisée.

### Validation terrain

- comparer `Date_Heure_Debut` brute avec le tooltip;
- alarme active passée = toujours `il y a ...`;
- tester <1 h et plusieurs heures;
- comparer avec le détail d’alarme;
- garder un contrôle heure été/hiver.

---

## B20-001 — Nom des exports XML d’ajustage encore préfixé `Calibrage`

**Statut : `CORRIGE_DEV` — PR #33 — branche `agent/xml-ajustage-import-export`**

### Retour du 20/08/2026

Depuis **Administration > Sondes > détail d’une sonde > Ajustages**, le téléchargement XML utilisait encore un nom de fichier commençant par `Calibrage_...xml`. Le vocabulaire produit doit être cohérent avec l’opération réellement effectuée : **Ajustage**.

### Correctif livré

- le nom téléchargé est maintenant `Ajustage_<sonde>_<timestamp>.xml`;
- les balises historiques `CALIBRAGE` / `CALIBRAGE_SONDE` restent inchangées pour la compatibilité des fichiers existants;
- l’import continue d’accepter les fichiers utilisant la structure historique.

### Validation terrain

- exporter un ajustage depuis la fiche sonde;
- vérifier le nom `Ajustage_...xml`;
- réimporter ce fichier et vérifier qu’il reste accepté;
- vérifier un ancien fichier `Calibrage_...xml`.

---

## B20-002 — Import ajustage : identité d’une GSO simple capteur incorrecte

**Statut : `PR_OUVERTE` — PR #111 — branche `fix/gso-import-address-normalization`**

### Retour initial du 20/08/2026

Lorsqu’un XML d’ajustage créait automatiquement une **GSO simple capteur**, les valeurs stockées ne suivaient pas la convention attendue. La PR #33 avait alors centralisé la reconstruction du numéro de série et de l’adresse GSO pour les imports.

### Précision terrain du 10/09/2026

La règle d’adresse retenue dans la PR #33 ajoutait `-T` aux GSO simples (`SOIT` / `SOET`). Cette convention a été corrigée : `Adresse_Sonde` doit contenir uniquement l’adresse physique, sans préfixe de type et sans suffixe artificiel.

Exemple confirmé :

- `Sonde_Numero_Serie = SOIT-10007193` ;
- `Adresse_Sonde = 10007193`.

Lorsqu’une adresse porte réellement un suffixe de canal `-T` ou `-H`, ce suffixe est conservé, mais le préfixe de type (`SOIT`, `SOET`, `SOIH`, `SOEH`) ne doit jamais faire partie de `Adresse_Sonde`.

### Correctif PR #111

La règle reste centralisée dans `website/src/lib/sensor-naming.ts`, via `buildImportedSensorStorageIdentity()` et est donc appliquée sans duplication aux parcours de prévisualisation, import unitaire et import multiple :

- `SOIT` / `SOET` : numéro de série conservé sous la forme `<TYPE>-<numero>` ;
- `SOIT` / `SOET` : `Adresse_Sonde = <numero>` ;
- adresses portant réellement un canal : `<numero>-T` ou `<numero>-H` ;
- aucun préfixe de type dans `Adresse_Sonde` ;
- `Sonde_Type` et `Est_Sonde_GSO` restent inchangés ;
- l’ajustage importé continue de référencer le même numéro de série que la sonde créée ou mise à jour.

Fichiers principaux :

- `website/src/lib/sensor-naming.ts` ;
- `website/scripts/test-gso-import-address-normalization.ts` ;
- `website/docs/gso-adjustment-import-address-10-09-2026.md`.

Validation automatique : GitHub Actions run `34463664299` — test ciblé, ESLint, TypeScript et build Next.js production réussis.

### Validation terrain restante

- importer un XML `SOIT-10007193` et vérifier `Sonde_Numero_Serie = SOIT-10007193` et `Adresse_Sonde = 10007193` ;
- refaire avec `SOET` ;
- tester une GSO avec suffixe `-T` puis `-H` et vérifier que seul le suffixe est conservé dans l’adresse ;
- tester l’import unitaire et l’import multiple ;
- tester une sonde GSO déjà existante ;
- vérifier que l’ajustage importé référence toujours le même numéro de série que la sonde ;
- vérifier une sonde non-GSO en non-régression.

---

## B20-003 — Export multiple des XML d’ajustage depuis les sondes

**Statut : `CORRIGE_DEV` — PR #34 — branche `agent/adjustment-bulk-xml-export`**

### Retour du 20/08/2026

Pouvoir exporter plusieurs fichiers XML d’ajustage en une seule action, avec une interaction intuitive pour l’utilisateur.

### Correctif livré

Depuis le panneau des ajustages d’une sonde :

- une case à cocher est disponible par ajustage;
- une case d’en-tête permet de sélectionner/désélectionner tous les ajustages visibles;
- un compteur indique le nombre de lignes sélectionnées;
- l’action d’export reste désactivée tant qu’aucune ligne n’est sélectionnée;
- la sélection d’export est indépendante de la sélection de ligne utilisée pour le détail;
- un seul fichier `Ajustages_<timestamp>.zip` est téléchargé;
- le ZIP contient les XML générés par le même helper que l’export unitaire;
- le backend borne un lot à 200 ajustages et charge les dépendances en groupes pour éviter un N+1;
- aucune dépendance ZIP supplémentaire n’a été ajoutée.

### Validation terrain restante

La validation fonctionnelle est volontairement confiée à un collègue n’ayant pas travaillé sur le développement afin de tester le parcours avec un regard extérieur.

- sélectionner 1, plusieurs ou toutes les lignes visibles;
- action désactivée si aucune ligne n’est sélectionnée;
- un seul téléchargement pour un lot;
- ouvrir le ZIP avec l’explorateur Windows;
- vérifier les noms `Ajustage_...xml`;
- comparer au moins un XML avec l’export unitaire;
- vérifier que cliquer une checkbox ne modifie pas le détail sélectionné;
- vérifier FR/EN et thème clair/sombre.

---

## B20-004 — Ajustage / étalonnage : transition colorée progressive sur nouvelle mesure

**Statut : `CORRIGE_DEV` — PR #35 — branche `agent/metrology-reading-fade`**

### Retour du 20/08/2026

La PR #27 rend déjà une nouvelle mesure plus visible via un feedback et un flash temporaire. Le retour terrain demande maintenant un effet plus lisible et plus doux : la valeur ou la ligne doit prendre une couleur distincte lorsqu’une nouvelle mesure arrive, puis **revenir progressivement** vers sa couleur de base.

### Correctif livré via PR #35

Le composant partagé `website/src/app/[locale]/(admin)/admin/metrologie/_components/metrology-reading-refresh-feedback.tsx`, déjà monté sur les pages Ajustage et Étalonnage, reste l’unique mécanisme de feedback.

Évolution :

- mémorisation du texte cellule par cellule dans les tableaux de métrologie;
- seules les cellules dont le contenu change réellement sont accentuées;
- accent vert léger immédiat compatible clair/sombre;
- retrait de l’accent avec une transition `background-color` d’environ 3 secondes vers la couleur normale;
- si une nouvelle valeur arrive avant la fin du fondu, l’animation repart proprement depuis l’accent;
- le bandeau `Mesures mises à jour` reste présent et utilise une durée cohérente;
- aucun changement des boucles de lecture, APIs, polling ou traitements métier.

### Validation terrain

- observer plusieurs cycles successifs sur GSP et GSO;
- tester Ajustage puis Étalonnage;
- confirmer que seules les cellules réellement mises à jour sont animées;
- vérifier le retour progressif à la couleur normale;
- provoquer deux mises à jour rapprochées et vérifier que l’accent redémarre proprement;
- vérifier clair/sombre et FR/EN;
- confirmer que l’animation ne provoque pas de saut de layout ni de coût notable avec beaucoup de sondes;
- confirmer qu’un simple rerender sans nouvelle valeur ne relance pas l’animation.

---

## B20-005 — Lieux : création rapide d’un site ou d’un groupe depuis la modale

**Statut : `CORRIGE_DEV` — PR #36 — branche `agent/location-modal-sites-groups`**

### Retour du 21/08/2026

Lors de la création ou de la modification d’un lieu, l’utilisateur doit pouvoir créer rapidement le site ou le groupe manquant sans fermer la modale du lieu, aller dans une autre page d’administration puis revenir reprendre sa saisie.

### Correctif livré

Le formulaire Général réutilise les APIs existantes `POST /api/sites` et `POST /api/groupes` et ajoute des actions de création légère directement à côté des champs Site et Groupes :

- création d’un site avec nom et commentaire optionnel;
- création d’un groupe avec regroupement et nom;
- réutilisation des traductions FR/EN déjà présentes dans les écrans Sites/Groupes;
- conservation de toutes les valeurs déjà saisies dans le lieu;
- mise à jour du cache React Query après création;
- le site créé devient immédiatement le site du lieu;
- le groupe créé est immédiatement ajouté aux groupes sélectionnés du lieu;
- aucun enregistrement du lieu n’est déclenché automatiquement : la création du site/groupe et la sauvegarde du lieu restent deux actions distinctes.

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-quick-create-buttons.tsx`;
- `website/src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-general-settings-section.tsx`.

### Validation terrain

- ouvrir un nouveau lieu, saisir plusieurs champs, créer un site puis vérifier que la saisie du lieu est intacte;
- vérifier que le site créé apparaît et est sélectionné immédiatement;
- créer un groupe et vérifier qu’il est ajouté à la sélection sans retirer les groupes déjà choisis;
- tester la même création pendant la modification d’un lieu existant;
- tester depuis l’éditeur de lieu accessible depuis Surveillance, qui réutilise le même formulaire;
- vérifier une erreur API/droits : la modale du lieu doit rester ouverte et la saisie ne doit pas être perdue;
- vérifier les modales imbriquées, le focus et la fermeture sans blocage des interactions;
- vérifier FR/EN et thèmes clair/sombre.

---

## B20-006 — Lieux : rappeler les groupes sélectionnés dans l’onglet Mailing

**Statut : `CORRIGE_DEV` — PR #36 — branche `agent/location-modal-sites-groups`**

### Retour du 21/08/2026

L’option Mailing permet déjà d’appliquer la liste de contacts aux groupes sélectionnés dans l’onglet Général, mais l’utilisateur doit revenir dans Général pour se rappeler exactement quels groupes sont concernés.

### Correctif livré

`LocationFormTabTelephony` surveille `GroupIds` et affiche sous l’explication la liste explicite des groupes concernés sous forme de badges.

Les noms proviennent de la même requête React Query `groups` que le formulaire Général. Un groupe créé rapidement via B20-005 apparaît donc immédiatement dans ce rappel. Les libellés existants `locationsForm.general` sont réutilisés afin de ne pas introduire de texte UI hardcodé.

Fichier principal :

- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-telephony.tsx`.

### Validation terrain

- sélectionner un seul groupe dans Général puis ouvrir Mailing : son nom doit être visible;
- sélectionner plusieurs groupes : tous doivent apparaître sans ambiguïté;
- retirer un groupe dans Général : le rappel Mailing doit suivre immédiatement;
- créer rapidement un nouveau groupe : il doit apparaître dans le rappel sans rechargement de page;
- aucun groupe : conserver le message invitant à sélectionner un groupe et l’option désactivée;
- vérifier que cocher « appliquer aux groupes » conserve le comportement métier existant;
- vérifier affichage avec noms longs, FR/EN et thèmes clair/sombre.

---

## B20-007 — Acquittement d’alarme : incohérence de deux heures entre les dates affichées

**Statut : `CORRIGE_DEV` — PR #39 — branche `agent/alarm-ack-datetime-consistency`**

### Retour du 21/08/2026

Dans la fenêtre **Acquitter l’alarme**, une même alarme de non-réponse pouvait afficher deux heures différentes pour son début. Capture fournie sur l’alarme `#18155 - Non réponse` :

- ligne de la liste : `20/08/2026 15:34:00`;
- panneau de détail : `20/08/2026 13:34:00`.

### Cause confirmée le 21/08/2026

Le défaut est côté API, pas dans le formatter React :

- `GET /api/alarmes` sérialisait `Date_Heure_Debut` et `Date_Heure_Fin` avec `serializeDbDateTime()`;
- `GET /api/alarmes/[id]` utilisait déjà `serializeStoredDbDateTime()`;
- le dialogue applique ensuite le même `formatDbDateTime()` aux deux payloads;
- `Date_Heure_Debut` / `Date_Heure_Fin` sont des `DATETIME` sans fuseau. Prisma les expose comme objets `Date` adossés à UTC alors que les composantes stockées représentent déjà l’heure murale locale;
- `serializeDbDateTime()` relisait donc les getters locaux et pouvait ajouter le décalage horaire du serveur, soit +2 h en heure d’été française;
- `serializeStoredDbDateTime()` relit au contraire les composantes UTC afin de préserver exactement l’heure stockée.

L’API `/api/alarmes/range` était déjà correcte et utilise `serializeStoredDbDateTime()`. Le calcul de durée de la modale utilise `parseDbDateTime()` sur les valeurs normalisées et ne nécessite aucun `-2 h`. Le compteur des alarmes sur 30 jours ne sérialise aucune date vers l’UI et reste inchangé.

### Correctif PR #39

Fichier principal :

- `website/src/app/api/alarmes/route.ts`.

Comportement :

- `timestamp` utilise `serializeStoredDbDateTime(alarm.Date_Heure_Debut)`;
- `acknowledgedAt` utilise la même sérialisation pour sa valeur DB actuelle;
- `resolvedAt` utilise `serializeStoredDbDateTime(alarm.Date_Heure_Fin)`;
- le fallback basé sur `new Date()` garde `serializeDbDateTime()` car il s’agit d’un instant produit par l’application et non d’un `DATETIME` relu depuis la base;
- aucun décalage artificiel n’est ajouté côté frontend.

PR #39 mergée dans `dev` le 21/08/2026, merge `dc8ecfd2e08976ddcd192dc8836fe0838a6476a2`.

### Validation terrain restante

- reprendre l’alarme de non-réponse du retour si elle est encore disponible et vérifier que ligne + détail affichent la même heure;
- comparer `Date_Heure_Debut` brute en base à la valeur affichée;
- tester une alarme active puis une terminée;
- pour une alarme terminée, comparer également `Date_Heure_Fin` brute avec l’affichage;
- vérifier que la durée est cohérente avec début/fin;
- tester au moins une alarme haute ou basse en plus d’une non-réponse;
- contrôler la page Alarmes hors modale, qui réutilise le même endpoint liste;
- contrôler le compteur sur 30 jours;
- garder un contrôle lors du changement heure été/hiver.

---

## B21-001 — Étalonnage : campagne de 10 mesures, étalon et calculs métrologiques

**Statut : `CORRIGE_DEV` — PR #38 — branche `agent/calibration-10-measures-results`**

### Retour du 21/08/2026

Le parcours d’étalonnage devait être complété pour reproduire la campagne métier attendue :

- **Démarrer la lecture** doit être la première action;
- **Démarrer l’étalonnage** doit rester désactivé tant qu’aucune première lecture valide n’est disponible;
- l’étalon doit lui aussi fournir 10 mesures;
- les 10 valeurs successives de chaque sonde et de l’étalon doivent être conservées et affichées;
- le tableau historique devient **Dernière mesure d’étalonnage**;
- un tableau séparé expose les mesures de l’étalon;
- un tableau global aligne toutes les mesures en distinguant l’étalon;
- l’erreur de justesse et l’incertitude doivent être calculées côté backend et les résultats seulement affichés côté frontend.

### Correctif livré via PR #38

La session d’étalonnage possède désormais deux phases :

1. `reading` : lecture de l’étalon et des sondes, sans consommer les 10 mesures de campagne;
2. `acquiring` : acquisition de 10 cycles complets et appariés.

Un cycle n’est compté que si l’étalon et toutes les sondes possèdent une valeur valide. L’ajout d’une sonde reste possible pendant `reading` mais est bloqué dès le démarrage de la campagne afin de préserver l’alignement des séries.

La préparation demande un étalon SPET interrogé automatiquement et un milieu d’intercomparaison. Le backend utilise :

- résolution étalon;
- `Incertitude_Max` de l’étalon;
- résolution sonde fixée à `0.01` conformément au retour métier, aucun champ de résolution sonde n’existant actuellement dans `t_sonde_type`;
- stabilité et homogénéité du milieu.

### Calculs

Pour chaque sonde :

- erreur de justesse = moyenne sonde - moyenne étalon;
- U1 = résolution étalon / (2 × √3);
- U2 = 0.04 / √3;
- U3 = incertitude étalon / 2;
- U4 = 0.01 / (2 × √3);
- U5 = 0;
- U6 = 0.000032;
- U7 = écart-type expérimental des 10 valeurs sonde (`n - 1`);
- U8 = 0;
- U9 = √((stabilité / √3)² + (homogénéité / √3)²);
- U10 = 0;
- U11 = 0;
- incertitude = √(U1² + ... + U11²).

Les composantes U1 à U11 restent backend. Le frontend affiche les moyennes, l’erreur de justesse et l’incertitude.

### Persistance

Après le dixième cycle valide :

- une ligne `t_etalonnage` est créée pour chaque sonde;
- dix lignes `t_etalonnage_mesure` sont créées par étalonnage avec `Numero_Ordre`, `Mesure_Sonde` et `Mesure_Etalon`;
- `Repetabilite` reçoit l’écart-type utilisé comme U7;
- les états des sondes sont restaurés après fin ou arrêt.

Fichiers principaux :

- `website/src/lib/metrology-calibration-session.ts`;
- `website/src/lib/metrology-calibration-calculations.ts`;
- `website/src/app/api/metrologie/etalonnage/session/route.ts`;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-workflow-client.tsx`;
- `website/src/messages/metrology-calibration-supplements.ts`.

### Validation terrain restante

- vérifier le verrouillage initial des boutons;
- démarrer la lecture et confirmer la dernière valeur étalon + toutes les sondes;
- démarrer la campagne et suivre `0/10` à `10/10`;
- provoquer si possible un cycle incomplet : il ne doit pas incrémenter le compteur;
- vérifier les 10 valeurs étalon et les 10 lignes appariées;
- vérifier une sonde à la main : moyenne sonde, moyenne étalon et erreur de justesse;
- comparer l’incertitude avec un calcul manuel connu;
- vérifier une ligne `t_etalonnage` par sonde et 10 `t_etalonnage_mesure` par opération;
- arrêter pendant `reading`, puis pendant `acquiring`, et vérifier la restauration des états;
- tester GSP puis GSO;
- vérifier FR/EN et thèmes clair/sombre.

---

## B21-002 — GSP : coefficients métrologiques embarqués dans `ECON`

**Statut : `CORRIGE_DEV` — PR #40 — branche `agent/gsp-onboard-metrology-coefficients` — merge `c40aeb9dbbb49b32fe669208b2224a60ddc2bafa`**

### Retour du 21/08/2026

Le firmware GSP embarque désormais tous les coefficients métrologiques et applique lui-même la formule avant de retourner la mesure. Le protocole `ECON` expose :

- `a=CoefA` sur 10 décimales;
- `b=CoefB` sur 10 décimales;
- `c=CoefC` sur 10 décimales;
- `d=Offset` sur 2 décimales;
- `e=Erreur de Justesse` sur 2 décimales;
- `m=Multipoint` (`0` ou `1`).

Formules firmware :

- `m=0` : `a*x + b + offset - justesse`;
- `m=1` : `a*x² + b*x + c + offset - justesse`.

Une limite haute/basse désactivée doit maintenant être transmise sous forme `NAN` au lieu de `999`.

Deux comportements spécifiques aux opérations de métrologie sont également demandés :

- **Ajustage** : neutraliser temporairement tous les coefficients pour travailler sur la valeur non corrigée;
- **Étalonnage** : conserver l’ajustage et l’offset mais neutraliser l’ancienne erreur de justesse, puisque l’étalonnage sert précisément à calculer la nouvelle.

### État du code vérifié avant modification

`SensorGSP` avait déjà `ShouldApplyMetrology => false` : le serveur ne réapplique donc pas sa couche métrologique générique sur les mesures GSP. Le changement est cohérent avec cette architecture : la valeur `TEMP` produite par le nouveau firmware devient directement la valeur finale utilisée par VigiSensys.

Le schéma contient déjà :

- `t_ajustage.Coeff_X2`, `Coeff_X`, `Coeff_Constant`;
- `t_sonde.Sonde_Offset`;
- `t_etalonnage.Err_Justesse`;
- `t_lieu.Est_Correction_Ej`.

Aucune migration DB n’est nécessaire. Aucun flag multipoint séparé n’existant actuellement, le mode `m=1` est déduit d’un `Coeff_X2` non nul.

### Correctif PR #40

#### Configuration normale

Mapping envoyé à la GSP :

- linéaire `m=0` : `a=Coeff_X`, `b=Coeff_Constant`, `c=0`;
- multipoint `m=1` : `a=Coeff_X2`, `b=Coeff_X`, `c=Coeff_Constant`;
- `d=Sonde_Offset`;
- `e=dernier Err_Justesse` uniquement lorsque `Est_Correction_Ej=1`, sinon `0`.

Les coefficients A/B/C sont formatés avec 10 décimales et Offset/Justesse avec 2 décimales. Les limites inactives ou encore stockées avec l’ancienne sentinelle `999` sont envoyées en `NAN`.

Le parseur `DCON` comprend les nouveaux champs `A/B/C/Off/Justesse/Multi/LimH/LimB/F/RetB/RetH` tout en conservant la lecture des anciens firmwares. L’ancien sens compact de `d` comme retard partagé n’est accepté que si les nouveaux champs métrologiques ne sont pas détectés.

#### Ajustage

Avant de créer réellement la session et donc avant la première acquisition, chaque GSP sélectionnée reçoit :

`a=1, b=0, c=0, d=0, e=0, m=0`.

`h/l/f/r/t` sont conservés. La configuration normale est restaurée après validation finale, arrêt, annulation, expiration ou rollback de démarrage.

Lors d’un ajustage réussi, le second point persiste d’abord le nouveau `t_ajustage`, puis la restauration relit ces nouveaux coefficients avant de renvoyer l’`ECON` normal.

#### Étalonnage

Avant la première lecture, la GSP conserve ses coefficients A/B/C, son offset et son mode multipoint mais reçoit temporairement `e=0`.

Cette option a été retenue plutôt que de réajouter l’ancienne erreur côté serveur : elle évite toute double correction et fait travailler les dix mesures directement sur la valeur ajustée mais sans l’ancienne justesse.

Une GSP ajoutée pendant la phase `reading` reçoit elle aussi `e=0` avant son intégration. La configuration normale est restaurée après 10/10, arrêt, expiration ou rollback. Après une campagne réussie, le nouvel `Err_Justesse` déjà persisté est relu et envoyé si `Est_Correction_Ej=1`.

Les GSO ne sont jamais ciblées par ce helper `ECON`.

### Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs`;
- `website/src/lib/metrology-gsp-configuration.ts`;
- `website/src/lib/metrology-gsp-configuration-restore.ts`;
- `website/src/app/api/metrologie/ajustage/session/route.ts`;
- `website/src/app/api/metrologie/ajustage/session/point/route.ts`;
- `website/src/app/api/metrologie/etalonnage/session/route.ts`;
- `website/docs/gsp-econ-metrology-2026-08.md`.

### Validation terrain restante

- [ ] build C# du service Windows;
- [ ] `pnpm i18n:check`;
- [ ] `pnpm lint`;
- [ ] `pnpm build`;
- [ ] configuration normale linéaire : contrôler `A/B/C/Off/Justesse/Multi` via `DCON`;
- [ ] multipoint : utiliser un `Coeff_X2` non nul et vérifier `Multi=1` + mapping des trois coefficients;
- [ ] désactiver le seuil haut et vérifier `LimH=NAN`;
- [ ] désactiver le seuil bas et vérifier `LimB=NAN`;
- [ ] Ajustage : vérifier l’`ECON` neutre avant la première lecture;
- [ ] Ajustage terminé : vérifier que les nouveaux coefficients persistés sont immédiatement renvoyés;
- [ ] Ajustage annulé/arrêté/expiré : vérifier la restauration de la configuration normale;
- [ ] Étalonnage : vérifier que `A/B/C/Off/Multi` restent identiques mais `Justesse=0` pendant la campagne;
- [ ] Étalonnage 10/10 avec `Est_Correction_Ej=1` : vérifier que la nouvelle erreur de justesse est renvoyée;
- [ ] Étalonnage avec `Est_Correction_Ej=0` : vérifier que `Justesse=0` reste appliqué en configuration normale;
- [ ] ajouter une GSP pendant la phase de lecture et vérifier qu’elle reçoit `e=0` avant sa première mesure de session;
- [ ] GSO : confirmer qu’aucune commande de ce lot ne lui est envoyée;
- [ ] ancien firmware si disponible : vérifier que l’ancien `DCON` reste lisible;
- [ ] Surveillance : comparer une valeur connue à la formule embarquée et confirmer qu’aucune deuxième correction serveur n’est appliquée.

---

## État du lot au 21/08/2026

Les points historiques B17-001 à B17-011 sont corrigés dans `dev`.

Pour les retours B20/B21 :

1. **B20-001 + B20-002** — corrigés dans `dev` via PR #33;
2. **B20-003** — corrigé dans `dev` via PR #34, validation terrain externe encore à effectuer;
3. **B20-004** — corrigé dans `dev` via PR #35;
4. **B20-005 + B20-006** — corrigés dans `dev` via PR #36;
5. **B20-007** — corrigé dans `dev` via PR #39, merge `dc8ecfd2e08976ddcd192dc8836fe0838a6476a2`; validation terrain encore possible;
6. **B21-001** — campagne d’étalonnage 10 mesures corrigée dans `dev` via PR #38; validation terrain en cours;
7. **B21-002** — support du nouveau firmware `ECON` GSP ouvert en draft via PR #40 sur `agent/gsp-onboard-metrology-coefficients`; builds et validation avec le nouveau firmware à effectuer.

La PR #37 a également ramené le lint à **0 erreur bloquante**, les diagnostics React Compiler non applicables restant visibles comme warnings tant que le compilateur n’est pas activé.

Le `dev` de référence au démarrage de B21-002 est `dc8ecfd2e08976ddcd192dc8836fe0838a6476a2` (merge PR #39).

## Règle de reprise pour une nouvelle conversation

Avant tout changement :

1. lire ce fichier;
2. vérifier le HEAD réel de `dev`;
3. vérifier les PR ouvertes et les dernières PR mergées;
4. vérifier si une branche liée au prochain point existe déjà;
5. comparer le backlog au code actuel avant de conclure qu’un point est encore à faire;
6. partir du dernier `dev` pour la nouvelle branche;
7. avant PR, comparer le diff complet à `dev` et éliminer tout changement parasite;
8. mettre à jour ce backlog avec branche, PR, cause, fichiers et checklist;
9. ne jamais merger la PR à la place de l’utilisateur;
10. après annonce du merge, vérifier réellement la PR et le nouveau HEAD de `dev` avant le lot suivant.
## Build MSSQL et parité du seed SQL Server — 25/08/2026

Statut : **mergé dans `dev` via la PR #44, merge `4e9e87371f1a25eedd750aa784f3a44363477583`**.

Le build avec le provider MSSQL échouait pendant le prérendu des routes admin (`/en/admin/utilisateurs`, puis `/fr/admin/audit`) parce que ces pages tentaient d'interroger Prisma pendant `next build`. Le layout du groupe admin est désormais un composant serveur qui appelle `connection()` pour forcer le rendu à la requête ; toute la logique interactive existante reste isolée dans `admin-layout-client.tsx`.

Le seed `db/vigisensys_seed_mssql.sql` a également été rapproché du seed MySQL courant. La priorité a porté sur `TRG_AFT_INS_MES_GSO` et `TRG_AFT_INS_MES_GSO_BUILD` : fenêtre de remontée mémoire de 192 h, prise en charge de la trame répéteur `10000000`, propagation de `Est_Mesure_Repeteur_GSO`, codes de trame métrologie `10`/`110` et prise en compte de `Sonde_Offset` pour l'étalonnage. Les colonnes manquantes détectées sur les tables partagées ont été ajoutées sans supprimer les extensions MSSQL utilisées par le produit actuel, et `tm_mesures_etalon` reprend le nom MySQL pluriel.

L'audit exhaustif a ensuite couvert les tables, colonnes, types, nullabilités, valeurs par défaut, vues, triggers, équivalents des events MySQL, référentiels et paramètres initiaux. Il a conduit à aligner les types/valeurs par défaut encore divergents, à matérialiser les trois `ENUM` MySQL avec des contraintes `CHECK`, et à injecter les référentiels actionneurs/modules/étalons ainsi que les 154 paramètres historiques du dump MySQL requis par les anciens services. Les paramètres et autorisations propres au web actuel sont conservés en extension ; leur suppression ne constituerait pas une parité fonctionnelle et casserait des fonctions livrées après le dump historique.

Cette première installation de test porte la version produit **`0.90.001`**, jalon de stabilisation avant la première version finie. La version technique SemVer du web est `0.90.1`, affichée sous la forme produit `0.90.001`. Le serveur .NET utilise `0.90.1.0` avec `AssemblyInformationalVersion("0.90.001")`, et les deux seeds enregistrent `VERSION/SCHEMA_VERSION = 0.90.001`.

Principaux fichiers :

- `website/src/app/[locale]/(admin)/layout.tsx` ;
- `website/src/app/[locale]/(admin)/admin-layout-client.tsx` ;
- `website/src/lib/app-version.ts` ;
- `website/package.json` ;
- `Vigitemp Serveur/Vigitemp Serveur/Properties/AssemblyInfo.cs` ;
- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql`.

Checklist de validation :

- [ ] exécuter `pnpm build` avec `DATABASE_PROVIDER=sqlserver` sans base accessible et confirmer l'absence d'accès Prisma au prérendu admin ;
- [ ] créer une base SQL Server vide avec le seed complet ;
- [ ] vérifier l'affichage web `0.90.001`, la version informative du service et `VERSION/SCHEMA_VERSION` dans les deux bases ;
- [ ] contrôler la présence des colonnes communes ajoutées et de `dbo.tm_mesures_etalon` ;
- [ ] insérer des trames GSO `0`, `1` et `10000000`, puis contrôler `tm_mesures_gso_build`, `tm_mesures` et `tm_graphique` ;
- [ ] insérer des trames métrologie `10` et `110`, puis contrôler les mesures d'ajustage/étalonnage et l'offset ;
- [ ] exécuter `db/vigisensys_verify_mssql_objects.sql`.

## Temporisation des consignes d’étalonnage — 25/08/2026

Statut : **mergé dans `dev` via la PR #45 ; correctif de build CS0136 également mergé via la PR #46, merge `47593e05fc0bc296d30b0f4b5b6cea04fd6cbb88`**.

Lors d’un étalonnage, les écritures de configuration GSP pouvaient partir avec seulement 150 ms d’intervalle. Malgré le verrouillage du port série, le module n’avait pas toujours le temps de traiter la rafale de consignes et les envois suivants pouvaient échouer.

Le serveur impose désormais une temporisation de **500 ms après chaque écriture de configuration en contexte `ETALONNAGE`**. Le mutex du port reste détenu pendant l’attente : la protection couvre les commandes d’une même requête ainsi que les requêtes concurrentes visant d’autres sondes raccordées au même module/port. Les lectures normales et les opérations hotline hors étalonnage conservent leur délai historique de 150 ms.

Fichier :

- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`.

Checklist :

- [x] délai appliqué au point réel d’écriture série ;
- [x] changement limité au contexte `ETALONNAGE` ;
- [x] sérialisation conservée pendant les 500 ms ;
- [ ] compiler le serveur Windows en Release ;
- [ ] lancer un étalonnage multi-sondes sur un même module ;
- [ ] contrôler les horodatages TX et confirmer l’absence d’échec d’envoi.

Correctif de build : renommage de la variable englobante en `normalizedOperationContext` pour supprimer la collision C# `CS0136`, sans changement de comportement.


## Nettoyage des paramètres et profils des seeds — 25/08/2026

Statut : **mergé dans `dev` via la PR #47, merge `afa59e2e7f19294f52d29830cc36122c23d274f7`**.

Le dump de la base de test contient 91 clés `t_parametre`. Les trois clés `LICENCE/CLIENT`, `LICENCE/VIGITEL` et `LICENCE/VIGITEMP` restent volontairement hors des seeds : leurs valeurs sont propres à chaque installation. Avec `VERSION/SCHEMA_VERSION = 0.90.001`, les seeds MySQL et MSSQL créent donc exactement **89 paramètres initiaux**.

Les **138 anciennes clés** absentes de la base de référence ont été retirées des deux moteurs. La simulation de l’ordre réel des insertions et mises à jour donne le même état final MySQL/MSSQL : 89 clés, mêmes valeurs par défaut, mêmes commentaires et mêmes dates.

Les profils inutiles supprimés avant cette PR ne sont pas référencés par le code applicatif. Le profil initial `Administrateurs` reste lié au compte administrateur et reçoit toutes les autorisations. Les virgules finales laissées dans les blocs MySQL et MSSQL ont été corrigées.

Fichiers :

- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql` ;
- `db/vigisensys_verify_mssql_objects.sql`.

Checklist :

- [x] comparer les clés du dump de test aux deux seeds sans reprendre les valeurs sensibles ;
- [x] exclure les trois clés de licence propres à l’installation ;
- [x] conserver la version de schéma `0.90.001` ;
- [x] confirmer les 89 clés finales et la parité des valeurs/commentaires MySQL-MSSQL ;
- [x] confirmer l’absence de référence applicative aux profils supprimés ;
- [x] corriger la syntaxe des blocs de profils ;
- [ ] exécuter le seed MySQL sur une base vide ;
- [ ] exécuter le seed MSSQL sur une base vide ;
- [ ] exécuter `db/vigisensys_verify_mssql_objects.sql`.


## Découpage ECON pendant l’étalonnage — 25/08/2026

Statut : **mergé dans `dev` via la PR #48, merge `42b651d7ac66c4c6c9cafcb8634a4db1800928af`**.

Le module GSP ne doit plus recevoir tous les paramètres d’étalonnage dans une seule trame. Pour chaque sonde et pour toute configuration envoyée avec le contexte `ETALONNAGE`, le serveur découpe désormais la commande complète en deux écritures successives :

1. `ECON<sonde> <A>a<B>b` ;
2. `ECON<sonde> <C>c<Offset>d<Justesse>e<Multi>m<LimH>h<LimB>l<F>f<RetB>r<RetH>t`.

Les deux envois restent dans la même prise du mutex du port série. Une attente de 500 ms est appliquée après chaque écriture et chaque étape doit retourner `ACK=ECON`. En cas d’échec de la première étape, la seconde n’est pas envoyée. L’ajustage et les synchronisations hors contexte d’étalonnage conservent leur trame unique.

Fichiers :

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` ;
- `website/docs/gsp-econ-metrology-2026-08.md`.

Checklist :

- [x] découper la trame après le paramètre `b` ;
- [x] conserver l’ordre `a/b`, puis `c/d/e/m/h/l/f/r/t` ;
- [x] conserver le mutex du port pendant les deux commandes ;
- [x] appliquer 500 ms après chacune des deux écritures ;
- [x] exiger un ACK avant d’envoyer la deuxième commande ;
- [x] laisser les autres contextes inchangés ;
- [ ] compiler le serveur Windows en Release ;
- [ ] lancer un étalonnage avec plusieurs GSP sur un même module ;
- [ ] vérifier dans les logs deux TX et deux ACK par sonde, dans le bon ordre ;
- [ ] confirmer un intervalle d’au moins 500 ms entre les écritures ;
- [ ] simuler l’absence d’ACK de la première commande et confirmer que la seconde n’est pas envoyée.


## Prérendu audit et build MSSQL — 25/08/2026

Statut : **PR #49 mergée dans `dev`, merge `31f8c489e1654be54950a0a169870815730d40a8`**.

Le build avec `DATABASE_PROVIDER=sqlserver` exécutait encore Prisma pendant l’export de `/[locale]/admin/audit`, sur le comptage `prismaMesure.tm_journal.count()`. Le `connection()` ajouté au layout du groupe admin ne suffisait pas : avec `cacheComponents: true`, les chargeurs marqués `"use cache"` pouvaient être préremplis pendant le prérendu.

La page audit appelle désormais `connection()` elle-même avant tout accès aux données, puis charge directement les journaux sans cache de build. Les statistiques `tm_journal` inutilisées ont été supprimées, ainsi que les deux fichiers concurrents `server-audit-logs.ts` et `server-audit-logs.tsx`.

Le même antipattern existait sur `admin/utilisateurs` et `admin/parametres`. Ces routes ont été corrigées dans le même lot afin qu’un autre worker de build ne soit pas le prochain à échouer.

Fichiers :

- `website/src/app/[locale]/(admin)/admin/audit/page.tsx` ;
- `website/src/app/[locale]/(admin)/admin/utilisateurs/page.tsx` ;
- `website/src/app/[locale]/(admin)/admin/utilisateurs/server-users.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/page.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/server-settings.tsx`.

Checklist :

- [x] placer `connection()` dans la page audit avant la requête Prisma ;
- [x] supprimer le comptage audit inutilisé ;
- [x] supprimer les deux modules audit concurrents ;
- [x] retirer `"use cache"` des chargeurs Prisma utilisateurs et paramètres ;
- [x] placer `connection()` dans les pages utilisateurs et paramètres ;
- [x] contrôler les 33 pages et chargeurs serveur du groupe admin ;
- [ ] exécuter `pnpm build` avec `DATABASE_PROVIDER=sqlserver` ;
- [ ] ouvrir les pages audit, utilisateurs et paramètres sur une installation MSSQL ;
- [ ] confirmer le rafraîchissement des données après navigation et `router.refresh()`.


## ECON métrologique compact + infos modifiées — 25/08/2026

Statut : **`CORRIGE_DEV` — PR #50 — branche `agent/gsp-metrology-compact-abc` — merge `a2720060a413f39d7bd2ce7a287e29bdd77f828f`**.

### Retour

Pour les GSP interrogées pendant un Ajustage ou un Étalonnage :

- à chaque interrogation de mesure, `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` doit être remis à `1` ;
- les trames `ECON` de métrologie doivent envoyer **uniquement `a`, `b` et `c`**, sans les consignes ni les autres paramètres ;
- une trame de référence `ECONSPNB-26000065 1.0000000000a0.0000000000b0.0000000000c` fait **57 caractères**, taille compatible avec le module de réception.

Ce besoin remplace la stratégie de la PR #48 qui découpait uniquement l'Étalonnage en deux trames.

### État vérifié avant correction

Le lot a été démarré depuis le HEAD réel de `dev` `31f8c489e1654be54950a0a169870815730d40a8`, merge de la PR #49. Aucune PR n'était ouverte et aucune branche Ajustage/Étalonnage concurrente n'a été trouvée.

Les lectures répétées des deux parcours passent déjà par `/api/hotline/sensor-test` avec `action=read` et respectivement `operationContext=AJUSTAGE` / `ETALONNAGE`. Le serveur possède déjà `IDatabaseProvider.setLieuInfosModifiees()` qui écrit directement `Infos_Modifiees_Depuis_Derniere_Mesure` dans `t_lieu` ; aucun changement de schéma n'est nécessaire.

Avant ce lot, la hotline :

- ne remettait pas ce flag à `1` lors des lectures de métrologie réalisées via port manuel ;
- envoyait une trame complète en Ajustage ;
- envoyait deux trames en Étalonnage depuis la PR #48 (`a/b`, puis `c/d/e/m/h/l/f/r/t`).

### Correctif PR #50

Fichier serveur principal :

- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`.

Comportement :

- avant chaque lecture GSP en contexte Ajustage/Étalonnage, le serveur résout le lieu par numéro de série et appelle `setLieuInfosModifiees(idLieu, true)` ;
- cela couvre `read`, `force-read` et les lectures raw `TEMP` / `FTEM` / `RTEMP` ;
- la mise à jour est tentée même lorsque le port série est fourni explicitement par le web ;
- un échec SQL est journalisé mais n'empêche pas l'interrogation série ;
- toute commande raw `ECON` ayant un contexte `AJUSTAGE` ou `ETALONNAGE` est validée puis tronquée juste après le marqueur `c` ;
- le module reçoit donc une seule trame `ECON<sonde> <A>a<B>b<C>c` ;
- `d/e/m/h/l/f/r/t` ne sont pas transmis pendant cette opération ;
- l'attente de 500 ms et l'exigence `ACK=ECON` sont conservées ;
- les synchronisations `ECON` hors métrologie ne sont pas modifiées ;
- le flag `Infos_Modifiees_Depuis_Derniere_Mesure=1` permet au scheduler de refaire ensuite une synchronisation normale complète lorsque la sonde revient dans le cycle de Surveillance ; une synchronisation normale réussie remet déjà ce flag à `0`.

Documentation mise à jour :

- `website/docs/gsp-econ-metrology-2026-08.md`.

### Vérifications effectuées

- [x] branche créée depuis le HEAD actuel de `dev` ;
- [x] diff contrôlé contre `dev` ;
- [x] compactage d'une commande complète vers `a/b/c` uniquement ;
- [x] commande déjà compacte laissée identique ;
- [x] commande sans `c` rejetée ;
- [x] exemple SPNB vérifié à 57 caractères ;
- [x] aucune CI GitHub disponible sur le commit de la branche ;
- [ ] compiler le service Windows en Release sur un environnement .NET compatible.

### Checklist terrain

- [ ] lancer un Ajustage sur une GSP et vérifier une seule trame `ECON` contenant `a/b/c` ;
- [ ] lancer un Étalonnage sur une GSP et vérifier le même format ;
- [ ] confirmer l'absence de `d/e/m/h/l/f/r/t` dans les TX de métrologie ;
- [ ] contrôler `ACK=ECON` après la trame compacte ;
- [ ] contrôler dans les logs la longueur envoyée (`sentChars=57` avec l'exemple de référence) ;
- [ ] pendant plusieurs interrogations successives d'Ajustage, vérifier que `Infos_Modifiees_Depuis_Derniere_Mesure` vaut/revient à `1` ;
- [ ] refaire le même contrôle en Étalonnage ;
- [ ] sortir de la métrologie, remettre la sonde en Surveillance et vérifier une synchronisation complète puis le retour du flag à `0` ;
- [ ] vérifier qu'une synchronisation normale hors métrologie conserve le `ECON` étendu ;
- [ ] vérifier qu'une GSO n'est jamais ciblée par ce chemin série GSP.


## Ajustements interface étalonnage — 26/08/2026

Statut : **`CORRIGE_DEV` — PR #55 — branche `agent/calibration-ui-cleanup-navigation` — merge `fcf20fb2fed2cc06b95d38878a79edd56d4c96c0`**.

### Contexte vérifié avant correction

Le lot part du HEAD réel de `dev` `f8c87bc1f349d85dbcdc5b58593b70284a65c697`, merge de la PR #54 `agent/calibration-preview-ui-unassigned-sensors`. Aucune PR n'était ouverte au démarrage du lot. La PR #54 avait volontairement conservé le tableau récapitulatif des 10 acquisitions et avait ajouté l'étalon à la première ligne du tableau de dernière mesure.

Le retour du 26/08/2026 demande deux simplifications d'interface :

- supprimer le tableau séparé des 10 dernières mesures de l'étalon, devenu redondant avec le tableau global alignant l'étalon et les sondes ;
- empêcher l'utilisateur de quitter la page via le bandeau de navigation métrologie en bas tant qu'un étalonnage est réellement en cours.

### Correctif PR #55

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-workflow-client.tsx` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/_components/metrology-subpages-cards.tsx`.

Comportement :

- le bloc `standard_samples` dédié uniquement aux mesures de l'étalon n'est plus rendu ;
- le tableau global `all_samples`, qui conserve les 10 acquisitions alignées entre l'étalon et toutes les sondes, reste inchangé ;
- `MetrologySubpagesCards` accepte désormais un prop optionnel `disabled` sans changer le comportement des autres pages ;
- la page d'étalonnage transmet `disabled={running}` ;
- tant que la session d'étalonnage est `running`, les CTA du bandeau restent visibles mais sont rendus comme de vrais boutons désactivés, sans `Link` navigable ;
- avant le démarrage et après arrêt/fin de la session, la navigation redevient normale.

### Vérifications effectuées

- [x] branche créée depuis le HEAD actuel de `dev` ;
- [x] vérification des PR ouvertes avant modification ;
- [x] comparaison avec la PR #54 pour ne pas supprimer le tableau récapitulatif utile ;
- [x] suppression limitée au tableau séparé de l'étalon ;
- [x] diff UI contrôlé avant ouverture de la PR ;
- [x] PR #55 ouverte vers `dev` sans merge automatique.

### Checklist terrain

- [ ] préparer un étalonnage sans le démarrer : le bandeau de navigation reste utilisable ;
- [ ] démarrer l'étalonnage : les trois CTA du bandeau deviennent inactifs ;
- [ ] confirmer qu'aucun clic sur ce bandeau ne permet de changer de sous-page pendant la session ;
- [ ] arrêter ou terminer l'étalonnage : le bandeau redevient utilisable ;
- [ ] confirmer la disparition du tableau séparé des mesures étalon ;
- [ ] confirmer que le tableau récapitulatif des 10 acquisitions étalon + sondes est toujours présent ;
- [ ] vérifier thème clair/sombre et FR/EN ;
- [ ] lancer `pnpm lint` et `pnpm build` dans l'environnement projet complet.


## GSP — filtrage `+++` en Surveillance et rejet des coefficients `ovf` — 27/08/2026

Statut : **`CORRIGE_DEV` — PR #62 — branche `agent/gsp-surveillance-coefficients` — merge `83c1234c52b7a4e50f16e8950278bf8d541c9d7e`**.

### Retours terrain

Deux retours sont regroupés dans ce lot :

- la PR #61 a corrigé le token série `+++` pour les lectures Hotline / métrologie, mais la Surveillance utilise le lecteur `SensorGSP` et devait bénéficier du même filtrage dans sa propre boucle de lecture ;
- une capture montre une trame `ECON` contenant déjà un coefficient B d'environ `450000000` avant l'arrivée de la réponse firmware, puis `ACK=ECON` avec `B=ovf`.

### État vérifié / cause

- `SensorGSP` appelle `GspProtocol.StripCommandEcho()` pour déterminer si les octets reçus sont significatifs et démarrer les temporisations de réponse ; le filtre `+++` doit donc être situé dans la couche protocolaire commune pour couvrir réellement Surveillance ;
- les helpers `FormatCoefficient()` côté C# et `formatCoefficient()` côté Web ne multiplient pas les valeurs, ils les sérialisent sur 10 décimales ; le `450000000` observé est donc déjà une valeur source avant l'envoi à la sonde ;
- le mapping A/B/C reste le mapping existant : linéaire `A=Coeff_X`, `B=Coeff_Constant`, `C=0`, multipoint `A=Coeff_X2`, `B=Coeff_X`, `C=Coeff_Constant` ;
- aucune plage numérique firmware exploitable n'est documentée dans le dépôt : aucun clamp arbitraire n'est ajouté ;
- le moteur d'ajustage refuse déjà le cas strict où les deux valeurs brutes sont égales, mais une différence très faible et non nulle peut mathématiquement produire un coefficient très grand. La capture seule ne permet pas d'affirmer que c'est la cause du cas terrain : la dernière ligne `t_ajustage` doit être vérifiée.

### Correctif PR #62

Serveur :

- ajout de `GspProtocol.StripTransportNoise()` et utilisation depuis `StripCommandEcho()` ;
- seul le token exact `+++` est supprimé, y compris lorsqu'il précède la vraie trame ;
- les valeurs métier contenant des `+`, notamment `Alarm=F+D+E+LH+LB+RB+RH`, restent intactes ;
- ajout de `TryGetOverflowField()` ;
- `IsAcknowledgementForTarget()` refuse désormais toute réponse contenant un champ `*=ovf`, même si `ACK=ECON` est présent ;
- la synchronisation de configuration de Surveillance ne considère donc plus `B=ovf` comme un succès.

Web / métrologie :

- `metrology-gsp-configuration.ts` détecte aussi `*=ovf` dans la réponse brute ;
- Ajustage / Étalonnage remontent une erreur explicite avec le nom du paramètre concerné au lieu de valider silencieusement l'ECON.

Versioning :

- Serveur `0.90.3` ;
- Installateur Serveur `0.90.3` ;
- Web technique `0.90.2`, affiché côté produit sous la forme `0.90.002` ;
- Agent inchangé `1.0.1` ;
- aucune migration BDD.

### Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/Properties/AssemblyInfo.cs` ;
- `Vigitemp Serveur/VigitempServerInstaller/VigitempServerInstaller.csproj` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/package.json` ;
- `CHANGELOG.md` ;
- `website/docs/gsp-plus-transport-noise-27-08-2026.md` ;
- `website/docs/gsp-econ-metrology-2026-08.md` ;
- `website/docs/gsp-econ-overflow-27-08-2026.md`.

### Validation terrain

- [ ] en Surveillance, reproduire `+++` avant `ACK=TEMP` et confirmer que le lecteur attend la vraie réponse ;
- [ ] vérifier une lecture GSP sans `+++` ;
- [ ] confirmer que `Alarm=F+D+E+LH+LB+RB+RH` reste intact ;
- [ ] vérifier qu'un `ACK=ECON` normal reste accepté ;
- [ ] reproduire `A=ovf`, `B=ovf` et `C=ovf` si possible et confirmer le rejet côté Surveillance ;
- [ ] reproduire `ovf` pendant Ajustage / Étalonnage et confirmer l'erreur explicite côté Web ;
- [ ] exécuter la requête de diagnostic documentée sur les derniers `t_ajustage` de `SPNB-26000102` ;
- [ ] comparer les coefficients stockés et les deux valeurs brutes à la trame TX observée ;
- [ ] compiler le service Windows et l'installateur Serveur `0.90.3` ;
- [ ] lancer `pnpm lint`, `pnpm i18n:check` et `pnpm build` ;
- [ ] valider un ajustage linéaire normal puis un cas multipoint normal.


## GSP — limite 60 caractères des commandes de configuration — 28/08/2026

Statut : **`CORRIGE_DEV` — PR #69 — merge `156da60c3847ee751fa3ad7077b35f4bdd505c02`**.

### Retour terrain / cause

Les modules de communication GSP acceptent au maximum **60 caractères par commande**. Au-delà, la commande peut être ignorée complètement par le module. Le risque concerne notamment les grosses resynchronisations de Surveillance : le `ECON` complet regroupe les coefficients, l'offset, la correction de justesse, les consignes, la fréquence et les délais (`a/b/c/d/e/m/h/l/f/r/t`) et dépasse facilement cette limite.

Ajustage et Étalonnage étaient déjà protégés depuis la PR #50 : leur `ECON` de métrologie est compacté aux seuls coefficients `a/b/c`, soit 57 caractères pour l'exemple `SPNB-26000065`. Le chemin normal de Surveillance et la synchronisation structurée de la Hotline pouvaient encore envoyer un `ECON` complet trop long.

### Correctif

- ajout d'une limite partagée `GspProtocol.MaxModuleCommandCharacters = 60` ;
- ajout de `TryBuildCommandFragments(...)`, qui conserve le payload métier complet mais le découpe uniquement aux frontières des paramètres `a/b/c/d/e/m/h/l/f/r/t` ;
- la longueur inclut `ECON`, la cible réelle de la sonde, l'espace et le payload ;
- aucune valeur numérique n'est coupée au milieu ;
- `SensorGSP` applique le découpage aux synchronisations automatiques de Surveillance ;
- `HotlineApiServer.SendGspCommand()` applique la même protection à la synchronisation structurée Hotline ;
- chaque fragment doit recevoir son ACK avant l'envoi du suivant ; en cas d'échec, la séquence s'arrête immédiatement ;
- le mode `raw` libre de la Hotline n'est pas modifié ; les parcours raw d'Ajustage/Étalonnage restent protégés par leur compactage `a/b/c` existant.

Exemple de référence avec `SPNB-26000065` : une commande complète de 80 caractères est découpée en **57 + 41 caractères**. Le nombre de fragments n'est pas forcé à deux : si des valeurs exceptionnellement longues l'exigent, le Serveur crée autant de fragments que nécessaire pour respecter strictement les 60 caractères.

### Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorGSP.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` ;
- `Vigitemp Serveur/CHANGELOG.md` ;
- `website/docs/gsp-command-limit-28-08-2026.md`.

### Vérifications / checklist terrain

- [x] branche créée depuis le HEAD `dev` `237b582ec6d2dc97639829216899ba841b8914c9` ;
- [x] aucune PR ouverte au démarrage ;
- [x] exemple 80 caractères => 57 + 41 ;
- [x] `ECON a/b/c` de 57 caractères laissé intact ;
- [x] payload artificiellement plus long testé : aucun fragment au-delà de 60 caractères ;
- [x] arrêt de la séquence prévu dès le premier ACK manquant ;
- [ ] compiler le Serveur Windows ;
- [ ] modifier simultanément consignes, fréquence et délais sur une GSP et vérifier plusieurs TX `ECON` de 60 caractères maximum ;
- [ ] vérifier un ACK après chaque fragment ;
- [ ] simuler l'absence d'ACK du premier fragment et confirmer que le suivant n'est pas envoyé ;
- [ ] valider Ajustage et Étalonnage sans régression sur le `ECON a/b/c` compact.



## Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026

Statut : **`CORRIGE_DEV` — PR #70 mergée (`2eb6c7f6b2f42d6cc6ea1471836dd443fb1fb7e2`) ; complément application coefficients sur `agent/adjustment-apply-calculated-coefficients`**.

### Retour / comportement attendu

- supprimer le bouton séparé de lecture des sondes ;
- le lancement de l’ajustage active directement la lecture continue des sondes et de l’étalon sans démarrer de plateau ;
- `Lancer l’acquisition du premier/deuxième point` démarre le plateau correspondant ;
- un plateau stable arrivé à sa durée configurée valide automatiquement le point ;
- le point utilise la moyenne étalon et les moyennes sondes calculées sur toutes les mesures de la fenêtre ;
- les coefficients restent modifiables avant le point 1 mais sont verrouillés dès son acquisition, avec confirmation utilisateur préalable ;
- un détail de la formule linéaire d’ajustage est disponible après les deux points.

### Fichiers principaux

- `website/src/lib/metrology-adjustment-session.ts` ;
- `website/src/app/api/metrologie/ajustage/session/point/route.ts` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx` ;
- `website/src/messages/supplements.ts` ;
- `website/docs/metrology-adjustment-acquisition-flow-28-08-2026.md`.

### Validation terrain

- [ ] vérifier lecture sonde + étalon dès le lancement, plateau inactif ;
- [ ] vérifier démarrage du plateau exactement au clic d’acquisition ;
- [ ] vérifier moyenne et validation automatique du point 1 ;
- [ ] vérifier verrouillage A/B/C côté interface et API ;
- [ ] vérifier redémarrage du plateau si l’écart maximum est dépassé ;
- [ ] vérifier lecture continue entre les points ;
- [ ] vérifier moyenne et validation automatique du point 2 ;
- [ ] contrôler la formule A/B/C via le détail des calculs ;
- [ ] vérifier GSP/GSO, FR/EN et thèmes clair/sombre ;
- [x] validations techniques : lint sans erreur bloquante, nouveau flux FR/EN contrôlé, TypeScript OK après génération Prisma et build Web Next.js OK en GitHub Actions.


## Ajustage — confirmation d’application des coefficients calculés — 28/08/2026

Statut : **`PR_OUVERTE` — branche `agent/adjustment-apply-calculated-coefficients` — PR #71 vers `dev` — base `2eb6c7f6b2f42d6cc6ea1471836dd443fb1fb7e2`**.

### Retour terrain

Après validation des deux points et calcul des nouveaux coefficients, demander à l’utilisateur s’il souhaite envoyer ces coefficients à la ou aux sondes.

### État vérifié avant correction

Le parcours terminal restaurait automatiquement la configuration GSP en mode `normal`. Comme ce mode relit le dernier `t_ajustage`, les coefficients nouvellement calculés pouvaient être envoyés automatiquement sans confirmation. L’Ajustage ayant neutralisé les coefficients au démarrage, un simple blocage de cet envoi aurait en outre laissé les GSP en `1/0/0`.

### Correctif du lot

- restauration sûre des coefficients précédents dès la fin du calcul ;
- nouveaux coefficients conservés dans `t_ajustage` indépendamment du choix ;
- popup bloquante proposant de conserver les anciens coefficients ou d’envoyer les nouveaux ;
- confirmation : configuration GSP normale avec les nouveaux coefficients + ACK `ECON` obligatoire ;
- refus : aucune application des nouveaux coefficients, les anciens restent sur les GSP ;
- GSO explicitement exclues de l’envoi série ;
- en cas d’échec de communication, la décision reste en attente pour permettre une nouvelle tentative ;
- réutilisation du helper de configuration GSP existant avec surcharge explicite des coefficients, sans dupliquer le protocole.

### Fichiers principaux

- `website/src/lib/metrology-adjustment-session.ts` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-gsp-configuration-restore.ts` ;
- `website/src/app/api/metrologie/ajustage/session/route.ts` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx` ;
- `website/src/messages/supplements.ts`.

### Validation terrain

- [ ] fin Ajustage : popup affichée après calcul ;
- [ ] anciens coefficients restaurés avant le choix ;
- [ ] refus : aucune application des nouveaux coefficients ;
- [ ] confirmation : nouveaux coefficients transmis et ACK vérifié ;
- [ ] plusieurs GSP ;
- [ ] lot mixte GSP/GSO ;
- [ ] échec ACK puis nouvelle tentative ;
- [ ] FR/EN, clair/sombre ;
- [ ] lint, typecheck et build Web.


## Authentification — écran de bienvenue à la première connexion — 28/08/2026

Statut : **`PR_OUVERTE` — branche `agent/first-login-welcome-password-validity` — PR #72 vers `dev`**.

### Retour / besoin

Afficher, lors de la première connexion réussie, une animation de bienvenue puis les informations de renouvellement du mot de passe. La durée affichée doit suivre `CFR21 / VALIDITE_MOT_DE_PASSE_JOURS`.

### Choix d’implémentation

- réutilisation de `t_utilisateur.Date_Heure_Derniere_Connexion` comme marqueur serveur de première connexion ;
- aucune migration BDD et aucun `localStorage` ;
- exposition de la politique CFR21 dans la réponse de login ;
- onboarding plein écran en deux temps, puis reprise du flux de redirection existant ;
- aucun changement des règles existantes de mot de passe temporaire, expiration, warning J-7, sessions JWT/cookies, licences ou droits ;
- FR/EN, clair/sombre et reduced-motion.

### Validation terrain

- [ ] première connexion uniquement ;
- [ ] durée CFR21 correcte ;
- [ ] expiration désactivée ;
- [ ] changement temporaire/expiré toujours prioritaire ;
- [ ] warning J-7 après onboarding ;
- [ ] redirections et Agent inchangés ;
- [ ] FR/EN, clair/sombre, reduced-motion ;
- [ ] lint, typecheck et build Web.


## Authentification — transition après la première connexion — 31/08/2026

Statut : **`PR_OUVERTE` — branche `fix/first-login-transition-loading` — base `dev` `2fbb7bf95240b6256af7c338370ca6f62c1f415e` — PR #74 vers `dev`**.

### Retour

Après le clic sur **Accéder à VigiSensys**, le formulaire de connexion pouvait réapparaître brièvement pendant la finalisation de la session avant la redirection.

### Correction

- conserver l’overlay de première connexion pendant l’initialisation Agent, `/api/me` et la redirection ;
- afficher un écran de préparation avec une phrase FR/EN plutôt qu’un simple libellé de chargement ;
- garantir une transition minimale de 1,6 seconde uniquement pour la première connexion ;
- conserver le warning J-7 avant cette transition lorsqu’il est applicable ;
- ne pas ralentir les connexions ordinaires.

### Validation terrain

- [ ] première connexion sans retour visuel au formulaire ;
- [ ] première connexion avec warning J-7 ;
- [ ] connexion ordinaire inchangée ;
- [ ] FR/EN, clair/sombre, reduced-motion ;
- [ ] lint, typecheck et build Web.


---

## Seeds BDD — accents, fautes et artefacts historiques — 31/08/2026

**Statut : `PR_OUVERTE` — PR #76 — branche `fix/db-seed-french-labels` — vers `dev`.**

### Audit du code courant

Les deux seeds de référence ont été contrôlés ensemble :

- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql`.

Les anciens placeholders `%1`, `%2`, `%3` ainsi que les signatures de mauvais encodage `Ã`, `Â` et `�` ne sont plus présents dans les fichiers actuels. En revanche, de nombreux textes humains provenaient encore des anciennes bases sans accents (`Acces`, `Gerer`, `Boitier reseau`, `Temperature`, `hygrometrie`, `Delai`, etc.). Trois fautes/artefacts certains ont aussi été confirmés dans les deux moteurs : `Sonde talon`, `avec pris RJ45` et `COCO2`.

### Correctif du lot

- correction des libellés/commentaires/descriptions humains avec accents français ;
- correction des trois artefacts confirmés ;
- conservation stricte des clés techniques, codes d’autorisation, noms de colonnes/tables et `Mot_Cle` des paramètres ;
- parité maintenue entre les données communes MySQL et SQL Server ;
- passage du marqueur historique de seed `0.90.001` au SemVer canonique `0.90.1`, conformément à `db/CHANGELOG.md`, sans migration ni changement de schéma.

### Validation

- [x] audit `%1` / `%2` / `%3` : absents avant et après le correctif ;
- [x] audit mojibake `Ã` / `Â` / `�` : absent avant et après le correctif ;
- [x] clés techniques sensibles inchangées ;
- [x] mêmes corrections appliquées aux deux seeds ;
- [ ] exécuter le seed MySQL sur une base vierge ;
- [ ] exécuter le seed SQL Server sur une base vierge ;
- [ ] contrôler dans l’interface les libellés d’autorisations, types de sondes/modules et commentaires de paramètres.

### Fichiers principaux

- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql` ;
- `db/CHANGELOG.md` ;
- `CHANGELOG.md`.


## Lot métrologie — coefficients relus / GSO / imports-exports (10/09/2026)

- **Statut : `PR_OUVERTE` — branche `feature/metrology-coefficient-synchronization` — PR #114 vers `dev`.**
- GSP : DCON au lancement, persistance des coefficients existants, suppression de l'ECON neutre automatique.
- GSO : affichage de `Metrologie_cmd_envoyee` (attente / envoyé) dans les cards de démarrage.
- Ajustage : sélection individuelle des GSP avant envoi des coefficients calculés.
- Ajustage XML : conservation de `COEFFX2`, XML individuel + ZIP contrôlés ; parseur corrigé pour distinguer strictement `COEFFX` et `COEFFX2`.
- Étalonnage : PDF individuel + ZIP proposés.
- Import XML : GSP/GSO, lecture live DCON pour GSP, upsert ciblé sans suppression complète de l'historique.
- Validation automatique : GitHub Actions run `34572188177` — test ciblé, ESLint, TypeScript et build production OK.
- Documentation détaillée : `website/docs/metrology-coefficient-synchronization-10-09-2026.md`.

### Validation terrain

- [ ] GSP avec coefficients non neutres : vérifier que DCON remplit A/B/C sans ECON automatique au lancement ;
- [ ] GSP sans ajustage puis avec ajustage existant : vérifier création / mise à jour ciblée en base ;
- [ ] GSO : vérifier le passage visible de « commande en attente » à « commande envoyée » ;
- [ ] fin d'ajustage : sélectionner une seule GSP et confirmer que seule celle-ci reçoit les coefficients calculés ;
- [ ] export XML individuel + ZIP avec `COEFFX2/COEFFX/COEFFCONSTANT` ;
- [ ] export PDF individuel + ZIP après étalonnage ;
- [ ] import XML GSO puis GSP et vérifier l'upsert, avec DCON prioritaire pour la GSP.

---

## R21-001 — Trier le suivi métrologique par prochain étalonnage

**Statut : `CORRIGE_DEV` — PR #137 — squash merge `0c7d7ea4ea07bc4e39613c304e33aec5f3d0cb40`**

### Retour — 21/09/2026

Sur la page **Métrologie**, le tableau de suivi doit présenter en priorité les lieux dont la date de prochain étalonnage est la plus proche.

### État vérifié avant correction

Le tableau expose déjà la colonne **Date prochain étalonnage** via `dateProchainEtalonnage`, mais les données étaient transmises dans l'ordre de récupération de l'API et aucun tri initial n'était appliqué côté écran.

### Correctif du lot

- tri initial ascendant sur `dateProchainEtalonnage` ;
- la date la plus proche apparaît en premier ;
- les lignes sans date de prochain étalonnage sont conservées en fin de tableau ;
- le tri interactif existant de `TanStackTable` reste disponible pour l'utilisateur ;
- aucune requête, formule métrologique ou donnée persistée n'est modifiée.

### Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/metrologie/metrology-dashboard-client.tsx` ;
- `website/package.json` ;
- `website/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- Web : **1.4.1** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée.

### Validation terrain

- [ ] ouvrir Administration > Métrologie avec plusieurs échéances différentes ;
- [ ] confirmer que la date de prochain étalonnage la plus proche est affichée en haut ;
- [ ] vérifier que les dates plus lointaines suivent dans l'ordre chronologique ;
- [ ] vérifier que les lignes sans prochaine date restent visibles en fin de tableau ;
- [ ] cliquer sur d'autres colonnes et confirmer que le tri manuel du tableau reste fonctionnel ;
- [ ] contrôler le rendu FR/EN des dates.

---

## R21-002 — Page Hotline & aide orientée utilisateur

**Statut : `CORRIGE_DEV` — PR #138 — squash merge `93a46e690edf8ea79c358b9e53d1cc2ca2fbaf9b`**

### Retour — 21/09/2026

Ajouter dans la sidebar un accès **Hotline & aide** menant vers une page orientée utilisateur, distincte de la console Hotline technique.

La page doit :

- expliquer le fonctionnement global de VigiSensys et les notions Site / Groupe / Lieu / Sonde / Surveillance / Alarme ;
- proposer des procédures courantes, notamment la mise en surveillance d'une sonde encore non affectée à un lieu ;
- expliquer dès le haut de page que le guide est volontairement centré sur l'usage et que la hotline MC2 reste disponible lorsqu'un besoin n'est pas couvert ;
- afficher en bas de page l'email et le numéro de téléphone Hotline ;
- proposer un bouton **Nous écrire** ouvrant l'application de messagerie du poste avec un modèle de demande prérempli.

### État vérifié avant correction

- la sidebar utilisateur ne disposait d'aucune entrée Hotline/Aide ; seul le hub **Services** était présent dans le footer ;
- la route `/hotline/[slug]` existante est une console de diagnostic technique et ne doit pas être exposée comme guide utilisateur ;
- aucune page applicative ne regroupait les concepts VigiSensys et les procédures opérateur demandées ;
- les routes localisées ne déclaraient pas de chemin `/aide` / `/help`.

### Implémentation du lot

- nouvelle route canonique `/help`, localisée en `/fr/aide` et `/en/help` ;
- nouvelle entrée **Hotline & aide** dans le footer de la sidebar, en conservant l'accès **Services** ;
- présentation des concepts Site, Groupe, Lieu, Sonde, Surveillance et Alarme ;
- procédures pas à pas :
  - créer/configurer un lieu à partir d'une sonde non affectée puis activer sa surveillance ;
  - analyser et acquitter une alarme ;
  - désactiver puis réactiver temporairement la surveillance ;
  - consulter le graphique et l'historique d'un lieu ;
- rappel des restrictions liées aux droits et à la licence ;
- bloc Hotline avec email cliquable, téléphone cliquable et bouton **Nous écrire** ;
- modèle `mailto:` prérempli avec établissement, contact, téléphone, version Web VigiSensys, page, lieu, sonde, objet, description, étapes de reproduction et message d'erreur ;
- traductions FR/EN isolées dans un supplément i18n dédié ;
- coordonnées Hotline centralisées dans `website/src/lib/support-contact.ts`.

### Coordonnées affichées

- email : `contact@mc2lab.fr` ;
- téléphone : `04 73 28 99 99`.

### Fichiers principaux

- `website/src/app/[locale]/(dashboard)/help/page.tsx` ;
- `website/src/app/[locale]/(dashboard)/help/help-support-page-client.tsx` ;
- `website/src/components/app-sidebar.tsx` ;
- `website/src/i18n/routing.ts` ;
- `website/src/i18n/request.ts` ;
- `website/src/messages/help-support-supplements.ts` ;
- `website/src/lib/support-contact.ts` ;
- `website/scripts/test-help-support-page.ts`.

### Version

- Web : **1.5.0** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée.

### Validation terrain

- [ ] vérifier l'entrée **Hotline & aide** dans la sidebar desktop et mobile ;
- [ ] vérifier `/fr/aide` et `/en/help` ;
- [ ] relire les concepts et les quatre procédures avec un profil utilisateur standard ;
- [ ] confirmer que le guide reste lisible en clair/sombre et sur largeur mobile ;
- [ ] vérifier les liens email et téléphone ;
- [ ] cliquer sur **Nous écrire** et contrôler le sujet + corps préremplis dans l'application de messagerie ;
- [ ] vérifier que la version Web affichée dans le modèle correspond à la version courante ;
- [ ] confirmer que la console Hotline technique `/hotline/[slug]` reste inchangée et séparée de cette page ;
- [x] validation automatisée GitHub Actions — run `35660771998` : diff check, `pnpm test:help-support`, ESLint ciblé, i18n, TypeScript MySQL, TypeScript SQL Server et build production réussis.

---

## R21-003 — Surveillance : cards, fenêtre 24 h et réduction des grands graphiques

**Statut : `CORRIGE_DEV` — PR #139 — squash merge `00f2778993e81faf959aa4879fb8433ddcaf88c5`**

### Retour — 21/09/2026

Trois évolutions liées à l'affichage Surveillance doivent être traitées ensemble :

1. dans les cards, afficher la **sonde** en première ligne puis le **nom du lieu** en dessous, au lieu de `Lieu - Sonde` ;
2. mini-graphe et grand graphe : afficher par défaut les **24 dernières heures glissantes**, par exemple 08:00 J-1 → 08:00 aujourd'hui ;
3. lorsqu'une longue plage est sélectionnée dans le détail d'un lieu, éviter de transférer et rendre plusieurs milliers de points dans Chart.js.

Le retour terrain mentionne également que, lors d'une non-réponse de plusieurs heures, le mini-graphe occupait encore toute la largeur comme si la courbe arrivait jusqu'à l'heure courante.

### État vérifié avant correction

Cards :

- le header concaténait `nomLieu - sondeNumeroSerie` ;
- chaque card demandait les **125 dernières mesures** sans borne temporelle 24 h ;
- l'axe X du mini-graphe était un axe Chart.js catégoriel masqué : les points étaient répartis uniformément sur toute la largeur, indépendamment de l'intervalle réel entre deux mesures ;
- ce fonctionnement expliquait pourquoi une dernière mesure vieille de plusieurs heures pouvait visuellement arriver jusqu'au bord droit.

Détail du lieu :

- la modal s'initialisait sur la **journée civile courante**, de 00:00 à 23:59:59 ;
- le hook graphique utilisait une limite spéciale de 125 points pour la journée courante ;
- sur une plage plus large, `useMonitoringRangeMeasurements` parcourait toutes les pages de 500 lignes jusqu'à charger l'intégralité des mesures dans le navigateur ;
- une période de plusieurs semaines/mois pouvait donc transmettre puis rendre plusieurs milliers de points ;
- le tableau détaillé disposait déjà d'une pagination serveur séparée et ne nécessitait pas ce chargement global.

BDD :

- `tm_graphique` est le cache récent prévu pour les courbes de Surveillance ;
- les seeds MySQL et les jobs SQL Server suppriment les lignes de `tm_graphique` âgées de plus de **72 heures** ;
- cette table peut donc servir aux mini-courbes 24 h sans interroger inutilement tout `tm_mesures`.

### Implémentation du lot

#### Identité des cards

- numéro de série de sonde en première ligne ;
- nom du lieu en seconde ligne ;
- fallback sur le nom du lieu si aucun numéro de série n'est disponible.

#### Mini-graphe — 24 h glissantes

- requête bornée à `maintenant - 24 h → maintenant` à chaque chargement/rafraîchissement ;
- source `tm_graphique`, adaptée à cette fenêtre courte ;
- maximum **180 points** envoyés au mini-graphe lorsque davantage de lignes existent ;
- axe X linéaire basé sur les vrais timestamps et borné sur les 24 h demandées ;
- une absence de remontée est donc représentée par un espace temporel réel à droite de la dernière mesure ;
- les consignes continuent d'être prolongées sur toute la fenêtre pour conserver les guides visuels.

#### Grand graphe — 24 h par défaut

- ouverture du détail sans plage explicite : `maintenant - 24 h → maintenant` ;
- le sélecteur de dates reste disponible pour les périodes personnalisées ;
- bouton **Revenir aux 24 dernières heures** après sélection d'une plage ;
- axe X linéaire temporel borné sur la période demandée ;
- le tableau et l'audit utilisent la même fenêtre par défaut dans la modal, puis la plage explicitement sélectionnée lorsqu'elle existe.

#### Downsampling des longues périodes

- nouveau paramètre API opt-in `graphMaxPoints` ;
- grand graphe limité à **600 points affichés** ;
- l'API charge la plage historique puis réduit le payload **avant l'envoi au navigateur** ;
- par tranches temporelles, l'algorithme conserve :
  - premier et dernier point utiles ;
  - minimum local ;
  - maximum local ;
  - un point significatif de non-réponse, remontée mémoire ou changement de consigne ;
- le premier et le dernier point de la période de mesures sont toujours conservés ;
- le nombre de mesures sources est renvoyé séparément afin d'afficher, par exemple, `4000 mesures sur la période · 600 points affichés` ;
- une courbe downsamplée ne reconnecte jamais automatiquement les trous de non-réponse, car le nombre de points réduits ne représente plus la durée réelle du trou.

Le downsampling est volontairement limité aux parcours graphiques qui le demandent. Les consommateurs qui effectuent des calculs sur les valeurs complètes, notamment **Analyse d'impact** et **Analyse d'alarme**, conservent le comportement pleine résolution existant.

#### Historique détaillé

Le tableau de mesures reste sur `useLieuMeasurementsPaged` :

- pagination serveur ;
- valeurs complètes ;
- tri existant ;
- aucune moyenne ni suppression de mesures dans le tableau ;
- le downsampling graphique n'altère donc ni la BDD ni les exports/consultations tabulaires.

### API

`GET /api/mesures/[idLieu]` accepte désormais `graphMaxPoints` lorsqu'une plage `startDate/endDate` est fournie.

Dans ce mode, la réponse expose notamment :

- `measurements` : points réellement destinés au graphe ;
- `graphSourceCount` : nombre de mesures avant réduction ;
- `graphMeasureCount` : nombre de points transmis ;
- `graphSampled` : indique si une réduction a réellement eu lieu ;
- `graphRangeStart` / `graphRangeEnd` : bornes utilisées par le graphe.

La pagination `page/pageSize` conserve son comportement existant et n'est jamais downsamplée.

### Fichiers principaux

- `website/src/app/api/mesures/[idLieu]/route.ts` ;
- `website/src/components/monitoring-card.tsx` ;
- `website/src/components/monitoring-card/monitoring-card-header.tsx` ;
- `website/src/components/monitoring-card/monitoring-card-chart-preview.tsx` ;
- `website/src/components/monitoring-details-modal.tsx` ;
- `website/src/components/monitoring-details/monitoring-graph-tab.tsx` ;
- `website/src/components/monitoring-details/use-monitoring-range-measurements.ts` ;
- `website/src/components/ui/date-range-picker.tsx` ;
- `website/src/hooks/useLieuMeasurements.ts` ;
- `website/src/lib/measurement-downsampling.ts` ;
- `website/scripts/test-surveillance-rolling-graphs.ts` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json`.

### Version

- Web : **1.6.0** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35701478085` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] test ciblé `pnpm test:surveillance-rolling-graphs` ;
- [x] downsampling : limite, ordre chronologique, premier/dernier point, pic extrême et non-réponse couverts ;
- [x] ESLint ciblé ;
- [x] TypeScript avec Prisma MySQL ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

### Validation terrain

- [ ] card : vérifier **sonde** puis **lieu** sur deux lignes ;
- [ ] ouvrir Surveillance vers 08:00 et confirmer que le mini-graphe couvre environ 08:00 J-1 → 08:00 aujourd'hui ;
- [ ] provoquer/observer une sonde sans nouvelle mesure depuis plusieurs heures et vérifier que la courbe s'arrête à la vraie heure de dernière mesure ;
- [ ] vérifier une sonde avec points de non-réponse explicites ;
- [ ] ouvrir le détail d'un lieu et confirmer la plage par défaut **24 dernières heures** ;
- [ ] sélectionner une journée civile puis plusieurs jours et confirmer les bornes du graphe ;
- [ ] utiliser **Revenir aux 24 dernières heures** ;
- [ ] tester une période d'environ 2 mois contenant plusieurs milliers de mesures : interface fluide et compteur source/points affichés cohérent ;
- [ ] sur cette longue période, vérifier qu'un pic haut/bas reste visible après réduction ;
- [ ] sur cette longue période, vérifier qu'une non-réponse reste un trou et n'est pas reconnectée ;
- [ ] contrôler que le tableau de mesures reste paginé et complet ;
- [ ] tester FR/EN, clair/sombre et largeur réduite ;
- [ ] contrôler MySQL puis SQL Server sur une installation représentative.

---

## R22-001 — Harmoniser impression et formats d'export

**Statut : `CORRIGE_DEV` — PR #140 — squash merge `4e5cf37a4fb8a46aba1ac68a93d31589e7277f90`**

### Retour — 22/09/2026

Revoir de manière globale les actions **Imprimer / Exporter** du Web :

- retirer tous les boutons/actions **Imprimer** ;
- lorsqu'un écran correspond à un tableau ou à un contenu facilement représentable en PDF, proposer **PDF + Excel** ;
- pour les vues plus complexes, proposer uniquement **Excel** ;
- pour l'analyse d'une alarme par lieu, intégrer directement la courbe dans l'export Excel, sur le premier onglet.

### État vérifié avant correction

Le comportement n'était pas homogène :

- `TanStackTable` exposait encore `enablePrint` et proposait par défaut **CSV + Excel + PDF** ;
- l'Audit trail activait explicitement l'option d'impression ;
- l'historique des acquittements proposait encore **CSV + Excel + PDF** ;
- Analyse d'impact proposait quatre actions distinctes : impression navigateur, CSV des alarmes, image de la courbe et PDF ;
- la superposition de courbes proposait CSV + impression de la courbe ;
- le détail d'une tournée VigiLog disposait d'un export CSV isolé ;
- le tableau de mesures d'un lieu proposait l'export générique en plus d'un export Excel multi-onglets.

L'**Analyse d'alarme par lieu** avait en revanche déjà été refondue auparavant :

- un seul export XLSX ;
- premier onglet **Présentation** avec les informations de l'alarme ;
- image de la courbe Chart.js intégrée directement dans cet onglet ;
- second onglet avec toutes les mesures de la période.

Ce comportement existant a donc été conservé plutôt que réimplémenté.

### Politique retenue

#### Tableaux simples

Les tableaux exportables standards proposent :

- **PDF** ;
- **Excel (.xlsx)**.

Ne sont plus proposés :

- CSV ;
- impression navigateur.

La règle par défaut est portée par `TanStackTable`, afin que les écrans existants et futurs héritent du même comportement.

Exemples concernés :

- Audit trail ;
- historique des acquittements d'alarmes ;
- tableaux d'administration utilisant le composant générique ;
- tableaux simples des services.

Le tableau historique des mesures d'un lieu conserve :

- PDF via le tableau générique ;
- Excel via l'export enrichi existant, renommé explicitement **Exporter Excel**.

#### Vues complexes — Excel uniquement

Les vues contenant un ensemble de résumé + graphique + données utilisent un XLSX unique structuré.

**Analyse d'alarme par lieu**

- comportement déjà conforme dans `dev` avant ce lot ;
- aucun export PDF / CSV / impression ajouté ;
- onglet Présentation avec la courbe ;
- onglet Mesures avec les valeurs complètes.

**Analyse d'impact**

- suppression de l'impression navigateur ;
- suppression du CSV ;
- suppression de l'export image séparé ;
- suppression du PDF ;
- un seul export Excel ;
- onglet Présentation : lieu, période, seuils/tolérances actuels et simulés, compteurs et courbe ;
- onglet Alarmes : alarmes simulées et réelles.

**Superposition de courbes**

- suppression de l'impression ;
- suppression du CSV ;
- un seul XLSX ;
- onglet Présentation : période, lieux sélectionnés et image de la superposition ;
- onglet Courbes : horodatage + valeur de chaque lieu.

**VigiLog — détail d'une tournée**

- remplacement du CSV de mesures par un XLSX ;
- onglet Présentation : configuration, VigiLog, trajet, consigne, limites, dates et courbe ;
- onglet Mesures : mesures importées et leurs statuts.

Les deux sous-tableaux **Alarmes simulées / Alarmes réelles** de l'Analyse d'impact ont leur export individuel désactivé pour éviter de proposer trois exports différents sur le même écran complexe.

### Composant générique

`website/src/components/data-table/tanstack-table.tsx` :

- suppression du contrat `enablePrint` ;
- suppression complète de la génération CSV utilisateur ;
- formats autorisés : `xlsx | pdf` ;
- valeur par défaut : `["xlsx", "pdf"]` ;
- conservation de la sélection de colonnes et du choix du nombre de lignes à exporter.

### Excel enrichi

Le helper existant `website/src/lib/excel-export.ts` est réutilisé plutôt que dupliquer la génération XLSX.

Il permet :

- logo VigiSensys ;
- onglet Présentation ;
- tableau de métadonnées ;
- intégration facultative d'une image de courbe ;
- onglet de données stylisé avec filtres et largeurs adaptées.

### Prévention des régressions

Nouveau test `website/scripts/test-export-format-policy.ts` :

- parcourt tous les fichiers TypeScript/TSX de `website/src` ;
- refuse les appels `window.print()` / `popup.print()` et les usages de l'icône `Printer` ;
- refuse le retour de `enablePrint` ;
- refuse les exports utilisateur `text/csv;charset...` ;
- vérifie que le tableau générique est limité à PDF + XLSX ;
- vérifie l'Excel enrichi de l'analyse d'alarme, de l'analyse d'impact, de la superposition de courbes et de VigiLog ;
- vérifie que la courbe est bien transmise via `presentationImage` sur les écrans complexes concernés.

Les fichiers CSV en **entrée** ou les références techniques à ce format (pièces jointes, configuration CSV, documentation historique) ne sont pas concernés : seule la politique d'export utilisateur est modifiée.

### Fichiers principaux

- `website/src/components/data-table/tanstack-table.tsx` ;
- `website/src/components/monitoring-details/monitoring-table-tab.tsx` ;
- `website/src/app/[locale]/(admin)/admin/audit/audit-client.tsx` ;
- `website/src/app/[locale]/(dashboard)/alarmes/acquittements/page-client.tsx` ;
- `website/src/app/[locale]/(admin)/admin/analyse-impact/impact-analysis-client.tsx` ;
- `website/src/app/[locale]/(admin)/admin/analyse-impact/_components/impact-alarms-table.tsx` ;
- `website/src/app/[locale]/(dashboard)/surveillance/_components/curves-overlay-modal.tsx` ;
- `website/src/components/services/vigilog/vigilog-tournee-detail-dialog.tsx` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json` ;
- `website/scripts/test-export-format-policy.ts`.

### Version

- Web : **1.7.0** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35704323198` :

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:export-format-policy` ;
- [x] ESLint ciblé ;
- [x] TypeScript avec Prisma MySQL ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

### Validation terrain

- [ ] parcourir les principales pages et confirmer l'absence de tout bouton **Imprimer** ;
- [ ] Audit trail : vérifier uniquement PDF + Excel ;
- [ ] Historique acquittements : vérifier uniquement PDF + Excel ;
- [ ] tableau de mesures Surveillance : vérifier PDF + bouton **Exporter Excel** ;
- [ ] Analyse d'alarme par lieu : vérifier XLSX unique, courbe lisible dans le premier onglet et mesures complètes dans le second ;
- [ ] Analyse d'impact : vérifier XLSX unique, courbe dans Présentation et alarmes simulées/réelles dans le second onglet ;
- [ ] Superposition de courbes : vérifier XLSX unique, courbe dans Présentation et valeurs multi-lieux dans le second onglet ;
- [ ] VigiLog — détail tournée : vérifier XLSX unique, courbe dans Présentation et mesures importées dans le second onglet ;
- [ ] tester les libellés FR/EN ;
- [ ] ouvrir les PDF simples et vérifier la lisibilité des tableaux ;
- [ ] ouvrir les XLSX avec Excel ou LibreOffice et contrôler les onglets, images et filtres.

---

## R22-002 — Ajouter le groupe au tableau des alarmes

**Statut : `CORRIGE_DEV` — PR #141 — squash merge `d2dccf996405f3e39ac2eb8593071aa2fe1b3a95`**

### Retour — 22/09/2026

Sur la page **Alarmes**, ajouter une colonne **Groupe** :

- affichée dans le tableau principal ;
- triable ;
- recherchable via la barre de recherche existante.

La capture de référence place cette colonne entre **Consignes sup/inf** et **Déclenchée**.

### État vérifié avant correction

- le tableau ne possédait aucune colonne Groupe ;
- `ServerAlarms()` chargeait le lieu mais pas ses relations `t_lieu_groupe` ;
- `location.siteGroup` était forcé à `null` dans ce parcours ;
- la recherche de `TanStackTable` reposait sur les champs par défaut de la ligne et ne pouvait donc pas retrouver un groupe absent des données ;
- un lieu peut être affecté à plusieurs groupes via la table de liaison `t_lieu_groupe`.

### Implémentation

#### Chargement des groupes

Le `select` Prisma déjà utilisé par `ServerAlarms()` est étendu avec :

- `t_lieu_groupe` ;
- `t_groupe.Nom_Groupe`.

Les groupes sont donc récupérés avec le chargement des alarmes, sans ajouter de boucle de requêtes applicatives par ligne.

Les noms sont exposés via `location.groupNames`, propriété déjà prévue par le type `Location`.

La propriété historique `location.siteGroup` reste à `null` dans ce parcours : elle n'est pas réutilisée pour stocker les groupes métier, car elle possède une sémantique différente dans d'autres parties du Web.

#### Normalisation multi-groupes

Nouveau helper `alarm-groups.ts` :

- suppression des valeurs vides ;
- trim ;
- déduplication insensible à la casse ;
- tri alphabétique avec tri numérique naturel ;
- format d'affichage `Groupe A, Groupe B`.

Un lieu sans groupe affiche `-`.

#### Tableau

La colonne **Groupe / Group** :

- est placée après **Consignes sup/inf** et avant **Déclenchée** ;
- utilise `accessorKey: "groups"`, ce qui la rend triable nativement par TanStack ;
- affiche jusqu'à deux lignes dans la cellule avec la valeur complète au survol ;
- est incluse automatiquement dans les exports PDF / Excel du tableau.

#### Recherche

Chaque ligne construit un champ interne `searchText` contenant :

- nom du lieu ;
- numéro de série de la sonde ;
- groupes ;
- statut.

Le tableau utilise ce champ comme source de la recherche globale. Rechercher tout ou partie du nom d'un groupe filtre donc les alarmes correspondantes, tout en conservant la recherche lieu/sonde/statut existante.

### Fichiers principaux

- `website/src/app/[locale]/(dashboard)/alarmes/server-alarms.tsx` ;
- `website/src/app/[locale]/(dashboard)/alarmes/alarms-client.tsx` ;
- `website/src/app/[locale]/(dashboard)/alarmes/alarm-groups.ts` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json` ;
- `website/scripts/test-alarm-group-column.ts`.

### Version

- Web : **1.8.0** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35723651236` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:alarm-group-column` ;
- [x] helper multi-groupes : trim, déduplication et ordre naturel couverts ;
- [x] position de la colonne Groupe couverte par le test ;
- [x] liaison de la recherche à `searchText` couverte ;
- [x] ESLint ciblé ;
- [x] TypeScript avec Prisma MySQL ;
- [x] contrôle i18n sans nouvelle dette du lot ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

### Validation terrain

- [ ] ouvrir la page Alarmes avec plusieurs alarmes de groupes différents ;
- [ ] vérifier la colonne **Groupe** entre **Consignes sup/inf** et **Déclenchée** ;
- [ ] vérifier un lieu sans groupe : `-` ;
- [ ] vérifier un lieu avec un seul groupe ;
- [ ] vérifier un lieu appartenant à plusieurs groupes ;
- [ ] cliquer sur l'en-tête Groupe et contrôler les tris ascendant / descendant ;
- [ ] rechercher le nom complet d'un groupe ;
- [ ] rechercher une partie du nom d'un groupe ;
- [ ] vérifier que la recherche par lieu et sonde fonctionne toujours ;
- [ ] vérifier les onglets Alarmes actives / À acquitter ;
- [ ] vérifier l'export PDF et Excel avec la colonne Groupe ;
- [ ] vérifier FR/EN ;
- [ ] vérifier sur MySQL puis SQL Server.

---

## R22-003 — Conserver la locale dans les liens du Dashboard Admin One / Pack

**Statut : `CORRIGE_DEV` — PR #142 — squash merge `207ed69ffc4a2a0100836e9f2e17dbc19527cb9d`**

### Retour — 22/09/2026

Sur le Dashboard Admin avec une licence **One**, les cards de navigation ouvraient des URLs sans préfixe de locale :

- observé : `/admin/...` ;
- attendu : `/fr/admin/...` ou `/en/admin/...`.

Le même dashboard basique est utilisé par les licences **One / Pack**.

### État vérifié avant correction

- les cards One / Pack sont rendues par `DashboardLinkCard` ;
- `DashboardLinkCard` importait directement `next/link` ;
- les destinations de la page Admin sont volontairement écrites sous forme de routes canoniques, par exemple `/admin/sondes`, `/admin/groupes`, `/admin/lieux` ;
- contrairement au wrapper `@/i18n/navigation`, `next/link` ne transforme pas ces routes selon la locale du projet ;
- le reste du Dashboard Admin utilise déjà majoritairement le wrapper next-intl.

### Correctif

`website/src/components/dashboard-link-card.tsx` utilise désormais :

- `Link` depuis `@/i18n/navigation` ;
- les routes canoniques existantes restent inchangées.

Le routage next-intl ajoute donc automatiquement le préfixe et la traduction de chemin :

- FR : `/admin/sondes` → `/fr/admin/sondes` ;
- EN : `/admin/sondes` → `/en/admin/sensors` ;
- FR : `/admin/groupes` → `/fr/admin/groupes` ;
- EN : `/admin/groupes` → `/en/admin/groups` ;
- FR : `/admin/lieux` → `/fr/admin/lieux` ;
- EN : `/admin/lieux` → `/en/admin/locations`.

Aucun préfixe `/fr` ou `/en` n'est concaténé manuellement.

### Fichiers principaux

- `website/src/components/dashboard-link-card.tsx` ;
- `website/scripts/test-admin-dashboard-locale-links.ts` ;
- `website/package.json` ;
- `website/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- Web : **1.8.1** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35728689698` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:admin-dashboard-locale-links` ;
- [x] routes FR / EN vérifiées par le test ;
- [x] ESLint ciblé ;
- [x] TypeScript avec Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

### Validation terrain

- [ ] se connecter en licence One avec locale FR puis ouvrir chaque card du Dashboard Admin ;
- [ ] confirmer que l'URL reste sous `/fr/admin/...` ;
- [ ] passer en EN puis ouvrir les mêmes cards ;
- [ ] confirmer `/en/admin/sensors`, `/en/admin/groups`, `/en/admin/locations`, `/en/admin/tools` selon la card ;
- [ ] vérifier la licence Pack, qui utilise le même dashboard basique ;
- [ ] vérifier que les cards Services / Santé système restent fonctionnelles ;
- [ ] revenir sur le Dashboard Admin via la sidebar et confirmer que la locale est conservée.

---

## R22-004 — Corriger les accès Pack / One aux lieux et à la messagerie

**Statut : `CORRIGE_DEV` — PR #143 — squash merge `0b3bf3e6575d166d60a98b89219fb55825e248e2`**

### Retour — 22/09/2026

Retour terrain sur une licence **One**, à vérifier également pour **Pack** :

- impossible de créer un lieu ;
- impossible de modifier les paramètres d'un lieu ;
- erreur affichée : fonctionnalité réservée aux licences Standard et Expert ;
- même problème constaté pour l'accès à la **Messagerie**.

### État vérifié avant correction

#### Lieux

La matrice produit du repo indiquait déjà que Pack / One doivent pouvoir utiliser les lieux, seuls les champs métrologiques EMT étant réservés à Standard / Expert.

Le bug venait du payload Web :

- `getDefaultLocationFormData()` initialise toujours les champs métrologiques :
  - `EMT_Mode` ;
  - `EMT_Valeur` ;
  - `Corriger_Erreur_Justesse` ;
  - `Prendre_En_Compte_Derive` ;
  - `Derniere_Date_Etalonnage` ;
  - `Applied_Etalonnage_Id` ;
  - `Unite` ;
  - `Erreur_Justesse` ;
  - `Incertitude` ;
  - `Derive` ;
- même lorsque l'onglet Métrologie est masqué en Pack / One, `normalizePayload()` envoyait tout le formulaire via `...data` ;
- les API `POST /api/lieux` et `PATCH /api/lieux/[id]` utilisent volontairement `requireStandardOrExpertIfFieldsUsed()` ;
- ce garde vérifie la **présence des clés**, pas seulement leur valeur ;
- Pack / One étaient donc refusés avant même la validation métier du lieu.

Le même risque existait pour l'édition d'un lieu depuis la page Surveillance.

#### Messagerie

Le runtime contenait plusieurs restrictions d'édition Standard / Expert :

- `useMessagingEnabled()` retournait `false` sur Pack / One ;
- `checkChatAccess()` renvoyait un 403 `Licence Standard ou Expert requise` ;
- `GET /api/settings/messaging-enabled` désactivait la Messagerie hors Standard / Expert ;
- `MESSAGING:ENABLED` était classé comme paramètre Standard-only ;
- la card de paramétrage Messagerie était masquée sur Pack / One ;
- la page de comparaison des licences présentait également la Messagerie comme fonctionnalité Standard.

Les autorisations utilisateur `ACCES_CONVERSATION` / `MODULE_CONVERSATION` existent déjà dans les seeds MySQL et SQL Server ; aucun changement BDD n'est nécessaire.

### Correctif — Lieux

Nouveau contrat central :

`website/src/lib/location-license-payload.ts`

Il contient la liste canonique des champs métrologiques Standard / Expert, réutilisée à la fois :

- côté API pour refuser un appel direct Pack / One qui tenterait réellement d'envoyer ces champs ;
- côté UI pour retirer ces clés du payload lorsque la licence active est Pack ou One.

Parcours couverts :

- Administration > Lieux — création ;
- Administration > Lieux — modification ;
- Surveillance — modification des paramètres d'un lieu.

Les autres champs restent envoyés normalement : nom, sonde, groupes, site, consignes, seuils, retards, planning, notifications, etc.

### Correctif — Messagerie

La Messagerie est désormais disponible sur :

- Pack ;
- One ;
- Standard ;
- Expert.

Conditions conservées :

- licence valide ;
- paramètre global `messaging:enabled` actif ;
- permission utilisateur `CONVERSATION_ACCESS` pour afficher l'entrée dans la sidebar.

Modifications :

- le garde Chat ne filtre plus l'édition ;
- `useMessagingEnabled()` fonctionne avec toute licence valide ;
- le paramètre `MESSAGING:ENABLED` n'est plus Standard-only ;
- la card Messagerie des Paramètres est visible pour toutes les éditions ;
- la matrice de licences et la page Upgrade sont alignées ;
- les protections Standard / Expert des fonctions réellement métrologiques restent inchangées.
- l'onglet Mailing du formulaire Lieu est dissocié du garde Métrologie : One/Standard/Expert y accèdent par défaut, Pack uniquement avec l'option mail de licence.

### Fichiers principaux

- `website/src/lib/location-license-payload.ts` ;
- `website/src/lib/license-access.ts` ;
- `website/src/lib/license-email.ts` ;
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx` ;
- `website/src/app/api/lieux/route.ts` ;
- `website/src/app/api/lieux/[id]/route.ts` ;
- `website/src/app/[locale]/(admin)/admin/lieux/locations-client.tsx` ;
- `website/src/app/[locale]/(dashboard)/surveillance/_components/page-client/use-surveillance-location-editor.ts` ;
- `website/src/lib/chat-guard.ts` ;
- `website/src/hooks/useMessagingEnabled.ts` ;
- `website/src/app/api/settings/messaging-enabled/route.ts` ;
- `website/src/lib/parameter-license-guards.ts` ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx` ;
- `website/src/components/upgrade/upgradeContent.ts` ;
- `website/docs/matrice-licences-acces.md` ;
- `website/docs/infos-licences.md` ;
- `website/scripts/smoke-license-matrix.ts` ;
- `website/scripts/test-pack-one-license-access.ts`.

### Version

- Web : **1.8.2** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35733062303` : **succès complet** sur le HEAD fonctionnel incluant également l'accès Mailing.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:pack-one-license-access` ;
- [x] payload Pack / One sans champs EMT réservés ;
- [x] protections API EMT Standard / Expert conservées ;
- [x] Messagerie disponible pour toute licence valide dans le contrat runtime ;
- [x] permission `CONVERSATION_ACCESS` et toggle `messaging:enabled` conservés ;
- [x] ESLint ciblé ;
- [x] contrôle i18n sans nouvelle dette dans le lot ;
- [x] TypeScript avec Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire a ensuite été retiré de la branche ; les commits postérieurs au run ne concernent que cette suppression et la documentation de validation.

### Validation terrain

- [ ] licence Pack sans option mail : vérifier que l'onglet Mailing reste masqué ;
- [ ] licence Pack avec option mail : vérifier que l'onglet Mailing est disponible ;
- [ ] licence One : vérifier que l'onglet Mailing est disponible ;
- [ ] licence Pack : créer un lieu sans champs EMT ;
- [ ] licence Pack : modifier nom, sonde, groupes, consignes, retards et planning d'un lieu ;
- [ ] licence One : mêmes tests création / modification ;
- [ ] depuis Surveillance en Pack / One, modifier les paramètres d'un lieu ;
- [ ] vérifier que l'onglet Métrologie reste absent en Pack / One ;
- [ ] appel direct Pack / One vers `POST/PATCH /api/lieux` avec `EMT_Mode` : vérifier le 403 ;
- [ ] licence Pack avec `CONVERSATION_ACCESS` : entrée Messagerie visible et page accessible ;
- [ ] licence One avec `CONVERSATION_ACCESS` : entrée Messagerie visible et page accessible ;
- [ ] profil sans `CONVERSATION_ACCESS` : entrée Messagerie absente ;
- [ ] désactiver `messaging:enabled` : entrée/page Messagerie désactivées ;
- [ ] réactiver `messaging:enabled` depuis Paramètres en Pack / One ;
- [ ] vérifier Standard / Expert sans régression ;
- [ ] vérifier MySQL puis SQL Server.

---

## R22-005 — Conserver la locale vers Alarmes depuis le dashboard utilisateur

**Statut : `CORRIGE_DEV` — PR #143 — squash merge `0b3bf3e6575d166d60a98b89219fb55825e248e2`**

### Retour — 22/09/2026

Depuis le dashboard utilisateur, un clic sur le bandeau d'alarmes pouvait ouvrir :

- observé : `/alarmes` ;
- attendu en FR : `/fr/alarmes` ;
- attendu en EN : `/en/alarms`.

### État vérifié avant correction

Le bloc **Voir toutes les alarmes** du contenu principal utilisait déjà le wrapper localisé avec la route canonique `/alarmes`.

Le problème restant se trouvait dans `PageHeaderBase` :

- le composant importait correctement `Link` depuis `@/i18n/navigation` ;
- mais les deux variantes du bandeau utilisaient `href="alarmes"`, donc un chemin **relatif** ;
- depuis une URL comme `/fr`, le navigateur pouvait résoudre ce chemin en `/alarmes`, en perdant le préfixe de locale.

### Correctif

Les deux liens du header utilisent désormais la route canonique `/alarmes`.

Le wrapper next-intl applique ensuite la locale et la traduction de pathname :

- FR : `/fr/alarmes` ;
- EN : `/en/alarms`.

Aucune concaténation manuelle de `/fr` ou `/en` n'est introduite.

### Fichiers principaux

- `website/src/components/page-header-base.tsx` ;
- `website/scripts/test-user-dashboard-locale-links.ts` ;
- `website/package.json` ;
- `website/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- Web : **1.8.3** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35739118522` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:pack-one-license-access` ;
- [x] `pnpm test:user-dashboard-locale-links` ;
- [x] ESLint ciblé ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] TypeScript avec Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire de validation a été retiré du diff final.

### Validation terrain

- [ ] ouvrir le dashboard utilisateur en FR avec au moins une alarme active ;
- [ ] cliquer sur le bandeau rouge du header et confirmer `/fr/alarmes` ;
- [ ] revenir au dashboard puis tester le bouton **Voir toutes** du bloc Alarmes actives ;
- [ ] passer en EN et confirmer `/en/alarms` ;
- [ ] vérifier que le bandeau reste non cliquable lorsque l'utilisateur est déjà sur la page Alarmes.

---

## R22-006 — Fiabiliser le type des sondes importées et le retour vers Sondes

**Statut : `CORRIGE_DEV` — PR #144 — squash merge `9e67fd3a8b42bf9da305533b4c87c9e0d95f45b6`**

### Retour — 22/09/2026

Deux correctifs sont demandés autour de l'import des sondes :

- les anciennes références classiques, notamment `IN...` et `IEE...`, peuvent être mal détectées lors de l'import et ne doivent jamais être assimilées à des GSP ;
- le bouton **Retour aux sondes** de la page d'import d'ajustage ouvre `/fr/sondes` au lieu de `/fr/admin/sondes`.

La règle métier fournie pour la détection est basée sur le début du numéro de série :

- `SO...` → famille **GSO** ;
- `SP...` → famille **GSP** ;
- `E...`, `G...`, `H...`, `I...`, `R...`, `V...` → famille **CLASSIC**.

Les anciens types agrégés `GSO` et `GSP` de `t_sonde_type` (IDs historiques 7 et 8) ne doivent pas intervenir dans cette détection.

### État vérifié avant correction

Le flux partagé d'import passe par `resolveImportedSensorIdentity()` dans `sensor-naming.ts`. La fonction générique `extractTypeCodeFromSerial()` donnait priorité à tout le texte avant le premier tiret. Une ancienne série telle que `IEE-123456` pouvait donc produire le pseudo-type `IEE` au lieu du type classique `I`.

Le bulk d'import d'ajustage chargeait par ailleurs tous les codes de `t_sonde_type`, y compris les deux anciens codes agrégés `GSO` et `GSP`, pour construire ses listes de types et familles autorisées.

Enfin, la page `admin/sondes/ajustage-import` utilisait bien le wrapper localisé `@/i18n/navigation`, mais avec la route canonique incorrecte `/sondes`.

### Correctif — détection du type à l'import

Un extracteur dédié aux imports applique maintenant la priorité métier sur les préfixes :

- `SO...` : recherche du sous-type GSO détaillé connu (`SOIT`, `SOIH`, `SOET`, `SOEH`) ;
- `SP...` : recherche du sous-type GSP détaillé connu (`SPNB`, `SPNG`, `SPPS`, `SPFP`, etc.) ;
- sinon, si la première lettre est `E`, `G`, `H`, `I`, `R` ou `V`, cette lettre devient directement `Sonde_Type` ;
- les deux types agrégés `GSO` / `GSP` sont retirés des codes candidats utilisés par l'import.

Exemples couverts :

- `IN123456` / `IN-123456` → type `I`, famille `CLASSIC` ;
- `IEE123456` / `IEE-123456` → type `I`, famille `CLASSIC` ;
- `SOIT-123456` → type `SOIT`, famille `GSO` ;
- `SOIH-123456-T` → type `SOIH`, famille `GSO` ;
- `SPNB-123456` → type `SPNB`, famille `GSP` ;
- `SPFP123456` → type `SPFP`, famille `GSP`.

`resolveImportedSensorIdentity()` reste le point d'entrée partagé par les parseurs d'ajustage et d'étalonnage, ce qui évite deux règles de détection divergentes.

Les lignes historiques `GSO` / `GSP` ne sont **pas supprimées de la BDD** dans ce lot : elles sont seulement ignorées par l'import. Leur suppression éventuelle sera un changement BDD distinct si elle est confirmée.

### Correctif — bouton Retour aux sondes

Le bouton utilise désormais la route canonique `/admin/sondes` avec le wrapper next-intl :

- FR : `/fr/admin/sondes` ;
- EN : `/en/admin/sensors`.

### Fichiers principaux

- `website/src/lib/sensor-naming.ts` ;
- `website/src/app/api/sondes/ajustages/bulk/route.ts` ;
- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/page.tsx` ;
- `website/scripts/test-sensor-import-type-detection.ts` ;
- `website/package.json` ;
- `website/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- Web : **1.8.4** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35746073802` : **succès complet** sur le HEAD fonctionnel du lot.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:sensor-import-type-detection` ;
- [x] cas `IN` / `IEE` classiques ;
- [x] cas GSO détaillés ;
- [x] cas GSP détaillés ;
- [x] exclusion des types agrégés `GSO` / `GSP` du contrat d'import ;
- [x] route localisée `/admin/sondes` FR/EN ;
- [x] ESLint ciblé ;
- [x] contrôle i18n ;
- [x] TypeScript avec Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript avec Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire de validation a été retiré du diff final.

### Validation terrain

- [ ] importer une ancienne sonde `IN...` sans tiret et vérifier `Sonde_Type = I` ;
- [ ] importer une ancienne sonde `IN-...` et vérifier `Sonde_Type = I` ;
- [ ] importer une ancienne sonde `IEE...` / `IEE-...` et vérifier `Sonde_Type = I` ;
- [ ] contrôler un exemple de chaque préfixe classique `E/G/H/I/R/V` ;
- [ ] importer un `SOIT` puis un `SOIH` et contrôler type, famille, série et adresse ;
- [ ] importer un `SPNB` puis un autre GSP détaillé tel que `SPFP` ;
- [ ] avec les lignes historiques IDs 7/8 encore présentes, confirmer qu'elles ne sont jamais choisies par l'import ;
- [ ] tester une sonde déjà existante puis une nouvelle sonde créée par l'import ;
- [ ] vérifier l'affectation de module, `Est_Sonde_GSO`, `Sonde_Type` et `Adresse_Sonde` après insertion ;
- [ ] FR : cliquer sur **Retour aux sondes** et confirmer `/fr/admin/sondes` ;
- [ ] EN : confirmer `/en/admin/sensors` ;
- [ ] valider MySQL puis SQL Server.


---

## R23-001 — Respecter les groupes utilisateur dans les filtres et l’arborescence Surveillance

**Statut : `CORRIGE_DEV` — PR #145 — squash merge `c6ef7d87243d147bdceb1414c5f6a1c521a5d2bc`**

### Retour — 23/09/2026

Retour terrain sur le périmètre de visibilité d'un utilisateur :

- Administration > Utilisateurs permet d'affecter une liste de **Sites** et une liste de **Groupes** ;
- sur Surveillance > Graphiques, un groupe non affecté ne doit donner accès à aucun lieu ;
- dans le sélecteur **Groupes**, le nom d'un groupe non affecté doit néanmoins rester visible en **grisé / non sélectionnable** ;
- en vue **Arborescence**, un groupe non affecté ne doit jamais réapparaître avec ses lieux.

Cas reproduit avec le groupe `GSO_DEFAUT` : il n'est pas affecté à l'utilisateur, mais pouvait encore apparaître dans l'Arborescence.

### État vérifié avant correction

Trois causes se combinaient :

1. `buildLieuAccessFilter()` combinait les restrictions Site et Groupe avec un `OR`.
   - Si l'utilisateur avait un site affecté, un lieu de ce site restait donc accessible même si aucun de ses groupes n'était affecté.
   - Cela rendait les deux dimensions de restriction incohérentes lorsqu'elles étaient toutes les deux configurées.

2. `GET /api/capteurs/paginated` réimplémentait sa propre logique de droits.
   - Les sites et groupes affectés étaient relus directement.
   - Sans filtre explicite, les deux périmètres étaient eux aussi combinés avec un `OR`.
   - Avec certains filtres explicites, la logique pouvait diverger du helper partagé.

3. Les relations `t_lieu_groupe` retournées à l'Arborescence n'étaient pas filtrées.
   - Un lieu autorisé via un groupe pouvait donc transporter également le nom d'un autre groupe non affecté.
   - Le regroupement client dupliquait alors le même lieu sous ce groupe non autorisé.

Le composant partagé `MultiSelectFilter` savait déjà afficher une option `disabled` en grisé : le manque venait des métadonnées d'accès fournies à la page Surveillance.

### Règle métier retenue

Le scope utilisateur suit désormais la règle suivante :

- aucun site + aucun groupe affecté → tous les lieux restent visibles ;
- sites uniquement → lieux appartenant aux sites affectés ;
- groupes uniquement → lieux appartenant aux groupes affectés ;
- sites **et** groupes affectés → le lieu doit satisfaire **les deux dimensions** :
  - appartenir à un site affecté ;
  - appartenir à au moins un groupe affecté.

Cette règle est portée par le helper canonique `buildLieuAccessFilter()` et bénéficie donc aussi aux autres lectures qui réutilisent ce scope (Dashboard, Alarmes, résumés, etc.).

### Correctif — filtre Groupes

`ServerFilterOptions()` distingue maintenant :

- les groupes candidats présents dans le périmètre des sites ;
- les groupes réellement affectés à l'utilisateur.

Lorsqu'une restriction Groupe existe :

- groupe affecté → option active ;
- groupe non affecté → option visible mais `disabled`, donc grisée par `MultiSelectFilter`.

Le changement de filtre Site conserve uniquement les groupes encore valides.

Un ancien groupe non autorisé conservé dans `localStorage` est automatiquement retiré des filtres actifs.

### Correctif — API Surveillance

`GET /api/capteurs/paginated` réutilise désormais :

- `getUserLocationScope()` ;
- `buildLieuAccessFilter()`.

Les filtres explicites Site / Groupe sont ensuite appliqués **en plus** du scope utilisateur.

Si un ID de filtre ne fait pas partie du scope configuré, il est neutralisé côté serveur et ne peut pas servir de contournement.

### Correctif — Arborescence

Lorsque l'utilisateur possède une restriction Groupe, les relations `t_lieu_groupe` renvoyées avec :

- les lieux paginés ;
- les compteurs globaux de l'Arborescence ;

sont limitées aux groupes affectés.

Un lieu multi-groupes accessible via un groupe autorisé ne peut donc plus être réaffiché sous un autre groupe non autorisé.

### Fichiers principaux

- `website/src/lib/location-access-scope.ts` ;
- `website/src/app/api/capteurs/paginated/route.ts` ;
- `website/src/app/[locale]/(dashboard)/surveillance/server-filters.ts` ;
- `website/src/app/[locale]/(dashboard)/surveillance/monitoring-filters.tsx` ;
- `website/scripts/test-surveillance-group-access.ts` ;
- `website/package.json` ;
- `website/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- Web : **1.8.5** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35830199009` : **succès complet** sur le HEAD fonctionnel du lot.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:surveillance-group-access` ;
- [x] scope sans restriction ;
- [x] scope Site seul ;
- [x] scope Groupe seul ;
- [x] scope Site + Groupe en `AND` ;
- [x] groupe non affecté visible mais désactivé dans les filtres ;
- [x] filtre localStorage non autorisé nettoyé ;
- [x] relations Arborescence limitées aux groupes autorisés ;
- [x] ESLint ciblé ;
- [x] contrôle i18n sans nouvelle dette dans le lot ;
- [x] TypeScript Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire de validation a été retiré du diff final.

### Validation terrain

- [ ] affecter plusieurs sites et plusieurs groupes à un utilisateur en laissant au moins un groupe décoché ;
- [ ] se connecter avec cet utilisateur ;
- [ ] ouvrir Surveillance > Graphiques ;
- [ ] ouvrir le filtre Groupes et vérifier que le groupe non affecté est visible en grisé et non cliquable ;
- [ ] vérifier que les groupes affectés restent sélectionnables ;
- [ ] vérifier qu'aucun lieu appartenant uniquement au groupe non affecté n'est affiché ;
- [ ] passer en vue Arborescence et confirmer l'absence du groupe non affecté ;
- [ ] tester un lieu appartenant à deux groupes, dont un seul est affecté : le lieu doit apparaître uniquement sous le groupe autorisé ;
- [ ] tester un utilisateur avec seulement des Sites affectés ;
- [ ] tester un utilisateur avec seulement des Groupes affectés ;
- [ ] tester un utilisateur sans Site ni Groupe : tous les lieux doivent rester visibles ;
- [ ] vérifier les compteurs Surveillance et Dashboard ;
- [ ] vérifier la page Alarmes avec le même utilisateur ;
- [ ] valider MySQL puis SQL Server.


---

## R23-002 — Navigation Admin persistante et double état de sauvegarde

**Statut : `CORRIGE_DEV` — PR #146 — squash merge `68cf48afd5bdd9d2541f20cde7af866b266cf623`**

### Retour — 23/09/2026

Deux évolutions sont demandées sur l'Administration :

1. le dock de navigation Admin doit être visible :
   - sur le Dashboard Admin ;
   - sur les pages accessibles depuis ce dock ;
   - sur les sous-pages de ces sections.

2. la card **Sauvegarde système** doit distinguer :
   - l'état de la sauvegarde principale ;
   - l'état de la copie secondaire Robocopy lorsqu'un second répertoire est configuré.

Le journal détaillé actuel est jugé correct et ne doit pas être modifié visuellement.

### Navigation Admin — état vérifié avant correction

`AdminNavDock` contient les destinations :

- Sondes ;
- Modules ;
- Actionneurs ;
- Groupes ;
- Lieux ;
- Sites ;
- Outils.

Cependant `shouldShowAdminNavDock()` n'acceptait que les correspondances exactes.

Conséquences :

- le dock était absent de `/admin` ;
- il disparaissait dès qu'on entrait dans une sous-page, par exemple une sous-page de Sondes, Lieux ou Outils.

### Navigation Admin — correctif

Le dock est maintenant affiché :

- sur `/admin` ;
- sur chaque destination principale ;
- sur leurs descendants via `pathname.startsWith(<route>/)`.

Les autres pages Admin hors du menu restent inchangées : Paramètres, Audit, Métrologie, Santé système, etc.

L'élément actif du dock suit également les sous-pages.

### Sauvegarde système — problème identifié

Le parser historique calculait un seul état par run.

Toute ligne contenant une erreur faisait passer le run complet en `failed`.

Exemple terrain :

- les dumps MySQL sont OK ;
- l'archive `7zip DUMP JOUR vers J : OK (code=0)` est créée ;
- puis la copie secondaire échoue :
  `ERREUR robocopy Repertoire principal vers Repertoire Secondaire (code=16)`.

L'UI affichait donc la sauvegarde complète en échec alors que la sauvegarde principale était réussie.

### Sauvegarde système — nouveau contrat

La réponse `GET /api/admin/sauvegardes` expose désormais deux états indépendants :

#### Sauvegarde principale

- `success` lorsqu'une archive journalière 7zip a été créée sans erreur préalable ;
- `failed` lorsqu'une erreur intervient pendant la phase principale ;
- `in_progress` tant que la phase principale n'est pas terminée.

Une erreur de copie secondaire n'altère plus cet état.

#### Copie secondaire

Le chemin est lu dans le journal depuis la ligne :

`Repertoire secondaire de sauvegarde (si defini) : "..."`

Une variante anglaise est également reconnue.

- chemin vide `""` → `not_configured` ;
- chemin défini + Robocopy réussi → `success` ;
- chemin défini + Robocopy en attente / en cours → état dédié ;
- code Robocopy en échec → `failed`.

### Robocopy

Le parser ne dépend plus uniquement du texte localisé.

Les erreurs suivantes sont reconnues :

- `ERREUR` ;
- `ERROR` ;
- `FAILED` ;
- `FAILURE` ;
- `ECHEC` / `ÉCHEC`.

Le code Robocopy reste la source de vérité pour la copie secondaire :

- codes `0–7` : non bloquants ;
- codes `>= 8` : échec.

La card fournit un message explicite pour chaque code `0–16`.

Exemple attendu avec le log terrain :

- Sauvegarde principale : **Réussie** ;
- Copie secondaire : **Échec** ;
- Répertoire : `Z:\Temp` ;
- Code Robocopy 16 : erreur grave, copie secondaire non réalisée.

### Affichage

La card Sauvegarde système affiche deux blocs compacts :

- **Sauvegarde principale** :
  - état ;
  - dernière exécution ;
  - répertoire principal.

- **Copie secondaire** :
  - état ;
  - répertoire secondaire si configuré ;
  - code + explication Robocopy lorsqu'il existe.

La dialog du journal conserve son affichage existant.

Le rendu est partagé par les dashboards Basic / Standard / Expert.

### Fichiers principaux

- `website/src/components/admin-nav-dock.tsx` ;
- `website/src/lib/backup-log-parser.ts` ;
- `website/src/types/backup-types.ts` ;
- `website/src/app/api/admin/sauvegardes/route.ts` ;
- `website/src/app/[locale]/(admin)/admin/_components/admin-backup-status-summary.tsx` ;
- `website/src/app/[locale]/(admin)/admin/page.tsx` ;
- `website/src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-widget-card.tsx` ;
- `website/src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-widget-renderer.tsx` ;
- `website/src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-dashboard-types.ts` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json` ;
- `website/scripts/test-admin-nav-backup-status.ts`.

### Version

- Web : **1.8.6** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35846548157` : **succès complet** après réintégration du dernier `dev` (`14de48a5a20a990b4898f9aa3de2b0da5ee3af6c`).

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:admin-nav-backup-status` ;
- [x] log terrain avec sauvegarde principale OK + Robocopy secondaire code 16 ;
- [x] erreur anglaise `ERROR` ;
- [x] répertoire secondaire vide ;
- [x] codes Robocopy 0–7 non bloquants ;
- [x] codes Robocopy 8–16 en échec ;
- [x] dock sur `/admin` ;
- [x] dock sur destinations + sous-pages ;
- [x] absence du dock sur les autres pages Admin ;
- [x] ESLint ciblé ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] TypeScript Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le checker i18n global signale encore uniquement de la dette préexistante hors de ce lot (workflow d'étalonnage et mention légale). Le workflow temporaire de validation a été retiré du diff final.

### Validation terrain

- [ ] ouvrir le Dashboard Admin et vérifier la présence du dock ;
- [ ] tester Sondes, Modules, Actionneurs, Groupes, Lieux, Sites et Outils ;
- [ ] ouvrir une sous-page de Sondes / Lieux / Outils et vérifier que le dock reste visible ;
- [ ] vérifier qu'Audit, Paramètres, Métrologie et Santé système ne récupèrent pas le dock par erreur ;
- [ ] avec sauvegarde secondaire désactivée (`""`) : état **Non configurée** ;
- [ ] avec copie secondaire réussie : état et code Robocopy cohérents ;
- [ ] reproduire un code Robocopy 16 : principale **Réussie**, secondaire **Échec** ;
- [ ] vérifier un Windows FR et un Windows EN ;
- [ ] ouvrir la dialog du journal et confirmer que son affichage est inchangé ;
- [ ] vérifier dashboards Basic / Standard / Expert ;
- [ ] valider MySQL puis SQL Server.


---

## R23-003 — Surveillance : corriger le décalage horaire des mesures

**Statut : `CORRIGE_DEV` — PR #147 — squash merge `412675643cbf531316c8a90565b4ca3df0a7594b`**

### Retour — 23/09/2026

Décalage horaire constaté sur plusieurs affichages liés aux mesures :

- page Surveillance ;
- consultation des graphes ;
- tableau des mesures.

Le correctif doit réutiliser le helper date canonique et ne pas ajouter de compensation manuelle de type `-2 h`.

### Cause / état vérifié

Le dépôt avait déjà rencontré le même symptôme sur les alarmes dans **B17-001** : les colonnes MySQL `DATETIME` sans fuseau peuvent être exposées par Prisma sous forme de `Date` puis sérialisées en ISO `...Z`. Si cette valeur est ensuite traitée comme un vrai instant UTC, une heure stockée localement peut être affichée avec +1/+2 h.

Le flux des mesures était partiellement correct avant ce lot :

- `GET /api/mesures/[idLieu]` utilisait déjà `serializeStoredDbDateTime(m.Date_Heure_Mesure)` ;
- `GET /api/capteurs/paginated` sérialisait déjà correctement la dernière mesure.

Cependant plusieurs consommateurs reparsaient ensuite les timestamps avec la sémantique générique `parseDbDateTime()`, et certains autres `DATETIME` de Surveillance traversaient encore JSON comme des objets `Date` standards.

Autres points identifiés :

- le tableau des mesures utilisait `formatDbDateTime()` / `parseDbDateTime()` sur les timestamps de mesure ;
- le grand graphe utilisait ces mêmes helpers génériques pour ses labels et tooltips ;
- le cache des mesures triait avec `Date.parse()` directement ;
- les dates de désactivation/réactivation de Surveillance et alarmes étaient renvoyées brutes par l'API paginée ;
- le résumé des lieux désactivés pouvait appliquer explicitement le `timeZone` applicatif à une heure murale déjà stockée ;
- l'endpoint historique `/api/tableau-de-bord/measurements` utilisait encore `serializeDbDateTime()` sur un `Date` Prisma.

### Correctif — helper date canonique

`website/src/lib/date-display.ts` reste l'unique moteur date.

Le contrat est complété par :

- `parseStoredDbDateTime(value)` ;
- `formatStoredDbDateTime(value, options)`.

Ces helpers passent d'abord par `serializeStoredDbDateTime()` afin de préserver les composantes du `DATETIME` stocké.

Lorsqu'une valeur a déjà traversé JSON sous une forme telle que :

`2026-09-23T10:36:17.000Z`

elle est interprétée comme l'heure murale stockée **10:36:17**, et non comme un instant à convertir vers 12:36:17 en Europe/Paris.

`formatStoredDbDateTime()` ignore volontairement `timeZone` afin d'empêcher une seconde conversion de fuseau sur ce type de donnée.

### Correctif — Surveillance

Les cards utilisent désormais les helpers « stored » pour :

- la dernière mesure ;
- les comparaisons chronologiques avec le dernier point du mini-graphe ;
- les dates de désactivation/réactivation affichées dans les badges.

L'API paginée sérialise aussi avec `serializeStoredDbDateTime()` :

- `Date_Heure_Reactivation_Alarme` ;
- `Date_Heure_Surveillance_Off` ;
- `Date_Heure_Reactivation_Surveillance`.

Le résumé des sections désactivées n'applique plus de `timeZone` aux `DATETIME` stockés.

### Correctif — graphes

Le graphe détaillé utilise la sémantique `DATETIME` stocké pour :

- tri des labels de mesures ;
- timestamps des points ;
- tooltips date/heure ;
- marqueurs d'audit associés aux mesures.

Les bornes de plage choisies par l'utilisateur restent des vrais objets `Date` et conservent le traitement générique existant.

La superposition de courbes est également alignée pour le tri, l'axe et l'export Excel.

### Correctif — tableau des mesures

Le tableau détaillé :

- affiche les dates via `formatStoredDbDateTime()` ;
- trie la colonne Date via `parseStoredDbDateTime()`.

Le cache serveur des mesures utilise le helper métier `getMeasureTimestamp()` au lieu de `Date.parse()`.

### Non-régression complémentaire

`GET /api/tableau-de-bord/measurements` utilise désormais `serializeStoredDbDateTime()` sur `Date_Heure_Mesure`, comme les autres endpoints de mesures.

### Fichiers principaux

- `website/src/lib/date-display.ts` ;
- `website/src/lib/measurements.ts` ;
- `website/src/lib/measurement-cache.ts` ;
- `website/src/components/monitoring-card.tsx` ;
- `website/src/components/monitoring-details/monitoring-graph-tab.tsx` ;
- `website/src/components/monitoring-details/monitoring-table-tab.tsx` ;
- `website/src/app/[locale]/(dashboard)/surveillance/_components/monitoring-site-section.tsx` ;
- `website/src/app/[locale]/(dashboard)/surveillance/_components/curves-overlay-modal.tsx` ;
- `website/src/app/api/capteurs/paginated/route.ts` ;
- `website/src/app/api/tableau-de-bord/measurements/route.ts` ;
- `website/scripts/test-date-display.ts` ;
- `website/scripts/test-surveillance-measurement-timezone.ts`.

### Version

- Web : **1.8.7** ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé ;
- BDD : **0.91.0** — inchangée ;
- aucune migration BDD.

### Validation automatisée

GitHub Actions run `35860494426` : **succès complet** après réintégration du dernier `dev` (`9151b14a315112363227a03467af45535e54a99e`).

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:date-display` ;
- [x] `pnpm test:surveillance-measurement-timezone` ;
- [x] heure d'été Europe/Paris : `10:36:17` reste `10:36:17` ;
- [x] chaîne JSON `...Z` issue d'un `DATETIME` stocké ;
- [x] chaîne avec offset explicite ;
- [x] mini-graphe Surveillance ;
- [x] graphe détaillé / tooltip ;
- [x] tableau des mesures / tri ;
- [x] superposition de courbes ;
- [x] dates de désactivation/réactivation ;
- [x] ESLint ciblé ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] TypeScript Prisma MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire de validation a été retiré du diff final. Les changements postérieurs au run concernent uniquement ce nettoyage et la documentation de validation.

### Validation terrain

- [ ] prendre une mesure récente et noter exactement `Date_Heure_Mesure` en BDD ;
- [ ] comparer l'heure affichée sur la card Surveillance ;
- [ ] ouvrir le graphe et vérifier axe + tooltip sur la même mesure ;
- [ ] ouvrir **Tableau des mesures** et vérifier la même heure ;
- [ ] vérifier un tri ascendant / descendant sur Date ;
- [ ] tester une plage personnalisée et les dernières 24 h ;
- [ ] tester la superposition de courbes et son export Excel ;
- [ ] vérifier les badges de Surveillance désactivée / réactivation programmée ;
- [ ] refaire le contrôle sur une date en heure d'été et une date en heure d'hiver ;
- [ ] valider MySQL puis SQL Server.


---

## R23-004 — Aligner le seed SQL Server sur les derniers changements MySQL

**Statut : `CORRIGE_DEV` — PR #148 — squash merge `ab753d85e1832dab7878158b7f2463d570772a87`**

### Demande — 23/09/2026

Deux modifications ont été réalisées directement dans `db/vigisensys_seed.sql` et doivent être reproduites côté SQL Server :

1. modification des types numériques de `t_lieu_template` ;
2. modification de `TRG_GSO_BEF_UPD_LIEU_ALARME`.

Commits MySQL analysés :

- `14de48a5a20a990b4898f9aa3de2b0da5ee3af6c` — `Update des types de données du t_lieu_template` ;
- `850fc17a515ffed98507b3357ea076905cb3bec2` — `Update trigger TRG_GSO_BEF_UPD_LIEU_ALARME`.

### Changement de types

Les neuf colonnes suivantes de `t_lieu_template` passent de `DECIMAL(10,2)` à `FLOAT` sur SQL Server, comme elles le sont déjà dans le seed MySQL :

- `Consigne` ;
- `Consigne_Sup` ;
- `Consigne_Inf` ;
- `Tolerance_Surveillance_Sup` ;
- `Tolerance_Surveillance_Inf` ;
- `Consigne_Sup_Pre_Alarme` ;
- `Consigne_Inf_Pre_Alarme` ;
- `Seuil_Critique_Haut` ;
- `Seuil_Critique_Bas`.

La nullabilité reste `NULL`.

### Trigger GSO

Le changement métier réellement identifié dans le commit MySQL est le retrait du bloc **seuils critiques immédiats** de `TRG_GSO_BEF_UPD_LIEU_ALARME`.

Le gros diff du commit contient également beaucoup de suppressions de lignes vides, qui ne constituent pas un changement métier.

Le seed SQL Server est aligné en retirant :

- les quatre variables liées aux seuils critiques ;
- les quatre champs correspondants du curseur `inserted` ;
- les variables correspondantes des deux `FETCH NEXT` ;
- les deux branches qui créaient/transitaient immédiatement vers une alarme `B` / `H` sur franchissement d'un seuil critique.

La logique restante du trigger est conservée : alarmes temporisées B/H, non-réponse, transitions, fins d'alarme et pré-alarmes.

### Version BDD et migrations

Le lot formalise la révision BDD **0.91.1** :

- `db/vigisensys_seed.sql` : comportement métier inchangé, marqueur porté à `0.91.1` ;
- `db/vigisensys_seed_mssql.sql` : types + trigger alignés et marqueur `0.91.1` ;
- `db/migrations/0.91.1/mysql.sql` : applique aux bases MySQL existantes les changements déjà présents dans le seed ;
- `db/migrations/0.91.1/mssql.sql` : applique les mêmes changements aux bases SQL Server existantes.

Les triggers des migrations sont générés depuis les triggers courantes des seeds pour éviter toute divergence.

### Fichiers principaux

- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql` ;
- `db/migrations/0.91.1/mysql.sql` ;
- `db/migrations/0.91.1/mssql.sql` ;
- `db/migrations/README.md` ;
- `db/CHANGELOG.md` ;
- `CHANGELOG.md`.

### Version

- BDD : **0.91.1** ;
- Web : **1.8.7** — inchangé ;
- Serveur : **1.1.0** — inchangé ;
- Agent : **1.0.1** — inchangé.

### Validation automatisée

GitHub Actions run `35864102588` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] les 9 colonnes sont `FLOAT` dans les deux seeds ;
- [x] les deux triggers GSO ne contiennent plus `Seuil_Critique_*` ;
- [x] trigger MySQL migration = trigger MySQL seed (hors espaces de fin de ligne) ;
- [x] trigger MSSQL migration = trigger MSSQL seed (hors espaces de fin de ligne) ;
- [x] le curseur MSSQL et ses deux `FETCH NEXT` utilisent le même nombre de champs ;
- [x] `SCHEMA_VERSION = 0.91.1` dans les deux seeds et migrations ;
- [x] le seed MySQL ne reçoit aucune modification métier supplémentaire dans cette branche : uniquement le passage de version `0.91.0 -> 0.91.1`.

Le workflow temporaire de validation a été retiré du diff final.

### Validation terrain / BDD

- [ ] nouvelle base MySQL : vérifier les types de `t_lieu_template` et le trigger ;
- [ ] nouvelle base SQL Server : vérifier les mêmes objets ;
- [ ] migration d'une base MySQL 0.91.0 vers 0.91.1 ;
- [ ] migration d'une base SQL Server 0.91.0 vers 0.91.1 ;
- [ ] vérifier que les données existantes de `t_lieu_template` sont conservées ;
- [ ] tester une alarme GSO basse / haute avec retard normal ;
- [ ] tester une non-réponse GSO ;
- [ ] tester une fin d'alarme et une pré-alarme ;
- [ ] confirmer que les seuils critiques ne déclenchent plus directement via le trigger GSO.


---

## R23-005 — Retours complémentaires Surveillance / alarmes / administration du 23/09/2026

**Statut global : `EN_COURS` — traitement par lots séquentiels depuis `dev`**

Les retours suivants ont été fournis à la fois sous forme de texte et de captures. Certains se recoupent ; cette section constitue la liste consolidée à reprendre lot par lot.

### R23-005-A — Décalages horaires Surveillance / graphes / acquittements

**Statut : `CORRIGE_DEV` — PR #149 — squash merge `f4fbf7d7e709cabb47baa2c571b5fa4fb0866312`**

Retours :

- à l'ouverture du détail d'un lieu vers 15 h, le graphe pouvait ne charger les mesures que jusqu'à environ 13 h ;
- même phénomène sur les graphes utilisés dans le parcours d'acquittement / analyse d'alarme ;
- après la PR #147, une card Surveillance a affiché par exemple `23/09/2026 11:36` alors que l'heure réelle de la mesure était environ deux heures plus tard ;
- revalider également le tableau des mesures, déjà traité en #147, afin de ne pas réintroduire de décalage.

#### Cause complémentaire identifiée après #147

La PR #147 a corrigé la sémantique des chaînes `DATETIME` côté affichage, mais supposait encore que les objets `Date` renvoyés par Prisma avaient la même représentation sur MySQL et SQL Server.

Ce n'est pas le cas avec les adapters réellement utilisés :

- `@prisma/adapter-mariadb` utilise le driver MariaDB dont la timezone par défaut est locale ;
- `@prisma/adapter-mssql` s'appuie sur node-mssql, qui utilise UTC par défaut pour les dates sans offset.

Deux régressions en découlent si le provider n'est pas pris en compte :

1. **lecture MySQL** : un `DATETIME 13:36` peut être porté par un objet `Date` local 13:36, dont les composantes UTC valent 11:36 ; lire systématiquement `getUTCHours()` produit donc le `-2 h` visible sur la card ;
2. **borne de requête** : un objet UI local 15:00 représente réellement `13:00Z` en été. S'il est transmis tel quel à un provider qui sérialise en UTC, le filtre SQL peut s'arrêter à 13:00.

#### Correctif

Le helper date est séparé en deux niveaux :

- côté client / JSON : chaînes murales sans fuseau via `formatStoredDbDateTime` / `parseStoredDbDateTime` ;
- frontière serveur Prisma : bridge provider-aware exposé par `sql-provider.ts`.

Nouveaux wrappers serveur :

- `serializePrismaStoredDbDateTime(value)` — transforme un `Date` Prisma en chaîne murale correcte selon le provider ;
- `toPrismaStoredDbDateTime(value)` — transforme une borne murale UI en objet `Date` adapté au provider avant filtre/écriture Prisma.

Parcours alignés dans ce lot :

- `GET /api/mesures/[idLieu]` ;
- `GET /api/alarmes/range` ;
- `GET /api/alarmes` pour la borne des 30 jours ;
- `GET /api/alarmes/[id]` utilisé par l'analyse d'acquittement ;
- candidats d'acquittement ;
- `GET /api/capteurs/paginated` pour les dates des cards Surveillance ;
- `GET /api/capteurs` et `GET /api/capteurs/[id]` ;
- `GET /api/sondes/[idSonde]/mesures` ;
- `GET /api/tableau-de-bord/measurements` ;
- dashboard serveur.

Aucune correction fixe `+2 h` / `-2 h` n'est utilisée.

#### Validation automatisée du lot A

GitHub Actions run `35876030438` : **succès complet** sur le HEAD fonctionnel final avant retrait du workflow temporaire.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] `pnpm test:date-display` ;
- [x] `pnpm test:surveillance-measurement-timezone` ;
- [x] simulation Europe/Paris en heure d'été ;
- [x] lecture MariaDB : `13:36` reste `13:36` ;
- [x] lecture SQL Server : composantes UTC du wrapper conservées ;
- [x] borne UI MySQL `15:00` conservée comme heure murale `15:00` ;
- [x] borne UI SQL Server enveloppée en `15:00Z` pour `useUTC=true` ;
- [x] contrats source des APIs mesures, alarmes, cards et endpoints historiques ;
- [x] ESLint ciblé ;
- [x] TypeScript Prisma MySQL ;
- [x] contrôle i18n sans nouvelle dette dans les sources du lot ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript Prisma SQL Server ;
- [x] restauration Prisma MySQL ;
- [x] build production Next.js.

Le workflow temporaire a été retiré du diff final après ce run.

#### Validation terrain du lot A

- [ ] comparer une `Date_Heure_Mesure` BDD avec l'heure affichée sur la card ;
- [ ] ouvrir un lieu à une heure connue, par exemple 15 h, et vérifier que les dernières mesures vont bien jusqu'à ~15 h ;
- [ ] vérifier axe et tooltip du graphe ;
- [ ] vérifier le tableau des mesures ;
- [ ] ouvrir l'analyse/acquittement d'une alarme et vérifier que la plage débute/termine aux vraies heures de l'alarme ;
- [ ] tester une alarme encore en cours, dont la fin de plage suit l'heure actuelle ;
- [ ] tester MySQL ;
- [ ] tester SQL Server ;
- [ ] refaire un contrôle en heure d'hiver.

### R23-005-B — Présentation et signalétique Surveillance

**Statut : `CORRIGE_DEV` — PR #151 — squash merge `a644a7f065d8cacc1626da5af37f540692665eab`**

Retours consolidés :

- sur les cards, inverser la hiérarchie visuelle du **lieu** et de la **sonde** :
  - lieu en premier et plus grand ;
  - sonde en second et plus petit ;
- rendre le point clignotant des cards en alarme nettement plus visible / flashy ;
- remplacer le badge/libellé **« critiques »** par **« alarmes en cours »** là où ce compteur représente les alarmes actives.

#### Correctif

- le header des cards affiche maintenant le **lieu** en premier avec une taille et un poids supérieurs ;
- le numéro de série de la **sonde** est affiché juste dessous avec une taille plus discrète ;
- le point d'alarme combine un noyau blanc contrasté, un halo et une pulsation expansive pour rester visible sur tous les thèmes d'alarme ;
- le compteur supérieur et le filtre de statut `critical` sont renommés **« alarmes en cours »** en FR et **« alarms in progress »** en EN ;
- la clé/statut interne `critical` est conservée afin de ne modifier aucun contrat API ou calcul de compteur ;
- le guide utilisateur est aligné avec le nouveau vocabulaire ;
- le Web passe en **1.8.9**.

#### Validation automatisée

GitHub Actions run `35984641463` : **succès complet**.

- [x] installation `pnpm` avec lockfile figé ;
- [x] ESLint ciblé sur le header de card et les supplements i18n ;
- [x] contrôle i18n : aucune nouvelle dette dans les fichiers du lot ;
- [x] génération Prisma MySQL ;
- [x] build production Next.js ;
- [x] workflow temporaire retiré du diff final.

Fichiers principaux :

- `website/src/components/monitoring-card/monitoring-card-header.tsx` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json` ;
- `website/src/messages/supplements.ts` ;
- `docs/guide-utilisateur-vigisensys.md`.

#### Validation terrain

- [ ] vérifier une card avec sonde : le lieu doit être immédiatement plus visible que le numéro de série ;
- [ ] vérifier une card sans numéro de série : le lieu reste correctement affiché sans ligne vide ;
- [ ] vérifier le point sur une alarme haute, basse et non-réponse ;
- [ ] vérifier la lisibilité du pulse sur les headers rouge, bleu et noir, en thème clair et sombre ;
- [ ] vérifier le badge supérieur **Alarmes en cours** et son filtre au clic ;
- [ ] vérifier le libellé anglais **Alarms in progress** ;
- [ ] vérifier que les compteurs, filtres et statuts métier restent identiques.

### R23-005-C — Emails d'alarme et formulation Paramètres

**Statut : `EN_COURS` — branche `fix/alarm-email-notifications` — base `dev` `a644a7f065d8cacc1626da5af37f540692665eab`**

Retours :

- créer un template d'email spécifique pour le déclenchement d'un **seuil critique** ;
- sur un email de **fin d'alarme de non-réponse**, la dernière valeur apparaît `N/A` alors qu'une mesure a été reçue et que la trigger a été mise à jour ;
- dans Administration > Paramètres > Alarmes / notifications, supprimer la formulation **« mail système »** au profit d'un libellé métier plus clair ;
- conserver FR/EN.

#### Diagnostic

- les seuils critiques ne créent pas un nouveau type d'alarme : le Serveur conserve `H` / `B` et déclenche immédiatement lorsque `Seuil_Critique_Haut` / `Seuil_Critique_Bas` est franchi ;
- le Web peut donc identifier un déclenchement critique en comparant la valeur de déclenchement au seuil critique actif du lieu avec les mêmes opérateurs stricts `>` / `<` ;
- pour les fins de non-réponse, `/api/alarmes/dispatch` forçait explicitement `N/A` pour tous les types différents de `H` et `B`, sans relire la mesure valide ayant mis fin à l'alarme.

#### Correctif

- ajout de `emails/critical-threshold-alarm-notification.tsx`, template React Email dédié aux seuils critiques ;
- sujet spécifique **SEUIL CRITIQUE DÉPASSÉ** / **CRITICAL THRESHOLD EXCEEDED** ;
- mise en avant du seuil, de la valeur mesurée, du sens haut/bas et du contexte lieu/sonde ;
- détection centralisée via `resolveCriticalThresholdContext()`, sans modifier les types `H` / `B` en BDD ou dans les APIs ;
- sur une fin d'alarme `N`, récupération de la dernière mesure valide non nulle du lieu depuis `tm_mesures`, postérieure au début de l'alarme ;
- la date et l'unité de cette mesure deviennent également la source de l'email lorsque la mesure de reprise est disponible ;
- fallback `N/A` conservé si aucune mesure valide n'est retrouvée ;
- remplacement des formulations « emails système » par **destinataires globaux** / **global recipients** dans Paramètres ;
- le helper SMTP parle de **notifications automatiques** / **automated notifications** ;
- correction des libellés anglais historiquement restés en français dans le template générique ;
- Web passé en **1.8.10**.

#### Validation automatisée

GitHub Actions run `35992350323` : **succès complet**.

- [x] `git diff --check origin/dev...HEAD` ;
- [x] installation `pnpm` avec lockfile figé ;
- [x] génération Prisma MySQL ;
- [x] `pnpm test:alarm-email-notifications` ;
- [x] ESLint ciblé sur le flux de dispatch, les templates, le moteur email et les messages Paramètres ;
- [x] contrôle i18n sans nouvelle dette dans les fichiers du lot ;
- [x] build production Next.js sur le provider MySQL ;
- [x] génération Prisma SQL Server ;
- [x] TypeScript `--noEmit` sur le provider SQL Server ;
- [x] workflow temporaire retiré du diff final.

Fichiers principaux :

- `website/src/app/api/alarmes/dispatch/route.ts` ;
- `website/src/lib/alarm-email.ts` ;
- `website/emails/alarm-event-notification.tsx` ;
- `website/emails/critical-threshold-alarm-notification.tsx` ;
- `website/src/messages/fr.json` ;
- `website/src/messages/en.json` ;
- `website/src/messages/admin-settings-supplements.ts` ;
- `website/scripts/test-alarm-email-notifications.tsx`.

#### Validation terrain

- [ ] déclencher directement une alarme haute via le seuil critique haut : vérifier sujet et template critique ;
- [ ] déclencher directement une alarme basse via le seuil critique bas : vérifier sujet et sens du seuil ;
- [ ] déclencher une alarme H/B normale sans franchir le seuil critique : vérifier que le template standard reste utilisé ;
- [ ] provoquer une non-réponse puis une reprise : l'email de fin doit afficher la vraie dernière valeur et son unité ;
- [ ] vérifier que le fallback `N/A` reste propre si aucune mesure valide n'est disponible ;
- [ ] vérifier les templates et libellés en français puis en anglais ;
- [ ] vérifier dans Paramètres que « mail système » n'apparaît plus dans les libellés visibles du lot ;
- [ ] vérifier MySQL et SQL Server.

### R23-005-D — Graphes d'acquittement : transitions et zoom

**Statut : `A_FAIRE`**

Retours :

- l'animation de dessin/changement d'alarme est trop lente ;
- les transitions lors d'un changement d'alarme doivent être plus rapides ;
- le zoom/dézoom est trop lent ;
- après un dézoom important, il devient presque impossible de rezoomer : vérifier les bornes du plugin Chart.js Zoom, la capture/restauration de `zoomBounds` et les callbacks ;
- ne pas dégrader le comportement des graphes Surveillance classiques.

### R23-005-E — Preview des consignes / limites dans la modal d'un lieu

**Statut : `A_FAIRE`**

Retours consolidés du texte et de la capture :

- lorsque l'utilisateur modifie certaines limites, c'est visuellement la **ligne Consigne** qui se déplace : corriger l'association dataset/guide ;
- empêcher ou signaler immédiatement les valeurs incohérentes dans le formulaire, même si la validation finale les refuserait déjà ;
- vérifier si une configuration incohérente doit bloquer la saisie ou au minimum rendre la validation impossible de manière visuellement explicite ;
- le retard d'alarme doit commencer depuis le **dernier point encore valide**, et non depuis le premier point hors tolérance ;
- revoir le visuel représentant la temporisation / le « Retard d'alarme » sur la preview ;
- revoir les validations des **pré-alarmes avec EMT** ;
- indiquer au-dessus des limites lorsqu'un **EMT** est inclus dans le seuil effectif ;
- lorsqu'une consigne/limite change, la preview doit se mettre à jour sans déplacer une courbe qui ne correspond pas au champ modifié.

### R23-005-F — Édition utilisateur

**Statut : `A_FAIRE`**

Retours de la capture :

- à l'ouverture de **Modifier l'utilisateur**, le profil actuellement affecté n'est pas présélectionné ;
- le champ apparaît vide et déclenche immédiatement « Le profil est requis » alors que l'utilisateur possède déjà un profil ;
- vérifier le chargement/mapping `Id_Profil` entre la ligne utilisateur et le formulaire ;
- étudier un affichage plus large / paysage de la fenêtre d'édition afin d'afficher davantage d'informations simultanément sans scroll excessif, tout en restant responsive.

### R23-005-G — Card métrologie du Dashboard Admin

**Statut : `A_FAIRE`**

Retour :

- la durée utilisée par la card métrologie / échéance d'étalonnage ne doit pas être une constante ;
- récupérer la **durée de validité d'étalonnage** depuis le paramètre BDD existant ;
- vérifier MySQL / SQL Server et le fallback historique si le paramètre est absent.

### Ordre de traitement prévu

Les lots restent séquentiels afin que chaque branche parte du `dev` effectivement mergé :

1. **A — dates / graphes** ;
2. **B — cards / signalétique Surveillance** ;
3. **C — emails / paramètres alarmes** ;
4. **D — UX graphes acquittement** ;
5. **E — preview limites / EMT / validations** ;
6. **F — édition utilisateur** ;
7. **G — card métrologie**.

L'ordre pourra être ajusté sur demande, mais aucune branche suivante ne doit être créée depuis un `dev` obsolète.

---

## R24-001 — Métrologie : port série bloqué en `queued` après une interrogation

**Statut : `CORRIGE_DEV` — PR #150 — squash merge `1d0655056fcd54a5b365ff9133c25b3cd8c835f9`**

### Retour — 24/09/2026

Lors d'une lecture de sonde en Étalonnage, le Serveur pouvait rester sur :

- `[ETALONNAGE][LOCK] status=queued ... action=read-config; priority=surveillance-first` ;
- `[ETALONNAGE][LOCK] status=queued ... action=read; priority=surveillance-first`.

Le défaut persistait alors que toutes les GSP de Surveillance du banc avaient été désactivées : aucune valeur de métrologie n'arrivait et le port série n'était jamais repris par l'opération.

### Diagnostic

Le verrou global du port était acquis une première fois par `ThreadServeur.RunWithPortLockAsync`, puis une seconde fois dans `Sensor.ExecuteWithPortLockAsync`.

Cette acquisition imbriquée utilisait un `Mutex` Windows, dont le propriétaire est le thread. Comme les lectures de sondes contiennent des `await`, la continuation pouvait reprendre sur un autre thread ; `ReleaseMutex()` échouait alors pour la seconde acquisition. L'exception était ignorée et le mutex global pouvait rester détenu indéfiniment.

### Correctif en cours

- conserver le mutex global dans `ThreadServeur.RunWithPortLockAsync`, qui arbitre Surveillance / Hotline / métrologie ;
- supprimer la seconde acquisition du même mutex dans `Sensor.ExecuteWithPortLockAsync` ;
- conserver dans `Sensor` uniquement le `SemaphoreSlim` local async-compatible ;
- ne modifier ni les trames GSP ni la logique métier de lecture ;
- passer Serveur + installateur en **1.1.1** ;
- documenter la validation terrain dans `website/docs/metrology-retours-26-08-2026.md`.

### Validation automatisée

GitHub Actions run `35970788192` : **succès**.

- [x] restauration NuGet legacy ;
- [x] build Serveur .NET Framework 4.8 Release ;
- [x] build installateur Serveur 1.1.1 Release ;
- [x] workflow temporaire retiré du diff final.

### Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/Properties/AssemblyInfo.cs` ;
- `Vigitemp Serveur/VigitempServerInstaller/VigitempServerInstaller.csproj` ;
- `Vigitemp Serveur/CHANGELOG.md` ;
- `CHANGELOG.md` ;
- `website/docs/metrology-retours-26-08-2026.md`.

### Validation terrain

- [ ] redémarrer le service avec le binaire corrigé pour repartir sans mutex résiduel de l'ancienne version ;
- [ ] vérifier une lecture métrologie sans GSP Surveillance active sur le port : acquisition immédiate ;
- [ ] vérifier une lecture lancée pendant une mesure Surveillance : attente, puis `dequeued` et lecture ;
- [ ] enchaîner plusieurs lectures sur le même port sans redémarrage ;
- [ ] valider Ajustage et Étalonnage ;
- [ ] valider plusieurs GSP sur le même module/COM ;
- [ ] confirmer la reprise normale de la Surveillance après l'opération.

