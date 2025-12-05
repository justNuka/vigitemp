# 🔍 AUDIT COMPLET DU SYSTÈME D'AUTHENTIFICATION

**Date d'audit** : 5 décembre 2024  
**Version analysée** : V1.0 (feat/dashboard branch)  
**Auditeur** : GitHub Copilot  

---

## 📋 RÉSUMÉ EXÉCUTIF

### Statut Global : 🟡 **PARTIELLEMENT IMPLÉMENTÉ (60-70%)**

Le système d'authentification de base fonctionne correctement avec login/logout JWT, mais plusieurs fonctionnalités importantes manquent pour un système complet de gestion des utilisateurs.

### Points Forts ✅
- ✅ Authentification JWT fonctionnelle et sécurisée
- ✅ Chiffrement bcrypt des mots de passe
- ✅ Interface utilisateur de login complète et professionnelle
- ✅ API de gestion utilisateurs (CRUD) opérationnelle
- ✅ Historique des mots de passe (table `t_ancienmotpasse`)
- ✅ Système de profils/rôles en base de données

### Points Faibles ❌
- ❌ Pas de création de compte utilisateur par admin (UI manquante)
- ❌ Pas de gestion des mots de passe temporaires (`mdpTempActif`)
- ❌ Pas de réinitialisation de mot de passe par email
- ❌ Pas de système d'email (nodemailer non configuré)
- ❌ Pas de rôle "Lecture seule" (seulement admin/user)
- ❌ Pas de protection des routes par rôle (middleware manquant)
- ❌ Pas d'auto-inscription (self-registration)
- ❌ Pas de 2FA (authentification à double facteur)

---

## 🏗️ ARCHITECTURE ACTUELLE

### 1. BASE DE DONNÉES

#### Table `t_utilisateur`
```prisma
model t_utilisateur {
  IdUtilisateur                Int       @id @default(autoincrement())
  Login                        String?   @unique @db.VarChar(64)
  Mot_de_passe                 String?   @db.VarChar(60)  // bcrypt hash
  Date_Validite                DateTime? @db.Date
  Date_Creation                DateTime? @db.Date
  Archive                      Boolean?  @default(false)
  ProfilUtilisateur            String?   @db.VarChar(50)
  DateHeureDerniereConnexion   DateTime? @db.DateTime(0)
  DateHeureConnexion           DateTime? @db.DateTime(0)
  AdresseIPConnexion           String?   @db.VarChar(15)
  NomMachineConnexion          String?   @db.VarChar(50)
  IdSite                       Int?
  Civilite                     String?   @db.VarChar(30)
  Nom                          String?   @db.VarChar(50)
  Prenom                       String?   @db.VarChar(50)
  Tel_Num_Fixe                 String?   @db.VarChar(50)
  Tel_Num_Mobile               String?   @db.VarChar(50)
  Adresse_Email                String?   @db.VarChar(100)
  Chemin_VigiSurv              String?   @db.VarChar(100)
  Sversion                     String?   @db.VarChar(100)
  
  // Relations
  t_ancienmotpasse             t_ancienmotpasse[]
  t_liaison_utilisateur_groupe t_liaison_utilisateur_groupe[]
  t_profil                     t_profil?
}
```

**✅ Existant** :
- Champs identité (Login, Mot_de_passe, Nom, Prenom)
- Profil utilisateur (relation vers `t_profil`)
- Archive (soft delete)
- Date de création
- Email, téléphone

**❌ Manquant** :
- ❌ Flag `mdpTempActif` (mot de passe temporaire)
- ❌ Date d'expiration du mot de passe temporaire
- ❌ Flag "Première connexion"
- ❌ Flag "Email vérifié"
- ❌ Token de vérification email
- ❌ Token de reset password
- ❌ Compteur tentatives de connexion
- ❌ Date de dernier changement de mot de passe

#### Table `t_profil`
```prisma
model t_profil {
  IdProfil                      Int     @id @default(autoincrement())
  ProfilUtilisateur             String? @unique @db.VarChar(50)
  Commentaire                   String? @db.VarChar(100)
  MC2                           Boolean? @default(false)
  
  // Relations
  t_liaison_profil_autorisation t_liaison_profil_autorisation[]
  t_utilisateur                 t_utilisateur[]
}
```

**✅ Existant** :
- Système de profils (ProfilUtilisateur)
- Liaison avec autorisations (`t_liaison_profil_autorisation`)

