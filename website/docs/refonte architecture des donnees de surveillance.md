# Architecture des données de surveillance (VigiSensys)

## Objectif

Ce document décrit l’architecture actuelle de gestion des mesures et de la surveillance dans VigiSensys, ainsi que les améliorations possibles pour optimiser :

- les performances du dashboard de surveillance
- la gestion de l’historique des mesures
- la scalabilité pour des installations importantes (centres hospitaliers)
- la maintenabilité du système

Le système doit pouvoir fonctionner chez des clients très différents :

- petites installations : ~5 sondes
- installations moyennes : 50–200 sondes
- installations importantes : 800–850 sondes

La fréquence typique des mesures est :

- 15 minutes
- 30 minutes

---

# Architecture actuelle

## Composants principaux

Le système repose sur trois éléments principaux.

### Serveur C#

Responsabilités :

- interrogation des sondes
- récupération des mesures
- calculs métiers (ex : erreur de justesse)
- détection des états d’alarme
- insertion des données dans la base

Le serveur C# agit comme **pipeline d’ingestion des données**.

---

### Application web Next.js

Technologie :

- Next.js
- TypeScript
- Prisma

Responsabilités :

- affichage des dashboards
- API REST
- affichage des graphiques
- gestion des utilisateurs
- messagerie interne

---

### Base de données MySQL

L’application utilise plusieurs bases :

#### 1. `main`

Contient les données métier :

- sondes
- lieux
- groupes
- utilisateurs
- paramètres
- configuration

---

#### 2. `mesures`

Contient les données techniques :

- mesures
- historique
- graphiques
- journal
- calibrage

Tables principales :

| Table | Description |
|-----|-----|
| `tm_graphique` | points récents utilisés pour les graphiques live |
| `tm_mesures` | mesures historiques |
| `tm_mesures_histo` | archive des mesures |
| `tm_journal` | journal d'événements |
| `tm_journal_histo` | archive du journal |

---

#### 3. `chat`

Base dédiée à la messagerie interne afin de ne pas polluer les autres bases.

---

# Fonctionnement actuel des graphiques

## Page de surveillance

La page affiche des **cards de lieux** contenant :

- nom du lieu
- état (OK / alarme / pré-alarme / non réponse)
- mini graphique
- dernière mesure
- tension batterie
- fréquence
- heure de la dernière mesure

Les mini graphiques utilisent la table : ``tm_graphique``
qui contient les **points récents uniquement**.

---

## Ouverture d'un graphique

Lorsqu'un utilisateur clique sur une card :

1. ouverture du graphique
2. chargement de 125 points récents

API : ``/api/mesures/:idLieu?rowNumber=125``

---

## Affichage d'une plage temporelle

Lorsque l'utilisateur sélectionne une plage de date :

API : ``/api/mesures/:idLieu?startDate&endDate``

Source : ``tm_mesures``

---

# Analyse de l'architecture actuelle

L’architecture actuelle suit déjà un principe important :

**séparer les usages des données.**

On distingue implicitement trois catégories.

---

## 1. Données temps réel (Hot Path)

Utilisées pour :

- dashboard de surveillance
- mini graphiques
- état des sondes

Tables concernées : ``tm_graphique``

---

## 2. Historique des mesures

Utilisé pour :

- graphiques historiques
- export
- analyse

Tables : ``tm_mesures``, ``tm_mesures_histo``

---

## 3. Journal / audit

Utilisé pour :

- traçabilité
- logs utilisateur
- événements système

Tables : ``tm_journal``, ``tm_journal_histo``

---

# Limites potentielles

Même si l’architecture est globalement saine, certains points peuvent devenir limitants avec le temps.

---

## 1. Reconstruction de l'état live

La page de surveillance peut nécessiter :

- plusieurs requêtes
- jointures
- agrégations

pour reconstruire l’état actuel d’un lieu.

Or cet état pourrait être **directement stocké**.

---

## 2. Compteurs d'alarmes recalculés

Les requêtes du type :
- ``COUNT alarmes``
- ``COUNT pré-alarmes``
- ``COUNT OK``

peuvent devenir coûteuses si elles sont recalculées fréquemment.

---

## 3. Historique volumineux

Avec :

- 800 sondes
- 1 mesure / 15 min

on obtient environ :
- ``96 mesures / jour / sonde``
- ``≈ 76 800 mesures / jour``
- ``≈ 28 millions / an``

Ce volume reste gérable mais nécessite :

- index adaptés
- stratégie d'agrégation

---

## 4. Clés primaires composites

Certaines tables utilisent des PK très larges : ``@@id([Id_Serveur_BDD, Id_Mesure, Date_Heure_Mesure, Id_Lieu, Est_Valeur_Null])``

Ce type de clé peut :

- alourdir les indexes
- ralentir les inserts
- augmenter la taille des indexes secondaires

