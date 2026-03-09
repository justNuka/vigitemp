# Global UI/UX & Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply a coherent Notion/Liveblocks-style visual pass across all pages — modernize MonitoringCard tokens, add stagger fade-in animations on grids/tables, shimmer skeletons, and wire the existing `PageTransitionWrapper` into the dashboard layout.

**Architecture:** Use the already-installed `motion` library (v12.32.0, formerly Framer Motion) via the `LazyMotion + domAnimation + m` pattern that already exists in `PageTransitionWrapper`. A shared `motion-variants.ts` provides reusable variants. No new npm packages needed.

**Tech Stack:** `motion/react` (LazyMotion, AnimatePresence, m, useReducedMotion), Tailwind v4, shadcn/ui tokens, Next.js 16 App Router

---

## Context

- `PageTransitionWrapper` already exists at `src/components/animations/transitions/page-transitions/PageTransitionWrapper.tsx` — it uses `LazyMotion features={domAnimation}` + `AnimatePresence` + `m.div` + `useReducedMotion`. **Do not recreate it.**
- Admin layout (`src/app/[locale]/(admin)/layout.tsx`) **already uses** `PageTransitionWrapper`. Only the dashboard layout is missing it.
- Dashboard layout renders `DashboardShell` at `src/app/[locale]/(dashboard)/layout.tsx` → look for `DashboardShell` file.
- `MonitoringCard` at `src/components/monitoring-card.tsx` still uses `bg-white dark:bg-gray-800` — needs migration to shadcn tokens (`bg-card`, `border-border`, etc.)
- `monitoring-site-section.tsx` already has `animate-fade-in` on expanded sections. We'll upgrade this to `motion` stagger.
- `TanStackTable` at `src/components/data-table/tanstack-table.tsx` has `isLoading` state. We'll add shimmer + stagger.
- `globals.css` needs a `@keyframes shimmer` for improved skeleton animation.

---

## Task 1: Add shimmer keyframe to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add the keyframe and utility class**

In `globals.css`, inside the `@layer utilities` block, add after the existing scrollbar rules:

```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.animate-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.08) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**Step 2: Verify TypeScript is unaffected**

```bash
cd website && npx tsc --noEmit
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add website/src/app/globals.css
git commit -m "style: add shimmer keyframe and utility class to globals.css"
```

---

## Task 2: Shared motion variants

**Files:**
- Create: `src/lib/motion-variants.ts`

**Step 1: Create the file**

```typescript
// src/lib/motion-variants.ts
// Shared motion/react variants for consistent animations across the app.
// Uses LazyMotion-compatible plain objects (no `motion` import needed here).

export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
}
```

**Step 2: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add website/src/lib/motion-variants.ts
git commit -m "feat: add shared motion variants (fadeInUp, staggerContainer, scaleIn)"
```

---

## Task 3: Add PageTransitionWrapper to dashboard layout

**Files:**
- Modify: `src/app/[locale]/(dashboard)/layout.tsx` — or `DashboardShell` if it exists

**Step 1: Find DashboardShell**

Check if `src/app/[locale]/(dashboard)/dashboard-shell.tsx` exists. If it doesn't exist, the transition goes directly in `layout.tsx`.

**Step 2: Add PageTransitionWrapper**

In the dashboard layout (`src/app/[locale]/(dashboard)/layout.tsx`), import and wrap children:

```typescript
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper"

// Inside the return, wrap {children} with:
<PageTransitionWrapper>
  {children}
</PageTransitionWrapper>
```

If `DashboardShell` renders `children` inside a `<main>` or similar container, add `PageTransitionWrapper` there instead, wrapping only the content area (not the sidebar).

**Step 3: Verify no visual regression**

Run the dev server (`cd website && npm run dev`) and navigate between dashboard pages — confirm smooth fade transition.

**Step 4: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add website/src/app/[locale]/\(dashboard\)/layout.tsx
git commit -m "feat: add PageTransitionWrapper to dashboard layout for page transitions"
```

---

## Task 4: Modernize MonitoringCard — tokens + hover + motion

**Files:**
- Modify: `src/components/monitoring-card.tsx`

**Step 1: Read the file fully**

Read `src/components/monitoring-card.tsx` in full before editing.

**Step 2: Replace legacy Tailwind tokens**

Replace the outer `<div>` className (line ~242):
```
// Before
className={`relative w-full rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col ${isSurveillanceActive ? 'bg-white dark:bg-gray-800' : 'bg-slate-700 dark:bg-gray-800'}`}

