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

- État intégré courant : **Web 1.8.15**, **Serveur / installateur 1.1.1**, **BDD 0.91.1**, **Agent 1.0.1**.
- Le parcours d’acquittement depuis Surveillance ouvre directement l’analyse du lieu : liste des alarmes à gauche, acquittement dans le bandeau sélectionné, dialog commentaire compacte et sélection multiple avec résumés.
- Une alarme acquittée reste temporairement visible et grisée dans la liste jusqu’au rafraîchissement, afin de conserver le contexte de traitement de l’opérateur.
- L’analyse d’alarme se limite désormais à la période réelle de l’alarme, sans sélection de période ni Audit ; l’impression et les exports multiples sont remplacés par un XLSX unique avec la courbe intégrée dans la présentation lorsqu’elle existe.
- Administration > Paramètres est réorganisée par onglets afin de séparer les réglages généraux, sécurité, alarmes/notifications et services.
- Toute modification réelle de la configuration SMTP invalide sa confirmation et exige désormais la saisie d'un code reçu par email via la nouvelle configuration avant que les emails métier puissent repartir.
- L'activation globale du Mailing est déplacée sur la card SMTP ; le guide reste disponible même lorsque le service est désactivé.
- La création/édition d'un lieu affiche et valide désormais la plage de mesure de la sonde sélectionnée avant l'envoi ; les erreurs de consigne hors plage ne sont plus masquées derrière un générique « Validation impossible ».
- La création/édition d'un lieu sépare désormais fréquence de mesure et temporisation de redéclenchement dans une card dédiée, réorganise les consignes et affiche en temps réel un aperçu animé des pré-alarmes, tolérances effectives et retards d'alarme.
- Des **seuils critiques haut/bas** optionnels sont ajoutés : ils doivent rester plus extrêmes que les seuils normaux et déclenchent immédiatement une alarme haute/basse, sans attendre le retard normal. Les sondes interrogées par le Serveur utilisent le moteur C# ; les GSO conservent leur moteur BDD via les triggers MySQL / SQL Server mis à jour.
- L'affichage des EMT et valeurs métrologiques dérivées passe par le helper numérique canonique afin d'éviter les flottants à rallonge, et le nom d'un lieu affiche désormais explicitement sa limite de 30 caractères avec compteur restant.
- La migration **BDD 0.91.0** est requise avant le Web 1.2.0 afin de créer les colonnes de seuils critiques ; le Serveur 1.1.0 conserve un fallback de lecture des anciens schémas mais la fonctionnalité complète nécessite BDD 0.91.0.
- Le Dashboard Admin Web 1.3.0 simplifie son dock aux pages principales, rend la card Sauvegarde système consultable avec son journal, limite le compteur d'acquittements aux 7 derniers jours et expose les étalonnages arrivant à échéance sous 15 jours.
- Les cards du Dashboard Admin sont harmonisées en hauteur et la gestion des templates de lieu reste accessible directement depuis la création d'un lieu, sans encombrer le dock global.
- La connexion Web 1.4.0 ajoute l'affichage/masquage du mot de passe et l'avertissement Caps Lock.
- L'Audit trail Web 1.4.0 passe sur une pagination serveur jusqu'à 1000 lignes par page, localise les libellés connus, reconnaît notamment `GRPH` et corrige les accents historiques.
- Les emails d'alarme réellement envoyés sont maintenant tracés avec le code `MAIL`, l'`Id_Lieu` et leur événement (déclenchement, fin, acquittement), ce qui les rend visibles dans l'audit global comme dans celui du lieu.
- Le suivi métrologique Web 1.4.1 affiche par défaut les échéances de prochain étalonnage de la plus proche à la plus lointaine, avec les échéances absentes en fin de tableau.
- Le Web 1.5.0 ajoute une page **Hotline & aide** orientée utilisateur, avec guide des concepts VigiSensys, procédures courantes et contact MC2 via téléphone/email avec modèle de demande prérempli.
- Le Web 1.6.0 fait passer les mini/grands graphiques de Surveillance sur des fenêtres temporelles réelles de 24 h et ajoute un downsampling serveur plafonné à 600 points pour les longues périodes, sans réduire le tableau historique paginé.
- Le Web 1.7.0 retire les impressions et harmonise les exports : PDF + Excel pour les tableaux simples, Excel enrichi uniquement pour les vues complexes, avec intégration des courbes dans les onglets Présentation concernés.
- Le Web 1.8.0 ajoute la colonne **Groupe** triable à la page Alarmes et inclut les groupes des lieux dans la recherche globale et les exports du tableau.
- Le Web 1.8.1 corrige les liens du Dashboard Admin One / Pack afin de toujours conserver le préfixe de locale (`/fr` ou `/en`).
- Le Web 1.8.2 rétablit la création/modification des lieux pour Pack/One hors champs EMT et ouvre la Messagerie aux quatre éditions, tout en conservant les droits utilisateur et le toggle global.
- Le Web 1.8.3 corrige les liens du bandeau d'alarmes du dashboard utilisateur afin de conserver la locale active et les routes traduites.
- Le Web 1.8.4 fiabilise la détection des familles/types lors des imports de sondes à partir des préfixes de série et corrige le retour vers Administration > Sondes.
- Le Web 1.8.5 applique conjointement les restrictions Sites / Groupes, grise les groupes non autorisés dans les filtres Surveillance et empêche leur réapparition dans l'Arborescence.
- Le Web 1.8.6 réaffiche le dock sur le Dashboard Admin et ses sections principales, et sépare l'état de la sauvegarde principale de la copie secondaire Robocopy avec diagnostic par code.
- Le Web 1.8.7 corrige le décalage horaire des mesures dans Surveillance, les graphes et le tableau historique en préservant les `DATETIME` sans fuseau via le helper date canonique.
- Le Web 1.8.8 corrige la frontière Prisma des `DATETIME` : bornes de graphes/acquittements sans décalage et sérialisation des cards adaptée à MariaDB / SQL Server.
- Le Web 1.8.9 met le lieu au premier plan sur les cards Surveillance, renforce le signal visuel des alarmes et remplace le compteur « critiques » par « alarmes en cours ».
- Le Web 1.8.10 ajoute un template dédié aux déclenchements de seuils critiques, restaure la dernière valeur réelle dans les emails de fin de non-réponse et clarifie les destinataires globaux des notifications email.
- Le Web 1.8.11 accélère les transitions et le zoom des graphes d’acquittement, borne le dézoom à la période réelle de l’alarme et conserve le comportement des graphes Surveillance standards.
- Le Web 1.8.12 stabilise la preview Consignes, aligne les pré-alarmes sur les seuils effectifs EMT, rend la temporisation plus lisible et signale immédiatement les configurations incohérentes.
- Le Web 1.8.13 fiabilise la présélection du profil dans l'édition utilisateur, conserve un profil archivé déjà affecté et élargit la modal sur desktop tout en restant responsive.
- Le Web 1.8.14 remplace le J+15 codé en dur de la card Métrologie Admin par `DASHBOARD / ETALONNAGE_WARNING_DAYS`, avec fallback historique J+15 et affichage identique en Standard / Expert.
- Le Web 1.8.15 ignore les lignes de sauvegarde sans message et renforce le parsing bilingue FR/EN du journal Admin, notamment les marqueurs de processus, erreurs et succès 7zip.
- Le Serveur 1.1.1 corrige un verrou série imbriqué pouvant bloquer durablement les lectures d'ajustage/étalonnage après une interrogation asynchrone ; l'arbitrage global avec la Surveillance reste inchangé.
- La BDD 0.91.1 aligne MySQL / SQL Server : les valeurs numériques de `t_lieu_template` utilisent `FLOAT` et le trigger GSO n'applique plus directement les seuils critiques.

