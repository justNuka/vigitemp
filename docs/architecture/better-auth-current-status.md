# Better Auth — état courant et préparation d'intégration

> **Branche actuelle : `feature/better-auth-refactor`.**
>
> La fondation Better Auth a été développée volontairement sur une branche longue durée afin de ne pas perturber `dev` pendant les correctifs clients urgents. Le 09/09/2026, après validation automatique et validation fonctionnelle interne, l'utilisateur a explicitement autorisé la préparation de son intégration dans `dev`.
>
> Ce document décrit l'implémentation réellement présente. `better-auth-migration.md` reste le document d'architecture/roadmap historique ; lorsqu'une affirmation diverge, le code puis ce document font foi.

## 1. Statut d'intégration au 09/09/2026

La branche a été resynchronisée avec le HEAD réel de `dev` :

```text
dev : 1e78439a82a835a49012133b5ae8a936ec15f30d
merge de dev dans feature/better-auth-refactor : 8e6c3e3c237cc28fcce1ec10caab0857a13ccd5d
```

Le merge de synchronisation a conservé l'intégralité des changements récents de `dev` (métrologie, sondes IC/IP/IH, conversion platine IP, page Paramètres, téléphonie, etc.) et a réappliqué uniquement le diff Better Auth.

Après synchronisation, la comparaison GitHub `dev...feature/better-auth-refactor` indiquait :

- branche `behind = 0` ;
- uniquement les fichiers Better Auth / session / accès DB associés dans le diff ;
- aucun fichier parasite issu des lots Serveur ou Paramètres.

La branche est donc prête à être proposée en PR vers `dev` après le nettoyage documentaire/final effectué dans ce lot.

## 2. État fonctionnel actuel

La première fondation Better Auth est implémentée et testée sur **MySQL 8** et **SQL Server 2022**.

La migration reste volontairement progressive :

- `t_utilisateur` reste la source de vérité métier ;
- Better Auth utilise ses tables techniques `t_auth_*` ;
- le login applicatif historique `/api/auth/login` reste la façade de connexion ;
- les contrôles métier VigiSensys restent exécutés avant la création de session : compte archivé, bcrypt, CFR21, mot de passe temporaire, capacité licence, audit et métadonnées machine ;
- une session Better Auth est créée en parallèle lorsque le runtime est activé ;
- les JWT historiques restent temporairement émis afin de ne pas casser les routes et consommateurs qui n'ont pas encore été migrés ;
- le logout manuel et le logout d'inactivité révoquent la session Better Auth et suppriment également les cookies historiques ;
- les endpoints Better Auth bruts sous `/api/auth-v2/*` restent fermés par défaut afin de ne pas contourner les règles métier du login VigiSensys.

Cette étape est donc une **transition dual-session contrôlée**, pas encore la suppression des JWT historiques.

## 3. Sécurité de l'intégration dans `dev` / `main`

### 3.1 Better Auth est désactivé par défaut

Le runtime n'est actif que si :

```env
BETTER_AUTH_ENABLED=true
```

Si la variable est absente, vide ou différente d'une valeur vraie reconnue (`1`, `true`, `yes`, `on`), `isBetterAuthRuntimeEnabled()` retourne `false`.

**Conséquence : merger le code Better Auth dans `dev` puis `main` n'active pas Better Auth automatiquement chez les clients existants.** Une installation qui ne possède pas ces variables continue d'utiliser le parcours historique JWT.

### 3.2 API publique fermée indépendamment

Même lorsque le runtime Better Auth est activé, les routes publiques `/api/auth-v2/*` nécessitent en plus :

```env
BETTER_AUTH_PUBLIC_API_ENABLED=true
```

Pendant la transition cette variable doit rester absente ou à `false`.

Les appels Better Auth nécessaires au login VigiSensys sont effectués côté serveur via l'API interne de la librairie et ne nécessitent pas d'ouvrir cette façade publique.

### 3.3 Secret par installation

Pour une installation où Better Auth est activé :

```env
BETTER_AUTH_SECRET=<secret-aléatoire-d'au-moins-32-caractères>
```

Le secret ne doit jamais être versionné ni partagé entre installations.

Le helper :

```text
website/scripts/configure-better-auth.ps1
```

permet de générer/configurer ce secret sans l'afficher. L'intégration complète dans l'installateur reste un chantier ultérieur.

## 4. Base URL et cookies

`BETTER_AUTH_URL` peut être défini explicitement :

