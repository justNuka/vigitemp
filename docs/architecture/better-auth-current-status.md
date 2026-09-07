# Better Auth — état courant de la branche dédiée

> **Branche de travail : `feature/better-auth-refactor`.**
>
> Ce chantier est volontairement isolé de `dev` afin de conserver une branche stable pour les correctifs destinés aux installations clientes existantes. Tant que la migration Better Auth n'est pas explicitement validée et mergée, `dev` ne doit pas être considéré comme utilisant Better Auth au runtime.
>
> Ce document décrit l'implémentation réellement présente sur la branche dédiée. `better-auth-migration.md` reste le document d'architecture/roadmap historique ; lorsqu'une affirmation des deux documents diverge sur l'état d'implémentation, le code de la branche puis ce document font foi.

## 1. État fonctionnel actuel

La première fondation Better Auth est implémentée et testée sur **MySQL 8** et **SQL Server 2022**.

La migration reste volontairement progressive :

- `t_utilisateur` reste la source de vérité métier ;
- Better Auth utilise ses tables techniques `t_auth_*` ;
- le login applicatif historique `/api/auth/login` reste la façade de connexion ;
- les contrôles métier VigiSensys restent exécutés avant la création de session : compte archivé, bcrypt, CFR21, mot de passe temporaire, capacité licence, audit et métadonnées machine ;
- une session Better Auth est créée en parallèle lorsque le runtime est activé ;
- les JWT historiques restent temporairement émis afin de ne pas casser les routes et consommateurs qui n'ont pas encore été migrés vers les lecteurs Better Auth ;
- le logout manuel et le logout d'inactivité révoquent la session Better Auth et suppriment également les cookies historiques ;
- les endpoints Better Auth bruts sous `/api/auth-v2/*` restent fermés par défaut afin de ne pas contourner les règles métier du login VigiSensys.

Cette étape est donc une **transition dual-session contrôlée**, pas encore la suppression des JWT historiques.

## 2. Configuration runtime

### 2.1 Activation

```env
BETTER_AUTH_ENABLED=true
BETTER_AUTH_SECRET=<secret-aléatoire-d'au-moins-32-caractères>
```

`BETTER_AUTH_SECRET` ne doit jamais être versionné ni partagé entre clients. Il doit être généré par installation.

`BETTER_AUTH_URL` peut être défini explicitement :

```env
BETTER_AUTH_URL=https://vigisensys.local
```

À défaut, Better Auth réutilise `NEXT_PUBLIC_APP_URL`. En production, l'une de ces deux valeurs doit donc être correctement configurée.

### 2.2 API Better Auth publique

```env
BETTER_AUTH_PUBLIC_API_ENABLED=false
```

La valeur doit rester absente ou à `false` pendant la transition. L'ouverture directe de `/api/auth-v2/*` permettrait sinon d'utiliser des routes Better Auth sans passer par les contrôles CFR21, licence, audit et machine de `/api/auth/login`.

Les appels Better Auth nécessaires à la transition sont réalisés côté serveur via l'API interne de la librairie et ne nécessitent pas d'ouvrir cette façade publique.

## 3. Politique de session et inactivité

### 3.1 Session Better Auth

La session serveur Better Auth est configurée avec :

- `expiresIn = 3600 s` ;
- `updateAge = 300 s` ;
- refresh de session activé ;
- cookie cache désactivé pour conserver la base comme source de vérité pendant cette phase.

La session est donc une **session glissante d'une heure**.

### 3.2 Source de vérité de l'inactivité utilisateur

Le délai de déconnexion automatique continue de venir de :

```text
t_parametre
Section = CFR21
Mot_Cle = TEMPS_DECONNEXION_MINUTES
```

Exemple courant :

```text
Valeur = 60
```

`/api/parametres/auto-lock` lit cette valeur et le hook `useAutoLock` l'utilise comme durée d'inactivité navigateur.

Une valeur positive active l'auto-lock. Une valeur nulle ou négative désactive l'auto-lock applicatif selon le comportement historique de l'endpoint.

### 3.3 Extension sur activité réelle

Les événements utilisateur pris en compte comprennent notamment : souris, clavier, scroll, touch et clic.

Sur activité :

1. le timer d'inactivité est repoussé ;
2. l'activité est propagée aux autres onglets du même navigateur ;
3. au maximum une fois toutes les quatre minutes, le navigateur appelle `POST /api/auth/session-touch` ;
4. ce endpoint demande à Better Auth de relire/rafraîchir la session et renvoie les nouveaux headers/cookies si Better Auth décide qu'un update est nécessaire.

