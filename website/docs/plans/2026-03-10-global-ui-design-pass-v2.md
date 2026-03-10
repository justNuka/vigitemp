# Global UI Design Pass V2 — Design Document

**Date:** 2026-03-10

## Objectif

Étendre le traitement visuel Notion/Liveblocks (Style B) à toutes les pages et composants non encore couverts après la V1 (session précédente).

## Décisions utilisateur

- **Login :** Refonte complète — fond orbes animés CSS, card glassmorphism, entrée séquencée
- **Admin pages :** Stagger + visual improvements (DashboardLinkCard, SummaryCard) + skeleton shimmer remplaçant le spinner
- **Ordre :** Animations d'abord, puis visuel
- **Périmètre :** Composants partagés en priorité (effet multiplicateur), puis pages

## Ce qui a déjà été fait (V1)

- `globals.css` — `@keyframes shimmer` + `.animate-shimmer` ✅
- `src/lib/motion-variants.ts` — `fadeInUp`, `staggerContainer`, `scaleIn` ✅
- `monitoring-card.tsx` — tokens + hover + `m.div fadeInUp` ✅
- `monitoring-site-section.tsx` — stagger container ✅
- `tanstack-table.tsx` — shimmer skeleton + row fade-in ✅
- `page-header-base.tsx` — `m.h1` + alarm badge `AnimatePresence` ✅
- `dashboard-client.tsx` — stagger container ✅
- `monitoring-cards-grid.tsx` + `sensors-cards-grid.tsx` — CSS `order` fix ✅

## Architecture

- Library : `motion/react` v12 — toujours via `LazyMotion features={domAnimation}` + `m.*`
- Variants partagés : `src/lib/motion-variants.ts` (déjà existant)
- Nouveaux keyframes CSS dans `globals.css` uniquement
- Aucune nouvelle dépendance npm

## Design par section

### 1. Login (`src/app/[locale]/login/login-form.tsx`)

**Fond animé :** 3 orbes CSS (`@keyframes blob`) en `absolute` avec `blur-3xl opacity-30`, couleurs `primary/20`, `blue-500/15`, `purple-500/15`. Animations décalées via `.animation-delay-2000` et `.animation-delay-4000`.

**Card glassmorphism :**
```tsx
<Card className="bg-background/70 backdrop-blur-xl border border-border/50 shadow-2xl">
```

**Séquence d'entrée via `m.div` + delays croissants :**
- Logo : `initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}` delay 0ms
- Badge licence : `scale 0.9→1` delay 150ms
- Titre/sous-titre : `y 12→0` delay 250ms
- Card : `y 16→0, opacity 0→1` delay 380ms

**Globals.css — ajouter :**
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -50px) scale(1.1); }
  66%       { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
```

### 2. `DashboardLinkCard` (`src/components/dashboard-link-card.tsx`)

- Root : `m.div variants={fadeInUp}` (LazyMotion requis au niveau parent ou dans le composant)
- Card className additions : `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:bg-linear-to-br hover:from-card hover:to-primary/5 cursor-pointer`
- Icône dans badge coloré : `<div className="p-2.5 rounded-xl bg-primary/10 text-primary">{icon}</div>`

### 3. `StatCard` (`src/components/stat-card.tsx`)

- Wrapper : `m.div variants={fadeInUp}` (via LazyMotion parent)
- Icône dans badge coloré cohérent avec DashboardLinkCard

### 4. `EmptyState` (`src/components/empty-state.tsx`)

- Root : `m.div variants={scaleIn}` (LazyMotion requis)

### 5. Admin dashboard (`src/app/[locale]/(admin)/admin/page.tsx`)

**Grille de cards :**
```tsx
<LazyMotion features={domAnimation}>
  <m.div
    className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3"
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
  >
    {/* SummaryCards avec m.div variants={fadeInUp} */}
  </m.div>
</LazyMotion>
```

**`SummaryCard` :**
- `m.div variants={fadeInUp}` sur le Card
- Icône dans badge coloré (même pattern)
- Hover : `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`

**Loading state :** Remplacer le spinner `animate-spin` par une grille de 6 skeleton cards :
```tsx
<div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="rounded-lg h-[160px] animate-shimmer" />
  ))}
</div>
```

**DashboardLinkCard grid (edition basic) :** même stagger container

### 6. Pages admin avec tables

Pour chaque page-client (sondes, utilisateurs, lieux, groupes, audit, parametres, groupes, etalons, sites, actionneurs) — wrapping du contenu principal :

```tsx
<LazyMotion features={domAnimation}>
  <m.div
    className="flex min-h-full flex-col"
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
  >
    {/* PageHeader + contenu */}
  </m.div>
</LazyMotion>
```

Note : TanStack table a déjà les row animations, le wrapper page ajoute juste l'entrée globale.

## Fichiers à modifier

| Fichier | Type | Changements |
|---|---|---|
| `src/app/globals.css` | CSS | `@keyframes blob` + `.animate-blob` + `.animation-delay-*` |
| `src/app/[locale]/login/login-form.tsx` | Client | Fond animé + glassmorphism + séquence |
| `src/components/dashboard-link-card.tsx` | Composant | `m.div fadeInUp` + hover + icône badge |
| `src/components/stat-card.tsx` | Composant | `m.div fadeInUp` + icône badge |
| `src/components/empty-state.tsx` | Composant | `m.div scaleIn` |
| `src/app/[locale]/(admin)/admin/page.tsx` | Page | Stagger grille + skeleton loading + SummaryCard hover |
| `src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/sondes/sensors-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/lieux/locations-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/groupes/groups-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/audit/audit-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/parametres/_components/general-settings-card.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/sites/sites-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/modules/module-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/etalons/standards-client.tsx` | Page | Wrapper `fadeInUp` |
| `src/app/[locale]/(admin)/admin/actionneurs/actuators-client.tsx` | Page | Wrapper `fadeInUp` |

## Contraintes techniques

- Toujours `LazyMotion features={domAnimation}` + `m.*` (jamais `motion.*`)
- `useReducedMotion()` : les variants déjà dans `motion-variants.ts` respectent ce hook via `PageTransitionWrapper` ; pour les animations inline (login), ajouter `transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}`
- Tailwind v4 : `bg-linear-to-r` (pas `bg-gradient-to-r`)
- TypeScript strict : zéro `any`, types explicites

## Vérification

1. `cd website && npx tsc --noEmit` → 0 erreurs
2. Login : fond animé visible, card glass, entrée séquencée
3. Admin dashboard : skeleton au lieu du spinner, stagger sur les cards
4. DashboardLinkCard : hover visible, icône dans badge
5. Pages admin : fade-in à l'entrée
6. EmptyState : scale-in à l'affichage
