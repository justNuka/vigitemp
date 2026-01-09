# Notifications Windows via l’agent - options de routage (sans dépendre des IP)

Objectif : quand une **alarme** est déclenchée côté serveur, afficher une **notification Windows** sur les postes via **Vigitemp agent**.

## Pourquoi éviter « identifier l’agent par IP » ?

- IP changeante (DHCP), IPv6, VPN, bascule Wi-Fi/Ethernet.
- Plusieurs agents derrière une même IP (NAT) ou plusieurs interfaces par poste.
- Difficile à sécuriser proprement (spoofing, allowlist fragile).

Conclusion : l’IP peut servir au debug, mais **pas** comme identité ni comme méthode de routage.

## Modèles possibles (du plus robuste au plus simple)

### Option A - Connexion sortante persistante (recommandé)

L’agent ouvre une connexion **sortante** vers le backend (souvent en `wss://` sur 443) et reste connecté.

- Transport : WebSocket / SignalR / gRPC streaming (selon stack).
- Identité : `agentId` (GUID) + `agentToken` (secret) + métadonnées (`hostname`, `version`, `siteId`, `userId`, etc.).
- Routage : le serveur push l’événement d’alarme aux agents abonnés (site/groupe/user).
- Avantages : temps réel, NAT-friendly, pas besoin de connaître l’IP, gestion offline via `lastSeen`.
- Inconvénients : nécessite un service hub + gestion reconnexion.

### Option B - Register + polling (fallback simple)

L’agent s’enregistre (une fois), puis **poll** régulièrement pour récupérer les événements.

- Endpoint : `GET /api/agent/notifications?since=...` (ou `?cursor=...`).
- Avantages : simple, robuste réseau, facile à monitorer.
- Inconvénients : pas temps réel (latence = intervalle), plus de trafic, nécessite une file d’événements.

### Option C - Découverte LAN (UDP broadcast / mDNS) (à limiter)

Utile uniquement si **tout** est sur le même LAN et non segmenté.

- Avantages : plug & play sur petit réseau.
- Inconvénients : fragile (VLAN, Wi-Fi isolé, VPN), difficile à sécuriser.

## Recommandation pratique

1) **Option A** en cible (push temps réel, routage par abonnement).
2) **Option B** comme fallback (si hub indisponible ou pour première itération).

## Identité & sécurité (recommandé)

- `agentId` : GUID généré au premier lancement, stocké localement (fichier/registry).
- `agentToken` : token long-terme délivré par le backend (rotation possible).
- TLS obligatoire.
- Scopes : l’agent annonce ce qu’il couvre (ex: `siteIds`, `groupIds`) et le backend valide.

## Routage : « qui doit recevoir quoi »

À définir dès maintenant :

- Notifications globales (tous les agents).
- Par **site** / **groupe** (le plus cohérent pour Vigitemp).
- Par **utilisateur** (si l’agent est lié à une session Windows).
- Par **profil/rôle** (admin vs opérateur).

## Données d’événement minimales

Pour chaque notification :

- `eventId` (UUID) + `createdAtUtc`
- `alarmId` / `idLieu` / `sensorSerial`
- `severity` (alarme vraie uniquement, ou inclure pré-alarme si souhaité)
- `title`, `message`
- `actionUrl` (deep-link vers l’UI)
- `dedupeKey` (ex: `alarmId + state + minute`) pour éviter le spam

## Checklist

1) Les agents sont-ils sur des postes utilisateurs ou des machines dédiées ?
2) Les agents peuvent-ils joindre le backend en sortant sur 443 ?
3) Temps réel requis (<= 2s) ou latence 10-30s acceptable ?
4) Routage par site/groupe, par user, ou les deux ?
5) Besoin d’une queue offline (poste éteint) ?

## Décision rapide

- Réseau hétérogène / VPN / NAT / besoin temps réel -> **Option A**.
- Besoin « vite fait robuste » sans infra temps réel -> **Option B**.
- Petit LAN unique -> Option C possible mais déconseillée en base.
