# API map (canon FR + consumers principaux)

Dernière mise à jour : 2026-01-08

Objectif : lister les endpoints canon FR et les zones du front qui les consomment.

Pour lister les routes localement :
- `Get-ChildItem -Recurse -Filter route.ts src\\app\\api | Select-Object FullName`
- `rg -n '/api/' -S src | sort`

## Alarmes - `src/app/api/alarmes/*`
- `GET /api/alarmes`
- `POST /api/alarmes/[id]/acknowledge`
- `POST /api/alarmes/[id]/resolve`
- `GET /api/alarmes/stream` (SSE)
- `POST /api/alarmes/dispatch` (header `x-vigitemp-secret`)

Consumers :
- `website/src/hooks/useAlarms.ts`
- `website/src/components/global-app-effects.tsx`

## Capteurs - `src/app/api/capteurs/*`
- `GET,POST /api/capteurs`
- `GET,PATCH,DELETE /api/capteurs/[id]`
- `GET /api/capteurs/paginated`

Consumers :
- `website/src/hooks/use-paginated-sensors.ts`
- `website/src/app/[locale]/(dashboard)/surveillance/*`

## Groupes - `src/app/api/groupes/*`
- `GET,POST /api/groupes`
- `PATCH /api/groupes/[id]`
- `GET /api/groupes/[id]/lieux`
- `GET /api/groupes/[id]/utilisateurs`

Consumers :
- `website/src/hooks/useGroupes.ts`
- `website/src/hooks/useGroups.ts`
- `website/src/components/user-access-dialog.tsx`

## Lieux - `src/app/api/lieux/*`
- `GET,POST /api/lieux`
- `PATCH /api/lieux/[id]`
- `GET,POST /api/lieux/resume`

Consumers :
- `website/src/app/[locale]/(admin)/admin/lieux/*`

## Auth / session / profils
- Auth : `src/app/api/auth/*`
- Session user : `GET /api/me`
- Profils + autorisations : `src/app/api/profils/*`, `src/app/api/autorisations/*`

## Hotline (support)
- `POST /api/hotline/login`
- `POST /api/hotline/logout`
- `GET /api/hotline/health`
- `GET /api/hotline/logs`

Consumers :
- `website/src/app/[locale]/(hotline)/hotline/[slug]/*`
