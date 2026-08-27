# Retours métrologie — 26/08/2026

## Référence

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- PR #57 — **mergée** le 26/08/2026, merge `0a1a6aaf323200f521f02cc10689bb9596d0f0d5`.
- PR #58 — **mergée** le 27/08/2026, merge `3f93d7c192828faf46497541b8b7e82e7638c250`.
- Branche courante : `agent/adjustment-coefficients-display`.
- PR courante : #59 — ouverte vers `dev`.

Ce document conserve le détail des retours du 26/08/2026 pendant leur traitement. Il doit être consolidé dans `website/docs/backlog-retours-17-08-2026.md` au fur et à mesure des PR livrées.

## Sonde étalon — saisie des coefficients

### Retour

Ajouter le helper de saisie float/décimale sur les coefficients de la page d’administration des sondes étalon.

### État vérifié

Le formulaire convertissait déjà les valeurs avec le helper de normalisation décimale lors de la soumission, notamment la virgule française vers le point. En revanche, les champs `Coeff A`, `Coeff B`, `Coeff C` et `Incertitude maximale` ne déclaraient pas `inputMode="decimal"`, contrairement aux saisies de coefficients utilisées dans le parcours Ajustage.

### Correctif livré par la PR #57

Fichier :

- `website/src/app/[locale]/(admin)/admin/etalons/_components/standard-info-form.tsx`.

Modification : ajout de `inputMode="decimal"` sur les trois coefficients et l’incertitude maximale. La conversion existante à la soumission reste inchangée.

### Validation

- [ ] saisir un coefficient avec un point ;
- [ ] saisir un coefficient avec une virgule en locale FR ;
- [ ] vérifier A, B et C ;
- [ ] vérifier l’incertitude maximale ;
- [ ] modifier puis rouvrir une sonde étalon et contrôler les valeurs enregistrées.

## Ajustage — alignement avec l’étalonnage

### Retours à traiter dans le lot UI Ajustage

- reprendre l’affichage compact de l’Étalonnage pour le milieu d’intercomparaison ;
- supprimer de l’interface les informations module / port série de l’étalon ;
- simplifier les informations de référence pour se rapprocher de l’écran Étalonnage ;
- lire aussi l’étalon pendant la prélecture des sondes ;
- supprimer le choix 15/30/60 s et imposer une cadence de 1 minute, y compris pour les GSP ;
- utiliser 2 minutes comme valeur par défaut du plateau de stabilité ;
- masquer le menu de navigation des sous-pages métrologie pendant une opération active ;
- déplacer les coefficients A/B/C dans le tableau des sondes à ajuster ;
- supprimer la colonne `Signal lu` ;
- afficher dans `Valeur calibrage actuelle` le contenu utile de `Signal lu` : date/heure de la mesure et valeur + unité.

### État du code vérifié

Avant correction :

- plateau par défaut : 30 minutes ;
- cadence configurable : 15/30 s pour GSP, forcée à 60 s seulement lorsqu’une GSO est sélectionnée ;
- la boucle serveur d’Ajustage possède elle aussi un fallback historique à 15 s pour les GSP ;
- la prélecture Ajustage n’envoie ni `standardId` ni `mediumId`, donc l’étalon n’est pas interrogé pendant cette phase ;
- les coefficients A/B/C sont déjà disponibles dans la session mais rendus dans une carte séparée ;
- la table comporte encore `Valeur calibrage actuelle` et `Signal lu` comme deux colonnes séparées ;
- le composant `MetrologySubpagesCards` reste rendu pendant l’opération.

La cadence devra être modifiée simultanément côté React, API et moteur de session. Il ne faut pas livrer uniquement le sélecteur UI à 60 s tout en laissant la boucle serveur à 15 s.

## Ajustage — coefficients visibles avant le démarrage

### Retour complémentaire du 27/08/2026

- les coefficients A/B/C doivent être visibles dès la préparation de l’Ajustage, sans attendre le démarrage de la session ni les premières réponses des sondes ;
- les coefficients doivent être affichés avec **exactement 3 décimales** (`1.000`, `0.000`, etc.).

### État vérifié avant correction

