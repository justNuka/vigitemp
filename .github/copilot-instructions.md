# Insctructions for AI Code Assistants
- Toujours répondre en français.
- Dès qu'il y a un doute, poser des questions pour clarifier les besoins avant de générer du code.
- Dès qu'une modif touche à du typage, des données, etc... se référer aux schémas Prisma des 2 bases de données.
- Fair l'architecture Next.js 16 la plus clean possible, en utilisant les bonnes pratiques (server components, client components, data fetching, etc...)

# Vigitemp Codebase Guide for AI Agents

## Project Overview
Vigitemp is a comprehensive temperature/sensor monitoring system with:
- **Next.js 16 web dashboard** (`/website`) - Real-time alerts, sensor management, user profiles
- **C# Windows Agent** (`/Vigitemp agent`) - Edge device collecting sensor data
- **C# Server component** (`/Vigitemp Serveur`) - Central processing server

## Architecture & Data Flows

### Multi-Database Design (Critical)
```
┌─────────────────────────────────────┐
│     Next.js Application             │
│  (Dashboard, API, Auth)             │
└─────────┬──────────────┬────────────┘
          │              │
    ┌─────▼──┐      ┌────▼──────┐
    │ db-main│      │db-mesure   │
    │ (MySQL)│      │(MySQL)     │
    └────────┘      └────────────┘
   Config, users,   Time-series data
   sensors, alarms  (measurements)
```

**Key Files:**
- [prisma.ts](website/src/lib/prisma.ts) - Two Prisma clients (main + mesure databases)
- [db-main schema](website/prisma/db-main/schema.prisma) - Users, profiles, sensors, alarms
- [db-mesure schema](website/prisma/db-mesure/schema.prisma) - Time-series measurements

**Import Pattern:**
```typescript
import { prisma, prismaMesure } from '@/lib/prisma'
const users = await prisma.t_utilisateur.findMany()
const measurements = await prismaMesure.tm_mesure.findMany()
```

### Authentication Flow
1. **Login** → `POST /api/auth/login` generates JWT token
2. **Token Storage** → Stored in `auth-token` cookie (7-day expiry)
3. **Verification** → [jwt.ts](website/src/lib/jwt.ts) validates all API requests
4. **User Context** → [auth.ts](website/src/lib/auth.ts) extracts `getAuthenticatedUser()` from request

**Cookie name mismatch alert:** Routes check both `token` and `auth-token` cookies inconsistently. Use `token` for new code.

### API Route Pattern
Every API endpoint follows this structure:
```typescript
import { getAuthenticatedUser } from '@/lib/auth'
import { withLogging } from '@/lib/api-logger'

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  
  // Logging & audit trail automatic via withLogging wrapper
  const data = await prisma.table.findMany()
  return NextResponse.json(data)
})
```

**Audit Trail:** All mutations logged to `t_journal` via [audit-db.ts](website/src/lib/audit-db.ts).

## Project-Specific Conventions

### Naming: French Defaults with English Pattern
- Database columns: French (`Login`, `Mot_De_Passe`, `Commentaire`)
- Table prefix: `t_` (main) or `tm_` (measurements)
- API response fields: English for JSON APIs (camelCase)
- UI labels: French

**When adding features:** Keep database columns in French, transform to English in API responses.

### Cache Components (Next.js 16)
Enabled in [next.config.mjs](website/next.config.mjs):
```javascript
cacheComponents: true
```

Usage for expensive queries:
```typescript
'use cache'  // Entire component output cached
export async function DashboardStats() {
  const stats = await prisma.t_alarme.count() // Expensive
  return <div>{stats}</div>
}
```

Cache invalidation: Use [/api/revalidate](website/src/app/api/revalidate) endpoint (dev only).

### Measurement Caching Layer
[measurement-cache.ts](website/src/lib/measurement-cache.ts) - In-memory cache for sensor measurements to reduce database load. Must flush after alarm state changes.

## Key Commands

### Development
```bash
cd website
npm run dev              # Start dev server (port 3000)
npm run build:test      # Build with test pages enabled
npm run start:test      # Run built version with test pages

# Database
npm run prisma:migrate:main     # Migrate main database
npm run prisma:migrate:mesure   # Migrate measurements database
npm run prisma:studio           # Open Prisma GUI for main DB
npm run prisma:studio:mesure    # Open Prisma GUI for mesure DB
```

