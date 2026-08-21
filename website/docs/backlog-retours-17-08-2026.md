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

**Statut : `EN_COURS` — branche `agent/location-modal-sites-groups`**

### Retour du 21/08/2026

Lors de la création ou de la modification d’un lieu, l’utilisateur doit pouvoir créer rapidement le site ou le groupe manquant sans fermer la modale du lieu, aller dans une autre page d’administration puis revenir reprendre sa saisie.

### État vérifié / implémentation du lot

Le formulaire Général utilisait déjà les listes `sites-simple` et `groups` mais ne proposait aucune création depuis ces champs. Les APIs existantes `POST /api/sites` et `POST /api/groupes` gèrent déjà la création, les droits `PARAMETRES_GERER`, le logging et l’audit : aucune nouvelle route métier n’est nécessaire.

Le lot ajoute des actions de création légère directement à côté des champs Site et Groupes :

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

**Statut : `EN_COURS` — branche `agent/location-modal-sites-groups`**

### Retour du 21/08/2026

L’option Mailing permet déjà d’appliquer la liste de contacts aux groupes sélectionnés dans l’onglet Général, mais l’utilisateur doit revenir dans Général pour se rappeler exactement quels groupes sont concernés.

### État vérifié / implémentation du lot

`LocationFormTabTelephony` surveille déjà `GroupIds` et désactive l’option d’application aux groupes quand aucun groupe n’est sélectionné. Le lot conserve cette logique et ajoute sous l’explication la liste explicite des groupes concernés sous forme de badges.

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

**Statut : `A_INVESTIGUER`**

### Retour du 21/08/2026

Dans la fenêtre **Acquitter l’alarme**, une même alarme de non-réponse peut afficher deux heures différentes pour son début. Capture fournie sur l’alarme `#18155 - Non réponse` :

- ligne de la liste : `20/08/2026 15:34:00`;
- panneau de détail : `20/08/2026 13:34:00`.

L’écart observé est exactement de deux heures. Il rappelle les anciens défauts UTC/local sur les `DATETIME` MySQL, mais la cause n’est **pas encore confirmée** : aucun correctif arbitraire `-2 h` ne doit être appliqué.

### Investigation à réaliser dans un lot séparé

Auditer l’ensemble des dates utilisées par cette fenêtre avant de modifier le comportement :

- `Début alarme` dans la liste et dans le panneau de détail;
- `Fin alarme`;
- calcul de `Durée`;
- date associée à la dernière valeur si présente dans le payload;
- dates utilisées pour le récapitulatif des alarmes sur 30 jours;
- alarmes actives et alarmes terminées;
- valeur brute `DATETIME` en base et valeur renvoyée par l’API;
- sérialisation serveur et formatters frontend;
- usages de `new Date()`, `toISOString()`, `serializeStoredDbDateTime()`, `parseDbDateTime()` ou helpers équivalents autour du parcours d’acquittement.

Comparer ce parcours aux corrections déjà livrées dans les PR #17 et #20 afin d’identifier précisément le chemin qui échappe encore à la normalisation des dates stockées.

### Validation terrain attendue

- une même alarme affiche exactement la même heure dans la liste et le détail;
- début/fin correspondent aux valeurs murales stockées en base;
- la durée reste cohérente avec les deux dates;
- tester une alarme active puis une terminée;
- tester une non-réponse et au moins un autre type d’alarme;
- contrôler le récapitulatif 30 jours;
- vérifier le comportement autour du changement heure été/hiver.

---

## État du lot au 21/08/2026

Les points historiques B17-001 à B17-011 sont corrigés dans `dev`.

Pour le lot B20 :

1. **B20-001 + B20-002** — corrigés dans `dev` via PR #33;
2. **B20-003** — corrigé dans `dev` via PR #34, validation terrain externe encore à effectuer;
3. **B20-004** — corrigé dans `dev` via PR #35;
4. **B20-005 + B20-006** — en cours sur `agent/location-modal-sites-groups`, créée depuis `dev` `a5272678a9c5700e2ea14df53fbb651754194906`;
5. **B20-007** — à investiguer dans un lot Alarmes/Dates séparé après le lot Lieux.

Le `dev` de référence au démarrage de B20-005/B20-006 est `a5272678a9c5700e2ea14df53fbb651754194906` (merge PR #35).

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
