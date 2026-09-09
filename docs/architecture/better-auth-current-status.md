# Better Auth — état courant

> Référence canonique de l'état réellement intégré de Better Auth dans VigiSensys.
>
> `docs/architecture/better-auth-migration.md` reste la roadmap d'architecture historique. Lorsqu'une affirmation diverge, le code courant puis ce document font foi.

## 1. Statut d'intégration au 09/09/2026

La fondation Better Auth a été intégrée dans `dev` via la PR #101 puis publiée dans `main` via la PR de release #102.

La longue branche historique `feature/better-auth-refactor` ne doit plus servir de base aux nouveaux développements. Les prochains lots Better Auth doivent repartir du **HEAD courant de `dev`** sur des branches ciblées (`feature/...`, `fix/...`, `refactor/...`).

Le runtime reste une transition dual-session :

- `t_utilisateur` reste la source de vérité métier ;
- Better Auth utilise les tables techniques `t_auth_*` ;
- `/api/auth/login` reste la façade de connexion VigiSensys ;
- les contrôles métier historiques restent exécutés avant création de session : compte archivé, bcrypt, CFR21, mot de passe temporaire, capacité licence, audit et métadonnées machine ;
- une session Better Auth est créée en parallèle lorsque le runtime est activé ;
- les JWT historiques restent temporairement émis pour les routes/consommateurs non encore migrés ;
- logout manuel et logout d'inactivité révoquent Better Auth et suppriment les cookies historiques ;
- l'API Better Auth brute sous `/api/auth-v2/*` reste fermée par défaut.

## 2. Activation runtime et API publique

Le runtime Better Auth est actif lorsque :

```env
BETTER_AUTH_ENABLED=true
```

Les valeurs reconnues comme vraies sont `1`, `true`, `yes` et `on`.

L'API publique `/api/auth-v2/*` possède un coupe-circuit indépendant :

```env
BETTER_AUTH_PUBLIC_API_ENABLED=true
```

Pendant la transition VigiSensys cette variable doit rester à `false`. Les appels nécessaires au login métier sont effectués côté serveur via l'API interne Better Auth et n'ont pas besoin d'exposer la façade brute.

### Installations existantes

Une installation déjà déployée sans variables Better Auth conserve son comportement historique tant qu'elle n'est pas reconfigurée ou remise en service avec un package récent.

### Nouvelles mises en service

À partir du lot installateur `feature/web-installer-better-auth-config`, le nouvel installateur Web configure volontairement :

```env
BETTER_AUTH_ENABLED=true
BETTER_AUTH_PUBLIC_API_ENABLED=false
BETTER_AUTH_SECRET="<secret généré par installation>"
BETTER_AUTH_URL="<même URL que NEXT_PUBLIC_API_BASE_URL>"
```

Le but est que les prochaines mises en service MC2 utilisent directement la fondation Better Auth validée, tout en conservant l'API brute fermée et la compatibilité JWT transitoire.

## 3. Secret Better Auth

Better Auth exige un secret d'au moins 32 caractères :

```env
BETTER_AUTH_SECRET=<secret-aléatoire>
```

Règles :

- ne jamais versionner le secret ;
- ne jamais l'afficher dans les logs ou le résumé d'installation ;
- utiliser un secret propre à l'installation ;
- utiliser un générateur cryptographiquement sûr.

Le helper manuel :

```text
website/scripts/configure-better-auth.ps1
```

peut toujours générer/configurer le secret sans l'afficher.

Le package Web officiel (`VigiSensysWebSetup.exe`) génère désormais automatiquement le secret via le mécanisme sécurisé existant de `WebsiteInstallerBootstrapper` (`RandomNumberGenerator`). Le script historique `website/installer/Install-VigitempWeb.ps1` écrit également la configuration Better Auth pour rester cohérent avec le bootstrapper.

## 4. Base URL et cookies

