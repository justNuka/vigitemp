# Refactor métrologie — ajustage, étalonnage et service serveur commun

> Document de cadrage du chantier métrologie issu de l'audit du 28/08/2026.
>
> La direction décrite ici doit être réévaluée contre le code courant avant chaque lot. Les noms de classes/services proposés sont des responsabilités cibles, pas une obligation de créer exactement ces fichiers.

## 1. Pourquoi ce chantier est séparé

L'ajustage et l'étalonnage sont deux workflows métier différents mais partagent une grande partie de leur infrastructure :

- sélection/verrouillage de sondes ;
- lecture physique ;
- coordination avec le service Windows ;
- gestion GSP/GSO ;
- timeouts ;
- sessions longues ;
- restauration d'état/configuration ;
- watchdog/cleanup ;
- persistance de mesures intermédiaires.

À la baseline auditée, la mutualisation a déjà commencé côté Web. En revanche, la frontière côté serveur est incorrecte : une lecture GSP de métrologie passe par l'endpoint `/api/hotline/sensor-test` de `HotlineApiServer`.

Une opération métier normale de métrologie ne doit pas dépendre conceptuellement de la Hotline, qui est un outil de diagnostic/support.

Le chantier doit donc corriger **la frontière**, sans réécrire les deux workflows d'un coup.

## 2. Inventaire actuel à relire avant toute modification

### Web — runtime et lecture

Fichiers principaux :

- `website/src/lib/metrology-adjustment-session.ts`
  - runtime principal d'une session d'ajustage ;
  - acquisition/plateaux ;
  - gestion de session, timers et états ;
  - accès données et opérations GSP selon les chemins concernés.

- `website/src/lib/metrology-calibration-session.ts`
  - runtime principal d'une session d'étalonnage ;
  - acquisition de mesures ;
  - session, états, persistance et orchestration.

- `website/src/lib/metrology-reading-preview.ts`
  - helper déjà commun aux contextes `AJUSTAGE` et `ETALONNAGE` ;
  - lecture GSP via le service C# ;
  - lecture GSO via les tables de mesures métrologie ;
  - récupération des sondes/modules ;
  - lectures volontairement séquentielles pour laisser le serveur C# coordonner les ports partagés.

- `website/src/lib/metrology-reading-preview-session.ts`
  - gestion de session/état pour la lecture de preview.

- `website/src/lib/metrology-session-watchdog.ts`
  - helper de watchdog déjà extrait.

### Web — helpers déjà extraits à conserver/consolider

- `website/src/lib/metrology-calibration-calculations.ts` ;
- `website/src/lib/metrology-calibration-sensor-state.ts` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-gsp-configuration-restore.ts` ;
- `website/src/lib/metrology-db.ts` ;
- `website/src/lib/metrology-adjustment-coefficient-dirty.ts` ;
- helpers import/export/report spécifiques existants.

**Règle :** ne pas créer un nouveau helper sous un autre nom tant qu'il n'a pas été vérifié qu'un de ces fichiers ne couvre pas déjà la responsabilité.

### Serveur C#

À inspecter ensemble :

- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs` ;
- providers DB / `MetrologyDatabaseProvider.cs` ;
- classes/protocoles GSP/GSO et helpers de coordination présents au moment du chantier.

Le but est d'identifier précisément quelles opérations matérielles appartiennent à la métrologie et quelles primitives existent déjà dans le serveur avant de créer une nouvelle classe.

## 3. Flux actuel problématique

### GSP

À la baseline :

```text
Ajustage / Étalonnage Web
        ↓
metrology-reading-preview.ts
        ↓
POST /api/hotline/sensor-test
        ↓
HotlineApiServer
        ↓
opération matérielle GSP
```

Le helper Web envoie notamment :

- type de sonde GSP ;
- numéro de série ;
- `action: read` ;
- `operationContext` ;
- port/adresse/module si disponibles ;
- timeouts ;
- paramètres GSP de fenêtre d'écoute.

