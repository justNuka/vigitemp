# Vigitemp `website/` — Check-up complet & reste à faire (mise à jour)

Dernière mise à jour: 2025-12-31

Ce document liste ce qui reste à traiter (doublons, dettes techniques, incohérences) après les derniers nettoyages et refactors.

## Statut rapide (ce qui est OK)

- i18n: `next-intl` centralisé (`src/i18n/*`) + routing locale-aware (`src/i18n/routing.ts`) + proxy via `src/proxy.ts` (Next.js 16).
- ESLint: une seule config projet (`eslint.config.mjs`).
- Animations: usage `motion/react`. Note: `framer-motion` est présent en transitif dans `package-lock.json` (dépendance de `motion`), mais pas dans `package.json`.
- Tables: `TanStackTable` (paginée + sticky header + scroll) + `DashboardTable` (preview sans pagination/search).
- Auth: endpoints `/api/auth/*` + flow “force password change” stabilisé (cookies + endpoint dédié).
- Surveillance: factorisation (hooks/helpers/components) + pagination/infinite “charger plus” côté client.

## Reste à faire (priorisé)

### P0 — À décider / à finaliser (fonctionnel)

- Étalons: définir le comportement du bouton “Tester” (hardware / simulation / dry-run) puis implémenter (UI + API si nécessaire). Indice: TODO dans `src/app/[locale]/(admin)/admin/etalons/etalons-client.tsx`.
- MonitoringCard: actions “Localisation” et “Paramétrage” encore en TODO (cf. `src/components/monitoring-card.tsx`).
- Vérifier la prod: l’API `/api/revalidate` est bien verrouillée (déjà dev-only + feature flag), et documenter l’usage prévu (cf. `src/app/api/revalidate/route.ts` + docs de perf).

### P1 — Cohérence / architecture

- Conventions de nommage: appliquer la règle “dossiers FR / fichiers EN (hors `page.tsx`/`route.ts`)” par batch de features (beaucoup de fichiers UI restent en FR, ex: `alarmes-page-client.tsx`).
- URLs localisées: compléter `routing.pathnames` pour couvrir tous les écrans (objectif: slugs FR en FR, EN en EN). Aujourd’hui seule une partie des routes est explicitement mappée.
- API “canon FR”: décider de l’exception `/api/me` (EN) vs migration vers un endpoint FR (tout en gardant rétro-compat si nécessaire).

### P2 — Doublons / ménage (faible risque)

- Hooks non utilisés: supprimés (`src/hooks/useVirtualizedPagination.ts`, `src/hooks/usePaginatedSensors.ts`).
- Standardiser le client HTTP: migration effectuée pour les derniers `fetch("/api/...")` identifiés (push subscribe et logout-auto).
- Réduire les `any`: plusieurs handlers/DTOs ont encore du typage lâche (ex: `src/lib/api-wrappers.ts`, `src/lib/api-logger.ts`, plusieurs routes API). Objectif: enlever les `any` sur les “frontières” (API ↔ DB ↔ UI) en priorité.

### P2 — Lint warnings (non bloquants)

- React Compiler “incompatible-library” (RHF, TanStack): warnings attendus (à documenter comme “OK”).
- `@next/next/no-img-element`: `src/components/language-switcher.tsx` (optionnel: migrer vers `next/image`).

## Prochain ordre de travail suggéré

1) Spécifier puis implémenter “Tester étalon”.
2) Compléter la table de routage `next-intl` (slugs localisés partout).
3) Batch “naming” (fichiers EN) par feature.
4) Nettoyage des hooks inutilisés + standardisation `fetch` → `src/lib/http.ts`.
