# Changelog VigiSensys — vue produit

Ce fichier donne une **vue synthétique des livraisons VigiSensys** : versions des composants, grandes évolutions et contraintes de compatibilité.

Les détails techniques sont volontairement conservés dans les changelogs de chaque composant :

- [Web](website/CHANGELOG.md)
- [Serveur Windows](Vigitemp%20Serveur/CHANGELOG.md)
- [Agent Windows](Vigitemp%20agent/CHANGELOG.md)
- [Base de données / seeds](db/CHANGELOG.md)
- [Générateur de licences](Vigitemp%20Serveur/Vigitemp%20License%20Generator/CHANGELOG.md)

La convention de versioning est décrite dans [`docs/versioning.md`](docs/versioning.md). Les versions lisibles utilisent `MAJOR.MINOR.PATCH` sans zéros de tête, par exemple `0.90.2` ou `0.76.112`.

> Les composants évoluent indépendamment. Une livraison VigiSensys est donc décrite par un ensemble de versions de composants, et non par l'obligation de donner le même numéro à tous les exécutables et artefacts.

## [Unreleased]

### Web

- Téléphonie : ajout d'un guide OVHcloud intégré à l'administration et de documentations persistantes pour préparer une offre VoIP, récupérer les identifiants API/ligne, tester Click2Call et cadrer la cible Asterisk/SIP des futures alarmes vocales interactives.

### Base de données / seeds

- Nettoyage des libellés français des seeds MySQL/SQL Server : accents, fautes historiques confirmées et marqueur SemVer canonique `0.90.1`, sans changement de schéma.

## État intégré — 2026-08-27

Cette entrée constitue la première vue produit structurée du changelog. Elle résume l'état présent dans `dev` après les PR #60, #61 et #62 ; elle ne prétend pas reconstituer toutes les anciennes versions historiques de Vigitemp/VigiSensys.

### Versions des composants

| Composant | Version | Compatibilité / remarque |
| --- | --- | --- |
| Web | `0.90.2` | Serveur `>= 0.90.3` pour bénéficier de l'ensemble des correctifs GSP/ECON du 27/08 |
| Serveur Windows | `0.90.3` | Web `>= 0.90.2` pour faire remonter explicitement les erreurs `ECON *=ovf` en métrologie |
| Installateur Serveur | `0.90.3` | suit le Serveur distribué |
| Agent Windows | `1.0.1` | aucune nouvelle contrainte introduite par les lots du 27/08 |
| Installateur Agent | `1.0.1` | suit l'Agent distribué |
| BDD / seeds | `0.90.1` canonique | aucune migration requise pour les correctifs GSP du 27/08 |
| Générateur de licences | `0.1.0` | aucun changement fonctionnel dans les lots du 27/08 |

### Web — principales évolutions

- Parcours de métrologie enrichis et stabilisés : étalonnage en 10 mesures, séparation lecture/démarrage, ajout de sondes, meilleure lisibilité des résultats et des calculs.
- Coefficients A/B/C visibles dans les parcours de métrologie avec conservation de la précision des valeurs non modifiées.
- Support du nouveau comportement GSP `ECON` utilisé pendant Ajustage/Étalonnage.
- Une réponse firmware `ACK=ECON` contenant `A=ovf`, `B=ovf`, `C=ovf`, etc. est maintenant remontée comme une erreur explicite au lieu d'être considérée comme un succès.
- La version affichée du Web suit directement la notation SemVer canonique de `package.json` (`0.90.2`, sans remplissage en zéros).

[Détail du Web](website/CHANGELOG.md)

### Serveur Windows — principales évolutions

- Support du protocole GSP `ECON` étendu pour les coefficients métrologiques embarqués dans la sonde.
- Transport `ECON` compact `a/b/c` pendant Ajustage/Étalonnage afin de respecter les contraintes du module de réception.
- La séquence série exacte `+++` est traitée comme un bruit de transport et ne masque plus la vraie réponse GSP.
- Le filtrage `+++` est partagé par la couche protocolaire et couvre désormais Hotline, Ajustage, Étalonnage et Surveillance.
- Un acquittement `ECON` contenant un champ `*=ovf` est rejeté : le Serveur ne considère plus une configuration en dépassement comme synchronisée.

[Détail du Serveur](Vigitemp%20Serveur/CHANGELOG.md)

### Agent Windows — principales évolutions

- Aucun changement fonctionnel dans les lots de versioning/GSP du 27/08.
- La version produit de référence est formalisée en `1.0.1` tout en conservant les métadonnées techniques .NET historiques à quatre composantes.

[Détail de l'Agent](Vigitemp%20agent/CHANGELOG.md)

### Base de données / seeds — principales évolutions

- Baseline canonique `0.90.1` pour les seeds MySQL et SQL Server.
- Les fichiers historiques utilisaient le libellé `0.90.001`; les seeds courants ont depuis été normalisés en `0.90.1` sans changement de schéma.
- Les correctifs GSP `0.90.2` / `0.90.3` du Serveur ne nécessitent aucune migration de schéma.

[Détail BDD](db/CHANGELOG.md)

### Générateur de licences — principales évolutions

- Version produit de référence formalisée en `0.1.0`.
- Aucun changement du format `.vtlic` ni des règles de licence dans les lots du 27/08.

[Détail du générateur de licences](Vigitemp%20Serveur/Vigitemp%20License%20Generator/CHANGELOG.md)

## Règle de maintenance

Lorsqu'un lot est livré :

1. détailler les modifications dans le ou les `CHANGELOG.md` des composants réellement modifiés ;
2. ajouter ici uniquement les **grandes évolutions**, les versions livrées et les contraintes de compatibilité importantes ;
3. ne pas recopier dans ce fichier les détails de code, les checklists terrain ou les listes exhaustives de fichiers : ces informations restent dans les PR et les backlogs ;
4. ne jamais inventer une version minimale : une contrainte de compatibilité doit être justifiée par le code ou par une validation réelle.