## Livraison VigiSensys 1.0.0 — 2026-09-18

Cette livraison marque la première version produit considérée comme finalisée de **VigiSensys**. Elle consolide les travaux réalisés depuis la baseline documentée du 27/08/2026 et les retours terrain traités jusqu'au 18/09/2026.

Les composants restent versionnés indépendamment conformément à la convention du dépôt : le numéro produit **VigiSensys 1.0.0** ne force pas artificiellement les composants inchangés à adopter le même numéro.

### Versions des composants

| Composant | Version livrée | Compatibilité / remarque |
| --- | --- | --- |
| Web | `1.0.0` | première version Web finalisée ; MySQL et SQL Server supportés |
| Serveur Windows | `1.0.0` | intègre les derniers correctifs protocolaires, métrologie, SEF et dispatch Web |
| Installateur Serveur | `1.0.0` | suit le Serveur distribué |
| Agent Windows | `1.0.1` | inchangé dans cette release |
| Installateur Agent | `1.0.1` | suit l'Agent distribué, inchangé |
| BDD / seeds | `0.90.2` | schéma de référence ; migrations MySQL / SQL Server formalisées |
| Générateur de licences | `0.1.0` | inchangé ; format de licence conservé |

### Surveillance, alarmes et audit

- Les parcours d'acquittement conservent désormais le contexte du lieu et de l'alarme ; les vues multi-alarmes restent disponibles lorsque les droits et le contexte le permettent.
- Les détails d'audit Surveillance ont été humanisés afin de masquer les métadonnées techniques inutiles et d'afficher clairement les commentaires d'acquittement.
- Les cartes Surveillance utilisent un indicateur batterie compact, cohérent avec le RSSI, avec valeur réelle au survol et états faible / critique.
- Les tests de sondes des Outils s'appuient sur les mesures réellement produites par VigiSensys Serveur au lieu d'un moteur de simulation Web.
- La file persistante des emails d'alarme est préservée lors de l'acquittement et la Santé système expose maintenant un audit unifié des envois email.