**⚠️ Limitation** :
- Pas de profils prédéfinis dans le code
- Seulement 2 rôles gérés côté front : "admin" | "user"
- Pas de support explicite pour "Lecture seule"

#### Table `t_ancienmotpasse`
```prisma
model t_ancienmotpasse {
  IdAncienMotPasse Int            @id @default(autoincrement())
  IdUtilisateur    Int?
  MotDePasse       String?        @db.VarChar(32)
  t_utilisateur    t_utilisateur?
}
```

**✅ Existant** :
- Historique des mots de passe
- ✅ **IMPLÉMENTÉ** dans la fonctionnalité "Changer son mot de passe"

**⚠️ Attention** :
- Taille VARCHAR(32) peut être insuffisante pour bcrypt (60 caractères)
- Pas de timestamp (date d'archivage manquante)

#### Table `ts_journal` (vigitemp_mesure)
```prisma
model ts_journal {
  IdServeurBDD           Int       @default(1)
  IdJournal              Int       @default(0)
  CodeJournal            String?   @db.VarChar(50)
  NomUtilisateur         String?   @db.VarChar(50)
  ProfilUtilisateur      String?   @db.VarChar(50)
  DateHeureJournal       DateTime? @db.DateTime(0)
  CommentaireJournal     String?   @db.LongText
  
  @@id([IdServeurBDD, IdJournal])
}
```

**✅ Existant** :
- Table d'audit trail dans vigitemp_mesure
- Champs pour user, profil, date, commentaire

**❌ Pas utilisé** :
- Aucun middleware pour logger automatiquement
- Aucune UI pour consulter les logs
- Pas d'endpoints API pour récupérer l'audit trail

---

### 2. API BACKEND

#### ✅ `/api/auth/login` (POST)
**Statut** : ✅ **COMPLET**

```typescript
// Route: src/app/api/auth/login/route.ts
POST /api/auth/login
Body: { username: string, password: string }
Response: { id, username, displayName, role, token }
```

**Fonctionnalités** :
- ✅ Recherche utilisateur par login
- ✅ Vérification Archive = false
- ✅ Validation bcrypt du mot de passe
- ✅ Génération JWT token
- ✅ Cookie httpOnly sécurisé
- ✅ Gestion des erreurs (401 si credentials invalides)

**Sécurité** :
- ✅ bcrypt.compare() pour validation
- ✅ HttpOnly cookie
- ✅ Secure cookie en production
- ✅ SameSite: lax
- ✅ Durée de session : 7 jours

**Ce qui manque** :
- ❌ Vérification du flag `mdpTempActif` (forcer changement mdp)
- ❌ Compteur de tentatives de connexion ratées
- ❌ Blocage temporaire après X échecs
- ❌ Mise à jour DateHeureDerniereConnexion
- ❌ Log dans audit trail

---

#### ✅ `/api/auth/logout` (POST)
**Statut** : ✅ **COMPLET**

```typescript
POST /api/auth/logout
Response: { success: true }
```

**Fonctionnalités** :
- ✅ Suppression du cookie JWT (maxAge: 0)

**Ce qui manque** :
- ❌ Log dans audit trail

---

#### ✅ `/api/auth/me` (GET)
**Statut** : ✅ **COMPLET**

```typescript
GET /api/auth/me
Response: { id, username, displayName, role }
```

**Fonctionnalités** :
- ✅ Récupération user depuis JWT cookie
- ✅ Vérification token valide
- ✅ Vérification user non archivé
- ✅ Retour des infos utilisateur

---

#### ✅ `/api/users` (GET)
**Statut** : ✅ **COMPLET**

```typescript
GET /api/users
Response: User[]
```

**Fonctionnalités** :
- ✅ Liste tous les utilisateurs non archivés
- ✅ Include relation t_profil
- ✅ Format standardisé (id, username, displayName, role)

**Ce qui manque** :
- ❌ Pas de protection par rôle (tout le monde peut lister)
- ❌ Pas de pagination
- ❌ Pas de filtres (par rôle, par site, etc.)

---

#### ⚠️ `/api/users` (POST)
**Statut** : 🟡 **INCOMPLET (50%)**

```typescript
POST /api/users
Body: { username, password, displayName, role }
Response: User
```

**Fonctionnalités** :
- ✅ Vérification username unique
- ✅ Création utilisateur
- ✅ Parse displayName en Nom/Prenom

**⚠️ PROBLÈMES CRITIQUES** :
- ❌ **ALERTE SÉCURITÉ** : Mot de passe stocké EN CLAIR !
  ```typescript
  // TEMP: should hash password
  Mot_de_passe: data.password, 
  ```
- ❌ Pas de génération de mot de passe temporaire
- ❌ Pas de flag mdpTempActif
- ❌ Pas d'envoi d'email au nouvel utilisateur
- ❌ Pas de log audit trail
- ❌ Pas de protection par rôle admin
- ❌ Pas de validation des champs (email format, etc.)

**Ce qui manque** :
- ❌ Génération mdp temporaire aléatoire
- ❌ Hachage bcrypt avant insertion
- ❌ Envoi email template (login + mdp temporaire)
- ❌ Flag mdpTempActif = true
- ❌ Log "compte créé par X"

---

#### ✅ `/api/users/[id]` (GET, PATCH, DELETE)
**Statut** : 🟡 **INCOMPLET (70%)**

```typescript
GET    /api/users/:id     // ✅ OK
PATCH  /api/users/:id     // ⚠️ Mdp en clair
DELETE /api/users/:id     // ❌ Non implémenté
```

**PATCH Problems** :
- ❌ Mot de passe pas haché avec bcrypt
- ❌ Pas de vérification règles de mot de passe
- ❌ Pas d'archivage dans t_ancienmotpasse
- ❌ Pas de log audit trail

---

#### ❌ `/api/auth/reset-password`
**Statut** : ❌ **NON IMPLÉMENTÉ**

Fonctionnalités manquantes :
- ❌ POST `/api/auth/forgot-password` (demande reset)
- ❌ POST `/api/auth/reset-password/:token` (nouveau mdp)
- ❌ Génération token unique
- ❌ Envoi email avec lien reset
- ❌ Validation token (expiration 1h)

---

#### ❌ `/api/auth/verify-email`
**Statut** : ❌ **NON IMPLÉMENTÉ**

Fonctionnalités manquantes :
- ❌ GET `/api/auth/verify-email/:token`
- ❌ Génération token de vérification
- ❌ Envoi email de vérification
- ❌ Flag emailVerified dans DB

---

#### ❌ `/api/auth/2fa`
**Statut** : ❌ **NON IMPLÉMENTÉ**

Fonctionnalités manquantes :
- ❌ POST `/api/auth/2fa/enable`
- ❌ POST `/api/auth/2fa/verify`
- ❌ Génération OTP 6 chiffres
- ❌ Envoi email OTP
- ❌ Validation OTP

---

### 3. INTERFACE UTILISATEUR

#### ✅ Page `/login`
**Statut** : ✅ **COMPLÈTE**

Fichier : `src/app/login/page.tsx`

**Fonctionnalités** :
- ✅ Formulaire username/password
- ✅ Gestion d'erreurs avec toast
- ✅ Message d'inactivité (déconnexion auto)
- ✅ Design professionnel avec shadcn/ui
- ✅ Theme toggle (dark mode)
- ✅ Logo et branding Vigitemp

**Ce qui manque** :
- ❌ Lien "Mot de passe oublié ?"
- ❌ Lien "Créer un compte" (si auto-inscription activée)
- ❌ Option "Se souvenir de moi"
- ❌ Affichage force du mot de passe

---

#### ✅ Page `/users`
**Statut** : 🟡 **INCOMPLET (60%)**

Fichier : `src/app/(dashboard)/users/page.tsx`

**Fonctionnalités** :
- ✅ Liste des utilisateurs
- ✅ Dialog "Créer un utilisateur"
- ✅ Formulaire : username, displayName, password, role
- ✅ Appel API POST /api/users
- ✅ Refresh après création

**⚠️ PROBLÈMES** :
- ❌ Formulaire crée des utilisateurs avec mdp EN CLAIR !
- ❌ Pas de validation côté client
- ❌ Pas de gestion des emails
- ❌ Pas de bouton "Générer mot de passe aléatoire"
- ❌ Pas d'option "Envoyer email au nouvel utilisateur"
- ❌ Pas de modification utilisateur (edit)
- ❌ Pas de suppression (archive)
- ❌ Pas de gestion détaillée des permissions
- ❌ Pas de filtres

**Ce qui manque** :
- ❌ Workflow "Process de création admin" complet
- ❌ Génération mdp temporaire
- ❌ Checkbox "Forcer changement mdp à la première connexion"
- ❌ Prévisualisation email qui sera envoyé
- ❌ Gestion rôle "Lecture seule"
- ❌ Association utilisateur ↔ sites/groupes

---

#### ❌ Page `/settings/users`
**Statut** : ❌ **NON IMPLÉMENTÉE**

Fonctionnalités manquantes (admin) :
- ❌ Interface complète gestion utilisateurs
- ❌ Tableau avec filtres avancés
- ❌ Édition inline
- ❌ Archivage/désarchivage
- ❌ Gestion des permissions par utilisateur
- ❌ Historique connexions
- ❌ Réinitialiser mot de passe (admin force)

---

### 4. SÉCURITÉ

#### ✅ Authentification JWT
```typescript
// src/lib/jwt.ts
import jwt from "jsonwebtoken";

export function generateToken(payload: {
  userId: number;
  username: string;
  role: string;
}) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}
```

**✅ Points forts** :
- JWT tokens avec expiration 7 jours
- Secret key dans env
- Cookies httpOnly + secure + sameSite
- Vérification systématique dans `/auth/me`

**⚠️ Points faibles** :
- Pas de refresh token (si JWT expire, logout brutal)
- Pas de révocation de tokens (logout côté serveur)
- Pas de liste noire des tokens révoqués
- Secret key probablement non défini (à vérifier .env)

---

#### ⚠️ Hachage des mots de passe
**Statut** : 🔴 **CRITIQUE - MIXTE**

**✅ Bon** :
- `/api/auth/login` : utilise bcrypt.compare() ✅
- `/api/profile/change-password` : utilise bcrypt.hash() ✅

**🔴 ALERTE SÉCURITÉ** :
- `/api/users` (POST) : **MDP EN CLAIR** ❌
- `/api/users/[id]` (PATCH) : **MDP EN CLAIR** ❌

```typescript
// ⚠️ DANGER - Code actuel dans /api/users/route.ts
const user = await prisma.t_utilisateur.create({
  data: {
    Mot_de_passe: data.password, // ❌❌❌ EN CLAIR !
    ...
  }
});
```

**ACTION REQUISE** :
```typescript
// ✅ À CORRIGER IMMÉDIATEMENT
import bcrypt from "bcryptjs";

const user = await prisma.t_utilisateur.create({
  data: {
    Mot_de_passe: await bcrypt.hash(data.password, 10), // ✅
    ...
  }
});
```

---

#### ❌ Protection des routes (Middleware)
**Statut** : ❌ **NON IMPLÉMENTÉE**

**Fichier manquant** : `src/middleware.ts`

Aucune protection :
- ❌ Routes admin accessibles à tous
- ❌ Routes utilisateur accessibles sans login
- ❌ Pas de vérification rôle sur les API
- ❌ Pas de redirection auto vers /login si non authentifié

**Exemple middleware manquant** :
```typescript
// middleware.ts (À CRÉER)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Routes publiques
  if (pathname === "/login") {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Routes protégées
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Routes admin
  if (pathname.startsWith("/admin")) {
    const payload = verifyToken(token);
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

#### ❌ Rate Limiting
**Statut** : ❌ **NON IMPLÉMENTÉE**

Aucune protection contre :
- ❌ Brute force login
- ❌ Spam création utilisateurs
- ❌ Spam reset password

**Solution recommandée** :
- Utiliser `express-rate-limit` ou `@upstash/ratelimit`
- Bloquer IP après 5 échecs en 15 minutes
- Captcha après 3 échecs

---

### 5. SYSTÈME D'EMAIL

#### ❌ Configuration Email
**Statut** : ❌ **NON CONFIGURÉ**

**Aucun fichier trouvé** :
- ❌ `src/lib/email.ts`
- ❌ `src/lib/mailer.ts`
- ❌ Configuration nodemailer

**Packages manquants** :
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Ce qui manque** :
- ❌ Configuration SMTP (Gmail, SendGrid, AWS SES...)
- ❌ Templates d'emails HTML
- ❌ Template "Nouveau compte créé"
- ❌ Template "Reset password"
- ❌ Template "Code OTP 2FA"
- ❌ Template "Changement mdp réussi"
- ❌ Queue d'envoi d'emails
- ❌ Logs d'envoi d'emails

**Template manquant** : Email de création de compte
```html
<!-- templates/new-account.html -->
<h1>Votre compte Vigitemp a été créé</h1>
<p>Bonjour {{prenom}} {{nom}},</p>
<p>Un administrateur a créé un compte pour vous.</p>
<p>
  <strong>Login :</strong> {{login}}<br>
  <strong>Mot de passe temporaire :</strong> {{mdpTemporaire}}
</p>
<p>
  <a href="{{lien}}">Se connecter</a>
</p>
<p>⚠️ Vous devrez changer votre mot de passe à la première connexion.</p>
```

---

## 📊 TABLEAU DE COMPARAISON : ATTENDU vs RÉEL

### Tâche Notion : "Login / Création de compte + gestion des accès"

| Fonctionnalité | Attendu | État Réel | Avancement |
|----------------|---------|-----------|------------|
| **Login system** | JWT + bcrypt | ✅ Implémenté | 100% |
| **Logout** | Suppression session | ✅ Implémenté | 100% |
| **UI Login** | Professionnelle | ✅ Implémenté | 100% |
| **Création compte (admin)** | Formulaire admin | 🟡 UI existe | 30% |
| **Mdp temporaire auto** | Génération + email | ❌ Manque | 0% |
| **Flag mdpTempActif** | Force changement | ❌ Manque | 0% |
| **Auto-inscription** | Config on/off | ❌ Manque | 0% |
| **Reset password email** | Lien temporaire | ❌ Manque | 0% |
| **Gestion rôles** | Admin/User/Lecture | 🟡 Partiel (2/3) | 65% |
| **Permissions** | Par profil | 🟡 Schema OK | 50% |
| **Protection routes** | Middleware | ❌ Manque | 0% |
| **Interface gestion users** | CRUD complet | 🟡 Liste + Create | 40% |
| **Historique connexions** | Logs | ❌ Manque | 0% |

**Estimation globale** : 🟡 **55% COMPLÉTÉ**

---

### Tâche Notion : "Process de création d'un compte utilisateur (admin)"

| Fonctionnalité | Attendu | État Réel | Avancement |
|----------------|---------|-----------|------------|
| **Formulaire admin** | Nom/Prénom/Login/Email/Rôle | 🟡 Username/DisplayName/Role | 60% |
| **Génération mdp auto** | Aléatoire sécurisé | ❌ Manque | 0% |
| **Choix mdp manuel/auto** | Option dans formulaire | ❌ Manque | 0% |
| **Flag mdpTempActif** | Insertion en DB | ❌ Manque | 0% |
| **Email template** | Login + mdp + lien | ❌ Manque | 0% |
| **Force changement 1ère co** | Redirection auto | ❌ Manque | 0% |
| **Archive mdp temporaire** | Dans t_ancienmotpasse | ❌ Manque | 0% |
| **Audit log** | "Compte créé par X" | ❌ Manque | 0% |
| **Hachage bcrypt** | Avant insertion | 🔴 **EN CLAIR !** | 0% |

**Estimation globale** : 🔴 **10% COMPLÉTÉ** (UI basique seulement)

---

### Tâche Notion : "Changer son mot de passe + double authentification"

| Fonctionnalité | Attendu | État Réel | Avancement |
|----------------|---------|-----------|------------|
| **Formulaire changement mdp** | Ancien + nouveau | ✅ Implémenté | 100% |
| **Validation règles** | Configurable admin | ✅ Implémenté | 100% |
| **Historique mdp** | 5 derniers | ✅ Implémenté | 100% |
| **Vérification email** | Envoi code | ❌ Manque | 0% |
| **Vérification téléphone** | SMS (Expert) | ❌ Manque | 0% |
| **2FA email** | OTP 6 chiffres | ❌ Manque | 0% |
| **2FA SMS** | OTP (Expert) | ❌ Manque | 0% |
| **Audit trail** | Log changement | ❌ Manque | 0% |
| **Tests** | Suite complète | ⏳ À faire | 0% |

**Estimation globale** : 🟡 **40% COMPLÉTÉ** (sans 2FA)

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### 🔴 CRITIQUE (à corriger immédiatement)

1. **SÉCURITÉ : Hacher les mots de passe dans `/api/users`**
   ```typescript
   // Fichiers à corriger :
   // - src/app/api/users/route.ts (POST)
   // - src/app/api/users/[id]/route.ts (PATCH)
   
   // Ajouter :
   import bcrypt from "bcryptjs";
   Mot_de_passe: await bcrypt.hash(data.password, 10)
   ```

2. **Ajouter middleware de protection des routes**
   - Créer `src/middleware.ts`
   - Protéger toutes les routes sauf `/login`
   - Vérifier rôle admin pour `/users`, `/settings`

3. **Ajouter champs manquants dans `t_utilisateur`**
   ```sql
   ALTER TABLE t_utilisateur 
   ADD COLUMN mdpTempActif BOOLEAN DEFAULT FALSE,
   ADD COLUMN dateExpirationMdpTemp DATETIME,
   ADD COLUMN emailVerifie BOOLEAN DEFAULT FALSE,
   ADD COLUMN tokenResetPassword VARCHAR(255),
   ADD COLUMN dateExpirationTokenReset DATETIME,
   ADD COLUMN tentativesConnexionEchouees INT DEFAULT 0,
   ADD COLUMN dateBloquageCompte DATETIME;
   ```

---

### 🟠 HAUTE PRIORITÉ (semaine prochaine)

4. **Implémenter "Process de création compte admin"**
   - Générer mot de passe aléatoire sécurisé
   - Insérer avec `mdpTempActif = true`
   - Configurer système email (nodemailer)
   - Créer template email "Nouveau compte"
   - Envoyer email automatique
   - Log dans audit trail

5. **Forcer changement mdp à la première connexion**
   - Vérifier `mdpTempActif` dans `/api/auth/login`
   - Rediriger vers `/profile/force-change-password`
   - Valider nouveau mdp
   - Archiver mdp temporaire dans `t_ancienmotpasse`
   - Set `mdpTempActif = false`

6. **Reset password par email**
   - Créer `POST /api/auth/forgot-password`
   - Générer token unique (UUID)
   - Envoyer email avec lien
   - Créer page `/reset-password/:token`
   - Valider token (expiration 1h)
   - Changer mot de passe
   - Invalider token

---

### 🟡 MOYENNE PRIORITÉ (dans 2 semaines)

7. **Ajouter rôle "Lecture seule"**
   - Modifier type role : `"admin" | "user" | "readonly"`
   - Créer profil "Lecture seule" en DB
   - Limiter actions dans UI
   - Protéger endpoints API (pas de POST/PATCH/DELETE)

8. **Implémenter 2FA email**
   - Créer `POST /api/auth/2fa/send-otp`
   - Générer code 6 chiffres aléatoire
   - Stocker en session/cache (Redis/memory)
   - Envoyer par email
   - Créer page `/login/verify-otp`
   - Valider OTP (expire en 5min)

9. **Interface admin complète gestion utilisateurs**
   - Page `/settings/users` dédiée
   - Tableau avec pagination
   - Filtres (rôle, site, statut)
   - Édition inline
   - Archivage/désarchivage
   - Reset mdp (admin force)
   - Historique connexions

---

### 🟢 BASSE PRIORITÉ (V2)

10. **Auto-inscription (self-registration)**
    - Page `/register` publique
    - Validation email obligatoire
    - Approval workflow admin
    - Configuration on/off dans settings

11. **2FA SMS (Licence Expert)**
    - Intégration Twilio/AWS SNS
    - Envoi OTP par SMS
    - Configuration numéro téléphone

12. **Rate limiting & sécurité avancée**
    - Rate limit login (5 essais / 15min)
    - Captcha après 3 échecs
    - Blocage IP temporaire
    - Détection activité suspecte

---

## 📁 FICHIERS À CRÉER

### Priorité 1 (cette semaine)
```
src/
├── middleware.ts                          // Protection routes
├── lib/
│   └── email.ts                           // Config nodemailer
├── app/api/
│   └── auth/
│       ├── forgot-password/route.ts       // Demande reset
│       └── reset-password/route.ts        // Reset avec token
└── app/
    └── reset-password/
        └── [token]/page.tsx               // UI reset password
```

### Priorité 2 (semaine prochaine)
```
templates/
├── emails/
│   ├── new-account.html                   // Email nouveau compte
│   ├── reset-password.html                // Email reset mdp
│   ├── password-changed.html              // Confirmation changement
│   └── otp-2fa.html                       // Code OTP 2FA
src/
├── app/(dashboard)/
│   └── settings/
│       └── users/page.tsx                 // Interface admin complète
└── app/api/
    └── auth/
        ├── 2fa/
        │   ├── send-otp/route.ts          // Envoyer OTP
        │   └── verify-otp/route.ts        // Vérifier OTP
        └── verify-email/
            └── [token]/route.ts           // Vérification email
```

---

## 🔄 PLAN DE MIGRATION

### Étape 1 : Sécurité (1 jour)
1. ✅ Corriger hachage mdp dans `/api/users`
2. ✅ Tester création utilisateur
3. ✅ Créer middleware protection
4. ✅ Tester routes protégées

### Étape 2 : Database (1 jour)
1. ✅ Migration Prisma : ajouter champs manquants
2. ✅ Seed profils prédéfinis (admin, user, readonly)
3. ✅ Corriger t_ancienmotpasse (VARCHAR 60)
4. ✅ Générer Prisma Client

### Étape 3 : Emails (2 jours)
1. ✅ Installer nodemailer
2. ✅ Créer `lib/email.ts`
3. ✅ Configurer SMTP (Gmail test)
4. ✅ Créer templates HTML
5. ✅ Tester envoi email

### Étape 4 : Process admin (3 jours)
1. ✅ Modifier `POST /api/users` (mdp temporaire)
2. ✅ Améliorer UI `/users` (option génération mdp)
3. ✅ Implémenter envoi email
4. ✅ Forcer changement 1ère connexion
5. ✅ Tests complets

### Étape 5 : Reset password (2 jours)
1. ✅ Créer endpoints API
2. ✅ Créer UI reset-password
3. ✅ Template email
4. ✅ Tests

### Étape 6 : 2FA (3 jours)
1. ✅ Endpoints OTP
2. ✅ UI verify-otp
3. ✅ Template email
4. ✅ Tests

**Total estimé** : 12 jours (~2.5 semaines)

---

## ✅ CHECKLIST COMPLÈTE

### Authentification de base
- [x] JWT tokens
- [x] Login endpoint
- [x] Logout endpoint
- [x] Current user endpoint
- [x] UI page login
- [x] Cookies sécurisés
- [ ] Middleware protection routes
- [ ] Rate limiting

### Gestion utilisateurs
- [x] Liste utilisateurs (GET /api/users)
- [x] Créer utilisateur basique (POST /api/users)
- [ ] Créer utilisateur avec mdp temporaire
- [ ] Hachage bcrypt dans création
- [ ] Email notification nouveau compte
- [ ] Forcer changement mdp 1ère connexion
- [ ] Éditer utilisateur
- [ ] Archiver utilisateur
- [ ] Historique connexions
- [ ] Interface admin complète

### Mots de passe
- [x] Changement mdp (/profile/change-password)
- [x] Historique mdp (t_ancienmotpasse)
- [x] Règles configurables
- [ ] Reset password par email
- [ ] Génération mdp aléatoire
- [ ] Expiration mdp temporaire
- [ ] Notification changement mdp

### Sécurité avancée
- [ ] 2FA email (OTP)
- [ ] 2FA SMS (Expert)
- [ ] Vérification email
- [ ] Blocage après X échecs
- [ ] Détection activité suspecte
- [ ] Audit trail complet

### Rôles & Permissions
- [x] Profils en base de données
- [x] Rôles admin/user
- [ ] Rôle "Lecture seule"
- [ ] Permissions par profil
- [ ] Protection API par rôle
- [ ] UI adaptative par rôle

### Email système
- [ ] Configuration SMTP
- [ ] Template nouveau compte
- [ ] Template reset password
- [ ] Template OTP 2FA
- [ ] Template changement mdp
- [ ] Queue emails
- [ ] Logs envois

---

## 📞 CONTACT & QUESTIONS

**Auditeur** : GitHub Copilot  
**Date** : 5 décembre 2024  
**Durée audit** : 2 heures  

**Questions ouvertes** :
1. Faut-il supporter l'auto-inscription (self-registration) ou seulement création admin ?
2. 2FA email obligatoire ou optionnel pour les utilisateurs ?
3. Durée de vie des mots de passe temporaires (24h, 7j, illimité) ?
4. SMTP : Gmail, SendGrid, AWS SES, ou serveur local ?
5. Rôle "Lecture seule" : permissions exactes à définir

---

**FIN DU RAPPORT D'AUDIT**
