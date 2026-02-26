# Planning Delete Retain Mode — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a planning rule is deleted, ask the user which setpoints to keep — base (current behavior) or the rule's values promoted as new permanent base.

**Architecture:** Three-layer change — (1) i18n keys first so TypeScript is satisfied from the start, (2) backend DELETE handler extended with `?retainMode=base|regle` query param, (3) frontend replaces the direct delete with an AlertDialog containing a RadioGroup.

**Tech Stack:** Next.js 16 App Router, Prisma (db-main), shadcn/ui (`AlertDialog`, `RadioGroup`, `Label`), next-intl, React `useState`

---

### Task 1: i18n keys — fr.json + en.json

**Files:**
- Modify: `website/src/messages/fr.json` (around line 886, inside `lieux.planning.dialog` closing brace)
- Modify: `website/src/messages/en.json` (same location)

The i18n keys live under `lieux.planning` (NOT inside `dialog`). The component already uses `useTranslations("lieux.planning")` and will call `t("deleteConfirm.title")` etc.

**Step 1: Add keys to fr.json**

In `website/src/messages/fr.json`, find the closing of the `"dialog"` block (line ~886) and add a sibling `"deleteConfirm"` object right after it, before the closing of `"planning"`:

Current structure (line ~886–888):
```json
        "emtModeSansObjet": "Sans objet"
      }
    }
```

Replace with:
```json
        "emtModeSansObjet": "Sans objet"
      },
      "deleteConfirm": {
        "title": "Supprimer la règle",
        "description": "Que faire des consignes après suppression ?",
        "optionBase": "Restaurer les consignes de base",
        "optionRegle": "Appliquer les consignes de cette règle comme nouvelles valeurs de base",
        "ruleValues": "Consigne\u00a0: {consigne}  |  Sup\u00a0: {sup}  |  Inf\u00a0: {inf}"
      }
    }
```

**Step 2: Add keys to en.json**

Same location in `website/src/messages/en.json`:

```json
        "emtModeSansObjet": "Not applicable"
      },
      "deleteConfirm": {
        "title": "Delete rule",
        "description": "What to do with the setpoints after deletion?",
        "optionBase": "Restore base setpoints",
        "optionRegle": "Apply this rule's setpoints as new permanent base values",
        "ruleValues": "Setpoint: {consigne}  |  Sup: {sup}  |  Inf: {inf}"
      }
    }
```

