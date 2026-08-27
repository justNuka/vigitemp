# Changelog VigiSensys

Ce fichier est la référence lisible des changements destinés à être livrés avec VigiSensys.
Il complète l'historique Git : le but est d'indiquer **ce qui change pour une installation**, **quels composants sont concernés** et **s'il existe une contrainte de compatibilité ou de migration**.

Le format de version retenu est `MAJOR.MINOR.PATCH` (SemVer), sans zéros de tête. La convention complète est décrite dans [`docs/versioning.md`](docs/versioning.md).

> VigiSensys contient plusieurs composants qui peuvent évoluer indépendamment. Une entrée de changelog doit donc indiquer les versions réellement modifiées au lieu de supposer qu'une version unique s'applique automatiquement au Web, au Serveur, à l'Agent, aux outils et aux scripts de base de données.

## [Unreleased]

### Versions prévues par composant

| Composant | Version précédente | Version de ce lot | Version minimale associée à ce lot |
| --- | --- | --- | --- |
| Serveur d'interrogation | `0.90.2` | `0.90.3` | `0.90.3` pour bénéficier du filtrage `+++` en Surveillance et du rejet des réponses `ovf` |
| Installateur Serveur | `0.90.2` | `0.90.3` | `0.90.3` lorsqu'il distribue le Serveur `0.90.3` |
| Web | `0.90.1` | `0.90.2` | `0.90.2` pour faire remonter explicitement un `ovf` ECON pendant les opérations de métrologie |
| Agent Windows | `1.0.1` | inchangé | aucune nouvelle contrainte |
| BDD / seeds | `0.90.1` canonique | inchangé | aucune migration |
| Générateur de licences | `0.1.0` | inchangé | aucune nouvelle contrainte |

### Corrigé — GSP / Surveillance

- Le filtrage du token série de transport exact `+++`, introduit en Serveur `0.90.2` pour les lectures Hotline/Ajustage/Étalonnage, est déplacé dans la couche protocolaire GSP commune.
- La Surveillance GSP ne considère donc plus `+++` comme la première donnée significative d'une réponse. Le délai de réponse incomplète ne démarre plus sur ce bruit et le lecteur continue d'attendre la vraie trame `ACK=TEMP ... END` dans ses délais normaux.
- Le filtrage reste volontairement strict : seul le token exact `+++` est supprimé. Les valeurs métier contenant des `+`, notamment `Alarm=F+D+E+LH+LB+RB+RH`, sont conservées.

### Corrigé — GSP / ECON

- Une réponse firmware contenant un marqueur explicite de dépassement, par exemple `B=ovf`, n'est plus considérée comme un acquittement ECON réussi même si `ACK=ECON` est présent.
- Le Serveur refuse désormais cet acquittement lors des synchronisations de configuration GSP utilisées par la Surveillance.
- Le Web détecte également `*=ovf` dans la réponse brute des ECON de métrologie et remonte une erreur explicite indiquant le paramètre concerné au lieu de considérer l'ACK comme un succès.
- Le correctif ne tronque, ne borne et ne remplace pas automatiquement le coefficient fautif : la plage numérique réellement acceptée par le firmware n'étant pas formalisée dans le dépôt, la valeur source doit être diagnostiquée plutôt que modifiée arbitrairement.
- Le retour terrain ayant motivé ce contrôle montrait une trame sortante contenant déjà `B=450000000.0000000000`, suivie de `ACK=ECON`, `B=ovf`. Le problème n'est donc pas un simple défaut de parsing de la réponse : la valeur anormalement grande est présente avant l'envoi à la sonde.

### Compatibilité / migration

- Aucune migration BDD.
- Aucun changement de formule d'ajustage ni de mapping linéaire/multipoint A/B/C.
- Aucun changement des délais de Surveillance GSP : seuls les tokens considérés comme données significatives sont corrigés.
- Pour un déploiement couvrant à la fois les deux corrections de ce lot, utiliser **Serveur >= `0.90.3`** et **Web >= `0.90.2`**.
- L'Agent reste compatible sans mise à jour (`1.0.1`).

## Serveur `0.90.2` / Installateur Serveur `0.90.2` — 2026-08-27

### Corrigé

- Lecture GSP via le Serveur/Hotline : la séquence de contrôle série exacte `+++` n'est plus considérée comme une réponse métier dans le lecteur utilisé par Hotline, Ajustage et Étalonnage. Le lecteur continue d'attendre la vraie trame GSP (`ACK=TEMP`, `Serial`, `Mesure`, `END`) au lieu de terminer sur `+++` puis de purger la réponse utile arrivée juste après.
- Le filtrage est volontairement limité au token de transport `+++` ; les signes `+` présents dans des données métier comme `Alarm=F+D+E+LH+LB+RB+RH` restent intacts.

### Compatibilité / migration

- Aucune migration BDD ni modification de contrat Web/API.
- Le Serveur `0.90.2` suffit pour corriger le chemin Hotline/Métrologie, mais la Surveillance GSP nécessite le correctif complémentaire du Serveur `0.90.3`.

