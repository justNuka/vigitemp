# API map — canon FR + principaux consumers (`website/src`)

Date: 2025-12-29

Objectif: donner une vue “utile” des endpoints canonisés (FR) et des zones du front qui les consomment.

Pour lister toutes les routes présentes localement:

- `Get-ChildItem -Recurse -Filter route.ts src\\app\\api | Select-Object FullName`
- `rg -n '/api/' -S src | sort`

## Canon FR (endpoints)

### Alarmes — `src/app/api/alarmes/*`

- `GET /api/alarmes`
- `POST /api/alarmes/[id]/acknowledge`
- `POST /api/alarmes/[id]/resolve`
- `GET /api/alarmes/stream` (SSE)
- `POST /api/alarmes/dispatch` (header `x-vigitemp-secret`)

Consumers:

- `website/src/hooks/useAlarms.ts`
- `website/src/components/global-app-effects.tsx`

### Capteurs — `src/app/api/capteurs/*`

- `GET,POST /api/capteurs`
- `GET,PATCH,DELETE /api/capteurs/[id]`
- `GET /api/capteurs/paginated`

Consumers:

- `website/src/hooks/use-paginated-sensors.ts`
- `website/src/app/[locale]/(dashboard)/surveillance/*`

### Groupes — `src/app/api/groupes/*`

- `GET,POST /api/groupes`
- `PATCH /api/groupes/[id]`
- `GET /api/groupes/[id]/lieux`
- `GET /api/groupes/[id]/utilisateurs`

Consumers:

- `website/src/hooks/useGroupes.ts`
- `website/src/hooks/useGroups.ts`
- `website/src/components/user-access-dialog.tsx`

### Lieux — `src/app/api/lieux/*`

- `GET,POST /api/lieux`
- `PATCH /api/lieux/[id]`
- `GET,POST /api/lieux/resume`

Consumers:

- `website/src/hooks/useLieux.ts`
- `website/src/app/[locale]/(admin)/admin/lieux/*`

## Auth / profils / settings

- Auth: `src/app/api/auth/*` (login/logout/reset-password/…)
- User session: `GET /api/me` (consommé dans `website/src/components/global-app-effects.tsx`)
- Profils + autorisations: `src/app/api/profils/*`, `src/app/api/autorisations/*`
- Settings:
  - `GET /api/settings/password-rules` (consommé via `website/src/hooks/usePasswordRules.ts`)
  - `/api/settings` et `/api/settings/[key]` sont admin (`GERER_PROFIL`)

