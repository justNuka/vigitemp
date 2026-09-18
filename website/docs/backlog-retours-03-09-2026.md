# Retours terrain — complément du 03/09/2026

> Complément au backlog principal `website/docs/backlog-retours-17-08-2026.md`.
>
> Ce document conserve les retours arrivés après le lot d'août afin qu'une nouvelle conversation puisse reprendre le chantier sans dépendre d'un historique de chat.

## Lot — contexte des alarmes et acquittement multi-lieux

- Branche : `feature/alarm-context-multi-location-ack`
- PR : #86 — `feat(alarmes): afficher le contexte et limiter l'acquittement multi-lieux`
- Base de travail finale : `dev` au commit `5845950b3134ed78943d4f2f7fcb0e05dbf7bb38`
- Statut : mergé dans `dev`

### 1. Dashboard utilisateur — afficher Site / Groupe / Lieu / Sonde

#### Retour terrain

Le tableau des alarmes actives du dashboard utilisateur affichait un intitulé `Lieu / Sonde`, mais le mapping serveur historique plaçait en pratique le nom du site dans `location.name`. Le contexte complet de l'alarme n'était donc pas visible.

#### Modification

Le dashboard enrichit désormais les quelques alarmes affichées avec une requête dédiée et légère sur les lieux concernés. L'affichage suit l'ordre métier :

```text
Site
Groupe(s)
Lieu
Sonde
```

Le mapping transmis à la popup d'acquittement utilise également le vrai nom du lieu et le numéro de série de la sonde.

#### Principaux fichiers

- `website/src/app/[locale]/(dashboard)/server-alarm-hierarchy.ts`
- `website/src/app/[locale]/(dashboard)/page.tsx`
- `website/src/app/[locale]/(dashboard)/dashboard-client.tsx`
- `website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-alarm-columns.tsx`

#### Validation terrain

- [ ] une alarme du dashboard affiche le bon site ;
- [ ] le ou les groupes du lieu sont affichés ;
- [ ] le vrai nom du lieu est affiché ;
- [ ] le numéro de série / nom de sonde est affiché en dernière ligne ;
- [ ] un lieu sans groupe reste lisible ;
- [ ] un lieu appartenant à plusieurs groupes affiche tous ses groupes ;
- [ ] cliquer sur l'alarme ouvre la popup avec le même contexte.

### 2. Popup d'acquittement — contexte complet

#### Retour terrain

La popup n'affichait que le lieu et la sonde. Pour identifier sans ambiguïté une alarme sur des installations importantes, le contexte demandé est :

```text
Site → Groupe → Lieu → Sonde
```

#### Modification

La route de détail d'alarme retourne désormais le site et les groupes du lieu. La popup affiche les quatre niveaux en tête et dans le tableau des alarmes sélectionnables.

La grosse popup historique a été extraite dans un dossier dédié tout en conservant l'import public `@/components/alarm-acknowledge-dialog` afin de ne pas casser Dashboard, Surveillance ou Analyse.

#### Principaux fichiers

- `website/src/app/api/alarmes/[id]/route.ts`
- `website/src/app/api/alarmes/acknowledgement-candidates/route.ts`
- `website/src/components/alarm-acknowledge-dialog.tsx`
- `website/src/components/alarm-acknowledge-dialog/alarm-acknowledge-dialog.tsx`

#### Validation terrain

- [ ] la popup affiche Site, Groupe, Lieu et Sonde dans cet ordre ;
- [ ] le contexte se met à jour quand une autre ligne du tableau reçoit le focus ;
- [ ] les alarmes actives et terminées non acquittées restent distinguées ;
- [ ] les valeurs/seuils/dates restent affichés correctement ;
- [ ] le lien d'analyse graphique reste fonctionnel ;
- [ ] les commentaires d'acquittement restent fonctionnels ;
- [ ] `Acquitter et rester` et `Acquitter et fermer` restent fonctionnels.

### 3. Nouvelle autorisation — acquittement sur plusieurs lieux

#### Retour terrain

Un profil autorisé à acquitter une alarme ne doit pas automatiquement pouvoir sélectionner des alarmes appartenant à plusieurs lieux au cours d'une même opération.

#### Autorisation

Code applicatif / base :

```text
ACQUITTER_ALARMES_MULTI_LIEUX
```

Permission applicative :

```text
ALARM_MULTI_LOCATION_ACK_ACCESS
```

Le droit est créé de façon idempotente dans `t_autorisation` lors du chargement du catalogue d'autorisations par un administrateur. Il n'est affecté automatiquement à aucun profil utilisateur. Les profils administrateurs conservent leur bypass global existant.

#### Comportement sans le droit

- les alarmes appartenant au lieu d'origine restent sélectionnables ;
- plusieurs alarmes du **même lieu** peuvent toujours être acquittées ensemble ;
- les alarmes accessibles appartenant à d'autres lieux restent visibles pour donner le contexte global ;
- leurs cases sont désactivées et la ligne est grisée ;
- la popup affiche le message :

> Votre profil ne vous autorise pas à acquitter plusieurs alarmes sur plusieurs lieux. Rapprochez-vous de votre responsable VigiSensys ou d’un administrateur.

#### Comportement avec le droit

Les cases des autres lieux deviennent sélectionnables et `Tout sélectionner` tient compte de l'ensemble des alarmes visibles.

Le droit concerne la **sélection groupée multi-lieux**. Le droit de base `ALARM_ACK_ACCESS` reste nécessaire pour acquitter une alarme et les contrôles d'accès aux lieux existants restent appliqués par les API. Les acquittements unitaires de deux lieux successifs restent possibles avec le seul droit de base : la nouvelle autorisation porte volontairement sur l'action groupée multi-lieux.

#### Principaux fichiers

