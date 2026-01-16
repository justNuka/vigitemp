# Modifs BDD (serveur C#)

## Bases cibles
- `vigi_main`
- `vigi_mesures`

## Alarmes
- `t_alarme_histo` doit avoir les memes colonnes que `t_alarme`.

## Mesures
- Ajouter `Est_Valeur_Memoire` dans `tm_mesures` (tinyint not null default 0).

## Donnees seed
- permissions, parametres, types
- user admin par defaut (`admin`) avec mdp hashe + changement force