`BETTER_AUTH_URL` est défini explicitement par les nouvelles mises en service. L'installateur lui affecte **la même valeur que `NEXT_PUBLIC_API_BASE_URL`**, c'est-à-dire l'URL publique du site renseignée pendant l'installation.

Côté runtime, Better Auth normalise cette URL à son origin HTTP/HTTPS.

Le bridge de cookies a été corrigé afin que les cookies Better Auth et JWT historiques coexistent correctement :

1. les cookies JWT historiques sont écrits/effacés ;
2. les headers `Set-Cookie` Better Auth sont ajoutés sans être écrasés ;
3. `auth-token`, `refresh-token` et `vigisensys-auth-v2.session_token` peuvent coexister pendant la transition.

Test automatisé dédié :

```text
website/scripts/test-better-auth-cookie-bridge.ts
```

## 5. Politique de session et inactivité

### Session Better Auth

La session serveur est configurée avec :

- `expiresIn = 3600 s` ;
- `updateAge = 300 s` ;
- refresh de session activé ;
- cookie cache désactivé pendant cette phase.

La session est donc glissante sur une heure.

### Source de vérité de l'inactivité

Le délai d'inactivité VigiSensys continue de venir de :

```text
t_parametre
Section = CFR21
Mot_Cle = TEMPS_DECONNEXION_MINUTES
```

`/api/parametres/auto-lock` lit cette valeur et `useAutoLock` l'utilise côté navigateur.

### Activité réelle et multi-onglets

Souris, clavier, scroll, touch et clic repoussent le timer. L'activité est synchronisée entre onglets de la même origine et appelle périodiquement :

```text
POST /api/auth/session-touch
```

Le touch est throttlé sous `updateAge` afin d'étendre la session sans spammer le serveur.

### Ajustage et étalonnage

Les pages :

- `/admin/metrologie/realiser-ajustage` ;
- `/admin/metrologie/realiser-etalonnage` ;

neutralisent l'auto-logout local pendant une opération et maintiennent la session Better Auth via heartbeat.

Ce scénario longue durée reste à confirmer sur un test métrologie complet ; les autres tests d'activité/inactivité ont été validés.

## 6. Identité et mots de passe

Better Auth ne crée pas de nouvel utilisateur métier autonome.

Le provisioning technique n'est autorisé que pour un `t_utilisateur` existant et associe :

```text
t_auth_user.vigisensysUserId -> t_utilisateur.Id_Utilisateur
```

Le `Login` historique devient le username Better Auth.

Lorsque `Adresse_Email` est utilisable et unique, elle peut être reprise comme email technique. Sinon une adresse réservée sous `@auth.invalid` sert uniquement de pont technique et ne doit pas devenir une destination réelle pour OTP/Magic Link/reset.

Le hash bcrypt historique de `t_utilisateur.Mot_De_Passe` reste la source de vérité pendant la transition. Le credential Better Auth est synchronisé après validation du login métier ; aucun mot de passe en clair n'est persisté.

## 7. MySQL / SQL Server

La fondation centralise le parsing des connexions dans :

```text
website/src/lib/database-connection.ts
```

Réutilisé par :

- `src/lib/prisma.ts` ;
- `src/lib/prisma-chat.ts` ;
- `src/lib/better-auth/database.ts`.

Support validé :

- MySQL 8 / MariaDB adapter ;
- `allowPublicKeyRetrieval` ;
- SQL Server 2022 ;
- credentials URL-encodés ;
- valeurs SQL Server entre accolades ;
- `encrypt` / `trustServerCertificate`.

Les clients Prisma sont initialisés paresseusement afin que le build standalone puisse analyser les routes sans connexion DB de production à l'import.

## 8. Validation Better Auth réalisée avant intégration

Dernière validation complète de la fondation avant PR #101 :

```text
GitHub Actions run : 34327210180
Commit testé       : 8e6c3e3c237cc28fcce1ec10caab0857a13ccd5d
```

Résultat :