```env
BETTER_AUTH_URL=https://vigisensys.local
```

À défaut, Better Auth réutilise `NEXT_PUBLIC_APP_URL`.

Le premier test terrain a mis en évidence puis permis de corriger un bug du bridge de cookies : les `Set-Cookie` Better Auth pouvaient être perdus si les cookies JWT historiques étaient écrits après eux dans `NextResponse`.

Le comportement final est :

1. les cookies JWT historiques sont écrits/effacés ;
2. les headers `Set-Cookie` Better Auth sont ajoutés en dernier ;
3. `auth-token`, `refresh-token` et `vigisensys-auth-v2.session_token` peuvent donc coexister pendant la transition.

Un test automatisé dédié existe :

```text
website/scripts/test-better-auth-cookie-bridge.ts
```

## 5. Politique de session et inactivité

### 5.1 Session Better Auth

La session serveur Better Auth est configurée avec :

- `expiresIn = 3600 s` ;
- `updateAge = 300 s` ;
- refresh de session activé ;
- cookie cache désactivé pour conserver la base comme source de vérité pendant cette phase.

La session est donc une **session glissante d'une heure**.

### 5.2 Source de vérité de l'inactivité utilisateur

Le délai de déconnexion automatique continue de venir de :

```text
t_parametre
Section = CFR21
Mot_Cle = TEMPS_DECONNEXION_MINUTES
```

`/api/parametres/auto-lock` lit cette valeur et `useAutoLock` l'utilise comme durée d'inactivité navigateur.

Une valeur positive active l'auto-lock ; une valeur nulle ou négative le désactive selon le comportement de l'endpoint.

### 5.3 Extension sur activité réelle

Les événements utilisateur pris en compte comprennent notamment souris, clavier, scroll, touch et clic.

Sur activité :

1. le timer d'inactivité est repoussé ;
2. l'activité est propagée aux autres onglets du même navigateur ;
3. au maximum une fois toutes les quatre minutes, le navigateur appelle `POST /api/auth/session-touch` ;
4. cet endpoint demande à Better Auth de relire/rafraîchir la session et propage les nouveaux cookies si un update est nécessaire.

Le throttling reste inférieur à `updateAge = 5 min`.

### 5.4 Plusieurs onglets

L'activité est synchronisée par `localStorage` entre les onglets de la même origine. Un onglet oublié ne doit donc pas déconnecter une session alors que l'utilisateur travaille activement dans un autre onglet.

### 5.5 Ajustage et étalonnage

Les pages :

- `/admin/metrologie/realiser-ajustage` ;
- `/admin/metrologie/realiser-etalonnage` ;

neutralisent l'auto-logout local pendant l'opération et maintiennent la session Better Auth via heartbeat.

Ce scénario reste le seul test manuel de session non encore exécuté lors du checkpoint du 09/09/2026. Il n'est pas considéré bloquant pour l'intégration du code car le comportement est protégé explicitement et Better Auth reste désactivé par défaut chez les clients.

## 6. Identité et mots de passe

Better Auth ne crée pas de nouvel utilisateur métier autonome.

Le provisioning technique n'est autorisé que pour un `t_utilisateur` existant et associe :

```text
t_auth_user.vigisensysUserId -> t_utilisateur.Id_Utilisateur
```

Le `Login` historique devient le username Better Auth.

Lorsque `Adresse_Email` est utilisable et unique, elle peut être reprise comme email technique. Sinon une adresse réservée sous `@auth.invalid` est utilisée uniquement comme pont technique ; elle ne doit jamais servir de destination réelle pour Magic Link, OTP ou reset.

Le hash bcrypt historique de `t_utilisateur.Mot_De_Passe` reste la source de vérité pendant la transition. Le credential Better Auth est synchronisé depuis ce hash après validation du login métier ; aucun mot de passe en clair n'est persisté.

## 7. Accès MySQL / SQL Server

La fondation centralise le parsing des connexions dans :

```text
website/src/lib/database-connection.ts
```

Ce helper est réutilisé par :

- `src/lib/prisma.ts` ;
- `src/lib/prisma-chat.ts` ;
- `src/lib/better-auth/database.ts`.

Il gère notamment :

- MySQL/MariaDB avec configuration structurée `PrismaMariaDb` ;
- `allowPublicKeyRetrieval` ;
- SQL Server et ses propriétés séparées par `;` ;
- credentials URL-encodés ;
- valeurs SQL Server entre accolades ;
- `encrypt` et `trustServerCertificate`.

