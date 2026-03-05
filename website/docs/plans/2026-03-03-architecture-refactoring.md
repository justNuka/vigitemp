# Architecture Refactoring Plan — Next.js 16 / Prisma / React 19

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Improve the Next.js 16 codebase across 13 dimensions ordered by impact: performance, type safety, error handling, and maintainability.

**Architecture:** 13 incremental improvements, each self-contained and committable independently. No breaking changes to API contracts. Verification is TypeScript (`npx tsc --noEmit` — 0 errors expected) + build (`npm run build` in `website/`) after each task.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Prisma (3 clients: db-main via `prisma`, db-mesures via `prismaMesure`, vigi_chat via `prismaChat` — see `website/src/lib/prisma.ts`), Zod (already installed), Winston logger (`website/src/lib/logger.ts`).

**Working directory for all commands:** `c:\VigitempProject\vigitemp\website`

**Key files to understand before implementing:**
- `src/lib/api-response.ts` — `apiOk<T>()` / `apiError()` helpers
- `src/lib/api-wrappers.ts` — `withAuthLogging`, `withAdminLogging` decorators (sliding JWT)
- `src/lib/api-logger.ts` — `withLogging` base wrapper
- `src/lib/logger.ts` — `log.error(label, message, meta?)` structured logging
- `src/lib/authz.ts` — `isAdminUser`, `hasUserAuthorizationCode`, `hasUserAnyAuthorizationCode`

---

### Task 1: Fix N+1 queries — actionneurs + modules routes

**Context:** Two API routes fetch related data with per-row queries inside a `Promise.all(map(...))`. This creates N+1 database roundtrips.

- `GET /api/actionneurs`: fetches each actionneur's `t_lieu` in a separate query per row
- `GET /api/modules`: fetches `t_sonde.count` AND `t_module_type` per module (2N+1 queries)

**Files:**
- Modify: `src/app/api/actionneurs/route.ts`
- Modify: `src/app/api/modules/route.ts`

---

**Step 1: Replace N+1 in actionneurs GET**

Open `src/app/api/actionneurs/route.ts`. Replace lines 15–43 (the `findMany` + `Promise.all(map(findFirst))` block) with:

```typescript
const actionneurs = await prisma.t_actionneur.findMany({
  select: {
    Id_Actionneur: true,
    Num_Serie: true,
    Type: true,
    Commentaire: true,
    Est_Etat: true,
    Est_Archive: true,
  },
  where: { Est_Archive: false },
  orderBy: { Num_Serie: "asc" },
})

// Batch lookup: single query instead of one per actionneur
const lieux = await prisma.t_lieu.findMany({
  where: { Id_Actionneur: { in: actionneurs.map((a) => a.Id_Actionneur) } },
  select: { Id_Actionneur: true, Id_Lieu: true },
})
const lieuByActionneur = new Map(
  lieux.map((l) => [l.Id_Actionneur, l.Id_Lieu])
)

const actionneursWithLieu = actionneurs.map((a) => ({
  ...a,
  Id_Lieu: lieuByActionneur.get(a.Id_Actionneur) ?? null,
}))

return apiOk(actionneursWithLieu)
```

**Step 2: Replace N+1 in modules GET**

Open `src/app/api/modules/route.ts`. Replace lines 27–77 (the `findMany` + `Promise.all(map(...))` block) with:

```typescript
const modulesRaw = await prisma.t_module.findMany({
  select: {
    Id_Module: true,
    Module_Numero_Serie: true,
    Type_Module: true,
    Port_Serie: true,
    Emplacement: true,
    Id_Serveur: true,
  } as any,
  where: { Archive: 0 } as any,
  orderBy: { Module_Numero_Serie: "asc" },
})

// Batch: one groupBy for counts, one findMany for type labels
const moduleIds = modulesRaw.map((m: any) => m.Id_Module)
const typeIds = modulesRaw
  .map((m: any) => m.Type_Module)
  .filter((t: unknown): t is number => t !== null && t !== undefined)

const [sondeCounts, moduleTypes] = await Promise.all([
  prisma.t_sonde.groupBy({
    by: ["Id_Module"],
    where: { Id_Module: { in: moduleIds } },
    _count: { _all: true },
  }),
  prisma.t_module_type.findMany({
    where: { Id_Module_Type: { in: typeIds } },
    select: { Id_Module_Type: true, Libelle_Type_Module: true },
  }),
])

const countByModule = new Map(
  sondeCounts.map((g) => [g.Id_Module, g._count._all])
)
const typeById = new Map(
  moduleTypes.map((t) => [t.Id_Module_Type, t.Libelle_Type_Module])
)

const modulesWithDetails = modulesRaw.map((module: any) => ({
  Id_Module: module.Id_Module,
  Module_Numero_Serie: module.Module_Numero_Serie,
  Type_Module: module.Type_Module,
  Libelle_Type_Module: module.Type_Module
    ? (typeById.get(module.Type_Module) ?? null)
    : null,
  Port_Serie: module.Port_Serie,
  Emplacement: module.Emplacement,
  Id_Serveur: module.Id_Serveur,
  sondes_count: countByModule.get(module.Id_Module) ?? 0,
  Est_Module_GSO: module.Est_Module_GSO ?? false,
}))

return apiOk(modulesWithDetails)
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/api/actionneurs/route.ts src/app/api/modules/route.ts
git commit -m "perf(api): fix N+1 queries in actionneurs and modules GET endpoints"
```

