# Global UI Design Pass V2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Étendre le traitement visuel Notion/Liveblocks à toutes les pages et composants non couverts par la V1 — login glassmorphism, DashboardLinkCard redesign, admin dashboard skeleton + stagger, et wrapper fadeInUp sur toutes les pages admin.

**Architecture:** Même pattern que V1 — `LazyMotion features={domAnimation}` + `m.*` (jamais `motion.*`), variants depuis `src/lib/motion-variants.ts`. CSS pur pour l'animation blob du login (aucun JS). Pas de nouvelle dépendance npm.

**Tech Stack:** `motion/react` (LazyMotion, m), Tailwind v4, shadcn/ui tokens, Next.js 16 App Router

---

## Contexte important

- **Variants existants** dans `src/lib/motion-variants.ts` : `fadeInUp`, `staggerContainer`, `scaleIn` — utiliser tels quels
- **`animate-fade-in`** est une classe CSS custom utilisée dans plusieurs `*-client.tsx` — la remplacer par `motion` dans les tâches concernées
- **Tailwind v4** : utiliser `bg-linear-to-r` (pas `bg-gradient-to-r`), `from-card`, `to-primary/5`
- **TypeScript strict** : zéro `any`, imports typés
- **Vérification TypeScript** : `cd website && npx tsc --noEmit` (doit retourner 0 erreur)

---

## Task 1 : globals.css — ajouter @keyframes blob

**Files:**
- Modify: `website/src/app/globals.css` (ligne 64, après `.animate-shimmer { ... }`)

**Step 1 : Insérer les keyframes et utilitaires blob**

Ouvrir `website/src/app/globals.css`. Après la règle `.animate-shimmer { ... }` (qui se termine vers la ligne 64), ajouter avant `.embla` :

```css
  @keyframes blob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -50px) scale(1.1); }
    66%       { transform: translate(-20px, 20px) scale(0.9); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
```

**Step 2 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```
Expected : 0 erreurs.

**Step 3 : Commit**

```bash
cd website && git add src/app/globals.css && git commit -m "style: add blob keyframes and animation-delay utilities to globals.css"
```

---

## Task 2 : DashboardLinkCard — redesign complet

**Files:**
- Modify: `website/src/components/dashboard-link-card.tsx`

**Step 1 : Lire le fichier actuel**

Le fichier actuel (46 lignes) utilise `bg-white/90 dark:bg-slate-900/70`, `border-slate-200 dark:border-slate-800`, et un wrapper `div` simple. On va :
1. Migrer vers les tokens shadcn (`bg-card`, `border-border`)
2. Envelopper dans `m.div variants={fadeInUp}` avec `LazyMotion`
3. Mettre l'icône dans un badge coloré `bg-primary/10 text-primary`
4. Ajouter hover gradient `hover:bg-linear-to-br hover:from-card hover:to-primary/5`
5. Lien titre en `text-foreground group-hover:text-primary`

**Step 2 : Réécrire le fichier**

```tsx
"use client"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

export type DashboardLinkCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
  className?: string;
};

export function DashboardLinkCard({
  title,
  description,
  href,
  icon,
  badge,
  className,
}: DashboardLinkCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={fadeInUp}
        className={cn(
          "group rounded-xl border border-border bg-card p-4 shadow-sm",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          "hover:bg-linear-to-br hover:from-card hover:to-primary/5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                {icon}
              </div>
            ) : null}
            <div className="space-y-1">
              <Link
                href={href}
                className="inline-flex items-center gap-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary"
              >
                {title}
                <ArrowRight className="h-4 w-4 translate-x-[-2px] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {badge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
      </m.div>
    </LazyMotion>
  );
}
```

**Step 3 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```
Expected : 0 erreurs.

**Step 4 : Commit**

```bash
cd website && git add src/components/dashboard-link-card.tsx && git commit -m "style: redesign DashboardLinkCard with shadcn tokens, icon badge, hover effects and fadeInUp"
```

---

## Task 3 : StatCard — ajouter fadeInUp wrapper

