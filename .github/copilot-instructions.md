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
│   ├── app/api/           # API routes (organized by resource)
│   │   ├── auth/          # Login, password reset, token refresh
│   │   ├── profils/       # User profile management
│   │   ├── users/         # User CRUD
│   │   ├── sensors/       # Sensor data and alarms
│   │   ├── mesures/       # Measurement queries
│   │   └── audit/         # Activity logs
│   ├── lib/               # Core utilities
│   │   ├── prisma.ts      # Database clients (use for all DB)
│   │   ├── jwt.ts         # Token generation/verification
│   │   ├── auth.ts        # User extraction from request
│   │   ├── api-logger.ts  # Audit logging wrapper
│   │   └── logger.ts      # File-based logging
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   └── middleware/        # Next.js middleware (auth routing)
├── prisma/
│   ├── db-main/           # Config database schema
│   └── db-mesure/         # Time-series database schema
└── public/
    └── service-worker.js  # Offline detection
```

## Common Tasks

### Add New API Endpoint
1. Create file: `src/app/api/resource/route.ts`
2. Import auth + logging: `import { getAuthenticatedUser } from '@/lib/auth'`
3. Check permissions from user payload
4. Wrap with `withLogging()` for automatic audit trail
5. Use correct Prisma client (prisma for config, prismaMesure for measurements)

### Modify Database
1. Edit schema: `prisma/db-main/schema.prisma` or `db-mesure/schema.prisma`
2. Run migration: `npm run prisma:migrate:main` (adds migration file)
3. Commit migration to git
4. Prisma Client auto-regenerates in `src/generated/`

### Debug Issues
- **Auth failures:** Check `auth-token` vs `token` cookie inconsistency
- **Query timeouts:** Use `measurement-cache.ts` or add indexes in schema
- **Missing features:** Check `enableTestPages` feature flag in [feature-flags.ts](website/src/lib/feature-flags.ts)

## External Dependencies
- **ORM:** Prisma v6 (two databases)
- **UI:** HeroUI v2.7 + shadcn (Radix primitives)
- **Forms:** React Hook Form + Zod validation
- **Auth:** JWT (jsonwebtoken)
- **Logging:** Winston with daily rotation
- **Email:** SMTP configuration required

## Gotchas & Important Notes

1. **Cookie inconsistency:** Some routes expect `token`, others `auth-token` — standardize to `token` in new code
2. **Database separation:** Never join across db-main and db-mesure — load separately and merge in JavaScript
3. **Measurement cache:** Must call `clearMeasurementCache()` after alarms change
4. **Test pages disabled in prod:** Feature flags control visibility — not simple route blocking
5. **Timezone handling:** MySQL datetimes stored as UTC — handle conversions on frontend
