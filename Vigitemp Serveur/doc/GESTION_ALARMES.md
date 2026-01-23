# Gestion des alarmes (serveur C#)

## Objectif
Traiter un grand volume de mesures, detecter les depassements de seuils avec retard, et enregistrer efficacement en base.

## Principes
- Toute la logique d'alarme se fait cote serveur C#.
- La base stocke les mesures et l'etat minimal, mais ne calcule pas en temps reel.

## Cache des consignes
Les consignes sont portees par les lieux. Le serveur met en cache :
- consigne
- consigne sup / consigne inf
- pre-alarme
- retard d'alarme

Le cache est rafraichi periodiquement pour limiter les lectures DB.

## Logique d'alarme
Pour chaque mesure :
1. verifier si la valeur depasse les seuils
2. demarrer / continuer le timer de depassement
3. declencher l'alarme si le retard est depasse
4. clore l'alarme si retour a la normale

## Ecritures en base
- insert bulk des mesures
- insert des transitions d'alarme
- transfert vers l'historique a l'acquittement

## Benefices
- rapide (calcul en RAM)
- stable (peu d'I/O)
- scalable (gros volumes de sondes)
