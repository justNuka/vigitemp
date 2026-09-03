# Migration de l'authentification Web vers Better Auth

> **Statut : migration en cours — BA-1 validé techniquement, bascule production non engagée.**
>
> Baseline vérifiée avant rédaction : `dev` au commit `1ea932cfeb4c6b2b09552055823aef2c573239d2` (01/09/2026, merge PR #80).
>
> Ce document décrit la trajectoire cible et le découpage recommandé. Il ne constitue pas une autorisation à modifier directement `dev` ni à lancer une migration de base sans vérifier le code, les PR et les versions Better Auth courantes.
>
> Documentation Better Auth vérifiée le 01/09/2026. Les API/options devront être revalidées au début de chaque lot, Better Auth évoluant rapidement.

## 1. Objectif

Remplacer progressivement l'authentification/session maison de VigiSensys par Better Auth afin de :

- supprimer la maintenance interne des access JWT, refresh JWT, rotation et cookies de session ;
- disposer de vraies sessions serveur révocables et comptables ;
- conserver le login historique `Login + mot de passe` via le plugin Username ;
- conserver les utilisateurs, profils, groupes, autorisations, lieux, audits et autres relations métier existants ;
- ajouter progressivement des méthodes modernes d'authentification :
  - TOTP / two-factor ;
  - Magic Link ;
  - Email OTP ;
  - Last Login Method ;
  - Microsoft Entra ID ;
  - SSO OIDC/OAuth2/SAML ;
  - i18n des erreurs Better Auth ;
  - Have I Been Pwned pour les mots de passe ;
  - éventuellement Passkeys dans un lot ultérieur ;
- améliorer le comptage des utilisateurs réellement connectés pour la licence ;
- rester compatible avec le fonctionnement on-premise, MySQL et Microsoft SQL Server ;
- permettre une migration progressive et réversible sans verrouiller les installations existantes.

Le chantier est volontairement conçu comme une **migration par étapes**, jamais comme une réécriture big-bang.

## 2. Décision d'architecture principale

### 2.1 `t_utilisateur` reste la source de vérité métier

`t_utilisateur` est utilisée dans de nombreux domaines VigiSensys : profils, groupes, lieux, autorisations, chat, notifications, audit, métrologie, administration, etc.

La recommandation est donc de **ne pas transformer directement `t_utilisateur` en table Better Auth dans la première implémentation**.

Better Auth reçoit ses propres tables techniques d'identité/session, reliées à `t_utilisateur` :

```text
                         Better Auth
                             │
                ┌────────────┴────────────┐
                │                         │
          t_auth_user               t_auth_session
                │                         │
                ├─────────────── t_auth_account
                │
                ├─────────────── t_auth_verification
                │
                └─────────────── tables/colonnes plugins
                │
             1 ↔ 1
                │
          t_utilisateur
                │
       identité métier VigiSensys
  profils / groupes / lieux / droits
       audit / chat / notifications
```

`t_auth_user` contient un champ serveur `vigisensysUserId` unique pointant vers `t_utilisateur.Id_Utilisateur`.

Le code métier continue donc de travailler avec l'ID numérique historique `Id_Utilisateur`.

### 2.2 Pourquoi séparer les tables

Cette séparation évite que Better Auth :

- ajoute progressivement des colonnes de plugins dans une table métier déjà très chargée ;
- impose son lifecycle `user` à toutes les relations historiques ;
- couple les futures évolutions de Better Auth aux FK métier ;
- doive gérer directement un schéma historique contenant des champs dont la sémantique dépasse l'authentification ;
- puisse modifier par inadvertance des champs comme `Adresse_Email`, `Avatar_Utilisateur`, `Profil_Utilisateur` ou les métadonnées de connexion sans passer par les services métier VigiSensys.

`t_utilisateur` reste la source de vérité métier ; la table Better Auth est une identité technique synchronisée.

### 2.3 Alternative à tester uniquement dans le PoC

Better Auth permet de renommer les modèles/colonnes et de gérer des IDs utilisateurs numériques existants. Il serait donc techniquement possible de mapper directement :

```text
Better Auth user -> t_utilisateur
id               -> Id_Utilisateur
email            -> Adresse_Email
username         -> Login
image            -> Avatar_Utilisateur
...
```

Cette option doit être documentée dans le PoC mais n'est **pas la cible recommandée par défaut**.

Elle ne sera retenue que si le PoC démontre clairement qu'elle simplifie la migration sans :

- conflit avec les colonnes nullables historiques ;
- conflit de lifecycle ;
- difficulté MySQL/MSSQL ;
- difficulté avec les plugins ;
- risque sur les FK et usages métier existants.

## 3. État actuel à préserver pendant la migration

L'authentification actuelle ne fait pas uniquement une comparaison de mot de passe.

### 3.1 Session/JWT maison

Les principaux éléments actuels sont :

- `website/src/lib/jwt.ts` : access JWT, refresh JWT, échéance absolue ;
- `website/src/lib/auth.ts` : lecture/vérification du token dans les routes API ;
- `website/src/lib/server-auth.ts` : lecture du cookie et résolution de l'utilisateur côté Server Components ;
- `website/src/app/api/auth/login/route.ts` ;
- `website/src/app/api/auth/refresh/route.ts` ;
- `website/src/app/api/auth/logout/route.ts` ;
- `website/src/app/api/auth/logout-auto/route.ts` ;
- `website/src/app/api/auth/force-password-change/route.ts` ;
- `website/src/lib/api-wrappers.ts` ;
- `website/src/proxy.ts` ;
- plusieurs chemins spécialisés, notamment SSE, qui lisent encore directement le cookie `auth-token`.

Le système Better Auth doit remplacer progressivement cette plomberie, pas contourner les helpers centraux existants.

### 3.2 Règles métier présentes dans le login

Le login actuel applique notamment :

- recherche de `t_utilisateur` par `Login` ;
- refus des utilisateurs archivés ;
- vérification bcrypt de `Mot_De_Passe` ;
- détection de première connexion ;
- expiration de mot de passe CFR21 ;
- mot de passe temporaire / changement forcé ;
- limite d'utilisateurs connectés issue de la licence ;
- journalisation de la tentative ;
- mise à jour de :
  - `Date_Heure_Derniere_Connexion` ;
  - `Adresse_IP_Connexion` ;
  - `Nom_Machine_Connexion` ;
- synchronisation de `t_postes_clients`.

**Aucune de ces règles ne doit disparaître lors du passage à Better Auth.**

Le chantier doit séparer :

```text
Authentification de l'identité
          │
          └── Better Auth

Règles métier de connexion
          │
          └── services/hooks VigiSensys
```

## 4. Capacités Better Auth retenues

Les capacités ci-dessous ont été vérifiées dans la documentation officielle au 01/09/2026.

### 4.1 Username

Le plugin `username` étend l'authentification email/password et permet :

```ts
await authClient.signIn.username({
  username: login,
  password,
})
```

La connexion VigiSensys peut donc conserver l'expérience historique `Login + Mot de passe` sans exposer l'email comme identifiant principal.

Points de décision :

- `Login` doit rester unique ;
- la normalisation Better Auth est en minuscules par défaut ;
- le PoC doit vérifier les collations et la sensibilité à la casse actuelles MySQL/MSSQL ;
- la cible recommandée est un username immuable après provisioning (`immutableUsername: true`) car `Login` participe à l'identité métier/audit ;
- l'endpoint de disponibilité du username doit être désactivé si son exposition facilite l'énumération des comptes.

### 4.2 Sessions serveur

Better Auth stocke les sessions avec notamment :

- `token` ;
- `userId` ;
- `expiresAt` ;
- `ipAddress` ;
- `userAgent` ;
- `createdAt` / `updatedAt`.

C'est la cible pour remplacer access JWT + refresh JWT.

Pour préserver la règle VigiSensys de durée absolue, le PoC doit tester une configuration conceptuelle du type :

```ts
session: {
  expiresIn: 60 * 60 * 24,
  disableSessionRefresh: true,
}
```

L'objectif est : **24 h maximum depuis la création, indépendamment de l'activité**.

Ne pas activer de cookie cache ou de refresh glissant avant d'avoir des tests démontrant qu'ils ne contournent pas cette règle.

### 4.3 Schéma personnalisable

Better Auth permet :

- `modelName` pour renommer ses tables ;
- `fields` pour renommer ses colonnes ;
- `additionalFields` pour étendre `user` et `session` ;
- des schémas propres aux plugins ;
- des hooks de base de données ;
- des IDs différents selon les modèles.

Cette flexibilité permet d'utiliser des noms explicites `t_auth_*` sans toucher aux conventions métier de `t_utilisateur`.

### 4.4 MySQL et Microsoft SQL Server

Better Auth supporte les deux moteurs.

Pour MSSQL, la documentation officielle utilise le `MssqlDialect` Kysely.

La cible recommandée pour le PoC est d'évaluer une **couche Better Auth/Kysely uniforme pour MySQL et MSSQL**, indépendante de Prisma :

```text
Application métier VigiSensys
          │
        Prisma
          │
      MySQL/MSSQL

Better Auth uniquement
          │
        Kysely
          │
      MySQL/MSSQL
```

Pourquoi :

- support MSSQL officiellement documenté ;
- génération/migration Better Auth disponible avec le moteur intégré ;
- isolation de la dépendance Kysely au module auth ;
- pas besoin de faire dépendre Better Auth des particularités des trois clients Prisma VigiSensys ;
- même stratégie conceptuelle sur les deux moteurs.

Le choix définitif **Kysely uniforme vs Prisma pour MySQL + Kysely MSSQL** doit être tranché seulement après PoC comparatif.

### 4.5 Hash bcrypt existant

Better Auth utilise scrypt par défaut mais permet de fournir ses propres fonctions `hash` et `verify`.

Les hashes bcrypt existants de `t_utilisateur.Mot_De_Passe` peuvent donc être migrés dans l'`account` Better Auth de type credential sans imposer un reset global des mots de passe.

La migration initiale doit conserver une vérification compatible bcrypt.

Une migration ultérieure vers un autre algorithme ne doit être envisagée qu'avec une stratégie de rehash progressive et testée.

## 5. Modèle de données cible

Les noms exacts seront figés après génération du schéma Better Auth pour la version retenue.

### 5.1 `t_auth_user`

Conceptuellement :

```text
t_auth_user
-----------
id                  VARCHAR/UUID PK
vigisensysUserId    INT UNIQUE FK -> t_utilisateur.Id_Utilisateur
name                VARCHAR
email               VARCHAR UNIQUE
emailVerified       BOOLEAN
image               VARCHAR NULL
username            VARCHAR UNIQUE NULL
displayUsername     VARCHAR NULL
createdAt           DATETIME
updatedAt           DATETIME
+ champs plugin éventuels
```

Règles :

- `id` Better Auth reste technique et ne remplace pas `Id_Utilisateur` dans le métier ;
- `vigisensysUserId` est `input: false` / contrôlé serveur ;
- `name` est une copie/valeur dérivée pour Better Auth ;
- le nom affiché métier continue de venir de `t_utilisateur` ;
- l'email d'auth doit rester synchronisé avec la politique définie ci-dessous ;
- le username correspond au `Login` historique.

### 5.2 `t_auth_session`

Conceptuellement :

```text
t_auth_session
--------------
id
userId -> t_auth_user.id
token UNIQUE
expiresAt
ipAddress NULL
userAgent NULL
createdAt
updatedAt
+ éventuels champs serveur VigiSensys
```

La table devient la source de vérité pour :

- session active ;
- révocation ;
- logout ;
- logout all ;
- comptage licence ;
- vue future des sessions actives d'un utilisateur.

### 5.3 `t_auth_account`

Un compte représente une méthode d'authentification liée au même utilisateur Better Auth :

```text
credential
microsoft
OIDC/SAML/SSO
...
```

Le compte credential contient le hash du mot de passe.

À la migration :

```text
t_utilisateur.Mot_De_Passe
        ↓
t_auth_account.password
providerId = credential
```

Le champ historique `Mot_De_Passe` ne sera supprimé ou neutralisé qu'après plusieurs versions de compatibilité et validation terrain.

### 5.4 `t_auth_verification`

Utilisée par les workflows de vérification/tokens/OTP selon configuration.

Ne pas réutiliser les anciens champs `Reset_Password_Token` / `Reset_Password_Expires` comme stockage Better Auth sans preuve que leurs contrats correspondent exactement.

### 5.5 Tables/colonnes plugins

Les migrations générées par chaque plugin doivent être versionnées explicitement.

Exemples :

- 2FA ;
- Passkey ;
- SSO ;
- champs Username ;
- autres tables requises par la version Better Auth retenue.

Ne jamais appliquer automatiquement une migration CLI Better Auth sur une base cliente sans script contrôlé et versionné dans le dépôt.

## 6. Email : contrainte de migration importante

Better Auth considère l'email comme un champ central du user et exige un email unique dans son schéma standard.

Or `t_utilisateur.Adresse_Email` est historiquement nullable et doit être vérifiée sur les bases réelles.

### 6.1 Audit préalable obligatoire

Sur MySQL et MSSQL, vérifier au minimum :

- nombre d'utilisateurs actifs sans email ;
- doublons d'email ;
- espaces/casse ;
- adresses manifestement invalides ;
- comptes techniques.

### 6.2 Politique recommandée

Pour un utilisateur possédant une adresse réelle unique :

- la synchroniser vers `t_auth_user.email` ;
- `emailVerified` ne doit pas être mis arbitrairement à `true` sans politique explicite.

Pour un utilisateur historique sans email :

- privilégier une étape de correction/provisioning administrateur avant activation des méthodes email ;
- si Better Auth impose un email lors du provisioning et qu'un compte doit absolument être migré, un alias interne unique sous un domaine réservé `.invalid` peut servir **uniquement de pont technique** ;
- un alias technique ne doit jamais permettre Magic Link, Email OTP, reset par email ou Microsoft linking ;
- l'UI doit clairement indiquer que l'utilisateur doit renseigner/faire valider une vraie adresse avant d'activer ces méthodes.

### 6.3 Source de vérité

Décision recommandée :

- `t_utilisateur.Adresse_Email` reste la donnée métier/contact ;
- `t_auth_user.email` est la copie d'identité utilisée par Better Auth ;
- tout changement d'email passe par un service applicatif unique qui synchronise les deux ;
- une adresse remontée par Microsoft/SSO ne remplace jamais silencieusement l'adresse métier sans règle explicite.

## 7. Migration des utilisateurs et mots de passe

### 7.1 Pas de self-signup public

VigiSensys administre ses utilisateurs depuis l'application.

La cible doit désactiver la création implicite de comptes pour les méthodes publiques lorsque le plugin le permet :

```text
email/password signup      -> désactivé
Magic Link signup implicite -> désactivé
Email OTP signup implicite  -> désactivé
Microsoft/SSO nouveau user  -> refus/provisioning contrôlé
```

La création d'un utilisateur reste un workflow administrateur VigiSensys.

### 7.2 Service de provisioning unique

Créer à terme un service conceptuel du type :

```text
UserIdentityProvisioningService
```

Responsabilités :

- créer/mettre à jour `t_utilisateur` selon le workflow existant ;
- créer ou synchroniser `t_auth_user` ;
- créer l'account credential si nécessaire ;
- synchroniser username/email ;
- révoquer les sessions lors de l'archivage ;
- empêcher qu'une route admin mette à jour uniquement un côté de la relation.

Le nom exact reste à définir après étude du code courant.

### 7.3 Migration initiale

Script idempotent recommandé :

1. lire les `t_utilisateur` non archivés et, selon décision, certains archivés pour conserver l'historique ;
2. vérifier les prérequis username/email ;
3. créer `t_auth_user` s'il n'existe pas ;
4. créer `t_auth_account` credential avec le hash bcrypt existant ;
5. enregistrer le lien `vigisensysUserId` ;
6. produire un rapport : migré / ignoré / erreur / email manquant / doublon ;
7. pouvoir être rejoué sans créer de doublon.

Aucune migration ne doit supprimer `Mot_De_Passe` au même moment.

## 8. Politique des méthodes d'authentification

### 8.1 Username + mot de passe

Méthode de compatibilité principale au démarrage.

Configuration cible :

- plugin Username ;
- username issu de `Login` ;
- bcrypt compatible avec l'existant ;
- CFR21 appliqué ;
- HIBP optionnel si accès Internet autorisé ;
- 2FA TOTP activable selon politique client.

### 8.2 Two-factor

Le plugin 2FA Better Auth couvre les connexions credentials (email/username/phone) par défaut.

Point critique : les méthodes passwordless/sociales (Magic Link, Email OTP, OAuth, Passkey...) ne sont pas automatiquement soumises au même challenge 2FA.

Il faut donc définir deux politiques :

**Politique standard possible** :

- mot de passe -> 2FA si activé ;
- Microsoft/SSO/passwordless -> confiance dans la méthode/provider.

**Politique renforcée client/réglementaire** :

- toute méthode doit finir par une étape 2FA locale ;
- nécessite hooks/step-up spécifique Better Auth.

La politique retenue doit être paramétrable/documentée, pas implicite.

### 8.3 Magic Link

Pré-requis :

- email réel ;
- SMTP opérationnel ;
- base URL correcte ;
- HTTPS recommandé ;
- signup implicite désactivé ;
- rate limit et journalisation.

### 8.4 Email OTP

Pré-requis similaires au Magic Link.

Options à fixer lors du lot :

- longueur ;
- durée ;
- nombre d'essais ;
- stratégie de resend ;
- stockage OTP chiffré/hashé selon capacités de la version ;
- types autorisés : sign-in, vérification email, reset.

### 8.5 Last Login Method

Peut améliorer l'UX :

```text
Dernière connexion : Microsoft
Dernière connexion : Identifiant
```

Ne pas utiliser ce plugin comme trace réglementaire/audit : la méthode d'authentification doit également être écrite dans les logs/audits VigiSensys côté serveur.

### 8.6 Microsoft Entra ID

Better Auth supporte Microsoft comme social provider.

Chaque installation doit définir explicitement :

- Client ID ;
- secret/client assertion selon architecture Entra ;
- tenant/politique choisie ;
- callback URI ;
- base URL VigiSensys ;
- accès sortant Internet ;
- stratégie de linking avec un compte VigiSensys existant.

Par défaut : **aucune création automatique de nouvel utilisateur métier depuis Microsoft**.

Le provider doit résoudre un `t_auth_user` déjà provisionné, via une règle sûre (account lié, email vérifié correspondant, ou association administrateur).

### 8.7 SSO OIDC / OAuth2 / SAML

Le plugin SSO Better Auth supporte OIDC, OAuth2 et SAML 2.0.

Cible :

- provisioning contrôlé ;
- `disableImplicitSignUp` lorsque pertinent ;
- mapping vers un utilisateur VigiSensys existant ;
- aucun profil/droit métier accordé directement à partir d'une assertion externe sans mapping explicite ;
- possibilité future de mapper des groupes/claims vers des profils uniquement dans un lot séparé et audité.

Pour les gros clients, le SSO doit être considéré comme une méthode d'identité, pas comme le nouveau moteur d'autorisation VigiSensys.

### 8.8 i18n

Le plugin Better Auth i18n sert à traduire les **erreurs/messages Better Auth**.

L'UI VigiSensys reste sur `next-intl`.

Cible :

- FR + EN uniquement au départ ;
- détection cohérente avec la locale applicative ;
- mapper les codes Better Auth vers une UX stable ;
- éviter de dépendre du texte anglais brut des erreurs.

### 8.9 Have I Been Pwned

À activer uniquement lorsqu'une installation autorise l'accès réseau nécessaire.

Le plugin envoie uniquement le préfixe k-anonymity du hash, pas le mot de passe complet.

Politique recommandée :

- contrôle lors de création/changement de mot de passe ;
- pas de blocage de connexion d'un ancien mot de passe uniquement parce que HIBP devient indisponible ;
- timeout court et comportement explicite en environnement offline ;
- activation par configuration installation.

### 8.10 Passkeys — option ultérieure

Les Passkeys sont techniquement compatibles avec le modèle cible et peuvent fonctionner sans service cloud d'authentification une fois l'application accessible via un contexte WebAuthn valide.

Ne pas les intégrer au premier lot Better Auth :

- HTTPS/origins/rpID doivent être stabilisés ;
- UI de gestion/révocation à concevoir ;
- politique 2FA à clarifier ;
- compatibilité navigateurs/postes clients à tester.

## 9. CFR21 et règles mot de passe

Le passage à Better Auth ne doit pas supprimer les règles existantes.

### 9.1 Password expiration

L'expiration du mot de passe n'a de sens que lorsqu'une authentification par mot de passe est utilisée.

Cible recommandée :

```text
Username + password
  -> appliquer expiration CFR21

Magic Link / Email OTP / Microsoft / SSO / Passkey
  -> ne pas bloquer sur l'âge d'un mot de passe non utilisé
```

Si un client exige une règle différente, elle doit être explicitement paramétrée.

### 9.2 Mot de passe temporaire

Pour un compte credential :

- vérifier `Est_Mot_De_Passe_Temporaire` après validation des credentials mais avant création de la session finale ;
- rediriger vers le workflow de changement forcé ;
- ne pas laisser une session complète utilisable pour contourner l'étape ;
- après changement, mettre à jour les métadonnées historiques `Date_Derniere_Modification_MDP`, etc.

### 9.3 Réinitialisation

Better Auth peut remplacer à terme le reset maison.

La migration doit toutefois préserver :

- non-énumération des comptes ;
- expiration du token/OTP ;
- audit ;
- invalidation des sessions après reset selon politique ;
- compatibilité SMTP on-premise.

Ne supprimer les anciens champs reset de `t_utilisateur` qu'après suppression réelle de tous les anciens endpoints/consommateurs.

## 10. Hooks et services VigiSensys

L'implémentation doit éviter une énorme configuration `auth.ts` contenant tout le métier.

Découpage conceptuel :

```text
website/src/lib/auth/
  better-auth.ts
  auth-client.ts
  auth-config.ts
  auth-user-link.ts
  auth-session-policy.ts
  auth-login-audit.ts
  auth-provider-policy.ts
  auth-email.ts
```

Les noms sont indicatifs.

### 10.1 Avant création d'une session

Le point d'extension doit vérifier, selon la méthode :

- `t_utilisateur` lié existe ;
- `Est_Archive != true` ;
- licence valide ;
- capacité utilisateurs disponible ;
- règles CFR21 applicables ;
- mot de passe temporaire si méthode credential ;
- éventuelle politique 2FA globale.

La règle doit être commune à **toutes les méthodes** qui créent une session, pas uniquement `/sign-in/username`.

### 10.2 Après création d'une session

Mettre à jour sans casser la connexion si une télémétrie secondaire échoue :

- `Date_Heure_Derniere_Connexion` ;
- IP ;
- machine si disponible ;
- `t_postes_clients` ;
- log/audit du login ;
- méthode utilisée (`username`, `microsoft`, `sso:<provider>`, `magic-link`, etc.).

### 10.3 Machine name

Le login actuel reçoit une information `machineName` / headers de compatibilité.

Better Auth ne la connaît pas nativement.

Le PoC doit choisir un mécanisme :

- metadata additionnelle de requête/hook ;
- endpoint VigiSensys post-login idempotent ;
- champ de session additionnel contrôlé serveur.

Ne pas perdre cette information pendant la migration.

## 11. Licence et utilisateurs connectés

Le système actuel approxime un utilisateur connecté via `Date_Heure_Derniere_Connexion` récente.

Avec Better Auth, la table de sessions permet une mesure plus fidèle.

Cible conceptuelle :

```sql
COUNT(DISTINCT vigisensysUserId)
FROM t_auth_session
JOIN t_auth_user ...
WHERE expiresAt > now
```

Règles à trancher :

- plusieurs onglets du même user = 1 utilisateur ;
- plusieurs postes du même user = probablement 1 utilisateur pour la licence actuelle, à confirmer fonctionnellement ;
- sessions 2FA temporaires/non finalisées ne doivent pas compter ;
- sessions révoquées/expirées ne comptent pas ;
- comptes techniques éventuels à traiter explicitement.

Le changement de méthode de comptage doit avoir des tests dédiés et être validé avec les règles commerciales de licence.

## 12. Compatibilité on-premise

Toutes les méthodes ne doivent pas être obligatoires.

### 12.1 Méthodes compatibles avec un environnement isolé

Selon configuration réseau :

- Username + mot de passe : oui ;
- TOTP : oui ;
- sessions Better Auth : oui ;
- Passkey : oui sous réserve HTTPS/WebAuthn/origin ;
- SSO vers un IdP local : potentiellement oui.

### 12.2 Méthodes nécessitant des services externes ou SMTP

- Microsoft Entra : accès réseau au provider ;
- HIBP : accès à l'API HIBP ;
- Magic Link : SMTP ;
- Email OTP : SMTP ;
- SSO cloud : accès au provider concerné.

### 12.3 Feature flags/config installation

Exemple de cible — noms à figer pendant l'implémentation :

```env
AUTH_ENGINE=legacy

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://vigisensys.local

AUTH_USERNAME_ENABLED=true
AUTH_PASSWORD_ENABLED=true
AUTH_TOTP_ENABLED=false
AUTH_MAGIC_LINK_ENABLED=false
AUTH_EMAIL_OTP_ENABLED=false
AUTH_MICROSOFT_ENABLED=false
AUTH_SSO_ENABLED=false
AUTH_HIBP_ENABLED=false
AUTH_PASSKEY_ENABLED=false

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

`BETTER_AUTH_SECRET` doit être indépendant :

- de `JWT_SECRET` ;
- de la clé de chiffrement des secrets applicatifs ;
- des clés Hotline/Agent ;
- des secrets providers OAuth.

La rotation de secret Better Auth doit être documentée avant production.

## 13. Base URL, HTTPS et reverse proxy

Better Auth recommande une `baseURL` explicite.

C'est particulièrement important en on-premise avec Traefik/IIS/reverse proxy, IP, hostname ou URL personnalisée.

Cible :

- installer une URL publique/canonique VigiSensys explicite ;
- ne pas inférer silencieusement une URL localhost en production ;
- définir `trustedOrigins` explicitement ;
- n'activer les headers proxy de confiance que lorsque le proxy est maîtrisé ;
- utiliser HTTPS pour Microsoft, SSO, Magic Link et Passkeys en production ;
- documenter les callback URLs providers.

## 14. Coexistence avec l'auth legacy

Better Auth utilise `/api/auth` par défaut, ce qui entre en conflit avec les routes VigiSensys existantes.

Pendant le PoC et la migration, utiliser un chemin temporaire :

```text
Legacy      /api/auth/*
Better Auth /api/auth-v2/*
```

avec :

```ts
basePath: "/api/auth-v2"
```

La bascule finale pourra replacer Better Auth sous `/api/auth` après suppression/relocalisation des endpoints legacy.

### 14.1 `AUTH_ENGINE`

Pendant plusieurs lots :

```text
AUTH_ENGINE=legacy
AUTH_ENGINE=better-auth
```

La valeur détermine :

- formulaire de login ;
- lecture de session côté serveur ;
- wrappers ;
- logout ;
- auto-lock ;
- refresh legacy uniquement tant qu'il existe.

Objectif : permettre un rollback rapide sur le serveur de test pendant la phase de transition.

### 14.2 Ne pas maintenir deux auths indéfiniment

Le dual mode est temporaire.

Chaque lot doit réduire explicitement le nombre de consommateurs legacy et la roadmap doit avoir un critère de suppression finale.

## 15. Adaptation des helpers existants

### 15.1 `getServerAuthenticatedUserId`

Conserver son contrat autant que possible.

Legacy :

```text
cookie -> JWT -> userId
```

Cible Better Auth :

```text
headers/cookie -> auth.api.getSession -> session.user.vigisensysUserId
```

Ainsi les Server Components utilisant l'ID historique n'ont pas besoin d'être réécrits massivement.

### 15.2 `getAuthenticatedUser` / wrappers API

Faire évoluer la frontière centrale :

- résolution session Better Auth ;
- mapping vers un contexte VigiSensys stable ;
- profil/autorisations récupérés depuis les sources métier existantes ;
- aucune route métier ne doit dépendre directement de la forme interne du cookie Better Auth.

Créer un type applicatif stable, par exemple conceptuellement :

```ts
type AuthenticatedVigiUser = {
  userId: number
  authUserId: string
  login: string
  profile: string
  authorizations: string[]
  authMethod?: string
}
```

La forme exacte sera définie lors du refactor des wrappers.

### 15.3 SSE et lectures directes de cookie

Rechercher explicitement tous les :

- `auth-token` ;
- `refresh-token` ;
- `verifyToken` ;
- `generateAccessToken` ;
- `generateRefreshToken` ;
- cookies lus manuellement dans les SSE ;
- rotations dans `api-logger`/wrappers/proxy.

Aucun chemin direct ne doit survivre silencieusement après la bascule.

## 16. Autorisations et profils

Better Auth ne remplace pas le système métier VigiSensys :

- `t_profil` ;
- `t_autorisation` ;
- liaisons profil/autorisations ;
- groupes ;
- scopes lieux ;
- licences fonctionnelles.

La session Better Auth doit identifier l'utilisateur ; les helpers VigiSensys continuent de décider ce qu'il peut faire.

Ne pas utiliser un plugin Better Auth `admin` ou des rôles SSO comme nouvelle source de vérité des droits sans chantier métier explicite.

## 17. Sécurité du linking de comptes

L'ajout de Microsoft/SSO augmente le risque de mauvais linking.

Règles minimales :

- ne jamais lier un provider à un compte uniquement sur un email non vérifié ;
- ne pas autoriser des providers arbitraires comme trusted providers ;
- privilégier une association administrateur ou un login préalable pour le premier linking si le contexte client l'exige ;
- journaliser ajout/retrait d'une méthode d'authentification ;
- révoquer les sessions si une action sensible de sécurité le nécessite ;
- empêcher un SSO de créer automatiquement un profil administrateur.

## 18. Audit et traçabilité

Les logs/audits VigiSensys doivent conserver au minimum :

- user métier ;
- login ;
- succès/échec ;
- méthode d'authentification ;
- provider si externe ;
- IP ;
- machine lorsque disponible ;
- timestamp ;
- raison générique de refus côté audit interne ;
- événement de logout/révocation si pertinent ;
- activation/désactivation 2FA ;
- ajout/suppression passkey ;
- linking/unlinking provider ;
- reset/changement de mot de passe.

Ne jamais logger :

- mot de passe ;
- OTP ;
- TOTP secret ;
- backup codes ;
- session token ;
- OAuth access/refresh token ;
- secret client provider.

## 19. Installer, seeds et migrations DB

VigiSensys supporte des installations neuves et des upgrades de bases existantes.

Le chantier doit donc mettre à jour :

- `website/prisma/db-main/schema.prisma` uniquement si les tables Better Auth doivent être visibles par Prisma métier ;
- scripts/migrations MySQL ;
- scripts/migrations MSSQL ;
- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql` ;
- vérifications d'objets DB ;
- installer Web ;
- génération des secrets ;
- documentation de configuration.

### 19.1 Pas de migration implicite en production

Le CLI Better Auth peut générer/appliquer des schémas selon l'adapter, mais sur VigiSensys :

- générer/inspecter pendant le développement ;
- versionner le SQL réellement attendu ;
- faire relire le diff MySQL/MSSQL ;
- appliquer via la stratégie d'upgrade VigiSensys ;
- ne pas laisser une version d'application modifier silencieusement le schéma Better Auth au démarrage chez le client.

## 20. Plan de migration par lots

Chaque lot doit partir du HEAD courant de `dev` après merge du lot précédent, sauf demande explicite de travail parallèle.

### Lot BA-0 — documentation / décisions

Ce document.

Objectifs :

- fixer les invariants ;
- lister les décisions ouvertes ;
- éviter un PoC qui contourne CFR21/licence/MySQL/MSSQL.

### Lot BA-1 — PoC technique sans bascule utilisateur

Branche suggérée : `poc/better-auth-foundation`.

Périmètre :

- dépendance Better Auth ;
- route temporaire `/api/auth-v2` ;
- tables `t_auth_*` temporaires/de dev ;
- Username ;
- session 24 h absolue ;
- bcrypt ;
- mapping `vigisensysUserId` ;
- MySQL ;
- MSSQL ;
- tests de création/session/révocation.

**Aucun remplacement du login production dans ce lot.**

Critère Go/No-Go : Better Auth doit fonctionner de façon identique sur les deux providers et permettre le mapping d'un utilisateur existant.

#### État BA-1 — 03/09/2026

Statut : **Go technique validé — PR #88 en revue**.

Branche : `feature/better-auth-foundation-poc`.

Implémentation réalisée :

- Better Auth `1.7.2`, version stable `latest` revérifiée au démarrage effectif du PoC ;
- handler temporaire `/api/auth-v2/[...all]`, désactivé par défaut avec `BETTER_AUTH_POC_ENABLED` ;
- tables isolées `t_auth_poc_user`, `t_auth_poc_session`, `t_auth_poc_account` et `t_auth_poc_verification` ;
- plugin Username sans normalisation afin de préserver les logins historiques ;
- bcrypt pour le provider credentials ;
- mapping explicite `vigisensysUserId` vers un `t_utilisateur` existant et non archivé ;
- session serveur d'une durée absolue de 24 h, sans sliding refresh ni cookie cache ;
- révocation serveur validée au logout ;
- couche DB PoC compatible MySQL via `mysql2` et MSSQL via Kysely `MssqlDialect` / `tedious` / `tarn` ;
- test d'intégration destructif protégé par un garde-fou imposant une base jetable PoC/test/CI.

Un défaut latent de l'initialisation Prisma 7 MySQL a également été mis en évidence pendant le PoC : `PrismaMariaDb` recevait directement l'URL de connexion. Le helper central construit désormais explicitement la configuration de l'adapter depuis l'URL VigiSensys et respecte `allowPublicKeyRetrieval`, déjà présent dans les URLs générées par l'installeur Web.

Validation automatisée finale, avec lockfile figé :

- MySQL `8.0.44` : `pnpm install --frozen-lockfile`, génération Prisma MySQL, `pnpm test:better-auth-poc`, `tsc --noEmit`, ESLint — **OK** ;
- SQL Server `2022` : `pnpm install --frozen-lockfile`, génération Prisma MSSQL, `pnpm test:better-auth-poc`, `tsc --noEmit`, ESLint — **OK** ;
- run GitHub Actions de référence : `33763894690`.

Principaux fichiers :

- `website/src/lib/better-auth/poc/auth.ts` ;
- `website/src/lib/better-auth/poc/database.ts` ;
- `website/src/lib/better-auth/poc/vigisensys-identity.ts` ;
- `website/src/app/api/auth-v2/[...all]/route.ts` ;
- `website/scripts/test-better-auth-poc.ts` ;
- `website/src/lib/mysql-connection.ts` ;
- `website/src/lib/prisma.ts` ;
- `website/package.json` / `website/pnpm-lock.yaml`.

Non-régression / limites volontaires du lot :

- aucun remplacement du login de production ;
- aucun changement des cookies/JWT legacy ;
- aucun schéma final Better Auth dans les seeds ou migrations client ;
- aucune modification des règles CFR21, licence, permissions, profils ou groupes ;
- aucun plugin 2FA, Magic Link, Email OTP, Microsoft ou SSO activé à ce stade.

Après merge de la PR #88, le prochain lot est BA-2. Il devra repartir du nouveau HEAD réel de `dev` et versionner le schéma final ainsi que le provisioning/migration des comptes historiques.

### Lot BA-2 — schéma versionné + provisioning/migration

Branche suggérée : `feature/better-auth-schema-provisioning`.

Périmètre :

- tables finales ;
- migrations MySQL/MSSQL ;
- service de provisioning ;
- script idempotent de migration des comptes ;
- rapport emails/doublons ;
- bcrypt ;
- aucun changement du login actif.

### Lot BA-3 — parité Username/Password

Branche suggérée : `feature/better-auth-credentials`.

Périmètre :

- formulaire compatible Login ;
- CFR21 ;
- password temporaire ;
- première connexion ;
- licence ;
- IP/machine ;
- `t_postes_clients` ;
- audit ;
- `AUTH_ENGINE` ;
- tests E2E login/logout/expiration.

Le moteur legacy reste disponible pour rollback.

### Lot BA-4 — migration des consommateurs de session

Branche suggérée : `refactor/better-auth-session-consumers`.

Périmètre :

- `server-auth.ts` ;
- `auth.ts` ;
- `api-wrappers.ts` ;
- `api-logger.ts` ;
- proxy ;
- `/api/me` ;
- SSE ;
- HTTP client ;
- auto-lock/logout ;
- suppression progressive des rotations JWT.

Critère : aucun code métier ne lit directement le cookie Better Auth.

### Lot BA-5 — licence basée sur les sessions

Branche suggérée : `refactor/license-active-sessions`.

Périmètre :

- compter les utilisateurs Better Auth réellement actifs ;
- tests multi-session/multi-poste ;
- comparaison avec l'ancien calcul ;
- audit terrain/licence.

### Lot BA-6 — sécurité password + UX

Branche suggérée : `feature/auth-security-plugins`.

Périmètre possible :

- Two-factor ;
- Last Login Method ;
- i18n Better Auth ;
- HIBP paramétrable ;
- UI de sécurité utilisateur ;
- recovery/backup codes.

Découper en plusieurs PR si le diff devient important.

### Lot BA-7 — passwordless email

Branche suggérée : `feature/auth-email-passwordless`.

Périmètre :

- email verification policy ;
- Magic Link ;
- Email OTP ;
- SMTP ;
- non-enumeration ;
- rate limit ;
- UI FR/EN.

### Lot BA-8 — Microsoft Entra

Branche suggérée : `feature/auth-microsoft-entra`.

Périmètre :

- provider Microsoft ;
- config install ;
- callback URLs ;
- linking sécurisé ;
- aucune création métier implicite ;
- audit ;
- tests compte existant / email mismatch / provider indisponible.

### Lot BA-9 — SSO entreprise

Branche suggérée : `feature/auth-enterprise-sso`.

Périmètre :

- OIDC/SAML ;
- provisioning contrôlé ;
- providers client ;
- mapping identités ;
- documentation administrateur.

### Lot BA-10 — nettoyage legacy

Uniquement après plusieurs validations :

- supprimer refresh JWT ;
- supprimer access JWT Web ;
- supprimer anciens cookies ;
- supprimer endpoints legacy ;
- supprimer champs DB réellement obsolètes après migration ;
- enlever `AUTH_ENGINE=legacy` ;
- mettre à jour toutes les docs/installers.

Ne pas confondre les JWT Web avec d'éventuels tokens nécessaires à d'autres frontières (Hotline/Agent/etc.).

## 21. Tests obligatoires

### 21.1 Matrice DB

Chaque lot DB/auth sensible doit être testé sur :

- MySQL ;
- MSSQL.

### 21.2 Session

- login valide ;
- login invalide ;
- utilisateur archivé ;
- session disponible côté Server Component ;
- session disponible côté API ;
- expiry 24 h absolue ;
- activité avant expiry sans prolongement après deadline ;
- logout ;
- logout auto ;
- révocation ;
- logout all si exposé ;
- session supprimée/expirée refusée ;
- cookies Secure/SameSite/HttpOnly selon environnement.

### 21.3 Credentials/CFR21

- bcrypt historique ;
- changement de mot de passe ;
- mot de passe temporaire ;
- expiration ;
- avertissement avant expiration si conservé ;
- première connexion ;
- reset ;
- anciennes sessions révoquées selon politique.

### 21.4 Licence

- sous limite ;
- à la limite ;
- au-dessus ;
- même utilisateur plusieurs sessions ;
- sessions expirées ;
- licence invalide ;
- licence illimitée.

### 21.5 Username

- casse ;
- caractères historiques ;
- longueur ;
- doublons ;
- immutabilité ;
- non-énumération.

### 21.6 Plugins

Pour chaque plugin activé :

- feature flag off ;
- feature flag on ;
- service externe indisponible ;
- erreurs traduites FR/EN ;
- audit ;
- révocation/recovery ;
- compatibilité on-premise.

### 21.7 E2E prioritaires

- username/password -> dashboard ;
- 2FA -> dashboard ;
- logout -> login ;
- session expirée -> login ;
- utilisateur sans droits -> 403 ;
- utilisateur archivé -> refus ;
- limite licence -> refus ;
- Microsoft/SSO compte lié -> dashboard ;
- provider externe compte inconnu -> refus/provisioning contrôlé ;
- Magic Link/OTP utilisateur existant -> dashboard.

## 22. Rollback

Chaque lot avant BA-10 doit pouvoir revenir en arrière sans perte de données métier.

Principes :

- ne pas supprimer les hashes legacy au début ;
- ne pas supprimer les anciennes colonnes reset/session tant que le fallback existe ;
- migrations DB additives d'abord ;
- `AUTH_ENGINE=legacy` disponible sur serveur de test pendant la transition ;
- les nouvelles tables Better Auth peuvent rester présentes même si le moteur est repassé en legacy ;
- documenter toute donnée écrite uniquement côté Better Auth avant de rendre le rollback impossible.

## 23. Décisions confirmées

- `t_utilisateur` reste la source de vérité métier.
- Better Auth est la cible recommandée pour l'authentification/session Web.
- Le login historique reste disponible via Username + password.
- Les IDs métier numériques restent utilisés dans le reste de l'application.
- Les autorisations/profils/licences fonctionnelles restent VigiSensys.
- Les règles CFR21 ne sont pas supprimées.
- Les sessions Better Auth doivent respecter une durée absolue, pas glissante indéfiniment.
- MySQL et MSSQL sont des critères bloquants du PoC.
- Aucun nouveau compte métier implicite via Magic Link/OTP/Microsoft/SSO.
- Toutes les méthodes additionnelles sont activables par installation.
- `next-intl` reste le système i18n UI ; Better Auth i18n traduit les erreurs auth.
- Pas de migration big-bang.

## 24. Décisions encore ouvertes à valider par PoC ou métier

- Kysely uniforme MySQL/MSSQL vs stratégie hybride Prisma/Kysely.
- Séparation `t_auth_user` (recommandée) vs mapping direct `t_utilisateur` (alternative PoC).
- Sensibilité à la casse exacte des `Login` historiques.
- Politique pour les comptes sans email réel.
- Politique `emailVerified` lors de la migration.
- Règle 2FA globale pour les méthodes passwordless/sociales.
- Définition commerciale exacte d'un « utilisateur connecté » multi-poste pour la licence.
- Stratégie Microsoft : application Entra par client vs configuration centralisée MC2.
- Politique de linking initial Microsoft/SSO.
- Conservation ou remplacement exact des règles de password expiration pour les clients CFR21.
- Activation des Passkeys dans V1 ou chantier ultérieur.

Toute décision tranchée doit être reportée dans ce document au moment de la PR correspondante.

## 25. Fichiers/zones probablement concernés lors de l'implémentation

Cette liste sert de carte initiale, pas de liste exhaustive :

### Auth/session

- `website/src/lib/jwt.ts`
- `website/src/lib/auth.ts`
- `website/src/lib/server-auth.ts`
- `website/src/lib/api-wrappers.ts`
- `website/src/lib/api-logger.ts`
- `website/src/lib/http.ts`
- `website/src/proxy.ts`
- `website/src/app/api/auth/**`
- `website/src/app/api/me/route.ts`

### Utilisateurs

- `website/src/app/api/utilisateurs/**`
- `website/src/app/[locale]/(admin)/admin/utilisateurs/**`
- `website/prisma/db-main/schema.prisma`

### Licence

- `website/src/lib/license-user-limit.ts`
- helpers licence associés.

### DB/install

- `db/vigisensys_seed.sql`
- `db/vigisensys_seed_mssql.sql`
- scripts de migration/verify DB ;
- installer Web ;
- `.env.example` / configuration install.

### Auth directe à rechercher

Avant BA-4, refaire une recherche complète de :

```text
auth-token
refresh-token
verifyToken
generateToken
generateAccessToken
generateRefreshToken
JWT_SECRET
cookies.get(...auth...)
```

## 26. Definition of Done du chantier Better Auth

Le chantier global n'est terminé que lorsque :

- Username/password fonctionne avec les comptes historiques sans reset massif ;
- MySQL et MSSQL sont supportés et testés ;
- les sessions ont une durée absolue conforme ;
- logout/révocation sont serveur ;
- CFR21 est préservé ;
- licence est préservée/améliorée ;
- IP/machine/`t_postes_clients` sont préservés ;
- audits sont au moins équivalents ;
- toutes les routes protégées utilisent une frontière commune ;
- aucun consommateur Web n'a besoin de décoder un JWT maison ;
- les providers activés sont configurables par installation ;
- les méthodes offline continuent de fonctionner sans Internet ;
- les méthodes externes échouent proprement quand leur service est indisponible ;
- le système legacy a été supprimé seulement après validation ;
- docs architecture/API/install ont été mises à jour ;
- migrations client sont versionnées et réversibles autant que possible.

## 27. Références Better Auth vérifiées

Documentation officielle consultée le 01/09/2026 :

- Installation / handler Next.js / secret / base URL : https://better-auth.com/docs/installation
- Options `basePath`, sessions, comptes : https://better-auth.com/docs/reference/options
- Database, custom models/fields, additional fields, hooks : https://better-auth.com/docs/concepts/database
- Session management : https://better-auth.com/docs/concepts/session-management
- API serveur / `getSession` : https://better-auth.com/docs/concepts/api
- Username : https://better-auth.com/docs/plugins/username
- Email/password et hash custom : https://better-auth.com/docs/authentication/email-password
- Migration bcrypt : https://better-auth.com/docs/guides/clerk-migration-guide
- Two-factor : https://better-auth.com/docs/plugins/2fa
- Magic Link : https://better-auth.com/docs/plugins/magic-link
- Email OTP : https://better-auth.com/docs/plugins/email-otp
- Last Login Method : https://better-auth.com/docs/plugins/last-login-method
- Microsoft : https://better-auth.com/docs/authentication/microsoft
- SSO OIDC/OAuth2/SAML : https://better-auth.com/docs/plugins/sso
- i18n : https://better-auth.com/docs/plugins/i18n
- Have I Been Pwned : https://better-auth.com/docs/plugins/have-i-been-pwned
- Passkey : https://better-auth.com/docs/plugins/passkey
- MSSQL : https://better-auth.com/docs/adapters/mssql
- Autres bases relationnelles/Kysely : https://better-auth.com/docs/adapters/other-relational-databases
- Prisma adapter : https://better-auth.com/docs/adapters/prisma
- CLI/migration plan : https://better-auth.com/docs/concepts/cli

Lors du démarrage du PoC, vérifier la version stable courante de Better Auth et relire les pages correspondant aux plugins effectivement activés.
