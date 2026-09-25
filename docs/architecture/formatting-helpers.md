# Helpers de formatage dates et nombres

> Document d'implémentation du Lot 9A de `docs/architecture/refactor-roadmap.md`.
>
> Lire également `docs/architecture/development-guidelines.md`, en particulier les règles sur les `DATETIME` sans fuseau. Ce document décrit le contrat de présentation ; il ne change pas la sémantique de stockage des dates.

## 1. Objectif

Centraliser progressivement les règles d'affichage des dates et des nombres afin d'éviter les formats ad hoc dispersés dans les composants, routes, rapports et tooltips.

Principes :

- une seule source de vérité par type de formatage ;
- paramètres explicites selon le contexte ;
- aucune modification de la valeur métier uniquement pour l'affichage ;
- migration progressive des usages existants ;
- conservation stricte des règles de parsing/sérialisation des dates MySQL/MSSQL `DATETIME`.

## 2. Avancement

### Étape 1 — caractérisation du helper date

Réalisée et mergée via la PR #77.

Le script `website/scripts/test-date-display.ts` couvre le comportement historique du helper avant refactor, notamment :

- parsing `DATETIME` local ;
- `serializeDbDateTime` ;
- `serializeStoredDbDateTime` ;
- transitions DST ;
- formats historiques ;
- fallbacks ;
- locale/timezone ;
- options `Intl`.

Commande :

```bash
pnpm test:date-display
```

### Étape 2 — formats nommés du helper date

Réalisée et mergée via la PR #78 (`refactor/date-display-formats`).

Le contrat de `formatDbDateTime` accepte désormais le paramètre `format` avec sept valeurs typées :

| Format | Sortie sans locale/timezone explicite |
|---|---|
| `date` | `31/08/2026` |
| `dateShort` | `31/08` |
| `time` | `14:05` |
| `timeSeconds` | `14:05:06` |
| `dateTime` | `31/08/2026 14:05` |
| `dateTimeShort` | `31/08 14:05` |
| `dateTimeSeconds` | `31/08/2026 14:05:06` |

Exemples :

```ts
formatDbDateTime(value, { format: "date" })
formatDbDateTime(value, { format: "time" })
formatDbDateTime(value, { format: "dateTimeSeconds", locale, timeZone })
```

Lorsque `locale` ou `timeZone` est fourni, le helper utilise `Intl.DateTimeFormat` avec les composantes correspondant au format demandé.

Pour un besoin spécifique non couvert par les formats nommés, utiliser `formatDbDateTimeIntl` :

```ts
formatDbDateTimeIntl(value, {
  locale,
  timeZone,
  intl: {
    day: "2-digit",
    month: "long",
    year: "numeric",
  },
})
```

La résolution runtime du preset reste défensive : si une valeur `format` invalide contourne le typage TypeScript, le helper retombe sur le comportement legacy au lieu de retourner une valeur indéfinie.

### DATETIME stockés sans fuseau

Pour les colonnes MySQL / SQL Server `DATETIME` qui représentent une heure murale locale, utiliser les variantes dédiées :

- `serializeStoredDbDateTime(value)` : sérialise les composantes stockées sans ajouter de fuseau ;
- `parseStoredDbDateTime(value)` : transforme cette représentation en `Date` locale uniquement pour tri/calcul d'axe ;
- `formatStoredDbDateTime(value, options)` : applique les presets d'affichage tout en interdisant une reconversion de fuseau.

Le helper prend aussi en charge le cas où un `Date` Prisma a déjà traversé une frontière JSON et arrive sous forme ISO avec `Z` ou offset explicite : les composantes écrites `YYYY-MM-DD HH:mm:ss` restent la source de vérité.

Important : `formatStoredDbDateTime` ignore volontairement `timeZone`. Un `DATETIME` historique sans fuseau ne doit jamais être déplacé de +1/+2 h par une conversion `Intl`.

