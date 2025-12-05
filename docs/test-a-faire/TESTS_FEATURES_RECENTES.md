# Tests à effectuer - Fonctionnalités récentes

## 1. ✅ Verrouillage automatique (Auto-lock)

### À tester :
- [ ] Aller dans Paramétrage → Section Sécurité
- [ ] Activer le verrouillage automatique
- [ ] Choisir une durée (5/10/15/30/60 minutes)
- [ ] Ne pas toucher la souris/clavier pendant la durée choisie
- [ ] Vérifier que la déconnexion automatique se déclenche
- [ ] Vérifier le message "Session expirée pour cause d'inactivité"
- [ ] Tester avec plusieurs onglets ouverts (synchronisation cross-tab)

### Résultat attendu :
- Déconnexion automatique après inactivité
- Redirection vers /login?reason=inactivity
- Toast de notification "Session expirée"

---

## 2. ✅ Intervalle de rafraîchissement dynamique

### À tester :
- [ ] Aller dans Paramétrage → Section Général
- [ ] Paramètre "Intervalle de rafraîchissement (s)"
- [ ] Changer la valeur (5s / 10s / 30s / 60s / Manuel)
- [ ] Observer le badge d'alarmes dans le header (compte doit se mettre à jour)
- [ ] Tester "Manuel (désactivé)" → le badge ne devrait plus se rafraîchir automatiquement
- [ ] Tester avec plusieurs onglets ouverts (synchronisation)

### Résultat attendu :
- Le polling du badge d'alarmes respecte l'intervalle choisi
- "Manuel" désactive le rafraîchissement automatique
- Changement visible dans tous les onglets

---

## 3. ✅ Sidebar - Couleurs et états actifs

### À tester :
- [ ] **Mode Dark** : Vérifier que le sidebar a le fond #14181F (gris très foncé)
- [ ] **Mode Light** : Vérifier que le sidebar a un fond gris très clair harmonieux
- [ ] Naviguer entre les pages (Tableau de bord, Surveillance, Alarmes, etc.)
- [ ] Vérifier que la page active a un fond plus clair (état actif visible)
- [ ] Hover sur les items du menu → fond doit changer légèrement
- [ ] Vérifier dans les 3 sections : Navigation, Administration, Alarmes sonores

