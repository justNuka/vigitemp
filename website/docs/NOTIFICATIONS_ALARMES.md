# Notifications & alarmes (toast + Windows)

Ce document décrit :
- ce qui a été implémenté dans le projet ;
- ce qu’il faut configurer pour que ça fonctionne ;
- ce qu’il reste à faire pour déclencher automatiquement les notifications lors d’une alarme.

## Objectif

Quand une alarme est déclenchée :
1) afficher un toast dans l’interface si un onglet Vigitemp est ouvert ;
2) envoyer une notification Windows même si le site est fermé (via Web Push + Service Worker).

En plus : afficher une confirmation native si l’utilisateur tente de fermer/recharger l’onglet.

---

## Résumé de ce qui a été fait

### 1) Confirmation fermeture onglet (toutes les pages)

- Ajout d’un listener global `beforeunload` qui déclenche la confirmation native du navigateur.
- Fichiers :
  - `website/src/components/before-unload-guard.tsx`
  - `website/src/components/providers.tsx`
- Désactivation possible via : `NEXT_PUBLIC_ENABLE_CLOSE_CONFIRMATION=false`

Notes :
- Le texte du message n’est pas personnalisable (limitation des navigateurs modernes).

### 2) Toast temps réel dans l’UI (onglet ouvert)

- Ajout d’un flux SSE (Server‑Sent Events) qui “poll” les alarmes actives et émet un événement `alarm` quand une nouvelle alarme apparaît.
- Un composant client global écoute ce flux et affiche un toast via `sonner`.
- Fichiers :
  - `website/src/app/api/alarms/stream/route.ts` (SSE)
  - `website/src/components/global-app-effects.tsx` (écoute SSE + toast)
  - `website/src/components/providers.tsx` (montage global)

### 3) Notifications Windows quand le site est fermé (Web Push)

- Service Worker :
  - écoute `push` et affiche `showNotification`
  - gère `notificationclick` et ouvre `/dashboard/surveillance`
  - fichier : `website/public/service-worker.js`

- Abonnement Push côté client :
  - demande la permission (toast “Activer”)
  - s’abonne via `PushManager.subscribe(...)`
  - envoie l’abonnement à l’API
  - fichier : `website/src/components/global-app-effects.tsx`

- API d’abonnement/désabonnement :
  - `POST /api/push/subscribe`
  - `POST /api/push/unsubscribe`
  - fichiers :
    - `website/src/app/api/push/subscribe/route.ts`
    - `website/src/app/api/push/unsubscribe/route.ts`

- Stockage DB :
  - ajout du modèle `t_push_subscription` dans `db-main`
  - l’unicité est assurée via `Endpoint_Hash` (SHA-256) pour éviter l’erreur MySQL “Specified key was too long”
  - fichier : `website/prisma/db-main/schema.prisma`

- Envoi Web Push côté serveur :
  - helper d’envoi : `website/src/lib/web-push.ts`
  - endpoint protégé (server→server) : `POST /api/alarms/dispatch`
  - fichier : `website/src/app/api/alarms/dispatch/route.ts`
  - protection : header `x-vigitemp-secret` doit matcher `VIGITEMP_ALARM_DISPATCH_SECRET`

- Dépendances :
  - ajout de `web-push` + `@types/web-push` (dans `website/`)

### 4) Auth cookie (compat)

- `website/src/lib/auth.ts` accepte maintenant `token` (standard) et `auth-token` (legacy).

---

## Ce qu’il faut faire (configuration / déploiement)

### A) Base de données (db-main)

Créer la table `t_push_subscription` (au minimum) :
- `npx prisma db push --schema=./prisma/db-main/schema.prisma`

Puis régénérer le client Prisma db-main :
- `npx prisma generate --schema=./prisma/db-main/schema.prisma`

Note :
- `npm run prisma:generate` génère *les deux* clients, et peut échouer à cause de `db-mesure` (schéma déjà invalide dans ce repo). Utiliser la commande ciblée ci-dessus pour `db-main`.

### B) Générer les clés VAPID

Dans `website/` :
- `node -e "const webpush=require('web-push'); console.log(webpush.generateVAPIDKeys())"`

Cela affiche :
- `publicKey`
- `privateKey`

### C) Variables d’environnement

Ajouter ces variables (ex: `.env`, variables d’hébergement, etc.) :
- **Client** (exposée au navigateur) :
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>`
- **Serveur** :
  - `VAPID_PUBLIC_KEY=<publicKey>`
  - `VAPID_PRIVATE_KEY=<privateKey>`
  - `VAPID_SUBJECT=mailto:ton-email@domaine.com` (ou une URL)
  - `VIGITEMP_ALARM_DISPATCH_SECRET=<chaine_random_longue>`

Optionnel :
- `NEXT_PUBLIC_ENABLE_CLOSE_CONFIRMATION=false` (désactive la confirmation de fermeture)

### D) Prérequis navigateur / prod

- Les notifications Push exigent en pratique un contexte sécurisé (HTTPS) en production.
- L’utilisateur doit accepter la permission de notification.

---

## Ce qu’il reste à faire (déclenchement automatique)

Actuellement :
- le **toast** (SSE) est “temps réel” si un onglet est ouvert ;
- la **notification Windows** est envoyable via `POST /api/alarms/dispatch`, mais il faut que ton serveur C# (ou autre) l’appelle au bon moment.

### 1) Déclencher l’envoi Push au moment de l’alarme

Quand l’alarme est créée/passe active côté serveur :
- appeler `POST /api/alarms/dispatch`
- header obligatoire :
  - `x-vigitemp-secret: <VIGITEMP_ALARM_DISPATCH_SECRET>`
- payload conseillé :
  - `{ "alarmId": 123 }`

Le backend Next récupère alors l’alarme et construit un message par défaut.

Alternative :
- envoyer directement `{ title, body, url }` si tu veux un format contrôlé.

### 2) Cibler par utilisateur (optionnel)

Aujourd’hui, l’envoi push part vers **toutes** les subscriptions non archivées.
Si tu veux “seulement les utilisateurs concernés” :
- ajouter une notion de ciblage (ex: par site/groupe/lieu/utilisateur)
- filtrer `t_push_subscription` avant l’envoi dans `website/src/lib/web-push.ts`

### 3) Amélioration “vraie” en temps réel (optionnel)

Le SSE actuel fait un polling toutes les 5s.
Si tu veux instantané “à la milliseconde” :
- pousser un event depuis le serveur C# vers Next (webhook) + diffusion vers clients (SSE/WS),
ou
- utiliser WebSocket.

---

## Tests rapides (manuel)

1) Lancer le site (dev) :
- `npm run dev`

2) Ouvrir Vigitemp et accepter les notifications quand le toast le propose.

3) Déclencher une notification de test via l’endpoint d’envoi :
- `POST /api/alarms/dispatch` (avec `x-vigitemp-secret`)
- (ou avec `alarmId` réel)

4) Fermer l’onglet : la confirmation de fermeture doit apparaître.

