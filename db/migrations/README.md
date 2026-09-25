# Migrations des installations VigiSensys existantes

Ce dossier contient les scripts SQL à exécuter lorsqu'une installation VigiSensys **existe déjà** et doit être mise à niveau sans rejouer les seeds complets.

Les seeds `db/vigisensys_seed.sql` et `db/vigisensys_seed_mssql.sql` restent réservés aux **nouvelles installations / bases vierges**. Ils ne doivent pas être exécutés sur une base client existante.

## Arborescence

Chaque révision de schéma possède un dossier dédié :

```text
db/migrations/
  README.md
  0.90.2/
    mysql.sql
    mssql.sql
  0.91.0/
    mysql.sql
    mssql.sql
  0.91.1/
    mysql.sql
    mssql.sql
  0.91.2/
    mysql.sql
    mssql.sql
  <version-suivante>/
    mysql.sql
    mssql.sql
```

Le dossier porte la **version de schéma cible**. Les fichiers d'une version regroupent toutes les évolutions BDD nécessaires pour passer de la version publiée précédente à cette version.

## Procédure de mise à niveau d'une installation

1. Sauvegarder les bases client avant toute migration.
2. Lire la version actuelle dans `vigi_main.t_parametre` avec :
   - `Section = VERSION` ;
   - `Mot_Cle = SCHEMA_VERSION`.
3. Arrêter, lorsque la migration le nécessite, les services/processus VigiSensys qui écrivent dans les tables concernées.
4. Exécuter **dans l'ordre croissant des versions** tous les scripts manquants du moteur utilisé par le client.
5. Vérifier que `SCHEMA_VERSION` correspond à la dernière migration appliquée.
6. Redémarrer les composants VigiSensys et réaliser les validations fonctionnelles du lot.

Exemple : une installation en `0.90.1` qui doit passer en `0.90.3` exécute d'abord `0.90.2/<moteur>.sql`, puis `0.90.3/<moteur>.sql`.

## Règles obligatoires pour toute future évolution BDD

Toute modification de schéma livrée doit mettre à jour **ensemble** :

1. le seed MySQL pour les nouvelles installations ;
2. le seed SQL Server pour les nouvelles installations ;
3. `db/migrations/<version>/mysql.sql` pour les installations MySQL existantes ;
4. `db/migrations/<version>/mssql.sql` pour les installations SQL Server existantes ;
5. `db/CHANGELOG.md` avec la liste explicite des tables et **colonnes ajoutées, modifiées ou supprimées**.

Le changelog doit au minimum préciser, pour une colonne ajoutée à une table existante :

- table ;
- nom exact de la colonne ;
- type MySQL ;
- type SQL Server ;
- nullabilité ;
- valeur par défaut ;
- rôle fonctionnel.

Lorsqu'une table complète est ajoutée, le changelog doit lister toutes ses colonnes.

## Contraintes des scripts

- préserver les données client ;
- ne jamais contenir de `DROP DATABASE`, de recréation globale des tables métier ou de rechargement du seed ;
- être idempotents autant que raisonnablement possible afin qu'une relance après interruption n'ajoute pas deux fois le même objet ;
- conserver la compatibilité MySQL / SQL Server ;
- mettre à jour `VERSION / SCHEMA_VERSION` **à la fin** du script, après les modifications de schéma ;
- ne pas masquer silencieusement une erreur de migration ;
- rester lisibles et limités aux changements nécessaires à la version cible.

Les migrations ne remplacent pas les backups ni les validations terrain. Elles évitent en revanche les vérifications et `ALTER TABLE` manuels sur chaque installation existante.

## Baseline et dernière révision

La première migration formalisée dans cette arborescence est `0.90.2`. Elle couvre :

- `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` ;
- les quatre tables de préparation Better Auth `t_auth_user`, `t_auth_session`, `t_auth_account`, `t_auth_verification` ;
- le passage de `SCHEMA_VERSION` à `0.90.2`.

Better Auth reste désactivé dans le runtime de cette version : ces tables sont uniquement préparées pour la trajectoire de migration future.

La révision `0.91.0` ajoute :

- `t_lieu.Seuil_Critique_Haut` / `Est_Seuil_Critique_Haut_Active` ;
- `t_lieu.Seuil_Critique_Bas` / `Est_Seuil_Critique_Bas_Active` ;
- les quatre champs correspondants dans `t_lieu_template` ;
- la mise à jour initiale du trigger GSO `TRG_GSO_BEF_UPD_LIEU_ALARME` ;
- le passage de `SCHEMA_VERSION` à `0.91.0`.

La révision `0.91.1` :

- convertit en `FLOAT` les neuf champs numériques de consigne/tolérance/pré-alarme/seuil critique de `t_lieu_template` ;
- réaligne `TRG_GSO_BEF_UPD_LIEU_ALARME` sur le comportement courant sans traitement direct des seuils critiques ;
- porte `SCHEMA_VERSION` à `0.91.1`.

La dernière révision de schéma est `0.91.2`. Elle :

- élargit `t_alarme.Type`, `t_alarme_histo.Type` et `t_alarme_message.Type` à deux caractères ;
- ajoute les messages `CRITIQUE_BAS / CB` et `CRITIQUE_HAUT / CH` ;
- conserve le trigger GSO de 0.91.1 sans modification ;
- porte `SCHEMA_VERSION` à `0.91.2`.

Une installation en `0.91.1` exécute uniquement `0.91.2/<moteur>.sql`. Une installation plus ancienne exécute toutes les révisions manquantes dans l'ordre.