---

### Task 2: Add Zod validation to actionneurs POST and alarmes GET

**Context:** Two routes accept user inputs without schema validation.

- `POST /api/actionneurs`: body is destructured without any schema
- `GET /api/alarmes`: `status` cast to type with `as AlarmStatus` and `baseWhere: any` — no validation

**Files:**
- Modify: `src/app/api/actionneurs/route.ts`
- Modify: `src/app/api/alarmes/route.ts`

**Note:** Zod is already a dependency (used in `lieux/route.ts`, `modules/route.ts`). Import with `import { z } from "zod"`.

---

**Step 1: Add Zod schema to actionneurs POST**

At the top of `src/app/api/actionneurs/route.ts`, after the existing imports, add:

```typescript
import { z } from "zod"

const createActionneurSchema = z.object({
  type: z.coerce.number().int().positive().optional(),
  serie: z.string().min(1).max(50).optional().nullable(),
  commentaire: z.string().max(255).optional().nullable(),
  lieuId: z.coerce.number().int().positive().optional().nullable(),
})
```

Then in the `POST` handler, replace the body destructuring block:

```typescript
// REPLACE:
const body = await req.json()
const { type, serie, commentaire, lieuId } = body

// WITH:
const body = await req.json()
const parsed = createActionneurSchema.safeParse(body)
if (!parsed.success) {
  return apiError(400, "validation_error", "Données invalides", {
    details: parsed.error.issues,
  })
}
const { type, serie, commentaire, lieuId } = parsed.data
```

Also replace the manual `parseInt` calls that follow (since Zod already coerces the numbers):

```typescript
// REPLACE:
Type: type ? parseInt(type) : undefined,
// WITH:
Type: type ?? undefined,

// REPLACE (in the lieuId branch):
where: { Id_Lieu: parseInt(lieuId) },
// WITH:
where: { Id_Lieu: lieuId },
```

**Step 2: Add Zod query validation to alarmes GET**

Open `src/app/api/alarmes/route.ts`. At the top, after imports, add:

```typescript
import { z } from "zod"

const alarmsQuerySchema = z.object({
  status: z.enum(["active", "acknowledged", "resolved"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
})
```

In the `GET` handler, replace lines 33–39 (the `searchParams` block) with:

```typescript
const queryParsed = alarmsQuerySchema.safeParse({
  status: req.nextUrl.searchParams.get("status") ?? undefined,
  page: req.nextUrl.searchParams.get("page") ?? undefined,
  limit: req.nextUrl.searchParams.get("limit") ?? undefined,
})
if (!queryParsed.success) {
  return apiError(400, "invalid_params", "Paramètres invalides", {
    details: queryParsed.error.issues,
  })
}
const { status, page, limit } = queryParsed.data
```

Remove the `baseWhere: any` type annotation and replace with:

```typescript
// REPLACE:
const baseWhere: any = {}
// WITH:
const baseWhere: Record<string, unknown> = {}
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/api/actionneurs/route.ts src/app/api/alarmes/route.ts
git commit -m "feat(api): add Zod validation to actionneurs POST body and alarmes GET query params"
```

---

### Task 3: Convert Dashboard Layout to Server Component

**Context:** `src/app/[locale]/(dashboard)/layout.tsx` is currently `"use client"`. Making it a server component means:
1. The layout HTML is rendered server-side (faster first paint)
2. The `children` (pages like `DashboardPage`) are full server components during SSR
3. The client-side behavior (alarms polling, logout, redirect) moves to a dedicated `DashboardShell` component

The admin layout (`src/app/[locale]/(admin)/admin/layout.tsx`) has the same pattern but is more complex (permission-based routing). Do NOT change the admin layout in this task.

**Files:**
- Modify: `src/app/[locale]/(dashboard)/layout.tsx`
- Create: `src/app/[locale]/(dashboard)/dashboard-shell.tsx`

---

**Step 1: Create dashboard-shell.tsx**

Create `src/app/[locale]/(dashboard)/dashboard-shell.tsx` with all the client-side logic extracted from `layout.tsx`:

```typescript
"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { AppSidebar } from "@/components/app-sidebar"
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper"
import { useAutoLock } from "@/hooks/useAutoLock"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePathname, useRouter } from "@/i18n/navigation"
import { stripLocalePrefix } from "@/i18n/pathnames"
import { useAppAccess } from "@/components/access/app-access-provider"
import { clearAgentSession } from "@/lib/agent-session"
import { alarmsApi, authApi } from "@/lib/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useAutoLock()
  const router = useRouter()
  const pathname = usePathname()
  const normalizedPathname = stripLocalePrefix(pathname)
  const { hasPermission, loading: accessLoading } = useAppAccess()
  const hasUserDashboardAccess = hasPermission("DASHBOARD_USER_ACCESS")

  useEffect(() => {
    if (accessLoading) return
    if (normalizedPathname === "/" && !hasUserDashboardAccess) {
      router.replace("/surveillance")
    }
  }, [accessLoading, hasUserDashboardAccess, normalizedPathname, router])

  const canRenderDashboardShell = !(
    normalizedPathname === "/" && !hasUserDashboardAccess
  )

  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"] as const,
    queryFn: () => alarmsApi.getActive(),
    refetchInterval: 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
    enabled: canRenderDashboardShell,
  })
  const { data: currentUser } = useCurrentUser({
    enabled: canRenderDashboardShell,
  })
  const activeAlarmsCount = alarms?.length ?? 0

  if (!canRenderDashboardShell) return null

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      try {
        await clearAgentSession()
      } catch {
        // Agent not installed/running: ignore
      }
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeAlarms={activeAlarmsCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          <PageTransitionWrapper className="min-h-full">
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Simplify layout.tsx to a Server Component**

Replace the entire content of `src/app/[locale]/(dashboard)/layout.tsx` with:

```typescript
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardShell } from "./dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  )
}
```

Note: No `"use client"` directive — this is now a Server Component.

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Build check**

Run: `npm run build`
Expected: exit 0, no errors

**Step 5: Commit**

```bash
git add src/app/[locale]/\(dashboard\)/layout.tsx src/app/[locale]/\(dashboard\)/dashboard-shell.tsx
git commit -m "refactor(layout): extract DashboardShell client component, convert layout to server component"
```

---

### Task 4: Add error.tsx boundaries per route group

**Context:** Currently only `src/app/[locale]/error.tsx` exists. There are no route-level error boundaries for `(dashboard)` or `(admin)`. A React rendering error in any dashboard component will bubble up to the locale-level handler, losing the navigation chrome.

The existing `src/app/[locale]/error.tsx` is already well-implemented with i18n, retry, and back actions. We will re-export it as the boundary for each route group.

**Files:**
- Create: `src/app/[locale]/(dashboard)/error.tsx`
- Create: `src/app/[locale]/(admin)/error.tsx`

---

**Step 1: Create dashboard error boundary**

Read `src/app/[locale]/error.tsx` to understand the pattern, then create `src/app/[locale]/(dashboard)/error.tsx` with identical content (copy-paste):

```typescript
"use client"

import { useEffect } from "react"
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { ErrorPageLayout } from "@/components/error/error-page-layout"
import { useRouter } from "@/i18n/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("errors")
  const common = useTranslations("common")
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  const helperText = error.digest
    ? `${t("server_error_helper")} (ID: ${error.digest})`
    : t("server_error_helper")

  return (
    <ErrorPageLayout
      code="500"
      badge={t("server_error_badge")}
      icon={<AlertTriangle className="h-6 w-6" />}
      title={t("server_error_title")}
      description={t("server_error_description")}
      helperText={helperText}
      primaryAction={{
        label: t("retry"),
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: reset,
      }}
      secondaryAction={{
        label: common("back"),
        icon: <ArrowLeft className="h-4 w-4" />,
        variant: "outline",
        onClick: () => router.back(),
      }}
    />
  )
}
```

**Step 2: Create admin error boundary**

Create `src/app/[locale]/(admin)/error.tsx` with the same content as above (just change the function name to `AdminError`).

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/[locale]/\(dashboard\)/error.tsx src/app/[locale]/\(admin\)/error.tsx
git commit -m "feat(errors): add route-level error boundaries for dashboard and admin segments"
```

---

### Task 5: Add React cache() to authorization checks

**Context:** `src/lib/authz.ts` makes 2 sequential DB queries on every API call that uses `withAuthorizationLogging` or `withAdminLogging`:
1. `findUnique` on `t_utilisateur` (to get profile)
2. `findUnique` on `t_profil` with includes (to get authorizations)

React 19's `cache()` deduplicates identical async calls **within the same React render/request tree**. In Next.js App Router, this means multiple middleware-like calls on the same request won't repeat the queries.

**Files:**
- Modify: `src/lib/authz.ts`

---

**Step 1: Add cache() import and extract a shared getUserProfile helper**

Replace the entire content of `src/lib/authz.ts` with:

```typescript
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { isAdminDomainCode } from "@/lib/authorization-domain"

// Cached per-request: deduplicates identical userId lookups within a single
// React render tree (Next.js App Router). Falls back to a normal async call
// in non-React contexts (e.g. during token refresh in api-wrappers.ts).
const getUserProfile = cache(async (userId: number) => {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  })
  if (!user?.Profil_Utilisateur) return null

  return prisma.t_profil.findUnique({
    where: { Profil_Utilisateur: user.Profil_Utilisateur },
    include: {
      t_liaison_profil_autorisation: {
        include: { t_autorisation: true },
      },
    },
  })
})

export async function isAdminUser(userId: number): Promise<boolean> {
  const profil = await getUserProfile(userId)
  if (!profil) return false

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    isAdminDomainCode(liaison.t_autorisation.Code_Autorisation)
  )
}

export async function hasUserAuthorizationCode(
  userId: number,
  code: string
): Promise<boolean> {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  })
  if (!user?.Profil_Utilisateur) return false
  if (user.Profil_Utilisateur === "Administrateurs") return true

  const profil = await getUserProfile(userId)
  if (!profil) return false

  return profil.t_liaison_profil_autorisation.some(
    (liaison) => liaison.t_autorisation.Code_Autorisation === code
  )
}

export async function hasUserAnyAuthorizationCode(
  userId: number,
  codes: readonly string[]
): Promise<boolean> {
  if (codes.length === 0) return false

  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  })
  if (!user?.Profil_Utilisateur) return false
  if (user.Profil_Utilisateur === "Administrateurs") return true

  const profil = await getUserProfile(userId)
  if (!profil) return false

  const expected = new Set(
    codes.map((c) => c.trim().toUpperCase()).filter(Boolean)
  )
  if (expected.size === 0) return false

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    expected.has((liaison.t_autorisation.Code_Autorisation || "").trim().toUpperCase())
  )
}
```

