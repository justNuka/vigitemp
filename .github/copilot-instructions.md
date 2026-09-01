# Instructions pour les assistants IA

## Documentation d'architecture canonique

Avant un développement ou un refactor significatif, lire dans cet ordre :

1. `docs/architecture/README.md`
2. `docs/architecture/development-guidelines.md`
3. `docs/architecture/refactor-roadmap.md` si le sujet concerne sécurité, dette technique ou architecture
4. `docs/architecture/metrology-refactor.md` si le sujet touche ajustage, étalonnage, lecture métrologique ou `HotlineApiServer`
5. `website/docs/API_CONVENTIONS.md` pour toute route API Next.js

Ces documents décrivent les conventions et la direction d'architecture. **Le code courant, le HEAD actuel de `dev` et les PR mergées restent la vérité sur l'état réellement implémenté.** Toujours les vérifier avant de coder et ne jamais supposer qu'un point de roadmap est encore à faire.

## Règles générales (obligatoires)
- Toujours répondre en français.
- En cas de doute fonctionnel, lire d'abord le code, les docs/backlogs et les PR pertinentes avant de demander une clarification.
- Dès qu'une modification touche au typage ou aux données, vérifier les schémas Prisma des deux bases.
- Respecter strictement le typage TypeScript (pas de `any` inutile, validations explicites).
- Construire une architecture Next.js 16 propre (Server Components, Client Components, data fetching adapté).
- Utiliser `next-intl` pour toute nouvelle page/feature.
- Concevoir en mobile-first (Tailwind CSS).
- Garantir l'accessibilité (clavier, contraste, lecteur d'écran, labels explicites).
- Respecter les conventions du projet (noms, structure, logs, audit trail, sécurité).
- Ajouter/maintenir la journalisation et l'audit trail sur chaque endpoint API créé/modifié lorsque l'action doit être auditée.
- Gérer les erreurs avec des messages clairs et traduisibles.
- Gérer l'authentification, les autorisations et la licence sur toute route sensible.
- Mettre à jour la modal de nouveautés + version à chaque feature impactante selon les conventions existantes.
- Optimiser les performances (requêtes Prisma, cache, éviter les redondances) sur la base de mesures lorsque le changement est non trivial.
- Favoriser la componentisation et éviter les duplications sans sur-abstraire.
- Employer le terme `sensor` (et non `probe`) pour les sondes dans le code en anglais.
- Pour les dates MySQL/MSSQL `DATETIME`, lire impérativement les conventions de `docs/architecture/development-guidelines.md` et réutiliser `website/src/lib/date-display.ts`.
- Pour l'affichage des dates et nombres, utiliser/améliorer les helpers canoniques paramétrables plutôt que disperser `toFixed`, `toLocaleString`, `Intl.*` ou des formats ad hoc dans les composants. Le chantier dédié est décrit dans le Lot 9A de `docs/architecture/refactor-roadmap.md`.
- Créer les branches avec un préfixe décrivant l'opération (`fix/`, `feature/`, `refactor/`, `docs/`, `chore/`, etc.) ; ne pas utiliser `agent/`.

## Vue d'ensemble du projet
Vigitemp contient :
- `website` : portail Next.js 16 (dashboard, admin, API)
- `Vigitemp agent` : agent Windows (notifications et interactions locales)
- `Vigitemp Serveur` : service Windows C# responsable notamment de l'interrogation des sondes, mesures et alarmes

La cible est un **monolithe modulaire**, pas une architecture microservices.

## Architecture données (critique)
- Base principale : `website/prisma/db-main/schema.prisma`
- Base mesures : `website/prisma/db-mesures/schema.prisma`
- Clients Prisma : `website/src/lib/prisma.ts`
- Compatibilité provider : `website/src/lib/sql-provider.ts`
- Helpers DB métrologie : `website/src/lib/metrology-db.ts`

Pattern attendu :
```ts
import { prisma, prismaMesure, AutresSchemasSiBesoin } from "@/lib/prisma"
```

## Authentification et session
- Login : `POST /api/auth/login`
- Cookie principal : `auth-token`
- Lecture côté API : compatibilité `token` puis `auth-token` dans `website/src/lib/auth.ts`
- Toute route protégée renvoie `401` si non authentifié, `403` si non autorisé.
- Toute rotation d'access token doit préserver l'échéance absolue de session ; une activité continue ne doit jamais rendre une session infinie.

## Conventions API (source de vérité)
- `website/docs/API_CONVENTIONS.md`
- `website/docs/API_MAP.md`
- `website/docs/NOTIFICATIONS_AGENT.md`

Règles de base :
- Réponses standard via `apiOk` / `apiError` (`website/src/lib/api-response.ts`)
- Wrappers API à privilégier (`website/src/lib/api-wrappers.ts`) :
  - `withLogging`
  - `withAuthLogging`
  - `withAdminLogging`
  - `withAuthorizationLogging("CODE")`
- Client HTTP applicatif à privilégier lorsque son contrat convient : `website/src/lib/http.ts` (`fetchJson`, `getJson`, `postJson`).

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
- Toute mutation sensible doit être traçable (log + audit selon le modèle existant).
- Ne jamais logger mots de passe, JWT, clés API ou secrets.

## Notifications agent (important)
- Dispatch alarme : `POST /api/alarmes/dispatch` avec header `x-vigitemp-secret`
- Callback agent : `POST /api/notifications/agent-event` avec header `x-vigitemp-agent-secret`
- Proxy loopback agent : `/api/agent/proxy/[...path]` (chemins autorisés limités)
- Détails dans `website/docs/NOTIFICATIONS_AGENT.md`

## Métrologie (important)
- Ajustage et étalonnage partagent déjà plusieurs helpers Web et doivent continuer à mutualiser leur runtime générique de session/lecture/verrouillage/restauration.
- Ne pas dupliquer les calculs métier spécifiques lorsqu'ils diffèrent réellement.
- Les opérations normales de métrologie ne doivent pas dépendre à terme d'une route `/api/hotline/...`.
- Avant toute modification de cette zone, lire `docs/architecture/metrology-refactor.md` et les helpers existants listés dans ce document.

## i18n et UI
- Tous les labels/messages UI doivent exister en FR/EN selon le système `next-intl` existant.
- Ajouter les clés dans les fichiers de messages appropriés (`website/src/messages/*.json`).
- Ne pas hardcoder des chaînes utilisateur dans les composants quand un namespace i18n existe déjà.
- Avant de créer une nouvelle primitive/composant générique, rechercher les composants partagés existants listés dans `docs/architecture/development-guidelines.md`.

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

Toujours vérifier les scripts réellement présents dans `package.json` avant d'utiliser une commande supplémentaire.

## Bonnes pratiques de modification
- Corriger la cause racine, pas uniquement les symptômes.
- Modifications minimales et ciblées.
- Ne pas changer des zones non liées à la demande.
- Maintenir la cohérence de style existante.
- Réutiliser les helpers/services existants avant d'en créer de nouveaux.
- Pas de big-bang refactor.
- Vérifier build/lint/tests pertinents après changement si possible.
- Vérifier le diff complet contre `dev` avant la PR.

## Checklist avant livraison
- Typage TS propre
- i18n complété
- Sécurité/auth/permissions/licence validées
- Logs/audit en place
- Messages d'erreur explicites
- Dates/fuseaux vérifiés si concernés
- Formatage dates/nombres centralisé et paramétré si concerné
- Compatibilité MySQL/SQL Server vérifiée si concernée
- Performance considérée si boucle sondes/historique
- Docs/backlog mis à jour si l'API/flux/comportement a changé
