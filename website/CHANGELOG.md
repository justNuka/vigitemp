# Changelog — VigiSensys Web

Ce fichier décrit les évolutions propres à l'application Web VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Les versions suivent `MAJOR.MINOR.PATCH` sans zéros de tête. La source de version du Web est `website/package.json`.

## [Unreleased]

Aucun changement supplémentaire documenté depuis la préparation de la version Web 1.4.0.

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