### C# Projects
- Visual Studio: Open `.sln` files in `/Vigitemp agent` or `/Vigitemp Serveur`
- Agent communicates with server via HTTP
- Server connects to both MySQL databases

## Critical Patterns

### Authorization Management
- **Models:** `t_profil`, `t_utilisateur`, `t_autorisation`
- **Modules:** Admin, Métrologie, Surveillance, VigiLog
- **Key Endpoint:** `GET /api/autorisations` returns all permissions with module flags

**Authorization check pattern:**
```typescript
const { authorizations } = user
if (!authorizations.includes('REQUIRED_CODE')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Error Handling & Logging
- **Logger:** [logger.ts](website/src/lib/logger.ts) - Winston with daily rotation
- **API Logging:** [api-logger.ts](website/src/lib/api-logger.ts) - Auto-logs all requests with user/IP
- **Audit Trail:** Every modification tracked in database journal

### Feature Flags
[feature-flags.ts](website/src/lib/feature-flags.ts) controls test pages, cache debug UI, and APIs:
- **Dev mode:** All test features enabled
- **Production:** Disabled (redirects return 404)
- **Override:** Set `ENABLE_TEST_PAGES=true` for staging

### Email System
[email.ts](website/src/lib/email.ts) - Sends password resets, account notifications. Requires `SMTP_*` env vars.

## File Organization

```
website/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes (organized by resource)
│   │   │   ├── auth/               # Login, password reset, token refresh
│   │   │   ├── users/              # User CRUD + liaisons (sites/groupes)
│   │   │   ├── profils/            # User profile management
│   │   │   ├── sites/              # Sites management
│   │   │   ├── groupes/            # Groupes list endpoint
│   │   │   ├── alarmes/            # Alarms list
│   │   │   ├── sondes/             # Probes: GET all, calibrages?serie=X, etalonnages?serie=X
│   │   │   │   ├── calibrages/     # Calibrations by probe
│   │   │   │   └── etalonnages/    # Calibrations by probe
│   │   │   └── (other resources)
│   │   ├── (admin)/                # Admin layout group
│   │   │   └── admin/              # Admin prefix (pages start with /admin/...)
│   │   │       ├── page.tsx        # Dashboard admin
│   │   │       ├── utilisateurs/   # Users management (CRUD with sites/groupes multi-select)
│   │   │       ├── alarmes/        # Alarms table (Lieu, Début, État, Fin, Acquittée)
│   │   │       ├── sondes/         # Probes (3-table layout: Sondes > Calibrages + Etalonnages)
│   │   │       ├── lieux/          # Locations
│   │   │       ├── sites/          # Sites
│   │   │       ├── groupes/        # Groups
│   │   │       ├── profils/        # User profiles
│   │   │       ├── parametres/     # System parameters
│   │   │       └── layout.tsx      # Admin sidebar + dock navigation
│   │   └── (dashboard)/            # Dashboard layout group (future)
│   ├── lib/                        # Core utilities
│   │   ├── prisma.ts               # Database clients (use for all DB)
│   │   ├── jwt.ts                  # Token generation/verification
│   │   ├── auth.ts                 # User extraction from request
│   │   ├── api-logger.ts           # Audit logging wrapper
│   │   ├── logger.ts               # File-based logging
│   │   ├── api.ts                  # API type definitions (User, CreateUserInput, etc)
│   │   └── utils.ts                # Utilities (cn, format, etc)
│   ├── hooks/                      # Custom React Query hooks
│   │   ├── useProfiles.ts          # Fetch profiles
│   │   ├── useSites.ts             # Fetch sites (non-archived)
│   │   ├── useGroups.ts            # Fetch groupes (non-archived)
│   │   ├── useAlarms.ts            # Fetch alarms with auto-refresh (30s)
│   │   ├── useSondes.ts            # Fetch all probes (60s refresh)
│   │   ├── useCalibrages.ts        # Fetch calibrages by serie (enabled when serie provided)
│   │   ├── useEtalonnages.ts       # Fetch etalonnages by serie (enabled when serie provided)
│   │   └── (other hooks)
│   ├── components/
│   │   ├── ui/                     # shadcn components (Button, Card, Table, Dialog, etc)
│   │   ├── page-header.tsx         # Reusable page title + description component
│   │   ├── admin-nav-dock.tsx      # Bottom dock navigation (AlertTriangle, Database, Settings, etc)
│   │   └── (other components)
│   └── middleware/                 # Next.js middleware (auth routing)
├── prisma/
│   ├── db-main/                    # Config database schema
│   │   └── schema.prisma           # t_sonde, t_calibrage, t_etalonnage, t_alarme, etc
│   └── db-mesure/                  # Time-series database schema
└── public/
    └── service-worker.js           # Offline detection
