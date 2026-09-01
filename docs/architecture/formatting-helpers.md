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

Branche : `refactor/date-display-formats`.

Le contrat cible de `formatDbDateTime` ajoute le paramètre `format` avec cinq valeurs typées :

| Format | Sortie sans locale/timezone explicite |
|---|---|
| `date` | `31/08/2026` |
| `time` | `14:05` |
| `timeSeconds` | `14:05:06` |
| `dateTime` | `31/08/2026 14:05` |
| `dateTimeSeconds` | `31/08/2026 14:05:06` |

Exemples :

```ts
formatDbDateTime(value, { format: "date" })
formatDbDateTime(value, { format: "time" })
formatDbDateTime(value, { format: "dateTimeSeconds", locale, timeZone })
```

Lorsque `locale` ou `timeZone` est fourni, le helper utilise `Intl.DateTimeFormat` avec les composantes correspondant au format demandé.

Pour un besoin spécifique non couvert par les cinq formats, utiliser `formatDbDateTimeIntl` :

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

## 3. Compatibilité des anciens appels

Les options historiques suivantes restent temporairement acceptées :

- `withSeconds` ;
- `withYear` ;
- `dateOnly` ;
- `timeOnly`.

Elles sont marquées comme dépréciées dans le type TypeScript mais conservent leur comportement actuel pendant la migration.

Règles :

- si `format` est fourni, il est prioritaire sur les anciens flags ;
- sans `format`, les anciens flags continuent de déterminer le rendu ;
- sans option, le rendu historique `dateTimeSeconds` reste inchangé ;
- `dateOnly` conserve sa priorité historique si `dateOnly` et `timeOnly` sont tous deux vrais.

Aucun remplacement global des anciens appels ne doit être fait dans cette étape.

## 4. Invariants dates à ne pas casser

Le refactor d'affichage ne doit pas modifier :

- `parseDbDateTime` ;
- `serializeDbDateTime` ;
- la sémantique de `serializeStoredDbDateTime` ;
- la distinction entre instant absolu UTC et heure locale historique sans fuseau ;
- le comportement MySQL/MSSQL autour des colonnes `DATETIME`.

Les tests DST et `serializeStoredDbDateTime` doivent rester verts à chaque étape suivante.

## 5. Étapes suivantes

Après merge de l'étape 2 :

1. migrer quelques usages représentatifs vers `format` afin de valider l'ergonomie réelle du contrat ;
2. poursuivre la migration par domaine, pas via un remplacement global ;
3. créer le helper numérique canonique avec tests ;
4. migrer progressivement les `toFixed`, `toLocaleString`, `Intl.NumberFormat` locaux et concaténations numériques.

Le helper numérique devra permettre une précision paramétrable (`decimals` ou min/max de décimales), la locale, le fallback et le grouping, sans arrondir ni modifier les valeurs métier stockées/calculées.
