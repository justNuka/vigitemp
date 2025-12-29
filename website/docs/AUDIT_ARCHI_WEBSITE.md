# Audit architecture & ménage — `website/` (Vigitemp)

Date : 2025-12-29  
Périmètre : dossier `website/` (Next.js / React / Prisma / Tailwind)

## TL;DR (constats principaux)

- **Stack cohérente** pour une app Next “App Router” (Next `^16.0.10`, React `19.2.1`, TypeScript `^5`, Tailwind `^3.4.1`, next-intl, TanStack Query).
- **Architecture globale OK** côté UI : `src/app/[locale]/(dashboard|admin|auth)` + composants + hooks.
- **Ménage prioritaire** : artefacts build (`website/.next`, `website/build.log`), duplication i18n (`website/messages` vs `website/src/messages`), et **gros code généré Prisma probablement obsolète** (`website/src/generated/prisma*`).
- **Incohérence majeure des routes API** : coexistence d’API “FR” et “EN” (`/api/groupes` vs `/api/groups`, `/api/alarmes` vs `/api/alarms`, etc.) avec **comportements et protections différentes** (auth/logging).
- **Middleware auth/i18n** : un fichier `website/src/proxy.ts` ressemble à un `middleware.ts`, mais **n’est pas chargé par Next** (nom/placement), donc potentiellement du code mort.

---

## 1) Dépendances (`website/package.json`)

### 1.1 Versions clés (déclarées)

- Next : `^16.0.10`
- React / React DOM : `19.2.1`
- Prisma : `^6.19.0` (`prisma` + `@prisma/client`)
- i18n : `next-intl ^4.6.1`
- UI : shadcn (via `components.json`), Radix UI (multiples packages), `lucide-react`, `sonner`
- State/data fetching : `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-virtual`
- Emails : `react-email`, `@react-email/components`, `@react-email/preview-server`
- Sécurité/auth : `bcryptjs`, `jsonwebtoken`
- Logs : `winston`, `winston-daily-rotate-file`
- Push : `web-push`, `@types/web-push` (attention : types en `dependencies`)

### 1.2 Dépendances suspectes / à confirmer

- **`framer-motion`** : aucune occurrence dans `website/src` → probablement **non utilisé** (vous utilisez `motion/react` via le package `motion`).
- **`swiper`** : aucune occurrence dans `website/src` → probablement **non utilisé**.
- **`@internationalized/date`** : aucune occurrence dans `website/src` → probablement **non utilisé** (à revérifier hors `src/` si besoin).

> Remarque : je n’ai pas lancé `depcheck` (pas d’installation réseau). Les “non utilisés” ci-dessus sont basés sur une recherche d’imports/occurrences dans le code.

### 1.3 Remarques outillage

- ESLint : présence de **deux configs** `website/.eslintrc.json` et `website/eslint.config.mjs` (flat config). À unifier (garder l’un, supprimer l’autre).
- `eslint-config-next` est en `16.0.7` alors que `next` est `^16.0.10` (pas bloquant, mais idéalement aligner).

---

## 2) Structure du projet `website/`

### 2.1 Top-level observé

- `website/src/` : app Next (UI + API routes)
- `website/prisma/` : 2 schémas (`db-main`, `db-mesure`) et migrations
- `website/emails/` : templates React Email
- `website/scripts/` : scripts utilitaires (smtp, cache monitor, etc.)
- `website/docs/` : documentation (déjà présent : `NOTIFICATIONS_ALARMES.md`)
- Artefacts présents localement : `website/.next/`, `website/node_modules/`, `website/build.log`

### 2.2 App Router + i18n

- Routeur App : `website/src/app/`
  - `website/src/app/[locale]/...` : pages localisées + route groups `(dashboard)`, `(admin)`, `(auth)`
  - `website/src/app/api/...` : route handlers Next (API)
- next-intl :
  - config plugin : `website/next.config.js` (via `next-intl/plugin`)
  - routing : `website/src/i18n/routing.ts`
  - request config : `website/src/i18n/request.ts`
  - messages : **deux emplacements** :
    - utilisé : `website/src/messages/en.json`, `website/src/messages/fr.json` (importés par `request.ts`)
    - doublon probable : `website/messages/en.json`, `website/messages/fr.json`

### 2.3 Middleware (point critique)

- Un middleware “proxy” existe : `website/src/proxy.ts`
  - gère locale prefix + routes protégées + redirections login
  - **mais Next ne le charge pas** car il n’est pas nommé/placé comme attendu (`middleware.ts` à la racine ou `src/middleware.ts`).
- En l’état, ce fichier est **probablement du code mort** ou du code copié depuis un ancien setup.

Recommandation : décider si vous voulez ce comportement.
- Si oui : créer/renommer en `website/src/middleware.ts` et retirer l’ancien.
- Si non : supprimer `website/src/proxy.ts` (après vérification qu’il n’est pas utilisé).

---

## 3) API routes : cohérence & risques

### 3.1 Doublons FR/EN dans `website/src/app/api/`

On observe des paires de dossiers :
- `alarmes` vs `alarms`
- `groupes` vs `groups`
- `lieux` vs `locations`
- `sondes` vs `sensors`

Constat : ces endpoints ne sont pas de simples alias :
- **schémas de réponse différents** (retour DB “brut” vs DTO front)
- **auth/logging différent**
  - ex : `website/src/app/api/groupes/route.ts` utilise `getAuthenticatedUser` + `withLogging`
  - ex : `website/src/app/api/groups/route.ts` ne vérifie pas l’auth
  - ex : `website/src/app/api/alarmes/route.ts` vérifie l’auth, `website/src/app/api/alarms/route.ts` non
  - ex : `website/src/app/api/sensors/route.ts` fait du logging avec user, mais **ne bloque pas** si non authentifié (GET/POST)

