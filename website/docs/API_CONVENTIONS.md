# API conventions (WIP)

Objectif : converger progressivement vers un format homogène, **sans casser l’app** (migration par endpoints).

## Format recommandé (nouveau)

- **Succès** : `{ ok: true, data: ... }`
- **Erreur** : `{ ok: false, error: string, message: string, ... }`

Helpers :

- `website/src/lib/api-response.ts`
- `website/src/lib/http.ts` (fetch JSON helper, utilisé côté client)

## Endpoints déjà migrés

- `website/src/app/api/auth/login/route.ts`
- `website/src/app/api/auth/logout/route.ts`
- `website/src/app/api/auth/logout-auto/route.ts`
- `website/src/app/api/me/route.ts`

## Client HTTP (dé-doublonnage Axios)

Le projet utilisait `axios` à quelques endroits alors que la majorité du code utilise `fetch`.
On converge vers `fetch` via `website/src/lib/http.ts`.
