# Laboratoire UI — loaders et pages système

## Objectif

Ce document décrit la galerie de concepts ajoutée pour explorer de nouveaux **loaders métier** et de nouvelles **pages système / erreur** VigiSensys sans modifier les parcours de production existants.

Le besoin est volontairement séparé en deux étapes :

1. concevoir et comparer plusieurs directions visuelles dans une page de démonstration ;
2. intégrer ultérieurement, au cas par cas, uniquement les concepts explicitement validés.

**Statut actuel : galerie de démonstration uniquement.** Les skeletons, loaders, pages 404 et pages 500 déjà utilisés par l'application ne sont pas remplacés par ce lot.

Branche de conception : `feature/ui-motion-showcase`.

## Accès

Route de test :

```text
/[locale]/admin/test/ui-motion
```

Exemples :

```text
/fr/admin/test/ui-motion
/en/admin/test/ui-motion
```

La route réutilise le mécanisme des pages de test existantes et n'est disponible que lorsque :

```text
ENABLE_TEST_PAGES=true
```

Pour ouvrir la galerie en développement :

```bash
ENABLE_TEST_PAGES=true pnpm dev
```

Le build de production conserve `ENABLE_TEST_PAGES` désactivé : la route de laboratoire retourne alors une 404 conformément au garde-fou prévu.

L'accès reste soumis aux contrôles du layout Administration, notamment au droit Dashboard Admin déjà utilisé pour `/admin/test`.

## Choix technique

Les prototypes utilisent principalement :

- **Motion** pour les transitions, morphings et séquences ;
- **SVG** pour les courbes, lignes de signal et liaisons ;
- **CSS / Tailwind** pour les halos, grilles, formes et états.

Three.js n'est pas ajouté dans ce lot : aucune des animations proposées ne nécessite une scène 3D suffisamment complexe pour justifier le poids et la maintenance supplémentaires. Il pourra être envisagé pour un concept futur si la 3D apporte une vraie valeur fonctionnelle ou visuelle.

Le **laboratoire force volontairement les animations** avec `MotionConfig reducedMotion="never"`. Le but est d'éviter qu'un réglage OS/navigateur `prefers-reduced-motion` rende toutes les maquettes statiques pendant la phase de comparaison visuelle. Cette exception ne vaut que pour `/admin/test/ui-motion` : lorsqu'un concept sera intégré dans un vrai parcours, il devra respecter à nouveau `prefers-reduced-motion` et proposer un fallback stable.

## Concepts de loaders

### 1. Orbiteur télémétrique

Quatre familles de mesures suivent une chorégraphie géométrique autour d'un noyau de supervision : elles changent de position, de forme, de rotation et de taille pendant que des particules de télémétrie convergent vers le centre.

Usage envisagé :

- chargement global de Surveillance ;
- dashboard ;
- rafraîchissement d'un ensemble de mesures.

Intention : représenter une acquisition continue sans retomber sur un spinner générique.

### 2. Signal morphing

Une forme centrale se déforme réellement entre plusieurs silhouettes tandis que des particules tournent autour d'elle et que les états de signal/décodage/buffer évoluent.

Usage envisagé :

- chargements courts ;
- transitions globales ;
- opérations où le contenu final n'a pas encore une forme UI clairement connue.

Intention : créer une signature visuelle VigiSensys plus abstraite, inspirée des loaders cinétiques / morphing.

### 3. Construction des cards Surveillance

Les cards sont désormais **dessinées comme sur une table à dessin technique** :

1. structure ;
2. en-tête ;
3. valeur ;
4. mini-graphe ;
5. métadonnées.

Usage envisagé :

- première ouverture de Surveillance ;
- changement important de filtres ;
- rechargement d'un bloc de cards.

Intention : faire comprendre que les données arrivent et que l'interface se construit réellement.

### 4. Tracé de graphique

Les seuils apparaissent, puis la série de mesure se dessine avec un point de lecture et un balayage léger.

Usage envisagé :

- ouverture du graphe détaillé ;
- changement de période ;
- changement de sonde / alarme ;
- préparation d'une série temporelle.

Intention : utiliser une animation directement liée au contenu en cours de préparation.

### 5. Découverte des sondes

Une passerelle centrale scanne progressivement plusieurs familles de sondes.

Usage envisagé :

- Administration > Sondes ;
- recherches matérielles ;
- imports ou diagnostics impliquant plusieurs sondes.

Intention : rappeler le réseau matériel VigiSensys et les communications avec les sondes.

### 6. Flux de mesures

Des paquets de valeurs se déplacent depuis plusieurs types de mesure vers un stockage VigiSensys.

Usage envisagé :

- historique ;
- import ;
- agrégation de mesures ;
- traitements plus longs sur un volume de données.

Intention : représenter un pipeline plutôt qu'un chargement abstrait.

## Concepts de pages système

### 404 — sonde égarée

