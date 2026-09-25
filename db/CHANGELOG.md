# Changelog — VigiSensys Base de données / seeds

Ce fichier décrit les évolutions propres aux scripts de base de données, seeds et artefacts de schéma VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Le numéro indiqué ici correspond à la révision VigiSensys du bootstrap/seed. Il ne s'agit pas de la version du moteur MySQL ou SQL Server.

## Règle de maintenance des évolutions BDD

À partir de la révision `0.90.2`, toute modification de schéma doit être documentée ici avec les objets réellement modifiés.

Pour chaque version BDD :

- les seeds MySQL et SQL Server doivent rester à jour pour les nouvelles installations ;
- les installations existantes doivent disposer des scripts `db/migrations/<version>/mysql.sql` et `db/migrations/<version>/mssql.sql` ;
- le changelog doit citer explicitement chaque table et chaque colonne ajoutée, modifiée ou supprimée ;
- pour une colonne ajoutée à une table existante, préciser au minimum le type par moteur, la nullabilité et la valeur par défaut ;
- pour une nouvelle table, lister toutes les colonnes créées ;
- `SCHEMA_VERSION` ne doit être mis à jour par une migration qu'après les modifications de schéma de la version concernée.

La procédure complète d'upgrade des installations existantes est documentée dans [`migrations/README.md`](migrations/README.md).

## [Unreleased]

Aucun changement supplémentaire documenté depuis la préparation du schéma 0.91.2.

## [0.91.2] — 2026-09-25

Cette révision ajoute les codes d'alarme critiques explicites `CB` / `CH`.

### Colonnes `Type`

Les trois colonnes suivantes passent de **VARCHAR(1)** à **VARCHAR(2)**, restent `NULL` et ne reçoivent aucune nouvelle valeur par défaut :

- `t_alarme.Type` ;
- `t_alarme_histo.Type` ;
- `t_alarme_message.Type`.

> Le retour terrain mentionnait `t_alarme_message_histo`. Cette table n'existe pas dans le schéma courant ; l'historique des alarmes est porté par `t_alarme_histo`.

### Messages critiques

Deux entrées sont ajoutées / mises à jour dans `t_alarme_message` :

- `20 / CRITIQUE_BAS / CB` — « L'alarme a été déclenchée par un dépassement du seuil critique inférieur. »
- `21 / CRITIQUE_HAUT / CH` — « L'alarme a été déclenchée par un dépassement du seuil critique supérieur. »

### Trigger GSO

- `TRG_GSO_BEF_UPD_LIEU_ALARME` reste **inchangé par rapport à 0.91.1**.
- La migration 0.91.2 ne recrée pas ce trigger et ne réintroduit pas l'évaluation directe des seuils critiques supprimée en 0.91.1.
- Les GSO conservent donc leurs alarmes B/H temporisées historiques.

### Seeds / migrations

- Seed MySQL : version **0.91.2**, largeur des trois colonnes + messages 20/21.
- Seed SQL Server : même contrat.
- Migration MySQL : `db/migrations/0.91.2/mysql.sql`.
- Migration SQL Server : `db/migrations/0.91.2/mssql.sql`.
- `VERSION / SCHEMA_VERSION` passe à `0.91.2` uniquement après les modifications.

## [0.91.1] — 2026-09-23

Cette révision aligne le seed SQL Server sur les modifications déjà appliquées au seed MySQL et formalise leur migration pour les installations existantes.

### `t_lieu_template` — types numériques

Les neuf colonnes suivantes passent de `DECIMAL(10,2)` à `FLOAT` dans les deux moteurs :

- `Consigne` ;
- `Consigne_Sup` ;
- `Consigne_Inf` ;
- `Tolerance_Surveillance_Sup` ;
- `Tolerance_Surveillance_Inf` ;
- `Consigne_Sup_Pre_Alarme` ;
- `Consigne_Inf_Pre_Alarme` ;
- `Seuil_Critique_Haut` ;
- `Seuil_Critique_Bas`.

La nullabilité reste `NULL` et aucune valeur par défaut métier n'est ajoutée.

### Trigger GSO

Le trigger `TRG_GSO_BEF_UPD_LIEU_ALARME` n'évalue plus directement les seuils critiques `Seuil_Critique_Bas` / `Seuil_Critique_Haut`.

