# Convention de versioning VigiSensys

## Objectif

VigiSensys est composé de plusieurs exécutables, applications et artefacts qui n'évoluent pas toujours au même rythme. Cette convention définit une règle commune pour :

- identifier sans ambiguïté la version réellement livrée d'un composant ;
- savoir quels composants doivent être incrémentés lors d'un changement ;
- documenter les compatibilités sans les supposer ;
- garder un historique lisible aussi bien au niveau produit qu'au niveau technique.

## Organisation des changelogs

Le suivi est volontairement séparé en **deux niveaux**.

### 1. Changelog produit racine

[`CHANGELOG.md`](../CHANGELOG.md) est la vue synthétique de VigiSensys.

Il contient uniquement :

- les versions des composants présentes dans une livraison ou un état intégré ;
- les grandes évolutions par composant ;
- les migrations ou actions d'installation importantes ;
- les contraintes de compatibilité réellement vérifiées ;
- des liens vers les changelogs détaillés.

Il ne doit pas devenir un journal exhaustif de commits, de fichiers ou de retours terrain.

### 2. Changelogs détaillés par composant

Les détails sont conservés au plus près de chaque composant :

- Web : [`website/CHANGELOG.md`](../website/CHANGELOG.md)
- Serveur Windows : [`Vigitemp Serveur/CHANGELOG.md`](../Vigitemp%20Serveur/CHANGELOG.md)
- Agent Windows : [`Vigitemp agent/CHANGELOG.md`](../Vigitemp%20agent/CHANGELOG.md)
- Base de données / seeds : [`db/CHANGELOG.md`](../db/CHANGELOG.md)
- Générateur de licences : [`Vigitemp Serveur/Vigitemp License Generator/CHANGELOG.md`](../Vigitemp%20Serveur/Vigitemp%20License%20Generator/CHANGELOG.md)

Chaque changelog de composant peut détailler :

- `Ajouté` ;
- `Modifié` ;
- `Corrigé` ;
- compatibilité / migration ;
- PR principales ;
- références techniques utiles.

Les checklists terrain exhaustives et les détails de reprise restent dans les backlogs et documents dédiés, notamment `website/docs/backlog-retours-17-08-2026.md`.

## Format retenu

Les versions produit lisibles utilisent **SemVer** sous la forme :

```text
MAJOR.MINOR.PATCH
```

Exemples valides :

```text
0.90.1
0.76.112
1.0.0
2.4.17
```

Chaque partie peut contenir plusieurs chiffres. Les zéros de tête ne sont pas utilisés :

```text
0.90.001  ->  0.90.1
0.07.004  ->  0.7.4
```

La normalisation d'un ancien numéro avec zéros de tête ne constitue pas, à elle seule, une nouvelle release fonctionnelle.

## Signification des trois nombres

### PATCH

À incrémenter pour une correction compatible avec le comportement et les interfaces attendus du composant :

- correction de bug ;
- correction UI sans nouvelle capacité métier ;
- optimisation sans rupture de contrat ;
- ajustement documentaire ou de packaging qui justifie une nouvelle livraison du composant.

Exemple : `0.90.1 -> 0.90.2`.

### MINOR

À incrémenter lorsqu'une capacité fonctionnelle est ajoutée ou qu'un lot cohérent modifie sensiblement le comportement du composant.

Avant `1.0.0`, le produit reste en phase `0.x.y` : une évolution MINOR peut exceptionnellement contenir une incompatibilité. Si c'est le cas, elle doit être signalée explicitement.

Exemple : `0.90.2 -> 0.91.0`.

### MAJOR

À partir de `1.0.0`, une rupture volontaire de compatibilité doit incrémenter MAJOR.

Exemple : `1.8.3 -> 2.0.0`.

## Les composants ne sont pas obligatoirement synchronisés

Il n'y a pas de règle imposant que le Web, le Serveur, l'Agent, la BDD et les outils aient le même numéro.

Exemple :

```text
Web      0.90.1 -> 0.90.2
Serveur  0.90.3 (inchangé)
Agent    1.0.1  (inchangé)
```

Cette règle évite de créer de fausses releases pour des composants dont le binaire ou le comportement n'a pas changé.

## Sources de version par composant

### Web

Source principale :

```text
website/package.json
```

Champ :

```json
"version": "x.y.z"
```

L'interface doit afficher directement cette notation canonique, sans rajouter artificiellement de zéros.

### Serveur Windows

Projet :

```text
Vigitemp Serveur/Vigitemp Serveur/
```

Version produit de référence :

```csharp
AssemblyInformationalVersion("x.y.z")
```

`AssemblyVersion` et `AssemblyFileVersion` peuvent rester à quatre composantes lorsque l'historique .NET du projet l'exige.

### Agent Windows

Projet :

```text
Vigitemp agent/Vigitemp agent/
```

Version produit de référence :

