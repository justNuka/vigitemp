# Dashboard & Surveillance UI Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan.

**Goal:** Améliorer le design de la page dashboard utilisateur et de la page de surveillance — plus de profondeur visuelle, cohérence avec les tokens shadcn, animations ciblées.

**User choices:**
- Dashboard stat cards: Option C — garder le contraste fort mais utiliser les tokens du thème (pas de `slate-800` codé en dur)
- Surveillance cards: Option B — garder les fonds colorés, ajouter gradients + glow sémantique
- Animations surveillance: Option C — fadeIn global + pulse ciblé sur alarmes, pas de stagger sur 50+ cartes

---

## Section 1 — Dashboard : Stat cards (`dashboard-header.tsx`)

### Problème actuel
`bg-slate-800` codé en dur en light mode, `dark:bg-card` en dark — incohérent avec les tokens shadcn.

### Nouveau design

**Background card (remplace `bg-slate-800`):**
```
bg-linear-to-br from-foreground/[.92] to-foreground/[.80]
dark:from-card dark:to-muted/30
border border-foreground/10 dark:border-border
```

**Icônes (remplace les `bg-sky-500 text-sidebar ring-1 ring-sky-300/40`):**
```
info:    bg-sky-500/25  text-sky-300  ring-1 ring-sky-400/30
danger:  bg-red-500/25  text-red-300  ring-1 ring-red-400/30
muted:   bg-slate-500/25 text-slate-300 ring-1 ring-slate-400/30
warning: bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/30
```

**Stagger d'entrée:**
- Wrapper de grille en `LazyMotion features={domAnimation}` + `m.div variants={staggerContainer} initial="hidden" animate="visible"`
- Chaque `<Suspense>` wrapper en `m.div variants={fadeInUp}` (no initial/animate — héritage stagger)
- Imports: `LazyMotion, domAnimation, m` from `"motion/react"`, `staggerContainer, fadeInUp` from `"@/lib/motion-variants"`

**Bordures gauche colorées:** inchangées (`border-l-8 border-l-sky-400`, etc.) — sémantiquement correctes.

**Textes:** `text-white` et `text-white/70` inchangés — parfaits sur le fond sombre.

---

## Section 2 — Dashboard : Table d'alarmes + tendance

### Table d'alarmes (`dashboard-active-alarms-section.tsx`)

**Card wrapper:** `bg-white/90 border-slate-200` → `bg-card border-border`

**Header de tableau:** `headerClassName="!bg-foreground/[.88] text-white dark:!bg-muted"`, `headerCellClassName="!bg-foreground/[.88] !text-white [&_svg]:!text-white dark:!bg-muted !border-foreground/20 dark:!border-border"`

**Rows alternées:** `bodyClassName="[&_tr:nth-child(odd)]:bg-card [&_tr:nth-child(even)]:bg-muted/40 dark:[&_tr:nth-child(odd)]:bg-muted/30 dark:[&_tr:nth-child(even)]:bg-background"`

**Toolbar:** `toolbarClassName="rounded-lg border border-border bg-card px-3 py-2 shadow-sm"`

**Pulse dot sur alarmes actives:** À côté du `<Badge variant="destructive">`, ajouter:
```tsx
{activeCount > 0 && (
  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
)}
```

### Carte de tendance (`dashboard-trend-section.tsx`)

- `shadow-md` → `shadow-lg`
- Valeur `trendCountLast7d` affichée en grand:
```tsx
<p className="text-2xl font-bold text-foreground tabular-nums">{trendCountLast7d}</p>
<p className="text-xs text-muted-foreground">{t("trend.count_label")}</p>
```
(au lieu de la ligne de texte gris actuelle `{t("trend.count", { count: trendCountLast7d })}`)
Note: vérifier la clé i18n existante avant de modifier.

---

## Section 3 — Surveillance : Cards de monitoring

### Headers avec dégradé (`monitoring-card-header.tsx`)

Remplacer les fonds plats par des dégradés dans `alarmTypeTheme` et `getStatusTheme` usage.

La logique de couleur est actuellement basée sur `getStatusTheme` (dans `@/lib/surveillance-status`) et sur `alarmTypeTheme` local. Plutôt que de modifier le fichier de lib, appliquer les dégradés directement dans le composant header en post-processing:

