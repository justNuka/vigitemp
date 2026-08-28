# Première connexion — bienvenue et politique de mot de passe — 28/08/2026

## Statut

**PR #72 OUVERTE vers `dev` — branche `agent/first-login-welcome-password-validity` — base `fd4120dce332477fd7db737ee67ce17c72648f07`.**

## Besoin

Lors de la première connexion réussie d’un utilisateur, afficher un écran de bienvenue animé puis rappeler les règles de changement de mot de passe. La durée doit provenir du paramétrage BDD CFR21, notamment `VALIDITE_MOT_DE_PASSE_JOURS`.

## État du code vérifié avant modification

Le login gérait déjà :

- `CFR21 / ACTIVATION_EXPIRATION_MOT_DE_PASSE` ;
- `CFR21 / VALIDITE_MOT_DE_PASSE_JOURS` avec le fallback historique de 90 jours ;
- le changement obligatoire d’un mot de passe temporaire ;
- le changement obligatoire d’un mot de passe expiré ;
- un avertissement à la connexion pendant les 7 derniers jours avant expiration ;
- `t_utilisateur.Date_Heure_Derniere_Connexion`, mis à jour après une authentification réussie.

Aucune nouvelle règle de sécurité n’est donc introduite par ce lot.

## Implémentation

- `Date_Heure_Derniere_Connexion == null` est évalué avant la mise à jour des métadonnées de connexion et sert de marqueur serveur de première connexion.
- La réponse de `/api/auth/login` expose `isFirstLogin`, `passwordExpiryEnabled` et `passwordValidityDays`.
- Le mot de passe temporaire/expiré reste prioritaire : il est changé avant qu’une connexion normale puisse afficher l’accueil.
- À la première connexion normale, l’interface affiche d’abord une animation de bienvenue, puis une carte expliquant la durée CFR21 et le rappel à J-7.
- Si l’expiration CFR21 est désactivée, l’interface l’indique au lieu d’annoncer une durée obligatoire.
- Après l’onboarding, l’avertissement J-7 existant reste affiché si nécessaire, puis la redirection et l’initialisation Agent suivent exactement le flux existant.
- `prefers-reduced-motion` / réduction des animations est respectée via `useReducedMotion`.
- FR/EN et thèmes clair/sombre sont conservés.

## Fichiers principaux

- `website/src/app/api/auth/login/route.ts` ;
- `website/src/app/[locale]/login/login-form.tsx` ;
- `website/src/app/[locale]/login/_components/first-login-welcome.tsx` ;
- `website/src/messages/supplements.ts` ;
- `website/CHANGELOG.md`.

## Validation terrain

- [ ] utilisateur avec `Date_Heure_Derniere_Connexion = NULL` : vérifier bienvenue puis politique ;
- [ ] vérifier la valeur affichée avec `CFR21 / VALIDITE_MOT_DE_PASSE_JOURS` ;
- [ ] expiration CFR21 désactivée : vérifier le texte adapté ;
- [ ] connexion suivante du même utilisateur : vérifier que l’onboarding ne réapparaît pas ;
- [ ] mot de passe temporaire : vérifier que le changement forcé reste prioritaire ;
- [ ] mot de passe expiré : vérifier que le changement forcé reste prioritaire ;
- [ ] échéance <= 7 jours : vérifier que l’avertissement existant apparaît après l’onboarding ;
- [ ] vérifier les redirections `from`, dashboard/surveillance et l’initialisation Agent ;
- [ ] vérifier FR/EN, clair/sombre et réduction des animations.
