# Notifications agent (Vigitemp)

## Objectif
Permettre au portail web d'envoyer des notifications Windows aux postes ayant l'agent actif, pour signaler le declenchement d'une alarme et proposer un acces rapide a la page des alarmes.

---

## Flux global
1) L'utilisateur se connecte sur le portail web.
2) Le portail tente de recuperer le nom de la machine via l'agent local (`GET /info`).
3) La connexion met a jour:
   - `t_utilisateur.Adresse_IP_Connexion`, `t_utilisateur.Nom_Machine_Connexion`, `t_utilisateur.Date_Heure_Derniere_Connexion`
   - `t_postes_clients` (IP, nom machine, date/heure de derniere connexion)
4) Lors d'une alarme, l'API `POST /api/alarmes/dispatch` envoie une notification aux agents actifs.
5) L'agent affiche un toast Windows et ouvre la page des alarmes au clic.

---

## Endpoints agent (local)
L'agent expose un serveur HTTP local sur le poste (port par defaut `8000`).

- `GET /info`
  - Retour: `{ "machineName": "...", "ip": "..." }`
  - Accessible uniquement depuis le loopback (`127.0.0.1` / `localhost`).

- `POST /session`
  - Cree une session locale (token, utilisateur, expiration).

- `POST /notify`
  - Payload attendu:
    ```json
    {
      "title": "Alarme Vigitemp",
      "message": "Une alarme est declenchee",
      "location": "Site / Lieu / Sonde",
      "date": "13/01/2026 15:42",
      "url": "http://host:3000/fr/alarmes",
      "alarmId": 123,
      "lieuId": 45
    }
    ```
  - Affiche une notification Windows et ouvre l'URL au clic.

---

## API de dispatch (web)
`POST /api/alarmes/dispatch`

### Regles
- Seuls les postes actifs recemment sont notifies.
- Fenetre d'activite par defaut: 15 minutes.
- Deduplication par IP (un poste = une notification).

### Variables d'environnement
- `NEXT_PUBLIC_APP_URL`
  - Base URL publique du portail (ex: `http://192.168.63.189:3000/`).
  - Utilisee pour generer les liens d'alarme dans les notifications.
- `VIGITEMP_AGENT_PORT` (optionnel)
  - Port d'ecoute agent (defaut `8000`).
- `VIGITEMP_AGENT_TIMEOUT_MS` (optionnel)
  - Timeout HTTP agent en ms (defaut `1500`).
- `VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES` (optionnel)
  - Fenetre de poste actif en minutes (defaut `15`).

---

## Champs BDD utilises
### t_utilisateur
- `Adresse_IP_Connexion`
- `Nom_Machine_Connexion`
- `Date_Heure_Derniere_Connexion`

### t_postes_clients
- `Adresse_IP_Connexion`
- `Nom_Machine_Connexion`
- `Date_Heure_Derniere_Connexion`

---

## UI / UX
- Titre: "Nouvelle alarme"
- Message: infos du lieu/sonde + date/heure.
- Ligne d'action: "Cliquez sur la notification pour vous rendre sur la page des alarmes".