**Step 3: Verify no TS errors introduced**

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```
Expected: 0 errors.

**Step 4: Commit**

```bash
git add website/src/messages/fr.json website/src/messages/en.json
git commit -m "feat(i18n): add deleteConfirm keys for planning rule deletion"
```

---

### Task 2: Backend — DELETE handler with `retainMode`

**Files:**
- Modify: `website/src/app/api/lieux/[id]/planning/[regleId]/route.ts`

**Context:** The current DELETE handler (lines 166–199) simply finds the rule, verifies ownership, deletes it, returns 204. We need to read a `retainMode` query param and, when it equals `"regle"`, update `t_lieu` before deleting.

The rule is already loaded into `existing` (typed as `PrismaRegle`) for the ownership check — we reuse it.

**Step 1: Modify the DELETE handler**

Replace the body of the DELETE handler starting at the try block. The change adds:
1. Read `retainMode` from `req.nextUrl.searchParams`
2. If `retainMode === "regle"`, run `prisma.t_lieu.update(...)` before the delete

Full updated DELETE handler (replace lines 166–199 entirely):

```typescript
export const DELETE = withLogging(
  async (req: NextRequest, { params }: { params: RouteParams }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id, regleId } = await params
      const idLieu = parseInt(id)
      const idRegle = parseInt(regleId)

      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")
      if (isNaN(idRegle)) return apiError(400, "invalid_regle_id", "ID regle invalide")

      const retainMode = req.nextUrl.searchParams.get("retainMode") ?? "base"

      // Load existing rule to verify ownership
      const existing = await prisma.t_lieu_planning_regle.findUnique({
        where: { Id_Regle: idRegle },
      })

      if (!existing) return apiError(404, "regle_not_found", "Regle introuvable")
      if ((existing as PrismaRegle).Id_Lieu !== idLieu) {
        return apiError(403, "regle_not_owned", "Cette regle n'appartient pas a ce lieu")
      }

      if (retainMode === "regle") {
        const regle = existing as PrismaRegle
        await prisma.t_lieu.update({
          where: { Id_Lieu: idLieu },
          data: {
            Consigne: regle.Consigne,
            Consigne_Sup: regle.Consigne_Sup,
            Consigne_Inf: regle.Consigne_Inf,
            Tolerance_Surveillance_Sup: regle.Tolerance_Sup_Calc,
            Tolerance_Surveillance_Inf: regle.Tolerance_Inf_Calc,
            Consigne_Base: regle.Consigne,
            Consigne_Sup_Base: regle.Consigne_Sup,
            Consigne_Inf_Base: regle.Consigne_Inf,
            Tolerance_Surveillance_Sup_Base: regle.Tolerance_Sup_Calc,
            Tolerance_Surveillance_Inf_Base: regle.Tolerance_Inf_Calc,
            Planning_Actif: false,
            Planning_Source_Regle_Id: null,
            Planning_Derniere_Maj: new Date(),
          },
        })
      }

      await prisma.t_lieu_planning_regle.delete({
        where: { Id_Regle: idRegle },
      })

      return new NextResponse(null, { status: 204 })
    } catch (error) {
      console.error("[DELETE /api/lieux/[id]/planning/[regleId]]", error)
      return apiError(500, "planning_delete_failed", "Erreur lors de la suppression de la regle de planning")
    }
  },
)
```

**Step 2: Verify no TS errors**

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add website/src/app/api/lieux/\[id\]/planning/\[regleId\]/route.ts
git commit -m "feat(api): planning DELETE supports retainMode=regle to promote rule setpoints to base"
```

---

### Task 3: Frontend — AlertDialog with RadioGroup in location-form-tab-planning.tsx

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-planning.tsx`

**Context:**
- Current trash button calls `void handleDelete(regle)` directly (line 232)
- `handleDelete` calls `deleteJson(...)` (lines 78–91)
- We need to: (a) add 2 new states, (b) replace the trash button action with `setDeleteConfirmRegle(regle)`, (c) add `confirmDelete` handler, (d) add the AlertDialog JSX, (e) remove unused `deleteJson` import

**Step 1: Update imports**

Replace:
```typescript
import { fetchJson, deleteJson } from "@/lib/http"
```
With:
```typescript
import { fetchJson } from "@/lib/http"
```

Add new shadcn/ui imports after the existing lucide import line:
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
```

**Step 2: Add two new states** (after the existing `deletingId` state on line ~52)

After:
```typescript
const [deletingId, setDeletingId] = useState<number | null>(null)
```
Add:
```typescript
const [deleteConfirmRegle, setDeleteConfirmRegle] = useState<PlanningRegleResponse | null>(null)
const [retainMode, setRetainMode] = useState<'base' | 'regle'>('base')
```

**Step 3: Replace `handleDelete` with `confirmDelete`**

Remove the entire `handleDelete` callback (lines 78–91):
```typescript
const handleDelete = useCallback(
  async (regle: PlanningRegleResponse) => {
    if (!idLieu) return
    setDeletingId(regle.Id_Regle)
    try {
      await deleteJson<void>(`/api/lieux/${idLieu}/planning/${regle.Id_Regle}`)
      await queryClient.invalidateQueries({ queryKey })
      void queryClient.invalidateQueries({ queryKey: ["planning-preview", idLieu] })
    } finally {
      setDeletingId(null)
    }
  },
  [idLieu, queryClient, queryKey],
)
```

Add in its place:
```typescript
const confirmDelete = async () => {
  if (!deleteConfirmRegle || !idLieu) return
  setDeletingId(deleteConfirmRegle.Id_Regle)
  try {
    await fetch(
      `/api/lieux/${idLieu}/planning/${deleteConfirmRegle.Id_Regle}?retainMode=${retainMode}`,
      { method: "DELETE" },
    )
    await queryClient.invalidateQueries({ queryKey })
    void queryClient.invalidateQueries({ queryKey: ["planning-preview", idLieu] })
  } finally {
    setDeletingId(null)
    setDeleteConfirmRegle(null)
    setRetainMode("base")
  }
}
```

