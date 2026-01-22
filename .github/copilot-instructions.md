# Insctructions for AI Code Assistants
- Toujours répondre en français.
- Dès qu'il y a un doute, poser des questions pour clarifier les besoins avant de générer du code.
- Dès qu'une modif touche à du typage, des données, etc... se référer aux schémas Prisma des 2 bases de données.
- Toujours faire attention au typage (TypeScript) et aux types des données.
- Faire l'architecture Next.js 16 la plus clean possible, en utilisant les bonnes pratiques (server components, client components, data fetching, etc...)
- Toujours utiliser next-intl pour la gestion des langues à chaque création de pages/features.
- Toujours faire du mobile-first comme l'indique la doc TailwindCSS.
- Toujours prendre en compte l'accessibilité : contraste des couleurs, navigation clavier, lecteurs d'écran, etc...
- Toujours prendre en compte les conventions du projet : APIs, nommage, structure des fichiers, logging, audit trail, etc...
- Toujours bien gérer la sécurité : validation des entrées, protection contre les injections, gestion des sessions, etc...
- Toujours bien mettre en place le logging et l'audit trail pour chaque endpoint API créé ou modifié.
- Toujours bien gérer les erreurs avec des messages clairs et précis (prendre en compte la traduction) à renvoyer à l'utilisateur.
- Toujours bien gérer l'authentification et les droits (autorisations, licences) sur chaque endpoint API créé ou modifié.
- Toujours mettre à jour la modal de nouveautés à chaque ajout/modification de features (+ la version).

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
- [prisma.ts](../website/src/lib/prisma.ts) - Two Prisma clients (main + mesure databases)
- [db-main schema](../website/prisma/db-main/schema.prisma) - Users, profiles, sensors, alarms
- [db-mesure schema](../website/prisma/db-mesure/schema.prisma) - Time-series measurements

**Import Pattern:**
```typescript
import { prisma, prismaMesure } from '@/lib/prisma'
const users = await prisma.t_utilisateur.findMany()
const measurements = await prismaMesure.tm_mesure.findMany()
```

### Authentication Flow
1. **Login** → `POST /api/auth/login` generates JWT token
2. **Token Storage** → Stored in `auth-token` cookie (7-day expiry)
3. **Verification** → [jwt.ts](../website/src/lib/jwt.ts) validates all API requests
4. **User Context** → [auth.ts](../website/src/lib/auth.ts) extracts `getAuthenticatedUser()` from request

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

**Audit Trail:** All mutations logged to `t_journal` via [audit-db.ts](../website/src/lib/audit-db.ts).

## Project-Specific Conventions

### Naming: French Defaults with English Pattern
- Database columns: French (`Login`, `Mot_De_Passe`, `Commentaire`)
- Table prefix: `t_` (main) or `tm_` (measurements)
- API response fields: English for JSON APIs (camelCase)
- UI labels: French

**When adding features:** Keep database columns in French, transform to English in API responses.

### Cache Components (Next.js 16)
Enabled in [next.config.mjs](../website/next.config.mjs):
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

Cache invalidation: Use [/api/revalidate](../website/src/app/api/revalidate) endpoint (dev only).

### Measurement Caching Layer
[measurement-cache.ts](../website/src/lib/measurement-cache.ts) - In-memory cache for sensor measurements to reduce database load. Must flush after alarm state changes.

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
- **Logger:** [logger.ts](../website/src/lib/logger.ts) - Winston with daily rotation
- **API Logging:** [api-logger.ts](../website/src/lib/api-logger.ts) - Auto-logs all requests with user/IP
- **Audit Trail:** Every modification tracked in database journal

### Feature Flags
[feature-flags.ts](../website/src/lib/feature-flags.ts) controls test pages, cache debug UI, and APIs:
- **Dev mode:** All test features enabled
- **Production:** Disabled (redirects return 404)
- **Override:** Set `ENABLE_TEST_PAGES=true` for staging

### Email System
[email.ts](../website/src/lib/email.ts) - Sends password resets, account notifications. Requires `SMTP_*` env vars.

## API Endpoints Overview

### ✅ Implemented Endpoints

