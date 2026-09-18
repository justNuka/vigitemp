# Changelog — VigiSensys Web

Ce fichier décrit les évolutions propres à l'application Web VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Les versions suivent `MAJOR.MINOR.PATCH` sans zéros de tête. La source de version du Web est `website/package.json`.

## [Unreleased]

Aucun changement supplémentaire documenté depuis la préparation de la release 1.0.0.

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
