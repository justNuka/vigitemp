# Conventions API

## Objectif
Converger vers un format de reponse coherent, sans casser l'existant.

## Format standard
- Succes : `{ ok: true, data: ... }`
- Erreur : `{ ok: false, error: string, message: string, details?: ... }`

## Helpers
- `website/src/lib/api-response.ts`
- `website/src/lib/http.ts`

## Regles
- Preferer `fetchJson/getJson/postJson/...` depuis `lib/http.ts`.
- Utiliser `apiOk` / `apiError` pour les nouvelles routes.
- Garder des codes HTTP corrects (401, 403, 404, 500).
- Eviter les JSON bruts pour les nouveaux endpoints.

## Notes
Les endpoints legacy peuvent rester en brut temporairement. Migrer endpoint par endpoint.
