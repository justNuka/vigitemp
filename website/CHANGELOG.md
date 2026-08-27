# Changelog — VigiSensys Web

Ce fichier décrit les évolutions propres à l'application Web VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Les versions suivent `MAJOR.MINOR.PATCH` sans zéros de tête. La source de version du Web est `website/package.json`.

## [Unreleased]

### Corrigé

- Correction du contrat TypeScript des sondes de métrologie : `coeffA`, `coeffB` et `coeffC` sont désormais obligatoires dans `AdjustmentSensorRow`, conformément au payload réel de `/api/metrologie/ajustage/sondes` qui fournit toujours des valeurs numériques avec fallback `1 / 0 / 0`.
- Le build Next.js ne doit plus échouer dans la validation des coefficients d'étalonnage sur `Math.abs(item.coeffC)` / `Math.abs(item.coeffA)` avec le type `number | undefined`.
- Aucun comportement métier, payload API ou stockage BDD n'est modifié par ce hotfix.

## [0.90.2] — 2026-08-27

### Corrigé

- Les commandes GSP `ECON` utilisées par Ajustage et Étalonnage inspectent désormais la réponse brute du firmware.
- Un `ACK=ECON` contenant un marqueur de dépassement tel que `A=ovf`, `B=ovf` ou `C=ovf` n'est plus considéré comme un succès.
- L'erreur remontée indique explicitement le paramètre signalé en overflow afin de faciliter le diagnostic terrain.
- La valeur fautive n'est ni tronquée ni remplacée automatiquement : aucune plage firmware fiable n'étant formalisée dans le dépôt, le Web conserve la valeur source pour permettre le diagnostic.

### Versioning / affichage

- La version affichée par l'application reprend désormais directement la version SemVer de `package.json`.
- L'ancienne présentation avec remplissage en zéros (`0.90.002`) est abandonnée au profit de la notation canonique `0.90.2`.

### Compatibilité

- Serveur `>= 0.90.3` recommandé pour disposer conjointement du filtrage `+++` en Surveillance et du rejet des acquittements `ECON` contenant `*=ovf`.
- Aucune migration BDD.
- Agent inchangé.

### PR principales

- #62 — fiabilisation `+++` en Surveillance et rejet des réponses `ECON` en overflow.

## [0.90.1] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée du Web. Elle décrit des fonctionnalités déjà présentes dans `dev` à la création du versioning et ne constitue pas une reconstitution exhaustive de tout l'historique antérieur.

### Métrologie — Étalonnage

- Campagne d'étalonnage en 10 acquisitions appariées sonde/étalon.
- Séparation entre la phase de lecture/prévisualisation et le démarrage réel de l'étalonnage.
- Première lecture requise avant démarrage de la campagne.
- Ajout/recherche d'une sonde depuis le workflow avant la campagne.
- Prise en charge d'une sonde étalon non affectée à un lieu.
- Mise en avant de la dernière mesure étalon et simplification des tableaux d'historique.
- Navigation métrologie désactivée pendant une opération active.
- Résultats et mesures harmonisés à trois décimales.
- Détails de calcul disponibles pour les moyennes, erreurs, écarts-types et contributions d'incertitude.

### Métrologie — Ajustage

- Coefficients A/B/C visibles dès la sélection des sondes.
- Conservation de la précision brute des coefficients lorsqu'ils ne sont pas modifiés par l'utilisateur.
- Prévisualisation et sessions fiabilisées pour éviter de réutiliser des résultats terminés comme opération courante.

### GSP / métrologie embarquée

- Préparation des commandes `ECON` avec les coefficients métrologiques embarqués dans les sondes GSP.
- Transport métrologique compact limité à `a/b/c` pendant Ajustage/Étalonnage.
- Retour au cycle normal de Surveillance prévu pour resynchroniser la configuration complète après l'opération.

### Compatibilité

- Cette baseline ne définit pas à elle seule une combinaison minimale historique de Serveur/Agent : seules les contraintes explicitement vérifiées doivent être documentées.

### Références principales

- PR #38, #40, #50, #54, #55, #57, #58 et #59.
- `website/docs/backlog-retours-17-08-2026.md`
- `website/docs/metrology-retours-26-08-2026.md`
- `website/docs/gsp-econ-metrology-2026-08.md`
