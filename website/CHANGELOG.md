# Changelog — VigiSensys Web

Ce fichier décrit les évolutions propres à l'application Web VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Les versions suivent `MAJOR.MINOR.PATCH` sans zéros de tête. La source de version du Web est `website/package.json`.

## [Unreleased]

Aucun changement supplémentaire documenté depuis la préparation de la version Web 1.8.10.

## [1.8.10] — 2026-09-24

Cette version fiabilise les emails d'alarme et clarifie les libellés de destinataires dans Administration > Paramètres.

### Seuils critiques

- Un déclenchement H/B dont la valeur dépasse un **seuil critique actif** utilise désormais un template d'email dédié, distinct du template d'alarme standard.
- Le template met en avant le seuil critique, la valeur mesurée, le sens haut/bas, le lieu, la sonde, l'heure et la courbe disponible.
- La détection conserve les types métier historiques `H` / `B` et applique les mêmes comparaisons strictes que le Serveur : `>` pour le seuil critique haut et `<` pour le seuil critique bas.
- Le sujet devient explicitement **SEUIL CRITIQUE DÉPASSÉ** / **CRITICAL THRESHOLD EXCEEDED**.

### Fin de non-réponse

- Les emails de fin d'alarme `N` ne forcent plus « Dernière valeur : N/A ».
- Le Web recharge la dernière mesure valide non nulle du lieu depuis `tm_mesures`, postérieure au début de l'alarme, et utilise sa valeur/unité/date dans l'email.
- Si aucune mesure valide n'est disponible, le fallback `N/A` historique reste conservé.

### Paramètres / i18n

- Les formulations « emails système » sont remplacées par **destinataires globaux** / **global recipients** dans l'onglet Alarmes & notifications.
- Le helper SMTP parle désormais de **notifications automatiques** au lieu d'« emails système ».
- Les libellés anglais encore restés en français dans le template générique d'alarme sont corrigés.
- Un test ciblé couvre la détection des seuils critiques, le rendu du nouveau template et le contrat de récupération de la mesure de reprise.

### Compatibilité

- Version Web : **1.8.10**.
- Serveur **1.1.1**, Agent **1.0.1** et BDD **0.91.1** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.9] — 2026-09-24

Cette version clarifie la hiérarchie visuelle et la signalétique des cards Surveillance.

### Cards Surveillance

- Le nom du **lieu** devient l'identifiant principal de la card : il est affiché en premier, plus grand et plus marqué.
- Le numéro de série de la **sonde** passe en second plan avec une taille plus compacte.
- Le point d'alarme du header utilise désormais un halo blanc et une pulsation expansive afin de rester immédiatement visible sur les fonds rouge, bleu ou noir.
- Les compteurs et filtres correspondant aux alarmes actives utilisent le libellé métier **« alarmes en cours »** / **« alarms in progress »** au lieu de « critiques » / « critical ».
- Le statut technique interne `critical` et les contrats API restent inchangés.

### Compatibilité

- Version Web : **1.8.9**.
- Serveur **1.1.1**, Agent **1.0.1** et BDD **0.91.1** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.8] — 2026-09-23

Cette version corrige la seconde moitié du problème de fuseau des `DATETIME` historiques : la frontière Prisma/driver utilisée pour les lectures et les filtres SQL.

### Plages de graphes et acquittements

- Une plage UI terminant à `15:00` filtre désormais les mesures jusqu'à `15:00` en base, au lieu de pouvoir devenir `13:00` en heure d'été.
- `GET /api/mesures/[idLieu]` utilise un wrapper Prisma provider-aware pour les bornes `startDate` / `endDate`.
- `GET /api/alarmes/range` utilise le même contrat pour les graphes et marqueurs d'alarmes.
- L'analyse d'acquittement récupère des dates d'alarme correctement sérialisées avant de construire sa plage de mesures.

### Cards Surveillance / alarmes

- Les `Date` Prisma sont sérialisées selon le provider :
  - MariaDB : composantes locales du `DATETIME` ;
  - SQL Server/node-mssql : composantes UTC du wrapper `Date`.
- Une mesure MySQL stockée à `13:36` reste donc `13:36` sur la card, au lieu de devenir `11:36`.
- L'API paginée Surveillance, le dashboard serveur et les APIs Alarmes utilisent désormais le bridge serveur `serializePrismaStoredDbDateTime`.

### Helper date / provider SQL

- Ajout du bridge pur provider-aware dans `date-display.ts`.
- Ajout des wrappers serveur `serializePrismaStoredDbDateTime` et `toPrismaStoredDbDateTime` dans `sql-provider.ts`.
- Aucun changement global de timezone de connexion n'est appliqué : les triggers SQL et les vrais instants techniques conservent leur contrat existant.
- Les tests couvrent explicitement Europe/Paris en heure d'été, MariaDB et SQL Server.

### Compatibilité

- Version Web : **1.8.8**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.1** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.7] — 2026-09-23

Cette version corrige les décalages horaires des mesures dans Surveillance.

### Surveillance / mesures

- Les dates des mesures sont désormais interprétées comme des `DATETIME` stockés sans fuseau sur les cards Surveillance, les graphes détaillés et le tableau des mesures.
- Une valeur stockée à `10:36:17` reste affichée à `10:36:17`, même si un objet `Date` Prisma a traversé JSON sous la forme `...10:36:17.000Z`.
- Les tooltips, axes temporels, tris chronologiques et exports de la superposition de courbes réutilisent le helper date canonique avec la sémantique « stored DATETIME ».
- Les dates d'activation/désactivation de Surveillance et d'alarmes renvoyées par l'API paginée sont sérialisées avec `serializeStoredDbDateTime`.
- Le cache des mesures n'utilise plus `Date.parse()` directement pour trier les timestamps.
- L'endpoint historique `/api/tableau-de-bord/measurements` est aligné sur la même sérialisation.

### Helper date