À la frontière serveur Prisma, la représentation `Date` dépend du driver. Utiliser les wrappers de `src/lib/sql-provider.ts` :

- `serializePrismaStoredDbDateTime(value)` pour convertir un `Date` lu par Prisma en chaîne murale sans fuseau ;
- `toPrismaStoredDbDateTime(value)` pour construire une borne/valeur `Date` adaptée au provider avant un filtre ou une écriture Prisma.

Ces wrappers distinguent MariaDB (composantes locales) de SQL Server/node-mssql (composantes UTC par défaut). Ne pas remplacer ce mécanisme par une correction fixe `+2 h` / `-2 h`, car elle serait fausse en heure d'hiver et sur l'autre provider.

Exemple :

```ts
formatStoredDbDateTime("2026-09-23T10:36:17.000Z", {
  format: "dateTimeSeconds",
  locale: "fr-FR",
  timeZone: "Europe/Paris",
})
// 23/09/2026 10:36:17 — jamais 12:36:17
```

### Étape 3 — migration de tous les appels applicatifs date

Branche : `refactor/date-display-call-sites`.

Objectif : ne plus laisser le code applicatif dépendre implicitement du format historique ou des anciens flags.

État après migration :

- tous les appels `formatDbDateTime` présents sous `website/src/`, hors implémentation du helper lui-même, fournissent un `format` explicite ;
- les appels qui reposaient sur le comportement par défaut utilisent désormais `format: "dateTimeSeconds"`, ce qui préserve la sortie historique ;
- les appels déjà migrés vers un preset par la PR #78 sont conservés tels quels ;
- les options `locale`, `timeZone` et `fallback` existantes restent inchangées ;
- aucun parsing, aucune sérialisation et aucune valeur métier ne sont modifiés.

La migration a été contrôlée par analyse AST : après les trois premiers fichiers migrés manuellement, le codemod temporaire a converti 37 appels supplémentaires dans 19 fichiers et a vérifié qu'aucun appel applicatif restant n'était dépourvu de `format`. Le script et le workflow temporaires ont été supprimés avant le commit final et ne font pas partie du diff livré.

Validation automatisée de cette étape :

- analyse AST de tous les fichiers TypeScript/TSX de `website/src/` ;
- `website/scripts/test-date-display.ts` : 17 PASS / 0 FAIL.

Validation locale à conserver avant merge :

```bash
pnpm test:date-display
pnpm exec tsc --noEmit
pnpm lint
```

## 3. Compatibilité des anciens appels

Les options historiques suivantes restent temporairement acceptées par `date-display.ts` :

- `withSeconds` ;
- `withYear` ;
- `dateOnly` ;
- `timeOnly`.

Elles sont marquées comme dépréciées dans le type TypeScript et restent couvertes par les tests de caractérisation, mais le code applicatif sous `website/src/` ne doit plus les utiliser.

Règles de compatibilité :

- si `format` est fourni, il est prioritaire sur les anciens flags ;
- sans `format`, les anciens flags continuent de déterminer le rendu pour les anciens consommateurs/tests ;
- sans option, le rendu historique `dateTimeSeconds` reste inchangé ;
- `dateOnly` conserve sa priorité historique si `dateOnly` et `timeOnly` sont tous deux vrais.

La suppression définitive de ces options de compatibilité doit rester un lot séparé après validation de la migration complète et recherche des éventuels consommateurs externes.

## 4. Invariants dates à ne pas casser

Le refactor d'affichage ne doit pas modifier :

- `parseDbDateTime` ;
- `serializeDbDateTime` ;
- la sémantique de `serializeStoredDbDateTime` ;
- la distinction entre instant absolu UTC et heure locale historique sans fuseau ;
- le comportement MySQL/MSSQL autour des colonnes `DATETIME`.

Les tests DST et `serializeStoredDbDateTime` doivent rester verts à chaque étape suivante.

## 5. Helper numérique canonique

### Étape 4 — création et migration des formats numériques d'affichage

