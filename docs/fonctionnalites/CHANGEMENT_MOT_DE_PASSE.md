# Fonctionnalité : Changement de mot de passe avec historique et règles configurables

## Vue d'ensemble

Cette fonctionnalité implémente un système de gestion des mots de passe conforme aux normes de sécurité, avec :
- Historique des mots de passe pour empêcher la réutilisation
- Règles de complexité configurables par les administrateurs
- Validation en temps réel avec indicateur de force
- Interface utilisateur intuitive

## Architecture

### Backend

#### 1. Base de données

**Nouvelle configuration dans `t_parametre` :**
```
Section: "security"
MotCle                      | Valeur | Commentaire
--------------------------- | ------ | -----------
password_min_length         | 8      | Nombre minimum de caractères
password_min_uppercase      | 1      | Minimum de lettres majuscules
password_min_lowercase      | 1      | Minimum de lettres minuscules
password_min_numbers        | 1      | Minimum de chiffres
password_min_special        | 1      | Minimum de caractères spéciaux
password_history_count      | 5      | Nombre d'anciens mots de passe à vérifier
```

**Utilisation de `t_ancienmotpasse` :**
- Stocke les anciens hash de mots de passe après chaque changement
- Permet de vérifier qu'un nouveau mot de passe n'a pas été utilisé récemment
- Lié à `t_utilisateur` via `IdUtilisateur`

#### 2. API Routes

**GET /api/settings/password-rules**
- Retourne les règles de validation des mots de passe
- Format : `{ min_length, min_uppercase, min_lowercase, min_numbers, min_special, history_count }`
- Cache : 5 minutes côté client

**POST /api/profile/change-password**
- Change le mot de passe de l'utilisateur authentifié
- Body : `{ oldPassword, newPassword, confirmPassword }`
- Validations :
  1. Vérifier authentification (JWT token)
  2. Vérifier ancien mot de passe correct
  3. Vérifier que nouveau === confirmation
  4. Valider le nouveau mot de passe selon les règles
  5. Vérifier l'historique (pas de réutilisation)
  6. Hasher le nouveau mot de passe (bcrypt)
  7. Sauvegarder l'ancien hash dans `t_ancienmotpasse`
  8. Mettre à jour `t_utilisateur.Mot_de_passe`

**PATCH /api/settings/{key}**
- Met à jour un paramètre de sécurité (admin uniquement)
- Invalide le cache avec `revalidateTag`

#### 3. Fonctions utilitaires

**src/lib/password-validation.ts**
```typescript
// Valide un mot de passe selon les règles
function validatePassword(password: string, rules: PasswordRules): PasswordValidationResult

// Vérifie si un mot de passe a déjà été utilisé
async function checkPasswordHistory(userId: number, newPassword: string, historyCount: number): Promise<{isReused: boolean}>

// Calcule un score de force (0-100)
function calculatePasswordStrength(password: string): number
```

**src/lib/auth.ts**
```typescript
// Récupère l'utilisateur authentifié depuis le token JWT
function getAuthenticatedUser(req: NextRequest): JWTPayload | null
```

### Frontend

#### 1. Page utilisateur : /profile

**src/app/(dashboard)/profile/page.tsx**

Fonctionnalités :
- Formulaire avec 3 champs : ancien, nouveau, confirmation
- Boutons "œil" pour afficher/masquer les mots de passe
- Indicateur de force en temps réel (barre de progression colorée)
- Liste des règles avec ✓ ou ✗ pour chaque critère
- Validation côté client avant soumission
- Affichage des erreurs serveur
- Toast de confirmation en cas de succès

#### 2. Page admin : /settings (section "Règles de mot de passe")

**src/components/password-rules-settings.tsx**

Fonctionnalités :
- 6 champs numériques pour configurer les règles
- Contraintes min/max pour chaque champ
- Détection des modifications (bouton "Enregistrer" activé si changements)
- Sauvegarde de tous les paramètres en une fois
- Invalidation du cache React Query
- Toast de confirmation

#### 3. Hook React

