# Conventions API

## Objectif
Standardiser les réponses, le logging, l'authentification et la sécurité des routes `website/src/app/api/**`.

## Format de réponse canonique
- Succès : `{ ok: true, data: ... }`
- Erreur : `{ ok: false, error: string, message: string, details?: unknown }`

Implémentation de référence : `website/src/lib/api-response.ts`.

## Helpers à utiliser
- Serveur : `apiOk(...)`, `apiError(status, code, message, details?)`
- Client : helpers HTTP de `website/src/lib/http.ts` (`fetchJson`, `getJson`, `postJson`, etc.)

## Wrappers d'API (obligatoires)
Utiliser un wrapper selon le besoin métier :
- `withLogging`
- `withAuthLogging`
- `withAdminLogging`
- `withAuthorizationLogging("CODE_AUTORISATION")`

Ces wrappers garantissent journalisation et traçabilité homogènes.

## Authentification
- Cookie principal : `auth-token`
- Lecture de compatibilité côté serveur : `token` puis `auth-token` (voir `website/src/lib/auth.ts`)
- Pour toute nouvelle route protégée : refuser explicitement en `401` si non authentifié.

## Codes HTTP à respecter
- `200/201` : succès
- `400` : payload invalide
- `401` : non authentifié
- `403` : authentifié mais non autorisé
- `404` : ressource absente
- `409` : conflit/dépendances métier
- `500` : erreur serveur

## Règles de migration
- Les routes legacy non conformes peuvent rester transitoirement.
- Toute nouvelle route ou route modifiée doit utiliser le format canonique.
- Migration progressive endpoint par endpoint, sans casser les consommateurs existants.

## Références liées
- Carte des endpoints : `website/docs/API_MAP.md`
- Notifications agent : `website/docs/NOTIFICATIONS_AGENT.md`
