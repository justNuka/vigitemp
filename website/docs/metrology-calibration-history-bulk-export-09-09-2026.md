# Export groupé des étalonnages historiques — 09/09/2026

## Contexte

Le lot `feature/metrology-operation-completion` / PR #97 avait ajouté :

- le PDF unitaire d'un étalonnage historique depuis `Administration > Sondes` ;
- l'API `POST /api/metrologie/etalonnage/report/bulk` ;
- l'export ZIP des PDF à la fin d'une opération d'étalonnage.

Il restait une asymétrie avec l'historique des ajustages : depuis la page d'une sonde, plusieurs anciens ajustages pouvaient déjà être sélectionnés et exportés ensemble, alors que les anciens étalonnages ne proposaient que le PDF unitaire ligne par ligne.

## Lot du 09/09/2026

- Branche : `feature/calibration-history-bulk-export`
- Base : `dev` au commit `9b12a96a592d912a162c2dfd9e6b36d47da94f58`
- PR : à renseigner à l'ouverture

## Modification

Dans le panneau d'historique des étalonnages de `Administration > Sondes` :

- ajout d'une checkbox sur chaque ligne ;
- ajout d'une checkbox d'en-tête pour sélectionner/désélectionner tous les étalonnages affichés ;
- affichage du nombre d'éléments sélectionnés ;
- ajout d'un bouton `Export PDF` ;
- appel de l'API existante `POST /api/metrologie/etalonnage/report/bulk` avec les identifiants sélectionnés ;
- téléchargement de l'archive ZIP renvoyée par l'API ;
- conservation du bouton PDF unitaire et de l'édition de la durée de validité ;
- les clics sur les checkboxes et actions n'activent pas la sélection de ligne de l'historique.

Aucune nouvelle route API, aucun changement BDD et aucune modification du générateur PDF ne sont nécessaires.

Le comportement reprend volontairement le modèle déjà utilisé par `adjustments-panel.tsx` afin de conserver une UX cohérente entre ajustages et étalonnages.

## Fichiers concernés

- `website/src/app/[locale]/(admin)/admin/sondes/_components/calibrations-panel.tsx`
- `website/docs/metrology-calibration-history-bulk-export-09-09-2026.md`

API réutilisée sans modification :

- `website/src/app/api/metrologie/etalonnage/report/bulk/route.ts`

## Checklist de validation terrain

- [ ] ouvrir une sonde possédant plusieurs anciens étalonnages ;
- [ ] sélectionner un seul étalonnage puis télécharger le ZIP ;
- [ ] vérifier qu'il contient exactement un PDF et que ce PDF correspond au rapport individuel ;
- [ ] sélectionner plusieurs étalonnages puis vérifier un PDF par élément dans le ZIP ;
- [ ] tester la checkbox d'en-tête sélectionner tout / désélectionner tout ;
- [ ] vérifier que le compteur de sélection correspond au nombre de lignes cochées ;
- [ ] vérifier que le bouton d'export est désactivé sans sélection et pendant le téléchargement ;
- [ ] vérifier que cliquer sur une checkbox n'ouvre pas le détail de la ligne ;
- [ ] vérifier que le PDF unitaire reste fonctionnel ;
- [ ] vérifier que l'édition de la durée de validité reste fonctionnelle ;
- [ ] vérifier FR et EN ;
- [ ] vérifier le nom de l'archive et des PDF sous Windows.

## Validation technique

La route bulk existante :

- déduplique les IDs ;
- refuse une sélection vide ;
- limite une archive à 200 étalonnages ;
- charge les rapports en groupe ;
- contrôle les droits/licence métrologie ;
- renvoie une archive ZIP `no-store`.

Le présent lot ne modifie pas ce contrat.