- Ajout de `parseStoredDbDateTime` et `formatStoredDbDateTime` dans `date-display.ts`.
- `formatStoredDbDateTime` ignore volontairement l'option `timeZone` afin de ne jamais convertir une heure murale déjà stockée en base.
- Les chaînes ISO avec `Z` ou offset explicite issues d'un `DATETIME` stocké conservent leurs composantes écrites au lieu d'être converties comme des instants UTC.
- Les tests couvrent l'heure d'été Europe/Paris et le cas de régression +2 h.

### Compatibilité

- Version Web : **1.8.7**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.6] — 2026-09-23

Cette version améliore la navigation Administration et distingue la sauvegarde principale de sa copie secondaire.

### Navigation Administration

- Le dock de navigation Admin est désormais visible sur le Dashboard Admin `/admin`.
- Il reste visible sur les pages principales du dock et leurs sous-pages : Sondes, Modules, Actionneurs, Groupes, Lieux, Sites et Outils.
- Les pages Admin hors de ce menu (Paramètres, Audit, Métrologie, Santé système, etc.) conservent leur comportement actuel.
- L'élément actif du dock reste cohérent sur les sous-pages d'une section.

### Sauvegarde système

- La card affiche désormais deux états indépendants :
  - **Sauvegarde principale** ;
  - **Copie secondaire** via Robocopy lorsqu'un répertoire secondaire est configuré.
- Un échec de copie secondaire n'écrase plus l'état de la sauvegarde principale.
- Le répertoire secondaire est détecté à partir de la ligne de configuration du journal ; une valeur vide `""` est affichée comme **Non configurée**.
- Les erreurs FR/EN sont reconnues (`ERREUR`, `ERROR`, ainsi que `FAILED` / `FAILURE`).
- Les codes Robocopy `0–7` sont considérés comme non bloquants ; les codes `>= 8` sont considérés comme des échecs.
- La card affiche un message explicite pour chaque code Robocopy `0–16`.
- La fenêtre détaillée du journal n'est pas modifiée.

### Compatibilité

- Version Web : **1.8.6**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.5] — 2026-09-23

Cette version fiabilise l'application des restrictions Sites / Groupes dans Surveillance.

### Droits de visibilité

- Lorsqu'un utilisateur possède à la fois des sites et des groupes affectés, les deux dimensions sont désormais appliquées ensemble : un lieu doit appartenir à un **site autorisé ET à au moins un groupe autorisé**.
- Avec uniquement des sites affectés, les groupes de ces sites restent accessibles.
- Avec uniquement des groupes affectés, seuls les lieux appartenant à ces groupes restent accessibles, quel que soit leur site.
- Sans site ni groupe affecté, le comportement historique reste inchangé : tous les lieux sont visibles.

### Filtres Surveillance

- Les groupes présents dans le périmètre des sites mais non affectés à l'utilisateur restent visibles dans le sélecteur **Groupes**, mais sont grisés et non sélectionnables.
- Un filtre non autorisé conservé dans le localStorage est automatiquement retiré.
- L'API paginée réapplique systématiquement le scope utilisateur, y compris lorsqu'un filtre Site ou Groupe explicite est envoyé.

### Arborescence

- Les métadonnées de groupes renvoyées avec les lieux sont limitées aux groupes réellement autorisés pour l'utilisateur.
- Un lieu multi-groupes autorisé via un groupe ne peut donc plus réapparaître sous un autre groupe non autorisé dans l'Arborescence.
- Les compteurs de l'Arborescence suivent le même filtrage.

### Compatibilité

- Version Web : **1.8.5**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.4] — 2026-09-22

Cette version fiabilise la détection des types de sondes lors de l'import d'ajustages/calibrages et corrige le retour vers l'administration des sondes.

### Import de sondes

- La famille est désormais déterminée en priorité par le début du numéro de série : `SO...` pour GSO, `SP...` pour GSP et `E/G/H/I/R/V...` pour les sondes classiques.
- Les anciennes références classiques telles que `IN...` et `IEE...` sont donc rattachées au type classique `I` au lieu d'être interprétées comme un type spécifique inconnu.
- Pour GSO/GSP, le code détaillé est conservé lorsqu'il existe dans `t_sonde_type`, par exemple `SOIT`, `SOIH`, `SPNB` ou `SPFP`.
- Les anciens types agrégés `GSO` et `GSP` (IDs historiques 7 et 8) sont ignorés par le flux d'import ; ils ne sont pas supprimés de la BDD dans ce lot.
- La même résolution d'identité reste partagée par les imports d'ajustage et d'étalonnage.

### Navigation

- Le bouton **Retour aux sondes** de l'import d'ajustage pointe désormais vers la route canonique `/admin/sondes`.
- Avec next-intl, la navigation produit `/fr/admin/sondes` en français et `/en/admin/sensors` en anglais.

### Compatibilité

- Version Web : **1.8.4**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.3] — 2026-09-22

Cette version corrige les liens vers la page Alarmes depuis le header du dashboard utilisateur.

### Dashboard utilisateur

- Le bandeau d'alarmes actives du header utilise désormais la route canonique `/alarmes` au lieu du chemin relatif `alarmes`.
- Le wrapper de navigation next-intl conserve donc systématiquement la locale active : `/fr/alarmes` en français et `/en/alarms` en anglais.
- Les deux variantes du bandeau (widget principal et bannière historique) sont couvertes.
- Un test dédié vérifie le contrat de navigation localisée afin d'éviter le retour d'un lien relatif.

### Compatibilité

- Version Web : **1.8.3**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.2] — 2026-09-22

Cette version corrige deux restrictions de licence incorrectes pour les éditions Pack et One.

### Lieux — Pack / One