---

# Architecture cible recommandée

L'objectif n'est **pas de remplacer toute l'architecture**, mais de clarifier les rôles.

---

# Modèle recommandé

Trois couches distinctes :

LIVE DATA
↓
HISTORICAL DATA
↓
AUDIT DATA

---

# 1. Couche Live (état courant)

Objectif :

- accès ultra rapide
- lecture fréquente
- données déjà préparées

Table recommandée : ``tm_live_lieu``

Exemple :

| colonne | description |
|---|---|
| id_lieu | identifiant du lieu |
| last_value | dernière mesure |
| last_measure_time | timestamp |
| statut | OK / alarme / pré-alarme |
| tension | batterie |
| rssi | signal |
| frequence | fréquence |
| consignes | seuils |
| updated_at | dernière mise à jour |

Cette table est **mise à jour par le serveur C# lors de l’insertion des mesures**.

---

# 2. Buffer de points récents

Pour les mini graphiques.

Table : ``tm_live_points`` (ou autre nom)

Contient :

- les N derniers points (125 ici)

par sonde ou lieu.

---

# 3. Historique brut

Les données complètes restent dans : ``tm_mesures``

Utilisé pour :

- graphiques détaillés
- export
- audit scientifique

---

# 4. Agrégats (rollups)

Pour améliorer les performances des plages longues.

Tables recommandées :

### rollup 1 heure
``tm_mesures_rollup_1h``

colonnes :

- id_sonde
- bucket_start
- min
- max
- avg
- first
- last
- count

---

### rollup 1 jour
``tm_mesures_rollup_1d``

---

Utilisation :

| plage demandée | source |
|---|---|
| < 24h | données brutes |
| 1–30 jours | rollup 1h |
| > 30 jours | rollup 1d |

---

# Gestion des compteurs

Créer une table :
``tm_live_stats``

Exemple :

| colonne |
|---|
| nb_lieux_ok |
| nb_lieux_alarme |
| nb_prealarmes |
| nb_non_reponse |
| nb_desactives |

Ces valeurs sont mises à jour **lors du changement d’état d’une sonde**.

---

# Rôle du serveur C#

Le serveur C# devient responsable de :

1. insertion des mesures
2. mise à jour du snapshot live
3. mise à jour des buffers récents
4. mise à jour des compteurs
5. génération des rollups

---

# Flux de données recommandé
Sondes
↓
Serveur C#
↓
Insertion mesures
↓
Historique (tm_mesures)

-  Mise à jour
   ↓
   Snapshot live
   ↓
   Buffer points récents
   ↓
   Compteurs live

---

# Évolution possible (future)

Si le volume augmente fortement :

## Ajout d'un cache Redis

Utilisé pour :

- état live
- compteurs
- derniers points

---

## Base Time Series

Exemples possibles :

- TimescaleDB
- ClickHouse
- InfluxDB

Mais uniquement si MySQL devient limitant.

---

# Recommandations principales

1. formaliser une **couche live dédiée**
2. séparer clairement **live / historique / audit**
3. introduire des **rollups**
4. optimiser les **indexes**
5. surveiller les **requêtes lentes**

---

# Conclusion

L'architecture actuelle est globalement saine.

Les améliorations proposées visent principalement à :

- réduire les requêtes complexes pour le dashboard
- améliorer la scalabilité
- préparer la croissance du volume de mesures

Le changement de technologie n'est pas nécessaire à court terme.

Une évolution progressive de l'architecture MySQL actuelle permet de couvrir les besoins futurs.

# Extension de l'architecture : Messagerie temps réel

## Contexte

L'application comporte également une base dédiée :


chat


Cette base est utilisée pour :

- la messagerie interne
- les conversations entre utilisateurs
- les notifications internes
- éventuellement des systèmes de commentaires ou d’échanges liés aux événements

La messagerie est volontairement isolée des autres bases afin de :

- ne pas polluer la base métier (`main`)
- ne pas impacter la base de mesures (`mesures`)
- isoler les performances du système de communication interne

---

# Caractéristiques fonctionnelles d'une messagerie

Une messagerie possède des propriétés très différentes d'un système de mesures.

### Nature des données

Les données sont :

- événementielles
- append-only (ajout de messages)
- consultées immédiatement après écriture
- souvent utilisées en temps réel

---

### Types d’opérations

Les opérations principales sont :

| opération | description |
|---|---|
| envoyer message | insertion |
| recevoir message | diffusion temps réel |
| lire conversation | lecture chronologique |
| compter messages non lus | agrégation |
| afficher présence utilisateur | état temps réel |

---

### Fréquence des événements

Contrairement aux mesures de sondes :

- fréquence imprévisible
- bursts d’activité possibles
- interactions temps réel

---

# Limites d'une implémentation classique