**Risque** : exposition involontaire de données ou de mutations (selon endpoints) via les routes “EN” non protégées.

### 3.2 Recommandation d’architecture API

Choisir **1 convention unique** et s’y tenir :
- Option A (recommandée) : API **non localisée** et stable (`/api/...` en anglais, ou en français, mais une seule version)
- Option B : garder une version, et faire des “alias” explicites (redirect/rewrite) **avec même auth/validation**

Ensuite :
- centraliser l’auth (ex : wrapper type `withAuth(withLogging(handler))`)
- standardiser les DTO (un seul format “front”)
- documenter les endpoints (même un simple `docs/api.md`)

---

## 4) Prisma & génération : état actuel

### 4.1 Double base (main + mesure)

- Schémas :
  - `website/prisma/db-main/schema.prisma` → output `website/src/generated/@prisma-db-main`
  - `website/prisma/db-mesure/schema.prisma` → output `website/src/generated/@prisma-db-mesure`
- Client : `website/src/lib/prisma.ts` expose `prisma` + `prismaMesure` (pattern singleton)

### 4.2 Gros code généré additionnel (à nettoyer)

Dans `website/src/generated/` on trouve aussi :
- `website/src/generated/prisma/`
- `website/src/generated/prisma-mesure/`

Indices forts que c’est **obsolète / non utilisé** :
- ces dossiers contiennent un “package prisma client” complet (runtime + gros fichiers) avec `version: "7.0.1"` dans `package.json`
- le code applicatif importe les clients depuis `website/src/generated/@prisma-db-*/client` (pas depuis `prisma/` ou `prisma-mesure/`)

Recommandation :
- confirmer l’absence d’imports de `src/generated/prisma*` (hors auto-références internes)
- puis **supprimer** ces dossiers et les ajouter à `.gitignore` si besoin

---

## 5) Artefacts & hygiène repo (ménage “facile”)

### 5.1 À ignorer (et idéalement à ne pas committer)

Présents dans le workspace :
- `website/.next/` (artefact build) → **à ajouter** à `website/.gitignore`
- `website/node_modules/` (OK : déjà ignoré)
- `website/build.log` (artefact) → à ignorer si généré localement

### 5.2 Fichiers à vérifier

- `website/.env` existe (et est listé dans `.gitignore`) : vérifier qu’il n’est **pas** commité.
- `website/tsconfig.json` inclut `public/serviceWorker.js` mais le fichier n’existe pas → nettoyer l’`include` ou réintroduire le fichier.
- `website/next-env.d.ts` contient `import "./.next/dev/types/routes.d.ts";` : c’est atypique (et fragile) car `.next` est généré. À supprimer si non indispensable.

---

## 6) Cohérence “front” : composants, hooks, conventions

### 6.1 Points positifs

- `website/src/components/` bien fourni, avec `components/ui/` (shadcn/Radix) et composants métier.
- `website/src/hooks/` + `website/src/lib/` : séparation correcte “UI / hooks / infra”.
- `next-intl` utilisé proprement côté layout `website/src/app/[locale]/layout.tsx`.

### 6.2 Incohérences à lisser

- Nommage mixte FR/EN : hooks (`useGroupes` vs `useGroups`), routes (`sondes` vs `sensors`) et DTO.
- Plusieurs styles d’accès API :
  - `website/src/lib/api.ts` (fetch + DTO “EN”)
  - hooks qui `fetch("/api/sondes")` / `fetch("/api/groupes")`
  - `axios` encore utilisé pour les mesures (`website/src/lib/hooks/use-measurements.ts`)

Recommandation : choisir une approche et standardiser :
- soit “un client API” (fetch/axios) + hooks TanStack Query partout
- soit “route handlers typés” + appels fetch uniformisés

---

## 7) Liste d’actions proposée (priorisée)

### P0 — Sécurité / exposition

- Unifier ou supprimer les endpoints doublons “EN” qui n’appliquent pas auth/logging (`/api/alarms`, `/api/groups`, etc.), ou au minimum les protéger comme les routes “FR”.

### P1 — Ménage & dette technique

- Supprimer/ignorer `website/.next/` et `website/build.log`.
- Supprimer le doublon i18n `website/messages/` (garder `website/src/messages/`).
- Supprimer `website/src/generated/prisma*` si confirmé non utilisé (et ajouter au `.gitignore`).
- Décider du statut de `website/src/proxy.ts` (middleware réel vs suppression).
- Unifier ESLint (`.eslintrc.json` vs `eslint.config.mjs`).
- Corriger `website/tsconfig.json` (référence vers `public/serviceWorker.js` inexistant).
- Nettoyer `website/next-env.d.ts` (import depuis `.next/`).

### P2 — Cohérence produit / maintenance

- Standardiser naming (FR vs EN) : choisir “langue du code” et migrer progressivement.
- Standardiser DTO et mapping DB → DTO dans un endroit dédié (`src/lib/mappers/` par ex).
- Documenter les conventions (petit `website/docs/ARCHITECTURE.md`).

---

## 8) Prochaine étape (quand tu veux)

Quand tu me dis “go”, on peut attaquer le ménage de façon safe, par itérations :
1) ignorer/supprimer les artefacts (`.next`, `build.log`, doublon messages)  
2) trancher middleware (`src/proxy.ts`)  
3) unifier les routes API (supprimer doublons + harden auth)  
4) nettoyer la génération Prisma (supprimer `src/generated/prisma*`)  