Le throttling évite un appel HTTP sur chaque mouvement de souris tout en restant inférieur à `updateAge = 5 min`.

### 3.4 Plusieurs onglets

L'activité est synchronisée par `localStorage` entre les onglets de la même origine.

Cela évite le cas dangereux suivant :

```text
Onglet A : utilisateur actif
Onglet B : oublié pendant 60 min
        ↓
ancien comportement possible : B déclenche le logout global
        ↓
session révoquée alors que A était actif
```

Avec la synchronisation, l'activité de A repousse aussi le timer de B.

### 3.5 Ajustage et étalonnage

Les pages d'opération :

- `/admin/metrologie/realiser-ajustage` ;
- `/admin/metrologie/realiser-etalonnage` ;

conservent leur exception historique : l'auto-logout par inactivité est neutralisé pendant l'opération.

Comme une session Better Auth d'une heure expirerait autrement même sans timer navigateur, ces pages envoient un heartbeat interne `session-touch` toutes les quatre minutes tant qu'elles restent montées.

L'objectif est qu'une opération métrologique longue ne soit jamais interrompue uniquement parce que l'opérateur ne touche pas l'interface.

## 4. Identité et mots de passe

### 4.1 Mapping métier

Better Auth ne crée pas de nouvel utilisateur métier autonome.

Le provisioning technique n'est autorisé que pour un `t_utilisateur` existant et associe :

```text
t_auth_user.vigisensysUserId -> t_utilisateur.Id_Utilisateur
```

Le `Login` historique devient le username Better Auth et reste l'identifiant saisi par l'utilisateur.

### 4.2 Email historique

Lorsque `Adresse_Email` est utilisable et unique, elle peut être reprise comme email technique Better Auth.

Lorsqu'un compte historique n'a pas d'email exploitable ou qu'une collision existe, une adresse réservée sous `@auth.invalid` est utilisée uniquement comme pont technique. Cette adresse ne doit jamais être traitée comme une adresse délivrable pour Magic Link, OTP, reset ou liaison Microsoft.

### 4.3 Bcrypt

Le hash bcrypt historique de `t_utilisateur.Mot_De_Passe` reste compatible avec Better Auth grâce aux fonctions `hash` / `verify` personnalisées.

Pendant la transition, le credential Better Auth est synchronisé depuis ce hash existant. Aucun mot de passe en clair n'est persisté.

## 5. Accès aux bases

La migration a révélé deux incompatibilités de parsing avec les adapters Prisma 7. Elles sont maintenant centralisées dans `website/src/lib/database-connection.ts`.

Ce helper est réutilisé par :

- `src/lib/prisma.ts` ;
- `src/lib/prisma-chat.ts` ;
- `src/lib/better-auth/database.ts`.

Il gère notamment :

- MySQL/MariaDB avec configuration structurée de `PrismaMariaDb` ;
- `allowPublicKeyRetrieval` ;
- SQL Server et les propriétés séparées par `;` ;
- décodage des credentials encodés dans les URLs ;
- valeurs SQL Server entre accolades ;
- `encrypt` et `trustServerCertificate`.

Cette centralisation évite que Prisma et Better Auth interprètent différemment la même configuration d'installation.

## 6. Validation automatisée

La branche possède actuellement le workflow dédié :

```text
.github/workflows/_temp-better-auth-foundation.yml
```

Il est volontairement déclenché uniquement sur `feature/better-auth-refactor`.

La matrice vérifie :

- installation figée via `pnpm install --frozen-lockfile` ;
- génération Prisma ;
- TypeScript ;
- ESLint des fichiers du lot auth/session ;
- création d'une base minimale 0.90.1 ;
- application de la migration DB 0.90.2 ;
- tests Better Auth sur MySQL 8 ;
- tests Better Auth sur SQL Server 2022 ;
- mapping d'un utilisateur métier existant ;
- rejet d'un provisioning inconnu ;
- bcrypt ;
- connexion par username ;
- création de session ;
- expiration d'environ une heure ;
- refresh glissant ;
- sign-out et révocation.

Avant de déclarer un lot testable, les trois jobs `static-checks`, `mysql-foundation` et `mssql-foundation` doivent être verts sur le HEAD concerné.

## 7. Première validation manuelle recommandée

Pour une première validation sur une machine de test, ne pas déployer directement chez un client.

### Préparation

