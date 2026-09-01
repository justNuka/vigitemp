# Hotline VigiSensys - Fonctionnement

Dernière mise à jour : 16/07/2026

## Objectif

La hotline VigiSensys permet à un technicien de tester une sonde ou un module depuis une interface web dédiée, sans passer par l'ensemble des écrans d'administration.

Elle sert principalement à :

- vérifier qu'une sonde répond ;
- lire une température ou une mesure ;
- lire une configuration ;
- envoyer certaines commandes de diagnostic ;
- tester un port COM ou un module ;
- récupérer les trames envoyées et reçues.

## Vue d'ensemble

Le fonctionnement est basé sur trois composants :

| Composant | Rôle |
| --- | --- |
| Navigateur hotline | Interface utilisée par le technicien |
| Site web VigiSensys | Authentification, session hotline, interface et relais API |
| Serveur C# VigiSensys | Communication avec les modules, ports COM et sondes |

Le navigateur ne communique pas directement avec les ports COM. Toutes les commandes passent par le site web, qui relaie ensuite vers le serveur C#.

## Flux simplifié

```text
Technicien
  -> Page hotline web
  -> API hotline Next.js
  -> Serveur C# VigiSensys
  -> Module / port COM
  -> Sonde
```

La réponse suit le chemin inverse.

## Sessions hotline

L'accès hotline utilise une session dédiée.

Le site web gère :

- la connexion hotline ;
- le jeton d'accès ;
- le jeton de rafraîchissement ;
- l'expiration de session ;
- la déconnexion.

Les durées sont configurées par :

```text
HOTLINE_ACCESS_TOKEN_TTL_MINUTES
HOTLINE_REFRESH_TOKEN_TTL_MINUTES
HOTLINE_JWT_SECRET
```

## Routes principales

Les routes internes utilisées par le site web sont :

| Route | Usage |
| --- | --- |
| `/api/hotline/login` | Connexion hotline |
| `/api/hotline/refresh` | Rafraîchissement de session |
| `/api/hotline/logout` | Déconnexion |
| `/api/hotline/health` | Vérification de disponibilité |
| `/api/hotline/sensor-test` | Test sonde ou commande |
| `/api/hotline/request-errors` | Suivi des erreurs récentes |

Le serveur C# expose de son côté les endpoints utilisés par le web, généralement sur le port `5310`.

## Configuration de communication

Le web utilise les variables suivantes pour joindre le serveur C# :

```env
HOTLINE_SERVER_HOST="192.168.x.x"
HOTLINE_SERVER_PORT=5310
HOTLINE_SERVER_TIMEOUT_MS=10000
```

Si web et serveur C# sont sur la même machine, `HOTLINE_SERVER_HOST` peut pointer vers l'adresse locale du serveur.

Si les composants sont séparés, il faut indiquer l'adresse réseau du serveur C# et ouvrir le port correspondant.

## Commandes et tests

Depuis l'interface hotline, le technicien peut choisir :

- un type de sonde ;
- un numéro de série ;
- un port COM ou une configuration connue ;
- une action de test.

Selon le type de sonde, les commandes peuvent inclure :

| Commande | Usage général |
| --- | --- |
| `TEMP` | Lire une mesure |
| `CONF` / lecture configuration | Lire les paramètres sonde |
| `DCON` | Lire les consignes/configuration GSP |
| `ECON` | Envoyer les consignes GSP |
| `DCAL` / `ECAL` | Lire ou envoyer des coefficients d'ajustage |
| `ED-H` | Synchronisation date/heure |

Les commandes exactes dépendent du protocole sonde et de l'implémentation serveur.

## Résultat affiché

La page hotline affiche généralement :

- le résultat interprété ;
- les trames TX envoyées ;
- les trames RX reçues ;
- les timeouts ;
- les erreurs de configuration ;
- les recommandations de vérification.

Les trames sont utiles pour distinguer :

- une sonde qui ne répond pas ;
- une réponse vide ;
- une commande incorrecte ;
- un problème de port COM ;
- un mauvais type de sonde.

## Override manuel

L'interface peut permettre un override manuel de connexion.

Il sert à tester une sonde qui n'est pas encore correctement créée en base ou à forcer un port COM.

À utiliser avec précaution :

- vérifier le type de sonde ;
- vérifier le numéro de série ;
- vérifier le port COM ;
- éviter les tests concurrents avec la surveillance.

## Interaction avec la surveillance

La hotline et la surveillance peuvent utiliser les mêmes ressources :

- port COM ;
- module ;
- worker d'interrogation ;
- sonde.

Pour éviter les conflits, il est recommandé de désactiver temporairement la surveillance des lieux concernés lors de tests intensifs.

## Sécurité

La hotline doit être considérée comme une interface technique sensible.

Points importants :

- ne jamais exposer directement le port du serveur C# sur Internet ;
- limiter l'accès au réseau interne ou au VPN ;
- utiliser HTTPS sur le site web quand il est exposé à plusieurs postes ;
- utiliser un secret JWT robuste ;
- limiter la durée des sessions ;
- tracer les accès et les tests.

## Logs

Les logs utiles sont répartis entre :

| Source | Contenu |
| --- | --- |
| Logs web | Authentification hotline, appels API, erreurs HTTP |
| Logs serveur C# | Commandes envoyées, réponses, timeouts, port COM |
| Logs navigateur | Erreurs d'affichage ou appels API bloqués |

Pour un diagnostic, récupérer au minimum :

- l'heure du test ;
- le numéro de série ;
- le type de sonde ;
- le port COM ;
- la commande envoyée ;
- les lignes TX/RX ;
- l'erreur affichée.

## Cas fréquents

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| Timeout | Sonde hors portée, port COM occupé, mauvais module | Vérifier port, RSSI, module, surveillance concurrente |
| Réponse vide | Commande non reconnue ou trame incomplète | Vérifier format exact de commande |
| Erreur de connexion serveur | Serveur C# arrêté ou port bloqué | Vérifier service, firewall, `HOTLINE_SERVER_HOST` |
| Mauvaise sonde testée | Numéro de série ou type incorrect | Recontrôler la fiche sonde |
| Résultat incohérent | Commande envoyée à un mauvais type de sonde | Refaire le test avec le bon type |