- Les formulaires de création et modification n'envoient plus les champs métrologiques réservés à Standard/Expert lorsque la licence active est Pack ou One.
- La correction couvre Administration > Lieux ainsi que l'édition d'un lieu depuis Surveillance.
- Les protections API restent strictes : un appel direct qui tente d'envoyer des champs EMT avec Pack/One reçoit toujours un refus de licence.
- Les champs métier standards du lieu (nom, sonde, groupes, consignes, retards, planning, etc.) restent disponibles selon les droits utilisateur.
- L'onglet **Mailing** du formulaire Lieu n'est plus lié à la licence Métrologie : il est disponible sur One/Standard/Expert et sur Pack lorsque l'option mail est présente.

### Messagerie — toutes éditions

- La Messagerie inter-utilisateurs est désormais disponible pour Pack, One, Standard et Expert.
- Le garde serveur Chat vérifie toujours la validité de la licence mais ne restreint plus l'édition.
- Le paramètre `messaging:enabled` n'est plus classé Standard-only et peut être lu/modifié sur Pack/One par un utilisateur autorisé.
- La sidebar conserve le contrôle de permission `CONVERSATION_ACCESS` ; l'accès reste également conditionné au toggle global Messagerie.
- La matrice de licences et la page Upgrade sont alignées avec cette nouvelle règle.

### Compatibilité

- Version Web : **1.8.2**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.8.1] — 2026-09-22

Cette version corrige la navigation du Dashboard Admin pour les licences One / Pack.

### Dashboard Admin

- Les cards de navigation du dashboard basique utilisent désormais le `Link` localisé fourni par `@/i18n/navigation` au lieu de `next/link`.
- Les URLs générées conservent donc systématiquement le préfixe de locale : `/fr/admin/...` ou `/en/admin/...`.
- Les routes anglaises localisées restent prises en compte, par exemple `/en/admin/sensors`, `/en/admin/groups`, `/en/admin/locations` et `/en/admin/tools`.
- Aucun changement de droits, licence ou destination fonctionnelle des cards n'est introduit.

### Compatibilité

- Version Web : **1.8.1**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.

## [1.8.0] — 2026-09-22

Cette version enrichit le tableau principal des Alarmes avec l'appartenance des lieux aux groupes.

### Page Alarmes

- Une nouvelle colonne **Groupe** est affichée entre les consignes et la date de déclenchement.
- Un lieu appartenant à plusieurs groupes affiche tous ses groupes, dédupliqués et triés alphabétiquement.
- La colonne Groupe est triable avec le comportement TanStack existant.
- La barre de recherche de la page recherche désormais simultanément le nom du lieu, la sonde, les groupes et le statut.
- Les exports PDF / Excel du tableau incluent automatiquement la nouvelle colonne Groupe.
- Les groupes sont chargés dans le `select` Prisma existant avec les alarmes ; aucune requête métier supplémentaire par ligne n'est ajoutée.
- `Location.siteGroup` n'est pas détourné : la donnée utilise exclusivement `Location.groupNames`, afin de préserver la sémantique historique de `siteGroup` dans les autres écrans.

### Compatibilité

- Version Web : **1.8.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.7.0] — 2026-09-22

Cette version harmonise les fonctions d'impression et d'export du Web autour de formats bureautiques cohérents.

### Politique d'export

- Les boutons et actions **Imprimer** sont retirés des écrans applicatifs.
- Le tableau générique ne propose plus l'export CSV ni l'option d'impression.
- Les tableaux simples exportables proposent désormais **Excel (.xlsx)** et **PDF** par défaut.
- Les écrans complexes regroupant plusieurs blocs, graphiques ou synthèses utilisent un **export Excel unique** plutôt qu'une combinaison impression / CSV / image / PDF.

### Tableaux simples

- Audit trail : export PDF ou Excel, sans impression.
- Historique des acquittements d'alarmes : export PDF ou Excel, sans CSV.
- Les tableaux basés sur `TanStackTable` héritent de la même politique par défaut.
- Le tableau de mesures d'un lieu conserve un export PDF du tableau et un export Excel enrichi multi-onglets.

### Écrans complexes

- **Analyse d'alarme par lieu** : le comportement déjà présent est conservé — un XLSX unique avec résumé et courbe intégrée dans le premier onglet **Présentation**, puis les mesures complètes dans l'onglet dédié.
- **Analyse d'impact** : les anciens exports CSV / image / PDF et l'impression sont remplacés par un XLSX unique ; l'onglet Présentation contient le résumé des tolérances et la courbe, l'onglet Alarmes regroupe les alarmes simulées et réelles.
- **Superposition de courbes** : l'impression et le CSV sont remplacés par un XLSX avec la courbe dans Présentation et les valeurs de chaque lieu dans le second onglet.
- **VigiLog — détail d'une tournée** : l'export CSV isolé est remplacé par un XLSX avec résumé et courbe dans Présentation puis les mesures importées dans le second onglet.
- Les sous-tableaux de l'Analyse d'impact ne proposent plus d'exports indépendants : l'export reste centralisé au niveau de l'analyse complète.

### Prévention des régressions

- Un test dédié parcourt les sources Web et refuse le retour d'un bouton d'impression, de l'ancienne option `enablePrint` ou d'un export CSV utilisateur.
- Le même test vérifie les formats attendus des tableaux simples et la présence des exports Excel enrichis avec courbe sur les vues complexes concernées.

### Compatibilité

- Version Web : **1.7.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.6.0] — 2026-09-22

Cette version améliore la lisibilité et les performances des graphiques de Surveillance.

### Cards Surveillance

- L'identité de la card affiche maintenant le **numéro de série de la sonde** en première ligne et le **nom du lieu** en dessous, au lieu du format concaténé `Lieu - Sonde`.
- Le mini-graphe représente désormais une vraie fenêtre glissante correspondant aux **24 dernières heures** au moment du chargement.
- L'axe X du mini-graphe utilise les horodatages réels : lorsqu'une sonde ne répond plus, la courbe s'arrête à la dernière mesure au lieu d'être artificiellement étirée jusqu'au bord droit.
- Les mini-graphes utilisent `tm_graphique`, cache de mesures récent déjà maintenu par la BDD et purgé au-delà de 72 h, afin d'éviter de solliciter l'historique complet pour chaque card.
- Les points des mini-graphes sont plafonnés à **180** après réduction serveur lorsque la fenêtre 24 h contient davantage de mesures.

