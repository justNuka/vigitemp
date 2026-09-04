# Métrologie — synchronisation des coefficients via `t_ajustage` — 28/08/2026

## Statut

`PR_OUVERTE` — branche `agent/metrology-adjustment-coeff-dirty` — PR #67.

## Contexte

Le travail avait été préparé dans l'ancienne branche `agent/metrology-adjustment-dirty-fast-cleanup`, mais cette branche n'a jamais fait l'objet d'une PR et a divergé de `dev`.

Le prototype utilisait le nom `Coeffs_Modifiees_Depuis_Derniere_Mesure`. Le nom retenu et à utiliser partout est désormais :

`Coeffs_Modifies_Depuis_Derniere_Mesure`

## Problème

Les coefficients A/B/C sont stockés dans `t_ajustage`, alors que le signal historique indiquant une configuration à renvoyer à la sonde est `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure`.

Ce couplage ne fonctionne pas pour une sonde réservée à la métrologie et volontairement non affectée à un lieu, notamment le cas des SPCO utilisées pour l'Ajustage.

## Correctif

### BDD

Ajout de la colonne :

` t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure `

Type : booléen non nul, valeur par défaut `0`.

Migration `0.90.2` des installations existantes :

- MySQL : `db/migrations/0.90.2/mysql.sql` ;
- SQL Server : `db/migrations/0.90.2/mssql.sql`.

Ces scripts sont les scripts d'upgrade complets de la révision BDD `0.90.2` et incluent donc également les autres objets de schéma ajoutés par cette version. La migration doit être appliquée avant de valider de nouveaux coefficients avec ce lot.

### Web

Lors d'une validation A/B/C en Ajustage ou en prévisualisation d'Étalonnage :

1. le Web vérifie que la colonne BDD existe ;
2. les coefficients sont enregistrés dans `t_ajustage` selon le mapping A/B/C déjà existant ;
3. la dernière ligne `t_ajustage` de chaque sonde est marquée avec `Coeffs_Modifies_Depuis_Derniere_Mesure = 1`.

Le schéma Prisma préparé injecte temporairement le champ dans `t_ajustage` afin qu'un `prisma db push` réalisé depuis les schémas générés ne tente pas de supprimer la colonne avant la prochaine régénération complète du schéma source.

Le dirty flag historique de `t_lieu` n'est pas remis arbitrairement à `0` par ce correctif : il peut contenir une modification indépendante appartenant à la Surveillance.

### Serveur

`DatabaseFactory` enveloppe le provider MySQL / SQL Server dans `MetrologyDatabaseProvider`.

Pour `getSondeMetrologyBySerialNumber` :

- le Serveur charge le dernier `t_ajustage` de la sonde ;
- il lit A/B/C et `Coeffs_Modifies_Depuis_Derniere_Mesure` sur cette même ligne ;
- le fonctionnement reste possible si aucun `t_lieu` n'existe ;
- le mécanisme existant de `HotlineApiServer` envoie les coefficients par `ECON` lorsqu'ils sont marqués modifiés ;
- après acquittement réussi, le dirty flag de la ligne `t_ajustage` est remis à `0` ;
- si l'envoi échoue, le mécanisme existant restaure le dirty flag à `1`.

Le chemin Surveillance continue d'utiliser son provider historique et `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure`.

Si le Serveur est démarré avant application de la migration, le décorateur retombe sur le provider historique au lieu de neutraliser les paramètres métrologiques.

## Fichiers principaux

### BDD

- `db/migrations/0.90.2/mysql.sql`
- `db/migrations/0.90.2/mssql.sql`
- `db/migrations/README.md`
- `db/CHANGELOG.md`

### Web

- `website/src/lib/metrology-adjustment-coefficient-dirty.ts`
- `website/src/app/api/metrologie/ajustage/session/route.ts`
- `website/src/app/api/metrologie/etalonnage/coefficients/route.ts`
- `website/scripts/prepare-prisma-provider.ts`

### Serveur

- `Vigitemp Serveur/Vigitemp Serveur/MetrologyDatabaseProvider.cs`
- `Vigitemp Serveur/Vigitemp Serveur/DatabaseFactory.cs`
- `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.csproj`

## Checklist de validation

### Migration

- [ ] appliquer la migration MySQL sur une base de test ;
- [ ] vérifier la présence exacte de `Coeffs_Modifies_Depuis_Derniere_Mesure` ;
- [ ] rejouer la migration et vérifier son idempotence ;
- [ ] effectuer le même contrôle sur SQL Server.

### Ajustage sans lieu

- [ ] sélectionner une sonde SPCO sans `t_lieu` ;
- [ ] modifier A/B/C et valider ;
- [ ] vérifier la création/enregistrement du `t_ajustage` ;
- [ ] vérifier que `Coeffs_Modifies_Depuis_Derniere_Mesure` passe à `1` ;
- [ ] vérifier que le Serveur envoie les coefficients à la prochaine interrogation ;
- [ ] vérifier l'ACK `ECON` ;
- [ ] vérifier que le flag repasse à `0` après succès.

### Avec lieu / non-régression

- [ ] répéter le test sur une sonde affectée à un lieu ;
- [ ] vérifier que la Surveillance continue de consommer son propre flag `t_lieu` normalement ;
- [ ] vérifier qu'une modification Surveillance indépendante n'est pas effacée par une validation de coefficients ;
- [ ] vérifier qu'un échec `ECON` conserve le flag `t_ajustage` à `1` ;
- [ ] vérifier Ajustage puis Étalonnage avec coefficients linéaires et quadratiques ;
- [ ] build Web ;
- [ ] build Serveur Windows.
