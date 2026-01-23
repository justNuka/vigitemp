# Workplan serveur C#

## Objectif
Lister les travaux a planifier pour fiabiliser le serveur et la gestion des alarmes.

## Priorites
1) Gestion fiable des alarmes (retard, pre-alarme, historique)
2) Stabilite des ecritures BDD (bulk, transaction)
3) Notifications (web + agent)

## Chantiers
- Cache consignes par lieu (TTL configurable)
- Etats d'alarme en memoire + persistence minimale
- Detection pre-alarme + alarme
- Nettoyage et formatage des logs
- Support MSSQL (provider + config)

## A completer
- Regles metier spécifiques capteurs push
- Monitoring des files d'attente