### Grand graphique / historique

- À l'ouverture du détail d'un lieu, le graphique affiche par défaut **maintenant - 24 h → maintenant**, au lieu de la journée civile en cours.
- Le sélecteur de dates reste disponible pour analyser une période personnalisée, avec une action permettant de revenir aux 24 dernières heures.
- L'axe X du grand graphique est désormais temporel et borné par la période demandée : les absences de remontée occupent donc leur vraie durée visuelle.
- Pour une période volumineuse, le Web demande une réponse graphique plafonnée à **600 points** ; le nombre total de mesures de la période est conservé et affiché séparément.
- Le downsampling est effectué côté API Web avant l'envoi au navigateur et conserve par tranche les bords, minima, maxima ainsi qu'un point significatif de non-réponse, remontée mémoire ou changement de consigne.
- Les trous de non-réponse ne sont jamais reconnectés artificiellement lorsque la courbe a été réduite.
- Le tableau détaillé reste indépendant et **paginé sur les mesures complètes** : aucune donnée historique n'est supprimée ou moyennée pour les consultations/export tabulaires.
- L'analyse d'impact et l'analyse d'alarme conservent leur chargement pleine résolution existant ; le downsampling est opt-in et réservé aux graphiques concernés.

### API mesures

- `GET /api/mesures/[idLieu]` accepte désormais `graphMaxPoints` avec une plage explicite pour obtenir une représentation graphique réduite.
- La réponse enrichie expose `graphSourceCount`, `graphMeasureCount`, `graphSampled` et les bornes de période lorsque ce mode est utilisé.
- La pagination historique existante reste inchangée et prioritaire lorsqu'elle est demandée.

### Compatibilité

- Version Web : **1.6.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.5.0] — 2026-09-21

Cette version ajoute un guide utilisateur directement accessible depuis la sidebar et centralise le contact avec la hotline MC2.

### Hotline & aide

- Une nouvelle entrée **Hotline & aide** est disponible dans le footer de la sidebar, à côté des Services.
- La page dédiée est localisée en `/fr/aide` et `/en/help` et reste distincte de la console Hotline technique réservée au diagnostic.
- Le guide présente les notions de Site, Groupe, Lieu, Sonde, Surveillance et Alarme afin d'expliquer l'organisation fonctionnelle de VigiSensys.
- Des procédures pas à pas couvrent la mise en surveillance d'une sonde non affectée, l'analyse/acquittement d'une alarme, la désactivation temporaire de la surveillance et la consultation d'un historique.
- Un rappel précise que certaines actions dépendent du profil utilisateur et de la licence active.

### Contact Hotline

- Les coordonnées de support MC2 sont centralisées dans un helper dédié et affichées en bas du guide.
- Le bouton **Nous écrire** ouvre l'application de messagerie du poste avec un sujet et un corps préremplis.
- Le modèle de demande inclut notamment l'établissement, le contact, la version Web VigiSensys, la page concernée, le lieu, la sonde, les étapes de reproduction et le message d'erreur.
- Le guide et le modèle de mail sont disponibles en français et en anglais.

### Compatibilité

- Version Web : **1.5.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- Aucun nouvel appel réseau ou stockage de données n'est introduit par cette page.

## [1.4.1] — 2026-09-21

Cette version affine l'ordre d'affichage du suivi métrologique.

### Métrologie

- Le tableau **Suivi métrologique des lieux** est trié par défaut sur la **Date prochain étalonnage**, de la date la plus proche à la plus lointaine.
- Les lignes sans date de prochain étalonnage restent affichées après les lignes planifiées.
- Le tri manuel des autres colonnes reste disponible via le tableau existant.

### Compatibilité

- Version Web : **1.4.1**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.4.0] — 2026-09-21

Cette version améliore la saisie du mot de passe de connexion et fiabilise l'Audit trail global et par lieu.

### Connexion

- Le champ mot de passe dispose maintenant d'un bouton œil accessible pour afficher / masquer la valeur saisie.
- Un avertissement **Verr. Maj / Caps Lock** apparaît sous le champ dès que le navigateur détecte le verrouillage majuscule pendant la saisie.
- Le moteur d'authentification écrit dans les nouveaux audits uniquement les valeurs canoniques `legacy` ou `new`. Les anciennes valeurs `better-auth-transition` restent interprétées comme `new` à l'affichage.

### Audit trail global

- Les libellés métier, champs de détails, booléens, actions et valeurs connues passent désormais par `next-intl` au lieu de mélanger chaînes françaises/anglaises codées en dur.
- Les accents des libellés d'audit ont été restaurés, notamment pour les tolérances, fréquences, réactivations, événements, créations/désactivations et libellés de codes historiques.
- `GRPH` est désormais reconnu comme **Ouverture d'un graphique / Graph opened** au lieu d'« Action inconnue ».
- Les autres codes présents dans les seeds ou générés par le runtime (`MAIL`, `ALARM_RESOLVED`, `ETAP`, `VLOG`, `FERMSURV`, `IMP`, `PLAN`, `TEL`, `UT`) disposent également d'un libellé i18n.
- Le menu des codes charge l'union du référentiel `tm_journal_code` et des codes réellement observés dans `tm_journal`, afin qu'un nouveau code runtime reste filtrable sans attendre une migration de seed.
- Le menu des codes est plafonné en hauteur, scrollable et présente le code séparément de son libellé pour éviter les lignes trop larges.

### Pagination / volume

- La page Audit n'est plus préchargée avec un tableau figé de 100 événements.
- `GET /api/audit` supporte maintenant une pagination serveur opt-in avec `page`, `limit` et un maximum de **1000 événements par page**.
- Les tailles 200 / 500 / 1000 de la table déclenchent désormais réellement une nouvelle requête serveur ; la navigation Suivant / Précédent charge les pages correspondantes.
- La recherche globale de l'écran est également transmise au serveur pour éviter de filtrer uniquement la page déjà chargée.
- Le format historique non paginé de l'API est conservé pour les consommateurs existants, notamment la card Dashboard Admin.

