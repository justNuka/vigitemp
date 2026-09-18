# Changelog — VigiSensys Générateur de licences

Ce fichier décrit les évolutions propres au générateur de licences VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../../CHANGELOG.md`](../../CHANGELOG.md).

Les fichiers `.vtlic` générés sont des données de licence et ne constituent pas des versions logicielles autonomes.

## [Unreleased]

Aucun changement supplémentaire documenté.

## État pour VigiSensys 1.0.0 — 2026-09-18

### Version livrée

- Générateur de licences : `0.1.0` — inchangé.

### Portée

- Le passage du produit VigiSensys à `1.0.0` ne modifie pas le format `.vtlic`, la signature ni le modèle de génération des licences.
- L'option contractuelle `telephonie` est consommée par le Web pour protéger les fonctions Téléphonie, sans nécessiter une nouvelle version du générateur dans ce lot.
- Aucun bump artificiel du générateur n'est effectué en l'absence de changement de son binaire ou de son contrat de fichier.

## [0.1.0] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée du générateur. Elle ne reconstitue pas exhaustivement les anciennes versions.

### Versioning

- La version produit de référence du générateur est formalisée en `0.1.0` via `AssemblyInformationalVersion`.
- Les métadonnées techniques .NET à quatre composantes restent indépendantes de la version produit lorsqu'elles sont déjà utilisées par le projet.

### Fonctionnel

- Aucun changement du format `.vtlic`, de la signature ou des règles de licence n'est introduit par les lots de versioning et de fiabilisation GSP du 27/08/2026.

### Compatibilité

- Aucune nouvelle contrainte de compatibilité avec le Web, le Serveur ou l'Agent n'est introduite dans cette baseline.

### PR principales

- #60 — formalisation du versioning SemVer des composants.
