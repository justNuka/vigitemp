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
- PR #40 : B21-002, coefficients métrologiques embarqués dans les GSP / protocole `ECON` étendu — **ouverte en draft** sur `agent/gsp-onboard-metrology-coefficients`.

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

**Statut : `CORRIGE_DEV` — PR #33 — branche `agent/xml-ajustage-import-export`**

### Retour du 20/08/2026

Lorsqu’un XML d’ajustage créait automatiquement une **GSO simple capteur**, les valeurs stockées ne suivaient pas la convention attendue.

Exemple terrain fourni :

- attendu : `Adresse = 10007909-T`, `Numéro de série = SOET-10007909`;
- ancien comportement après import : `Adresse = 10007909`, `Numéro de série = 10007909`.

### Correctif livré

La règle d’identité des GSO simples `SOIT` / `SOET` est centralisée et utilisée par la prévisualisation, l’import unitaire et l’import multiple :

- `Sonde_Numero_Serie` = `<TYPE>-<chiffres>`;
- `Adresse_Sonde` = `<chiffres>-T`;
- `Sonde_Type` reste le type détecté;
- `Est_Sonde_GSO = true`;
- l’ajustage importé référence le même numéro typé que la sonde;
- les doubles `SOIH` / `SOEH` conservent leur convention existante.

### Validation terrain

- importer un XML SOET simple et vérifier exactement les deux colonnes montrées dans les captures;
- refaire avec SOIT;
- tester SOIH/SOEH pour confirmer absence de régression;
- tester un import sur une sonde déjà existante;
- vérifier que l’ajustage importé référence le même numéro de série que la sonde créée.

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

**Statut : `PR_OUVERTE` — PR #40 — branche `agent/gsp-onboard-metrology-coefficients`**

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

Statut : **corrigé sur `agent/metrology-command-spacing`, PR #45 ouverte en draft**.

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

