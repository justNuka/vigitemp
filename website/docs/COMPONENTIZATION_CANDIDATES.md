# Candidats componentisation (pages & écrans)

Objectif : identifier les fichiers UI longs et proposer un découpage propre sans changer le comportement.

## Utilisateurs
Fait :
- `src/app/[locale]/(admin)/admin/utilisateurs/_components/create-user-dialog.tsx`
- `src/app/[locale]/(admin)/admin/utilisateurs/_components/edit-user-dialog.tsx`
- `src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx`

## Lieux / Capteurs
Fait :
- `src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx`
- `src/app/[locale]/(admin)/admin/lieux/lieux-client.tsx`
- `src/app/[locale]/(admin)/admin/lieux/_components/locations-table.tsx`

## Profil (dashboard)
Fait :
- `src/app/[locale]/(dashboard)/profil/page.tsx`

## Auth
Partiel :
- `src/app/[locale]/login/login-form.tsx`
- `src/app/[locale]/force-password-change/page.tsx`

## Admin dashboard (accueil)
- `src/app/[locale]/(admin)/admin/page.tsx`
  - extraire widgets : alarmes, users, sites, etc.

## Surveillance (dashboard)
- `src/app/[locale]/(dashboard)/surveillance/surveillance-client.tsx`
- `src/app/[locale]/(dashboard)/surveillance/monitoring-cards-grid.tsx`
- `src/app/[locale]/(dashboard)/surveillance/sensors-grid-client.tsx`

Découpage conseillé :
- hooks : query + filtres + formatage
- UI : cards, badges, headers