**Files:**
- Modify: `website/src/components/stat-card.tsx`

Le `StatCard` a déjà un bon design de base avec `variantStyles`. On ajoute juste `LazyMotion + m` wrapper sur le `Card` root.

**Step 1 : Modifier le fichier**

Ajouter les imports en haut :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
```

Envelopper le `Card` dans un `m.div` :
```tsx
  return (
    <LazyMotion features={domAnimation}>
      <m.div variants={fadeInUp}>
        <Card className={cn("overflow-visible", styles.card, className)}>
          {/* contenu inchangé */}
        </Card>
      </m.div>
    </LazyMotion>
  );
```

**Step 2 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 3 : Commit**

```bash
cd website && git add src/components/stat-card.tsx && git commit -m "style: add fadeInUp motion wrapper to StatCard"
```

---

## Task 4 : EmptyState — ajouter scaleIn wrapper

**Files:**
- Modify: `website/src/components/empty-state.tsx`

**Step 1 : Modifier le fichier**

Ajouter les imports :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
import { scaleIn } from "@/lib/motion-variants";
```

Remplacer le `div` root par `m.div variants={scaleIn}` avec `LazyMotion` :
```tsx
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
      >
        <div className="p-4 rounded-full bg-muted mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} data-testid="button-empty-action">
            {action.label}
          </Button>
        )}
      </m.div>
    </LazyMotion>
  );
```

Note : `EmptyState` utilise `initial/animate` directement (pas via parent stagger) car il est affiché de façon conditionnelle, pas dans une grille stagger.

**Step 2 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 3 : Commit**

```bash
cd website && git add src/components/empty-state.tsx && git commit -m "style: add scaleIn motion wrapper to EmptyState"
```

---

## Task 5 : Login — fond animé, glassmorphism, entrée séquencée

**Files:**
- Modify: `website/src/app/[locale]/login/login-form.tsx`

**Step 1 : Ajouter imports**

En haut du fichier, après les imports existants :
```tsx
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
```

**Step 2 : Modifier le JSX retourné**

Le `return` actuel commence par :
```tsx
<div className="min-h-screen flex flex-col items-center justify-between p-4 bg-linear-to-br from-background via-background to-muted/20">
```

Remplacer l'intégralité du `return` par :

```tsx
  const shouldReduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  const dur = shouldReduceMotion ? 0 : 0.5;

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen flex flex-col items-center justify-between p-4 overflow-hidden bg-background">
        {/* Orbes animés CSS */}
        {!shouldReduceMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="animate-blob animation-delay-0 absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl opacity-60" />
            <div className="animate-blob animation-delay-2000 absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl opacity-60" />
            <div className="animate-blob animation-delay-4000 absolute bottom-1/4 left-1/3 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl opacity-60" />
          </div>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
          {/* Logo */}
          <m.div
            className="flex flex-col items-center text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease }}
          >
            <Logo size="lg" showText />
            <m.span
              className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: dur, ease, delay: shouldReduceMotion ? 0 : 0.15 }}
            >
              {licenseLabel}
            </m.span>
          </m.div>

          {/* Titre */}
          <m.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease, delay: shouldReduceMotion ? 0 : 0.25 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </m.div>

          {/* Card glassmorphism */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, ease, delay: shouldReduceMotion ? 0 : 0.38 }}
          >
            <Card className="bg-background/70 backdrop-blur-xl border border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle>{t("card.title")}</CardTitle>
                <CardDescription>
                  {t("card.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <>
                  {showInactivityMessage && (
                    <LoginInactivityAlert message={t("inactivity_alert")} />
                  )}

                  <LoginCredentialsForm
                    register={register}
                    errors={errors}
                    onSubmit={handleSubmit(handleFormSubmit, (errors) => showFormValidationToast(errors))}
                    onForgotPassword={() => setShowForgotPassword(true)}
                    isSubmitting={loginMutation.isPending}
                    translations={{
                      usernameLabel: t("fields.username_label"),
                      usernamePlaceholder: t("fields.username_placeholder"),
                      passwordLabel: t("fields.password_label"),
                      passwordPlaceholder: t("fields.password_placeholder"),
                      signingIn: t("buttons.signing_in"),
                      signIn: t("buttons.sign_in"),
                      forgotPassword: t("buttons.forgot_password"),
                    }}
                  />
                </>
              </CardContent>
            </Card>
          </m.div>

          <p className="text-center text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <p className="relative z-10 w-full text-center text-xs text-muted-foreground/70 pb-4">
          Vigi<span className="font-semibold">Sensys</span> - MC2 Lab
        </p>

        <ForgotPasswordDialog
          open={showForgotPassword}
          onOpenChange={handleCloseForgotPassword}
          success={resetSuccess}
          register={registerReset}
          errors={resetErrors}
          onSubmit={handleResetSubmit(handleResetPasswordSubmit)}
          onClose={handleCloseForgotPassword}
          isSubmitting={resetPasswordMutation.isPending}
          translations={{
            title: t("reset_modal.title"),
            description: t("reset_modal.description"),
            emailLabel: t("fields.reset_email_label"),
            emailPlaceholder: t("fields.reset_email_placeholder"),
            successMessage: t("reset_modal.success_message"),
            cancel: tCommon("cancel"),
            send: t("buttons.send"),
            sending: t("buttons.sending"),
            close: tCommon("close"),
          }}
        />
      </div>
    </LazyMotion>
  );
```