Note: `getUserProfile` is deduplicated per request. `hasUserAuthorizationCode` and `hasUserAnyAuthorizationCode` still do an initial `t_utilisateur` lookup because the "Administrateurs" short-circuit check needs the profile name first. This lookup is also a candidate for caching but kept simple here.

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/authz.ts
git commit -m "perf(authz): deduplicate DB profile lookups with React cache() per request"
```

---

### Task 6: Repository pattern — actionneurs + modules

**Context:** Currently, all Prisma queries live directly in route handlers. The Repository pattern extracts query logic into reusable, testable functions. This task creates the infrastructure and implements 2 repositories — the pattern is then extended to other entities incrementally.

Route handlers that use the repositories will become thinner: just auth, validation, audit logging, and response.

**Files:**
- Create: `src/lib/repositories/actionneur.repository.ts`
- Create: `src/lib/repositories/module.repository.ts`
- Modify: `src/app/api/actionneurs/route.ts` (use repository)
- Modify: `src/app/api/modules/route.ts` (use repository)

---

**Step 1: Create actionneur repository**

Create `src/lib/repositories/actionneur.repository.ts`:

```typescript
import { prisma } from "@/lib/prisma"

export type ActionneurWithLieu = {
  Id_Actionneur: number
  Num_Serie: string | null
  Type: number | null
  Commentaire: string | null
  Est_Etat: boolean | null
  Est_Archive: boolean
  Id_Lieu: number | null
}

export const ActionneurRepository = {
  /**
   * Returns all non-archived actionneurs with their associated lieu ID.
   * Uses a batch lookup to avoid N+1 queries.
   */
  async findAllWithLieu(): Promise<ActionneurWithLieu[]> {
    const actionneurs = await prisma.t_actionneur.findMany({
      select: {
        Id_Actionneur: true,
        Num_Serie: true,
        Type: true,
        Commentaire: true,
        Est_Etat: true,
        Est_Archive: true,
      },
      where: { Est_Archive: false },
      orderBy: { Num_Serie: "asc" },
    })

    const lieux = await prisma.t_lieu.findMany({
      where: {
        Id_Actionneur: { in: actionneurs.map((a) => a.Id_Actionneur) },
      },
      select: { Id_Actionneur: true, Id_Lieu: true },
    })
    const lieuByActionneur = new Map(
      lieux.map((l) => [l.Id_Actionneur, l.Id_Lieu])
    )

    return actionneurs.map((a) => ({
      ...a,
      Id_Lieu: lieuByActionneur.get(a.Id_Actionneur) ?? null,
    }))
  },

  async create(data: {
    type?: number
    serie?: string | null
    commentaire?: string | null
    lieuId?: number | null
  }) {
    const actionneur = await prisma.t_actionneur.create({
      data: {
        Type: data.type,
        Num_Serie: data.serie ?? null,
        Commentaire: data.commentaire ?? null,
      },
    })

    if (data.lieuId) {
      await prisma.t_lieu.update({
        where: { Id_Lieu: data.lieuId },
        data: { Id_Actionneur: actionneur.Id_Actionneur },
      })
    }

    return actionneur
  },
}
```

**Step 2: Create module repository**

Create `src/lib/repositories/module.repository.ts`:

```typescript
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export type ModuleWithDetails = {
  Id_Module: number
  Module_Numero_Serie: string | null
  Type_Module: number | null
  Libelle_Type_Module: string | null
  Port_Serie: string | null
  Emplacement: string | null
  Id_Serveur: number | null
  sondes_count: number
  Est_Module_GSO: boolean
}

export const createModuleSchema = z.object({
  Module_Numero_Serie: z.string().min(1).max(50),
  Type_Module: z.number(),
  Port_Serie: z.string().min(1).max(10),
  Emplacement: z.string().min(1).max(50),
  Adresse_IP: z.string().optional().nullable(),
  Id_Serveur: z.number().optional().nullable(),
  Delai_Reseau: z.number().optional().nullable(),
  Est_Module_GSO: z.boolean().optional(),
})

export type CreateModuleInput = z.infer<typeof createModuleSchema>

