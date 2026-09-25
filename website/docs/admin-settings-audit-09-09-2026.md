# Audit page Administration > Paramètres — 09/09/2026

## Contexte

Audit demandé pendant une installation VigiSensys afin de vérifier que les réglages affichés dans `Administration > Paramètres` correspondent réellement aux paramètres utilisés par l'application et qu'une modification n'est plus persistée immédiatement sans validation explicite.

- Dépôt : `justNuka/vigitemp`
- Branche : `fix/admin-settings-consistency`
- Base de branche initiale : `dev` au commit `c96045d0133fba577e911a5b7a7f4f53dc554f82`
- `dev` au 09/09/2026 : `bec77b2631e32c390c9be6b2abd60dcaba738b06` (les commits arrivés entre-temps concernent uniquement les correctifs Serveur IC/IP/IH et IP platine)
- PR : #100 — `fix(settings): fiabiliser la page Paramètres admin`

## Points audités

### 1. Double intervalle de rafraîchissement

**Constat :** la page exposait à la fois un ancien paramètre `dashboard:refresh` et le paramètre réellement utilisé par Surveillance, `dashboard:surveillance_refresh`.

**État après correctif :** seul `dashboard:surveillance_refresh` est présenté sur la page. La Surveillance lit bien cette clé depuis `t_parametre`.

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/parametres/server-settings.tsx`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/general-settings-card.tsx`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx`

### 2. Déconnexion automatique

**Source de vérité confirmée :**

- `Section = CFR21`
- `Mot_Cle = TEMPS_DECONNEXION_MINUTES`

L'API `/api/parametres/auto-lock` lit et écrit cette valeur en BDD. Une valeur `0` représente la désactivation. Le navigateur conserve un cache local uniquement pour éviter de retomber temporairement sur la valeur par défaut pendant le chargement ; la BDD reste la source de vérité.

La carte utilise maintenant un brouillon local et n'écrit plus la valeur dès le changement : les boutons Enregistrer/Annuler apparaissent lorsqu'une modification existe.

### 3. Règles de mot de passe

**Source de vérité confirmée :** `t_parametre` :

- `SECURITE_MOT_DE_PASSE:LONGUEUR_MINIMALE`
- `SECURITE_MOT_DE_PASSE:MIN_LETTRES_MAJUSCULES`
- `SECURITE_MOT_DE_PASSE:MIN_LETTRES_MINUSCULES`
- `SECURITE_MOT_DE_PASSE:MIN_CHIFFRES`
- `SECURITE_MOT_DE_PASSE:MIN_CARACTERES_SPECIAUX`
- paramètres CFR21 associés pour activation, historique et expiration.

Les mêmes règles sont chargées par `/api/parametres/password-rules` et utilisées :

- sur la page de changement obligatoire au premier accès ;
- lors du changement de mot de passe depuis le profil ;
- lors d'une réinitialisation de mot de passe ;
- côté API lors de la validation effective du nouveau mot de passe.

La page Paramètres conserve désormais les modifications en brouillon et affiche Enregistrer/Annuler uniquement lorsqu'une règle a changé.

### 4. Validation explicite des modifications

Les réglages généraux/notifications/messagerie/fuseau horaire sont modifiés en brouillon puis validés via une barre Enregistrer/Annuler commune.

Les cartes ayant leur propre API ou leur propre modèle de données gardent une validation locale explicite :

- déconnexion automatique ;
- règles de mot de passe ;
- acquittement automatique des non-réponses ;
- configuration SMTP ;
- téléphonie.

Aucun de ces réglages ne doit être persisté par le simple changement d'un switch/select/input.

### 5. Destinataires globaux en copie affichés à `false`

Certaines installations historiques peuvent contenir la chaîne `false` dans `NOTIFICATIONS:ALARM_EMAIL_RECIPIENTS` lorsqu'aucune adresse n'est configurée.

Après correctif :

- l'interface affiche un champ vide pour `false`, `0`, `off` ou `no` ;
- le moteur d'envoi ignore également ces anciennes valeurs sentinelles au lieu de les interpréter comme une adresse email ;
- une saisie puis suppression du contenu permet de normaliser la valeur persistée vers une chaîne vide lors de l'enregistrement suivant.
- l'interface emploie désormais le vocabulaire métier **destinataires globaux en copie** et **destinataires globaux de secours**, sans exposer la formulation technique « emails système ».

Fichiers :

- `website/src/app/[locale]/(admin)/admin/parametres/_components/notifications-settings-card.tsx`
- `website/src/lib/email.ts`

### 6. Activation globale des emails

La configuration SMTP expose désormais un switch explicite **Activer l'envoi d'emails**.

Ce switch lit/écrit le paramètre réellement utilisé par le moteur d'envoi :

- `SECURITE_EMAIL:SMTP_ACTIVATION`

La désactivation conserve l'hôte, le port, l'utilisateur, l'expéditeur et le mot de passe SMTP enregistrés. Elle bloque globalement les emails VigiSensys.

À distinguer de `NOTIFICATIONS:EMAIL`, qui contrôle les notifications d'alarme par email et non l'infrastructure SMTP globale.

### 7. Route générique de paramètres

Correction d'une incohérence dans la réponse PATCH de `/api/parametres/[key]` : la propriété Prisma correcte est `Mot_Cle` et non `MotCle`.

### 8. Guide de configuration SMTP — 15/09/2026

Un test d'installation client avec Gmail a retourné `535 5.7.8 Username and Password not accepted`. La connexion à `smtp.gmail.com` arrivait correctement jusqu'à `AUTH PLAIN` : le problème provenait donc de l'authentification Google, qui nécessite un mot de passe d'application lorsque ce mode est utilisé.

Lot associé :

- branche : `feature/smtp-configuration-guide` ;
- base : `dev` au commit `db05fdd87e58bc9ce9ad82bf9986667ba596cc02` (merge PR #117) ;
- PR : #118 — `feat(settings): ajouter un guide de configuration SMTP`.

La carte **Configuration Email** expose désormais un bouton **Guide SMTP** ouvrant une dialog FR/EN distincte du formulaire de configuration.

Le guide couvre :

- **Google / Gmail** : `smtp.gmail.com`, port `587`, STARTTLS, adresse complète comme utilisateur/expéditeur et mot de passe d'application Google ;
- **Microsoft 365** : `smtp.office365.com`, port `587`, STARTTLS, avec avertissement sur SMTP AUTH et les politiques de tenant ;
- **Outlook.com personnel** : rappel que Microsoft documente désormais OAuth2 / Modern Auth comme méthode d'authentification ;
- **Alwaysdata** en solution de repli lorsqu'aucun SMTP client n'est disponible : `smtp-[account].alwaysdata.net`, port `465` SSL/TLS ou `587` STARTTLS, adresse email complète et mot de passe de la boîte ;
- **autre relais SMTP** : checklist des informations à demander à la DSI (DNS, port, TLS, identifiants, expéditeur autorisé et ouverture réseau).

Limite documentée : VigiSensys utilise actuellement Nodemailer avec authentification SMTP utilisateur/mot de passe. OAuth2 SMTP n'est pas encore implémenté. Un tenant Microsoft imposant exclusivement Modern Auth doit donc fournir un relais compatible ou utiliser une autre solution SMTP telle qu'Alwaysdata.

Fichiers principaux :

- `website/src/app/[locale]/(admin)/admin/parametres/_components/smtp-settings-card.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/smtp-configuration-guide-dialog.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx` ;
- `website/src/messages/smtp-guide-supplements.ts` ;
- `website/src/i18n/request.ts`.

## 9. Validation obligatoire de la configuration SMTP — 18/09/2026

La configuration SMTP ne repose plus sur un simple email de test facultatif.

### Source de vérité

L'état est stocké dans `t_parametre`, section `SECURITE_EMAIL` :

- `SMTP_ACTIVATION` : activation globale du service Mailing ;
- `SMTP_SERVEUR`, `SMTP_PORT`, `SMTP_UTILISATEUR`, `SMTP_MOT_DE_PASSE`, `SMTP_EXPEDITEUR` : paramètres techniques ;
- `SMTP_CONFIRME` : indique que la configuration technique courante a effectivement réussi à envoyer un code reçu puis validé.

Aucune nouvelle colonne ni migration de schéma n'est nécessaire.

Les nouvelles installations initialisent `SMTP_CONFIRME=false` dans les seeds MySQL et SQL Server. Pour ne pas couper les emails sur une installation historique déjà fonctionnelle, une configuration complète qui ne possède pas encore ce paramètre est considérée confirmée jusqu'à sa première modification.

### Modification et confirmation

Lorsqu'un administrateur modifie réellement l'hôte, le port, l'utilisateur, le mot de passe ou l'expéditeur :

1. les nouveaux paramètres sont enregistrés ;
2. `SMTP_CONFIRME` passe immédiatement à `false` ;
3. les emails métier VigiSensys sont bloqués tant que la configuration n'est pas confirmée ;
4. un code à 6 chiffres est envoyé avec **la nouvelle configuration SMTP elle-même** à l'adresse choisie pour le test ;
5. la saisie correcte du code passe `SMTP_CONFIRME` à `true`.

Le code :

- expire après 10 minutes ;
- est limité à 5 tentatives ;
- n'est jamais stocké en clair ;
- est persisté uniquement sous forme de HMAC-SHA256 lié à l'adresse et à l'expiration ;
- utilise le secret JWT déjà obligatoire pour VigiSensys ;
- est supprimé après succès, expiration, trop de tentatives, désactivation du service ou échec de l'envoi.

Les paramètres temporaires de challenge utilisent également `SECURITE_EMAIL` :

- `SMTP_VERIFICATION_HASH` ;
- `SMTP_VERIFICATION_EXPIRES_AT` ;
- `SMTP_VERIFICATION_ATTEMPTS` ;
- `SMTP_VERIFICATION_RECIPIENT`.

### Activation globale déplacée sur la card

Le switch `SMTP_ACTIVATION` sort de la modale technique et est affiché directement sur la card **Configuration Email**.

- service désactivé : aucun bandeau d'alerte ni bouton de configuration ; le **Guide SMTP** reste toujours visible ;
- service activé : bandeau rouge/destructif, état de confirmation et bouton **Configurer SMTP** ;
- désactiver/réactiver le service ne détruit pas la configuration technique et ne force pas une nouvelle validation lorsque la configuration confirmée n'a pas changé.

### Usage par le moteur email

Le moteur `sendEmail()` exige désormais simultanément :

- SMTP activé ;
- configuration techniquement complète ;
- configuration confirmée.

Une configuration enregistrée mais non confirmée retourne `smtp_configuration_unconfirmed` et n'est pas utilisée silencieusement pour les alarmes, resets ou autres emails métier.

L'ancien endpoint `POST /api/email/test` est conservé comme endpoint de diagnostic, mais le parcours normal de configuration de l'interface utilise désormais les endpoints dédiés :

- `POST /api/admin/configuration-smtp/verification/request` ;
- `POST /api/admin/configuration-smtp/verification/confirm`.

Les emails de validation apparaissent dans l'audit Santé système avec le type `smtp_verification`, sans stocker le code ou le mot de passe SMTP.

## 10. Navigation Paramètres par onglets — 18/09/2026

La page n'affiche plus toutes les cards dans une seule colonne continue. Elle est répartie en quatre onglets :

- **Général** : réglages généraux + fuseau horaire ;
- **Sécurité** : déconnexion automatique + règles de mot de passe ;
- **Alarmes & notifications** : notifications + acquittement automatique des non-réponses ;
- **Services** : messagerie, Mailing/SMTP et Téléphonie.

La barre commune **Modifications en attente / Enregistrer / Annuler** reste au-dessus des onglets : changer d'onglet ne perd pas les brouillons des paramètres utilisant le système de sauvegarde globale.

## Validation terrain

- [ ] Modifier `Rafraîchissement surveillance`, vérifier qu'aucune écriture n'a lieu avant clic sur Enregistrer.
- [ ] Enregistrer puis vérifier `DASHBOARD:SURVEILLANCE_REFRESH` en BDD et le comportement de Surveillance.
- [ ] Modifier plusieurs réglages généraux avant un seul Enregistrer ; vérifier qu'ils sont tous persistés.
- [ ] Cliquer Annuler ; vérifier le retour aux valeurs persistées.
- [ ] Vérifier la déconnexion automatique avec `TEMPS_DECONNEXION_MINUTES = 2`, puis remettre la valeur prévue pour l'installation.
- [ ] Modifier une règle de mot de passe puis vérifier son affichage et son application sur le changement obligatoire et le changement depuis le profil.
- [ ] Avec `ALARM_EMAIL_RECIPIENTS = 'false'`, vérifier que le champ Emails en copie est vide.
- [ ] Enregistrer une ou plusieurs adresses en copie puis envoyer un email de test/alarme adapté.
- [ ] Désactiver `SECURITE_EMAIL:SMTP_ACTIVATION` depuis le switch SMTP : l'email de test doit être refusé proprement.
- [ ] Réactiver le switch : l'email de test doit être envoyé si la configuration SMTP est complète.
- [ ] Ouvrir **Guide SMTP** et vérifier les quatre sections Google, Microsoft, Alwaysdata et autre SMTP.
- [ ] Désactiver le Mailing depuis la card : vérifier que warning et bouton de configuration disparaissent, mais que **Guide SMTP** reste visible.
- [ ] Réactiver le Mailing : vérifier le bandeau rouge et le bouton **Configurer SMTP**.
- [ ] Modifier un paramètre SMTP et enregistrer : vérifier que la configuration passe immédiatement à **À valider**.
- [ ] Vérifier qu'un email métier est refusé tant que le code n'est pas confirmé.
- [ ] Vérifier la réception du code à 6 chiffres avec la nouvelle configuration puis sa validation.
- [ ] Tester un mauvais code et vérifier le nombre d'essais restants ; après 5 erreurs, demander un nouveau code.
- [ ] Vérifier l'expiration d'un code après 10 minutes.
- [ ] Modifier la configuration vers des identifiants invalides : l'envoi du code doit échouer clairement et la configuration doit rester non confirmée.
- [ ] Sur une installation historique sans `SMTP_CONFIRME`, vérifier qu'une configuration complète existante reste utilisable jusqu'à sa prochaine modification.
- [ ] Vérifier les quatre onglets Paramètres sur desktop/mobile et confirmer qu'un brouillon global survit à un changement d'onglet.
- [ ] Tester Gmail avec mot de passe d'application et vérifier l'envoi de l'email de test.
- [ ] Vérifier le rendu du guide en FR / EN, thèmes clair / sombre et largeur mobile.
