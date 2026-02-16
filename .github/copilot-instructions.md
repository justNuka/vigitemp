# Instructions pour les assistants IA

## Règles générales (obligatoires)
- Toujours répondre en français.
- En cas de doute fonctionnel, poser des questions de clarification avant de coder.
- Dès qu'une modification touche au typage ou aux données, vérifier les schémas Prisma des deux bases.
- Respecter strictement le typage TypeScript (pas de `any` inutile, validations explicites).
- Construire une architecture Next.js 16 propre (Server Components, Client Components, data fetching adapté).
- Utiliser `next-intl` pour toute nouvelle page/feature.
- Concevoir en mobile-first (Tailwind CSS).
- Garantir l'accessibilité (clavier, contraste, lecteur d'écran, labels explicites).
- Respecter les conventions du projet (noms, structure, logs, audit trail, sécurité).
- Ajouter/maintenir la journalisation et l'audit trail sur chaque endpoint API créé/modifié.
- Gérer les erreurs avec des messages clairs et traduisibles.
- Gérer l'authentification, les autorisations et la licence sur toute route sensible.
- Mettre à jour la modal de nouveautés + version à chaque feature impactante.
- Optimiser les performances (requêtes Prisma, cache, éviter les redondances).
- Favoriser la componentisation et éviter les duplications.
- Employer le terme `sensor` (et non `probe`) pour les sondes.

## Vue d'ensemble du projet
Vigitemp contient :
- `website` : portail Next.js 16 (dashboard, admin, API)
- `Vigitemp agent` : agent Windows (collecte locale + notifications)
- `Vigitemp Serveur` : composant serveur C#

## Architecture données (critique)
- Base principale : `website/prisma/db-main/schema.prisma`
- Base mesures : `website/prisma/db-mesures/schema.prisma`
- Clients Prisma : `website/src/lib/prisma.ts`

Pattern attendu :
```ts
import { prisma, prismaMesure, AutresSchemasSiBesoin } from "@/lib/prisma"
```

## Authentification et session
- Login : `POST /api/auth/login`
- Cookie principal : `auth-token`
- Lecture côté API : compatibilité `token` puis `auth-token` dans `website/src/lib/auth.ts`
- Toute route protégée renvoie `401` si non authentifié, `403` si non autorisé.

## Conventions API (source de vérité)
- `website/docs/API_CONVENTIONS.md`
- `website/docs/API_MAP.md`
- `website/docs/NOTIFICATIONS_AGENT.md`

Règles de base :
- Réponses standard via `apiOk` / `apiError` (`website/src/lib/api-response.ts`)
- Wrappers API à privilégier :
  - `withLogging`
  - `withAuthLogging`
  - `withAdminLogging`
  - `withAuthorizationLogging("CODE")`

## Endpoints : nomenclature canonique
- Les routes API sont en français dans `website/src/app/api/**`
- Exemples corrects :
  - `/api/utilisateurs`
  - `/api/alarmes`
  - `/api/lieux`
  - `/api/parametres`
- Éviter d'introduire de nouveaux alias anglais (`/api/users`, `/api/alarms`, etc.) sauf besoin explicite de compatibilité.

## Logging et audit
- Logger : `website/src/lib/logger.ts`
- Wrappers API : `website/src/lib/api-logger.ts`, `website/src/lib/api-wrappers.ts`
- Toute mutation doit être traçable (log + audit).

## Notifications agent (important)
- Dispatch alarme : `POST /api/alarmes/dispatch` avec header `x-vigitemp-secret`
- Callback agent : `POST /api/notifications/agent-event` avec header `x-vigitemp-agent-secret`
- Proxy loopback agent : `/api/agent/proxy/[...path]` (chemins autorisés limités)
- Détails dans `website/docs/NOTIFICATIONS_AGENT.md`

## i18n et UI
- Tous les labels/messages UI en français.
- Ajouter les clés dans les fichiers de messages appropriés (`website/src/messages/*.json`).
- Ne pas hardcoder des chaînes utilisateur dans les composants quand un namespace i18n existe déjà.

## Commandes utiles
```bash
cd website
npm run dev
npm run build:test
npm run start:test
npm run prisma:migrate:main
npm run prisma:migrate:mesure
npm run prisma:studio
npm run prisma:studio:mesure
```

## Bonnes pratiques de modification
- Corriger la cause racine, pas uniquement les symptômes.
- Modifications minimales et ciblées.
- Ne pas changer des zones non liées à la demande.
- Maintenir la cohérence de style existante.
- Vérifier build/lint/tests pertinents après changement si possible.

## Checklist avant livraison
- Typage TS propre
- i18n complété
- Sécurité/auth/permissions validées
- Logs/audit en place
- Messages d'erreur explicites
- Docs mises à jour si l'API/flux a changé