- TypeScript : ✅ ;
- ESLint ciblé : ✅ ;
- build Next standalone production : ✅ ;
- helper PowerShell : ✅ ;
- MySQL foundation : ✅ ;
- SQL Server foundation : ✅ ;
- provisioning / credentials / session / refresh / logout : ✅.

Le workflow temporaire de validation Better Auth a été supprimé après succès ; les scripts de test restent versionnés.

## 9. Validation manuelle

| Scénario | État |
| --- | --- |
| Connexion classique + cookie Better Auth | ✅ validé |
| Activité souris/navigation sans `401 session-touch` | ✅ validé |
| Activité au-delà du timeout : session conservée | ✅ validé |
| Aucune activité au-delà du timeout : déconnexion | ✅ validé |
| Multi-onglets | ✅ validé |
| Logout manuel | ✅ validé |
| Métrologie au-delà du timeout | ⏳ à tester ultérieurement |

La création des lignes `t_auth_user`, `t_auth_account` et `t_auth_session` a été observée sur l'environnement interne. Les sessions créées respectaient l'expiration d'une heure.

## 10. Mise en service / installateur Web

Fichiers principaux :

- `website/WebsiteInstallerBootstrapper/MainForm.cs` — installateur graphique utilisé dans le package standalone ;
- `website/WebsiteInstallerBootstrapper/InstallerHelpers.cs` — génération sécurisée des secrets ;
- `website/installer/Prepare-StandaloneBuild.ps1` — construit le package et publie `VigiSensysWebSetup.exe` ;
- `website/installer/Install-VigitempWeb.ps1` — chemin PowerShell manuel/historique ;
- `website/installer/README.md` — documentation de mise en service ;
- `website/scripts/configure-better-auth.ps1` — configuration manuelle complémentaire.

Checklist mise en service Better Auth :

- [ ] construire/publier `WebsiteInstallerBootstrapper` ;
- [ ] exécuter une nouvelle mise en service sur VM de test ;
- [ ] vérifier dans `.next/standalone/.env` la présence des quatre variables Better Auth ;
- [ ] vérifier que `BETTER_AUTH_URL` est identique à `NEXT_PUBLIC_API_BASE_URL` ;
- [ ] vérifier que le secret est non vide et >= 32 caractères ;
- [ ] vérifier que le secret n'apparaît ni dans le résumé ni dans les logs ;
- [ ] vérifier que le service Web démarre ;
- [ ] se connecter et constater la création d'une session Better Auth ;
- [ ] confirmer que `/api/auth-v2/*` reste fermé avec `BETTER_AUTH_PUBLIC_API_ENABLED=false`.

## 11. Ce qui reste volontairement à migrer

La première intégration n'enlève pas encore la plomberie JWT historique.

Restent notamment :

- migration de `getAuthenticatedUser` vers une résolution Better Auth ;
- migration de `getServerAuthenticatedUserId` ;
- migration des wrappers API et routes qui lisent directement `auth-token` ;
- traitement des flux SSE ;
- remplacement du refresh JWT historique ;
- comptage licence à partir des vraies sessions Better Auth ;
- suppression finale des cookies `token` / `auth-token` / `refresh-token` ;
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

Ces évolutions doivent rester découpées en lots ciblés depuis le HEAD courant de `dev`.

## 12. Fichiers Better Auth principaux

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

## 13. Règle de reprise

Pour tout nouveau travail d'authentification :

1. vérifier le HEAD réel de `dev`, les PR ouvertes et les dernières PR d'auth ;
2. lire `better-auth-migration.md` puis ce document ;
3. repartir du HEAD courant de `dev` sur une branche ciblée ;
4. conserver les invariants métier VigiSensys (CFR21, licences, audit, compte temporaire, droits) ;
5. ne pas ouvrir l'API Better Auth brute sans besoin explicite et revue de sécurité ;
6. ne jamais merger automatiquement les PR.