```csharp
AssemblyInformationalVersion("x.y.z")
```

Les métadonnées techniques historiques à quatre composantes restent indépendantes.

### Installateur Serveur

Projet :

```text
Vigitemp Serveur/VigitempServerInstaller/
```

Il suit normalement la version du Serveur distribué via :

```xml
<Version>x.y.z</Version>
```

Si seul l'installateur change, le changelog Serveur doit expliquer clairement la relation entre version de l'installateur et version du binaire embarqué.

### Installateur Agent

Projet :

```text
Vigitemp agent/VigitempAgentInstaller/
```

Il suit normalement la version produit de l'Agent distribué.

### Générateur de licences

Projet :

```text
Vigitemp Serveur/Vigitemp License Generator/
```

Il est versionné indépendamment via `AssemblyInformationalVersion`.

### Base de données / seeds

Les fichiers :

```text
db/vigisensys_seed.sql
db/vigisensys_seed_mssql.sql
```

portent une révision VigiSensys du bootstrap/seed.

Ce numéro :

- n'est pas la version du moteur MySQL ou SQL Server ;
- ne remplace pas une stratégie de migration ;
- ne doit évoluer que lorsque le bootstrap, le DDL ou les données initiales changent de manière significative.

Les seeds historiques `0.90.001` correspondent canoniquement à `0.90.1`.

Pour les installations déjà existantes, les scripts de mise à niveau sont versionnés sous :

```text
db/migrations/<version>/mysql.sql
db/migrations/<version>/mssql.sql
```

La procédure et les règles détaillées sont décrites dans `db/migrations/README.md`.

Toute évolution de schéma BDD doit maintenir ensemble :

- le seed MySQL ;
- le seed SQL Server ;
- les scripts de migration MySQL et SQL Server de la version cible ;
- `db/CHANGELOG.md`.

Le changelog BDD doit citer explicitement les **tables et colonnes ajoutées, modifiées ou supprimées**. Pour une colonne ajoutée à une table existante, il précise au minimum le nom exact, le type MySQL, le type SQL Server, la nullabilité et la valeur par défaut. Pour une nouvelle table, il liste toutes les colonnes créées.

Une migration d'installation existante doit préserver les données, être idempotente autant que raisonnablement possible et ne mettre à jour `VERSION / SCHEMA_VERSION` qu'après l'application réussie des changements de la version.

### Fichiers de licence

Les fichiers `.vtlic` sont des données générées, pas des releases logicielles autonomes. Ils ne reçoivent pas de numéro SemVer propre.

## Compatibilité entre composants

Une proximité de numéros ne prouve pas la compatibilité.

Une version minimale ne doit être déclarée que lorsqu'elle est justifiée par :

- un contrat d'API ou de payload ;
- une dépendance de schéma BDD ;
- le protocole Agent ↔ Web/Serveur ;
- un format de licence ;
- une exigence d'installation/configuration ;
- ou une validation terrain explicite.

Exemple :

```text
Serveur 0.92.0 requiert Web >= 0.91.3.
```

En l'absence de contrainte vérifiée, écrire qu'aucune nouvelle contrainte n'est connue plutôt que d'inventer un minimum.

## Processus pour une nouvelle livraison

1. Partir du `HEAD` actuel de `dev` sur une branche dédiée.
2. Identifier les composants réellement modifiés.
3. Choisir PATCH, MINOR ou MAJOR pour chacun des composants concernés.
4. Mettre à jour uniquement leurs sources de version.
5. Compléter le `[Unreleased]` du changelog de chaque composant modifié avec le détail utile.
6. Compléter le `[Unreleased]` du changelog racine avec une synthèse courte et les versions/compatibilités importantes.
7. Vérifier le diff complet contre `dev` et supprimer tout changement parasite.
8. Mettre à jour le backlog/document de reprise concerné.
9. Ouvrir la PR vers `dev` sans la merger.
10. Lorsqu'une livraison est réellement figée, transformer les entrées `[Unreleased]` en sections datées/versionnées.

## Format conseillé — changelog composant

```md
## [0.91.0] — 2026-09-15

### Ajouté
- ...

### Modifié
- ...

### Corrigé
- ...

### Compatibilité / migration
- ...

### PR principales
- #...
```

## Format conseillé — changelog produit

```md
## Livraison / état intégré — 2026-09-15

### Versions des composants
| Composant | Version | Compatibilité / remarque |
| --- | --- | --- |
| Web | 0.91.0 | ... |
| Serveur | 0.90.4 | ... |
| Agent | 1.0.1 | inchangé |

### Web — principales évolutions
- ...

### Serveur — principales évolutions
- ...
```

L'objectif est qu'une personne puisse comprendre rapidement **ce qu'elle doit installer** dans le changelog racine, puis ouvrir uniquement le changelog du composant concerné lorsqu'elle a besoin du détail technique.