Note : `useReducedMotion()` doit être appelé au niveau du composant (pas dans le JSX). Le placer avec les autres hooks existants en haut de `LoginForm`.

**Step 3 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```
Expected : 0 erreurs.

**Step 4 : Commit**

```bash
cd website && git add src/app/[locale]/login/login-form.tsx && git commit -m "style: add animated background, glassmorphism card and sequenced entrance to login page"
```

---

## Task 6 : Admin dashboard — skeleton loading + stagger grille + SummaryCard hover

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/page.tsx`

**Step 1 : Ajouter imports**

Ajouter en haut, après les imports existants :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
import { staggerContainer, fadeInUp } from "@/lib/motion-variants";
```

**Step 2 : Remplacer le spinner de loading (ligne ~237)**

Remplacer :
```tsx
  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }
```

Par :
```tsx
  if (isInitialLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t("title")} />
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl h-[160px] animate-shimmer" />
          ))}
        </div>
      </div>
    )
  }
```

**Step 3 : Ajouter hover + m.div à SummaryCard**

La fonction `SummaryCard` (lignes ~51-88) — modifier le `Card` pour ajouter hover et le wrapper `m.div` :

```tsx
function SummaryCard({...}: SummaryCardProps) {
  return (
    <m.div variants={fadeInUp}>
      <Card className="card-interactive border-border/60 bg-card shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        {/* contenu inchangé */}
      </Card>
    </m.div>
  )
}
```

**Step 4 : Envelopper les grilles de SummaryCards avec stagger**

Dans le return principal (~ ligne 248), remplacer :
```tsx
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
```
Par :
```tsx
      <LazyMotion features={domAnimation}>
        <m.div
          className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
```
Et fermer avec `</m.div></LazyMotion>` à la place de `</div>`.

Faire de même pour la grille `DashboardLinkCard` dans le return `isBasicDashboard` (~ ligne 197).

Note : La grille `ExpertAdminDashboard` est dans un composant séparé — ne pas toucher ici.

**Step 5 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 6 : Commit**

```bash
cd website && git add "src/app/[locale]/(admin)/admin/page.tsx" && git commit -m "style: add skeleton loading, stagger grid and hover effects to admin dashboard"
```

---

## Task 7 : Pages admin — remplacer animate-fade-in par m.main fadeInUp

Cette tâche couvre 5 fichiers qui ont tous le même pattern : `<main className="flex-1 ... animate-fade-in">`.

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx` (ligne 186)
- Modify: `website/src/app/[locale]/(admin)/admin/groupes/groups-client.tsx` (ligne 88)
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/locations-client.tsx` (ligne 154)
- Modify: `website/src/app/[locale]/(admin)/admin/audit/audit-client.tsx` (ligne 283)
- Modify: `website/src/app/[locale]/(admin)/admin/sondes/sensors-client.tsx` (ligne 102, pattern différent)

**Step 1 : Pour chaque fichier avec `<main className="... animate-fade-in">`**

Ajouter imports dans chaque fichier :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
```