**Authentication:**
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/refresh` - Token refresh (7-day cookie expiry)

**Users Management:**
- `GET /api/users` - List all users with profiles
- `POST /api/users` - Create new user
- `PATCH /api/users/[id]` - Update user
- `POST /api/users/[id]/sites` - Add/remove sites for user
- `POST /api/users/[id]/groups` - Add/remove groups for user

**Locations (Lieux):**
- `GET /api/lieux` - List all locations with relations (site, groupe, sonde)
- `POST /api/lieux` - Create location
- `PATCH /api/lieux/[id]` - Update location (28+ fields including Metrologie)
- `GET /api/sondes-available` - Get sondes not assigned to any location

**Sites:**
- `GET /api/sites` - List all sites
- `POST /api/sites` - Create site
- `PATCH /api/sites/[id]` - Update site
- `GET /api/sites-simple` - Minimal site list for dropdowns

**Groups (Groupes):**
- `GET /api/groupes` - List all groups
- `POST /api/groupes` - Create group
- `PATCH /api/groupes/[id]` - Update group

**Profiles (Profils):**
- `GET /api/profils` - List all profiles
- `POST /api/profils` - Create profile
- `PATCH /api/profils/[id]` - Update profile
- `DELETE /api/profils/[id]` - Delete profile (with validation)

**Sondes (Sondes):**
- `GET /api/sondes` - List all sondes with details
- `POST /api/sondes/calibrages` - Get calibrages for specific sonde (by serie)
- `POST /api/sondes/etalonnages` - Get etalonnages for specific sonde (by serie)

**Standards/Étalons:**
- `GET /api/etalons` - List all standards
- `POST /api/etalons` - Create standard
- `PATCH /api/etalons/[id]` - Update standard
- `DELETE /api/etalons/[id]` - Delete standard

**Actuators (Actionneurs):**
- `GET /api/actionneurs` - List all actuators
- `POST /api/actionneurs` - Create actuator
- `PATCH /api/actionneurs/[id]` - Update actuator
- `DELETE /api/actionneurs/[id]` - Delete actuator

**Alarms:**
- `GET /api/alarms` - List alarms (with status filter)
- `GET /api/alarms?status=active` - Active alarms only
- `POST /api/alarms/[id]/acknowledge` - Acknowledge alarm

**Sensors:**
- `GET /api/sensors/paginated` - Paginated sensor list (1000 per page)
- `GET /api/sensors/[id]` - Single sensor details
- `GET /dashboard/critical-sensors` - Critical sensors only

**Measurements (Mesures):**
- `GET /api/mesures/[idLieu]` - Last 125 measurements for location

**System:**
- `GET /api/me` - Current logged-in user info
- `GET /api/autorisations` - User authorizations with module flags
- `POST /api/revalidate` - Cache invalidation (dev only)

## File Organization

```
../website/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes (organized by resource)
│   │   │   ├── auth/               # Login, password reset, token refresh
│   │   │   ├── users/              # User CRUD + liaisons (sites/groupes)
│   │   │   ├── profils/            # User profile management
│   │   │   ├── sites/              # Sites management
│   │   │   ├── groupes/            # Groupes list endpoint
│   │   │   ├── alarmes/            # Alarms list
│   │   │   ├── sondes/             # Sondes: GET all, calibrages, etalonnages
│   │   │   ├── lieux/              # Locations management
│   │   │   ├── etalons/            # Standards management
│   │   │   ├── actionneurs/        # Actuators management
│   │   │   └── (other resources)
│   │   ├── (admin)/                # Admin layout group
│   │   │   └── admin/              # Admin prefix (pages start with /admin/...)
│   │   │       ├── page.tsx        # Dashboard admin
│   │   │       ├── utilisateurs/   # Users management (CRUD with sites/groupes)
│   │   │       ├── alarmes/        # Alarms table with filters
│   │   │       ├── sondes/         # Sondes (3-table: Sondes, Calibrages, Etalonnages)
│   │   │       ├── lieux/          # Locations (3-tab: Général, Métrologie, Téléphonie)
│   │   │       ├── sites/          # Sites CRUD
│   │   │       ├── groupes/        # Groups CRUD
│   │   │       ├── profils/        # Profiles + permissions
│   │   │       ├── etalons/        # Standards CRUD
│   │   │       ├── actionneurs/    # Actuators CRUD
│   │   │       ├── parametres/     # System parameters
│   │   │       └── layout.tsx      # Admin sidebar + dock navigation
│   │   ├── (dashboard)/            # Dashboard layout group
│   │   │   └── surveillance/       # Surveillance page (graphiques + arborescence)
│   │   └── login/                  # Auth page
│   ├── lib/                        # Core utilities
│   │   ├── prisma.ts               # Database clients (main + mesure)
│   │   ├── jwt.ts                  # Token generation/verification
│   │   ├── auth.ts                 # User extraction from request
│   │   ├── api-logger.ts           # Audit logging wrapper
│   │   ├── logger.ts               # File-based logging (Winston)
│   │   ├── api.ts                  # API type definitions
│   │   ├── utils.ts                # Utilities (cn, format, etc)
│   │   ├── audit-db.ts             # Audit trail management
│   │   └── feature-flags.ts        # Feature flag controls
│   ├── hooks/                      # Custom React Query hooks
│   │   ├── useProfiles.ts          # Fetch profiles
│   │   ├── useSites.ts             # Fetch sites
│   │   ├── useGroups.ts            # Fetch groupes
│   │   ├── useAlarms.ts            # Fetch alarms (30s auto-refresh)
│   │   ├── useSondes.ts            # Fetch sondes (60s auto-refresh)
│   │   ├── useCalibrages.ts        # Fetch calibrages by serie
│   │   ├── useEtalonnages.ts       # Fetch etalonnages by serie
│   │   ├── useCurrentTime.ts       # Real-time clock for UI
│   │   └── (other hooks)
│   ├── components/
│   │   ├── ui/                     # shadcn + HeroUI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── combobox-select.tsx # ✅ HeroUI ComboBox wrapper
│   │   │   └── (other UI)
│   │   ├── page-header.tsx         # Reusable page title
│   │   ├── admin-nav-dock.tsx      # Bottom dock navigation
│   │   ├── monitoring-card.tsx     # ✅ Sensor card with alarm indicators
│   │   ├── alarm-table.tsx         # Alarms with acknowledge dialog
│   │   ├── audit-log-table.tsx     # Audit trail display
│   │   ├── data-table/
│   │   │   └── tanstack-table.tsx  # ✅ Reusable TanStack table with selection
│   │   └── (other components)
│   └── middleware/                 # Next.js middleware (auth routing)
├── prisma/
│   ├── db-main/
│   │   └── schema.prisma           # Main database schema (users, locations, profiles, etc)
│   └── db-mesure/
│       └── schema.prisma           # Measurements database schema (time-series)
└── public/
    └── service-worker.js           # Offline detection