// After
className={cn(
  "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
  "hover:shadow-lg hover:-translate-y-0.5",
  isSurveillanceActive
    ? "bg-card border-border shadow-sm"
    : "bg-slate-700 dark:bg-slate-800 border-slate-600"
)}
```

Replace content area separators — look for `border-gray-200 dark:border-gray-700` and replace with `border-border`:
```
// Before
className="mt-auto space-y-3 text-sm border-t border-gray-200 dark:border-gray-700 pt-3"
// After
className="mt-auto space-y-3 text-sm border-t border-border pt-3"
```
(Same for the action buttons separator)

Replace `contentTextClassName` and related:
```typescript
// Before
const contentTextClassName = isSurveillanceActive ? 'text-gray-600 dark:text-gray-400' : 'text-white'
const actionButtonClassName = isSurveillanceActive ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'hover:bg-white/10'
const actionIconClassName = isSurveillanceActive ? 'text-gray-600 dark:text-gray-400' : 'text-white'

// After
const contentTextClassName = isSurveillanceActive ? 'text-muted-foreground' : 'text-white'
const actionButtonClassName = isSurveillanceActive ? 'hover:bg-muted' : 'hover:bg-white/10'
const actionIconClassName = isSurveillanceActive ? 'text-muted-foreground' : 'text-white'
```

Replace `text-gray-500 dark:text-gray-400` on no-measurements text:
```
// Before
className="text-center text-gray-500 dark:text-gray-400 italic py-3"
// After
className="text-center text-muted-foreground italic py-3"
```

**Step 3: Wrap with motion for stagger animations**

Add these imports at the top of the file:
```typescript
import { LazyMotion, domAnimation, m } from "motion/react"
import { fadeInUp } from "@/lib/motion-variants"
```

Wrap the outer returned `<div>` (the card root) with `LazyMotion + m.div`:
```tsx
// Wrap the outer fragment in LazyMotion, replace the outer card div:
return (
  <LazyMotion features={domAnimation}>
    <m.div
      variants={fadeInUp}
      className={cn(
        "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        isSurveillanceActive
          ? "bg-card border-border shadow-sm"
          : "bg-slate-700 dark:bg-slate-800 border-slate-600"
      )}
    >
      {/* ... all existing inner content unchanged ... */}
    </m.div>

    {/* Keep Dialog and MonitoringDetailsModal outside m.div but inside LazyMotion */}
    <Dialog ...>...</Dialog>
    {isModalOpen ? <MonitoringDetailsModal ...> : null}
    <AlarmAcknowledgeDialog .../>
  </LazyMotion>
)
```

Note: The `variants` on `m.div` only animate when a parent uses `staggerContainer` variant (Task 5). If used standalone, the card renders normally without animation (variants require a parent to trigger them).

**Step 4: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add website/src/components/monitoring-card.tsx
git commit -m "style: modernize MonitoringCard tokens (bg-card, border-border) + hover lift + motion variant"
```

---

## Task 5: Add stagger animation to MonitoringSiteSection card grids

**Files:**
- Modify: `src/app/[locale]/(dashboard)/surveillance/_components/monitoring-site-section.tsx`

**Step 1: Read the full file**

Read `monitoring-site-section.tsx` fully to understand the structure. Cards are rendered inside groups, which are inside sites.

**Step 2: Add motion stagger to card grids**

Add imports:
```typescript
import { LazyMotion, domAnimation, m } from "motion/react"
import { staggerContainer } from "@/lib/motion-variants"
```

Find where MonitoringCard components are rendered in a grid (look for `grid` className with MonitoringCard inside). Wrap the grid `<div>` with `m.div` using `staggerContainer`:
```tsx
// Before: <div className="grid grid-cols-... gap-...">
// After:
<m.div
  className="grid grid-cols-... gap-..."
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {/* MonitoringCard items — they already have fadeInUp variant from Task 4 */}
</m.div>
```

Also remove the `animate-fade-in` class from the expanded site container (line ~124) since motion handles it now.

**Step 3: Wrap in LazyMotion**

Wrap the whole component return in `<LazyMotion features={domAnimation}>` to support lazy loading of motion features.

**Step 4: Verify TypeScript + visual check**

```bash
cd website && npx tsc --noEmit
```

Visually confirm cards stagger in on page load.

**Step 5: Commit**

```bash
git add "website/src/app/[locale]/(dashboard)/surveillance/_components/monitoring-site-section.tsx"
git commit -m "feat: add stagger fade-in animation to monitoring card grids"
```

---

## Task 6: Shimmer + stagger in TanStackTable

**Files:**
- Modify: `src/components/data-table/tanstack-table.tsx`

**Step 1: Read the full file**

Read `tanstack-table.tsx` fully, especially the `isLoading` skeleton section and the `TableRow` rendering.

**Step 2: Replace skeleton rows with shimmer**

Find the loading skeleton rows (where `isLoading` renders `Skeleton` components). Replace with `animate-shimmer` class:

```tsx
// Find the skeleton TableRow and replace Skeleton components with shimmer divs:
<TableRow key={`skeleton-${i}`}>
  {columns.map((_, j) => (
    <TableCell key={j}>
      <div className="h-4 rounded animate-shimmer" />
    </TableCell>
  ))}
</TableRow>
```

**Step 3: Add stagger animation to data rows**

Add imports:
```typescript
import { LazyMotion, domAnimation, m } from "motion/react"
import { staggerContainer, fadeInUp } from "@/lib/motion-variants"
```