Les variables, colonnes de curseur et branches de déclenchement immédiat correspondantes sont retirées du seed SQL Server afin de reproduire le comportement du seed MySQL courant.

La logique historique restante est conservée : alarmes basse/haute temporisées, non-réponse, transitions, fins d'alarme et pré-alarmes.

### Seeds / migrations

- MySQL seed : version portée à **0.91.1** ; les changements métier préexistaient déjà dans le fichier.
- SQL Server seed : types `FLOAT` + trigger GSO alignée + version **0.91.1**.
- Migration MySQL : `db/migrations/0.91.1/mysql.sql`.
- Migration SQL Server : `db/migrations/0.91.1/mssql.sql`.
- Les deux migrations mettent `VERSION / SCHEMA_VERSION` à `0.91.1` uniquement après les modifications.

## [0.91.0] — 2026-09-21

Cette révision ajoute les seuils critiques de lieu utilisés par le Web 1.2.0 et le Serveur 1.1.0. Les seeds MySQL / SQL Server et les migrations d'installations existantes restent alignés.

### Colonnes ajoutées

| Table | Colonne | MySQL | SQL Server | Nullabilité / défaut | Rôle |
| --- | --- | --- | --- | --- | --- |
| `t_lieu` | `Seuil_Critique_Haut` | `float` | `FLOAT` | NULL, défaut NULL | valeur au-dessus de laquelle l'alarme haute doit partir immédiatement |
| `t_lieu` | `Est_Seuil_Critique_Haut_Active` | `tinyint(1)` | `BIT` | NOT NULL, défaut `0` | active le seuil critique haut |
| `t_lieu` | `Seuil_Critique_Bas` | `float` | `FLOAT` | NULL, défaut NULL | valeur au-dessous de laquelle l'alarme basse doit partir immédiatement |
| `t_lieu` | `Est_Seuil_Critique_Bas_Active` | `tinyint(1)` | `BIT` | NOT NULL, défaut `0` | active le seuil critique bas |
| `t_lieu_template` | `Seuil_Critique_Haut` | `decimal(10,2)` | `DECIMAL(10,2)` | NULL, défaut NULL | seuil critique haut recopiable depuis un template |
| `t_lieu_template` | `Seuil_Critique_Bas` | `decimal(10,2)` | `DECIMAL(10,2)` | NULL, défaut NULL | seuil critique bas recopiable depuis un template |
| `t_lieu_template` | `Est_Seuil_Critique_Haut_Active` | `tinyint(1)` | `BIT` | NOT NULL, défaut `0` | activation du seuil critique haut dans le template |
| `t_lieu_template` | `Est_Seuil_Critique_Bas_Active` | `tinyint(1)` | `BIT` | NOT NULL, défaut `0` | activation du seuil critique bas dans le template |

### Alarmes GSO

- Le trigger historique `TRG_GSO_BEF_UPD_LIEU_ALARME` est remplacé sur MySQL et SQL Server afin d'évaluer les nouveaux seuils critiques avant la logique de retard d'alarme normale.
- Un franchissement critique crée ou transitionne immédiatement vers une alarme `B` / `H` datée de la mesure courante.
- Le type d'alarme historique reste donc compatible : aucun nouveau code d'alarme n'est introduit.
- La logique normale, les pré-alarmes et les retards existants restent inchangés hors franchissement critique.

### Migration des installations existantes

- MySQL : `db/migrations/0.91.0/mysql.sql`.
- SQL Server : `db/migrations/0.91.0/mssql.sql`.
- Les scripts ajoutent les huit colonnes de manière conditionnelle, réinstallent le trigger GSO adapté puis mettent `VERSION / SCHEMA_VERSION` à `0.91.0`.
- Le marqueur de version n'est mis à jour qu'après application des objets nécessaires à la fonctionnalité.
- Les migrations `0.90.2` puis `0.91.0` doivent être exécutées dans l'ordre lorsqu'une base part d'une révision antérieure.

### Données initiales

- Le paramètre `SECURITE_EMAIL:SMTP_CONFIRME=false`, ajouté après le schéma 0.90.2 pour les nouvelles installations, est conservé dans les seeds 0.91.0.
- Les installations historiques sans ce paramètre conservent le mécanisme de compatibilité Web existant ; aucune colonne SMTP supplémentaire n'est ajoutée par 0.91.0.

