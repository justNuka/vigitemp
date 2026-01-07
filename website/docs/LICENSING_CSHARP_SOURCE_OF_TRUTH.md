# Proposition : licence signée, source de vérité = serveur C#

## Objectif
Dans une app web (Next.js), le code UI est livré au navigateur : on ne peut pas “cacher” une fonctionnalité de façon fiable.  
L’objectif réaliste est donc :
- **Sécurité** : empêcher l’usage d’une feature non licenciée côté serveur (API/serveur C#).
- **UX** : afficher/masquer des écrans et actions en fonction de l’état licence (confort, pas sécurité).
- **On‑prem / offline** : fonctionnement sans service externe.

Contrainte projet :
- **Solution hébergée chez le client** (BDD, serveur C#, serveur web).
- **Pas de dépendance Internet sortante** côté serveur C# (en pratique certains clients ont Internet, mais on ne peut pas en dépendre).

## Solution retenue (unique)
### 1) Le serveur C# est la seule source de vérité
Le serveur C# :
- valide/installe la licence,
- expose l’état licence + les “capabilities/features”,
- applique l’enforcement (ou fournit une décision exploitable) pour toutes les fonctionnalités licenciées.

La DB et le serveur web ne sont **pas** des sources de vérité de licence (au mieux : cache).

### 2) Format de licence : JSON signé (JWS/JWT)
On utilise un **token signé** (JWS, format JWT) contenant un payload JSON.

Pourquoi : la **signature** garantit l’authenticité et l’intégrité (si le fichier est modifié → signature invalide).  
La clé privée reste côté éditeur, la clé publique est embarquée côté client.

Payload recommandé (exemple de structure) :
- `licenseId` : identifiant unique
- `customerId` / `contractId`
- `issuedAt`, `expiresAt` (optionnel)
- `edition` : `light | standard | expert`
- `features` : map `{ featureKey: true/false }`
- `quotas` (optionnel) : `{ maxUsers, maxSites, maxSensors, ... }`

Le client reçoit un fichier texte `license.vtlic` (le token).

### 3) Binding (option 3) : “liaison propre” via clé publique locale
But : éviter la copie brute d’une licence entre machines, sans dépendre de fingerprints fragiles.

Principe :
- À l’installation, le serveur C# génère un **couple de clés** local (ex: Ed25519) et conserve la **clé privée** localement.
- Le serveur C# expose une `instancePublicKey` (ou `instanceId`) stable.
- La licence est émise (côté éditeur) avec un champ `bind.instancePublicKey` (ou dérivé) et la signature éditeur.
- Au runtime, le serveur C# vérifie :
  1) signature éditeur,
  2) compatibilité du binding avec l’instance locale.

Avantages :
- stable (évite les problèmes MachineGuid/BIOS/VM),
- supportable (on peut régénérer une paire de clés et ré‑émettre une licence),
- offline.

## API C# minimale (à implémenter)
- `GET /license/status`
  - Retourne : `status`, `licenseId`, `edition`, `features`, `quotas`, `expiresAt`, `instancePublicKey`
- `POST /license/install`
  - Input : `{ licenseToken: string }` (ou upload fichier)
  - Actions : vérifie, écrit `license.vtlic`, recharge en mémoire
- `POST /license/refresh` (optionnel)
  - Recharge depuis disque

Contraintes :
- endpoint d’installation **local uniquement** (loopback) ou protégé par un mécanisme admin strict.

## Intégration Next.js (website)
Règle : toute route `app/api/*` correspondant à une feature licenciée doit :
1) vérifier l’auth (déjà en place),
2) vérifier la licence (via cache local des capabilities renvoyées par C#),
3) répondre `403` avec un code stable si refus (`license_required`, `license_feature_disabled`, `license_expired`, `license_quota_exceeded`).

Le front peut :
- afficher l’état licence,
- masquer certains menus/pages,
- proposer l’installation de la licence (via une page admin qui appelle l’endpoint C# via Next).

## Roadmap (pragmatique)
1) C# : implémenter lecture + validation du token signé + `GET /license/status`.
2) Next : ajouter un endpoint `GET /api/license/status` (proxy vers C#, cache court).
3) Enforcer 2–3 routes API “sensibles” côté Next (preuve).
4) UI : écran “Licence” (état + installation).
5) Ajouter quotas et raffinements si nécessaire (sans changer le format).

## Points à décider avec le métier
- Expiration : blocage total vs read‑only vs période de grâce.
- Quotas : quels compteurs (users déclarés/simultanés, sites, sondes, etc.).
- Périmètre des features : liste stable des `featureKey`.