La carte des coefficients était conditionnée à `isAdjustmentRunning && session`. Les coefficients n’étaient donc disponibles dans l’interface qu’après création de la session. De plus, les valeurs initiales des inputs étaient formatées avec jusqu’à 10 décimales.

L’endpoint `/api/metrologie/ajustage/sondes` interrogeait déjà les derniers enregistrements `t_ajustage` pour retrouver l’unité, mais ne remontait pas `Coeff_X2`, `Coeff_X` et `Coeff_Constant`. Le moteur de session possédait déjà la logique de conversion historique vers les coefficients A/B/C :

- ajustage à deux coefficients : `A = Coeff_X`, `B = Coeff_Constant`, `C = 0` ;
- ajustage à trois coefficients : `A = Coeff_X2`, `B = Coeff_X`, `C = Coeff_Constant`.

### Correctif PR #59

Branche : `agent/adjustment-coefficients-display`.

Fichiers principaux :

- `website/src/app/api/metrologie/ajustage/sondes/route.ts` ;
- `website/src/hooks/useAdjustmentSensors.ts` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx`.

Comportement :

- l’API des sondes Ajustage renvoie maintenant les coefficients A/B/C issus du dernier `t_ajustage`, avec les mêmes valeurs par défaut que le moteur de session (`1 / 0 / 0`) lorsqu’aucun ajustage n’existe ;
- la carte coefficients est visible dès que des sondes ont été sélectionnées et que l’utilisateur arrive sur l’étape Ajustage ;
- avant le démarrage, les coefficients sont affichés en lecture seule : le besoin est d’abord de les rendre visibles, sans ajouter un nouveau chemin de persistance hors session ;
- pendant une session active, les inputs restent modifiables et le bouton de validation existant reste disponible ;
- les valeurs affichées utilisent exactement 3 décimales, y compris les zéros finaux ;
- afin d’éviter une perte de précision silencieuse, une valeur uniquement arrondie pour l’affichage n’est pas réécrite en base si l’utilisateur ne modifie pas le champ : la valeur brute de session est conservée pour les coefficients non touchés ;
- seuls les coefficients effectivement modifiés par l’opérateur sont convertis depuis le texte affiché lors de la validation.

### Checklist terrain

- [ ] sélectionner une sonde possédant déjà un ajustage puis aller sur l’étape Ajustage sans démarrer : A/B/C sont immédiatement visibles ;
- [ ] vérifier une sonde sans historique d’ajustage : affichage `1.000 / 0.000 / 0.000` ;
- [ ] vérifier un historique à deux coefficients et un historique à trois coefficients ;
- [ ] confirmer qu’aucune lecture sonde n’est nécessaire pour faire apparaître la carte ;
- [ ] confirmer l’affichage de **3 décimales fixes**, y compris les zéros finaux ;
- [ ] démarrer l’Ajustage : les mêmes coefficients restent affichés et deviennent modifiables ;
- [ ] cliquer sur Valider sans modifier un coefficient dont la valeur brute contient plus de 3 décimales, puis vérifier qu’il n’a pas été arrondi en base ;
- [ ] modifier explicitement A/B/C puis valider et vérifier l’enregistrement / l’envoi à la prochaine interrogation ;
- [ ] contrôler une locale FR avec saisie virgule et une locale EN avec saisie point.

## Étalonnage — coefficients modifiables pendant la lecture des sondes

### Retour complémentaire du 27/08/2026

- afficher dans **Réaliser un étalonnage** le même tableau A/B/C que dans Ajustage pour les sondes sélectionnées ;
- afficher les coefficients avec **exactement 3 décimales** ;
- permettre leur modification et leur validation uniquement pendant la phase de **lecture des sondes** précédant la campagne ;
- dès que l’utilisateur démarre réellement l’opération d’étalonnage, faire disparaître ce tableau.

### État vérifié avant correction

L’Étalonnage réutilise déjà `useAdjustmentSensors()`. Avec la PR #59, chaque sonde sélectionnable dispose donc de ses coefficients A/B/C courants provenant du dernier `t_ajustage`.

La « lecture des sondes » est un flux distinct de la session d’étalonnage :

- l’interface appelle `POST /api/metrologie/lecture-sondes` ;
- `metrology-reading-preview-session.ts` conserve une session temporaire par utilisateur et met les sondes en état métrologie `E` ;
- au démarrage réel, `POST /api/metrologie/etalonnage/session` arrête d’abord cette lecture temporaire, puis applique la configuration GSP `calibration-without-accuracy` avant la première acquisition.

Cette séparation permet de verrouiller la modification des coefficients avant le début des 10 mesures sans modifier les calculs de campagne.

### Correctif PR #59

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-coefficients-card.tsx` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-workflow-client.tsx` ;
- `website/src/app/api/metrologie/etalonnage/coefficients/route.ts` ;
- `website/src/lib/metrology-reading-preview-session.ts` ;
- `website/src/messages/metrology-calibration-supplements.ts`.

Comportement :

- le tableau reprend les sondes actuellement sélectionnées et affiche A/B/C sur exactement 3 décimales ;
- tant que la lecture simple n’est pas active, les champs sont visibles mais en lecture seule et la validation est désactivée ;
- pendant la lecture, l’opérateur peut modifier les coefficients ;
- seules les sondes réellement modifiées sont persistées, afin de ne pas créer de lignes historiques inutiles pour les autres sondes ;
- une modification crée une nouvelle ligne `t_ajustage` avec le même mapping A/B/C que l’Ajustage et conserve la traçabilité étalon / certificat / milieu / opérateur ;
- les lieux concernés sont marqués `Infos_Modifiees_Depuis_Derniere_Mesure = true` ;
- le backend vérifie qu’une session de lecture `ETALONNAGE` est réellement active pour le même utilisateur et que chaque sonde modifiée appartient bien à cette lecture : le verrouillage ne dépend donc pas seulement du bouton React ;
- les valeurs non modifiées d’une ligne conservent leur précision brute même si l’écran n’en montre que 3 décimales ;
- au démarrage réel de la campagne, la lecture temporaire est arrêtée puis la configuration GSP d’étalonnage relit les derniers `t_ajustage` : les coefficients validés sont donc ceux appliqués à la campagne ;
- le tableau est retiré du DOM dès que le démarrage de l’étalonnage est demandé (`startOperationMutation.isPending`), puis reste absent pendant toute session `running` ;
- l’arrêt manuel de la lecture appelle maintenant explicitement `DELETE /api/metrologie/lecture-sondes`, au lieu d’attendre seulement l’expiration du preview serveur.

### Checklist terrain

- [ ] sélectionner une ou plusieurs sondes et ouvrir l’étape Étalonnage : tableau A/B/C visible avec 3 décimales fixes ;
- [ ] avant « Lancer la lecture », vérifier que les inputs et la validation ne permettent aucune modification ;
- [ ] lancer la lecture : les inputs deviennent modifiables ;
- [ ] modifier seulement une sonde puis valider : vérifier une nouvelle ligne `t_ajustage` uniquement pour cette sonde ;
- [ ] vérifier le mapping linéaire (`A/B`, `C=0`) puis un cas à trois coefficients ;
- [ ] vérifier qu’un coefficient brut plus précis que 3 décimales n’est pas tronqué si le champ n’est pas touché ;
- [ ] arrêter la lecture : les champs redeviennent immédiatement non modifiables et l’état `E` est restauré côté serveur ;
- [ ] tenter un PATCH API après arrêt de la lecture : la validation doit être refusée ;
- [ ] relancer la lecture, modifier/valider puis démarrer l’étalonnage : le tableau disparaît immédiatement ;
- [ ] contrôler la trame/configuration GSP appliquée au démarrage et confirmer qu’elle reprend les nouveaux coefficients avec l’ancienne erreur de justesse neutralisée ;
- [ ] tester une GSO : persistance des coefficients et absence de commande série GSP parasite ;
- [ ] vérifier FR/EN et clair/sombre.

## Étalonnage — affichage à 3 décimales et diagnostic des calculs

### Retours complémentaires

- afficher les mesures d’étalonnage avec **3 chiffres après la virgule** au lieu des 5/6 visibles auparavant ;
- inverser les colonnes `Moyenne étalon` et `Moyenne sonde` dans le tableau de résultats afin de conserver le même ordre que dans le tableau des 10 mesures situé au-dessus ;
- ajouter sous le tableau de résultats un bouton permettant d’afficher le détail complet des calculs pour localiser un très petit écart observé sur l’erreur de justesse.

### Correctif PR #58

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-workflow-client.tsx` ;
- `website/src/lib/metrology-calibration-calculations.ts` ;
- `website/src/messages/metrology-calibration-supplements.ts`.

