# Changelog — VigiSensys Web

Ce fichier décrit les évolutions propres à l'application Web VigiSensys.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

Les versions suivent `MAJOR.MINOR.PATCH` sans zéros de tête. La source de version du Web est `website/package.json`.

## [Unreleased]

### Authentification / expérience utilisateur

- Première connexion : après le bouton d’accès, l’onboarding reste affiché sous forme d’écran de préparation pendant la finalisation de la session et jusqu’à la redirection, au lieu de laisser réapparaître brièvement le formulaire de connexion.
- Première connexion : après une authentification réussie, VigiSensys affiche un accueil animé puis présente la politique de mot de passe CFR21 avant la redirection vers l’application.
- La première connexion est déterminée côté serveur à partir de `t_utilisateur.Date_Heure_Derniere_Connexion`, sans stockage navigateur ni nouvelle colonne.
- La durée affichée reprend `CFR21 / VALIDITE_MOT_DE_PASSE_JOURS` et respecte `ACTIVATION_EXPIRATION_MOT_DE_PASSE`. Le changement forcé des mots de passe temporaires/expirés et l’avertissement existant à J-7 sont conservés.

### Téléphonie

- Twilio devient le provider recommandé pour la V1 des alarmes vocales : le serveur VigiSensys utilise uniquement l'API REST HTTPS sortante, sans SIP/RTP, VM Linux, Asterisk ni port entrant requis chez le client standard.
- Le provider `TwilioVoiceProvider` utilise directement la Calls API sans ajouter de SDK/dépendance Web ; il prend en charge API Key SID + Secret (recommandé) ou Account SID + Auth Token, le test de connexion et un appel de test avec TwiML inline/TTS `fr-FR`.
- Le bouton **Tester la connexion** valide DNS/HTTPS/authentification et accès à la collection Calls ; **Tester l'appel** appelle un numéro E.164 et retourne le Call SID Twilio pour faciliter le diagnostic et préparer le futur suivi de statut.
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