Also remove `useCallback` from the import since it's no longer used:
```typescript
import { useState } from "react"
```

**Step 4: Update trash button onClick**

Replace:
```typescript
onClick={() => void handleDelete(regle)}
```
With:
```typescript
onClick={() => setDeleteConfirmRegle(regle)}
```

**Step 5: Add AlertDialog JSX**

Add the AlertDialog right before the closing `</div>` of the component return (after the `<PlanningRuleFormDialog .../>` block):

```tsx
{/* Delete confirm dialog */}
<AlertDialog
  open={deleteConfirmRegle !== null}
  onOpenChange={(open) => {
    if (!open) {
      setDeleteConfirmRegle(null)
      setRetainMode("base")
    }
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
      <AlertDialogDescription>{t("deleteConfirm.description")}</AlertDialogDescription>
    </AlertDialogHeader>

    <RadioGroup
      value={retainMode}
      onValueChange={(v) => setRetainMode(v as "base" | "regle")}
      className="space-y-3 py-2"
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="base" id="retain-base" />
        <Label htmlFor="retain-base">{t("deleteConfirm.optionBase")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="regle" id="retain-regle" />
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="retain-regle">{t("deleteConfirm.optionRegle")}</Label>
          {deleteConfirmRegle && (
            <span className="text-xs text-muted-foreground">
              {t("deleteConfirm.ruleValues", {
                consigne: deleteConfirmRegle.Consigne ?? "—",
                sup: deleteConfirmRegle.Consigne_Sup ?? "—",
                inf: deleteConfirmRegle.Consigne_Inf ?? "—",
              })}
            </span>
          )}
        </div>
      </div>
    </RadioGroup>

    <AlertDialogFooter>
      <AlertDialogCancel>{t("common.cancel", { ns: "common" })}</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => void confirmDelete()}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {t("deleteRule")}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Note on i18n:** `t` is `useTranslations("lieux.planning")`. The AlertDialogCancel uses the common cancel label. Check how other dialogs in the codebase call common translations — if this component only has one `t`, use `tCommon` instead. Add:
```typescript
const tCommon = useTranslations("common")
```
And use `tCommon("cancel")` in the cancel button instead of `t("common.cancel", { ns: "common" })`.

Full AlertDialogCancel becomes:
```tsx
<AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
```

**Step 6: Verify no TS errors**

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```
Expected: 0 errors.

**Step 7: Commit**

```bash
git add website/src/app/\[locale\]/\(admin\)/admin/lieux/_components/location-form-tab-planning.tsx
git commit -m "feat(ui): planning rule deletion shows AlertDialog to choose setpoint retain mode"
```

---

### Task 4: Verification

**Step 1: Full TypeScript check**

```bash
cd website && npx tsc --noEmit 2>&1
```
Expected: no output (0 errors).

**Step 2: Check shadcn/ui components exist**

```bash
ls website/src/components/ui/alert-dialog.tsx
ls website/src/components/ui/radio-group.tsx
ls website/src/components/ui/label.tsx
```
Expected: all 3 files exist. If any is missing, install with `npx shadcn@latest add alert-dialog radio-group label`.

**Step 3: Manual smoke test checklist**

1. Open a lieu with at least one planning rule
2. Click the trash icon → AlertDialog opens with "Supprimer la règle" title
3. Default selection is "Restaurer les consignes de base"
4. Switch to "Appliquer les consignes..." → rule values appear below
5. Click Annuler → dialog closes, nothing deleted
6. Reopen → selection resets to "base"
7. Delete with "base" → rule disappears, t_lieu base values unchanged
8. Delete with "regle" → rule disappears, t_lieu.Consigne/Base columns updated to rule values

**Step 4: Final commit (if any fixes needed)**

```bash
git add -p
git commit -m "fix: address post-implementation review issues"
```
