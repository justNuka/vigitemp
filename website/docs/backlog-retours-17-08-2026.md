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

**Statut : `EN_COURS` — branche `feature/hotline-user-help`**

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

