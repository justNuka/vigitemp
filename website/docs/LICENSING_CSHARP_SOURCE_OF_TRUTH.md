# Licence : token signé, source de vérité = serveur C#

## Objectif
Le code Next.js tourne dans le navigateur, donc les features doivent être enforce côté serveur.

- Sécurité : bloquer les features non licenciées côté serveur/API.
- UX : masquer/afficher selon licence (confort, pas sécurité).
- On-prem / offline : pas de dépendance externe.

## Décision
Le serveur C# est la seule source de vérité pour la licence.
Le web/la DB peuvent cacher, mais jamais décider.

## Format licence
Token signé (JWS/JWT) avec payload JSON.

Payload recommandé :
- `licenseId`
- `customerId`
- `issuedAt`, `expiresAt` (optionnel)
- `edition` (light/standard/expert)
- `features` / `quotas` (optionnel)
- `bind.instancePublicKey` (optionnel)
- `hotline` :
  - `enabled: true`
  - `username`
  - `passwordHash` (PBKDF2)

## Binding (optionnel)
- Le serveur C# génère une paire de clés instance.
- La licence peut inclure `bind.instancePublicKey`.
- Le serveur valide signature + binding.

## État actuel
- Le serveur C# valide signature + binding.
- Le login hotline est vérifié par le C# via la licence.

## Reste à faire
- `/license/status` + `/license/install` côté C#.
- Proxy web + UI admin pour l’état licence.
- Enforcement sur routes Next sensibles.