### Résultat attendu :
- Sidebar foncé en dark mode (#14181F)
- Sidebar clair en light mode
- Hover et état actif visibles et cohérents

---

## 4. ✅ Filtres Site/Groupe dans Surveillance

### À tester :
- [ ] Aller sur la page **Surveillance**
- [ ] Vérifier la présence de 2 Select dans le header :
  - Filtre par Site (icône Building2)
  - Filtre par Groupe (icône FolderTree)
- [ ] Sélectionner un site → vérifier que seuls les capteurs de ce site s'affichent
- [ ] Sélectionner un groupe → vérifier que seuls les capteurs de ce groupe s'affichent
- [ ] Sélectionner site ET groupe → filtrage combiné
- [ ] Vérifier que les compteurs (Toutes/OK/Attention/Critique) se mettent à jour
- [ ] Rafraîchir la page → vérifier que les filtres sont restaurés (localStorage)
- [ ] Ouvrir un nouvel onglet → vérifier que les filtres sont les mêmes

### API à tester :
- [ ] `GET /api/groups` → doit retourner la liste des groupes
- [ ] `GET /api/sites` → doit retourner la liste des sites (format: `CodeSite - LibelleSite`)

### Résultat attendu :
- Filtrage en temps réel des capteurs
- Compteurs mis à jour dynamiquement
- Persistance dans localStorage
- Format d'affichage des sites : "CodeSite - LibelleSite"

---

## 5. ⚠️ Switches avec loading states

### À tester :
- [ ] Aller dans Paramétrage → Section Général
- [ ] Toggler un switch (notifications email, SMS, son des alarmes)
- [ ] Vérifier que le switch affiche un spinner pendant l'appel API
- [ ] Vérifier que le switch est désactivé pendant le chargement
- [ ] Vérifier qu'un toast de succès apparaît
- [ ] Vérifier que le switch reste dans la nouvelle position (pas de revert)

### Résultat attendu :
- Spinner visible dans le thumb du switch
- Switch désactivé pendant le chargement
- Toast de confirmation
- État persistant après API call

---

## 6. ⚠️ Paramètres - Merge strategy (toujours 4 paramètres visibles)

### À tester :
- [ ] Aller dans Paramétrage → Section Général
- [ ] Vérifier que les 4 paramètres sont toujours visibles :
  1. Notifications par email
  2. Notifications SMS
  3. Son des alarmes
  4. Intervalle de rafraîchissement (s)
- [ ] Même si certains n'existent pas en DB, ils doivent s'afficher avec valeur par défaut

### Résultat attendu :
- 4 paramètres toujours visibles
- Valeurs par défaut si absent en DB
- Pas de disparition de paramètres après toggle

---

## Notes pour les tests

### Environnements à tester :
- [ ] Mode Dark
- [ ] Mode Light
- [ ] Desktop (> 1125px)
- [ ] Tablet (768px - 1125px)
- [ ] Mobile (< 768px)

### Navigateurs à tester :
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (si disponible)

### Données de test :
- Vérifier qu'il y a des données dans :
  - `t_groupe` (groupes)
  - `t_site` (sites avec CodeSite et LibelleSite)
  - `t_lieu` (lieux avec IdSite, IdGroupe1, IdGroupe2)
  - `t_parametre` (paramètres de configuration)

---

## Bugs connus à vérifier

- [ ] Vérifier que le dev server ne crash pas au démarrage
- [ ] Vérifier qu'il n'y a pas d'erreurs de compilation TypeScript
- [ ] Vérifier qu'il n'y a pas d'erreurs Prisma (schémas à jour)
- [ ] Vérifier que les API routes répondent correctement (pas de 500)

---

## 7. ✅ Changement de mot de passe avec historique et règles configurables

### À tester :

#### Tests utilisateur - Page Profil (/profile)

1. **Validation en temps réel :**
   - [ ] Aller sur "Mon profil" dans le menu Administration
   - [ ] Entrer un ancien mot de passe correct
   - [ ] Entrer un nouveau mot de passe
   - [ ] Observer l'indicateur de force (Faible/Moyen/Bon/Fort)
   - [ ] Observer la barre de progression (couleur rouge/orange/jaune/vert)
   - [ ] Vérifier que les règles s'affichent avec des ✓ ou ✗ :
     - Au moins X caractères
     - Au moins X majuscule(s)
     - Au moins X minuscule(s)
     - Au moins X chiffre(s)
     - Au moins X caractère(s) spécial(aux)

2. **Validation des erreurs :**
   - [ ] Essayer avec un ancien mot de passe incorrect → Erreur "L'ancien mot de passe est incorrect"
   - [ ] Essayer avec un mot de passe trop court → Règle "Au moins X caractères" en rouge
   - [ ] Essayer sans majuscule → Règle "Au moins X majuscule(s)" en rouge
   - [ ] Essayer sans minuscule → Règle en rouge
   - [ ] Essayer sans chiffre → Règle en rouge
   - [ ] Essayer sans caractère spécial → Règle en rouge
   - [ ] Essayer avec confirmation différente → Erreur "Les mots de passe ne correspondent pas"
   - [ ] Essayer de réutiliser un ancien mot de passe → Erreur "Vous ne pouvez pas réutiliser..."
   - [ ] Essayer de réutiliser le mot de passe actuel → Erreur de réutilisation

3. **Changement réussi :**
   - [ ] Entrer un mot de passe valide respectant toutes les règles
   - [ ] Confirmer le mot de passe
   - [ ] Cliquer sur "Changer le mot de passe"
   - [ ] Vérifier le spinner pendant le chargement
   - [ ] Vérifier le toast de succès "Mot de passe changé avec succès"
   - [ ] Vérifier que le formulaire est réinitialisé (champs vides)
   - [ ] Se déconnecter et se reconnecter avec le nouveau mot de passe

4. **Historique des mots de passe :**
   - [ ] Changer le mot de passe 3 fois de suite (MDP1 → MDP2 → MDP3 → MDP4)
   - [ ] Essayer de revenir à MDP1 → Doit être refusé
   - [ ] Essayer de revenir à MDP2 → Doit être refusé
   - [ ] Essayer de revenir à MDP3 → Doit être refusé
   - [ ] Vérifier que la table `t_ancienmotpasse` contient bien les anciens hash

#### Tests admin - Configuration des règles (/settings)

1. **Modification des règles :**
   - [ ] Aller dans Paramétrage → Section "Règles de mot de passe"
   - [ ] Observer les 6 paramètres :
     - Longueur minimale (4-128)
     - Lettres majuscules (0-10)
     - Lettres minuscules (0-10)
     - Chiffres (0-10)
     - Caractères spéciaux (0-10)
     - Historique des mots de passe (0-20)
   - [ ] Modifier une valeur (ex: longueur minimale → 12)
   - [ ] Vérifier que le bouton "Enregistrer" s'active
   - [ ] Cliquer sur "Enregistrer les modifications"
   - [ ] Vérifier le toast de succès
   - [ ] Vérifier en base de données que `t_parametre` est à jour
   - [ ] Rafraîchir la page → les nouvelles valeurs doivent persister

2. **Application immédiate des règles :**
   - [ ] Modifier les règles (ex: longueur minimale → 12, majuscules → 2)
   - [ ] Enregistrer
   - [ ] Aller sur la page Profil (/profile)
   - [ ] Essayer de créer un mot de passe avec seulement 10 caractères → Refusé
   - [ ] Essayer avec seulement 1 majuscule → Refusé
   - [ ] Créer un mot de passe respectant les NOUVELLES règles → Accepté

3. **Historique configurable :**
   - [ ] Mettre l'historique à 3 dans Settings
   - [ ] Changer le mot de passe 4 fois : MDP1 → MDP2 → MDP3 → MDP4 → MDP5
   - [ ] Essayer de revenir à MDP2 (4ème ancien) → Doit être refusé
   - [ ] Essayer de revenir à MDP1 (5ème ancien) → Doit être **ACCEPTÉ** (historique = 3)

4. **Valeurs extrêmes :**
   - [ ] Mettre toutes les règles à 0 → Mots de passe très faibles acceptés
   - [ ] Mettre longueur minimale à 128 → Mot de passe très long requis
   - [ ] Mettre historique à 0 → Pas de vérification d'historique (réutilisation possible)
   - [ ] Remettre des valeurs raisonnables (8, 1, 1, 1, 1, 5)

#### Tests API

1. **GET /api/settings/password-rules :**
   - [ ] Vérifier que l'endpoint retourne bien les 6 règles
   - [ ] Format : `{ min_length, min_uppercase, min_lowercase, min_numbers, min_special, history_count }`

2. **POST /api/profile/change-password :**
   - [ ] Tester avec token invalide → 401 Non authentifié
   - [ ] Tester sans ancien mot de passe → 400 Validation error
   - [ ] Tester avec ancien mot de passe incorrect → 400 "L'ancien mot de passe est incorrect"
   - [ ] Tester avec nouveau mot de passe invalide → 400 avec détails des erreurs
   - [ ] Tester avec réutilisation → 400 "Vous ne pouvez pas réutiliser..."
   - [ ] Tester avec tout valide → 200 avec message de succès

3. **PATCH /api/settings/security:password_* :**
   - [ ] Tester la mise à jour de chaque paramètre individuellement
   - [ ] Vérifier que le cache est invalidé (revalidateTag)

#### Tests base de données

1. **Table `t_ancienmotpasse` :**
   - [ ] Vérifier que les anciens hash sont bien insérés après chaque changement
   - [ ] Vérifier que l'`IdUtilisateur` correspond bien
   - [ ] Vérifier que seuls les N derniers sont vérifiés (N = history_count)

2. **Table `t_parametre` :**
   - [ ] Vérifier que les 6 paramètres existent avec Section = "security"
   - [ ] Vérifier que les valeurs sont bien des nombres en string
   - [ ] Vérifier que les modifications admin sont persistées

### Résultat attendu :
- Validation en temps réel avec indicateur visuel clair
- Règles configurables par les admins
- Historique des mots de passe fonctionnel
- Impossibilité de réutiliser les N derniers mots de passe
- Toutes les règles appliquées côté serveur (sécurité garantie)
- Messages d'erreur clairs et explicites

---

## Performance à surveiller

- [ ] Temps de chargement de la page Surveillance avec beaucoup de capteurs
- [ ] Rafraîchissement du badge d'alarmes (pas de lag)
- [ ] Filtrage en temps réel (pas de lag lors du changement de filtre)
- [ ] Changement de thème (dark/light) fluide

---

**Date de création** : 5 décembre 2025  
**Statut global** : En attente de tests