```

## Admin Pages Completed

### 1. Dashboard Admin (`/admin`)
- **Purpose:** Overview of system status
- **Content:** 5 cards (connected users, active alarms, acknowledgments, system logs, backups)
- **Refresh:** Auto-refresh with independent intervals per card

### 2. Users Management (`/admin/utilisateurs`)
- **Table Columns:** Login, Nom, Prenom, Email, Profil, Tel_Num_Mobile, Expiry Date, Status
- **Features:**
  - Add/Edit/Delete users
  - Form fields: Login, Password, Nom, Prenom, Email, Profil (select), Telephone (optional), Sites (multi-checkbox), Groupes (multi-checkbox), Expiry Date (optional)
  - Automatic liaison creation for sites/groupes via `/api/users/{id}/sites` and `/api/users/{id}/groups`
  - Password validation with rules (uppercase, lowercase, numbers, special chars)
- **Form Validation:** React Hook Form + Zod
- **API:** POST/PATCH to `/api/users`

### 3. Alarms Management (`/admin/alarmes`)
- **Table Columns:** Lieu, Début alarme, État (badge), Fin alarme, Acquittée (badge)
- **Filters:** État (Tous/Actives/Résolues), Acquittement (Tous/Acquittées/Non acquittées)
- **Auto-refresh:** 30 seconds
- **API:** GET `/api/alarmes`

### 4. Probes Management (`/admin/sondes`) **NEW**
- **3-Table Layout:**
  1. **Main Table (Sondes)** - Selectable, max-height with scroll
     - Columns: Adresse, Numéro de série, Port série, Module, État, Lieu
     - Buttons: Ajouter, Modifier (disabled), Imprimer (enabled - prints table)
     - Selection: Click to highlight (blue) and populate calibrages/etalonnages below
  
  2. **Calibrages Sub-Table** (appears when probe selected)
     - Columns: Date, Opérateur, Unité, Décimales
     - Buttons: Générer fichier (disabled), Imprimer (disabled)
     - Selection: Click to highlight
  
  3. **Étalonnages Sub-Table** (appears when probe selected)
     - Columns: Date, Validité, Opérateur, Incertitude
     - Buttons: Supprimer (disabled), Générer (disabled), Imprimer (disabled)
     - Selection: Click to highlight

**Database References:**
- `t_sonde`: Adresse_Sonde, Sonde_Numero_Serie, Port_Serie, Etat_Sonde, Id_Module
- `t_calibrage`: Date_Heure_Calibrage, Operateur, Unite, Nb_Decimale, Sonde_Numero_Serie
- `t_etalonnage`: Date_Heure_Etalonnage, Date_Validite, Operateur, Incertitude, Sonde_Numero_Serie

## Recent Implementations (Session Summary)

### Fixed Issues
1. ✅ Docker autofill on Login/Password fields (autoComplete attributes)
2. ✅ Duplicate PageHeader banners (moved to per-page)
3. ✅ SelectItem empty value error (changed "" to "all")
4. ✅ Added Telephone field to users (uses existing Tel_Num_Mobile column)
5. ✅ Added Sites multi-select to users (creates liaisons via `/api/users/{id}/sites`)
6. ✅ Added Groupes multi-select to users (creates liaisons via `/api/users/{id}/groups`)
7. ✅ Fixed PageHeader margins on dashboard (moved outside content wrapper)

### New Features Added
- **Alarms Page:** Table with filters, auto-refresh
- **Sondes Page:** 3-table cascading layout with scroll-limited tables
- **Navigation:** AlertTriangle icon added to dock for alarms page
- **Table Heights:** max-h-96 for main sondes, max-h-64 for calibrages/etalonnages

## Common Tasks

### Add New API Endpoint
1. Create file: `src/app/api/resource/route.ts` or `/query-param/route.ts`
2. Import auth + logging: `import { getAuthenticatedUser } from '@/lib/auth'`
3. Wrap with `withLogging()` for automatic audit trail
4. Return `NextResponse.json(data)`
5. Example with query params:
```typescript
const { searchParams } = new URL(req.url);
const param = searchParams.get("paramName");
```

### Add New Hook
1. Create file: `src/hooks/useResourceName.ts`
2. Use TanStack Query for caching
3. Example:
```typescript
export function useResource(enabled?: boolean) {
  return useQuery({
    queryKey: ["resource"],
    queryFn: async () => {
      const res = await fetch("/api/resource");
      return res.json();
    },
    enabled: enabled ?? true,
    refetchInterval: 60000,
  });
}
```

### Create Admin Page
1. Create folder: `src/app/(admin)/admin/resource/`
2. Create `page.tsx` with PageHeader and space-y-6 p-6 container
3. Create `resource-client.tsx` with `"use client"` and hooks
4. Import and use in page.tsx
5. Add icon + link to AdminNavDock

### Modify Users Form
- **Add field:** Update `createUserSchema` and `editUserSchema` in users-client.tsx
- **Add to API:** Add to POST `/api/users` body parser
- **Add to PATCH:** Update `/api/users/[id]/route.ts` updateUserSchema
- **Add UI:** FormField with Input/Select/Checkbox/etc in form

### Add Tables with Filtering
- Use shadcn `Table` component (NOT TanStack Table)
- Filter state with `useState`
- Format dates with `date-fns` and `fr` locale
- Use `Badge` for status indicators
- Example colors: `variant="destructive"` (red), `variant="default"` (blue), `variant="outline"` (gray)

## Modify Database
1. Edit schema: `prisma/db-main/schema.prisma`
2. Run migration: `npm run prisma:migrate:main`
3. Commit migration file to git
4. Prisma Client auto-regenerates

## Critical Patterns

### Table Row Selection Pattern
```tsx
const [selectedId, setSelectedId] = useState<number | null>(null);

