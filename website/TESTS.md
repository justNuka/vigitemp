# Tests à effectuer - Vigitemp

## 🔐 Authentification & Sécurité

### Login / Logout
- [ ] Login avec identifiants valides
- [ ] Login avec identifiants invalides (doit être loggé)
- [ ] Logout manuel
- [ ] Déconnexion automatique après inactivité (15 min)

### Gestion des mots de passe
- [ ] Changement de mot de passe (vérifier règles de validation)
- [ ] Vérification historique des mots de passe (pas de réutilisation)
- [ ] Expiration du mot de passe après 90 jours
- [ ] Page de changement forcé (/force-password-change)

### Réinitialisation de mot de passe
- [ ] Bouton "Mot de passe oublié ?" sur page de login
- [ ] Envoi d'email de réinitialisation
- [ ] Clic sur lien dans email (token valide 1h)
- [ ] Création nouveau mot de passe
- [ ] Token expiré ou invalide (message d'erreur)

## 👥 Gestion des profils et autorisations

### Page Profils (/profils)
- [ ] Accès avec profil "Administrateurs" (doit marcher)
- [ ] Affichage de la liste des profils
- [ ] Création d'un nouveau profil
- [ ] Sélection des autorisations par module (Admin, Métrologie, Surveillance, VigiLog)
- [ ] Modification d'un profil existant
- [ ] Suppression d'un profil (vérifier blocage si utilisateurs assignés)

### Gestion des utilisateurs
- [ ] Création d'un utilisateur avec sélection du profil
- [ ] Email envoyé avec identifiants (vérifier réception)
- [ ] Template email de création de compte (style propre, bouton fonctionnel)
- [ ] Affichage du profil dans la liste des utilisateurs

## 📊 Logging et Audit

### Logs générés automatiquement
- [ ] Vérifier création du dossier `logs/YYYY-MM-DD/`
- [ ] Fichier `app-*.log` créé
- [ ] Fichier `error-*.log` créé
- [ ] Fichier `audit-*.log` créé

### Actions loggées
- [ ] Login réussi → `[AUDIT] LOGIN - SUCCESS`
- [ ] Login échoué → `[AUDIT] LOGIN - FAILED` avec raison
- [ ] Logout → `[AUDIT] LOGOUT - SUCCESS`
- [ ] Changement de mot de passe → `[AUDIT] PASSWORD_CHANGE`
- [ ] Requêtes HTTP → `[HTTP] GET /api/... - 200`

### Format des logs
- [ ] Timestamp français (YYYY-MM-DD HH:mm:ss.SSS)
- [ ] Niveau de log présent (INFO, WARN, ERROR, AUDIT)
- [ ] Label présent (AUTH, HTTP, API, etc.)
- [ ] Métadonnées JSON avec user, userId, ip

### Rotation des logs
- [ ] Créer un fichier > 10MB (simuler beaucoup de logs)
- [ ] Vérifier rotation automatique (app-*.1.log créé)
- [ ] Vérifier compression (.gz) des anciens fichiers

## 📧 Configuration SMTP

### Paramètres email
- [ ] Ajouter les paramètres SMTP dans `t_parametre` :
  - `smtp_host` = `smtp.gmail.com`
  - `smtp_port` = `587`
  - `smtp_user` = votre email Gmail
  - `smtp_password` = mot de passe d'application Gmail
  - `smtp_from` = votre email Gmail
  - `smtp_enabled` = `true`
- [ ] Tester envoi email création de compte
- [ ] Tester envoi email réinitialisation mot de passe

## 🗄️ Base de données

### Nouveaux champs
- [ ] Vérifier `t_utilisateur.DateDerniereModificationMDP` existe
- [ ] Vérifier `t_utilisateur.ResetPasswordToken` existe
- [ ] Vérifier `t_utilisateur.ResetPasswordExpires` existe
- [ ] Client Prisma régénéré après ajout des champs

### Tables autorisations
- [ ] `t_autorisation` contient les autorisations (voir capture fournie)
- [ ] `t_profil` contient "Administrateurs" et autres profils
- [ ] `t_liaison_profil_autorisation` lie profils et autorisations

## 🔍 Recherche dans les logs

### Commandes à tester
```bash
# Logs du jour
cat logs/2025-12-10/app-*.log

# Rechercher par utilisateur
grep '"user":"jdupont"' logs/*/app-*.log

# Toutes les connexions
grep "LOGIN" logs/*/audit-*.log

# Erreurs uniquement
cat logs/*/error-*.log
```

## ⚠️ Cas limites à vérifier

- [ ] Login avec compte archivé (doit échouer)
- [ ] Token de reset expiré (message clair)
- [ ] Profil supprimé alors que des utilisateurs l'utilisent (doit bloquer)
- [ ] Email non configuré (désactiver smtp_enabled, vérifier comportement)
- [ ] Mot de passe identique à l'ancien (doit refuser)
- [ ] Mot de passe déjà utilisé dans l'historique (doit refuser)

## 📝 Notes

- Les logs ne doivent PAS être versionnés (vérifier `.gitignore`)
- Les templates email utilisent Tailwind CSS
- La rotation est automatique (pas d'action manuelle)
- Les tokens de reset sont hashés en SHA256 en base
- La durée de validité des tokens est 1 heure
- La rétention des logs est 90j (app/error) et 365j (audit)