Comportement :

- `formatCampaignValue()` demande désormais 3 décimales sur l’écran d’étalonnage uniquement ;
- le helper global `formatMeasureValue()` n’est pas modifié, afin de ne pas imposer cette règle à Surveillance/Historique ;
- le tableau final affiche `Moyenne étalon` avant `Moyenne sonde` ;
- un bouton `Afficher le détail des calculs` / `Masquer le détail des calculs` est disponible sous les résultats ;
- pour chaque sonde, le détail montre les 10 couples de valeurs brutes étalon/sonde et leur différence ;
- les sommes et moyennes sont affichées sans arrondi d’interface et comparées aux valeurs du résultat serveur ;
- l’erreur de justesse est affichée comme `moyenne sonde - moyenne étalon`, avec comparaison entre valeur recalculée et valeur serveur ;
- l’écart-type expose la somme des écarts au carré, le diviseur `n - 1`, la variance et la racine ;
- le calcul d’incertitude expose les entrées et les composantes `U1` à `U11`, leurs carrés, la somme des `U²` puis la racine finale ;
- les formules métier et les résultats numériques restent identiques : le helper de calcul retourne seulement les intermédiaires supplémentaires utilisés pour le diagnostic.

### Point important sur la petite différence de justesse

L’erreur de justesse serveur est calculée avec les moyennes **en pleine précision** :

