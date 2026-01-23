# Portail web - Architecture

## Vue d'ensemble
- Next.js App Router (Next 16)
- React + Tailwind CSS
- Prisma (MySQL/MSSQL)
- i18n via `next-intl`
- proxy serveur via `proxy.ts`

## Structure generale
- `src/app/[locale]` : routes localisees (FR/EN)
- `src/app/api` : API internes
- `src/components` : UI
- `src/hooks` : logique front
- `prisma/` : schemas DB main et mesures

## Auth et permissions
- session principale via `/api/me`
- gating UX (hard / soft) pour eviter les flashs
- hotline isolee (cookie dedie + namespace `/api/hotline/*`)

## Surveillance temps reel
- SSE pour alarmes et surveillance
- tables virtualisees pour gros volumes

## Sous-pages a importer
Les sections suivantes sont documentees dans `website/docs/` :
- Conventions API : `website/docs/API_CONVENTIONS.md`
- Map API : `website/docs/API_MAP.md`
- Auth / permissions / licence : `website/docs/AUTH_PERMISSIONS_LICENCE_GATING.md`
- Conventions de chargement : `website/docs/LOADING_CONVENTIONS.md`
- Installation offline : `website/docs/INSTALL_OFFLINE_STANDALONE.md`
- Domaines de test HTTPS : `website/docs/LOCAL_DEV_TEST_DOMAINS_HTTPS.md`