- `website/src/lib/permissions.ts`
- `website/src/lib/application-authorizations.ts`
- `website/src/app/api/autorisations/route.ts`
- `website/src/app/api/alarmes/acknowledgement-candidates/route.ts`
- `website/src/components/alarm-acknowledge-dialog/alarm-acknowledge-dialog.tsx`

#### Validation terrain

Profil avec `ALARM_ACK_ACCESS` uniquement :

- [ ] peut acquitter une alarme ;
- [ ] peut sélectionner plusieurs alarmes du même lieu ;
- [ ] voit les alarmes des autres lieux grisées ;
- [ ] ne peut pas cocher leurs cases ;
- [ ] voit le message d'information sur l'autorisation manquante.

Profil avec `ALARM_ACK_ACCESS` + `ACQUITTER_ALARMES_MULTI_LIEUX` :

- [ ] peut cocher des alarmes de plusieurs lieux ;
- [ ] `Tout sélectionner` sélectionne les lignes visibles de plusieurs lieux ;
- [ ] les accès site/groupe/lieu du profil restent respectés ;
- [ ] les acquittements mettent correctement à jour Surveillance et Dashboard.

Profil sans `ALARM_ACK_ACCESS` :

- [ ] ne peut toujours pas ouvrir/exécuter un acquittement, même si le droit multi-lieux lui était affecté par erreur.

## Contrôles techniques avant merge

- [x] génération Prisma MySQL ;
- [x] TypeScript `tsc --noEmit` ;
- [x] ESLint : 0 erreur ; les warnings globaux existants restent non bloquants ;
- [x] contrôle i18n exécuté : le checker global échoue uniquement sur 15 chaînes/symboles préexistants de `calibration-workflow-client.tsx`, sans nouvelle remontée liée à ce lot ;
- [x] branche rebasée/squashée sur le HEAD `dev` `5845950b3134ed78943d4f2f7fcb0e05dbf7bb38` ;
- [x] diff complet final contre `dev` après suppression du workflow temporaire ;
- [x] aucun changement de dépendance, lockfile ou fichier métrologie parasite dans le diff de la PR ;
- [ ] test terrain MySQL / MSSQL à prévoir pour la création idempotente de l'autorisation ;
- [x] PR #86 ouverte vers `dev` sans merge automatique.

---

## Lot — humanisation de l'audit Surveillance

- Branche : `fix/audit-trail-humanization`
- PR : #87 — `fix(audit): humaniser les détails Surveillance`
- Base : `dev` au commit `463a7b6ec90d984ba366dc9c2aa2f1b4c7bf10b3`
- Statut : PR ouverte — validation terrain à réaliser

### 4. Ouverture du graphique — masquer les identifiants techniques

#### Retour terrain

Dans `Surveillance → détail d'une sonde → Audit`, les événements `GRPH` d'ouverture du graphique affichaient encore des métadonnées destinées au code :

```text
Graphique lieu <lieu> | sensor: <serie> | source: monitoring-details
```

Le tableau de détail affichait également les lignes `sensor` et `source`.

#### Modification

- le formatter de l'audit Surveillance masque `source` et le champ technique `sensor` lorsqu'il s'agit d'une ouverture de graphique ;
- le correctif s'applique aussi aux événements `GRPH` déjà présents en base, sans migration de données ;
- les nouveaux événements `GRPH` n'enregistrent plus `sensor` ni `source: monitoring-details` dans `changes` ;
- l'information métier utile reste le libellé `Graphique lieu <nom du lieu>`.

Principaux fichiers :

- `website/src/lib/audit/monitoring-audit.ts`
- `website/src/app/api/lieux/[id]/graph-open/route.ts`

#### Validation terrain

- [ ] une ancienne ligne `GRPH` n'affiche plus `sensor` ;
- [ ] une ancienne ligne `GRPH` n'affiche plus `source` / `monitoring-details` ;
- [ ] une nouvelle ouverture du graphique crée un audit lisible sans métadonnée technique ;
- [ ] le lieu reste clairement identifiable.

### 5. Acquittement — afficher clairement le commentaire utilisateur

#### Retour terrain

Pour un événement `ACQ`, le commentaire saisi lors de l'acquittement était affiché seul, en petit texte italique sous le lieu.

#### Modification

Pour les événements `ACQ`, l'onglet Audit affiche désormais :

```text
Commentaire : <commentaire saisi>
```

Le texte est affiché normalement, sans italique, sous les informations du lieu. Les commentaires des autres types d'audit conservent leur rendu existant.

Le libellé réutilise la traduction existante de la colonne Commentaire, afin de conserver le comportement FR/EN sans ajouter de chaîne codée en dur.

Principal fichier :

- `website/src/components/monitoring-details/monitoring-audit-tab.tsx`

#### Validation terrain

- [ ] acquitter une alarme avec un commentaire ;
- [ ] vérifier que l'événement `ACQ` affiche `Commentaire : <texte>` ;
- [ ] vérifier que le commentaire n'est plus en italique ;
- [ ] vérifier qu'un acquittement sans commentaire n'ajoute pas de ligne vide ;
- [ ] vérifier que les autres événements d'audit conservent leur rendu habituel.

#### Validation technique

- [x] génération Prisma MySQL ;
- [x] TypeScript `tsc --noEmit` ;
- [x] ESLint : 0 erreur ; warnings globaux préexistants uniquement ;
- [x] contrôle i18n exécuté : échec uniquement sur les 15 chaînes/symboles préexistants de `calibration-workflow-client.tsx`, aucune nouvelle remontée liée à l'audit ;
- [x] workflow de validation temporaire supprimé avant PR ;
- [x] PR #87 ouverte vers `dev` sans merge automatique.

---

## Lot — cards de services Mailing / Téléphonie sur le Dashboard admin

**Statut : MERGE — PR #128, validation terrain à réaliser**

