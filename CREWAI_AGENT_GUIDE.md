# Vigitemp — Guide projet pour une flotte d’agents IA (CrewAI)

Ce document sert de “source de vérité pratique” pour des agents IA qui doivent contribuer au repo sans casser l’app.

## TL;DR (objectif du système)

Vigitemp est un système de **monitoring de températures** avec :

- un **serveur C# Windows Service** qui lit des capteurs (ports série), écrit les mesures en base, et déclenche/dispatch des alarmes
- un **agent C# Windows (tray app)** déployé côté poste client, qui expose un petit serveur local (port 8000) pour des besoins d’intégration/UI
- un **site web Next.js** (admin + dashboard) qui consomme les données, gère l’auth, affiche la surveillance, et reçoit les alarmes
- deux bases MySQL (une “main”, une “mesures / time-series”)

## Arborescence repo (racine)

Racine: `c:\Vigitemp project\vigitemp`

- `Vigitemp Serveur/` : Windows Service (.NET Framework 4.8)
- `Vigitemp agent/` : agent Windows (tray) (.NET Framework 4.8, x86)
- `website/` : Next.js 16 + React + Prisma + Tailwind
- `db/` : scripts SQL utilitaires (triggers, extraction)

## Flux “haut niveau” (qui parle à qui)

1) **Vigitemp Serveur** lit les capteurs (ports série), calcule/évalue l’état, écrit dans MySQL.
2) **Website** lit/écrit dans MySQL via Prisma (2 schémas), expose des API Next (App Router).
3) **Vigitemp Serveur** notifie le website lors d’une alarme (HTTP POST + secret).
4) **Agent** est un compagnon local (port 8000) + session locale, utilisé par le website / navigateur selon les usages.

## Bases de données

Il y a **2 DB MySQL** utilisées par `website/` (Prisma) :

- DB “main” (config/users/capteurs/alarmes/…)
- DB “mesures” (time-series, journal d’audit, historiques)

Dans `website/.env` (valeurs locales de dev) :

- `DATABASE_URL="mysql://<user>:<pass>@<host>:<port>/<db_main>"`
- `DATABASE_MESURE_URL="mysql://<user>:<pass>@<host>:<port>/<db_mesure>"`

Scripts utiles :

- `db/triggers_base_mesures.sql` : triggers côté DB mesures
- `db/extract_data_from_large_sql_files.py` : extraction depuis gros dumps SQL

## Conventions globales (importantes pour les agents)

### Nommage / langue