```text
Erreur de justesse = moyenne sonde brute - moyenne étalon brute
```

L’interface affiche désormais les moyennes sur 3 décimales. Une soustraction manuelle des deux valeurs affichées peut donc différer très légèrement du résultat calculé sur les moyennes brutes. Le panneau de détail permet de vérifier si la divergence apparaît à cette étape ou plus tôt dans les 10 mesures / sommes / moyennes.

### Validation terrain PR #58

- [ ] vérifier les dernières mesures étalon et sondes : 3 décimales ;
- [ ] vérifier les 10 mesures appariées : 3 décimales ;
- [ ] vérifier les résultats : 3 décimales ;
- [ ] confirmer l’ordre `Moyenne étalon` puis `Moyenne sonde` ;
- [ ] ouvrir le détail et comparer les 10 valeurs brutes à la campagne terrain ;
- [ ] recalculer les sommes puis les moyennes et comparer aux valeurs serveur affichées dans le détail ;
- [ ] comparer `moyenne sonde brute - moyenne étalon brute` à l’erreur de justesse serveur ;
- [ ] comparer également la soustraction des moyennes arrondies à 3 décimales afin de voir si le petit écart vient uniquement de l’affichage ;
- [ ] contrôler l’écart-type puis les composantes `U1` à `U11` et l’incertitude finale ;
- [ ] vérifier les libellés FR et EN ;
- [ ] confirmer qu’aucune valeur persistée ni aucun calcul métier n’est arrondi à 3 décimales.

## Étalonnage — audit de la moyenne des 10 mesures

### Retour

Un écart d’environ un centième a été constaté entre une moyenne attendue et la moyenne produite par l’application. La précision est critique car cet écart se répercute sur l’erreur de justesse et les résultats métrologiques.

### Audit effectué le 26/08/2026

Chaîne contrôlée :

1. la GSP retourne la mesure au service C# ;
2. `GspProtocol` extrait le texte décimal et utilise `double.TryParse` avec `InvariantCulture` après normalisation virgule/point ;
3. `HotlineApiServer` expose la valeur en `double?` ;
4. le serveur Next.js convertit la valeur reçue via `asFiniteNumber` sans arrondi ;
5. la session d’étalonnage conserve directement `reading.value` pour les 10 mesures étalon et sonde ;
6. `averageCalibrationValues()` calcule `sum(values) / values.length` côté serveur ;
7. aucun `toFixed()`, aucun arrondi au centième et aucune conversion navigateur n’intervient dans ce calcul ;
8. le frontend ne fait qu’afficher le résultat déjà calculé côté serveur.