Remplacer le `<main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">` par :
```tsx
<LazyMotion features={domAnimation}>
  <m.main
    className="flex-1 p-4 md:p-6 space-y-6"
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
  >
```
Et à la fin : `</m.main></LazyMotion>` à la place de `</main>`.

Notes par fichier :
- `users-client.tsx` : `space-y-6`, fermer avant les dialogs (les dialogs sont dans le même `main` — les laisser à l'intérieur)
- `groups-client.tsx` : `space-y-6`
- `locations-client.tsx` : `space-y-6`
- `audit-client.tsx` : `space-y-4` (différent !) → conserver `space-y-4` dans le className

**Step 2 : Pour `sensors-client.tsx`** (pattern différent — `<div className="space-y-6">`)

Ajouter imports :
```tsx
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
```

Remplacer `<div className="space-y-6">` par :
```tsx
<LazyMotion features={domAnimation}>
  <m.div
    className="space-y-6"
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
  >
```
Et fermer avec `</m.div></LazyMotion>`.

**Step 3 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```
Expected : 0 erreurs.

**Step 4 : Commit**

```bash
cd website && git add \
  "src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx" \
  "src/app/[locale]/(admin)/admin/groupes/groups-client.tsx" \
  "src/app/[locale]/(admin)/admin/lieux/locations-client.tsx" \
  "src/app/[locale]/(admin)/admin/audit/audit-client.tsx" \
  "src/app/[locale]/(admin)/admin/sondes/sensors-client.tsx" \
  && git commit -m "style: replace animate-fade-in with motion fadeInUp on admin client pages"
```

---

## Task 8 : Pages admin restantes — même traitement fadeInUp

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/modules/module-client.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/sites/sites-client.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/etalons/standards-client.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/actionneurs/actuators-client.tsx`

**Step 1 : Identifier le pattern de return dans chaque fichier**

Lire le `return (` de chaque fichier. Le pattern sera soit :
- `<main className="flex-1 ... animate-fade-in">` → même remplacement que Task 7
- `<div className="...">` → envelopper avec `LazyMotion + m.div fadeInUp initial="hidden" animate="visible"`

**Step 2 : Appliquer le même traitement que Task 7**

Ajouter imports `LazyMotion, domAnimation, m` + `fadeInUp`, puis wrapper approprié.

**Step 3 : Vérifier TypeScript**

```bash
cd website && npx tsc --noEmit
```

**Step 4 : Commit**

```bash
cd website && git add \
  "src/app/[locale]/(admin)/admin/modules/module-client.tsx" \
  "src/app/[locale]/(admin)/admin/sites/sites-client.tsx" \
  "src/app/[locale]/(admin)/admin/etalons/standards-client.tsx" \
  "src/app/[locale]/(admin)/admin/actionneurs/actuators-client.tsx" \
  && git commit -m "style: add fadeInUp entrance animation to remaining admin client pages"
```

---

## Vérification finale

```bash
cd website && npx tsc --noEmit
```
Expected : 0 erreurs TypeScript.

Checklist manuelle :
1. Login : fond avec orbes bleutés animés, card légèrement glass, entrée séquencée logo → badge → titre → card
2. Admin dashboard : 6 skeleton cards pendant le loading (pas de spinner), stagger sur les SummaryCards
3. `DashboardLinkCard` : hover gradient, icône dans badge bg-primary/10, titre devient `text-primary` au hover
4. `StatCard` : fade-in à l'entrée
5. `EmptyState` : scale-in à l'affichage
6. Pages admin (sondes, utilisateurs, lieux, groupes, audit, modules, sites, etalons, actionneurs) : fade-in à l'entrée de page
7. Aucun `animate-fade-in` résiduel sur les pages modifiées