**src/hooks/usePasswordRules.ts**
```typescript
function usePasswordRules(): {
  data: PasswordRules | undefined,
  isLoading: boolean,
  error: Error | null
}
```
- Utilise React Query pour le caching
- `staleTime`: 5 minutes
- `gcTime`: 30 minutes

#### 4. Navigation

**src/components/app-sidebar.tsx**
- Nouveau lien "Mon profil" dans la section Administration
- Icône : User (lucide-react)
- Route : /profile

### Scripts

**scripts/seed-password-params.ts**
- Script d'initialisation des 6 paramètres de sécurité
- Vérifie si les paramètres existent déjà avant de créer
- Affiche un résumé des paramètres créés
- Commande : `npx tsx scripts/seed-password-params.ts`

## Sécurité

### Validations côté serveur

1. **Authentification** : Token JWT vérifié
2. **Ancien mot de passe** : Hash comparé avec bcrypt
3. **Règles de complexité** : Appliquées strictement côté serveur
4. **Historique** : Vérification avec bcrypt.compare (pas de comparaison string)
5. **Hashing** : bcrypt avec salt rounds = 10

### Protection contre les attaques

- **Bruteforce** : Pas de timing attack (bcrypt)
- **Rainbow tables** : Hashing avec salt (bcrypt)
- **Réutilisation** : Historique des N derniers mots de passe
- **Validation client uniquement** : Toutes les règles re-vérifiées côté serveur

## Conformité

Cette implémentation respecte les standards de sécurité :
- **OWASP** : Complexité des mots de passe, historique
- **GDPR** : Données sensibles hashées, pas de stockage en clair
- **ISO 27001** : Politique de mot de passe configurable, traçabilité

## Tests

Voir `docs/test-a-faire/TESTS_FEATURES_RECENTES.md` section 7 pour :
- Tests utilisateur (validation, changement, historique)
- Tests admin (configuration des règles)
- Tests API (endpoints, erreurs, succès)
- Tests base de données (insertion historique, persistance)

## Utilisation

### Pour les utilisateurs

1. Cliquer sur "Mon profil" dans le menu
2. Entrer l'ancien mot de passe
3. Choisir un nouveau mot de passe respectant les règles
4. Confirmer le nouveau mot de passe
5. Cliquer sur "Changer le mot de passe"

### Pour les administrateurs

1. Aller dans "Paramétrage"
2. Scroller jusqu'à "Règles de mot de passe"
3. Modifier les valeurs souhaitées
4. Cliquer sur "Enregistrer les modifications"
5. Les nouvelles règles s'appliquent immédiatement

## Améliorations futures possibles

- [ ] Notification email lors du changement de mot de passe
- [ ] Expiration automatique des mots de passe (ex: tous les 90 jours)
- [ ] Dictionnaire de mots communs interdits
- [ ] Vérification contre les fuites de données (Have I Been Pwned API)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Log des tentatives de changement échouées (audit)

## Fichiers créés/modifiés

### Nouveaux fichiers (9)
1. `scripts/seed-password-params.ts`
2. `src/app/api/settings/password-rules/route.ts`
3. `src/app/api/profile/change-password/route.ts`
4. `src/app/(dashboard)/profile/page.tsx`
5. `src/lib/password-validation.ts`
6. `src/lib/auth.ts`
7. `src/hooks/usePasswordRules.ts`
8. `src/components/password-rules-settings.tsx`
9. `docs/fonctionnalites/CHANGEMENT_MOT_DE_PASSE.md` (ce fichier)

### Fichiers modifiés (3)
1. `src/lib/api.ts` - Ajout de `PasswordRules` type et `getPasswordRules()` method
2. `src/components/app-sidebar.tsx` - Ajout du lien "Mon profil"
3. `src/app/(dashboard)/settings/settings-client.tsx` - Ajout de la section "Règles de mot de passe"

### Documentation (1)
1. `docs/test-a-faire/TESTS_FEATURES_RECENTES.md` - Section 7 ajoutée

**Total : 13 fichiers affectés**

## Date d'implémentation

**5 décembre 2025**

Status : ✅ **Complété** - Prêt pour les tests
