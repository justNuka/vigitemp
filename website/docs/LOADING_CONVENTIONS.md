# Conventions de chargement

## Objectif
Eviter les flashs UI et les loaders bloquants inutiles.

## Regles
- Loader plein ecran uniquement au premier chargement (auth/licence).
- Skeletons pour les donnees locales (tables, cards, listes).
- Pas de revalidation globale a chaque navigation.

## Refresh intelligent
- Sur focus.
- Toutes les X minutes.
- Sur changement de contexte (site, groupe, projet).

## UX
- La navigation doit rester fluide.
- Les pages ne doivent pas se vider.