Le problème n'est donc pas l'absence totale de code partagé côté Web. Le problème est que le **service normal de métrologie emprunte une API de diagnostic Hotline et dépend de sa sémantique**.

### GSO

Pour les GSO, `metrology-reading-preview.ts` lit actuellement la dernière nouvelle mesure dans :

- `tm_mesures_etalonnage` pour l'étalonnage ;
- `tm_mesures_ajustage` pour l'ajustage.

Il tient compte du provider MySQL/MSSQL et sérialise `Date_Heure_Mesure` via `serializeStoredDbDateTime`.

Le refactor ne doit donc pas supposer que GSP et GSO ont exactement le même chemin technique. Il faut partager le **contrat métier de lecture**, pas forcer une implémentation identique.

## 4. Architecture cible

### 4.1 Vue générale

```text
                     ┌────────────────────────────┐
                     │ Ajustage Web               │
                     └──────────────┬─────────────┘
                                    │
                     ┌──────────────▼─────────────┐
                     │ Gateway métrologie Web    │
                     │ commun                    │
                     └──────────────┬─────────────┘
                                    │ API métrologie
                     ┌──────────────▼─────────────┐
                     │ Adaptateur/API serveur     │
                     │ métrologie                │
                     └──────────────┬─────────────┘
                                    │
                     ┌──────────────▼─────────────┐
                     │ Service métier/matériel    │
                     │ métrologie commun          │
                     └──────────────┬─────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        coordination ports      protocole GSP       lecture/état
                ▲                                       matériel
                │
        ┌───────┴────────┐
        │ HotlineApiServer│
        └────────────────┘
          diagnostic uniquement
```

L'étalonnage utilise le même gateway/service commun :

```text
Ajustage ───────┐
                ├──> couche commune métrologie ───> matériel/DB
Étalonnage ─────┘
```

### 4.2 Rôle futur de `HotlineApiServer`

`HotlineApiServer` doit uniquement porter les responsabilités spécifiques au transport/diagnostic Hotline :

- listener HTTP ;
- authentification/autorisation Hotline ;
- validation des requêtes ;
- limites de taille/fréquence/concurrence ;
- mapping DTO ;
- opérations explicitement de diagnostic ;
- audit/log du diagnostic.

Lorsqu'une commande Hotline a besoin de lire une sonde, elle peut appeler **le même service matériel commun** que la métrologie.

En revanche :

- ajustage et étalonnage ne doivent plus appeler une URL `/api/hotline/...` ;
- le service matériel ne doit pas dépendre de classes/DTO/authentification Hotline ;
- une évolution de l'interface Hotline ne doit pas casser la métrologie.

## 5. Responsabilités cibles côté serveur

Le niveau minimal recommandé est une abstraction de type :

```text
MetrologyOperationService
```

Responsabilités possibles :

- résoudre les informations nécessaires à une lecture ;
- demander une lecture de sonde/étalon ;
- coordonner port/module ;
- appliquer timeouts/annulation ;
- retourner un résultat métier structuré ;
- garantir cleanup/restauration lorsqu'une opération temporaire a modifié un état matériel.

Si la lecture du code révèle plusieurs responsabilités réellement indépendantes, cette couche peut s'appuyer sur :

```text
SensorReadingService
MetrologySensorStateService
GspMetrologyService
PortCoordinator
```

Ne pas créer ces quatre abstractions mécaniquement. Extraire uniquement si elles correspondent à des frontières présentes dans le code.

### 5.1 Contrat de lecture

Un résultat de lecture commun devrait exprimer des concepts métier plutôt que la forme brute de `HotlineApiServer`, par exemple :

- sonde/id/numéro de série ;
- valeur ;
- valeur brute si nécessaire ;
- unité ;
- date de mesure ;
- source GSP/GSO ;
- succès/erreur structurée ;
- métadonnées techniques strictement nécessaires au diagnostic.

Le contrat ne doit pas forcer l'UI à connaître les noms PascalCase/legacy ou les détails d'un endpoint de support.

### 5.2 Erreurs

Distinguer au minimum :

