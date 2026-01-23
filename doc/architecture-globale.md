# Architecture globale - Vigitemp

## Vue d'ensemble
Vigitemp est compose de trois blocs principaux, deployes chez le client :
- un serveur C# (collecte et logique metier)
- un agent C# (notifications locales et support)
- un portail web Next.js (interface utilisateur)

Les donnees sont stockees dans deux bases SQL :
- `vigi_main` : configuration, utilisateurs, sites, alarmes, parametres
- `vigi_mesures` : mesures et historiques de sondes

## Composants

### Serveur C#
- Service Windows qui collecte les mesures et applique la logique d'alarme.
- Stocke les mesures et les evenements d'alarme en base.
- Publie les changements (ex: alarmes) vers le portail web et l'agent.

### Agent C#
- Service Windows local, destine aux notifications sur les postes.
- Recoit les ordres d'affichage d'alarme et gere une session locale.
- Peut servir d'outil de support local (hotline).

### Portail web (Next.js)
- UI d'administration et de supervision.
- API internes dans `src/app/api`.
- Authentification et permissions centralisees.
- Affichage temps reel via SSE pour la surveillance.

### Bases de donnees
- MySQL par defaut, MSSQL en option.
- Deux schemas distincts pour separer metier et mesures.

## Flux principaux

1) Collecte des mesures
- Capteurs interroges par le serveur C# OU capteurs qui poussent leurs mesures.
- Le serveur conserve en memoire les consignes et etats d'alarme par lieu.

2) Calcul d'alarme
- Comparaison mesure / consigne / pre-alarme.
- Respect du retard d'alarme.
- Maj des tables d'alarme et historisation.

3) Diffusion
- Notification vers le portail web (API / SSE).
- Notification locale via l'agent Windows.

## Deploiement
- Installation offline via cle USB.
- Services Windows pour le serveur et le web.
- Scripts d'installation et de desinstallation fournis.

## Docs associees
- `doc/serveur-csharp.md`
- `doc/agent-csharp.md`
- `doc/portail-web.md`
- `doc/installation-client.md`
- `doc/strategie-base-donnees.md`
