# Liens publics localisés et footer applicatif — 16/09/2026

## Statut

- **Branche** : `fix/localized-reset-and-app-footer`
- **Base** : `dev` au commit `69fe87c5dd4f3a7df71c5781975d96b6121bf01d` (merge PR #121)
- **PR** : à renseigner après ouverture
- **État** : correctif prêt à valider

## Retours terrain

### Lien de réinitialisation

Un email de reset pouvait contenir :

```text
http://<serveur>:3000//reset-password?token=...
```

Deux problèmes étaient présents :

1. `NEXT_PUBLIC_APP_URL` pouvait déjà se terminer par `/`, puis la route ajoutait à nouveau `/reset-password`, d'où le double slash ;
2. le routage Next.js impose `localePrefix: "always"` et le chemin français réel est `/fr/reinitialisation-mot-de-passe`. Le lien généré ne passait pas par le routage `next-intl` et arrivait donc en 404.

Le même défaut de construction existait sur le lien de connexion envoyé lors de la création d'un compte utilisateur.

## Correctif des liens email

Le helper existant `website/src/lib/public-app-url.ts` est réutilisé et étendu avec `getLocalizedPublicAppUrl()` :

- résolution de l'URL publique via `NEXT_PUBLIC_APP_URL`, puis origine de la requête en fallback ;
- normalisation du slash terminal ;
- résolution du pathname à partir du routage `next-intl` ;
- ajout des query params via `URL` / `URLSearchParams` au lieu de concaténation manuelle.

Résultats attendus :

```text
FR reset : http://serveur:3000/fr/reinitialisation-mot-de-passe?token=...
EN reset : http://serveur:3000/en/reset-password?token=...
FR login : http://serveur:3000/fr/connexion
EN login : http://serveur:3000/en/login
```

## Footer VigiSensys

Ajout d'un footer partagé sur les espaces utilisateur et administration avec :

- `© <année> MC2` ;
- version Web VigiSensys issue du helper canonique `WEB_APP_VERSION` / `website/package.json` ;
- lien **Mentions légales** ;
- lien **Protection des données** ;
- indication **Cookies techniques uniquement** avec une aide expliquant l'absence de tracking/analytics/publicité intégrés.

Le footer n'ajoute aucun bandeau de consentement cookies.

## Pages publiques

### Mentions légales

Page FR/EN décrivant :

- MC2 comme éditeur du logiciel ;
- le déploiement on-premise standard ;
- la licence / propriété intellectuelle ;
- le support et la maintenance ;
- la priorité des dispositions contractuelles propres au client.

Aucune adresse, forme sociale ou information d'immatriculation non présente dans le dépôt n'est inventée.

### Protection des données

Page FR/EN décrivant le fonctionnement standard :

- données conservées sur l'infrastructure du client ;
- absence de transmission automatique à MC2 dans le fonctionnement normal ;
- exemples de données personnelles pouvant être traitées localement ;
- rôle de l'organisme exploitant l'installation ;
- cas d'un accès MC2 explicitement accordé pour le support ;
- absence de publicité, analytics et tracking comportemental intégrés ;
- cookies/stockages locaux limités au fonctionnement, à la sécurité et aux préférences nécessaires ;
- distinction avec les composants tiers éventuellement ajoutés par le client autour de VigiSensys.

## Fichiers principaux

- `website/src/lib/public-app-url.ts`
- `website/src/app/api/auth/request-password-reset/route.ts`
- `website/src/app/api/utilisateurs/route.ts`
- `website/src/i18n/routing.ts`
- `website/src/messages/legal-supplements.ts`
- `website/src/components/app-footer.tsx`
- `website/src/components/legal/public-info-page.tsx`
- `website/src/app/[locale]/legal-notice/page.tsx`
- `website/src/app/[locale]/data-protection/page.tsx`
- shells Dashboard/Admin
- `website/scripts/test-public-app-url.ts`

## Validation terrain

- [ ] `NEXT_PUBLIC_APP_URL` avec slash terminal : aucun `//reset-password` dans l'email ;
- [ ] langue globale FR : lien reset vers `/fr/reinitialisation-mot-de-passe` ;
- [ ] langue globale EN : lien reset vers `/en/reset-password` ;
- [ ] cliquer le lien depuis un email réel et vérifier que le formulaire de reset s'ouvre avec le token ;
- [ ] création d'un utilisateur avec email : lien de connexion localisé correct ;
- [ ] footer visible côté utilisateur ;
- [ ] footer visible côté administration ;
- [ ] version identique à `website/package.json` ;
- [ ] pages Mentions légales / Protection des données accessibles en FR et EN ;
- [ ] thèmes clair/sombre et petite largeur ;
- [ ] vérifier qu'aucun bandeau de consentement ou tracking n'a été ajouté.

## Validation technique recommandée

```text
pnpm exec tsx scripts/test-public-app-url.ts
pnpm i18n:check
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```
