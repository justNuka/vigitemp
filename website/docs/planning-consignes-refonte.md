# Planning De Consigne - Proposition De Refondation

## Objectif Fonctionnel
Permettre de definir, pour chaque lieu, des plages horaires recurrantes qui modifient:
- Consigne haute
- Consigne centrale
- Consigne basse

Puis revenir automatiquement aux consignes de base hors plage.

Exemple:
- Vendredi 19:00 -> Lundi 07:00
- Consignes planifiees: sup=5, consigne=0, inf=-5

## Choix d'Architecture
1. Le planning est stocke en base (regles par lieu).
2. L'application effective des consignes est faite par un EVENT SQL (chaque minute).
3. Le serveur C# continue de lire `t_lieu` comme aujourd'hui.
4. Les consignes de base sont conservees separement des consignes actives.

## Modele De Donnees Propose

### 1) Evolutions sur `t_lieu`
Ajouter:
- `Consigne_Base`
- `Consigne_Sup_Base`
- `Consigne_Inf_Base`
- `Consigne_Active`
- `Consigne_Sup_Active`
- `Consigne_Inf_Active`
- `Planning_Actif` (bool)
- `Planning_Source_Regle_Id` (nullable)
- `Planning_Derniere_Maj` (datetime)

Remarque:
- Le serveur C# doit surveiller les consignes actives.
- Les consignes de base restent la reference "hors planning".

### 2) Nouvelle table `t_lieu_planning_regle`
Colonnes recommandees:
- `Id_Regle` (PK)
- `Id_Lieu` (FK)
- `Actif` (bool)
- `Jour_Semaine` (1-7)
- `Heure_Debut` (TIME)
- `Heure_Fin` (TIME)
- `Consigne`
- `Consigne_Sup`
- `Consigne_Inf`
- `Priorite` (gestion de chevauchement)
- `Date_Creation`
- `Date_Maj`

### 3) Table optionnelle `t_lieu_planning_exception`
Utile pour periodes ponctuelles:
- Fermetures
- Jours feries
- Derogations temporaires

### 4) Audit / journal
Tracer chaque bascule de planning:
- source: `SQL_EVENT_PLANNING`
- lieu
- ancienne consigne active
- nouvelle consigne active
- regle appliquee (ou retour base)
- timestamp

## Application Par EVENT SQL

### Strategie
Event planifie chaque minute:
1. Determine la regle applicable "maintenant" pour chaque lieu.
2. Si regle trouvee:
   - Applique les consignes de la regle aux champs actifs.
   - `Planning_Actif = 1`
   - `Planning_Source_Regle_Id = Id_Regle`
3. Sinon:
   - Remet les consignes actives = consignes de base.
   - `Planning_Actif = 0`
   - `Planning_Source_Regle_Id = NULL`
4. Met a jour uniquement si changement reel (evite ecritures inutiles).

### Cas Vendredi 19h -> Lundi 7h
Creer 4 regles:
- Vendredi 19:00-23:59
- Samedi 00:00-23:59
- Dimanche 00:00-23:59
- Lundi 00:00-07:00

## Tolerances Et EMT
A chaque bascule, recalculer:
- `Tolerance_Surveillance_Sup`
- `Tolerance_Surveillance_Inf`

En reutilisant strictement la logique EMT deja implementee (modes + flags + correction EJ + derive).

## Integration Web
Dans la modal lieu:
- Ajouter un editeur de planning clair (hebdo + plages)
- Validation anti-chevauchement (ou gestion par priorite explicite)
- Apercu "consigne active attendue" selon date/heure de simulation

## Integration Serveur C#
- Pas de logique planning complexe cote C#.
- Le C# lit les consignes actives depuis `t_lieu`.
- En cas de panne C#, la base continue de faire les bascules.

## Plan De Mise En Oeuvre Recommande
1. Migration SQL schema (colonnes + nouvelles tables + index)
2. Event SQL version 1 (sans exceptions)
3. API web create/update/list pour regles
4. UI de parametrage planning dans la modal lieu
5. Recalcul tolerances dans le flux event
6. Audit trail complet
7. Tests de recette (changement d'heure, week-end, chevauchement, reprise serveur)

## Points De Vigilance
- Fuseau horaire DB (TIMESTAMP/DATE/TIME coherents)
- Gestion DST (changement heure ete/hiver)
- Eviter boucles de MAJ inutiles
- Priorites en cas de regles concurrentes
- Verrouillage transactionnel si plusieurs jobs/eventuels workers

## Decision Cle
L'utilisation d'un EVENT SQL pour appliquer les consignes planifiees est validee comme approche principale pour la robustesse operationnelle.
