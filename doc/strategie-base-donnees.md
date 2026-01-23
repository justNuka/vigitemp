# Strategie base de donnees

## Objectifs
- Separer metier/configuration et mesures.
- Garantir la compatibilite MySQL et MSSQL.
- Minimiser les dependances aux donnees de production.

## Schemas

### vigi_main
Contient la configuration et le metier :
- utilisateurs, profils, permissions
- sites, groupes, lieux, sondes
- alarmes actives et historique
- parametres applicatifs

### vigi_mesures
Contient les mesures et historiques :
- mesures par sonde
- tables de detail type `tm_*`
- volume eleve, conservation longue

## Nommage et conventions
- Conserver les noms historiques (tables et colonnes) quand ils existent.
- Les noms de colonnes sont souvent en PascalCase avec underscores (legacy).
- Les cles primaires sont generalement `Id_*`.
- Eviter les renommages cote BDD si l'application depend deja des noms.

## Donnees seed (installation client)
Les seeds doivent contenir uniquement :
- types, parametres, permissions
- valeurs minimales de configuration
- compte admin par defaut :
  - login: `admin`
  - mot de passe: hash conforme au portail web
  - changement de mot de passe force a la premiere connexion

## Indexation et performance
- Indexer les cles de jointure (`Id_*`).
- Indexer les colonnes de tri frequentes (ex: date de mesure).
- Eviter les triggers pour la logique d'alarme.

## Compatibilite MySQL / MSSQL
- Le choix du provider est fait a l'installation.
- Prisma et le serveur C# doivent utiliser la meme configuration.
- Les scripts SQL doivent rester compatibles (types simples, pas de fonctions proprietaires).

## Tables de mesures specifiques
- Les tables techniques type `tm_mesures_gso` conservent leur schema d'origine.
- Ajouter uniquement les champs necessaires (ex: `Est_Valeur_Memoire` dans `tm_mesures`).
