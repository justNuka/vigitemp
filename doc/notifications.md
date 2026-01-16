# Notifications (alarme)

## Objectif
Assurer l'affichage d'alertes sur les postes clients quand une alarme est declenchee, sans dependance internet.

## Architecture
- Serveur C# : detecte les alarmes et declenche les notifications.
- Agent C# : affiche les toasts localement sur le poste.
- Portail web : affiche les alarmes dans l'UI (SSE/API).

## Flux principal
1) Une mesure depasse un seuil et respecte le retard d'alarme.
2) Le serveur C# emet une notification vers chaque agent cible.
3) L'agent affiche un toast Windows local.
4) Le portail web est mis a jour (SSE).

## Agent (poste client)
L'agent expose un endpoint HTTP local :
- `GET http://<agent-ip>:8000/alarm?action=show&lieuId=...&message=...`
- `GET http://<agent-ip>:8000/alarm?action=hide`

Affichage du toast via `Microsoft.Toolkit.Uwp.Notifications` (local uniquement).

## Ciblage des postes
Options possibles :
- Liste statique d'IP (simple, mais fragile en DHCP).
- Enregistrement des agents au demarrage (recommande).
- DNS local ou mapping AD si disponible.

Recommandation : enregistrement agent -> serveur (IP, nom machine, token), puis push uniquement sur agents "online".

## Securite
- Token partage entre serveur et agents.
- Refuser les requetes hors reseau local.
- Journaliser les erreurs d'envoi.

## UX toast
Contenu conseille :
- Nom du lieu / sonde
- Valeur, seuil, date
- Action "Ouvrir la page d'alarme"

Lien possible :
`http://<IP_WEB>:3000/fr/alarmes?from=toast`

## Logs
- Serveur : `C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log`
- Agent : `%LOCALAPPDATA%\VigitempAgent\logs\agent.log`

## A faire
- Formaliser un endpoint d'enregistrement agent.
- Standardiser le format de payload des toasts.
- Ajouter un healthcheck pour eviter les retries inutiles.
