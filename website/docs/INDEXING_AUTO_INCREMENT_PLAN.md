# Plan d'optimisation (PK composite + ID auto-increment)

## Contexte
Les tables historiques viennent de WinDev avec des cles primaires composites.
On conserve cette logique pour la compatibilite, mais on ajoute un ID technique
auto-increment et des index adaptes aux requetes actuelles.

## Objectifs
- Garder la PK composite (compatibilite legacy).
- Ajouter un ID auto-increment pour les usages techniques.
- Ajouter des index alignes sur les requetes reelles.

## Tables concernees

### tm_mesures
Requetes frequentes :
- `WHERE Id_Lieu = ? ORDER BY Date_Heure_Mesure DESC`

Modifs proposees :
- Ajouter `Id_Mesure_AI BIGINT AUTO_INCREMENT UNIQUE`
- Ajouter index `(Id_Lieu, Date_Heure_Mesure)`

### tm_graphique
Requetes frequentes :
- `WHERE Id_Sonde = ? ORDER BY Date_Heure_Mesure DESC`
- `WHERE Id_Lieu = ? ORDER BY Date_Heure_Mesure DESC`

Modifs proposees :
- Ajouter `Id_Graphique_AI BIGINT AUTO_INCREMENT UNIQUE`
- Ajouter index `(Id_Sonde, Date_Heure_Mesure)`
- Ajouter index `(Id_Lieu, Date_Heure_Mesure)`

### tm_journal
Requetes frequentes :
- `ORDER BY Date_Heure_Journal DESC`
- filtre possible `Code_Journal`

Modifs proposees :
- Ajouter `Id_Journal_AI BIGINT AUTO_INCREMENT UNIQUE`
- Ajouter index `(Date_Heure_Journal)`
- Ajouter index `(Code_Journal, Date_Heure_Journal)`

### tm_journal_histo
Modifs proposees :
- Ajouter `Id_Journal_Histo_AI BIGINT AUTO_INCREMENT UNIQUE`

### tm_mesures_histo
Modifs proposees :
- Ajouter `Id_Mesure_AI BIGINT AUTO_INCREMENT UNIQUE`

## Notes
- Ne pas modifier l'ordre de la PK composite.
- Les nouveaux IDs servent d'identifiant technique, pas metier.
- Ajuster Prisma pour exposer ces champs si besoin.