### Emails d'alarme dans l'audit

- Après un **succès SMTP réel** d'un email d'alarme, la file persistante écrit maintenant un événement `MAIL` dans `tm_journal`.
- L'événement conserve l'`Id_Lieu`, le type `triggered / ended / acknowledged`, le destinataire, le nombre de tentatives et l'utilisation éventuelle des destinataires système.
- Le même événement apparaît donc dans l'Audit global et dans l'Audit du lieu concerné.
- Les trois événements métier sont couverts : **alarme déclenchée**, **fin d'alarme** et **acquittement d'alarme**.
- Les tentatives SMTP échouées ne créent pas de faux audit « envoyé » ; l'écriture `MAIL` intervient uniquement après passage de la notification persistante à l'état `sent`.

### Compatibilité

- Version Web : **1.4.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.3.0] — 2026-09-21

Cette version affine le Dashboard administrateur et simplifie la navigation secondaire de l'espace Admin.

### Navigation Administration

- Le dock d'administration est désormais limité aux pages qu'il représente réellement : Sondes, Modules, Actionneurs, Groupes, Lieux, Sites et Outils.
- Les entrées **Bains & étalons** et **Templates lieux** sont retirées du dock.
- Le dock n'est plus affiché sur les pages secondaires absentes de cette liste, notamment Métrologie, Audit, Santé système, Paramètres et Templates lieux.
- La création d'un lieu conserve son sélecteur de template et propose maintenant un lien direct **Gérer les templates** vers la page dédiée.

### Dashboard administrateur

- Les cards du dashboard standard et simplifié occupent désormais uniformément la hauteur de leur ligne ; les widgets du dashboard Expert utilisent également une hauteur initiale commune.
- La card **Sauvegarde système** est interactive : un clic ouvre une dialog présentant les dernières lignes de `backup_bdd_vigisensys.log`, avec horodatage, état, mise en évidence des erreurs/succès et indication lorsque le journal est tronqué.
- L'API de sauvegarde ne renvoie au Web que les **300 dernières lignes utiles** du journal afin d'éviter de transférer un fichier historique potentiellement volumineux.
- La card **Journal acquittements alarmes** affiche maintenant le nombre d'acquittements des **7 derniers jours calendaires** et conserve le dernier acquittement de cette même période comme information secondaire.
- La card **Métrologie** affiche le nombre de sondes actives dont le dernier étalonnage arrive à échéance entre aujourd'hui et **J+15**. Les sondes déjà expirées ne sont pas mélangées à ce compteur « à prévoir ».
- Le calcul Métrologie utilise uniquement le dernier étalonnage de chaque sonde et une requête SQL agrégée compatible MySQL / SQL Server, sans charger toute la liste des sondes sur le dashboard.
- Le widget Métrologie est de nouveau disponible sur le dashboard Expert avec la même métrique J+15.

### Compatibilité

- Version Web : **1.3.0**.
- Serveur **1.1.0**, Agent **1.0.1** et BDD **0.91.0** restent inchangés par ce lot.
- Aucune migration BDD n'est requise.
- MySQL et SQL Server restent supportés.

## [1.2.0] — 2026-09-21

Cette version étend la configuration des lieux avec des seuils critiques réellement appliqués par le moteur d'alarme et améliore la lisibilité du paramétrage des consignes / EMT.

### Lieux / consignes

- La fréquence de mesure et la **temporisation de redéclenchement** sont sorties du bloc Consignes dans une card dédiée placée juste au-dessus.
- Le bloc Consignes est réorganisé autour d'une consigne centrale et de deux zones haut/bas regroupant seuil normal, retard d'alarme, pré-alarme, seuil effectif et seuil critique.
- Deux limites optionnelles **Seuil critique haut** / **Seuil critique bas** sont disponibles. Lorsqu'elles sont actives, elles doivent être respectivement strictement au-dessus / au-dessous du seuil d'alarme normal réellement utilisé.
- La validation tient compte de la tolérance EMT calculée en temps réel, de la plage min/max du type de sonde et est partagée entre formulaire et API.
- Les templates de lieux transportent également les seuils critiques et leurs flags d'activation.
- Le nom d'un lieu reste limité à 30 caractères ; la limite est maintenant affichée explicitement avec le nombre de caractères restants pendant la saisie.

### Aperçu live des alarmes

- Un mini-graphe se met à jour directement à partir des valeurs du formulaire : consigne, pré-alarmes, tolérances effectives, seuils critiques et retards haut/bas.
- Une fausse courbe illustre la différence de comportement entre un dépassement normal — temporisé avant alarme — et un franchissement critique qui déclenche immédiatement.
- Les valeurs sont représentées par des lignes pointillées et une légende interactive avec curseur d'aide / tooltips.
- Les transitions utilisent Motion et respectent `prefers-reduced-motion`.
- Les tolérances affichées sont recalculées avec `computeEmt()` depuis l'état courant du formulaire : une modification de consigne ou d'EMT est donc reflétée sans nécessiter d'ouvrir l'onglet Métrologie.

### Métrologie / affichage numérique

- Les EMT, erreurs de justesse, incertitudes, dérives et tolérances dérivées affichées dans la fiche lieu passent par `formatNumber`, avec locale applicative et jusqu'à 4 décimales utiles.
- Les valeurs métier restent non arrondies pour les calculs et la persistance ; seul l'affichage est normalisé.

### Compatibilité

- Version Web : **1.2.0**.
- Le Web 1.2.0 nécessite la migration de schéma **BDD 0.91.0** avant démarrage, car le modèle Prisma expose les nouvelles colonnes de seuils critiques.
- Le déclenchement critique des sondes gérées par le service Windows nécessite **Serveur 1.1.0** ; les GSO utilisent les triggers BDD inclus dans la migration 0.91.0.
- MySQL et SQL Server restent supportés.