Fichier de calcul :

- `website/src/lib/metrology-calibration-calculations.ts`.

Le calcul actuel est :

```ts
return values.reduce((sum, value) => sum + value, 0) / values.length
```

Les champs de résultat historiques de `t_etalonnage` sont de type SQL `FLOAT`. Cette représentation peut produire de très petits écarts binaires, mais à l’échelle habituelle des mesures environnementales elle n’explique pas à elle seule un décalage de `0,01` sur la moyenne calculée en mémoire.

### Conclusion actuelle

Aucune conversion navigateur ni aucun arrondi intermédiaire susceptible d’expliquer `0,01` n’a été trouvé. La formule métier n’est donc pas modifiée sans preuve de la cause.

La PR #58 ajoute maintenant le diagnostic détaillé nécessaire pour effectuer ce contrôle avec les valeurs brutes de la campagne sans modifier la formule.

Le prochain contrôle terrain doit partir d’une campagne réelle et comparer exactement les mêmes données :

- [ ] relever les 10 valeurs étalon ;
- [ ] relever les 10 valeurs de la sonde concernée ;
- [ ] comparer les sommes et moyennes recalculées au détail de la PR #58 ;
- [ ] comparer avec `Moyenne_Etalon` / `Moyenne_Sonde` du résultat en mémoire puis en base ;
- [ ] comparer les 10 lignes persistées dans `t_etalonnage_mesure` ;
- [ ] vérifier si la valeur attendue par l’opérateur utilise des mesures arrondies/formatées différentes des valeurs réellement reçues ;
- [ ] si un écart de `0,01` est reproductible avec exactement les mêmes 10 nombres bruts, corriger à l’endroit précis où apparaît la divergence.

Cette approche évite d’introduire un arrondi artificiel dans un calcul métrologique critique sans cause démontrée.

## Étalonnage — session terminée restaurée et écran bloqué

### Retour

Après la dixième mesure et la fin automatique d’un étalonnage, le résultat restait associé au compte utilisateur. En quittant puis en rouvrant `Réaliser étalonnage`, y compris depuis un autre poste avec le même compte, l’ancienne campagne était restaurée et le retour vers la sélection de nouvelles sondes ne fonctionnait pas.

### Cause

La session serveur reste volontairement consultable après sa terminaison pour afficher les résultats. Elle est indexée par utilisateur, ce qui explique sa visibilité depuis un autre poste connecté avec le même compte. Ce stockage n’empêche toutefois pas une nouvelle campagne : `startCalibrationSession()` bloque uniquement lorsqu’une session existante est encore `running`.

Le verrouillage venait du frontend :

- `visibleStep` imposait l’écran calibration avec `running || hasResults` ;
- l’effet de restauration rechargeait également les sondes, l’étalon et le milieu pour une session terminale contenant des résultats ;
- `setStep("selection")` était donc immédiatement neutralisé par `hasResults`.

### Correctif PR #57

Fichier :

- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-workflow-client.tsx`.

Comportement :

- une session `running` continue de forcer l’écran d’étalonnage et d’être restaurée entre pages/postes ;
- une session terminée n’impose plus l’étape calibration ;
- les résultats restent visibles à la fin de l’opération tant que l’utilisateur reste sur cet écran ;
- dès qu’il revient à la sélection, la session terminale est retirée du cache client ;
- lorsqu’une page est ouverte avec seulement une ancienne session terminale côté serveur, elle revient à la sélection au lieu de restaurer l’ancienne campagne.

### Validation terrain

- [ ] terminer naturellement une campagne de 10 mesures et vérifier que les résultats restent affichés ;
- [ ] cliquer sur Retour et vérifier que la sélection des sondes redevient accessible ;
- [ ] sélectionner un nouveau lot et démarrer une nouvelle campagne ;
- [ ] quitter la page après une campagne terminée puis revenir : ne pas être renvoyé de force sur l’ancienne campagne ;
- [ ] répéter depuis un autre poste avec le même compte ;
- [ ] pendant une vraie session `running`, quitter puis revenir : la campagne en cours doit au contraire être restaurée ;
- [ ] vérifier qu’un autre compte n’est pas impacté.
