# Serveur C# - Fonctionnement

## Role
Le serveur C# est le coeur metier :
- collecte des mesures (polling ou push capteurs)
- evaluation des consignes et alarmes
- ecriture en base
- diffusion des notifications vers le web et l'agent

## Collecte des mesures
Deux types de sondes :
- sondes interrogees par le serveur
- sondes qui poussent leurs mesures (ports ouverts)

## Cache des consignes
Les consignes sont portees par les lieux (pas par les sondes). Le serveur met en cache :
- consigne
- consigne sup / consigne inf
- seuils de pre-alarme
- retard d'alarme

Le cache est rafraichi periodiquement pour limiter les lectures DB.

## Logique d'alarme
- comparaison mesure vs consigne
- gestion du retard d'alarme
- distinction pre-alarme / alarme
- insertion dans `t_alarme` (active)
- transfert dans `t_alarme_histo` a l'acquittement

## Notifications
- Web : appels API (dispatch / SSE)
- Agent : appel HTTP local pour afficher/masquer les alarmes

## Configuration
- service Windows
- config dans `Vigitemp Serveur.exe.config`
- logs dans `C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log`

## Docs associees
- `Vigitemp Serveur/doc/GESTION_ALARMES.md`
- `Vigitemp Serveur/doc/MODIFS_BDD_CSHARP.md`