<TableRow
  onClick={() => setSelectedId(item.Id)}
  className={cn(
    "cursor-pointer hover:bg-muted",
    selectedId === item.Id && "bg-blue-50"
  )}
>
```

### Multi-Select Checkbox Pattern (for forms)
```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

{items.map((item) => (
  <label key={item.Id}>
    <input
      type="checkbox"
      checked={selectedIds.includes(item.Id)}
      onChange={(e) => {
        setSelectedIds(e.target.checked 
          ? [...selectedIds, item.Id]
          : selectedIds.filter(id => id !== item.Id)
        );
      }}
    />
  </label>
))}
```

### API Query with Query Params
```typescript
// Server-side
const { searchParams } = new URL(req.url);
const param = searchParams.get("key");

// Client-side
fetch(`/api/resource?key=${value}`)
```

## Authorization Management
- **Models:** `t_profil`, `t_utilisateur`, `t_autorisation`
- **Modules:** Admin, Métrologie, Surveillance, VigiLog
- **Key Endpoint:** `GET /api/autorisations` returns all permissions with module flags

**Authorization check pattern:**
```typescript
const { authorizations } = user
if (!authorizations.includes('REQUIRED_CODE')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## External Dependencies
- **Framework:** Next.js 16 + React 19
- **ORM:** Prisma v6 (two databases)
- **UI:** HeroUI v2.7 + shadcn (Radix primitives)
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query v5.90.11
- **Auth:** JWT (jsonwebtoken)
- **Logging:** Winston with daily rotation
- **CSS:** Tailwind CSS v4
- **Animation:** Motion v12.23.12 (dock)
- **Dates:** date-fns with French locale
- **Icons:** lucide-react
- **Notifications:** sonner (toast)

## Gotchas & Important Notes

1. **Toujours en français:** Tous les labels UI, messages, descriptions DOIVENT être en français
2. **Use shadcn Table NOT TanStack Table:** For consistency with users page
3. **Table heights:** Use max-h-96 for main tables, max-h-64 for sub-tables with `overflow-y-auto` div wrapper
4. **Database:** Never join across db-main and db-mesure — load separately in JavaScript
5. **Cookie:** Standardize to `token` (not `auth-token`) in new code
6. **Timezone:** MySQL datetimes are UTC — handle conversions on frontend with date-fns
7. **API Response:** Always return `NextResponse.json()`, never plain objects
8. **Date formatting:** Always use `format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: fr })`
9. **Badge status colors:** Use `variant="destructive"`, `"default"`, `"outline"`, `"secondary"`
10. **Page structure:** Always PageHeader outside content, then `<div className="space-y-6 p-6">` for content