La maquette 404 reprend plus directement l'esprit des références fournies : composition plein écran sombre/bleue, planètes, étoiles, code `404` monumental et objet animé traversant le `0` traité comme un radar.

Le message précise que la page est introuvable sans suggérer que la Surveillance elle-même est en panne.

### 500 — chaîne de mesure interrompue

La maquette 500 reprend l'idée du robot de maintenance : grand code `500` dans une carte claire sur fond bleu VigiSensys, deux racks serveur et un petit robot qui tente de rétablir une liaison interrompue.

Le visuel représente un incident applicatif sans affirmer que des données ont été perdues.

### Maintenance — banc technique

La scène maintenance devient un véritable banc technique sombre : robot VigiSensys, sonde en cours d'intervention, outils orbitaux et cycle de service animé.

Le ton doit rester calme et explicite pour une indisponibilité planifiée.

### Réseau — diagnostic embarqué

La maquette réseau représente d'abord la panne visuellement : paquets venant du Web et du réseau qui s'arrêtent sur une rupture centrale. Elle propose ensuite un diagnostic manuel et **sans écriture**.

Lorsqu'on clique sur **Lancer le test**, trois vérifications sont effectuées :

1. `navigator.onLine` pour connaître l'état déclaré par le navigateur ;
2. une requête `HEAD` avec `cache: "no-store"` vers l'URL Web courante pour vérifier que l'origine VigiSensys répond ;
3. une requête `HEAD` avec `cache: "no-store"` vers `/api/me` pour vérifier qu'une réponse HTTP est obtenue depuis l'API.

Le diagnostic affiche la latence mesurée et le code HTTP lorsqu'une réponse est reçue. Un code d'authentification ou d'autorisation reste une **réponse réseau** : l'objectif est de distinguer l'absence de liaison d'une API joignable.

Chaque requête est limitée par un timeout de 4 secondes.

Ce mini-test ne doit pas être présenté comme un diagnostic exhaustif : il ne conclut pas automatiquement qu'une base, le Serveur Windows ou un équipement matériel est en panne.

## Contrôles de la galerie

La page permet :

- de comparer les loaders indépendamment ;
- de sélectionner une vitesse rapide, normale ou lente ;
- de rejouer leur séquence d'introduction ;
- de passer entre les loaders et les pages système ;
- de lancer manuellement le mini diagnostic réseau.

## Internationalisation

Toutes les chaînes visibles du laboratoire sont fournies en français et en anglais via `next-intl`.

Le test `pnpm test:ui-motion-showcase` vérifie que les deux langues possèdent exactement les mêmes clés sous `testPages.uiMotion`.

## Garde-fous

Le test dédié vérifie également :

- que la route reste derrière `FEATURE_FLAGS.enableTestPages` ;
- que les quatre fichiers de production suivants n'importent pas la galerie :
  - `src/app/[locale]/(dashboard)/loading.tsx` ;
  - `src/app/[locale]/not-found.tsx` ;
  - `src/app/[locale]/error.tsx` ;
  - `src/app/[locale]/(dashboard)/error.tsx` ;
- que les six loaders attendus sont présents ;
- que les quatre concepts de pages système sont présents ;
- que le diagnostic réseau conserve ses contrôles de disponibilité ;
- que la version Web documentée pour ce lot est cohérente.

Commande :

```bash
pnpm test:ui-motion-showcase
```

## Checklist avant toute intégration en production

Un concept ne doit pas être branché sur un vrai parcours uniquement parce qu'il existe dans la galerie.

Avant intégration :

- [ ] valider visuellement le concept en thème clair ;
- [ ] valider visuellement le concept en thème sombre ;
- [ ] contrôler desktop, tablette et mobile ;
- [ ] vérifier `prefers-reduced-motion` ;
- [ ] mesurer l'impact CPU/GPU sur une machine cliente représentative ;
- [ ] éviter une animation disproportionnée pour un chargement très court ;
- [ ] conserver un fallback simple lorsque JavaScript ou les animations sont indisponibles ;
- [ ] vérifier les textes FR/EN dans le contexte final ;
- [ ] décider précisément quel loader remplace quel skeleton ou état existant ;
- [ ] pour une page d'erreur, conserver les actions réellement utiles au contexte ;
- [ ] pour la page réseau, confirmer les endpoints réellement pertinents avant d'en faire un diagnostic de production ;
- [ ] ajouter les tests du parcours réel modifié ;
- [ ] refaire un build de production complet.

## Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/test/ui-motion/page.tsx`
- `website/src/app/[locale]/(admin)/admin/test/ui-motion/_components/ui-motion-showcase-client.tsx`
- `website/src/app/[locale]/(admin)/admin/test/ui-motion/_components/loading-concepts.tsx`
- `website/src/app/[locale]/(admin)/admin/test/ui-motion/_components/error-concepts.tsx`
- `website/scripts/test-ui-motion-showcase.ts`
- `website/src/messages/fr.json`
- `website/src/messages/en.json`
