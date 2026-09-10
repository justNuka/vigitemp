# Import des ajustages — adresse des sondes GSO

Date : 10/09/2026

## Contexte

Lorsqu'un fichier d'ajustage crée ou met à jour automatiquement une sonde GemSense One (GSO), `Adresse_Sonde` doit représenter uniquement l'adresse physique de la sonde, sans le préfixe de type (`SOIT`, `SOET`, `SOIH`, `SOEH`).

Le numéro de série métier reste inchangé par ce correctif.

Exemple confirmé :

- numéro de série : `SOIT-10007193` ;
- adresse sonde attendue : `10007193` ;
- ancienne adresse issue de la règle B20-002 : `10007193-T`.

Pour une adresse qui porte réellement un canal `-T` ou `-H`, le suffixe doit être conservé dans `Adresse_Sonde`, mais jamais le préfixe de type. Exemples : `10007193-T`, `10007193-H`.

## Cause

La normalisation des imports est centralisée dans `website/src/lib/sensor-naming.ts`, via `buildImportedSensorStorageIdentity()`.

La règle historique introduite pour B20-002 ajoutait systématiquement `-T` aux GSO simples température (`SOIT` / `SOET`) :

```text
serial  = <TYPE>-<numero>
address = <numero>-T
```

Ce suffixe ne correspond pas à l'adresse physique d'une GSO simple.

## Correctif

Pour `SOIT` / `SOET`, le helper produit désormais :

```text
serial  = <TYPE>-<numero>
address = <numero>
```

Les GSO portant explicitement un canal `-T` / `-H` conservent ce suffixe d'adresse et le préfixe du type n'est pas ajouté à `Adresse_Sonde`.

Le correctif est volontairement appliqué au helper commun afin de couvrir les trois chemins existants sans dupliquer de logique :

- prévisualisation d'un import ;
- import unitaire ;
- import multiple/bulk.

Les routes continuent à utiliser `storageIdentity.serial` pour `Sonde_Numero_Serie` et `storageIdentity.address` pour `Adresse_Sonde`.

## Fichiers principaux

- `website/src/lib/sensor-naming.ts` ;
- `website/scripts/test-gso-import-address-normalization.ts` ;
- `website/src/app/api/sondes/ajustages/preview/route.ts` (consommateur existant, non modifié) ;
- `website/src/app/api/sondes/ajustages/import/route.ts` (consommateur existant, non modifié) ;
- `website/src/app/api/sondes/ajustages/bulk/route.ts` (consommateur existant, non modifié).

## Branche

- branche : `fix/gso-import-address-normalization` ;
- base de départ : `dev` au SHA `663073c4865de3cee010442fd3af153804333b24` ;
- PR : à renseigner à l'ouverture.

## Validation automatique

Le test ciblé couvre au minimum :

- `SOIT-10007193` -> série `SOIT-10007193`, adresse `10007193` ;
- `SOET-10007909` -> série `SOET-10007909`, adresse `10007909` ;
- reconstruction du type depuis le nom d'un fichier d'ajustage lorsque `NUM_SONDE` ne contient que le numéro ;
- conservation des suffixes d'adresse `-T` / `-H` pour les GSO qui les portent.

Le lot doit également passer ESLint ciblé, TypeScript et le build Next.js de production avant ouverture de la PR.

## Validation terrain

- [ ] importer un fichier d'ajustage `SOIT-10007193` et vérifier `Sonde_Numero_Serie = SOIT-10007193` ;
- [ ] vérifier `Adresse_Sonde = 10007193` et l'absence de `SOIT-` / `-T` ajouté artificiellement ;
- [ ] refaire avec une `SOET` ;
- [ ] vérifier une GSO à canal `-T` : adresse sans type mais suffixe conservé ;
- [ ] vérifier une GSO à canal `-H` : adresse sans type mais suffixe conservé ;
- [ ] tester l'import unitaire et l'import multiple ;
- [ ] vérifier qu'une sonde GSO déjà existante reçoit la même normalisation d'adresse lors de l'import ;
- [ ] vérifier que `t_ajustage.Sonde_Numero_Serie` reste aligné sur le numéro de série de `t_sonde` ;
- [ ] vérifier qu'aucun comportement des sondes non-GSO n'est modifié.