```tsx
// Mapping des couleurs → dégradés
const gradientMap: Record<string, string> = {
  'bg-red-700':     'bg-linear-to-br from-red-600 to-red-800',
  'bg-blue-700':    'bg-linear-to-br from-blue-600 to-blue-800',
  'bg-black':       'bg-linear-to-br from-slate-900 to-black',
  'bg-violet-600':  'bg-linear-to-br from-violet-500 to-violet-700',
  'bg-green-700':   'bg-linear-to-br from-emerald-600 to-emerald-800',
  'bg-amber-600':   'bg-linear-to-br from-amber-500 to-amber-700',
  'bg-slate-600':   'bg-linear-to-br from-slate-500 to-slate-700',
  'bg-gray-700':    'bg-linear-to-br from-gray-600 to-gray-800',
}
// Utiliser: gradientMap[headerBgClassName] ?? headerBgClassName
```

**Pulse dot sur alarmes actives:**
Dans le header `<div>` racine, ajouter un dot pulsant:
```tsx
{(status === 'critical' || status === 'technical') && isSurveillanceActive && (
  <span
    className="absolute top-2 right-8 h-2 w-2 rounded-full bg-white/80 animate-pulse"
    aria-hidden="true"
  />
)}
```
(Le header doit avoir `relative` — vérifier si déjà présent)

### Glow sémantique sur card (`monitoring-card.tsx`)

La classe racine `m.div` reçoit une ombre/ring selon le statut effectif:

```tsx
// Helper à définir localement
function getCardGlowClass(status: SensorStatus, isSurveillanceActive: boolean): string {
  if (!isSurveillanceActive) return 'opacity-75'
  if (status === 'critical' || status === 'technical')
    return 'ring-1 ring-red-500/30 shadow-[0_4px_24px_-6px_rgba(239,68,68,0.35)]'
  if (status === 'warning')
    return 'ring-1 ring-amber-500/20 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.25)]'
  return ''
}
```

Application dans `cn()` sur le `m.div`:
```tsx
className={cn(
  "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
  "hover:shadow-lg hover:-translate-y-0.5",
  isSurveillanceActive
    ? "bg-card border-border shadow-sm"
    : "bg-slate-700 dark:bg-slate-800 border-slate-600",
  getCardGlowClass(effectiveStatus, isSurveillanceActive),
)}
```

---

## Section 4 — Surveillance : Page entrance + barre de stats

### Entrée de page (`monitoring-page-client.tsx`)

Supprimer le séparateur `<div className="h-px bg-slate-200 dark:bg-slate-800" />`.

Wrapper le bloc stats bar + controls + grille en `LazyMotion + m.div fadeInUp`:
```tsx
import { LazyMotion, domAnimation, m } from "motion/react"
import { fadeInUp } from "@/lib/motion-variants"

<LazyMotion features={domAnimation}>
  <m.div variants={fadeInUp} initial="hidden" animate="visible">
    {/* stats bar */}
    {/* SurveillanceHeaderControls */}
    {/* grille */}
    {/* load more */}
    {/* footer */}
  </m.div>
</LazyMotion>
```

### Barre de stats

**Dot critique animé:** Si `visibleStats.critical > 0`, le dot de la pill "critical" reçoit `animate-pulse`:
```tsx
<span className={cn(
  "h-2 w-2 rounded-full bg-red-500",
  visibleStats.critical > 0 && "animate-pulse"
)} aria-hidden="true" />
```

**Pills hover:**
```
hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default
```

---

## Fichiers à modifier

| Fichier | Changements |
|---|---|
| `src/app/[locale]/(dashboard)/dashboard-header.tsx` | tokens bg, stagger grid, ring icônes |
| `src/app/[locale]/(dashboard)/_components/dashboard/dashboard-active-alarms-section.tsx` | tokens table, pulse dot |
| `src/app/[locale]/(dashboard)/_components/dashboard/dashboard-trend-section.tsx` | shadow-lg, valeur en grand |
| `src/components/monitoring-card.tsx` | glow sémantique helper |
| `src/components/monitoring-card/monitoring-card-header.tsx` | gradient map sur headers |
| `src/app/[locale]/(dashboard)/surveillance/monitoring-page-client.tsx` | fadeInUp wrapper, pulse dot stats, suppr séparateur |

## Contraintes techniques

- `motion/react` v12: toujours `LazyMotion features={domAnimation}` + `m.*`
- Stagger pattern: composants dans grille stagger → `variants` uniquement (pas d'`initial/animate`)
- Standalone page: `variants + initial="hidden" animate="visible"`
- Zéro `any` TypeScript, zéro erreur `tsc --noEmit`
- Tailwind v4: `bg-linear-to-br` (pas `bg-gradient-to-br`)