Branche : `refactor/number-display-helper`.

Le helper générique canonique est désormais `website/src/lib/number-display.ts`. Son API est volontairement limitée à la présentation :

```ts
formatNumber(value, { decimals: 2, locale })
formatNumber(value, { minimumDecimals: 0, maximumDecimals: 3, locale })
formatNumber(value, { fallback: "-", grouping: false })
```

Options supportées :

- `decimals` : nombre fixe de décimales, prioritaire sur min/max ;
- `minimumDecimals` / `maximumDecimals` : plage de précision d'affichage ;
- `locale` : locale transmise à `Intl.NumberFormat` ;
- `fallback` : rendu de `null`, `undefined`, `NaN` ou valeur non finie ;
- `grouping` : activation/désactivation explicite des séparateurs de milliers.

Les précisions sont bornées à la plage supportée par `Intl.NumberFormat` (0 à 20 chiffres après la virgule). Sans précision explicite, le helper conserve le comportement décimal standard d'`Intl` : 0 à 3 décimales.

### Wrapper métier des mesures

`website/src/lib/measurements.ts::formatMeasureValue` reste le point d'entrée métier pour les mesures. Il délègue désormais au helper générique mais conserve son contrat historique :

- sans `Nb_Decimal` : 0 à 2 décimales ;
- avec `Nb_Decimal` : précision fixe, bornée à 0–10 comme auparavant ;
- fallback vide pour une mesure absente/invalide ;
- aucune modification de `normalizeMeasureNumber`, qui reste un helper numérique de calcul et non de présentation.

### Migration des usages existants

Le scan du code courant a permis de centraliser les formatages destinés à l'affichage :

- aucun `new Intl.NumberFormat(...)` direct ne reste sous `website/src/` hors `number-display.ts` ;
- aucun `.toLocaleString(...)` direct ne reste sous `website/src/` ;
- les `toFixed(...)` purement visuels migrés conservent leur précision et, lorsque nécessaire, un format déterministe équivalent à l'ancien rendu ;
- les formats de mesures, alarmes, métrologie UI, Surveillance, Vigilog, Hotline, statistiques et tailles de pièces jointes passent désormais par le helper canonique ou un wrapper métier.

Les `toFixed(...)` restants sont intentionnels et ne sont **pas** considérés comme de la dette d'affichage tant qu'ils servent un contrat technique :

- normalisation/arrondi de valeurs utilisées dans un calcul ;
- protocole GSP et coefficients envoyés au matériel ;
- sérialisation API/DB ou chaîne numérique déterministe ;
- exports machine ;
- valeurs d'inputs éditables dont le contrat exige un point et une précision déterministe.

Ils ont été recensés explicitement lors de la migration afin d'éviter un remplacement global qui introduirait une locale dans un contrat machine.

### Tests

Commande dédiée :

```bash
pnpm test:number-display
```

Le test couvre notamment fallback, précision fixe, min/max, bornes de précision, FR/EN, zéros finaux et grouping. Validation automatisée de la branche :

- `test:number-display` : 9 PASS / 0 FAIL ;
- `test:date-display` : 17 PASS / 0 FAIL ;
- scan de tous les formats numériques TypeScript/TSX ;
- parse syntaxique des fichiers TypeScript/TSX modifiés.

## 6. Étapes suivantes

Après validation/merge de l'étape numérique :

1. confirmer `pnpm exec tsc --noEmit` et `pnpm lint` dans l'environnement de développement complet ;
2. utiliser systématiquement `number-display.ts` ou un wrapper métier existant pour tout nouveau formatage UI ;
3. ne réexaminer un `toFixed` technique que si le contrat correspondant change, pas pour satisfaire une règle cosmétique ;
4. décider dans un lot ultérieur si les options date legacy peuvent être supprimées après vérification des consommateurs restants.

Les helpers de présentation ne doivent jamais modifier la valeur de référence utilisée pour un calcul, un échange matériel ou une persistance.