export const ModuleRepository = {
  /**
   * Returns all non-archived modules with sonde count and type label.
   * Uses batch queries to avoid N+1 (1 groupBy + 1 findMany instead of 2N queries).
   */
  async findAllWithDetails(): Promise<ModuleWithDetails[]> {
    const modulesRaw = await prisma.t_module.findMany({
      select: {
        Id_Module: true,
        Module_Numero_Serie: true,
        Type_Module: true,
        Port_Serie: true,
        Emplacement: true,
        Id_Serveur: true,
      } as any,
      where: { Archive: 0 } as any,
      orderBy: { Module_Numero_Serie: "asc" },
    })

    const moduleIds = modulesRaw.map((m: any) => m.Id_Module)
    const typeIds = modulesRaw
      .map((m: any) => m.Type_Module)
      .filter((t: unknown): t is number => t !== null && t !== undefined)

    const [sondeCounts, moduleTypes] = await Promise.all([
      prisma.t_sonde.groupBy({
        by: ["Id_Module"],
        where: { Id_Module: { in: moduleIds } },
        _count: { _all: true },
      }),
      prisma.t_module_type.findMany({
        where: { Id_Module_Type: { in: typeIds } },
        select: { Id_Module_Type: true, Libelle_Type_Module: true },
      }),
    ])

    const countByModule = new Map(
      sondeCounts.map((g) => [g.Id_Module, g._count._all])
    )
    const typeById = new Map(
      moduleTypes.map((t) => [t.Id_Module_Type, t.Libelle_Type_Module])
    )

    return modulesRaw.map((module: any) => ({
      Id_Module: module.Id_Module,
      Module_Numero_Serie: module.Module_Numero_Serie,
      Type_Module: module.Type_Module,
      Libelle_Type_Module: module.Type_Module
        ? (typeById.get(module.Type_Module) ?? null)
        : null,
      Port_Serie: module.Port_Serie,
      Emplacement: module.Emplacement,
      Id_Serveur: module.Id_Serveur,
      sondes_count: countByModule.get(module.Id_Module) ?? 0,
      Est_Module_GSO: module.Est_Module_GSO ?? false,
    }))
  },

  async isDuplicateSerialNumber(serialNumber: string): Promise<boolean> {
    const existing = await prisma.t_module.findFirst({
      where: { Module_Numero_Serie: serialNumber },
    })
    return !!existing
  },

  async create(data: CreateModuleInput) {
    return prisma.t_module.create({
      data: {
        Module_Numero_Serie: data.Module_Numero_Serie,
        Type_Module: data.Type_Module,
        Port_Serie: data.Port_Serie,
        Emplacement: data.Emplacement,
        Adresse_IP: data.Adresse_IP,
        Id_Serveur: data.Id_Serveur,
        Delai_Reseau: data.Delai_Reseau,
        Est_Module_GSO: data.Est_Module_GSO ?? false,
        Archive: 0,
      } as any,
    })
  },
}
```

**Step 3: Update actionneurs route to use repository**

In `src/app/api/actionneurs/route.ts`, replace the Prisma logic in `GET` with:

```typescript
import { ActionneurRepository } from "@/lib/repositories/actionneur.repository"

// In GET handler, replace the query block with:
const actionneursWithLieu = await ActionneurRepository.findAllWithLieu()
return apiOk(actionneursWithLieu)
```

And in `POST` handler, replace the create logic with:

```typescript
const actionneur = await ActionneurRepository.create({
  type: parsed.data.type,
  serie: parsed.data.serie,
  commentaire: parsed.data.commentaire,
  lieuId: parsed.data.lieuId,
})
```

**Step 4: Update modules route to use repository**

In `src/app/api/modules/route.ts`, import and use:

```typescript
import {
  ModuleRepository,
  createModuleSchema,
} from "@/lib/repositories/module.repository"

// Remove the local createModuleSchema (it's now in the repository)
// In GET handler:
const modulesWithDetails = await ModuleRepository.findAllWithDetails()
return apiOk(modulesWithDetails)

// In POST handler:
const isDuplicate = await ModuleRepository.isDuplicateSerialNumber(validData.Module_Numero_Serie)
if (isDuplicate) {
  return apiError(400, "duplicate", "Ce numéro de série existe déjà")
}
const newModule = await ModuleRepository.create(validData)
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 6: Commit**

```bash
git add src/lib/repositories/ src/app/api/actionneurs/route.ts src/app/api/modules/route.ts
git commit -m "refactor(data): introduce repository pattern for actionneurs and modules"
```

---

### Task 7: Remove `any` types from api-wrappers.ts and http.ts

**Context:** Two infrastructure files use `any` types for reasons that can be fixed:

1. `src/lib/api-wrappers.ts` — uses `...args: any[]` for the Next.js route context (second arg in dynamic routes). Should use a typed `NextRouteContext`.
2. `src/lib/http.ts` — uses `(window as any)` to access `__vigitempQueryClientId` and `__vigitempBootId`. These are already declared on `Window` in `providers.tsx` but the declaration isn't in a shared types file.

**Files:**
- Create: `src/types/global.d.ts`
- Modify: `src/lib/api-wrappers.ts`
- Modify: `src/lib/http.ts`

---

**Step 1: Create global type declarations**

Create `src/types/global.d.ts`:

```typescript
declare global {
  interface Window {
    __vigitempQueryClientId?: string
    __vigitempBootId?: string
    __vigitemp_console_error_patched__?: boolean
  }
}

export {}
```

**Step 2: Remove duplicate Window declaration from providers.tsx**