Les clients Prisma ont également été rendus paresseux afin que le build standalone puisse analyser les routes sans exiger une connexion DB de production à l'import des modules.

## 8. Validation automatique finale avant PR

Le workflow temporaire :

```text
.github/workflows/_temp-better-auth-foundation.yml
```

a été conservé le temps de tester **la branche Better Auth resynchronisée avec le vrai HEAD de `dev`**.

Dernière validation complète :

```text
GitHub Actions run : 34327210180
Commit testé       : 8e6c3e3c237cc28fcce1ec10caab0857a13ccd5d
```

Résultat :

- `static-checks` : ✅
  - `pnpm install --frozen-lockfile` ;
  - génération Prisma MySQL ;
  - TypeScript ;
  - ESLint du lot Better Auth ;
  - validation du helper PowerShell ;
  - **build Next standalone production** ;
- `mysql-foundation` : ✅
  - baseline 0.90.1 ;
  - migration 0.90.2 ;
  - schéma final ;
  - provisioning, credentials, session, refresh et logout Better Auth ;
- `mssql-foundation` : ✅ avec les mêmes validations sur SQL Server 2022.

Le workflow était volontairement temporaire et a été **supprimé après cette validation réussie**, avant la PR finale vers `dev`. Les scripts de test restent versionnés afin de pouvoir être réutilisés dans une future CI permanente.

## 9. Validation manuelle effectuée

Validation réalisée sur l'environnement interne / serveur de test avec Better Auth activé.

| Scénario | État |
| --- | --- |
| Connexion classique + présence du cookie Better Auth | ✅ validé |
| Mouvement souris / navigation sans `401 session-touch` | ✅ validé |
| Activité au-delà du timeout : session conservée | ✅ validé |
| Aucune activité au-delà du timeout : déconnexion | ✅ validé |
| Deux onglets : pas de déconnexion prématurée | ✅ validé |
| Logout manuel : cookies et session invalidés | ✅ validé |
| Métrologie au-delà du timeout | ⏳ à tester ultérieurement |

La création des lignes `t_auth_user`, `t_auth_account` et `t_auth_session` a également été observée sur l'environnement de test. Les sessions créées respectaient l'expiration d'une heure.

## 10. Ce qui reste volontairement à migrer

Cette première intégration n'enlève pas encore la plomberie JWT historique.

Restent notamment :

- migration de `getAuthenticatedUser` vers une résolution Better Auth ;
- migration de `getServerAuthenticatedUserId` ;
- migration des wrappers API et routes qui lisent directement `auth-token` ;
- traitement des flux SSE ;
- remplacement du refresh JWT historique ;
- comptage licence à partir des vraies sessions Better Auth ;
- suppression finale des cookies `token` / `auth-token` / `refresh-token` ;
- adaptation complète de l'installateur pour générer/persister automatiquement le secret Better Auth ;
- tests E2E navigateur du cycle de session ;
- reset password Better Auth ;
- Microsoft ;
- 2FA ;
- Magic Link ;
- Email OTP ;
- Last Login Method ;
- SSO ;
- i18n Better Auth ;
- Have I Been Pwned pour les mots de passe.

Ces évolutions doivent rester découpées et ne doivent pas être mélangées à la PR d'intégration de la fondation.

## 11. Fichiers principaux

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
- `website/scripts/configure-better-auth.ps1`
- `website/scripts/test-better-auth-foundation.ts`
- `website/scripts/test-better-auth-cookie-bridge.ts`

## 12. Reprise après intégration

Tant que la PR finale n'est pas mergée, `feature/better-auth-refactor` reste la branche de référence du chantier.

Après merge dans `dev` :

1. vérifier réellement le SHA de merge et le nouveau HEAD de `dev` ;
2. considérer la longue branche `feature/better-auth-refactor` comme historique ;
3. pour les prochains lots Better Auth, repartir du **HEAD courant de `dev`** sur des branches ciblées (`refactor/...`, `feature/...`, `fix/...`) comme pour les autres travaux ;
4. garder `BETTER_AUTH_ENABLED` désactivé sur les installations clientes tant que MC2 n'a pas décidé de l'activer ;
5. continuer à lire `better-auth-migration.md` puis ce document avant chaque nouveau lot d'authentification.

Ne jamais merger automatiquement la PR finale : le merge reste effectué par l'utilisateur.
