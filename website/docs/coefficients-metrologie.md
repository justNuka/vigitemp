# Coefficients de m?trologie

## 1) D?finitions

### Offset
L'offset permet de d?caler la lecture de la sonde.
Il se param?tre dans la fiche sonde.

Formule:

`temperature = temperature_ajustee + offset`

### Coefficients `a` et `b` (ajustage)
Les coefficients `a` et `b` sont issus de l'ajustage.
Ils s'appliquent ? la lecture brute de la sonde.

Formule:

`temperature_ajustee = a * temperature_lue + b`

### Erreur de justesse et incertitude sonde (?talonnage)
Ces valeurs proviennent de l'?talonnage.

- Correction de justesse:

`temperature_corrigee = temperature + correction`

o? `correction = -erreur_de_justesse`.

- Inertitude sonde:
Elle s'utilise pour ajuster les tol?rances activ?es d'un lieu,
selon les r?gles EMT (?cart Maximum Tol?r?).

### D?rive
La d?rive est calcul?e entre deux ?talonnages successifs.

Formule:

`derive = erreur_justesse_N - erreur_justesse_N-1`

Elle est utilis?e dans le calcul des tol?rances de surveillance
selon le param?trage EMT du lieu.

---

## 2) R?gles de validit?

- L'ajustage corrige la mesure.
- L'?talonnage constate la qualit? m?trologique (valeur l?gale/audit).
- Seul l'?talonnage est sous certification (Cofrac).

Cons?quences m?tier:

1. Tout nouvel ajustage invalide les ?talonnages pr?c?dents.
2. Toute modification d'offset invalide les ?talonnages pr?c?dents.
3. Un ?talonnage a une date de validit?.
4. Un ?talonnage expir? doit g?n?rer un warning.
5. Si un r?sultat ?talonnage est utilis? dans un lieu,
   il reste inchang? tant qu'aucun nouvel ?talonnage ne le remplace.

---

## 3) R?gles d'usage (ordre d'application)

Lors de la lecture d'une sonde:

1. Lecture brute sonde
2. Ajustage: `temperature_ajustee = a * temperature_lue + b`
3. Offset: `temperature = temperature_ajustee + offset`
4. Correction de justesse: `temperature_corrigee = temperature + correction`

### 3.1 Cas ajustage

Objectif: red?finir `a` et `b`.

- Temp?rature prise en compte pour l'ajustage: la lecture brute sonde.
- Un ajustage invalide les ?talonnages de la sonde.
- Une modification d'offset invalide aussi les ?talonnages de la sonde.

### 3.2 Cas ?talonnage

Objectif: qualifier le r?sultat de la sonde.

Temp?rature prise en compte pour l'?talonnage:

1. Lecture brute sonde
2. Ajustage
3. Offset

=> c'est cette temp?rature corrig?e par ajustage + offset
qui sert aux calculs d'?talonnage (erreur de justesse, incertitude).

Note:
- L'ajustage est valable sur toute la plage de mesure.
- L'?talonnage n'est valable qu'? proximit? de la temp?rature d'?talonnage.