Wrap `<TableBody>` with `m.tbody` (or wrap a `<tbody>` equivalent) — since shadcn's `TableBody` renders a `<tbody>`, use `asChild` pattern or replace with `m` component:

```tsx
// Replace <TableBody> with a motion-enabled version:
// Option: wrap table rows in AnimatePresence + use m.tr

// Add to TableBody rendering when not loading:
<TableBody>
  {table.getRowModel().rows.map((row, index) => (
    <m.tr
      key={row.id}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </m.tr>
  ))}
</TableBody>
```

Cap the stagger at 10 rows to avoid long delay: `transition={{ delay: Math.min(index, 10) * 0.04, ... }}`.

Wrap the whole table in `<LazyMotion features={domAnimation}>`.

**Step 4: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add website/src/components/data-table/tanstack-table.tsx
git commit -m "feat: add shimmer skeleton + stagger row animation to TanStackTable"
```

---

## Task 7: PageHeaderBase — motion title + AnimatePresence badge

**Files:**
- Modify: `src/components/page-header-base.tsx`

**Step 1: Read the full file**

Already read — the badge `Button` for active alarms is conditionally rendered via `{activeAlarms > 0 && (...)}`.

**Step 2: Add motion imports**

```typescript
import { LazyMotion, domAnimation, m, AnimatePresence } from "motion/react"
```

**Step 3: Animate the h1 title**

Replace `<h1 className="...">` with `<m.h1>`:
```tsx
<m.h1
  className="text-lg md:text-xl font-semibold tracking-tight truncate"
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
>
  {title}
</m.h1>
```

**Step 4: Wrap the alarm badge with AnimatePresence**

```tsx
<AnimatePresence>
  {activeAlarms > 0 && (
    <m.div
      key="alarm-badge"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.18 }}
    >
      {/* existing alarm badge content (Link/Button or Tooltip/Button) */}
    </m.div>
  )}
</AnimatePresence>
```

**Step 5: Wrap in LazyMotion**

Wrap the `<header>` element return in `<LazyMotion features={domAnimation}>`.

**Step 6: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add website/src/components/page-header-base.tsx
git commit -m "feat: animate PageHeaderBase title + AnimatePresence on alarm badge"
```

---

## Task 8: Dashboard home — stagger sections

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard-client.tsx` (or the relevant client component that renders KPI cards and sections)

**Step 1: Find the right file**

The dashboard home page is at `src/app/[locale]/(dashboard)/page.tsx` (server component). It renders `<DashboardClient>`. Read `dashboard-client.tsx` to find where KPI cards and sections are rendered.

**Step 2: Add stagger to section containers**

In `DashboardClient`, find the sections grid/list. Add motion stagger:

```typescript
import { LazyMotion, domAnimation, m } from "motion/react"
import { staggerContainer, fadeInUp } from "@/lib/motion-variants"
```

Wrap the main content sections container:
```tsx
<LazyMotion features={domAnimation}>
  <m.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className="..." // keep existing className
  >
    {/* Each section wrapped in m.div with fadeInUp variant */}
    <m.div variants={fadeInUp}>
      {/* KPI stats section */}
    </m.div>
    <m.div variants={fadeInUp}>
      {/* Alarms section */}
    </m.div>
    <m.div variants={fadeInUp}>
      {/* Trend section */}
    </m.div>
  </m.div>
</LazyMotion>
```

**Step 3: Verify TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add "website/src/app/[locale]/(dashboard)/dashboard-client.tsx"
git commit -m "feat: add stagger fade-in to dashboard home sections"
```

---

## Task 9: Final TypeScript check + visual review

**Step 1: Full TypeScript check**

```bash
cd website && npx tsc --noEmit 2>&1
```
Expected: 0 errors.

**Step 2: Fix any remaining errors**

If errors exist, fix them before proceeding.

**Step 3: Final commit if needed**

```bash
git add -p
git commit -m "fix: resolve TypeScript errors from UI animations pass"
```

**Step 4: Summary**

Verify visually:
- Dashboard pages: smooth fade-in on navigation
- Monitoring grid: cards stagger in on load
- Admin tables: rows stagger in + shimmer skeleton during loading
- PageHeaderBase: title animates on mount, alarm badge fades in/out
- MonitoringCard: `bg-card` token, hover lift effect

---

## Notes for the implementer

- **Import pattern**: always use `LazyMotion features={domAnimation}` + `m.div` (not `motion.div`) to keep bundle size small. This is the existing project pattern.
- **`useReducedMotion`**: `PageTransitionWrapper` already handles it. For new components, respect `prefers-reduced-motion` by checking `useReducedMotion()` if adding complex animations.
- **Tailwind v4**: use `bg-linear-to-r` not `bg-gradient-to-r`.
- **Zero new dependencies**: `motion` is already in `package.json`.
- **Never use `any`** — TypeScript strict mode is enforced.
- **Server components** (like `page.tsx`): cannot use `motion`. Only add motion to `"use client"` components.
