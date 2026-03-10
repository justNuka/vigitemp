# Dashboard & Surveillance UI Design Pass — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Améliorer visuellement la page dashboard utilisateur et la page surveillance — tokens shadcn, gradients, glow sémantique, animations ciblées.

**Architecture:** 6 fichiers UI modifiés, aucun changement de données/API. Les changements sont purement CSS/Tailwind/motion/react. Pas de nouveaux composants créés.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, motion/react v12 (`LazyMotion + domAnimation + m.*`), shadcn/ui tokens.

**Règles motion/react (critique) :**
- Toujours `LazyMotion features={domAnimation}` + `m.*` — jamais `motion.div`
- Composant standalone → `variants={fadeInUp} initial="hidden" animate="visible"` sur son `m.*`
- Composant dans stagger grid → `variants={fadeInUp}` uniquement (pas d'`initial/animate`)
- `bg-linear-to-br` (Tailwind v4, pas `bg-gradient-to-br`)

---

### Task 1 — Dashboard stat cards : tokens theme + ring icônes

**Fichier :** `website/src/app/[locale]/(dashboard)/dashboard-header.tsx`

**Step 1 — Modifier `cardBaseClass`**

Remplacer :
```tsx
const cardBaseClass =
  "relative overflow-hidden bg-slate-800 text-white border border-white/10 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.7)] dark:bg-card dark:text-card-foreground dark:border-border";
```

Par :
```tsx
const cardBaseClass =
  "relative overflow-hidden bg-linear-to-br from-foreground/[.92] to-foreground/[.80] text-white border border-foreground/10 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.7)] dark:from-card dark:to-muted/30 dark:text-card-foreground dark:border-border";
```

**Step 2 — Modifier `cardVariants` (icônes)**

Remplacer tout l'objet `cardVariants` par :
```tsx
const cardVariants = {
  info: {
    border: "border-l-8 border-l-sky-400",
    icon: "bg-sky-500/25 text-sky-300 ring-1 ring-sky-400/30",
  },
  danger: {
    border: "border-l-8 border-l-red-500",
    icon: "bg-red-500/25 text-red-300 ring-1 ring-red-400/30",
  },
  muted: {
    border: "border-l-8 border-l-slate-400",
    icon: "bg-slate-500/25 text-slate-300 ring-1 ring-slate-400/30",
  },
  warning: {
    border: "border-l-8 border-l-amber-400",
    icon: "bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/30",
  },
};
```

Note: `cardTitleClass` et `cardValueClass` restent inchangés (`text-white/70` et `text-white`).

**Step 3 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```
Zéro erreur attendu.

**Step 4 — Commit**
```bash
git add website/src/app/[locale]/\(dashboard\)/dashboard-header.tsx
git commit -m "feat(ui): Task 1 — dashboard stat cards theme tokens + ring icons"
```

---

### Task 2 — Dashboard : table d'alarmes tokens + pulse dot

**Fichier :** `website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-active-alarms-section.tsx`

**Step 1 — Lire le fichier**

Identifier les classes actuelles dans `DashboardActiveAlarmsSection` :
- `Card` : `bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border`
- `headerClassName` : `!bg-slate-800 text-white`
- `headerCellClassName` : `!bg-slate-800 !text-white [&_svg]:!text-white !border-slate-700`
- `bodyClassName` : `[&_tr:nth-child(odd)]:bg-white [&_tr:nth-child(even)]:bg-slate-50/70 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background`
- `toolbarClassName` : `rounded-lg border border-slate-200 bg-white/80 px-3 py-2 shadow-sm`

**Step 2 — Appliquer les tokens**

Remplacer ces props dans le `<TanStackTable>` :

```tsx
containerClassName="border-border"
headerClassName="!bg-foreground/[.88] text-white dark:!bg-muted"
headerCellClassName="!bg-foreground/[.88] !text-white [&_svg]:!text-white !border-foreground/20 dark:!bg-muted dark:!border-border"
bodyClassName="[&_tr:nth-child(odd)]:bg-card [&_tr:nth-child(even)]:bg-muted/40 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"
tableClassName="text-foreground dark:text-card-foreground"
toolbarClassName="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
```

Remplacer le `<Card>` wrapper :
```tsx
// Avant :
<Card className="bg-white/90 border-slate-200 shadow-md dark:bg-card dark:border-border">
// Après :
<Card className="bg-card border-border shadow-md">
```

**Step 3 — Ajouter le pulse dot**

Dans le `<h2>`, juste avant le `<Badge>`, ajouter :
```tsx
{activeCount > 0 ? (
  <>
    <span
      className="h-2 w-2 rounded-full bg-destructive animate-pulse"
      aria-hidden="true"
    />
    <Badge variant="destructive" className="ml-1">
      {activeCount}
    </Badge>
  </>
) : null}
```
(Remplacer le bloc `{activeCount > 0 ? (<Badge...>) : null}` existant.)

**Step 4 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```

**Step 5 — Commit**
```bash
git add "website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-active-alarms-section.tsx"
git commit -m "feat(ui): Task 2 — dashboard alarms table theme tokens + pulse dot"
```

---

### Task 3 — Dashboard : carte de tendance polish

**Fichier :** `website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-trend-section.tsx`

**Step 1 — Lire le fichier**

Identifier :
- `<Card className="card-interactive bg-white/90 border-slate-200 shadow-md ...">`
- La ligne `<span className="text-muted-foreground">{t("trend.count", { count: trendCountLast7d })}</span>`

**Step 2 — Améliorer la card**

Remplacer `shadow-md` par `shadow-lg` et `bg-white/90 border-slate-200` par `bg-card border-border` :
```tsx
<Card className="card-interactive bg-card border-border shadow-lg overflow-hidden">
```

**Step 3 — Mettre la valeur en grand**

Remplacer la ligne `<span className="text-muted-foreground">{t("trend.count", { count: trendCountLast7d })}</span>` par :
```tsx
<div className="flex flex-col">
  <span className="text-2xl font-bold text-foreground tabular-nums">
    {trendCountLast7d}
  </span>
  <span className="text-xs text-muted-foreground">
    {t("trend.count", { count: trendCountLast7d })}
  </span>
</div>
```

Note : vérifier que la clé `trend.count` existe en fr.json et en.json. Si la clé inclut déjà le count dans la phrase (ex: "423 mesures"), extraire juste le label sans le count. Adapter selon ce que la clé retourne.

**Step 4 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```

**Step 5 — Commit**
```bash
git add "website/src/app/[locale]/(dashboard)/_components/dashboard/dashboard-trend-section.tsx"
git commit -m "feat(ui): Task 3 — dashboard trend card shadow-lg + bold count"
```

---

### Task 4 — Monitoring card : glow sémantique par statut

**Fichier :** `website/src/components/monitoring-card.tsx`

**Step 1 — Lire le fichier**

La classe racine `m.div` est actuellement :
```tsx
className={cn(
  "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
  "hover:shadow-lg hover:-translate-y-0.5",
  isSurveillanceActive
    ? "bg-card border-border shadow-sm"
    : "bg-slate-700 dark:bg-slate-800 border-slate-600"
)}
```

**Step 2 — Ajouter le helper local**

Juste avant le `return (`, ajouter cette fonction (à l'intérieur du composant, après les `useMemo`) :

```tsx
const cardGlowClass = (() => {
  if (!isSurveillanceActive) return "opacity-75"
  if (effectiveStatus === "critical" || effectiveStatus === "technical")
    return "ring-1 ring-red-500/30 shadow-[0_4px_24px_-6px_rgba(239,68,68,0.35)]"
  if (effectiveStatus === "warning")
    return "ring-1 ring-amber-500/20 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.25)]"
  return ""
})()
```

**Step 3 — Appliquer le glow au `m.div`**

Remplacer le `className={cn(...)}` sur le `m.div` par :
```tsx
className={cn(
  "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
  "hover:shadow-lg hover:-translate-y-0.5",
  isSurveillanceActive
    ? "bg-card border-border shadow-sm"
    : "bg-slate-700 dark:bg-slate-800 border-slate-600",
  cardGlowClass,
)}
```

**Step 4 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```

**Step 5 — Commit**
```bash
git add website/src/components/monitoring-card.tsx
git commit -m "feat(ui): Task 4 — monitoring card semantic glow by status"
```

---

### Task 5 — Monitoring card header : gradients + pulse dot

**Fichier :** `website/src/components/monitoring-card/monitoring-card-header.tsx`

**Step 1 — Lire le fichier**

La couleur de fond du header vient de `headerBgClassName` (string comme `"bg-red-700"`, `"bg-green-700"`, etc.) qui vient de `getStatusTheme` et/ou de `alarmTypeTheme`.

**Step 2 — Ajouter le gradient map**

Juste avant le `return (` dans le composant, ajouter :
```tsx
const gradientMap: Record<string, string> = {
  "bg-red-700":    "bg-linear-to-br from-red-600 to-red-800",
  "bg-blue-700":   "bg-linear-to-br from-blue-600 to-blue-800",
  "bg-black":      "bg-linear-to-br from-slate-900 to-black",
  "bg-violet-600": "bg-linear-to-br from-violet-500 to-violet-700",
  "bg-green-700":  "bg-linear-to-br from-emerald-600 to-emerald-800",
  "bg-amber-600":  "bg-linear-to-br from-amber-500 to-amber-700",
  "bg-slate-600":  "bg-linear-to-br from-slate-500 to-slate-700",
  "bg-gray-700":   "bg-linear-to-br from-gray-600 to-gray-800",
}
const resolvedHeaderBg = gradientMap[headerBgClassName] ?? headerBgClassName
```

**Step 3 — Utiliser `resolvedHeaderBg`**

Dans le `<div>` racine du header, remplacer `${headerBgClassName}` par `${resolvedHeaderBg}` :
```tsx
// Avant :
className={`px-3 py-2 ${headerBgClassName} border-b-2 ${headerBorderClassName} ${canAcknowledge ? 'cursor-pointer' : ''}`}
// Après :
className={`px-3 py-2 relative ${resolvedHeaderBg} border-b-2 ${headerBorderClassName} ${canAcknowledge ? 'cursor-pointer' : ''}`}
```
(Ajout de `relative` pour le pulse dot absolu.)

**Step 4 — Ajouter le pulse dot**

Dans le `<div>` racine, après le `<div className="flex items-start justify-between gap-2">`, ajouter comme premier enfant :
```tsx
{(status === 'critical' || status === 'technical') && isSurveillanceActive && (
  <span
    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white/80 animate-pulse pointer-events-none"
    aria-hidden="true"
  />
)}
```

Note : vérifier que le `right-2` ne chevauche pas l'icône de statut (qui est dans une colonne `flex` à droite). Si chevauchement visible, utiliser `right-10` ou ajuster.

**Step 5 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```

**Step 6 — Commit**
```bash
git add website/src/components/monitoring-card/monitoring-card-header.tsx
git commit -m "feat(ui): Task 5 — monitoring card header gradients + pulse dot for alarms"
```

---

### Task 6 — Surveillance page : entrance animation + stats bar

**Fichier :** `website/src/app/[locale]/(dashboard)/surveillance/monitoring-page-client.tsx`

**Step 1 — Lire le fichier**

Identifier :
- Le séparateur `<div className="h-px bg-slate-200 dark:bg-slate-800" />` (ligne ~341)
- La stats bar (bloc `<div className="px-4 md:px-6 pt-3 pb-0">...</div>`)
- Les dots colorés : `<span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />`

**Step 2 — Supprimer le séparateur**

Supprimer la ligne :
```tsx
<div className="h-px bg-slate-200 dark:bg-slate-800" />
```

**Step 3 — Ajouter les imports motion**

En haut du fichier, ajouter si non présents :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react"
import { fadeInUp } from "@/lib/motion-variants"
```

**Step 4 — Wrapper le contenu en fadeInUp**

Tout le contenu après `<PageHeader>` (stats bar + SurveillanceHeaderControls + grille + footer) doit être wrappé :

```tsx
return (
  <>
    <PageHeader
      title={t("title")}
      description={t("description")}
      activeAlarms={visibleStats.activeAlarms}
    />

    <LazyMotion features={domAnimation}>
      <m.div variants={fadeInUp} initial="hidden" animate="visible">
        {/* stats bar */}
        <div className="px-4 md:px-6 pt-3 pb-0">
          ...
        </div>

        {/* SurveillanceHeaderControls */}
        <div className="px-4 md:px-6 py-4">
          ...
        </div>

        {/* grille + load more */}
        {viewMode === "tree" ? (...) : (...)}

        {/* CurvesOverlayModal + LocationFormDialog : hors du wrapper animé (ce sont des dialogs) */}
        {/* footer */}
        <div className="flex items-center ...">...</div>
      </m.div>
    </LazyMotion>

    <CurvesOverlayModal ... />
    <LocationFormDialog ... />
  </>
)
```

Note importante : `CurvesOverlayModal` et `LocationFormDialog` sont des dialogs (portails). Les sortir du `m.div` animé pour éviter qu'ils soient affectés par l'animation de montée.

**Step 5 — Pulse dot sur la pill critique**

Dans la stats bar, remplacer le dot rouge :
```tsx
// Avant :
<span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
// Après :
<span
  className={`h-2 w-2 rounded-full bg-red-500 ${visibleStats.critical > 0 ? "animate-pulse" : ""}`}
  aria-hidden="true"
/>
```

**Step 6 — Hover sur les pills**

Ajouter `hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default` à chacun des 4 `<span>` pills de la stats bar.

**Step 7 — Vérifier TypeScript**
```bash
cd website && npx tsc --noEmit
```

**Step 8 — Commit**
```bash
git add "website/src/app/[locale]/(dashboard)/surveillance/monitoring-page-client.tsx"
git commit -m "feat(ui): Task 6 — surveillance page fadeInUp + critical pulse dot + pill hover"
```

---

## Vérification finale

Après tous les commits :

1. `npx tsc --noEmit` → zéro erreur
2. Dashboard en light mode : stat cards sombres via tokens (pas de slate-800 codé en dur), icônes avec ring
3. Dashboard en dark mode : stat cards en `bg-card`, même rendu qu'avant
4. Table d'alarmes : header sombre via tokens, rows alternées neutres
5. Trend card : valeur en grand
6. Page surveillance : fadeIn à l'entrée
7. Cards monitoring : glow rouge sur critique, glow amber sur warning
8. Card header : dégradé visible (from-X to-X+2 stops)
9. Dot rouge pulsant sur les cartes en alarme
10. Pills de stats : dot critique pulse si count > 0, hover effect
