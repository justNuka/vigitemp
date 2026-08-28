# Changelog — VigiSensys Base de données / seeds

Ce fichier décrit les évolutions propres aux scripts de base de données, seeds et artefacts de schéma VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Le numéro indiqué ici correspond à la révision VigiSensys du bootstrap/seed. Il ne s'agit pas de la version du moteur MySQL ou SQL Server.

## [Unreleased]

### Métrologie

- Ajout de la migration BDD `0.90.2` pour la colonne `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure`.
- La colonne est un booléen non nul, à `0` par défaut, disponible en MySQL et SQL Server.
- Ce drapeau devient la source de synchronisation des coefficients A/B/C des parcours Ajustage / Étalonnage, y compris lorsqu'une sonde n'est affectée à aucun `t_lieu`.
- `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` reste réservé au mécanisme normal de configuration de Surveillance.
- Les scripts de migration sont idempotents et doivent être appliqués avant d'utiliser la nouvelle synchronisation des coefficients.

### Références

- `db/migrations/0.90.2_metrology_adjustment_coeff_dirty_mysql.sql`
- `db/migrations/0.90.2_metrology_adjustment_coeff_dirty_mssql.sql`

## [0.90.1] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée des seeds. Elle ne reconstitue pas exhaustivement l'historique de toutes les anciennes bases.

### Versioning

- La notation canonique retenue est `0.90.1`.
- Les fichiers de seed existants peuvent encore contenir le libellé historique `0.90.001`; cette écriture correspond à la même version selon la nouvelle convention sans zéros de tête.
- Lors de la prochaine modification/régénération des seeds, le marqueur de version devra utiliser directement la notation SemVer canonique.

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
