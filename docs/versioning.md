# Convention de versioning VigiSensys

## Objectif

VigiSensys est composé de plusieurs exécutables, applications et artefacts qui n'évoluent pas toujours au même rythme. Cette convention définit une règle commune pour :

- identifier sans ambiguïté la version réellement livrée d'un composant ;
- savoir quels composants doivent être incrémentés lors d'un changement ;
- documenter les compatibilités sans les supposer ;
- garder un changelog exploitable par le développement, l'installation et le support terrain.

Le fichier racine [`CHANGELOG.md`](../CHANGELOG.md) est la référence lisible des changements livrables.

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

Les zéros de tête ne sont pas utilisés. Ainsi :

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

Avant `1.0.0`, le produit reste en phase `0.x.y` : une évolution MINOR peut exceptionnellement contenir une incompatibilité. Si c'est le cas, elle doit être signalée explicitement dans le changelog et dans la PR.

Exemple : `0.90.2 -> 0.91.0`.

### MAJOR

À partir de `1.0.0`, une rupture volontaire de compatibilité doit incrémenter MAJOR.

Exemple : `1.8.3 -> 2.0.0`.

## Les composants ne sont pas obligatoirement synchronisés

Il n'y a pas de règle imposant que le Web, le Serveur, l'Agent et les outils aient toujours le même numéro.

Exemple : si une correction ne concerne que le Web :

```text
Web      0.90.1 -> 0.90.2
Serveur  0.90.1 (inchangé)
Agent    1.0.1  (inchangé)
```

Cette règle évite de créer de fausses releases pour des composants dont le binaire ou le comportement n'a pas changé.

Une synchronisation volontaire reste possible pour un lot de livraison global, mais elle doit être décidée explicitement et documentée.

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

La version n'est incrémentée que si le Web fait partie du lot livré.

### Serveur Windows

Projet :

```text
Vigitemp Serveur/Vigitemp Serveur/
```

La version produit SemVer destinée à être lue par l'équipe et les outils est :

```csharp
AssemblyInformationalVersion("x.y.z")
```

`AssemblyVersion` et `AssemblyFileVersion` sont des métadonnées techniques .NET à quatre composantes. Elles peuvent rester distinctes de la version produit et ne doivent pas être modifiées uniquement pour rendre leur format visuellement identique à SemVer.

### Agent Windows

Projet :

```text
Vigitemp agent/Vigitemp agent/
```

Comme pour le Serveur, la version produit de référence est :

```csharp
AssemblyInformationalVersion("x.y.z")
```

Les versions historiques `AssemblyVersion` / `AssemblyFileVersion` restent des métadonnées techniques.

### Installateur Serveur

Projet :

```text
Vigitemp Serveur/VigitempServerInstaller/
```

L'installateur suit la version produit du Serveur qu'il embarque. Son projet SDK déclare donc une propriété :

```xml
<Version>x.y.z</Version>
```

Une modification de l'installateur seul peut nécessiter une nouvelle livraison d'installateur ; dans ce cas le changelog doit expliquer clairement si la version du Serveur embarqué reste inchangée.

### Installateur Agent

Projet :

```text
Vigitemp agent/VigitempAgentInstaller/
```

Sa version produit lisible suit celle de l'Agent distribué via `AssemblyInformationalVersion`.

Ses versions d'assembly historiques à quatre composantes restent techniques.

### Générateur de licences

Projet :

```text
Vigitemp Serveur/Vigitemp License Generator/
```

Cet outil est versionné indépendamment, car une évolution du générateur ne signifie pas nécessairement une nouvelle version du Web, du Serveur ou de l'Agent.

Sa version produit de référence est `AssemblyInformationalVersion`.

### Base de données / seeds

Les fichiers :

```text
db/vigisensys_seed.sql
db/vigisensys_seed_mssql.sql
```

contiennent un marqueur de version de seed/bootstrap. Ce marqueur doit utiliser la notation canonique `x.y.z` lors de toute prochaine régénération ou modification du seed.

Le numéro de seed :

- n'est pas la version du moteur MySQL ou SQL Server ;
- ne remplace pas une vraie stratégie de migration de schéma ;
- doit être incrémenté uniquement lorsqu'un changement du bootstrap/DDL justifie une nouvelle révision de cet artefact.

Les seeds existants à la création de cette convention portent encore `0.90.001`. Cette écriture historique correspond canoniquement à `0.90.1`.

### Fichiers de licence

Les fichiers `.vtlic` sont des données de licence générées, pas des versions du logiciel. Ils ne reçoivent donc pas un numéro SemVer de composant.

## Compatibilité entre composants

Une proximité de numéros de version ne prouve pas la compatibilité.

Lorsqu'un changement crée une dépendance entre deux composants, le changelog doit préciser la combinaison réellement requise ou testée, par exemple :

```text
Serveur 0.92.0 requiert Web >= 0.91.3.
```

Cette information ne doit être ajoutée que si le contrat a été vérifié dans le code et/ou testé. En l'absence de contrainte vérifiée, ne pas inventer de version minimale.

Les points à surveiller en priorité sont :

- formats d'API et de payload ;
- schéma et données BDD ;
- protocole Agent ↔ Web/Serveur ;
- format de licence et options de licence ;
- configuration d'installation et variables requises.

## Processus pour une nouvelle livraison

1. Partir du `HEAD` actuel de `dev` sur une branche dédiée.
2. Identifier exactement les composants modifiés par le lot.
3. Choisir PATCH, MINOR ou MAJOR pour chaque composant concerné.
4. Modifier uniquement les sources de version des composants réellement livrés.
5. Compléter `[Unreleased]` dans `CHANGELOG.md` avec les changements, migrations et compatibilités.
6. Vérifier le diff complet de la branche contre `dev`.
7. Faire relire et merger la PR vers `dev`.
8. Au moment où une livraison est réellement figée, déplacer les éléments de `[Unreleased]` dans une section datée correspondant aux versions livrées.

## Format conseillé d'une entrée de changelog

```md
## Livraison — 2026-09-15

### Versions
- Web : 0.90.1 -> 0.91.0
- Serveur : 0.90.1 -> 0.90.2
- Agent : inchangé (1.0.1)

### Ajouté
- ...

### Corrigé
- ...

### Compatibilité / migration
- ...

### PR principales
- #...
```

L'objectif est qu'une personne qui n'a pas suivi les commits puisse comprendre rapidement ce qui a changé, ce qu'elle doit installer et ce qu'elle doit vérifier.