- sonde introuvable ;
- module/port introuvable ;
- port occupé ;
- timeout lecture ;
- non-réponse ;
- réponse invalide ;
- annulation utilisateur/session ;
- erreur de configuration ;
- erreur interne.

Ne pas réduire toutes les erreurs à une chaîne `Lecture impossible`, car ajustage/étalonnage ont besoin de comportements UI et cleanup différents selon le cas.

## 6. Responsabilités communes côté Web

Les deux gros fichiers de session ne doivent pas chacun devenir un mini-framework autonome.

Les responsabilités réellement communes à extraire/consolider sont :

### `MetrologySessionRegistry`

Conceptuellement :

- sessions actives ;
- mapping utilisateur/session ;
- démarrage/fin ;
- récupération après navigation si le produit la supporte ;
- cleanup déterministe.

### `SensorLockManager`

Conceptuellement :

- empêcher deux opérations incompatibles d'utiliser simultanément la même sonde ;
- owner/session explicite ;
- libération en succès, erreur, annulation et timeout ;
- pas de lock fantôme après crash logique d'une session.

### `SensorReadingGateway`

Conceptuellement :

- cacher au workflow ajustage/étalonnage la différence de transport ;
- appeler l'API métrologie C# pour le GSP ;
- gérer le chemin GSO approprié si ce chemin reste DB-driven ;
- retourner un type commun ;
- centraliser les timeouts/mapping d'erreurs.

Le fichier actuel `metrology-reading-preview.ts` constitue déjà une base de cette responsabilité et doit être adapté/consolidé plutôt que remplacé sans raison.

### Lifecycle / restauration

Partager :

- watchdog ;
- timestamps de dernière activité ;
- arrêt propre ;
- restauration de configuration GSP ;
- libération des verrous ;
- nettoyage des ressources.

Réutiliser les helpers `metrology-session-watchdog.ts`, `metrology-gsp-configuration.ts` et `metrology-gsp-configuration-restore.ts` lorsqu'ils couvrent déjà le besoin.

## 7. Ce qui doit rester spécifique à l'ajustage

Ne pas mutualiser artificiellement les règles propres à l'ajustage.

Directions possibles à terme :

- `AdjustmentSessionService` ;
- moteur d'acquisition/validation de plateau ;
- calculateur d'ajustage ;
- repository/persistance d'ajustage ;
- présentation/export d'ajustage ;
- application/restauration de coefficients/configuration GSP selon le workflow réel.

Les noms sont indicatifs.

Le calcul métier doit être séparé de la gestion HTTP/session pour pouvoir être testé avec des entrées/sorties déterministes.

## 8. Ce qui doit rester spécifique à l'étalonnage

Directions possibles :

- `CalibrationSessionService` ;
- moteur d'acquisition des séries de mesures ;
- calcul d'étalonnage/incertitudes/erreurs ;
- repository/persistance ;
- présentation/export.

`metrology-calibration-calculations.ts` existe déjà et doit être la première référence avant de créer un nouveau calculateur.

## 9. Plan de migration recommandé

### Phase 0 — cartographie et tests de caractérisation

Avant tout déplacement de code :

1. cartographier les appels ajustage/étalonnage vers `HotlineApiServer` ;
2. identifier les méthodes C# réellement utilisées pour les lectures ;
3. identifier tous les locks de ports/modules/sondes ;
4. documenter le chemin GSP et GSO ;
5. ajouter des tests de caractérisation sur le mapping requête → résultat lorsque possible ;
6. préparer un faux/mocked sensor gateway pour tester sans matériel les workflows Web.

Livrable : aucun changement fonctionnel important.

### Phase 1 — extraction C# derrière l'endpoint existant

Extraire la logique matérielle commune de `HotlineApiServer` dans un service C# dédié.

Pendant cette phase :

```text
/api/hotline/sensor-test
        ↓
HotlineApiServer
        ↓
service commun métrologie/matériel
```

Le Web continue temporairement à appeler l'ancienne URL.

Avantages :

