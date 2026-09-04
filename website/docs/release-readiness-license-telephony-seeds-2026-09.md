# Release readiness — licences, téléphonie et seeds — 04/09/2026

## Contexte

Ce lot prépare un package VigiSensys installable sans réactiver la migration runtime Better Auth qui a été revertée via la PR #89.

Branche : `fix/license-telephony-seed-readiness`.

Baseline de départ vérifiée : `dev` au commit `8573a0e9dfcb3f55dd8a49f0154f03211498ae89` (revert de la PR #88).

Aucune Pull Request ne doit être ouverte tant qu'elle n'est pas explicitement demandée.

## Audit des licences

Le générateur de licences expose quatre éditions :

- `pack` : licence de base, avec limite de sondes configurable ;
- `one` : fonctions essentielles et ajustage ;
- `standard` : ajoute la métrologie avancée ;
- `expert` : environnement complet MC2.

Les options contractuelles sont transportées dans `options[]` et sont distinctes de l'édition. Le générateur connaît actuellement :

- `telephonie` ;
- `mail` ;
- `options_futures`.

Particularité historique conservée : l'option `mail` n'est acceptée par le générateur que pour l'édition Pack.

La matrice de smoke test confirme les restrictions d'édition déjà en place :

- lecture de licence et page Administration : Pack / One / Standard / Expert ;
- étalons, étalonnages et champs EMT : Standard / Expert ;
- ajustage : Pack / One / Standard / Expert ;
- téléphonie : dépend uniquement de l'option `telephonie`, indépendamment de l'édition.

## Correctif de licence téléphonie

Avant ce lot, `options[]` était chargé dans la licence mais les guards centralisés ne validaient que l'édition. Les routes d'administration téléphonie étaient donc protégées par les droits administrateur, sans vérifier l'option contractuelle `telephonie`.

Le lot ajoute :

- `hasLicenseOption()` dans le helper central de licence ;
- `requireLicenseOption()` et `requireTelephonyLicense()` côté serveur ;
- un contrôle `403 license_option_forbidden` sur toutes les routes d'administration téléphonie ;
- un smoke test indépendant de l'édition pour `/api/admin/telephony/config`.

Routes couvertes : configuration générale et opérations de test/connexion des providers Twilio, OVHcloud et Asterisk, y compris Click2Call OVHcloud.

## Verrouillage UI

Sans l'option `telephonie` :

- la vraie carte `TelephonySettingsCard` n'est pas montée ;
- aucun chargement de configuration ou de secret téléphonie n'est déclenché depuis cette carte ;
- une prévisualisation statique non interactive est affichée ;
- un voile progressif laisse la partie supérieure légèrement visible, applique un flou progressif et devient opaque vers le bas ;
- le message FR/EN indique que la fonctionnalité n'est pas disponible avec la licence ;
- le contenu verrouillé est retiré de l'interaction clavier/pointeur via le composant générique `LicenseFeatureLock`.

Le composant de verrouillage est volontairement générique afin de pouvoir être réutilisé pour d'autres fonctionnalités sous licence.

## Seeds MySQL / SQL Server

Les deux seeds passent à `SCHEMA_VERSION = 0.90.2` et préparent les tables finales Better Auth sans activer Better Auth :

- `t_auth_user` ;
- `t_auth_session` ;
- `t_auth_account` ;
- `t_auth_verification`.

Les noms temporaires du PoC (`t_auth_poc_*`) ne sont pas utilisés.

Le schéma reprend les champs validés lors de BA-1 / Better Auth 1.7.2, notamment :

- `username` ;
- `displayUsername` ;
- `vigisensysUserId` pour le mapping vers `t_utilisateur` ;
- sessions, comptes credentials/providers et vérifications.

Aucun utilisateur Better Auth n'est créé par les seeds et aucun package, handler ou cookie Better Auth n'est réactivé dans le runtime actuel.

La colonne `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` était déjà présente dans les deux seeds au démarrage du lot. Elle a été vérifiée et conservée sans duplication.

## Fichiers principaux

- `website/src/lib/license-access.ts` ;
- `website/src/lib/license-guards.ts` ;
- `website/src/components/license/license-feature-lock.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx` ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony/telephony-license-locked-card.tsx` ;
- `website/src/app/api/admin/telephony/**/route.ts` ;
- `website/scripts/smoke-license-matrix.ts` ;
- `db/vigisensys_seed.sql` ;
- `db/vigisensys_seed_mssql.sql` ;
- `db/CHANGELOG.md`.

## Validations automatisées effectuées

### Seeds

Validation sur instances jetables réelles :

- MySQL 8.0.44 : seed complet exécuté avec succès ;
- SQL Server 2022 : seed complet exécuté avec succès ;
- présence des quatre tables `t_auth_*` vérifiée ;
- présence de `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` vérifiée ;
- `SCHEMA_VERSION = 0.90.2` vérifiée.

### Web / licence

Sur le HEAD de branche avant nettoyage du workflow temporaire :

- `pnpm install --frozen-lockfile` : OK ;
- génération Prisma MySQL : OK ;
- `tsc --noEmit` : OK ;
- ESLint : OK ;
- contrôle i18n FR/EN : OK ;
- smoke unitaire `hasLicenseOption()` : OK ;
- audit automatique : toutes les routes sous `src/app/api/admin/telephony` utilisent `requireTelephonyLicense` : OK.

Les workflows temporaires utilisés pour ces validations sont supprimés du diff final.

## Checklist terrain / package

- [x] vérifier le token réel d'option : `telephonie` ;
- [x] verrouiller les API téléphonie en l'absence de l'option ;
- [x] ne pas monter la vraie carte téléphonie sans option ;
- [x] afficher le voile de fonctionnalité verrouillée FR/EN ;
- [x] exécuter les seeds complets MySQL et MSSQL sur bases jetables ;
- [x] vérifier Better Auth préparé avec les noms finaux `t_auth_*` uniquement ;
- [x] confirmer que le runtime Better Auth reste reverté ;
- [x] TypeScript / ESLint / i18n ;
- [ ] test visuel navigateur avec une licence sans `telephonie` ;
- [ ] test visuel navigateur avec une licence contenant `telephonie` ;
- [ ] appel direct d'une route téléphonie avec licence sans option : vérifier `403` sur une installation complète ;
- [ ] test de configuration/appel provider avec licence téléphonie sur environnement client de validation ;
- [ ] installation du package final sur une machine propre MySQL ;
- [ ] installation du package final sur une machine propre MSSQL.
