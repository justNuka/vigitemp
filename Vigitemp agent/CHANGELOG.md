# Changelog — VigiSensys Agent

Ce fichier décrit les évolutions propres à l'Agent Windows VigiSensys et à son installateur.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

La version produit de référence est `AssemblyInformationalVersion("x.y.z")`. Les versions techniques .NET historiques à quatre composantes peuvent rester distinctes.

## [Unreleased]

Aucun changement supplémentaire documenté.

## [1.0.1] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée de l'Agent. Elle ne reconstitue pas exhaustivement les anciennes versions.

### Versioning

- La version produit de référence est formalisée en `1.0.1`.
- Les versions techniques historiques `AssemblyVersion` / `AssemblyFileVersion` restent en quatre composantes et ne sont pas modifiées uniquement pour correspondre visuellement à SemVer.
- L'installateur Agent suit la version produit `1.0.1`.

### Fonctionnel

- Aucun changement fonctionnel de l'Agent n'est introduit par les lots de versioning et de fiabilisation GSP du 27/08/2026.

### Compatibilité

- Les correctifs Serveur/Web `0.90.2` / `0.90.3` du 27/08 ne nécessitent pas de mise à jour de l'Agent.

### PR principales

- #60 — formalisation du versioning SemVer des composants.
