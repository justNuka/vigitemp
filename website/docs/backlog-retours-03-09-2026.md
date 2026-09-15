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

## Idée — cards de services sur le Dashboard admin

**Statut : `A_FAIRE` — idée UI à planifier**

Ajouter sur le Dashboard admin des cards synthétiques pour les services optionnels/configurables, en commençant par :

- **Mailing** : état activé/désactivé, configuration SMTP disponible, accès rapide aux paramètres de mailing ; ne jamais afficher de secret dans la card.
- **Téléphonie** : état activé/désactivé, provider configuré lorsque pertinent, accès rapide aux paramètres de téléphonie.

Pour la Téléphonie, respecter le contrat de licence : si l'option `telephonie` n'est pas présente, la card peut rester visible afin de montrer la fonctionnalité disponible dans VigiSensys, mais doit utiliser le même principe de verrouillage visuel que les paramètres (voile/flou progressif + message de fonctionnalité non disponible avec la licence) et ne proposer aucune action utilisable.

Prévoir si possible un composant de card générique/réutilisable pour pouvoir ajouter plus tard d'autres services sans dupliquer la structure du Dashboard admin.

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