## [1.1.0] — 2026-09-21

Cette version Web regroupe les évolutions intégrées après la release 1.0.0 : sécurisation de la configuration SMTP, validation explicite des plages de sondes dans les lieux et refonte du parcours d’acquittement/analyse des alarmes.

### Alarmes / acquittement

- Depuis une carte Surveillance, l’action **Acquitter** ouvre directement la page d’analyse de l’alarme et de son lieu au lieu de passer d’abord par la grande popup d’acquittement.
- La page d’analyse retrouve une colonne gauche persistante avec les alarmes non acquittées du lieu et permet la sélection multiple.
- Le bouton **Acquitter** est placé dans le bandeau **Alarme sélectionnée** ; l’acquittement ouvre une petite dialog dédiée au commentaire libre ou pré-existant.
- Après succès, les alarmes restent visibles localement dans la liste, grisées et marquées **Acquittée**, jusqu’au rafraîchissement de la page. Le rafraîchissement recharge ensuite la source serveur et retire les alarmes déjà acquittées.
- Une sélection multiple remplace le graphique par une liste de résumés des alarmes sélectionnées et applique le même commentaire aux acquittements traités séquentiellement.
- L’analyse n’offre plus de recherche/plage historique : le graphique et le tableau utilisent uniquement la période réelle de l’alarme, du début à la fin ou jusqu’à l’instant courant pour une alarme active.
- Le chargement de graphique peut désactiver la limite « journée courante » afin de conserver toute la période d’une alarme longue sans tronquer ses mesures.
- L’onglet Audit, les marqueurs d’audit sur le graphique, l’impression et les exports CSV/PDF/PNG propres à cette page sont supprimés.
- L’export restant est un fichier **XLSX** : feuille Présentation, feuille Mesures et courbe insérée dans Présentation lorsqu’un graphique exploitable existe.
- La permission **ALARM_ACK_ACCESS** reste appliquée ; les caches Surveillance/Dashboard sont invalidés après acquittement sans retirer prématurément les lignes grisées de la page d’analyse.

### Administration / Paramètres

- La page Paramètres est organisée en quatre onglets : Général, Sécurité, Alarmes & notifications et Services.
- La card Configuration Email porte désormais le switch global SMTP_ACTIVATION. Lorsqu'il est désactivé, la configuration et le warning sont masqués mais le guide SMTP reste toujours accessible.
- Le warning SMTP devient destructif/rouge lorsque le service est activé.
- Toute modification réelle de l'hôte, du port, de l'utilisateur, du mot de passe ou de l'expéditeur invalide SMTP_CONFIRME.
- Après enregistrement, VigiSensys envoie un code à 6 chiffres via les nouveaux paramètres SMTP ; la configuration ne redevient utilisable par les emails métier qu'après saisie correcte du code.
- Les codes sont hachés côté serveur, expirent après 10 minutes et sont limités à 5 tentatives. Aucun code en clair n'est persisté.
- Les installations historiques sans paramètre SMTP_CONFIRME conservent leur comportement actuel tant que leur configuration SMTP n'est pas modifiée.
- Le Dashboard Admin distingue désormais une configuration Mailing techniquement complète mais encore non confirmée.

### Lieux / sondes

- Le formulaire de création et d'édition d'un lieu reçoit désormais les bornes Valeur_Min / Valeur_Max du type de sonde sélectionné et affiche sa plage de mesure dans l'onglet Général.
- La même validation de plage est partagée entre le frontend et les APIs POST/PATCH /api/lieux, afin d'éviter toute divergence de règle métier.
- Une valeur hors plage est bloquée avant le POST et l'erreur est associée directement au champ concerné ; l'API renvoie également le premier motif précis au lieu du générique « Validation impossible ».
- Cas terrain verrouillé : une SOET reste limitée à -40 … 125 °C conformément aux données produit du dépôt ; une consigne -80 °C est refusée explicitement au lieu d'échouer sans explication.
- Les plages des sondes disponibles sont chargées par type en une requête batch, sans N+1, et restent compatibles avec les installations où les colonnes de plage historiques sont absentes.

### Compatibilité

- Version Web : **1.1.0**.
- Aucune migration de schéma BDD liée au parcours d’acquittement ou à la validation des plages.
- La révision BDD de référence reste **0.90.2**.
- MySQL et SQL Server restent supportés.

## [1.0.0] — 2026-09-18

Cette version consolide l'ensemble des évolutions Web intégrées depuis la baseline `0.90.2` et constitue la première release Web VigiSensys considérée comme finalisée.


### Authentification / expérience utilisateur

- Première connexion : après le bouton d’accès, l’onboarding reste affiché sous forme d’écran de préparation pendant la finalisation de la session et jusqu’à la redirection, au lieu de laisser réapparaître brièvement le formulaire de connexion.
- Première connexion : après une authentification réussie, VigiSensys affiche un accueil animé puis présente la politique de mot de passe CFR21 avant la redirection vers l’application.
- La première connexion est déterminée côté serveur à partir de `t_utilisateur.Date_Heure_Derniere_Connexion`, sans stockage navigateur ni nouvelle colonne.
- La durée affichée reprend `CFR21 / VALIDITE_MOT_DE_PASSE_JOURS` et respecte `ACTIVATION_EXPIRATION_MOT_DE_PASSE`. Le changement forcé des mots de passe temporaires/expirés et l’avertissement existant à J-7 sont conservés.

### Téléphonie

