# Agent C# - Fonctionnement

## Role
L'agent Windows sert a :
- afficher les notifications d'alarme localement
- conserver une session locale (poste client)
- offrir un point d'entree pour le support

## Serveur HTTP local
L'agent expose un serveur local (par defaut : port 8000) :
- `GET /alarm?action=show|hide` : afficher ou masquer l'alarme
- `POST /session` : stocker une session locale (loopback only)

## Stockage session
- stockee avec DPAPI (protege par la machine)
- accessible uniquement en local

## Interaction avec le serveur
- le serveur C# envoie les demandes d'alarme
- l'agent declenche l'UI locale

## Logs
- logs locaux pour diagnostic
- pas de donnees metier sensibles en clair
