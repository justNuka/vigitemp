# Agent Windows - Notifications (serveur C#)

## Objectif
Permettre au serveur C# d'afficher ou masquer une alarme sur les postes clients.

## Principe
Le serveur envoie une requete HTTP a l'agent local. L'agent affiche l'UI d'alerte.

## Endpoint cote agent
- `GET http://<agent-ip>:8000/alarm?action=show`
- `GET http://<agent-ip>:8000/alarm?action=hide`

## Securite
- L'agent n'accepte que les appels depuis le reseau local.
- Aucune donnee sensible n'est exposee.

## Usage cote serveur
- Declenchement d'alarme -> `show`
- Retour a la normale -> `hide`
