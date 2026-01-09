# Conventions API

Objectif : converger vers un format de réponse cohérent sans casser l’app.

## Format standard
- Succès : `{ ok: true, data: ... }`
- Erreur : `{ ok: false, error: string, message: string, ... }`

Helpers :
- `website/src/lib/api-response.ts`
- `website/src/lib/http.ts` (helper fetch client)

## Règles
- Préférer `fetchJson/getJson/postJson/...` depuis `lib/http.ts`.
- Utiliser `apiOk` / `apiError` pour les nouvelles routes API.
- Garder des codes HTTP corrects (401, 403, 404, 500).

## Déjà migré (exemples)
- `/api/auth/login`
- `/api/auth/logout`
- `/api/me`
- `/api/hotline/*`

## Notes
Certains endpoints legacy retournent du JSON brut. Migrer endpoint par endpoint pour éviter les régressions.