Une implémentation standard repose souvent sur :


Next.js API
↓
MySQL
↓
Polling ou WebSocket


Problèmes possibles :

- nécessité de gérer un serveur WebSocket
- gestion des rooms
- synchronisation des messages
- invalidation de cache
- logique temps réel côté backend

---

# Alternative : Backend temps réel spécialisé

Une alternative consiste à utiliser un backend temps réel dédié.

Exemple :

- SpacetimeDB
- Supabase Realtime
- Firebase Realtime
- Redis Streams + WebSocket

Parmi ces solutions, **SpacetimeDB** se distingue par une approche particulière :

- base de données
- logique métier
- synchronisation client

dans un seul moteur.

---

# Cas d'utilisation potentiel : SpacetimeDB pour la messagerie

L'utilisation d'un moteur temps réel comme SpacetimeDB peut être pertinente pour la messagerie interne.

## Avantages

### Synchronisation automatique

Les clients peuvent s'abonner à des tables :


messages


et recevoir automatiquement les nouveaux messages.

---

### Réduction de la logique serveur

Pas besoin de gérer :

- WebSocket custom
- logique de broadcast
- invalidation de cache

---

### Latence très faible

Les messages sont propagés directement aux clients abonnés.

---

### Modèle orienté événements

Le modèle correspond naturellement à la messagerie :


user → send message → reducer → table messages → clients abonnés


---

# Architecture possible avec SpacetimeDB

Architecture hybride :

             +----------------+
             |   Next.js UI   |
             +-------+--------+
                     |
     +---------------+---------------+
     |                               |
     |                               |

MySQL (métier + mesures) SpacetimeDB (chat)
| |
| |
données persistantes synchronisation temps réel


---

# Flux de messages


Utilisateur A
↓
Reducer send_message
↓
Table messages
↓
Clients abonnés
↓
Utilisateur B reçoit le message


---

# Modèle de données possible

Exemple simplifié :


``users``
``rooms``
``messages``
``room_members``


---

### Table messages

| colonne | description |
|---|---|
| id | identifiant |
| room_id | salon |
| sender_id | utilisateur |
| content | message |
| created_at | timestamp |

---

### Table rooms

| colonne | description |
|---|---|
| id | identifiant |
| name | nom du salon |
| created_at | date |

---

### Table room_members

| colonne | description |
|---|---|
| room_id | salon |
| user_id | utilisateur |

---

# Comparaison : MySQL + WebSocket vs SpacetimeDB

| Critère | MySQL + WebSocket | SpacetimeDB |
|---|---|---|
| implémentation | custom | native |
| synchro temps réel | à implémenter | intégrée |
| complexité backend | moyenne | faible |
| déploiement | simple | nécessite runtime |
| historique | excellent | correct |
| latence | faible | très faible |

---

# Contraintes dans un environnement on-premise

Le logiciel étant déployé chez les clients, certains éléments doivent être pris en compte :

- simplicité d'installation
- nombre de services à maintenir
- facilité de mise à jour
- monitoring

Introduire un moteur supplémentaire implique :

- installation
- maintenance
- supervision

---

# Recommandation pour VigiSensys

Dans le contexte actuel :

### Monitoring des sondes

Il est recommandé de conserver :


``MySQL``


car :

- forte persistance
- historique volumineux
- requêtes analytiques
- simplicité d'exploitation

---

### Messagerie interne

Deux approches sont possibles.

---

## Option 1 — Architecture actuelle


Next.js
↓
API routes
↓
MySQL chat
↓
WebSocket


Avantages :

- simplicité
- stack homogène
- pas de service supplémentaire

---

## Option 2 — Backend temps réel dédié


Next.js
↓
SpacetimeDB
↓
synchronisation automatique


Avantages :

- messagerie temps réel native
- code simplifié
- latence minimale

Inconvénients :

- composant supplémentaire
- complexité opérationnelle

---

# Recommandation d'adoption progressive

Si l'expérimentation d'un backend temps réel est envisagée, la messagerie est le module idéal pour tester cette approche.

Raisons :

- périmètre limité
- impact isolé
- faible dépendance métier
- architecture indépendante des mesures

---

# Stratégie proposée

1. conserver MySQL pour le cœur du système
2. maintenir l’architecture actuelle
3. expérimenter un backend temps réel uniquement pour la messagerie
4. évaluer :
   - complexité d'exploitation
   - performances
   - bénéfices réels

---

# Conclusion

Le système actuel est déjà structuré de manière saine :

- séparation métier
- séparation mesures
- séparation messagerie

Les améliorations recommandées concernent principalement :

- la gestion du live monitoring
- les agrégations historiques
- l'optimisation des requêtes

L'utilisation d'un backend temps réel comme SpacetimeDB pourrait être pertinente pour la messagerie, mais ne constitue pas