## Versioning et maintenance — 2026-08-27

- Ajout de ce changelog racine pour centraliser les évolutions livrables.
- Formalisation de la convention SemVer `MAJOR.MINOR.PATCH` pour les versions produit lisibles.
- Normalisation de la version produit du Serveur de `0.90.001` vers `0.90.1`. Il s'agit uniquement d'une normalisation d'écriture : aucun comportement métier n'est modifié.
- Ajout d'une version produit SemVer explicite pour l'Agent (`1.0.1`) tout en conservant ses versions techniques d'assembly existantes (`1.0.1.1`).
- Ajout d'une version produit explicite aux installateurs/outils qui suivent directement un composant : installateur Serveur `0.90.1`, installateur Agent `1.0.1`, générateur de licences `0.1.0`.
- Les scripts de seed MySQL et SQL Server portent encore historiquement l'étiquette `0.90.001`. Dans la nouvelle convention, cette valeur se lit `0.90.1`; leurs prochains changements devront utiliser l'écriture canonique sans zéro de tête.
- Aucune migration de données n'a été introduite par ce lot de versioning.
- Les attributs .NET techniques à quatre composantes restent distincts de la version produit SemVer lorsqu'ils sont déjà utilisés par les projets historiques.

## Baseline de référence — 2026-08-27

Cette section fixe le **point de départ du changelog** à partir de l'état réel de `dev` au moment de sa création. Elle ne prétend pas reconstituer toutes les anciennes releases du produit.

### Versions constatées / formalisées

| Composant | Version produit de référence | Source / remarque |
| --- | --- | --- |
| Web | `0.90.1` | `website/package.json` |
| Serveur d'interrogation | `0.90.1` | `AssemblyInformationalVersion`; les métadonnées d'assembly à 4 composantes restent techniques |
| Agent Windows | `1.0.1` | version produit SemVer ajoutée à partir de la version technique existante `1.0.1.1` |
| Installateur Serveur | `0.90.1` | suit la version du Serveur qu'il distribue |
| Installateur Agent | `1.0.1` | suit la version de l'Agent qu'il distribue |
| Générateur de licences | `0.1.0` | outil interne versionné indépendamment |
| Seeds BDD MySQL / SQL Server | `0.90.1` canonique | les fichiers existants portent encore le libellé historique `0.90.001`; pas de réécriture des gros seeds dans ce lot documentaire |
| Installateur de prérequis Serveur | non versionné fonctionnellement | utilitaire de prérequis; sa version d'assembly par défaut n'est pas considérée comme une version produit VigiSensys |
| Fichier de licence `.vtlic` | non applicable | le fichier de licence n'est pas une release logicielle autonome |

### Évolutions récentes présentes dans cette baseline

#### Métrologie — Étalonnage

Les derniers lots intégrés avant cette baseline ont notamment :

- séparé la prévisualisation de lecture du démarrage réel de l'étalonnage ;
- mis en avant l'étalon dans les mesures et simplifié l'interface d'historique ;
- permis d'ajouter/rechercher une sonde depuis le workflow ;
- autorisé l'interrogation d'une sonde non affectée à un lieu, cas attendu pour l'étalon ;
- désactivé la navigation de métrologie pendant une opération active ;
- corrigé le retour à la sélection après une session terminée ;
- harmonisé l'affichage des mesures/résultats à trois décimales ;
- ajouté un détail des calculs d'étalonnage pour faciliter les audits terrain (moyennes, erreur d'exactitude, écarts-types et contributions d'incertitude).

Détails terrain : `website/docs/metrology-retours-26-08-2026.md` et `website/docs/backlog-retours-17-08-2026.md`.

#### Métrologie — Ajustage

Les derniers lots intégrés avant cette baseline ont notamment :

- rendu les coefficients A/B/C visibles dès la sélection des sondes, avant le démarrage de l'ajustage ;
- limité leur affichage à trois décimales pour rester cohérent avec l'étalonnage ;
- conservé la précision brute des coefficients non modifiés lors d'une validation, afin qu'un simple affichage arrondi ne tronque pas silencieusement une valeur existante.

Les autres retours Ajustage encore prévus doivent rester documentés dans le backlog et apparaître ici seulement lorsqu'ils feront partie d'un lot livrable.

## Comment rédiger les prochaines entrées

Pour chaque future livraison, créer une section datée et indiquer au minimum :

1. les composants dont la version change, avec `ancienne → nouvelle` ;
2. les changements visibles ou fonctionnels, rédigés en termes compréhensibles ;
3. les corrections importantes et leur impact ;
4. les migrations de BDD, de configuration ou d'installation éventuelles ;
5. les contraintes de compatibilité réellement testées ;
6. les PR principales permettant de retrouver le détail technique.

Ne pas déclarer une compatibilité minimale ou une migration comme acquise si elle n'a pas été vérifiée.