# Outils — tests réels de sondes (11/09/2026)

- Branche : `feature/tools-real-sensor-tests`
- PR : #115 — `feat(tools): remplacer les tests factices par des tests de sondes réels`
- Base : `dev` au commit `58dcbd77cad2fab8e6a12fc17af2bf454d50d547` (merge #110)
- Statut : PR ouverte — validation terrain à réaliser
- Validation automatique : run GitHub Actions `34611659796` — Prisma, test ciblé, i18n sans nouvelle dette Outils, ESLint, TypeScript et build production verts

## Contexte

L'onglet **Outils > Test de sonde** utilisait jusqu'ici une liste `MOCK_SENSORS` et simulait l'exécution avec un simple délai côté navigateur. Aucun matériel ni aucune mesure réelle n'était consulté.

Le besoin terrain est de disposer d'un test fiable et non perturbateur, utilisable avec les différentes familles de sondes déjà gérées par VigiSensys.

## Choix d'architecture

Le test est désormais un **test d'observation des interrogations réelles** : pendant la durée choisie (1 à 5 minutes), l'interface lit les lignes effectivement produites par le service Windows dans `tm_mesures`.

Ce choix évite :

- de lancer un second moteur d'interrogation en parallèle du service Windows ;
- de provoquer des collisions sur les ports COM ou avec les GSP/GSO ;
- de dupliquer les protocoles matériels dans le Web ;
- de modifier la surveillance, les alarmes ou la configuration des sondes uniquement pour un diagnostic.

Le test fonctionne donc sur le chemin de production réel :

```text
Sonde / module
    ↓
VigiSensys Serveur (interrogation normale)
    ↓
tm_mesures
    ↓
API Outils
    ↓
Interface Test de sonde
```

## Données affichées

Pour chaque sonde sélectionnée :

- dernière valeur réellement reçue ;
- nombre d'interrogations reçues / nombre total d'interrogations enregistrées ;
- taux de réponse calculé avec `Est_Valeur_Null` ;
- état du test : non testé, en attente, répond, réponse partielle, aucune réponse ou non interrogée ;
- RSSI récupéré sur la dernière réponse lorsqu'il est disponible.

La synthèse affiche également :

- progression / temps restant ;
- taux de réponse global ;
- nombre de réponses sur le total d'interrogations ;
- nombre de sondes ayant effectivement répondu.

## Distinction importante : aucune réponse vs aucune interrogation

Une sonde dont aucune ligne n'a été enregistrée pendant la fenêtre n'est **pas** déclarée en panne. Elle est affichée `Non interrogée`.

Cela peut notamment arriver lorsque la fréquence normale de récupération est supérieure à la durée du test. L'interface demande donc de choisir une durée couvrant la fréquence des sondes testées.

En revanche, lorsqu'une interrogation est enregistrée avec `Est_Valeur_Null = 1`, elle compte bien comme une tentative sans réponse.

## API

Nouvelle route :

```text
GET  /api/outils/sensor-tests
POST /api/outils/sensor-tests
```

- `GET` : catalogue des sondes actives/non réformées avec lieu, module, famille et fréquences ;
- `POST` : agrégation des mesures réelles depuis le début du test pour les IDs sélectionnés.

L'accès serveur reprend la règle de la page Outils : au moins l'un des droits Paramètres, Configuration matériel ou Opérations métrologie.

La fenêtre POST est bornée aux 10 dernières minutes et les identités de sondes utilisent les variantes déjà centralisées dans `sensor-naming.ts`, notamment pour les GSO historiques.

## Interface

Ordre des onglets :

1. Test de sonde ;
2. Lecture étalon ;
3. Commentaires.

La table permet toujours la sélection multiple et la recherche, mais n'utilise plus aucune donnée fictive.

## Validation attendue

- [ ] sélectionner une sonde classique actuellement interrogée et obtenir au moins une réponse ;
- [ ] sélectionner une GSP et vérifier la valeur / le taux ;
- [ ] sélectionner une GSO et vérifier la correspondance série/adresse ;
- [ ] vérifier qu'une vraie non-réponse incrémente le total sans incrémenter les réponses ;
- [ ] vérifier qu'une sonde non interrogée pendant la fenêtre est indiquée `Non interrogée` ;
- [ ] vérifier un test multi-sondes ;
- [ ] vérifier FR / EN ;
- [ ] vérifier qu'aucune surveillance ni configuration de sonde n'est modifiée par le test.

## Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/outils/test-connection-tab.tsx`
- `website/src/app/[locale]/(admin)/admin/outils/_components/build-sensor-columns.tsx`
- `website/src/app/[locale]/(admin)/admin/outils/_components/sensors-table-card.tsx`
- `website/src/app/[locale]/(admin)/admin/outils/_components/test-connection-stats.tsx`
- `website/src/app/api/outils/sensor-tests/route.ts`
- `website/src/lib/tools-sensor-test.ts`
- `website/src/messages/tools-supplements.ts`
