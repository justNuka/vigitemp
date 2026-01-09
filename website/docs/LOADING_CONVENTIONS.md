# Conventions de chargement (UI/UX)

## Idée générale
- Loader = "ai-je accès / l’app est-elle prête ?"
- Skeleton = "je charge des données pour un layout connu"

Objectif : éviter les flashes, réduire la charge cognitive, comportement stable.

## 1) Auth / permissions / licence (gating)
Loader plein écran uniquement pour :
- auth
- permissions / rôles
- licence

Règles :
- pas de skeleton avant décision
- pas de contenu sensible avant décision
- loader simple

## 2) Chargement initial
Skeletons pour :
- tables
- listes
- cards / KPI

## 3) Tables
- premier chargement : skeleton
- refetch : garder les données, indicateur discret
- ne jamais remettre un skeleton complet sur refetch

## 4) Cards / KPI
- skeleton simple
- sur refresh : garder la valeur + indicateur

## 5) Listes
- premier chargement : skeleton
- infinite scroll : skeleton seulement en bas

## 6) CRUD
- spinner local dans le bouton
- bouton désactivé
- si > 1s : texte clair (Saving..., Deleting...)

## 7) Export / impression
- export : feedback obligatoire
- impression : table uniquement

## 8) Refresh manuel
- garder les données visibles
- indicateur discret uniquement

## 9) Changement de contexte
Loader global acceptable pour :
- changement client/projet
- reset permissions/licence

## Anti-patterns
- skeleton à chaque refetch
- loader global pour action locale
- flash avant redirect

## Conventions déjà appliquées
- pas de polling/SSE sur routes publiques
- stop refetch sur 401
- skeletons tables
- exports + impression table only
- sidebar mobile se ferme après navigation

## Prochaines étapes
- AuthGate commun dashboard/admin
- centraliser les erreurs réseau
- indicateur discret pour auto refetch