1. utiliser la branche `feature/better-auth-refactor` ;
2. installer/appliquer un schéma contenant les tables `t_auth_*` de la version DB 0.90.2 ;
3. conserver un utilisateur VigiSensys existant dont le mot de passe bcrypt est connu ;
4. générer un `BETTER_AUTH_SECRET` aléatoire d'au moins 32 caractères ;
5. définir `BETTER_AUTH_ENABLED=true` ;
6. laisser `BETTER_AUTH_PUBLIC_API_ENABLED` désactivé ;
7. vérifier `NEXT_PUBLIC_APP_URL` ou définir `BETTER_AUTH_URL` avec l'origine réellement utilisée par le navigateur ;
8. redémarrer le service Web après modification de l'environnement.

### Scénarios

- connexion classique `Login + mot de passe` ;
- contrôle que l'application fonctionne normalement après login ;
- contrôle des tables `t_auth_user`, `t_auth_account` et `t_auth_session` ;
- vérification qu'une nouvelle session n'ajoute pas un doublon métier dans `t_utilisateur` ;
- navigation active pendant plus d'une heure : la session doit rester valide ;
- deux onglets ouverts : activité dans l'un, aucun logout intempestif dans l'autre ;
- logout manuel : la session `t_auth_session` correspondante doit être révoquée/supprimée selon le lifecycle Better Auth ;
- réduire temporairement `CFR21/TEMPS_DECONNEXION_MINUTES` sur une base de test, par exemple à `2`, puis vérifier le logout après deux minutes sans activité ;
- avec cette même valeur, effectuer une activité avant l'échéance et vérifier que le délai repart ;
- tester une page d'ajustage/étalonnage au-delà du délai d'auto-lock configuré et vérifier qu'elle reste connectée ;
- vérifier FR/EN et le message de retour vers la connexion après inactivité.

Après ce test, remettre la valeur CFR21 prévue pour l'installation.

## 8. Ce qui reste volontairement à migrer

Cette première version n'enlève pas encore la plomberie JWT historique.

Restent notamment :

- migration de `getAuthenticatedUser` vers une résolution Better Auth ;
- migration de `getServerAuthenticatedUserId` ;
- migration des wrappers API et des routes qui lisent directement `auth-token` ;
- traitement des flux SSE ;
- remplacement du refresh JWT historique ;
- comptage licence à partir des vraies sessions Better Auth ;
- suppression finale des cookies `token` / `auth-token` / `refresh-token` ;
- adaptation complète de l'installateur pour générer et persister automatiquement le secret Better Auth lors du déploiement ;
- tests E2E navigateur du cycle de session ;
- lots ultérieurs : reset password Better Auth, Microsoft, 2FA, Magic Link, Email OTP, Last Login Method, SSO, i18n Better Auth et HIBP.

Ces travaux doivent rester découpés afin que la première validation de la fondation n'introduise pas simultanément une migration de plusieurs dizaines de routes API.

## 9. Fichiers principaux de la fondation actuelle

- `website/src/lib/better-auth/auth.ts`
- `website/src/lib/better-auth/database.ts`
- `website/src/lib/better-auth/credentials.ts`
- `website/src/lib/better-auth/vigisensys-identity.ts`
- `website/src/lib/better-auth/response-headers.ts`
- `website/src/lib/better-auth/session.ts`
- `website/src/lib/database-connection.ts`
- `website/src/lib/prisma.ts`
- `website/src/lib/prisma-chat.ts`
- `website/src/app/api/auth/login/route.ts`
- `website/src/app/api/auth/logout/route.ts`
- `website/src/app/api/auth/logout-auto/route.ts`
- `website/src/app/api/auth/session-touch/route.ts`
- `website/src/app/api/auth-v2/[...all]/route.ts`
- `website/src/hooks/useAutoLock.ts`
- `website/scripts/test-better-auth-foundation.ts`
- `.github/workflows/_temp-better-auth-foundation.yml`

## 10. Reprise dans une future conversation

Toujours commencer par :

1. vérifier le HEAD réel de `dev` ;
2. vérifier le HEAD réel de `feature/better-auth-refactor` ;
3. vérifier les PR ouvertes et les derniers merges ;
4. vérifier le dernier workflow Better Auth de la branche ;
5. comparer la branche à `dev` ;
6. lire ce document et `better-auth-migration.md` ;
7. seulement ensuite reprendre le lot suivant.

Ne jamais merger `feature/better-auth-refactor` dans `dev` sans validation explicite de l'utilisateur.