## [0.90.2] — 2026-09-18

Cette révision est le schéma / bootstrap de référence de la livraison produit **VigiSensys 1.0.0**. Le numéro BDD reste indépendant de la version Web/Serveur et n'est pas artificiellement porté à `1.0.0`.


### Objets et colonnes ajoutés — schéma 0.90.2

| Table | Évolution | Colonnes ajoutées / définition |
| --- | --- | --- |
| `t_ajustage` | Colonne ajoutée | `Coeffs_Modifies_Depuis_Derniere_Mesure` — MySQL `tinyint(1) NOT NULL DEFAULT 0` ; SQL Server `bit NOT NULL DEFAULT 0` |
| `t_auth_user` | Nouvelle table | `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`, `username`, `displayUsername`, `vigisensysUserId` |
| `t_auth_session` | Nouvelle table | `id`, `expiresAt`, `token`, `createdAt`, `updatedAt`, `ipAddress`, `userAgent`, `userId` |
| `t_auth_account` | Nouvelle table | `id`, `accountId`, `providerId`, `userId`, `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password`, `createdAt`, `updatedAt` |
| `t_auth_verification` | Nouvelle table | `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt` |

Les quatre tables `t_auth_*` sont uniquement préparatoires dans cette version : Better Auth n'est pas réactivé dans le runtime.

### Préparation Better Auth / release 0.90.2

- Alignement du marqueur `SCHEMA_VERSION` et des en-têtes des seeds MySQL / SQL Server sur `0.90.2`, version applicative courante.
- Ajout dans les deux seeds des tables finales de préparation Better Auth : `t_auth_user`, `t_auth_session`, `t_auth_account` et `t_auth_verification`.
- Le schéma reprend les champs validés lors du PoC BA-1 (Better Auth `1.7.2`), notamment `username`, `displayUsername` et le mapping métier `vigisensysUserId` vers `t_utilisateur`.
- Aucun objet temporaire `t_auth_poc_*` n'est introduit dans les seeds client.
- Aucun compte Better Auth n'est provisionné par le seed et aucun runtime Better Auth n'est réactivé : l'authentification legacy reste la seule authentification active dans ce lot.
- MySQL matérialise les relations Better Auth avec les clés étrangères adaptées ; SQL Server conserve la convention du seed existant qui ne matérialise pas les FK MySQL afin d'éviter les chemins de cascade incompatibles.
- La colonne métrologie `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure`, déjà présente dans les deux seeds avant ce lot de release readiness, a été vérifiée et conservée sans duplication.

### Migrations d'installations existantes

Le dossier `db/migrations/` devient la source de vérité pour les mises à niveau de bases déjà installées.

Pour passer d'une base `0.90.1` à `0.90.2` :

- MySQL : `db/migrations/0.90.2/mysql.sql` ;
- SQL Server : `db/migrations/0.90.2/mssql.sql`.

Ces scripts regroupent l'ensemble des changements de schéma `0.90.2` : colonne métrologie, tables préparatoires Better Auth et mise à jour finale de `SCHEMA_VERSION`.

### Qualité des données de seed

- Harmonisation des libellés, descriptions et commentaires humains des seeds MySQL et SQL Server avec les accents français attendus, sans modifier les clés techniques, codes d’autorisation, noms de colonnes ou identifiants de paramètres.
- Correction d’artefacts historiques confirmés : `Sonde talon` → `Sonde étalon`, `avec pris RJ45` → `avec prise RJ45` et `COCO2` → `CO2`.
- Audit explicite des anciens placeholders `%1`, `%2`, `%3` et des mojibakes (`Ã`, `Â`, `�`) : aucun de ces artefacts n’est présent dans les seeds actuels.
- Normalisation du marqueur de version des deux seeds de `0.90.001` vers la notation SemVer canonique `0.90.1`, sans changement de schéma.

### Métrologie