```

## Admin Pages Completed

### 1. Dashboard Admin (`/admin`)
- **Status:** ✅ COMPLETE
- **Purpose:** Overview of system status
- **Content:** 5 cards (connected users, active alarms, acknowledgments, system logs, backups)
- **Refresh:** Auto-refresh with independent intervals per card

### 2. Users Management (`/admin/utilisateurs`)
- **Status:** ✅ COMPLETE
- **Table Columns:** Login, Nom, Prenom, Email, Profil, Tel_Num_Mobile, Expiry Date, Status
- **Features:**
  - Add/Edit/Delete users with row selection highlighting
  - Form fields: Login, Password, Nom, Prenom, Email, Profil (ComboBox), Telephone (optional), Sites (multi-checkbox), Groupes (multi-checkbox), Expiry Date (optional)
  - Automatic liaison creation for sites/groupes via `/api/users/{id}/sites` and `/api/users/{id}/groups`
  - Password validation with rules (uppercase, lowercase, numbers, special chars)
- **Form Validation:** React Hook Form + Zod
- **API:** POST/PATCH to `/api/users`

### 3. Alarms Management (`/admin/alarmes`)
- **Status:** ✅ COMPLETE
- **Table Columns:** Lieu, Début alarme, État (badge), Fin alarme, Acquittée (badge)
- **Filters:** État (Tous/Actives/Résolues), Acquittement (Tous/Acquittées/Non acquittées)
- **Auto-refresh:** 30 seconds
- **Row Selection:** Visual highlight with blue background + left border
- **API:** GET `/api/alarmes`

### 4. Sondes Management (`/admin/sondes`)
- **Status:** ✅ COMPLETE
- **3-Table Layout:**
  1. **Main Table (Sondes)** - Selectable with blue highlight, max-height with scroll
     - Columns: Adresse, Numéro de série, Port série, Module, État, Lieu
     - Buttons: Ajouter, Modifier (disabled when no selection), Imprimer (enabled)
     - Selection: Blue highlight + left border indicator
  
  2. **Calibrages Sub-Table** (appears when sonde selected)
     - Columns: Date, Opérateur, Unité, Décimales
     - Buttons: Générer fichier (disabled), Imprimer (disabled)
     - Selection: Blue highlight
  
  3. **Étalonnages Sub-Table** (appears when sonde selected)
     - Columns: Date, Validité, Opérateur, Incertitude
     - Buttons: Supprimer (disabled), Générer (disabled), Imprimer (disabled)
     - Selection: Blue highlight
- **Height Management:** max-h-96 (main), max-h-64 (sub-tables) with overflow scroll

### 5. Locations Management (`/admin/lieux`)
- **Status:** ✅ COMPLETE
- **3-Tab Structure:**
  1. **Général Tab:** Nom, Observations, Site (ComboBox), Groupe 1/2 (ComboBox)
  2. **Métrologie Tab:** 
     - Sonde Selection (ComboBox)
     - Consignes Settings
     - EMT Configuration (4 radio options)
     - Checkboxes for error correction + drift consideration
  3. **Téléphonie/Planning Tab:** Placeholder (expandable)
- **Form Validation:** Zod schema with 28+ fields
- **API:** GET/POST/PATCH `/api/lieux` with BigInt serialization fix
- **Row Selection:** Blue highlight + left border

### 6. Sites Management (`/admin/sites`)
- **Status:** ✅ COMPLETE
- **Simple CRUD:** 3-column table (Site, Description, Commentaires)
- **Buttons:** Nouveau, Modifier, Archiver, Imprimer
- **Modals:** Create/Edit with form validation
- **Row Selection:** Blue highlight + left border
- **API:** GET/POST/PATCH `/api/sites`

### 7. Groups Management (`/admin/groupes`)
- **Status:** ✅ COMPLETE
- **Table Columns:** Numéro, Nom du groupe, Observations, État
- **Row Selection:** Blue highlight + left border
- **Associated Tables:** Lieux and Sondes associated with group (sub-tables)
- **API:** GET/POST/PATCH `/api/groupes`

### 8. Profiles Management (`/admin/profils`)
- **Status:** ✅ COMPLETE
- **Table:** Name, Description, User Count (read-only)
- **Features:**
  - View/Edit/Delete profiles
  - Permission management (checkboxes for modules: Admin, Métrologie, Surveillance, VigiLog)
  - Delete protection: Cannot delete profile if users assigned
- **Row Selection:** Blue highlight + left border
- **API:** GET/POST/PATCH/DELETE `/api/profils`

### 9. Standards/Étalons Management (`/admin/etalons`)
- **Status:** ✅ COMPLETE
- **Table Columns:** N° Série, État, etc.
- **Features:** Add/Edit/Archive with modal
- **Row Selection:** Blue highlight + left border
- **API:** GET/POST/PATCH `/api/etalons`

### 10. Actuators/Actionneurs Management (`/admin/actionneurs`)
- **Status:** ✅ COMPLETE
- **Table Columns:** N° Série, Type, État, etc.
- **Features:** Add/Edit/Delete with modal
- **Row Selection:** Blue highlight + left border
- **API:** GET/POST/PATCH/DELETE `/api/actionneurs`

### 11. Surveillance Dashboard (`/dashboard/surveillance`)
- **Status:** ✅ COMPLETE
- **Two View Modes:**
  1. **Graphiques Tab:** Grid of monitoring cards
     - Sorted by alarm status (critical → warning → ok)
     - Dynamic header colors based on sensor status
     - Real-time charts with threshold lines
     - Frequency + last measurement display
  2. **Arborescence Tab:** Hierarchical tree view
     - Sites → Groups → Sensors
     - Alarm counts: "X sondes (Y alarmes)"
     - Status badges (critical, warning, ok, inactive)
- **Filters:** By site, by group (multi-select)
- **Auto-refresh:** Paginated sensor loading (1000 per page)
- **API:** GET `/api/sensors/paginated`

### 12. System Parameters (`/admin/parametres`)
- **Status:** ✅ COMPLETE (basic setup)
- **Content:** Refresh intervals, system settings
- **Editable via UI:** Toggle and input controls

## Recent Implementations (Latest Session - Dec 19, 2025)

### ✅ Surveillance Page Enhancements
1. **Alarm Prioritization (sensors-cards-grid.tsx)**
   - Cards sorted by status: Critical → Warning → OK
   - Critical alarms appear first for better visibility

2. **Monitoring Card Visual Indicators**
   - Dynamic header colors based on sensor status:
     - 🔴 Critical (red bg) + AlertTriangle icon
     - 🟡 Warning (yellow bg) + AlertCircle icon
     - 🔵 OK (slate bg - default)
   - Alarm icon displayed in card header when status !== 'ok'

3. **Alarm Count in Tree View (surveillance-tree.tsx)**
   - Site level: "5 sondes (2 alarmes)" format
   - Group level: "3 sondes (1 alarme)" format
   - Shows alarm count only when alarms are present

### ✅ Table Selection Visibility Improvements
1. **Fixed TanStackTable Selection Logic** ([tanstack-table.tsx](../website/src/components/data-table/tanstack-table.tsx))
   - Corrected boolean logic for `isSelected` detection
   - Added support for all ID types: Id_Sonde, Id_Site, Id_Lieu, Id_Utilisateur, Id_Groupe, Id_Profil, Id_Etalon, Id_Actionneur, Id_Alarme, id, Id
   - Enhanced selection styling:
     - Background: `bg-blue-100 dark:bg-blue-950`
     - Text: `text-blue-900 dark:text-blue-100`
     - Left border: `border-l-4 border-l-blue-600 dark:border-l-blue-400`
     - Font weight: `font-medium`

2. **Added `selectedRowId` Prop to All Admin Pages**
   - ✅ [sondes-client.tsx](../website/src/app/(admin)/admin/sondes/sondes-client.tsx) - `selectedRowId={selectedSonde}`
   - ✅ [users-client.tsx](../website/src/app/(admin)/admin/utilisateurs/users-client.tsx) - `selectedRowId={selectedUser?.id}`
   - ✅ [profils-client.tsx](../website/src/app/(admin)/admin/profils/profils-client.tsx) - `selectedRowId={selectedProfile?.id}`
   - ✅ [groupes-client.tsx](../website/src/app/(admin)/admin/groupes/groupes-client.tsx) - `selectedRowId={selectedGroupe?.Id_Groupe}`
   - ✅ [etalons-client.tsx](../website/src/app/(admin)/admin/etalons/etalons-client.tsx) - `selectedRowId={selectedEtalon?.Id_Etalon}`
   - ✅ [actionneurs-client.tsx](../website/src/app/(admin)/admin/actionneurs/actionneurs-client.tsx) - `selectedRowId={selectedActionneur?.Id_Actionneur}`
   - ✅ [alarm-table.tsx](../website/src/components/alarm-table.tsx) - `selectedRowId={selectedAlarm?.id}`
   - Already present: [lieux-client.tsx](../website/src/app/(admin)/admin/lieux/lieux-client.tsx), [sites-client.tsx](../website/src/app/(admin)/admin/sites/sites-client.tsx)

### Previous Sessions - Core Features
1. ✅ Docker autofill on Login/Password fields (autoComplete attributes)
2. ✅ Duplicate PageHeader banners (moved to per-page)
3. ✅ SelectItem empty value error (changed "" to "all")
4. ✅ Added Telephone field to users (uses existing Tel_Num_Mobile column)
5. ✅ Added Sites multi-select to users (creates liaisons via `/api/users/{id}/sites`)
6. ✅ Added Groupes multi-select to users (creates liaisons via `/api/users/{id}/groups`)
7. ✅ Fixed PageHeader margins on dashboard (moved outside content wrapper)
8. ✅ HeroUI ComboBox migration: Replaced shadcn Select with autocomplete (lieux-client.tsx: 5 Selects)
9. ✅ Alarms Page: Table with filters, auto-refresh
10. ✅ Sondes Page: 3-table cascading layout with scroll-limited tables
11. ✅ Navigation: AlertTriangle icon added to dock for alarms page
12. ✅ Table Heights: max-h-96 for main sondes, max-h-64 for calibrages/etalonnages

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