### Métrologie

- Les workflows Ajustage / Étalonnage ont été consolidés : acquisitions par plateau, affichage et synchronisation des coefficients, erreurs de démarrage explicites et rollback des configurations GSP partielles.
- Les coefficients GSP sont relus depuis le matériel sans écrasement automatique ; les valeurs GSO affichées pendant l'ajustage reflètent les coefficients courants tout en conservant le signal brut pour les calculs.
- Les opérations disposent de rapports PDF et d'exports ZIP, y compris pour plusieurs étalonnages historiques.
- Les imports d'ajustage acceptent désormais les sondes sans module et les affectations multi-modules, sans déclencher implicitement une communication matérielle.
- Les étalons SEF historiques sont pris en charge directement via les convertisseurs Sollae TCP, sans dépendre d'ezVSP ou d'un port COM virtuel.

### Administration

- La page Paramètres a été fiabilisée : sauvegarde explicite des réglages, cohérence des règles de mot de passe, paramètres SMTP et valeurs historiques nettoyées.
- Un guide SMTP intégré couvre notamment Gmail / mots de passe d'application et Microsoft 365 / SMTP AUTH.
- Le Dashboard Admin expose une **Santé système** détaillée : Web, Serveur, bases principale / mesures / conversation, versions, machine, uptime et sauvegardes.
- Des cards **Mailing** et **Téléphonie** synthétisent l'activation et la complétude de leur configuration sans exposer de secret.
- La Santé système inclut un audit des emails envoyés, en attente ou en échec.
- La configuration d'un lieu peut être dupliquée depuis la liste des lieux ou utilisée comme base lors d'une nouvelle création, sans copier l'identité matérielle ni l'état runtime.

### Authentification et sécurité

- La première connexion dispose d'un onboarding dédié et conserve un écran de transition jusqu'à la finalisation de la session.
- Les règles de mot de passe sont appliquées de manière cohérente à la création utilisateur et aux différents parcours de changement / réinitialisation.
- La fondation Better Auth est intégrée en mode opt-in avec coexistence du parcours JWT historique ; l'installateur Web sait générer et renseigner sa configuration.
- La réinitialisation de mot de passe traite correctement les échecs de livraison SMTP et conserve une réponse publique neutre afin de ne pas révéler l'existence d'un compte.
- Les liens envoyés par email sont localisés ; le footer expose les pages **Mentions légales** et **Protection des données**, adaptées au fonctionnement on-premise.
- L'installation SQL Server force désormais l'encodage UTF-8 pour éviter les autorisations/libellés accentués corrompus et sait réparer les anciennes valeurs identifiées.
- Les JWT d'accès et de rafraîchissement embarquent désormais les autorisations réelles du profil ; les endpoints Santé système et Audit email réutilisent le droit existant `DASHBOARD_ADMIN_ACCESS` et savent migrer une ancienne session dont les claims étaient vides.

