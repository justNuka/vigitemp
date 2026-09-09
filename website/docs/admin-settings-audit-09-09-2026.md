# Audit page Administration > Paramètres — 09/09/2026

## Contexte

Audit demandé pendant une installation VigiSensys afin de vérifier que les réglages affichés dans `Administration > Paramètres` correspondent réellement aux paramètres utilisés par l'application et qu'une modification n'est plus persistée immédiatement sans validation explicite.

- Dépôt : `justNuka/vigitemp`
- Branche : `fix/admin-settings-consistency`
- Base de branche initiale : `dev` au commit `c96045d0133fba577e911a5b7a7f4f53dc554f82`
- `dev` au 09/09/2026 : `bec77b2631e32c390c9be6b2abd60dcaba738b06` (les commits arrivés entre-temps concernent uniquement les correctifs Serveur IC/IP/IH et IP platine)
- PR : à renseigner à l'ouverture

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

### 5. Emails système en copie affichés à `false`

Certaines installations historiques peuvent contenir la chaîne `false` dans `NOTIFICATIONS:ALARM_EMAIL_RECIPIENTS` lorsqu'aucune adresse n'est configurée.

Après correctif :

- l'interface affiche un champ vide pour `false`, `0`, `off` ou `no` ;
- le moteur d'envoi ignore également ces anciennes valeurs sentinelles au lieu de les interpréter comme une adresse email ;
- une saisie puis suppression du contenu permet de normaliser la valeur persistée vers une chaîne vide lors de l'enregistrement suivant.

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
- [ ] Vérifier FR et EN.
