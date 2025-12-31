# Vigitemp `website/` — Candidats “componentisation” (pages & écrans)

Objectif: identifier les fichiers UI trop longs / trop denses, et proposer un découpage cohérent (UI + logique + accès API), sans changer le comportement.

Les chemins ci-dessous sont donnés à titre de priorisation (basé sur la taille et la complexité apparente).

## 1) Utilisateurs (priorité)

Fait:
- `src/app/[locale]/(admin)/admin/utilisateurs/_components/create-user-dialog.tsx` (sections extraites + helpers)
- `src/app/[locale]/(admin)/admin/utilisateurs/_components/edit-user-dialog.tsx` (sections extraites + helpers)
- `src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx` (découpage + simplification)

## 2) Lieux / Capteurs

Fait:
- `src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx` (tabs extraits)
- `src/app/[locale]/(admin)/admin/lieux/lieux-client.tsx` (toolbar/actions extraites)
- `src/app/[locale]/(admin)/admin/lieux/_components/locations-table.tsx` (colonnes harmonisées)

## 3) Profil (dashboard)

Fait:
- `src/app/[locale]/(dashboard)/profil/page.tsx` (cards + form extraits dans `profil/_components/*`)

## 4) Auth

En cours / fait partiellement:
- `src/app/[locale]/login/login-form.tsx` (logic login/reset simplifiée, gestion `requirePasswordChange` via `HttpError`)
- `src/app/[locale]/force-password-change/page.tsx` (form extrait + endpoint dédié)

## 5) Dashboard admin (page d’accueil admin)

- `src/app/[locale]/(admin)/admin/page.tsx`
  - Extraire chaque bloc “DashboardTable” en widget:
    - `AdminAlarmsWidget`
    - `AdminUsersWidget`
    - `AdminSitesWidget`
    - etc.

## 6) Groupes

Fait:
- `src/app/[locale]/(admin)/admin/groupes/_components/groups-actions.tsx` (toolbar/actions extraites)

## 6) Surveillance (dashboard)

- `src/app/[locale]/(dashboard)/surveillance/surveillance-client.tsx`
  - Extraire:
    - `useSensorsInfinite` (infinite query + cache local)
    - `useSurveillanceFilters` (state + helpers)
    - `SurveillanceViewToggle` (tabs)
  - Attention: garder la même signature d’API (`/api/capteurs/paginated`) et le même comportement de filtrage.

- `src/app/[locale]/(dashboard)/surveillance/monitoring-cards-grid.tsx`
- `src/app/[locale]/(dashboard)/surveillance/sensors-grid-client.tsx`
  - Extraire: components UI atomiques (cards, badges, headers) et hooks communs (formatting, thresholds, status).

## Méthode (pour continuer après)

1) Prendre un écran, figer son comportement (smoke test manuel + lint/build).
2) Extraire d’abord les “types + schema + mapping” (zod/typescript).
3) Extraire ensuite les “hooks de mutation/query” (React Query) + invalidateQueries.
4) Terminer par extraction UI (sections, cards, toolbars).
