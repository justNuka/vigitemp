# Licence - source de verite (serveur C#)

## Principe
- La licence est verifiee par le serveur C#.
- Le portail web consomme l'etat licence via les API du serveur.

## Stockage
- Fichier `.vtlic` + cle publique `.pem`.
- Copie locale dans `C:\ProgramData\Vigitemp\licenses`.

## Verification
- Signature validee cote serveur.
- Date d'expiration verifiee.
- Options exposees via API pour le portail web.

## Consequence UX
- Affichage du type de licence et des limites.
- Acces bloque si licence invalide.