- diff serveur maîtrisé ;
- possibilité de tester le service en isolation ;
- aucun changement simultané du contrat Web ;
- sécurisation Hotline possible indépendamment.

### Phase 2 — endpoint serveur métrologie dédié

Créer le contrat HTTP spécifique à la métrologie, par exemple conceptuellement :

```text
/api/metrology/read
```

Le chemin/naming exact doit suivre les conventions du service C# et ne pas être choisi avant inventaire de ses routes actuelles.

L'endpoint doit :

- authentifier son appel selon le modèle retenu entre Web et service ;
- utiliser le service commun ;
- exposer uniquement les opérations nécessaires à la métrologie ;
- ne pas rendre accessible une commande brute arbitraire ;
- posséder timeouts et limites explicites.

### Phase 3 — adaptation du gateway Web commun

Modifier le helper commun (`metrology-reading-preview.ts` ou son successeur direct) pour appeler le nouveau contrat.

À la fin de cette phase :

```text
Ajustage / Étalonnage -> API métrologie
Hotline              -> API/adapter Hotline
                         \        /
                          service commun C#
```

Puis rechercher le dépôt pour confirmer qu'aucun workflow normal de métrologie n'appelle encore `/api/hotline/sensor-test`.

### Phase 4 — runtime Web commun

Une fois la frontière serveur propre :

- extraire/consolider registry de sessions ;
- centraliser locks sondes ;
- centraliser gateway de lecture ;
- unifier watchdog/cleanup/restauration ;
- réduire progressivement `metrology-adjustment-session.ts` et `metrology-calibration-session.ts`.

Faire plusieurs PR si nécessaire.

### Phase 5 — séparation métier nette

Terminer la séparation entre :

```text
runtime commun de métrologie
        ↓
workflow ajustage        workflow étalonnage
        ↓                        ↓
calculs spécifiques      calculs spécifiques
        ↓                        ↓
persistance / rapports spécifiques
```

Supprimer les compatibilités temporaires seulement après validation terrain.

## 10. Concurrence et verrouillage — règles impératives

Les opérations métrologie peuvent monopoliser une sonde/port pendant plusieurs secondes ou minutes.

Avant de changer un lock :

- identifier sa portée exacte : sonde, module, COM, session ;
- identifier qui le libère ;
- vérifier tous les retours anticipés/exceptions ;
- vérifier le watchdog ;
- vérifier une annulation/navigation ;
- tester deux utilisateurs qui sélectionnent la même sonde ;
- tester deux sondes différentes derrière le même port/module ;
- tester une sonde qui ne répond jamais.

Ne pas utiliser `Promise.all()` pour paralléliser les lectures de sondes sans démontrer que les ressources matérielles peuvent réellement travailler en parallèle.

## 11. GSP et GSO ne sont pas interchangeables

### GSP

Lecture active : le système demande une mesure à la sonde via le service Windows/protocole matériel.

Contraintes :

- COM/IP/module ;
- timeout ;
- adresse ;
- fenêtre d'écoute ;
- configuration potentiellement temporaire ;
- sérialisation des accès.

### GSO

Le chemin actuel s'appuie sur les mesures remontées et insérées dans les tables de métrologie.

Contraintes :

- attendre une mesure **postérieure** au début/dernier point attendu ;
- requête provider-specific ;
- date `DATETIME` sans fuseau ;
- numéro de série/adresse ;
- éviter de réutiliser une ancienne mesure.

Une interface commune peut exposer `read`, mais ses adapters internes doivent préserver ces différences.

## 12. Dates en métrologie

Pour les mesures stockées en `DATETIME`, appliquer les règles de `website/src/lib/date-display.ts`.

Le fichier actuel `metrology-reading-preview.ts` utilise déjà `serializeStoredDbDateTime` pour les lignes GSO. Conserver cette sémantique lors d'un déplacement de code.

Distinguer :

- `readAt` / timestamp technique : instant UTC ;
- `Date_Heure_Mesure` historique sans fuseau : wall-clock de la base à préserver ;
- durées/watchdogs : utiliser une source monotone/écart de temps lorsque pertinent plutôt que convertir inutilement en heure locale.