Open `src/components/providers.tsx`. Remove lines 12–17 (the `declare global { interface Window { ... } }` block — it's now in `src/types/global.d.ts`).

**Step 3: Fix api-wrappers.ts — type the route context**

Open `src/lib/api-wrappers.ts`. Replace the type definitions at lines 13–21:

```typescript
// REPLACE:
type HandlerContext = {
  user: JWTPayload
}

type ApiHandler = (
  req: NextRequest,
  ctx: HandlerContext,
  ...args: any[]
) => Promise<NextResponse>

// WITH:
type HandlerContext = {
  user: JWTPayload
}

/** The second argument Next.js App Router passes to dynamic route handlers. */
type NextRouteContext = { params: Record<string, string | string[]> }

type ApiHandler = (
  req: NextRequest,
  ctx: HandlerContext,
  routeCtx?: NextRouteContext,
) => Promise<NextResponse>
```

Then fix all 4 wrapper functions that use `...args: any[]`. Replace each occurrence:

```typescript
// In withAuthLogging:
// REPLACE:
return withLogging(async (req: NextRequest, ...args: any[]) => {
  // ...
  const response = await handler(req, { user }, ...args)
// WITH:
return withLogging(async (req: NextRequest, routeCtx?: NextRouteContext) => {
  // ...
  const response = await handler(req, { user }, routeCtx)

// In withAdminLogging (inner handler):
// REPLACE:
async (req: NextRequest, ctx: HandlerContext, ...args: any[]) => {
  // ...
  return handler(req, ctx, ...args)
// WITH:
async (req: NextRequest, ctx: HandlerContext, routeCtx?: NextRouteContext) => {
  // ...
  return handler(req, ctx, routeCtx)

// Same fix for withAuthorizationLogging and withAnyAuthorizationLogging
```

**Step 4: Fix http.ts — remove (window as any) casts**

Open `src/lib/http.ts`. Replace:

```typescript
// Line ~145:
// REPLACE:
return (window as any).__vigitempQueryClientId
// WITH:
return window.__vigitempQueryClientId

// Line ~155:
// REPLACE:
return (window as any).__vigitempBootId
// WITH:
return window.__vigitempBootId
```

The last `any` cast in http.ts is on line ~307: `const payload = (await res.json()) as any`. Replace with:

```typescript
const payload = (await res.json()) as Record<string, unknown>
```

And update the subsequent access:
```typescript
// Line ~309:
// REPLACE:
if (payload && typeof payload === "object" && payload.ok === true && "data" in payload) {
  return payload.data as TResponse
}
return payload as TResponse
// This already works with Record<string, unknown>
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors (any regressions here indicate a call site that passes the wrong type — fix them too)

**Step 6: Commit**

```bash
git add src/types/global.d.ts src/lib/api-wrappers.ts src/lib/http.ts src/components/providers.tsx
git commit -m "fix(types): remove any types from api-wrappers and http, add global Window declarations"
```

---

### Task 8: Convert "use client" admin pages with only useTranslations to Server Components

**Context:** Some admin pages are `"use client"` components only because they use `useTranslations()`. In Next.js App Router, pages can use `getTranslations()` (async server version) instead, making them proper Server Components.

Identified pages with `"use client"` but no interactive hooks:
- `src/app/[locale]/(admin)/admin/alarmes/page.tsx` — only uses `useTranslations`
- `src/app/[locale]/(admin)/admin/etalons/page.tsx` — check if only license check + translations

Do NOT change pages that use `useQuery`, `useState`, or other client hooks in the page component itself (those belong in child client components).

**Files:**
- Modify: `src/app/[locale]/(admin)/admin/alarmes/page.tsx`

---

**Step 1: Read the admin alarmes page**

Open `src/app/[locale]/(admin)/admin/alarmes/page.tsx` and verify it only uses `useTranslations` (no `useState`, `useQuery`, `useEffect`, etc.).

**Step 2: Convert to server component**

Replace the `"use client"` + `useTranslations` pattern:

```typescript
// BEFORE (client component):
"use client"
import { useTranslations } from "next-intl"
// ...
export default function AlarmsPage() {
  const t = useTranslations("adminAlarmsPage")
  // ...
}

// AFTER (server component):
import { getTranslations } from "next-intl/server"
// ...
export default async function AlarmsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "adminAlarmsPage" })
  // ...
}
```

Preserve all JSX, just change the translation import/usage.

**Step 3: Check etalons/page.tsx**

Read `src/app/[locale]/(admin)/admin/etalons/page.tsx`. If it uses `useLicense` or other client hooks, leave it as-is (the license check legitimately needs client state). Only convert if it's purely translations.

**Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/app/[locale]/\(admin\)/admin/alarmes/page.tsx
git commit -m "refactor(pages): convert admin alarmes page to server component using getTranslations"
```

---

### Task 9: Add loading.tsx files per route segment

**Context:** Next.js App Router automatically uses `loading.tsx` files as Suspense fallbacks at the route segment level. Currently, pages define their own inline skeletons inside a `<Suspense>`. Adding `loading.tsx` provides:
1. Instant skeleton display before the page JS even loads (streaming HTML)
2. Consistent loading experience across navigation

The inline Suspense in pages can remain — `loading.tsx` handles the segment-level streaming.

**Files:**
- Create: `src/app/[locale]/(dashboard)/loading.tsx`
- Create: `src/app/[locale]/(dashboard)/alarmes/loading.tsx`
- Create: `src/app/[locale]/(admin)/admin/loading.tsx`

---

**Step 1: Create dashboard loading**

Create `src/app/[locale]/(dashboard)/loading.tsx`:

```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
```

**Step 2: Create alarmes loading**

Create `src/app/[locale]/(dashboard)/alarmes/loading.tsx`:

```typescript
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function AlarmsLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="p-4">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}
```

**Step 3: Create admin loading**

Create `src/app/[locale]/(admin)/admin/loading.tsx`:

```typescript
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/app/[locale]/\(dashboard\)/loading.tsx src/app/[locale]/\(dashboard\)/alarmes/loading.tsx src/app/[locale]/\(admin\)/admin/loading.tsx
git commit -m "feat(ux): add loading.tsx route-level skeletons for dashboard, alarmes, and admin"
```

---

### Task 10: Add generateMetadata to admin pages missing it

**Context:** Admin pages without `generateMetadata` show a generic browser tab title. Next.js generates metadata server-side per page.

Pages that already have it: `audit/page.tsx`.
Pages missing it: `actionneurs/page.tsx`, `alarmes/page.tsx`, `groupes/page.tsx`, `lieux/page.tsx`.

Pattern to follow (from `audit/page.tsx`):
```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "actuatorsPage" })
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  }
}
```

**Files:**
- Modify: `src/app/[locale]/(admin)/admin/actionneurs/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/alarmes/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/groupes/page.tsx`
- Modify: `src/app/[locale]/(admin)/admin/lieux/page.tsx`

---

**Step 1: Add i18n metadata keys**

For each page, you'll need to add `meta.title` and `meta.description` keys to `src/messages/fr.json` and `src/messages/en.json` under the relevant namespace (e.g., `actuatorsPage.meta.title`).

Check existing keys in each namespace before adding. Use values consistent with the page header titles already in the translations.

**Step 2: Add generateMetadata to each page**

For each page, add the `generateMetadata` export (following the audit page pattern):

```typescript
import { getTranslations } from "next-intl/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "NAMESPACE_HERE" })
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  }
}
```

Note: pages that are `"use client"` (before Task 8 conversion) cannot have `generateMetadata` — it must be in a separate `layout.tsx` or after the page is converted to a server component.

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/[locale]/\(admin\)/admin/ src/messages/
git commit -m "feat(seo): add generateMetadata to admin pages (actionneurs, alarmes, groupes, lieux)"
```

---

### Task 11: Migrate LicenseProvider to React Query

**Context:** `src/components/license/license-provider.tsx` uses manual `useState` + `useEffect` + `useCallback` + `useRef` to manage the license fetch lifecycle. React Query already handles all of this:
- Deduplication across components
- Stale-while-revalidate
- Error handling
- Manual refetch

The `refresh` callback (used by other components to trigger a refetch) maps directly to `refetch` from `useQuery`.

**Files:**
- Modify: `src/components/license/license-provider.tsx`

---

**Step 1: Rewrite LicenseProvider**

Replace the entire content of `src/components/license/license-provider.tsx` with:

```typescript
"use client"

import { createContext, useCallback, useContext, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getJson } from "@/lib/http"
import { LicenseGateLoader } from "@/components/license/license-gate-loader"

export type LicenseInfo = {
  ok: boolean
  reason: string
  licenseId?: string
  customerId?: string
  edition?: string
  maxSensors?: number | null
  concurrentAccess?: string
  options?: string[]
  issuedAtRaw?: string
  expiresAtUtc?: string | null
}

type LicenseState = {
  loading: boolean
  license: LicenseInfo | null
  refresh: () => Promise<void>
}

const LicenseContext = createContext<LicenseState | null>(null)