- Twilio devient le provider recommandé pour la V1 des alarmes vocales : le serveur VigiSensys utilise uniquement l'API REST HTTPS sortante, sans SIP/RTP, VM Linux, Asterisk ni port entrant requis chez le client standard.
- Le provider `TwilioVoiceProvider` utilise directement la Calls API sans ajouter de SDK/dépendance Web ; il prend en charge API Key SID + Secret (recommandé) ou Account SID + Auth Token, le test de connexion et un appel de test avec TwiML inline/TTS `fr-FR`.
- Le bouton **Tester la connexion** valide DNS/HTTPS/authentification et accès à la collection Calls ; **Tester l'appel** appelle un numéro E.164 et retourne le Call SID Twilio pour faciliter le diagnostic et préparer le futur suivi de statut.
- Compte Twilio Trial : si la Calls API refuse les paramètres du chemin production avec l'erreur officielle `trial accounts have limited parameter access`, le test d'appel retente automatiquement une seule fois avec le template TTS Twilio autorisé `voice_text_to_speech`, sans `Twiml` inline ni `Timeout`. Les autres erreurs Twilio ne déclenchent aucun fallback.
- L'interface signale explicitement lorsqu'un appel de test a utilisé le template Trial : ce test valide alors la chaîne VigiSensys → API Twilio → téléphone, mais pas encore le message TTS VigiSensys personnalisé, qui reste le chemin utilisé par les comptes complets.
- La configuration Twilio impose désormais les champs requis selon le mode d'authentification et continue de chiffrer API Key Secret / Auth Token avec le mécanisme `secret-crypto` existant.
- Administration > Paramètres > Téléphonie dispose d'un guide Twilio FR/EN complet couvrant compte client, Trial/production, API Keys, numérotation française compatible appels automatisés, sécurité, tests et diagnostic.
- Le guide Twilio contient une section DSI directement transmissible au client : DNS, HTTPS TCP 443 sortant vers `api.twilio.com`, TLS 1.2/1.3, proxy/inspection TLS et préférence pour le filtrage FQDN ; il rappelle qu'aucun flux entrant, SIP 5060, RTP, NAT ou IP publique dédiée n'est nécessaire en V1.
- La documentation `docs/telephony-twilio-setup.md` devient le guide opératoire de référence pour la V1 ; `docs/architecture/telephony-architecture.md` positionne Asterisk comme provider avancé/on-premise optionnel et OVH Click2Call comme provider simple dépendant de l'offre.
- Le branchement automatique au moteur d'alarmes, la queue Voice persistante, le polling des Call SID, les contacts/escalades, les callbacks et le DTMF restent hors de ce premier lot et sont prévus en TEL-TW-2 à TEL-TW-5.
- Le guide OVHcloud intégré reste disponible pour les installations utilisant OVH ; le test terrain Click2Call a validé les credentials API et la création d'un utilisateur, mais l'appel a été refusé par l'offre testée (`Can't use this function with this offer.`).
- Le provider Asterisk TEL-3 mergé en PR #84 reste disponible pour les projets nécessitant une téléphonie SIP/on-premise ; son PoC permet de tester ARI puis un appel sortant avec message audio local.
- Aucune clé ou secret Twilio/OVHcloud/SIP opérationnel n'est ajouté au dépôt.

### Métrologie

- Ajustage : après le calcul final, l’application demande désormais si les nouveaux coefficients doivent être envoyés aux GSP. Les coefficients précédents sont restaurés par sécurité avant la décision ; un refus conserve ces anciens coefficients sur les sondes, tandis qu’une confirmation envoie la configuration normale avec les nouveaux coefficients et contrôle l’ACK `ECON`.
- Ajustage : le lancement de l’opération démarre désormais uniquement la lecture continue des sondes et de l’étalon ; le plateau ne démarre qu’au clic sur l’acquisition d’un point.
- Les points 1 et 2 sont validés automatiquement à la fin d’un plateau stable avec les moyennes de toutes les mesures collectées pendant la fenêtre.
- Les coefficients A/B/C restent modifiables avant le premier point puis sont verrouillés côté UI et serveur dès le lancement de sa première acquisition.
- Le bouton de lecture préalable séparé est supprimé et un détail du calcul linéaire A/B/C est disponible après les deux points, sur le même principe que le détail d’Étalonnage.
- Les validations de coefficients A/B/C en Ajustage et en prévisualisation d'Étalonnage marquent désormais la dernière ligne `t_ajustage` via `Coeffs_Modifies_Depuis_Derniere_Mesure`.
- La validation refuse explicitement de poursuivre si la migration BDD `0.90.2` n'a pas encore ajouté cette colonne.
- Le schéma Prisma préparé conserve temporairement le champ afin qu'un `prisma db push` ne tente pas de supprimer la colonne avant la prochaine régénération complète du schéma source.
- Ce nouveau signal permet la synchronisation des coefficients pour une sonde de métrologie non affectée à un lieu ; le dirty flag historique de `t_lieu` reste un mécanisme distinct de Surveillance.

### Corrigé

- La validation des coefficients d'Étalonnage normalise désormais explicitement les valeurs non modifiées avec les mêmes valeurs par défaut que l'API (`A=1`, `B=0`, `C=0`) avant les contrôles numériques et l'appel à `Math.abs()`.
- `AdjustmentSensorRow` conserve `coeffA`, `coeffB` et `coeffC` optionnels car ce type partagé sert aussi de base au `ManagedSensor` interne du moteur d'Ajustage, qui stocke ses coefficients courants dans `currentCoeffA/B/C`.
- Ce correctif complète la PR #65 : rendre globalement A/B/C obligatoires corrigeait le premier diagnostic TypeScript mais rendait incompatible le mapper `ManagedSensor` du moteur d'Ajustage.
- Aucun comportement métier, formule métrologique, payload API ou stockage BDD n'est modifié par ce hotfix de typage/build.

### Surveillance et alarmes

- Les candidats d'acquittement ouverts depuis Surveillance sont scoppés au lieu courant ; l'alarme sélectionnée reste l'élément principal et les autres alarmes du lieu sont repliées par défaut.
- L'analyse graphique conserve le contexte du parcours d'acquittement et permet de revenir explicitement au dialogue.
- L'audit Surveillance masque les métadonnées techniques non utiles et affiche clairement les commentaires utilisateur.
- Les cartes Surveillance remplacent le texte batterie par un indicateur segmenté compact, avec valeur exacte au survol, seuils GSP et seuils historiques GSO.
- Les outils de test de sondes utilisent les mesures réelles produites par VigiSensys Serveur dans `tm_mesures`, sans second moteur d'interrogation matériel.

### Administration et lieux

- La page Paramètres utilise les réglages réellement consommés, évite les sauvegardes implicites et aligne les règles de mot de passe entre les différents parcours.
- La configuration SMTP expose clairement son état et un guide intégré documente Gmail, les mots de passe d'application, Microsoft 365, SMTP AUTH, TLS et les diagnostics courants.
- Le formulaire de lieu respecte désormais les templates désactivés, le mode **Enregistrer et rester**, les choix manuels de module et la règle Mailing indépendante des plannings de consigne.
- Une configuration de lieu peut être dupliquée depuis la liste ou appliquée comme source lors de la création ; seules les données configurables whitelistées sont copiées.
- Le Dashboard Admin dispose d'une card **Santé système** et d'une page détaillée couvrant Web, Serveur, bases, versions, machine, uptime et sauvegardes.
- Les cards **Mailing** et **Téléphonie** indiquent activation et complétude de configuration ; la Téléphonie reste verrouillée visuellement lorsque la licence ne l'autorise pas.
- La page Santé système affiche les derniers événements d'envoi email avec type, destinataire, sujet, statut, tentatives et erreur éventuelle, sans corps de mail ni secret.

### Métrologie et imports

- Les fins d'opération proposent les exports ZIP d'ajustage et les rapports PDF d'étalonnage ; les étalonnages historiques peuvent être sélectionnés et exportés en lot.
- L'affichage GSO pendant un ajustage applique les coefficients courants uniquement à la valeur présentée, sans modifier le signal brut utilisé par le calcul.
- Les anciennes sondes étalon SEF sont intégrées aux workflows grâce au support Sollae TCP du Serveur.
- Les erreurs de préparation/démarrage sont affichées dans la card d'action avec la sonde concernée et une aide de diagnostic ; les GSP déjà préparées sont restaurées en cas d'échec partiel.
- Les coefficients GSP sont relus avec `DCON` avant les opérations sans envoi `ECON` automatique ; les changements explicites de l'opérateur restent synchronisés selon le workflow prévu.
- L'import XML accepte les sondes sans module et les affectations multi-modules ; l'affectation BDD est dissociée de toute synchronisation matérielle implicite.
- Les adresses GSO créées depuis un import respectent désormais l'adresse physique réelle sans suffixe `-T` artificiel pour les types SOIT/SOET.

### Authentification, sécurité et liens publics

- La fondation Better Auth est intégrée en mode opt-in et conserve le parcours JWT historique lorsque l'option n'est pas activée.
- Le bootstrapper Web sait générer le secret Better Auth et écrire les variables d'environnement nécessaires sans exposer ce secret.
- La création utilisateur applique les mêmes règles de mot de passe que les autres parcours.
- Le reset mot de passe contrôle réellement le résultat Nodemailer, invalide un token non livré et renvoie une réponse publique neutre.
- Les access/refresh tokens JWT incluent désormais les codes d'autorisation du profil au lieu d'un tableau vide. Les anciennes sessions peuvent recharger ponctuellement leurs droits depuis la BDD puis sont renouvelées avec les claims corrigés.
- Santé système et Audit email réutilisent `DASHBOARD_ADMIN_ACCESS` sans nouvelle autorisation dédiée ; une fois les claims présents, leur contrôle d'accès ne dépend plus de la disponibilité de la base principale.
- Les liens de connexion et de reset générés par email utilisent les pathnames localisés `next-intl`.
- Le footer applicatif affiche la version, les informations cookies techniques et les liens publics Mentions légales / Protection des données.
- Pour la finalisation 1.0.0, les slugs français `/mentions-legales` et `/protection-des-donnees` disposent également de routes physiques de fallback afin d'éviter toute 404 de réécriture.
- Le shell Dashboard utilise une hauteur `dvh` bornée et un unique conteneur scrollable, supprimant la double scrollbar observée sur Surveillance après ajout du footer.
- Dans l'Administration, le footer ajoute un dégagement inférieur conditionnel lorsque le dock de navigation est visible, afin d'éviter tout recouvrement de la version ou des liens légaux.

### Téléphonie

- OVHcloud Click2Call, Asterisk/SIP et Twilio sont documentés/configurables selon les besoins ; Twilio est la cible recommandée de la V1.
- Le test Twilio prend en charge le comportement spécifique des comptes Trial et indique lorsque le template Trial a été utilisé.
- Les fonctions Téléphonie côté API et interface respectent l'option de licence `telephonie`.
- Le Dashboard Admin synthétise l'état du provider et de sa configuration sans exposer les credentials.

### Fondation Web / compatibilité

- Les formats de dates sont centralisés via des presets explicites et conservent la sémantique des `DATETIME` MySQL/SQL Server sans fuseau.
- Le formatage numérique utilisateur est centralisé via `Intl.NumberFormat`, notamment pour les mesures.
- Les libellés d'autorisation SQL Server historiquement mojibakés peuvent être réparés de manière conservatrice lors de leur lecture administrative.
- MySQL et SQL Server restent les deux providers supportés ; les contrôles TypeScript/build sont exécutés sur les deux configurations.
- La version de la modale **Nouvelle version** est maintenant dérivée de `website/package.json` au lieu d'un numéro historique codé en dur.

### PR principales

- Métrologie : #67, #70, #71, #97, #103, #107, #110, #111, #113, #114, #116, #117.
- Authentification / sécurité : #72, #74, #82, #90, #101, #105, #121, #122, #124.
- Téléphonie : #83, #84, #85, #94, #95, #96, #128.
- Surveillance / alarmes / administration : #86, #87, #100, #112, #115, #123, #125, #126, #127, #128, #129.
- Fondations Web : #73, #75, #77, #78, #79, #80, #81.

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