- Ajout de la migration BDD `0.90.2` pour la colonne `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure`.
- La colonne est un booléen non nul, à `0` par défaut, disponible en MySQL et SQL Server.
- Ce drapeau devient la source de synchronisation des coefficients A/B/C des parcours Ajustage / Étalonnage, y compris lorsqu'une sonde n'est affectée à aucun `t_lieu`.
- `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` reste réservé au mécanisme normal de configuration de Surveillance.
- Les scripts de migration sont idempotents autant que raisonnablement possible et doivent être appliqués avant d'utiliser la nouvelle synchronisation des coefficients.

### Références

- `db/migrations/README.md`
- `db/migrations/0.90.2/mysql.sql`
- `db/migrations/0.90.2/mssql.sql`

### Types et données initiales

- Les seeds MySQL et SQL Server incluent les éléments nécessaires au support des étalons SEF utilisés par les workflows de métrologie / Hotline.
- Les valeurs initiales restent alignées entre les deux moteurs lorsque le modèle fonctionnel est commun.
- Les libellés français ont été nettoyés sans modifier les codes techniques ni les identifiants métier.

### Installation / encodage SQL Server

- L'installateur Serveur exécute les seeds SQL Server en UTF-8 explicite avec `sqlcmd -f i:65001,o:65001`.
- Cette fiabilisation ne modifie pas le schéma mais évite les mojibakes des libellés accentués sur les nouvelles installations.
- Les bases historiques peuvent être réparées côté application pour les chaînes d'autorisation reconnues comme corrompues, sans réécriture des textes déjà corrects.

### Better Auth

- Les tables `t_auth_user`, `t_auth_session`, `t_auth_account` et `t_auth_verification` restent préparatoires et compatibles avec l'activation opt-in du runtime Better Auth.
- Leur présence dans le schéma `0.90.2` n'active aucune authentification supplémentaire à elle seule.

### Compatibilité VigiSensys 1.0.0

- Web `1.0.0` et Serveur `1.0.0` utilisent cette révision de schéma comme baseline de la livraison.
- Les migrations `db/migrations/0.90.2/mysql.sql` et `db/migrations/0.90.2/mssql.sql` restent la voie d'upgrade des installations existantes antérieures à `0.90.2`.
- Aucun bump de `SCHEMA_VERSION` n'est effectué uniquement pour aligner visuellement le numéro avec la release produit.

### PR principales

- #67 — colonne / flux de synchronisation des coefficients métrologie.
- #76 — nettoyage des libellés et artefacts des seeds.
- #90 — préparation des seeds `0.90.2` et tables Better Auth.
- #92 — formalisation des migrations d'installations existantes.
- #101 — fondation Better Auth opt-in utilisant les tables préparées.
- #110 — données de seed liées au support SEF.
- #124 — fiabilisation UTF-8 de l'application des scripts SQL Server.

## [0.90.1] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée des seeds. Elle ne reconstitue pas exhaustivement l'historique de toutes les anciennes bases.

### Versioning

- La notation canonique retenue est `0.90.1`.
- Les fichiers de seed historiques utilisaient le libellé `0.90.001`; depuis le nettoyage du 31/08/2026, les deux seeds utilisent directement la notation SemVer canonique `0.90.1`.
- Cette normalisation du marqueur ne modifie ni le schéma ni la compatibilité de la baseline `0.90.1`.

### MySQL / SQL Server

- Les seeds MySQL et SQL Server ont été rapprochés afin de conserver une base fonctionnelle cohérente entre les deux moteurs.
- Les paramètres initiaux ont été nettoyés pour correspondre à la base de référence, en conservant hors seed les valeurs de licence propres à chaque installation.
- Les objets SQL Server nécessaires aux traitements GSO, métrologie et historiques ont été alignés avec leurs équivalents MySQL lorsque nécessaire.

### Compatibilité

- Les correctifs GSP Serveur `0.90.2` et `0.90.3` du 27/08/2026 ne nécessitent aucune migration de schéma.
- Une proximité de numéro entre seed et application ne constitue pas une garantie de compatibilité : toute migration future devra être décrite explicitement dans cette section et dans le changelog produit.

### PR principales

- #44 — parité MSSQL et seed SQL Server.
- #47 — nettoyage des paramètres et profils des seeds.
- #60 — formalisation du versioning SemVer.

### Validation / références

- `db/vigisensys_seed.sql`
- `db/vigisensys_seed_mssql.sql`
- `db/vigisensys_verify_mssql_objects.sql`