- **Dossiers** : en **français** (features/sections)
- **Fichiers** : en **anglais** (components, hooks, lib, etc.)
- Exceptions imposées par Next.js/App Router : `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, etc.

### i18n / slugs localisés

Objectif produit : **URLs en anglais si locale EN, en français si locale FR** (slugs localisés).

- Routing next-intl : `website/src/i18n/routing.ts`
- Helpers de slugs : `website/src/i18n/pathnames.ts`
- Middleware/proxy (Next.js 16 dans ce repo) : `website/src/proxy.ts`

Règle : ne pas “hardcoder” les liens en `/foo` quand ils sont localisés ; utiliser les helpers/mappings `next-intl`.

### Prisma (code généré)

Le code Prisma **généré est indispensable** et ne doit pas être modifié à la main :

- `website/src/generated/@prisma-db-main/*`
- `website/src/generated/@prisma-db-mesure/*`

La génération se fait via :

- `website/package.json` → script `prisma:generate`

### Logging vs audit trail

- **Logging (tech)** : logs fichiers (winston + rotation), pour debugging/traçabilité technique
- **Audit trail (fonctionnel)** : “journal d’audit” consultable côté utilisateur, écrit en DB mesures

Implémentation (website) :

- Logger: `website/src/lib/logger.ts` (winston + `logs/YYYY-MM/vigitemp-YYYY-MM-DD.log`)
- Écriture DB audit: `website/src/lib/audit-db.ts` (table `tm_journal` dans DB mesures)

Terminologie produit :

- UI: “Journal d’audit”
- Technique/code: “audit trail”

## Vigitemp Serveur (C# Windows Service)

### Où

- Solution: `Vigitemp Serveur/Vigitemp Serveur.sln`
- Projet: `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.csproj`

### Type / runtime

- `.NET Framework 4.8`
- `OutputType=WinExe`, exécuté comme **Windows Service**

Entrée principale :

- `Vigitemp Serveur/Vigitemp Serveur/Program.cs` (ServiceBase)

### Config (App.config)

`Vigitemp Serveur/Vigitemp Serveur/App.config`

- `Vigitemp.WebsiteBaseUrl` : base URL du site (ex: `http://127.0.0.1:3000`)
- `Vigitemp.AlarmDispatchSecret` : secret d’auth pour le dispatch d’alarmes (doit matcher le website)

### Alarm dispatch vers le website

Code:

- `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs`

Comportement :

- envoie un `POST` avec header `x-vigitemp-secret`

Point d’attention (cohérence routes) :

- le serveur cible actuellement `POST /api/alarms/dispatch` (EN)
- côté website, la route canon FR est `POST /api/alarmes/dispatch` (voir `website/docs/API_MAP.md`)

Avant de supprimer une route “EN”, vérifier les producers (serveur/agent/outils) et migrer proprement.

### Dépendances externes & risques

- Connexions DB MySQL (credentials/host peuvent être codés en dur dans le code historique)
- Accès ports série (drivers, droits, hardware)
- Service Windows (installation/démarrage via outillage Windows/ops)

## Vigitemp Agent (C# tray app)

### Où

- Solution: `Vigitemp agent/Vigitemp Agent.sln`
- Projet: `Vigitemp agent/Vigitemp agent/Vigitemp Agent.csproj`

### Type / runtime

- `.NET Framework 4.8`
- `PlatformTarget=x86` (important pour certaines DLLs / drivers)

### Fonctionnement

- UI tray + contexte applicatif : `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
- Serveur local:
  - `HttpListener` sur `http://<ip-locale>:8000/` et `http://127.0.0.1:8000/`
  - fallback “loopback only” si URLACL interdite : `Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs`

### Session locale (auth côté agent)

- Stockage : `SessionStore` (DPAPI chiffré)
- Fichier : `%LOCALAPPDATA%/VigitempAgent/session.dat`
- Contenu : `token/userId/username/expiresAtUtc`

### Config (App.config / env)

`Vigitemp agent/Vigitemp agent/App.config`

- `VigitempSiteWebUrl` : URL du site (fallback)

Le code lit aussi (priorité haute) :

- env `VIGITEMP_SITEWEB_URL` (si défini)

## Website (Next.js 16)

### Où

- App: `website/`
- Source: `website/src/`
- Routes Next (App Router):
  - Pages: `website/src/app/[locale]/**/page.tsx`
  - APIs: `website/src/app/api/**/route.ts`

### Tech stack

- Next.js `^16.0.10`
- React `19.2.1`
- Prisma `^6.19.0` (2 schémas)
- TailwindCSS
- `next-intl` (i18n + slugs localisés)
- Tables: `@tanstack/react-table`
- Animations: `motion` (package `motion`, pas besoin de `framer-motion` dans `package.json`)

### Démarrage rapide (dev)

Depuis `website/` :

1) Installer deps : `npm install`
2) Générer Prisma : `npm run prisma:generate`
3) Lancer : `npm run dev`

Scripts utiles (voir `website/package.json`) :

- `npm run test:db` : test connexion DB
- `npm run test:api` : tests API (script interne)
- `npm run lint` : ESLint

### Variables d’environnement (website)

Dans `website/.env` (exemple dev) :

- `DATABASE_URL`
- `DATABASE_MESURE_URL`
- `NODE_ENV`

Autres variables présentes dans le code :

- `JWT_SECRET` (signature/validation JWT)
- `VIGITEMP_ALARM_DISPATCH_SECRET` (dispatch alarme depuis le serveur C#)
- `VIGITEMP_PROXY_DEBUG=1` (logs proxy en dev)
- Push notifications (VAPID):
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Flags:
  - `ENABLE_TEST_PAGES=true` (build/start des pages de test)
  - `ENABLE_REVALIDATE_API=true` (si utilisé)
- `NEXT_PUBLIC_APP_URL` (si utilisé par certaines features)
- `LOG_LEVEL` (niveau console en prod)

Règle doc/sécurité : ne jamais committer des secrets ; documenter les noms + comportements, pas les valeurs.

### Proxy / auth / i18n (Next.js 16 dans ce repo)

Le fichier clé (remplace le middleware “classique” dans ce projet) :

- `website/src/proxy.ts`

Rôle :

- applique `next-intl` (rewrite/redirect locale)
- protège des routes (redirige vers `/{locale}/login` si cookie absent)
- bloque certaines routes de test en production

Cookie d’auth (historique) :

- `auth-token` est utilisé par `proxy.ts`
- `website/src/lib/auth.ts` supporte `token` (standard) + `auth-token` (compat)

### API conventions

Docs :

- `website/docs/API_CONVENTIONS.md`
- `website/docs/API_MAP.md`

Convergence en cours vers un format homogène :

- OK: `{ ok: true, data: ... }`
- Erreur: `{ ok: false, error, message, ... }`

Helpers :

- `website/src/lib/api-response.ts` (`apiOk`, `apiError`)
- `website/src/lib/http.ts` (`fetchJson` + unwrap automatique de `{ok:true,data}`)

Wrappers recommandés côté API (App Router) :

- `website/src/lib/api-wrappers.ts`
  - `withAuthLogging(handler)`
  - `withAdminLogging(handler)`
  - `withAuthorizationLogging(code, handler)`

### Prisma (2 clients)

Fichier central :

- `website/src/lib/prisma.ts`

Exporte :

- `prisma` (DB main)
- `prismaMesure` (DB mesures)

Les clients sont des singletons lazily initialized (Proxy) pour éviter des connexions multiples.

### Alarmes (SSE + dispatch)

Endpoints (canon FR) :

- `GET /api/alarmes/stream` (SSE)
- `POST /api/alarmes/dispatch` (header `x-vigitemp-secret`)

Consumers (front) :

- `website/src/hooks/useAlarms.ts`
- `website/src/components/global-app-effects.tsx`

## Guide de contribution “safe” (pour agents CrewAI)

### Avant de modifier une API

- Rechercher tous les consumers: `rg -n "/api/<...>" website/src -S`
- Vérifier les producers externes (C# serveur/agent) avant de supprimer une route
- Garder une période de compat (alias/redirect) si nécessaire

### Avant de renommer un dossier/slug

- Slugs: mettre à jour `website/src/i18n/routing.ts` (FR/EN)
- Navigation: vérifier sidebar(s) et liens
- Proxy: vérifier protection de route dans `website/src/proxy.ts`

### “Generated code” / code sensible

- Ne pas éditer `website/src/generated/**`
- Ne pas casser les scripts Prisma (`npm run prisma:generate`)
- Toute modif auth/logging doit préserver:
  - cohérence cookies (`auth-token` vs `token`)
  - séparation logging vs audit trail

### Points connus / TODO techniques

- Route de dispatch alarmes: serveur C# → `/api/alarms/dispatch` vs website → `/api/alarmes/dispatch` (à aligner).
- Plusieurs zones du front restent à “batch-renommer” pour respecter la règle dossiers FR / fichiers EN (voir `website/docs/CHECKUP_REMAINING.md`).

## Docs existantes utiles (website)

- `website/docs/CHECKUP_REMAINING.md` : état de la dette / reste à faire
- `website/docs/COMPONENTIZATION_CANDIDATES.md` : pages/écrans candidats à découpe en composants
- `website/docs/API_CONVENTIONS.md` : conventions API (WIP)
- `website/docs/API_MAP.md` : mapping endpoints canon FR + consumers