## 13. Sécurité du futur endpoint métrologie

Le fait que l'API soit on-premise ne dispense pas d'authentification.

Le futur contrat doit être plus restrictif que l'endpoint de diagnostic :

- opérations en allowlist ;
- pas de commande brute générique venant du navigateur ;
- authentification service-to-service ;
- body borné ;
- timeouts ;
- contrôle de concurrence ;
- logs sans secret ;
- idéalement loopback si Web et serveur sont sur la même machine ; sinon transport réseau sécurisé selon topologie client.

Ne pas réutiliser automatiquement la clé Hotline comme clé Métrologie : une séparation de responsabilités doit aussi éviter le partage non nécessaire des secrets.

## 14. Tests à prévoir

### Tests sans matériel

- mapping GSP succès ;
- timeout ;
- réponse invalide ;
- sonde/module absent ;
- lock déjà possédé ;
- libération de lock après exception ;
- watchdog ;
- restauration config ;
- calcul ajustage ;
- calcul étalonnage ;
- mapping du nouveau DTO C# → Web ;
- GSO : ignore une mesure trop ancienne et accepte la première nouvelle mesure valide.

### Tests d'intégration avec DB

À exécuter pour MySQL et SQL Server lorsque la zone est commune :

- tables d'ajustage ;
- tables d'étalonnage ;
- serial/adresse ;
- tri dernière mesure ;
- sérialisation des dates ;
- valeur brute/convertie/unité.

### Validation terrain / banc de sondes

Checklist minimale :

- GSP en ajustage ;
- GSP en étalonnage ;
- GSO en ajustage ;
- GSO en étalonnage ;
- sonde étalon non affectée à un lieu ;
- démarrage lecture sans démarrer l'opération si le workflow le prévoit ;
- plusieurs sondes sélectionnées ;
- timeout/non-réponse ;
- arrêt manuel ;
- fermeture/navigation ;
- redémarrage/reprise selon comportement supporté ;
- deux sessions concurrentes ;
- même port/module ;
- restauration de la configuration GSP ;
- service Windows indisponible ;
- MySQL et SQL Server si disponibles sur le banc ;
- heure été/hiver pour les valeurs de date persistées/affichées.

## 15. Critères de fin du chantier

Le chantier peut être considéré comme terminé lorsque :

- aucun workflow métier normal ajustage/étalonnage n'appelle une route `/api/hotline/...` ;
- Hotline et métrologie utilisent, lorsque pertinent, une couche matérielle commune indépendante du transport ;
- ajustage et étalonnage partagent la gestion générique de session/lecture/verrouillage/restauration ;
- leurs calculs/règles spécifiques restent séparés et testables ;
- les chemins GSP/GSO restent correctement distingués ;
- les verrous et timeouts sont centralisés/documentés ;
- les tests automatisés couvrent le runtime commun et les calculs ;
- la checklist terrain est validée ;
- les anciens endpoints/helpers de compatibilité inutiles sont supprimés seulement après confirmation qu'ils ne sont plus appelés.

## 16. Anti-patterns à éviter pendant ce chantier

- copier la logique de `HotlineApiServer` dans un `MetrologyApiServer` puis garder deux implémentations ;
- créer deux services C# distincts, un ajustage et un étalonnage, qui parlent chacun directement au même port COM ;
- supprimer les helpers Web déjà extraits pour tout réécrire ;
- faire en même temps une migration complète du serveur .NET ;
- modifier les calculs métrologiques dans une PR dont le but est seulement de changer le transport ;
- transformer le service commun en « God Service » avec toute la persistance, tous les calculs et tout le HTTP ;
- ignorer le chemin GSO parce que la plupart des tests utilisent du GSP ;
- changer la sémantique de `DATETIME` pendant un déplacement de code ;
- lancer plusieurs branches de cette migration sur une base `dev` ancienne sans attendre les merges, sauf demande explicite de travail parallèle.