export function useLicense() {
  const ctx = useContext(LicenseContext)
  if (!ctx) {
    throw new Error("useLicense must be used within LicenseProvider")
  }
  return ctx
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const {
    data: license = null,
    isLoading,
    refetch,
  } = useQuery<LicenseInfo>({
    queryKey: ["license"],
    queryFn: () => getJson<LicenseInfo>("/api/license"),
    staleTime: 10 * 60_000,  // 10 minutes — license changes rarely
    gcTime: 30 * 60_000,
    retry: false,
  })

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const value = useMemo(
    () => ({ loading: isLoading, license, refresh }),
    [isLoading, license, refresh]
  )

  // Show the gate only on first load (React Query: isLoading = no data + fetching)
  const showGate = isLoading && license === null

  return (
    <LicenseContext.Provider value={value}>
      {showGate && <LicenseGateLoader />}
      {children}
    </LicenseContext.Provider>
  )
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Check the LicenseGateLoader behavior**

Open `src/components/license/license-gate-loader.tsx` (if it exists) and verify it renders a loading screen. No changes needed there.

**Step 4: Commit**

```bash
git add src/components/license/license-provider.tsx
git commit -m "refactor(license): migrate LicenseProvider from manual state to React Query"
```

---

### Task 12: Split alarms-client-tanstack.tsx

**Context:** `src/components/data-table/alarms-client-tanstack.tsx` is 388 lines. Column definitions are already extracted (`active-alarms-columns.tsx`, `acknowledgment-columns.tsx`), but the main file still mixes: table state, filter state, mutation logic, and rendering.

Split into:
- `alarms-filters.tsx` — filter bar (status tabs, search, type filter)
- `alarms-mutations.tsx` — mutation hooks (acknowledge, delete, export)
- Keep `alarms-client-tanstack.tsx` — table wire-up only (~100 lines)

**Files:**
- Read: `src/components/data-table/alarms-client-tanstack.tsx` (read first to understand the current structure)
- Create: `src/components/data-table/alarms-filters.tsx`
- Create: `src/components/data-table/alarms-mutations.tsx`
- Modify: `src/components/data-table/alarms-client-tanstack.tsx`

---

**Step 1: Read the current file**

Read `src/components/data-table/alarms-client-tanstack.tsx` entirely before making any changes.

**Step 2: Extract mutation hooks**

Identify all `useMutation` calls and their associated state/handlers. Move them to `src/components/data-table/alarms-mutations.tsx`:

```typescript
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
// ... (all mutation-related imports)

export function useAlarmMutations() {
  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation({ /* ... */ })
  const deleteMutation = useMutation({ /* ... */ })
  // etc.

  return { acknowledgeMutation, deleteMutation /* ... */ }
}
```

**Step 3: Extract filter bar**

Identify the filter bar JSX (status tabs, search input, type dropdown). Move to `src/components/data-table/alarms-filters.tsx`:

```typescript
"use client"

// ... imports
type AlarmsFiltersProps = {
  statusFilter: AlarmStatus
  onStatusChange: (status: AlarmStatus) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  // etc.
}

export function AlarmsFilters({ ... }: AlarmsFiltersProps) {
  return (
    // JSX previously inline in alarms-client-tanstack
  )
}
```

**Step 4: Update alarms-client-tanstack.tsx**

Import from the new files and remove the extracted code. The main file should be ~100 lines handling only table setup, column selection, and the top-level layout.

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 6: Commit**

```bash
git add src/components/data-table/
git commit -m "refactor(alarms): split alarms-client-tanstack into filters and mutations sub-components"
```

---

### Task 13: Replace console.error with log.error in API routes

**Context:** Several API routes use `console.error(...)` instead of the structured `log.error(label, message, meta)` function from `src/lib/logger.ts`.

**Note:** `logger.ts` already patches `console.error` globally (lines 98–121) to mirror to Winston. So this is a code quality improvement, not a functional gap. The goal is explicit, labeled structured logging.

**Pattern:**
```typescript
// BEFORE:
console.error("Actionneurs fetch error:", error)

// AFTER:
log.error("actionneurs", "actionneurs_fetch_failed", { error })
```

The `log.error` signature is: `log.error(label: string, message: string, meta?: Record<string, any>)`

**Files to update** (verify current console.error usage with: `grep -r "console.error" src/app/api/ --include="*.ts"`):
- `src/app/api/actionneurs/route.ts` (2 occurrences)
- `src/app/api/modules/route.ts` (2 occurrences)
- `src/app/api/lieux/route.ts` (2 occurrences)
- Any other routes found by the grep above

Also update:
- `src/hooks/useAutoLock.ts` (2 occurrences) — use `console.warn` or remove if just debugging

---

**Step 1: Grep for all console.error in API routes**

Run: `grep -rn "console.error" src/app/api/ src/hooks/`

This gives the exact list of files and line numbers to update.

**Step 2: Replace in each file**

For each occurrence in API routes, replace `console.error(...)` with `log.error(...)`. Make sure to import `log` if not already imported:

```typescript
import { log } from "@/lib/logger"

// Example replacements:
// actionneurs:
log.error("actionneurs", "actionneurs_fetch_failed", { error })
log.error("actionneurs", "actionneur_create_failed", { error })

// modules:
log.error("modules", "modules_fetch_failed", { error })
log.error("modules", "module_create_failed", { error })

// lieux:
log.error("lieux", "[GET /api/lieux] fetch failed", { error })
log.error("lieux", "[POST /api/lieux] create failed", { error })
```

For `useAutoLock.ts`, the console.error calls are client-side and the logger (Winston) is server-only — leave those as `console.error` or convert to `console.warn` if they're non-critical.

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Final build check**

Run: `npm run build`
Expected: exit 0, 0 TypeScript errors, no warnings about unused imports

**Step 5: Commit**

```bash
git add src/app/api/
git commit -m "fix(logging): replace console.error with structured log.error in API routes"
```

---

## Summary

| # | Task | Category | Key Files |
|---|------|----------|-----------|
| 1 | Fix N+1 queries (actionneurs + modules) | Performance | `api/actionneurs/route.ts`, `api/modules/route.ts` |
| 2 | Zod validation on actionneurs POST + alarmes GET | Security | `api/actionneurs/route.ts`, `api/alarmes/route.ts` |
| 3 | Dashboard Layout → Server Component | Architecture | `(dashboard)/layout.tsx`, `dashboard-shell.tsx` |
| 4 | Error boundaries (dashboard + admin) | Reliability | `(dashboard)/error.tsx`, `(admin)/error.tsx` |
| 5 | React cache() on authz checks | Performance | `lib/authz.ts` |
| 6 | Repository pattern (actionneurs + modules) | Architecture | `lib/repositories/*.ts` |
| 7 | Remove `any` types (wrappers + http) | Type Safety | `lib/api-wrappers.ts`, `lib/http.ts`, `types/global.d.ts` |
| 8 | Admin page client→server (alarmes) | Architecture | `(admin)/admin/alarmes/page.tsx` |
| 9 | loading.tsx per segment | UX | 3 new `loading.tsx` files |
| 10 | generateMetadata on admin pages | SEO/A11y | 4 admin `page.tsx` files + messages |
| 11 | LicenseProvider → React Query | Simplification | `license/license-provider.tsx` |
| 12 | Split alarms-client-tanstack.tsx | Maintainability | `data-table/` |
| 13 | console.error → log.error | Observability | API route files |
