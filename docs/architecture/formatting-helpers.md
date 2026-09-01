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

## 5. Étapes suivantes

Après validation/merge de l'étape 3 :

1. créer le helper numérique canonique avec tests ;
2. accepter une précision paramétrable (`decimals` ou min/max de décimales), la locale, le fallback et le grouping ;
3. rechercher les `toFixed`, `toLocaleString`, `Intl.NumberFormat` locaux et concaténations numériques dans le code courant ;
4. migrer progressivement ces usages par domaine, sans modifier la précision des valeurs métier stockées ou calculées ;
5. décider dans un lot ultérieur si les options date legacy peuvent être supprimées après vérification des consommateurs restants.

Le helper numérique doit rester un helper de présentation : il ne doit jamais arrondir ou transformer une valeur de référence avant calcul ou persistance.
