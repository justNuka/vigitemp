# Vigitemp website checkup (reste à faire)

Dernière mise à jour : 2026-01-08

## Statut
- i18n : `next-intl` + routing + `proxy.ts` (Next 16).
- ESLint : une seule config (`eslint.config.mjs`).
- Animations : `motion/react`.
- Tables : `TanStackTable` (paginé + sticky header) et `DashboardTable` (preview).
- Installateurs : web + serveur, WinSW, build offline standalone.
- Hotline : route cachée + login + logs + health checks.
- DB provider : C# mysql/mssql, web installer mysql/mssql (Prisma reste mysql).

## P0 - fonctionnel
- Endpoints licence C# (`/license/status`, `/license/install`) + proxy web/UI.
- Audit des permissions (codes + naming) et standardisation.
- Confirmer le bouton test SMTP (UI + API).

## P1 - cohérence
- Compléter les slugs localisés `next-intl`.
- Règle de nommage : dossiers FR / fichiers EN (hors `page.tsx` / `route.ts`).
- Nom de variable env : `DATABASE_MESURES_URL` partout.

## P2 - cleanup
- Réduire les `any` sur les frontières API.
- Documenter les warnings React Compiler attendus.