### Téléphonie

- Twilio est le provider recommandé pour la V1 des appels vocaux ; le PoC REST HTTPS, les tests de connexion/appel et le fallback des comptes Trial sont intégrés.
- La documentation de mise en service Twilio couvre les prérequis réseau, la sécurité, la numérotation et la cible production / DTMF.
- OVHcloud Click2Call reste documenté et Asterisk/SIP est disponible comme option avancée ou on-premise.
- Les fonctions Téléphonie sont protégées par l'option de licence correspondante côté API et interface.

### Serveur et protocoles matériels

- Les trames binaires IC / IP / IH préservent désormais tous les octets de mesure ; la conversion platine des sondes IP a été restaurée.
- Les commandes GSP `ECON` sont découpées sans dépasser la limite de 60 caractères du firmware/module.
- Les GSP dont la configuration est marquée dirty peuvent être synchronisées avant leur première mesure de Surveillance.
- Les séquences série `+++` parasites et les acquittements `ECON *=ovf` sont gérés explicitement.
- L'URL Web utilisée par le Serveur pour le dispatch des alarmes est normalisée et validée, y compris pour les anciennes configurations `IP:port`.

### Base de données, installation et fondations Web

- Les migrations des installations existantes sont formalisées pour MySQL et SQL Server ; la révision de schéma reste `0.90.2`.
- Les seeds incluent la colonne de synchronisation métrologie et les tables préparatoires Better Auth, sans activer automatiquement ce runtime.
- Les libellés français des seeds ont été nettoyés et les deux moteurs restent alignés.
- Le Web centralise désormais l'affichage des dates et des nombres dans des helpers testés, en conservant la sémantique des `DATETIME` sans fuseau.
- La roadmap d'architecture, les règles de développement et les frontières de métrologie / authentification / téléphonie ont été documentées pour faciliter les évolutions suivantes.

### Finalisation 1.0.0

- Les routes publiques localisées **Mentions légales** et **Protection des données** disposent d'un fallback physique en plus du routage `next-intl`.
- Le shell utilisateur utilise une hauteur viewport bornée et un seul conteneur scrollable : le footer ne crée plus de double scrollbar sur Surveillance.
- Sur les pages Administration, le footer réserve désormais l'encombrement du dock flottant afin que la version et les liens légaux ne passent plus derrière la navigation.
- La modale de changelog suit directement la version Web canonique au lieu d'un ancien numéro `0.3.7` codé en dur.
- Le contrôle d'accès de Santé système / Audit email est corrigé : aucune nouvelle autorisation n'est requise, les droits du profil sont maintenant propagés dans les tokens signés avec fallback BDD pour les anciennes sessions.

### PR structurantes

- Fondations / versioning / formatage : #60, #63, #73, #75, #77, #78, #79, #80, #81.
- Métrologie : #67, #70, #71, #97, #103, #107, #110, #111, #113, #114, #116, #117.
- Authentification / sécurité / installation : #72, #74, #82, #90, #92, #101, #105, #121, #122, #124.
- Téléphonie : #83, #84, #85, #94, #95, #96, #128.
- Surveillance / alarmes / administration : #86, #87, #100, #112, #115, #123, #125, #126, #127, #128, #129.
- Serveur : #61, #62, #69, #98, #99, #110, #119, #120.

[Détail du Web](website/CHANGELOG.md) · [Détail du Serveur](Vigitemp%20Serveur/CHANGELOG.md) · [Détail BDD](db/CHANGELOG.md)

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

- Support du protocole GSP `ECON` étendu pour les coefficients métrologiques embarqués dans les sondes GSP.
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
