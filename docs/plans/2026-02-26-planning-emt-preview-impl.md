# Planning EMT Preview — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the missing `consigne` parameter bug in EMT tolerance calculations for planning rules, and add a live EMT summary block to the planning rule form dialog.

**Architecture:** Three backend bug fixes (POST/PATCH planning routes + EMT cascade), then a frontend-only feature: pass lieu EMT params as props down to `PlanningRuleFormDialog` and add a `useMemo`-driven preview block using the existing `computeEmt()` utility.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Prisma, react-hook-form, zod, next-intl, Tailwind, shadcn/ui

---

### Task 1 — Bug fix: POST /api/lieux/[id]/planning

**Files:**
- Modify: `website/src/app/api/lieux/[id]/planning/route.ts:113-127`

**Context:** `computeEmt()` in quart mode needs `consigne` (central value) to compute EMT sonde. Currently missing → emtSonde = null → tolerances stored = raw consigne values without EMT deduction.

**Step 1: Add `consigne` to the computeEmt call**

In the POST handler, find the `computeEmt({` call (~line 115). Add `consigne: validated.Consigne ?? null,` after `emtValue`:

```typescript
const emt = computeEmt({
  mode: emtMode,
  emtValue: lieu.EMT,
  consigne: validated.Consigne ?? null,        // ADD THIS LINE
  consigneSup: validated.Consigne_Sup ?? null,
  consigneInf: validated.Consigne_Inf ?? null,
  isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
  isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
  incertitude: lieu.Derniere_Incertitude,
  erreurJustesse: lieu.Derniere_Erreur_Justesse,
  derive: lieu.Derive,
  includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
  correctAccuracyError: lieu.Est_Correction_Ej === 1,
})
```

**Step 2: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```
Expected: no output.

**Step 3: Commit**
```bash
git add website/src/app/api/lieux/\[id\]/planning/route.ts
git commit -m "fix: pass consigne to computeEmt in POST planning route"
```

---

### Task 2 — Bug fix: PATCH /api/lieux/[id]/planning/[regleId]

**Files:**
- Modify: `website/src/app/api/lieux/[id]/planning/[regleId]/route.ts:86-136`

**Context:** Same missing `consigne` bug in PATCH. For PATCH, the consigne value may be in the patch body or in the existing rule — need to merge.

**Step 1: Compute `mergedConsigne` and add to computeEmt call**

In the PATCH handler, find where `mergedConsigneSup` and `mergedConsigneInf` are computed (~line 111-114). Add `mergedConsigne` and pass to `computeEmt`:

```typescript
// Merge consigne: use patch value if provided, otherwise fall back to existing rule value
const mergedConsigne =
  validated.Consigne !== undefined ? validated.Consigne : (existingRegle.Consigne ?? null)
const mergedConsigneSup =
  validated.Consigne_Sup !== undefined ? validated.Consigne_Sup : existingRegle.Consigne_Sup
const mergedConsigneInf =
  validated.Consigne_Inf !== undefined ? validated.Consigne_Inf : existingRegle.Consigne_Inf
