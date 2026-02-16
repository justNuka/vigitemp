# Notifications agent (Vigitemp)

## Objectif
Permettre au portail web de notifier les postes Windows actifs via l'agent local lors d'une alarme, avec traçabilité complète côté base.

## Flux global
1. L'utilisateur se connecte (`POST /api/auth/login`) et le portail met à jour les métadonnées de connexion.
2. Les postes actifs sont identifiés via `t_postes_clients` (IP + dernière connexion récente).
3. Lors d'un déclenchement, `POST /api/alarmes/dispatch` envoie un payload à l'agent local (`/notify`).
4. L'agent affiche la notification Windows et remonte ses événements vers `POST /api/notifications/agent-event`.
5. Le portail met à jour les statuts de livraison et historise les événements.

## Endpoints web impliqués

### Dispatch alarme
- `POST /api/alarmes/dispatch`
- Header requis : `x-vigitemp-secret: <VIGITEMP_ALARM_DISPATCH_SECRET>`
- Fonction : créer notification + livraisons, appeler les agents, tracer succès/échecs.

### Callback agent
- `POST /api/notifications/agent-event`
- Header requis : `x-vigitemp-agent-secret: <VIGITEMP_AGENT_SECRET>`
- Fonction : enregistrer les événements agent (`shown`, `clicked`, `closed`, `failed`, `sent`) et mettre à jour le statut de livraison.

### Proxy local (navigateur -> agent loopback)
- `GET, POST, DELETE /api/agent/proxy/[...path]`
- Chemins autorisés uniquement : `/session`, `/info`, `/agent-secret`
- Cibles loopback : `http://127.0.0.1:8000` et `http://localhost:8000`

## Endpoint agent local

### `POST /notify`
Payload envoyé par le portail (champs principaux) :
```json
{
  "title": "Alarme Vigitemp",
  "message": "...",
  "location": "Site / Lieu",
  "date": "16/02/2026 11:23:45",
  "url": "http://host:3000/fr/alarmes",
  "alarmId": 123,
  "lieuId": 45,
  "alarmType": "Alarme haute",
  "triggeredAt": "...",
  "lastValue": "...",
  "lastMeasureAt": "...",
  "deliveryId": 999,
  "correlationId": "uuid"
}
```

## Variables d'environnement
- `VIGITEMP_ALARM_DISPATCH_SECRET` : secret du dispatch alarmes
- `VIGITEMP_AGENT_SECRET` : secret des callbacks d'événements agent
- `VIGITEMP_AGENT_PORT` (défaut `8000`)
- `VIGITEMP_AGENT_TIMEOUT_MS` (défaut `1500`)
- `VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES` (défaut `15`)
- `NEXT_PUBLIC_APP_URL` : base publique pour construire l'URL d'alarme

## Règles métier du dispatch
- Fenêtre d'activité des postes basée sur `Date_Heure_Derniere_Connexion`.
- Déduplication par IP (`t_postes_clients`) pour éviter les doublons sur un même poste.
- Création d'une livraison par poste ciblé avec corrélation UUID.

## Tables utilisées
- `t_utilisateur` : métadonnées de connexion utilisateur
- `t_postes_clients` : inventaire des postes actifs
- `t_notification` : notification racine
- `t_notification_delivery` : état de livraison par poste
- `t_notification_event` : journal des événements remontés par l'agent

## Mapping des statuts callback
- `shown` -> `shown`
- `clicked` -> `clicked`
- `closed` -> `dismissed` (sauf si déjà `clicked`)
- `failed` / `error` -> `failed`
- `sent` -> `sent`