- branche : `feature/admin-service-cards` ;
- PR : #128 ;
- base : `dev` au commit `eb09d1421d21a7768f302122547e17b7d533a421` (merge PR #127).

Le Dashboard admin affiche maintenant deux cards de services configurables en complément de la Santé système :

- **Mailing** : état actif/désactivé de `SMTP_ACTIVATION`, complétude de la configuration SMTP et accès rapide aux Paramètres ;
- **Téléphonie** : état actif/désactivé, fournisseur configuré et complétude de la configuration, avec accès rapide aux Paramètres lorsque la licence le permet.

La card générique `AdminServiceCard` est réutilisable pour de futurs services.

### Mailing

La card réutilise `GET /api/admin/configuration-smtp`, dont la réponse masque déjà le mot de passe. Elle ne conserve côté Dashboard que les informations nécessaires à la synthèse.

La configuration est considérée complète lorsque hôte, port valide, utilisateur et mot de passe sont configurés. Cette card représente volontairement l’infrastructure SMTP globale (`SMTP_ACTIVATION`) et ne doit pas être confondue avec `NOTIFICATIONS:EMAIL`, qui pilote séparément l’envoi des emails d’alarme.

### Téléphonie

Ajout de `GET /api/admin/telephony/status`, protégé par le contrôle admin et `requireTelephonyLicense()`.

Le payload est volontairement minimal : `enabled`, `provider`, `configured`. Aucun identifiant, mot de passe, token, URL fournisseur sensible ou autre secret téléphonie n’est renvoyé au navigateur.

La complétude réutilise `getTelephonyConfigMissingFields()` afin de rester alignée avec la validation métier existante.

Sans option `telephonie` dans la licence :

- la card reste visible pour présenter la fonctionnalité ;
- elle réutilise le même `LicenseFeatureLock` que les Paramètres ;
- aucune requête vers `/api/admin/telephony/status` n’est lancée ;
- aucun lien ou bouton de configuration n’est utilisable.

### Frontière client / serveur

Le premier build de validation a détecté qu’un helper partagé importait `telephony/config.ts` depuis le bundle client, ce qui faisait remonter Prisma et les drivers MariaDB/Tedious côté navigateur. Le lot sépare désormais le contrat browser-safe (`admin-service-status.ts`) du helper de synthèse Téléphonie côté serveur (`admin-telephony-service-status.ts`). Le build production final valide cette frontière.

Principaux fichiers :

- `website/src/app/[locale]/(admin)/admin/_components/admin-service-card.tsx` ;
- `website/src/app/[locale]/(admin)/admin/_components/admin-service-cards.tsx` ;
- `website/src/app/[locale]/(admin)/admin/page.tsx` ;
- `website/src/app/api/admin/telephony/status/route.ts` ;
- `website/src/hooks/useAdminServiceStatus.ts` ;
- `website/src/lib/admin-service-status.ts` ;
- `website/src/lib/admin-telephony-service-status.ts` ;
- `website/src/messages/admin-service-cards-supplements.ts` ;
- `website/scripts/test-admin-service-status.ts` ;
- `website/docs/API_MAP.md`.

Validation technique : GitHub Actions `35239689855` ✅ — `git diff --check`, test ciblé, ESLint, TypeScript MySQL, i18n sans nouvelle dette du lot, génération + TypeScript SQL Server et build production.

Checklist terrain :

- [ ] SMTP actif + configuration complète : card Mailing `Actif` ;
- [ ] SMTP désactivé : card `Désactivé` avec état de configuration toujours visible ;
- [ ] SMTP actif avec hôte/utilisateur/mot de passe manquant : `Configuration incomplète` ;
- [ ] Téléphonie licenciée, active et correctement configurée : fournisseur correct + état `Actif` ;
- [ ] Téléphonie licenciée mais désactivée : état `Désactivé` ;
- [ ] Téléphonie active mais configuration fournisseur incomplète : `Configuration incomplète` ;
- [ ] sans option Téléphonie : card visible et verrouillée, aucune action utilisable ;
- [ ] vérifier qu’aucun secret SMTP/Téléphonie n’apparaît dans les cards ni dans le payload `/api/admin/telephony/status` ;
- [ ] vérifier l’accès rapide aux Paramètres lorsque le service est disponible ;
- [ ] vérifier les Dashboard Basic, Standard et Expert ;
- [ ] vérifier FR/EN, clair/sombre et petite largeur.

---

## Lot — fiabilisation du formulaire de lieu (retours du 10/09/2026)

- Branche : `fix/location-form-reliability`
- PR : #112 — `fix(locations): fiabiliser templates, modules et enregistrement`
- Base : `dev` au commit `8e952dd775bf5984df5038cb3d0183320e7f5e9c`
- Statut : `PR_OUVERTE` — validation terrain à réaliser

### 6. Template appliqué avant la sonde — état de surveillance écrasé

Un template avec `Lieu_Etat = D` était réécrit en `S` lors de la sélection de la sonde lorsqu'il avait été appliqué avant celle-ci. Le formulaire confondait le `D` explicite du template avec le `D` temporaire appliqué automatiquement tant qu'aucune sonde n'est sélectionnée.

Correctif : les valeurs d'un template restent des modifications explicites ; seul le `D` automatique d'un nouveau lieu est converti en `S` à la première sélection. Les templates `D` et `S` sont donc tous deux conservés.

### 7. `Enregistrer et rester` fermait la fenêtre

Le dialogue transmettait bien `stay` / `close`, mais `locations-client.tsx` fermait systématiquement les modales après les mutations. Le mode est maintenant respecté. En création, `Enregistrer et rester` bascule le lieu nouvellement créé vers le mode modification avec son `Id_Lieu`, de sorte que les sauvegardes suivantes effectuent un `PATCH` et ne créent pas de doublon. Le cas sans sonde conserve aussi le mode demandé après confirmation.

### 8. Contacts email sans planning — comportement clarifié

Le planning du lieu n'est pas un planning d'envoi des emails. Les contacts `t_lieu_mail_tel` sont utilisés lors des événements d'alarme indépendamment de `t_lieu_planning_regle`. Sans règle de planning, les consignes de base restent actives en continu ; si la surveillance et les notifications email sont actives, une alarme peut donc générer un email à toute heure.

L'onglet Mailing affiche désormais explicitement cette règle en FR/EN. Aucun blocage artificiel n'est ajouté à l'enregistrement de contacts sans planning.

### 9. Champ Module impossible à sélectionner

L'effet React synchronisait `Id_Module` avec le module de la sonde à chaque modification du champ et écrasait donc immédiatement le choix manuel. Le module de la sonde sert désormais uniquement d'initialisation lors d'un changement de sonde ; un choix manuel reste ensuite conservé. Retirer la sonde remet le module à `null`.

### Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx`
- `website/src/app/[locale]/(admin)/admin/lieux/locations-client.tsx`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-general.tsx`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-sensor-form-state.ts`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-telephony.tsx`
- `website/src/messages/supplements.ts`
- `website/scripts/test-location-form-sensor-state.ts`

### Validation technique

GitHub Actions run `34476223814` exécuté sur le même arbre fonctionnel avant nettoyage de la branche :

- [x] installation pnpm avec lockfile figé ;
- [x] génération Prisma MySQL ;
- [x] test ciblé des transitions sonde / module / surveillance ;
- [x] ESLint ciblé ;
- [x] TypeScript `tsc --noEmit` ;
- [x] build Next.js production ;
- [x] nouveaux textes Mailing FR/EN présents ; le check i18n global reste rouge uniquement sur les 15 occurrences préexistantes de `calibration-workflow-client.tsx` ;
- [x] historique de branche nettoyé et fichiers/workflows temporaires retirés du diff final.

### Validation terrain

- [ ] appliquer un template `D` avant la sonde, sélectionner la sonde : rester en `D` ;
- [ ] refaire avec un template `S` : rester en `S` ;
- [ ] sans template, sélectionner une sonde sur un nouveau lieu : conserver le défaut `S` ;
- [ ] choisir manuellement un autre module : le choix reste affiché et est enregistré ;
- [ ] changer de sonde : le module est réinitialisé depuis la nouvelle sonde ;
- [ ] modification : `Enregistrer et rester` garde la fenêtre ouverte ;
- [ ] création : `Enregistrer et rester`, modifier un autre champ puis enregistrer à nouveau sans doublon ;
- [ ] tester `Enregistrer et fermer` en création et modification ;
- [ ] tester la création sans sonde avec les deux modes ;
- [ ] vérifier le message Mailing en FR/EN ;
- [ ] déclencher une alarme de test sur un lieu sans planning et confirmer le comportement email attendu.

---

## Lot — échecs de démarrage Ajustage / Étalonnage visibles et rollback GSP (10/09/2026)

- Branche : `fix/metrology-gsp-partial-start-rollback`
- PR : #113 — `fix(metrology): rendre les échecs de démarrage explicites`
- Base : `dev` au commit `482e0506156ffd130c530110b049f4035e1fab41`
- Statut : `PR_OUVERTE` — validation terrain à réaliser

### Retour terrain et cause matérielle confirmée

Lors d'un démarrage avec plusieurs GSP, l'interface attendait la préparation des sondes puis affichait l'erreur uniquement dans le bandeau global tout en haut de la page. L'utilisateur pouvait donc ne pas la voir sans remonter manuellement.

Le cas terrain ayant déclenché l'analyse n'était pas une panne du protocole VigiSensys : la sonde sélectionnée `SPNB-26000148` correspondait à l'étiquette au dos, mais le matériel présent était programmé avec un numéro de série se terminant par `100`. La sonde `148` sélectionnée n'était donc pas joignable. Les logs montraient correctement l'échec `gsp_sensor_unreachable`.

### Amélioration UX

Ajustage et Étalonnage affichent désormais directement dans la card contenant l'action de démarrage :

- un état explicite pendant la configuration/préparation des sondes ;
- le message d'erreur renvoyé par l'API ;
- le numéro de série exact de la sonde non joignable lorsqu'il est connu ;
- une aide GSP : comparer le numéro programmé visible à l'écran avec la sonde sélectionnée et avec l'étiquette au dos ;
- une aide GSO : vérifier le numéro de série et l'adresse de l'étiquette au dos par rapport à la sonde sélectionnée.

L'API Étalonnage renvoie maintenant `gsp_sensor_unreachable` avec le champ `serial`, comme l'API Ajustage, afin que les deux écrans disposent du même diagnostic structuré.

### Rollback GSP partiel

`applyGspMetrologyConfiguration()` configure les GSP séquentiellement. Avant ce lot, si une première GSP acceptait son `ECON` puis qu'une suivante échouait, l'appel levait une exception avant de retourner la liste des sondes déjà préparées. Les routes ne pouvaient donc pas restaurer cette configuration partielle.

Le helper central applique maintenant le lot de manière transactionnelle au niveau matériel : les GSP déjà configurées sont remises en mode `normal`, dans l'ordre inverse, avant de propager l'erreur d'origine. Une erreur de rollback est journalisée sans masquer l'erreur initiale. Les restaurations en mode `normal` ne déclenchent pas de rollback récursif.

### Validation technique

GitHub Actions run `34481613789` exécuté sur le même arbre fonctionnel avant nettoyage final :

- [x] installation pnpm avec lockfile figé ;
- [x] génération Prisma MySQL ;
- [x] test ciblé du rollback GSP séquentiel ;
- [x] ESLint ciblé ;
- [x] TypeScript `tsc --noEmit` ;
- [x] build Next.js production ;
- [x] textes FR/EN ajoutés ; le check i18n global conserve uniquement sa dette préexistante connue ;
- [x] diff final nettoyé des workflows/scripts temporaires.

### Validation terrain

- [ ] Ajustage : sélectionner une GSP joignable puis une GSP volontairement non joignable ;
- [ ] vérifier que la card de démarrage affiche immédiatement la sonde concernée après le timeout ;
- [ ] vérifier que l'aide GSP est visible sans remonter en haut de la page ;
- [ ] vérifier dans les logs que les GSP préparées avant l'échec reçoivent un `econ_applied` en mode `normal` ;
- [ ] refaire le même scénario en Étalonnage ;
- [ ] vérifier un cas GSO en erreur et la présence de l'aide GSO ;
- [ ] corriger le numéro/branchements puis vérifier qu'un démarrage normal fonctionne.

---

## Lot — import d'ajustage : assignation optionnelle et multi-modules (15/09/2026)

- Branche : `feature/import-module-assignment`
- PR : #116 — `feat(import): assouplir l'assignation et la lecture GSP`
- Statut : `PR_OUVERTE` — validation terrain à réaliser
- Documentation détaillée : `website/docs/adjustment-import-module-assignment-15-09-2026.md`

### Retour terrain

L'import d'ajustage ne doit plus exiger un module unique pour tout le lot. Il doit être possible d'importer sans module ou de préparer des affectations différentes par sonde via une dialog dédiée.

### Validation terrain

- [ ] import sans module non bloqué ;
- [ ] module A sur un sous-ensemble de sondes ;
- [ ] module B sur un autre sous-ensemble dans le même lot ;
- [ ] sondes non cochées créées sans module ;
- [ ] module existant d'une sonde déjà connue conservé ;
- [ ] GSP sans module importée sans lecture DCON impossible ;
- [ ] GSP avec module continue à relire ses coefficients physiques ;
- [ ] GSP injoignable ou module sans port : import non bloqué, coefficients XML conservés et avertissement affiché ;
- [ ] FR / EN et ergonomie dialog validés.



## 16/09/2026 — Acquittement : conserver le contexte du lieu et de l’alarme

### Retour terrain

Depuis une carte Surveillance, l’utilisateur veut acquitter une alarme d’un lieu précis. La popup chargeait pourtant toutes les alarmes non acquittées accessibles, tous lieux confondus. L’analyse graphique ouvrait ensuite un écran où la liste des alarmes reprenait visuellement beaucoup de place, ce qui faisait perdre le fil « lieu → alarme ciblée ».

### Cause

- `AlarmAcknowledgeDialog` appelait `/api/alarmes/acknowledgement-candidates` sans transmettre le `locationId` de la carte Surveillance ;
- l’endpoint retournait donc jusqu’à 500 alarmes accessibles ;
- l’écran `/alarmes/analyse` filtrait déjà correctement les données par lieu, mais présentait la liste des alarmes du lieu comme navigation principale au-dessus/à côté de l’alarme ciblée.

### Correctif

- branche : `fix/alarm-acknowledgement-context` ;
- PR : à renseigner ;
- depuis Surveillance, les candidats d’acquittement sont filtrés serveur par `Id_Lieu` ;
- l’alarme focalisée est mise en avant dans un bloc principal ;
- les autres alarmes du même lieu sont placées dans une section secondaire repliée par défaut ;
- le comportement multi-lieux général reste disponible dans les contextes qui ne fournissent pas de `candidateLocationId` ;
- l’analyse graphique met le graphe/l’alarme ciblée en premier et relègue les autres alarmes du lieu dans une section repliable ;
- l’analyse sait lorsqu’elle vient de la popup d’acquittement et propose un retour explicite.

### Fichiers principaux

- `website/src/components/alarm-acknowledge-dialog/alarm-acknowledge-dialog.tsx` ;
- `website/src/components/monitoring-card.tsx` ;
- `website/src/app/api/alarmes/acknowledgement-candidates/route.ts` ;
- `website/src/app/[locale]/(dashboard)/alarmes/analyse/page-client.tsx` ;
- `website/src/messages/alarm-acknowledgement-supplements.ts` ;
- `website/scripts/test-alarm-acknowledgement-context.ts`.

### Checklist terrain

- [ ] depuis Surveillance, ouvrir l’acquittement de « Fenêtre SCO » : aucune alarme d’un autre lieu n’est chargée ;
- [ ] l’alarme cliquée est le bloc visuellement principal ;
- [ ] les autres alarmes du lieu sont repliées par défaut ;
- [ ] déplier la section, filtrer par type et sélectionner plusieurs alarmes du même lieu ;
- [ ] `Acquitter et rester` garde un focus cohérent sur la prochaine alarme du lieu ;
- [ ] `Acquitter et fermer` ferme correctement la popup ;
- [ ] ouvrir l’analyse graphique : alarme/graphe en premier, autres alarmes du lieu en retrait ;
- [ ] depuis l’analyse ouverte par la popup, utiliser « Fermer et revenir à l’acquittement » ;
- [ ] vérifier FR/EN, clair/sombre et petite largeur ;
- [ ] vérifier qu’un écran général non scoppé conserve le comportement multi-lieux autorisé.


## 17/09/2026 — Profils / Autorisations : réparer les accents corrompus

### Retour terrain

Sur une installation client, les libellés et descriptions de la page **Profils / Autorisations** pouvaient contenir du mojibake (`AccÃ¨s`, `ParamÃ©trage`, voire des variantes CP850 comme `Acc├¿s`). Les chaînes i18n du composant React sont correctes : l'écran affiche directement `t_autorisation.Libelle_Autorisation` et `t_autorisation.Commentaire`.

### Cause

Le seed SQL Server est encodé en UTF-8 mais l'installateur appelait `sqlcmd -i` sans préciser de page de codes. `sqlcmd` utilise alors la page de codes courante pour les fichiers d'entrée non Unicode, ce qui peut interpréter les octets UTF-8 comme Windows-1252/CP850 avant insertion. Le même risque concernait les autres libellés accentués du seed.

### Correctif

- branche : `fix/profile-authorization-encoding` ;
- PR : #124 ;
- `sqlcmd` force désormais UTF-8 en entrée et en sortie (`-f i:65001,o:65001`) pour le seed et le script d'événements SQL Server ;
- ajout d'un helper conservatif de réparation des mojibakes UTF-8 historiques Windows-1252 et des séquences CP850 françaises les plus courantes ;
- lors du chargement administratif des autorisations, les libellés/commentaires corrompus détectés sont réparés en base via Prisma ;
- une chaîne déjà correcte reste strictement inchangée ;
- MySQL conserve son bootstrap `--default-character-set=utf8mb4`.

### Fichiers principaux

- `Vigitemp Serveur/VigitempServerInstaller/InstallerHelpers.cs` ;
- `website/src/lib/legacy-text-encoding.ts` ;
- `website/src/lib/application-authorizations.ts` ;
- `website/src/app/api/autorisations/route.ts` ;
- `website/scripts/test-authorization-encoding.ts`.

### Checklist terrain

- [ ] installation SQL Server neuve : `Accès`, `Paramétrage`, `Étalonnage`, `Gérer` s'affichent correctement ;
- [ ] base historique contenant `AccÃ¨s` / `ParamÃ©trage` : ouvrir Profils et vérifier la réparation ;
- [ ] tester une variante CP850 (`Acc├¿s`) si disponible ;
- [ ] vérifier qu'un libellé propre n'est pas modifié ;
- [ ] vérifier que les droits associés aux profils ne changent pas ;
- [ ] vérifier MySQL et SQL Server ;
- [ ] contrôler les logs `AUTHORIZATIONS` lorsqu'une réparation est effectuée.


## 17/09/2026 — Nouveaux retours UX : batterie, duplication lieu, santé système et footer

### 1. Surveillance — indicateur visuel de batterie

**Statut : MERGE — PR #125, validation terrain à réaliser**

- branche : `feature/surveillance-battery-indicator` ;
- PR : #125 ;

Retour : les cartes Surveillance affichaient les informations batterie sous forme de texte (`Batterie : 72 %`, état GSO OK/faible, tension). Le souhait terrain est d'avoir un indicateur compact comparable aux barres RSSI.

Cible :

- une icône batterie segmentée dont le remplissage évolue avec la valeur ;
- GSP/autres sondes exposant un pourcentage : 4 niveaux, avec batterie faible à 50 % ou moins et critique à 25 % ou moins ;
- GSO exposant `Tension_Piles` : conservation des seuils historiques 2,90 V / 2,65 V ;
- batterie faible : pulsation discrète ;
- batterie critique : pulsation rapide et accent visuel rouge ;
- survol : valeur réelle (% et/ou tension) ;
- respecter `prefers-reduced-motion` ;
- conserver séparément le badge métier « fonctionnement sur batterie » d'une alarme secteur.

Principaux fichiers :

- `website/src/components/monitoring-card/battery-indicator.tsx` ;
- `website/src/components/monitoring-card.tsx` ;
- `website/scripts/test-surveillance-battery-indicator.ts`.

Checklist terrain :

- [ ] GSP 80 % : 4 segments, pas de clignotement ;
- [ ] GSP 50 % : indicateur orange, pulsation lente ;
- [ ] GSP 25 % : indicateur rouge, pulsation rapide ;
- [ ] GSO >= 2,90 V : état normal ;
- [ ] GSO entre 2,65 et 2,90 V : batterie faible ;
- [ ] GSO < 2,65 V : batterie critique ;
- [ ] le tooltip affiche la valeur reçue ;
- [ ] RSSI et batterie restent lisibles côte à côte ;
- [ ] clair/sombre + reduced motion.

### 2. Administration Lieux — duplication / création depuis un lieu existant

**Statut : MERGE — PR #126, validation terrain à réaliser**

- branche : `feature/location-config-duplication` ;
- PR : #126 ;

Deux entrées réutilisent le même helper pur de copie :

1. liste des lieux → sélectionner un lieu actif → **Dupliquer** → ouvrir le formulaire de création prérempli ;
2. formulaire de création → **Créer à partir d'un lieu existant** → ouvrir une recherche avec résumé des configurations → appliquer la source sélectionnée.

Invariants de sécurité fonctionnelle :

- `Id_Lieu` n'est jamais copié ;
- le nom du lieu source n'est jamais copié ; depuis un formulaire de création déjà commencé, le nom saisi par l'utilisateur est conservé ;
- `Sonde_Numero_Serie = null` ;
- `Id_Module = null`, car le module est lié à la sonde qui sera affectée au nouveau lieu ;
- `Lieu_Etat = D` afin que le nouveau lieu ne parte jamais directement en surveillance ;
- les identifiants des contacts mail/téléphone ne sont pas repris, seulement leur configuration utilisateur/canaux/ordre ;
- les champs runtime/historiques et résultats de dernière métrologie ne sont pas copiés ;
- les règles de planning ne sont pas des champs du formulaire de création et restent propres à chaque lieu dans ce lot.

Configuration copiée : site, groupes, observations, consignes/seuils/pré-alarmes, fréquences et temporisations, paramètres EMT applicables, état du son d'alarme et contacts de notification.

Principaux fichiers :

- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-config-copy.ts` ;
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-config-source-dialog.tsx` ;
- `website/src/app/[locale]/(admin)/admin/lieux/_components/locations-actions.tsx` ;
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx` ;
- `website/src/app/[locale]/(admin)/admin/lieux/locations-client.tsx` ;
- `website/src/messages/supplements.ts` ;
- `website/scripts/test-location-config-copy.ts`.

Checklist terrain :

- [ ] sélectionner un lieu puis cliquer **Dupliquer** : le formulaire s'ouvre avec nom vide, aucune sonde/module et surveillance désactivée ;
- [ ] vérifier que site, groupes, consignes, seuils, temporisations, observations et contacts sont bien repris ;
- [ ] depuis **Nouveau**, saisir éventuellement un nom puis utiliser **Créer à partir d'un lieu existant** : le nom saisi reste présent et la configuration choisie est appliquée ;
- [ ] rechercher un lieu par nom, site, groupe et numéro de sonde source ;
- [ ] choisir ensuite une sonde : la surveillance doit rester désactivée tant que l'utilisateur ne l'active pas explicitement ;
- [ ] enregistrer sans sonde et vérifier la confirmation existante ;
- [ ] vérifier qu'aucune donnée historique, aucun `Id_Lieu` et aucun identifiant de contact source ne sont persistés ;
- [ ] vérifier FR/EN, clair/sombre et petite largeur.

### 3. Dashboard admin — santé du système

**Statut : MERGE — PR #127, validation terrain à réaliser**

- branche : `feature/admin-system-health` ;
- PR : #127 ;
- base : `dev` au commit `a1c01f0543fee88a58fecd3f579fcb40c62b50df` (merge PR #126).

Le lot réutilise désormais une source de vérité commune pour les diagnostics techniques au lieu de conserver les checks dans la seule route Hotline :

- `collectSystemHealth()` centralise les contrôles du Web, du serveur d'interrogation et des bases principale, mesures et conversation ;
- `/api/hotline/health` conserve son contrat historique mais délègue au helper partagé ;
- `GET /api/admin/system-health` expose la vue admin avec le droit `DASHBOARD_ADMIN_ACCESS` ;
- le droit de l'API admin est contrôlé depuis les autorisations déjà signées dans la session, sans requête supplémentaire sur la base principale, afin de pouvoir diagnostiquer précisément une panne de cette base ;
- chaque dépendance est contrôlée indépendamment afin qu'une panne n'empêche pas d'afficher l'état des autres composants ;
- la base conversation est optionnelle : absente, elle est indiquée non configurée sans dégrader le système ; configurée mais indisponible, l'état global passe à **Dégradé** si les composants critiques restent disponibles ;
- une erreur sur le serveur d'interrogation, la base principale ou la base mesures produit un état **Incident** ;
- aucune clé API, mot de passe, URL de base ou chaîne de connexion n'est exposée.

Interface :

- card **Santé système** sur les Dashboard admin Basic, Standard et Expert ;
- page dédiée `/admin/sante-systeme` avec état global et détail par composant ;
- versions Web et Serveur ;
- moteur de base MySQL / SQL Server ;
- informations système non sensibles : machine, OS, architecture, Node.js, uptime Web et uptime système ;
- réutilisation de l'API de sauvegardes existante pour la dernière exécution, la rotation détectée et les chemins locaux ;
- rafraîchissement automatique toutes les 30 secondes + action manuelle ;
- textes FR/EN et rendu clair/sombre.

Principaux fichiers :

- `website/src/lib/system-health.ts` ;
- `website/src/lib/system-health-overview.ts` ;
- `website/src/types/system-health.ts` ;
- `website/src/app/api/admin/system-health/route.ts` ;
- `website/src/app/api/hotline/health/route.ts` ;
- `website/src/hooks/useSystemHealth.ts` ;
- `website/src/app/[locale]/(admin)/admin/_components/admin-system-health-card.tsx` ;
- `website/src/app/[locale]/(admin)/admin/sante-systeme/page.tsx` ;
- `website/src/messages/system-health-supplements.ts` ;
- `website/scripts/test-system-health-overview.ts` ;
- `website/docs/API_MAP.md`.

Validation technique : GitHub Actions `35224012807` ✅ — test ciblé, ESLint, TypeScript MySQL, i18n sans nouvelle dette du lot, génération + TypeScript SQL Server et build production.

Checklist terrain :

- [ ] vérifier la card Santé système sur les éditions Basic, Standard et Expert ;
- [ ] ouvrir `/admin/sante-systeme` et contrôler Web, serveur, bases principale/mesures/chat ;
- [ ] confirmer les versions Web et Serveur ;
- [ ] arrêter temporairement le serveur d'interrogation et vérifier l'état Incident ;
- [ ] sur un environnement de test, simuler si possible l'indisponibilité de la base principale puis de la base mesures et vérifier que les autres diagnostics restent visibles ;
- [ ] sans `DATABASE_CHAT_URL`, vérifier que la base conversation est indiquée non configurée sans dégrader l'état global ;
- [ ] avec une base conversation configurée mais indisponible, vérifier l'état Dégradé ;
- [ ] vérifier machine, OS, architecture, Node.js et uptimes ;
- [ ] vérifier la dernière sauvegarde, le nombre d'archives et les chemins affichés ;
- [ ] tester le bouton Actualiser et le rafraîchissement automatique ;
- [ ] vérifier FR/EN, clair/sombre et petite largeur ;
- [ ] vérifier qu'un profil sans `DASHBOARD_ADMIN_ACCESS` ne peut pas ouvrir la page ni appeler l'API ;
- [ ] vérifier `/api/hotline/health` en non-régression depuis la Hotline.

### 4. Santé système — audit des emails

**Statut : PR_OUVERTE — PR #129, validation terrain à réaliser**

- branche : `feature/system-health-email-audit` ;
- PR : #129 ;
- base : `dev` au commit `8cb869180e6faf59fbde376f62bb285b8f325ce7` (merge PR #128).

La page `/admin/sante-systeme` est complétée par une section **Audit des emails** permettant de vérifier les envois réellement effectués par VigiSensys, en complément de la card Mailing qui indique surtout l'état de configuration SMTP.

Architecture retenue :

- réutilisation de `t_notification`, sans migration de schéma ;
- les emails d'alarme conservent leur file persistante historique `ALARM_EMAIL` comme source d'audit ;
- les autres appels à `sendEmail()` créent une entrée `SYSTEM_EMAIL_AUDIT` ;
- l'audit est best-effort : une panne d'écriture de l'audit ne fait jamais échouer un email SMTP déjà envoyé ;
- les 50 derniers événements sont exposés via `GET /api/admin/email-audit?limit=50` avec `DASHBOARD_ADMIN_ACCESS` ;
- la limite API est bornée de 1 à 100 et la requête Prisma utilise un `select` minimal ;
- aucun corps HTML, pièce jointe, token de réinitialisation, mot de passe ou secret SMTP n'est conservé.

Informations affichées :

- date / heure ;
- type fonctionnel de mail ;
- lieu / contexte et identifiant d'alarme lorsqu'ils existent ;
- destinataire(s) et CC ;
- sujet ;
- état : en attente, envoi en cours, envoyé, échec, non envoyé ou inconnu ;
- nombre de tentatives ;
- dernière erreur courte éventuelle.

Types identifiés actuellement :

- alarme déclenchée ;
- fin d'alarme ;
- acquittement d'alarme ;
- réinitialisation du mot de passe ;
- création de compte ;
- test SMTP ;
- rapport mensuel ;
- demande de matériel ;
- type générique pour les futurs appels non encore catégorisés.

Point de fiabilité découvert pendant le lot :

- l'acquittement d'une alarme supprimait auparavant toutes les lignes `t_notification` liées par `Id_Alarme`, donc également l'historique et les retries `ALARM_EMAIL` ;
- l'email d'acquittement est créé après suppression de `t_alarme`, alors que la queue renseignait encore cette FK, ce qui pouvait empêcher sa mise en file ;
- les nouvelles lignes `ALARM_EMAIL` conservent maintenant la corrélation alarme dans leur payload mais utilisent `Id_Alarme = null` ;
- lors d'un acquittement, les anciennes lignes `ALARM_EMAIL` encore rattachées par FK sont détachées avant le nettoyage des autres notifications runtime ;
- la déduplication, les retries et le comportement métier existants de la queue restent inchangés.

Les dates de l'audit réutilisent `serializeStoredDbDateTime` puis le helper canonique d'affichage afin de préserver les composantes des `DATETIME` sans introduire de décalage UTC/local.

Principaux fichiers :

- `website/src/app/[locale]/(admin)/admin/sante-systeme/page.tsx` ;
- `website/src/app/api/admin/email-audit/route.ts` ;
- `website/src/lib/email-audit.ts` ;
- `website/src/lib/email-audit-payload.ts` ;
- `website/src/types/email-audit.ts` ;
- `website/src/lib/email.ts` ;
- `website/src/lib/alarm-email.ts` ;
- `website/src/app/api/alarmes/[id]/acknowledge/route.ts` ;
- `website/src/hooks/useSystemHealth.ts` ;
- `website/src/lib/dashboard-admin-access.ts` ;
- `website/src/messages/system-health-supplements.ts` ;
- `website/scripts/test-email-audit.ts` ;
- `website/docs/API_MAP.md`.

Validation technique : GitHub Actions `35320825236` ✅ — `git diff --check`, test ciblé, ESLint, TypeScript MySQL, i18n sans nouvelle dette du lot, génération + TypeScript SQL Server et build production.

Checklist terrain :

- [ ] envoyer un test SMTP et vérifier une ligne **Test SMTP / Envoyé** ;
- [ ] provoquer un échec SMTP en environnement de test et vérifier état, nombre de tentatives et erreur ;
- [ ] demander une réinitialisation de mot de passe et vérifier le type sans exposition du token ;
- [ ] créer un utilisateur avec email et vérifier **Création de compte** ;
- [ ] vérifier un rapport mensuel et une demande de matériel lorsque ces parcours sont disponibles ;
- [ ] déclencher puis terminer une alarme et vérifier les événements correspondants avec le lieu ;
- [ ] acquitter une alarme et vérifier que les événements précédents restent présents puis que l'email d'acquittement est historisé ;
- [ ] tester si possible un email d'alarme en échec et vérifier l'évolution des retries / tentatives ;
- [ ] contrôler la réponse de `/api/admin/email-audit` : aucun contenu de mail, token, mot de passe ou secret SMTP ;
- [ ] vérifier le bouton **Actualiser** et le rafraîchissement automatique ;
- [ ] vérifier FR/EN, clair/sombre et petite largeur ;
- [ ] vérifier qu'un profil sans `DASHBOARD_ADMIN_ACCESS` ne peut pas lire l'API ;
- [ ] valider le parcours sur MySQL et SQL Server.

### 5. Footer / cookies / RGPD

**Statut : DEJA_FAIT — PR #122.**

Le footer courant affiche déjà `Mentions légales`, `Protection des données` et `Cookies techniques uniquement`. La page Protection des données indique que VigiSensys fonctionne on-premise, sans télémétrie/analytics/publicité, que les données restent dans l'infrastructure du client et ne sont pas transmises automatiquement à MC2, et que les cookies/stockages sont limités à la session/authentification, sécurité, langue/thème/préférences et états locaux nécessaires. Aucun nouveau bandeau cookies n'est requis tant qu'aucun traceur non essentiel n'est ajouté.