```

Then in the `computeEmt({` call below, add `consigne: mergedConsigne,`:

```typescript
const emt = computeEmt({
  mode: emtMode,
  emtValue: lieu.EMT,
  consigne: mergedConsigne,                     // ADD THIS LINE
  consigneSup: mergedConsigneSup ?? null,
  consigneInf: mergedConsigneInf ?? null,
  isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
  isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
  incertitude: lieu.Derniere_Incertitude,
  erreurJustesse: lieu.Derniere_Erreur_Justesse,
  derive: lieu.Derive,
  includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
  correctAccuracyError: lieu.Est_Correction_Ej === 1,
})
```

**Step 2: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```

**Step 3: Commit**
```bash
git add website/src/app/api/lieux/\[id\]/planning/\[regleId\]/route.ts
git commit -m "fix: pass consigne to computeEmt in PATCH planning rule route"
```

---

### Task 3 — Bug fix: EMT cascade in PATCH /api/lieux/[id]

**Files:**
- Modify: `website/src/app/api/lieux/[id]/route.ts:579-591`

**Context:** The EMT cascade (triggered when lieu's EMT params change) iterates `planningRegles` and recalculates tolerances. `regle.Consigne` is available from the `findMany` (no select restriction) but not passed to `computeEmt()`.

**Step 1: Add `consigne: regle.Consigne ?? null` to the cascade computeEmt call**

Find the `computeEmt({` inside `planningRegles.map((regle) => {` (~line 579). Add `consigne`:

```typescript
const emt = computeEmt({
  mode: emtMode,
  emtValue: updatedLieu.EMT,
  consigne: regle.Consigne ?? null,             // ADD THIS LINE
  consigneSup: regle.Consigne_Sup,
  consigneInf: regle.Consigne_Inf,
  isConsigneSupActive: updatedLieu.Est_Consigne_Sup_Active ?? false,
  isConsigneInfActive: updatedLieu.Est_Consigne_Inf_Active ?? false,
  incertitude: updatedLieu.Derniere_Incertitude,
  erreurJustesse: updatedLieu.Derniere_Erreur_Justesse,
  derive: updatedLieu.Derive,
  includeDeriveInUncertainty: updatedLieu.Est_Correction_derive ?? false,
  correctAccuracyError: updatedLieu.Est_Correction_Ej === 1,
})
```

**Step 2: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```

**Step 3: Commit**
```bash
git add website/src/app/api/lieux/\[id\]/route.ts
git commit -m "fix: pass consigne to computeEmt in EMT cascade on lieu update"
```

---

### Task 4 — Export `LieuEmtParams` type

**Files:**
- Modify: `website/src/lib/planning-regle-schema.ts`

**Context:** A shared type for the lieu's EMT parameters, used to pass data from the form context to the planning rule dialog.

**Step 1: Add the import and type export**

At the top of `planning-regle-schema.ts`, add the `EmtMode` import:
```typescript
import type { EmtMode } from "@/lib/emt"
```

Then add the type export anywhere after the existing imports:
```typescript
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

**Step 2: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```

**Step 3: Commit**
```bash
git add website/src/lib/planning-regle-schema.ts
git commit -m "feat: export LieuEmtParams type for planning rule dialog"
```

---

### Task 5 — Pass emtParams through the component tree

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-planning.tsx`

**Context:** `location-form-dialog.tsx` has access to `resolvedForm` (form context). It passes `idLieu` to `LocationFormTabPlanning`. We need to also pass `emtParams`. The planning tab then passes it to the dialog.

**Step 1: Update `LocationFormTabPlanningProps`**

In `location-form-tab-planning.tsx`, add the import and update the props interface:

```typescript
import type { PlanningRegleResponse, LieuEmtParams } from "@/lib/planning-regle-schema"
```

Update the props interface:
```typescript
interface LocationFormTabPlanningProps {
  idLieu: number | null
  emtParams: LieuEmtParams
  onAddRule?: () => void
  onEditRule?: (regle: PlanningRegleResponse) => void
}
```

Update the function signature:
```typescript
export function LocationFormTabPlanning({
  idLieu,
  emtParams,
  onAddRule,
  onEditRule,
}: LocationFormTabPlanningProps) {
```

Pass `emtParams` to `PlanningRuleFormDialog` (it's not there yet — this will cause a TS error on the dialog call site, which Task 6 will fix. For now just add it to the JSX):
```tsx
<PlanningRuleFormDialog
  open={dialogOpen}
  onClose={() => { setDialogOpen(false); setEditRegle(null) }}
  onSuccess={handleDialogSuccess}
  idLieu={idLieu!}
  editRegle={editRegle}
  emtParams={emtParams}
/>
```

**Step 2: Build `emtParams` in `location-form-dialog.tsx` and pass to planning tab**

In `location-form-dialog.tsx`, add imports:
```typescript
import { emtModeFromDb } from "@/lib/emt"
import type { LieuEmtParams } from "@/lib/planning-regle-schema"
```

Before the return (inside the component body), build the emtParams object:
```typescript
const emtParamsForPlanning: LieuEmtParams = {
  mode: emtModeFromDb(
    resolvedForm.watch('EMT_Mode') === 'quart' ? 1
    : resolvedForm.watch('EMT_Mode') === 'manuel' ? 2
    : resolvedForm.watch('EMT_Mode') === 'uncertainties' ? 3
    : 4
  ),
  emtValue: resolvedForm.watch('EMT_Valeur') ?? null,
  incertitude: resolvedForm.watch('Incertitude') ?? null,
  erreurJustesse: resolvedForm.watch('Erreur_Justesse') ?? null,
  derive: resolvedForm.watch('Derive') ?? null,
  includeDeriveInUncertainty: resolvedForm.watch('Prendre_En_Compte_Derive') ?? false,
  correctAccuracyError: resolvedForm.watch('Corriger_Erreur_Justesse') ?? false,
  isConsigneSupActive: resolvedForm.watch('Est_Consigne_Sup_Active') ?? false,
  isConsigneInfActive: resolvedForm.watch('Est_Consigne_Inf_Active') ?? false,
}
```

Note: `EMT_Mode` in the form is stored as a string ('quart'|'manuel'|'uncertainties'|'sans-objet'), not as a DB int. So use `emtModeFromDb` is wrong here — just cast directly:
```typescript
import type { EmtMode } from "@/lib/emt"

const emtParamsForPlanning: LieuEmtParams = {
  mode: (resolvedForm.watch('EMT_Mode') as EmtMode) ?? 'sans-objet',
  emtValue: resolvedForm.watch('EMT_Valeur') ?? null,
  incertitude: resolvedForm.watch('Incertitude') ?? null,
  erreurJustesse: resolvedForm.watch('Erreur_Justesse') ?? null,
  derive: resolvedForm.watch('Derive') ?? null,
  includeDeriveInUncertainty: resolvedForm.watch('Prendre_En_Compte_Derive') ?? false,
  correctAccuracyError: resolvedForm.watch('Corriger_Erreur_Justesse') ?? false,
  isConsigneSupActive: resolvedForm.watch('Est_Consigne_Sup_Active') ?? false,
  isConsigneInfActive: resolvedForm.watch('Est_Consigne_Inf_Active') ?? false,
}
```

Then pass it to `LocationFormTabPlanning`:
```tsx
<LocationFormTabPlanning
  idLieu={resolvedForm.watch('Id_Lieu') ?? null}
  emtParams={emtParamsForPlanning}
/>
```

**Step 3: Verify 0 TS errors** (will still have error from dialog missing emtParams prop — acceptable until Task 6)
```bash
cd website && npx tsc --noEmit 2>&1 | grep -v "emtParams" | tail -5
```

---

### Task 6 — Add EMT summary block to PlanningRuleFormDialog

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/planning-rule-form-dialog.tsx`

**Context:** Add `emtParams` prop, use `useMemo` to compute live tolerances, render a read-only summary block.

**Step 1: Add imports**

```typescript
import { useMemo } from "react"
import { computeEmt } from "@/lib/emt"
import type { LieuEmtParams } from "@/lib/planning-regle-schema"
```

**Step 2: Add `emtParams` to `PlanningRuleFormDialogProps`**

```typescript
export interface PlanningRuleFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  idLieu: number
  editRegle?: PlanningRegleResponse | null
  emtParams: LieuEmtParams
}
```

Update the component destructuring:
```typescript
export function PlanningRuleFormDialog({
  open,
  onClose,
  onSuccess,
  idLieu,
  editRegle,
  emtParams,
}: PlanningRuleFormDialogProps) {
```

**Step 3: Add live EMT preview computation**

After the `isSubmitting` line (inside the component, before `return`):

```typescript
const watchedConsigne = form.watch("Consigne")
const watchedConsigneSup = form.watch("Consigne_Sup")
const watchedConsigneInf = form.watch("Consigne_Inf")

const emtPreview = useMemo(
  () =>
    computeEmt({
      ...emtParams,
      consigne: watchedConsigne ?? null,
      consigneSup: watchedConsigneSup ?? null,
      consigneInf: watchedConsigneInf ?? null,
    }),
  [emtParams, watchedConsigne, watchedConsigneSup, watchedConsigneInf],
)

const EMT_MODE_LABEL: Record<string, string> = {
  quart: tDialog("emtModeQuart"),
  manuel: tDialog("emtModeManuel"),
  uncertainties: tDialog("emtModeUncertainties"),
  "sans-objet": tDialog("emtModeSansObjet"),
}
```

**Step 4: Add EMT summary block JSX**

Place it between the Consigne/Sup/Inf row and the "Actif" checkbox (after the `{/* Row: Consigne_Sup + Consigne_Inf */}` closing `</div>`):

```tsx
{/* EMT summary block */}
<div className="rounded-md border bg-muted/40 p-3 space-y-2 text-sm">
  <p className="font-medium">{tDialog("emtTitle")}</p>
  <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
    <span>
      {tDialog("emtMode")} :{" "}
      <span className="text-foreground font-medium">
        {EMT_MODE_LABEL[emtParams.mode] ?? emtParams.mode}
      </span>
    </span>
    {emtPreview.emtSonde !== null && (
      <span>
        {tDialog("emtSonde")} :{" "}
        <span className="text-foreground font-medium">
          {emtPreview.emtSonde.toFixed(4)}
        </span>
      </span>
    )}
    <span>
      {emtParams.correctAccuracyError ? "✓" : "✗"} {tDialog("emtCorrectEj")}
    </span>
    <span>
      {emtParams.includeDeriveInUncertainty ? "✓" : "✗"} {tDialog("emtDerive")}
    </span>
  </div>
  <div className="border-t pt-2 flex flex-wrap gap-x-6 gap-y-1">
    <span className="text-muted-foreground">
      {tDialog("emtToleranceSup")} :{" "}
      <span className="text-foreground font-medium">
        {emtPreview.toleranceSup !== null
          ? emtPreview.toleranceSup.toFixed(4)
          : tDialog("emtNotCalculable")}
      </span>
    </span>
    <span className="text-muted-foreground">
      {tDialog("emtToleranceInf")} :{" "}
      <span className="text-foreground font-medium">
        {emtPreview.toleranceInf !== null
          ? emtPreview.toleranceInf.toFixed(4)
          : tDialog("emtNotCalculable")}
      </span>
    </span>
  </div>
</div>
```

**Step 5: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```

---

### Task 7 — i18n keys

**Files:**
- Modify: `website/src/messages/fr.json`
- Modify: `website/src/messages/en.json`

**Context:** Add new keys under `lieux.planning.dialog` in both locale files.

**Step 1: Add to `fr.json`**

Find the `"lieux": { "planning": { "dialog": {` section. Add these keys inside `"dialog"`:

```json
"emtTitle": "EMT du lieu",
"emtMode": "Mode",
"emtSonde": "EMT sonde",
"emtCorrectEj": "Correction EJ",
"emtDerive": "Dérive incluse",
"emtToleranceSup": "Tolérance sup calculée",
"emtToleranceInf": "Tolérance inf calculée",
"emtNotCalculable": "—",
"emtModeQuart": "Règle du quart",
"emtModeManuel": "Manuel",
"emtModeUncertainties": "Incertitudes",
"emtModeSansObjet": "Sans objet"
```

**Step 2: Add to `en.json`**

Same keys under the same path:

```json
"emtTitle": "Location EMT",
"emtMode": "Mode",
"emtSonde": "Probe EMT",
"emtCorrectEj": "EJ correction",
"emtDerive": "Drift included",
"emtToleranceSup": "Calculated upper tolerance",
"emtToleranceInf": "Calculated lower tolerance",
"emtNotCalculable": "—",
"emtModeQuart": "Quarter rule",
"emtModeManuel": "Manual",
"emtModeUncertainties": "Uncertainties",
"emtModeSansObjet": "Not applicable"
```

**Step 3: Verify 0 TS errors**
```bash
cd website && npx tsc --noEmit 2>&1 | tail -5
```

**Step 4: Commit all**
```bash
git add website/src/app/[locale]/\(admin\)/admin/lieux/_components/location-form-dialog.tsx
git add website/src/app/[locale]/\(admin\)/admin/lieux/_components/location-form-tab-planning.tsx
git add website/src/app/[locale]/\(admin\)/admin/lieux/_components/planning-rule-form-dialog.tsx
git add website/src/messages/fr.json
git add website/src/messages/en.json
git commit -m "feat: add EMT preview block to planning rule dialog"
```

---

### Task 8 — Final verification

**Step 1: Full TS check**
```bash
cd website && npx tsc --noEmit 2>&1
```
Expected: no output.

**Step 2: Smoke test**

Open a lieu with EMT mode "quart" configured, go to Planning tab, create or edit a rule with consigne=20, consigneSup=25, consigneInf=15. The EMT block should show:
- Mode: Règle du quart
- EMT sonde: 1.2500 (= min(25-20, 20-15)/4 = 5/4)
- Tolérance sup: 23.7500 (= 25 - 1.25)
- Tolérance inf: 16.2500 (= 15 + 1.25)

After saving, check `t_lieu_planning_regle` — `Tolerance_Sup_Calc` and `Tolerance_Inf_Calc` must match the preview values.

**Step 3: Final commit if needed**
```bash
git status
```
