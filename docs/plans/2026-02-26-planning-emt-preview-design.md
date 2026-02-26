# Design : EMT Preview dans la Dialog de Règle de Planning

Date : 2026-02-26

## Contexte

La dialog de création/édition de règles de planning (`PlanningRuleFormDialog`) ne montre pas les paramètres EMT du lieu ni les tolérances calculées en temps réel. De plus, un bug fait que les tolérances stockées en base sont incorrectes (la valeur `consigne` centrale n'est pas passée à `computeEmt()`, rendant la règle du quart non fonctionnelle).

## Problème identifié (bug)

`computeEmt()` pour le mode `quart` nécessite `consigne` (la valeur centrale) pour calculer les écarts avec `consigneSup`/`consigneInf` et en déduire l'EMT sonde. Sans ce paramètre, `emtSonde = null`, et les tolérances stockées sont identiques aux consignes brutes (aucune déduction d'EMT).

**Endroits affectés :**
- `POST /api/lieux/[id]/planning` — `consigne` absent de l'appel `computeEmt()`
- `PATCH /api/lieux/[id]/planning/[regleId]` — `consigne` absent + `mergedConsigne` non calculé
- Cascade EMT dans `PATCH /api/lieux/[id]` — `consigne: regle.Consigne` absent

## Design approuvé

### Section 1 — Bug fixes backend

**POST planning :**
```ts
computeEmt({
  ...
  consigne: validated.Consigne ?? null,   // ajout
  consigneSup: validated.Consigne_Sup ?? null,
  ...
})
```

**PATCH planning/[regleId] :**
```ts
const mergedConsigne =
  validated.Consigne !== undefined ? validated.Consigne : (existingRegle.Consigne ?? null)

computeEmt({
  ...
  consigne: mergedConsigne,   // ajout
  consigneSup: mergedConsigneSup ?? null,
  ...
})
```

**Cascade EMT dans PATCH lieu :**
```ts
// La query planningRegles doit sélectionner Consigne
computeEmt({
  ...
  consigne: regle.Consigne ?? null,   // ajout
  ...
})
```

### Section 2 — Type `LieuEmtParams`

Nouveau type exporté depuis `website/src/lib/planning-regle-schema.ts` :

```ts
export type LieuEmtParams = {
  mode: EmtMode
  emtValue: number | null
  incertitude: number | null
  erreurJustesse: number | null
  derive: number | null
  includeDeriveInUncertainty: boolean
  correctAccuracyError: boolean
  isConsigneSupActive: boolean
  isConsigneInfActive: boolean
}
```

### Section 3 — Props et passage de données

`PlanningRuleFormDialog` reçoit `emtParams: LieuEmtParams` en prop.

`location-form-tab-planning.tsx` lit les champs EMT depuis le form context (`resolvedForm.watch(...)`) et construit l'objet `LieuEmtParams` à passer au dialog :
- `EMT_Mode` → `emtModeFromDb()` si stocké comme int, ou directement si déjà string
- `EMT_Valeur` → `emtValue`
- `Incertitude` → `incertitude`
- `Erreur_Justesse` → `erreurJustesse`
- `Derive` → `derive`
- `Prendre_En_Compte_Derive` → `includeDeriveInUncertainty`
- `Corriger_Erreur_Justesse` → `correctAccuracyError`
- `Est_Consigne_Sup_Active` → `isConsigneSupActive`
- `Est_Consigne_Inf_Active` → `isConsigneInfActive`

### Section 4 — Bloc EMT summary dans le dialog

Positionné entre les champs Consigne/Sup/Inf et la checkbox "Règle active".

Calcul live via `useMemo` :
```ts
const emtPreview = useMemo(() => computeEmt({
  ...emtParams,
  consigne: form.watch('Consigne') ?? null,
  consigneSup: form.watch('Consigne_Sup') ?? null,
  consigneInf: form.watch('Consigne_Inf') ?? null,
}), [emtParams, watchedConsigne, watchedConsigneSup, watchedConsigneInf])
```

Rendu :
```
┌─ EMT du lieu ───────────────────────────────────────┐
│  Mode : Règle du quart                               │
│  EMT sonde : 2.50 °C                                │
│  ✓ Correction EJ   ✗ Dérive incluse                 │
│  ─────────────────────────────────────────────────   │
│  Tolérance sup calculée : 67.50                      │
│  Tolérance inf calculée : 52.50                      │
└──────────────────────────────────────────────────────┘
```

- Tolérance affiche `—` si `null`
- Le mode "sans-objet" affiche un message neutre
- Bloc toujours visible (pas de collapsible)

### Section 5 — i18n

Nouvelles clés dans `lieux.planning.dialog` (fr.json + en.json) :
- `emtTitle` — "EMT du lieu"
- `emtMode` — "Mode"
- `emtSonde` — "EMT sonde"
- `emtCorrectEj` — "Correction EJ"
- `emtDerive` — "Dérive incluse"
- `emtToleranceSup` — "Tolérance sup calculée"
- `emtToleranceInf` — "Tolérance inf calculée"
- `emtNotApplicable` — "Sans objet"
- `emtNotCalculable` — "—"
- Mode labels : `emtModeQuart`, `emtModeManuel`, `emtModeUncertainties`, `emtModeSansObjet`

## Fichiers impactés

| Fichier | Changement |
|---|---|
| `src/app/api/lieux/[id]/planning/route.ts` | bug fix : ajouter `consigne` à computeEmt |
| `src/app/api/lieux/[id]/planning/[regleId]/route.ts` | bug fix : mergedConsigne + ajouter `consigne` |
| `src/app/api/lieux/[id]/route.ts` | bug fix cascade : ajouter `consigne` + select Consigne |
| `src/lib/planning-regle-schema.ts` | ajout export `LieuEmtParams` |
| `src/app/.../lieux/_components/location-form-tab-planning.tsx` | construire + passer emtParams au dialog |
| `src/app/.../lieux/_components/planning-rule-form-dialog.tsx` | prop emtParams + bloc EMT summary |
| `src/messages/fr.json` | nouvelles clés i18n |
| `src/messages/en.json` | nouvelles clés i18n |
