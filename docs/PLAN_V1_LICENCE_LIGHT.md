# Plan de développement V1 Licence Light

## Vue d'ensemble

Ce document détaille toutes les fonctionnalités à implémenter pour la version 1 de Vigitemp en mode Licence Light, organisées par domaine fonctionnel.

---

## 📊 État actuel vs. À faire

### ✅ Déjà implémenté
- Interface de surveillance avec graphiques et cartes de monitoring
- Système d'alarmes (affichage, comptage, filtrage)
- Dashboard avec statistiques
- Thème clair/sombre
- Navigation principale
- Affichage des mesures (125 dernières) avec graphiques Chart.js
- Consignes visuelles sur les graphiques
- Filtrage par site/groupe (partiellement)

### 🔧 À compléter/améliorer
Tout le reste du plan ci-dessous

---

## 🎯 SURVEILLANCE

### 1. Verrouillage d'écran temporisable ⏱️
**Statut**: ❌ Non implémenté

**Description**: 
Permettre à l'utilisateur de configurer un délai d'inactivité après lequel l'écran se verrouille automatiquement, nécessitant une réauthentification.

**Implémentation technique**:
- Créer un paramètre global `screenLockTimeout` (en minutes)
- Ajouter un hook `useIdleTimer` qui détecte l'inactivité (pas de mouvement souris/clavier)
- Afficher un écran de verrouillage (overlay) demandant le mot de passe
- Stocker le paramètre dans les préférences utilisateur (table `t_utilisateur` ou nouvelle table `t_preferences`)
- Interface dans Paramètres > Sécurité

**Fichiers concernés**:
- Nouveau: `src/hooks/useIdleTimer.ts`
- Nouveau: `src/components/screen-lock-overlay.tsx`
- Nouveau: `src/app/(dashboard)/settings/security/page.tsx`
- Modifier: `src/app/(dashboard)/layout.tsx` (intégrer le système de verrouillage)

**Base de données**:
```sql
ALTER TABLE t_utilisateur ADD COLUMN ScreenLockTimeout INT DEFAULT 15; -- minutes
```

**Estimation**: 1-2 jours

---

### 2. Désactivation temporaire des alarmes par lieu 🔕
**Statut**: ❌ Non implémenté

**Description**:
Permettre de désactiver les alarmes d'un ou plusieurs lieux pour une durée déterminée ou indéterminée, sans couper la surveillance (les mesures continuent). Les lieux avec alarmes désactivées doivent être visuellement différenciés. Tracer l'action dans l'audit trail.

**Implémentation technique**:
- Ajouter champs dans `t_lieu`:
  - `AlarmeDesactivee` (boolean)
  - `AlarmeDesactiveeJusquA` (datetime nullable)
  - `AlarmeDesactiveeMotif` (text)
- Créer une modal/dialog pour désactiver les alarmes:
  - Checkbox "Durée limitée" avec sélecteur d'heures/date
  - Champ "Motif" obligatoire
- Modifier la logique de génération d'alarmes:
  - Vérifier `AlarmeDesactivee` avant de créer une alarme
  - Si désactivée temporairement, vérifier que `AlarmeDesactiveeJusquA > NOW()`
- Affichage visuel:
  - Icône spéciale sur les cartes de monitoring (ex: cloche barrée)
  - Badge "Alarmes désactivées" avec info-bulle montrant la raison
  - Couleur de bordure différente (ex: orange)
- Audit trail:
  - Logger l'action "ALARM_DISABLED" avec IdLieu, durée, motif, utilisateur

**Fichiers concernés**:
- Modifier: `src/components/monitoring-card.tsx` (ajout icône + état visuel)
- Nouveau: `src/components/disable-alarm-dialog.tsx`
- Modifier: `src/app/api/alarms/generate/route.ts` (vérification avant création)
- Nouveau: `src/app/api/lieux/[id]/alarm-status/route.ts` (activer/désactiver)
- Modifier: Agent C# `Vigitemp Agent/Vigitemp Agent/Program.cs` (check avant envoi alarme)

**Base de données**:
```sql
ALTER TABLE t_lieu 
ADD COLUMN AlarmeDesactivee BOOLEAN DEFAULT FALSE,
ADD COLUMN AlarmeDesactiveeJusquA DATETIME NULL,
ADD COLUMN AlarmeDesactiveeMotif TEXT NULL;

-- Table audit trail (si pas déjà créée)
CREATE TABLE t_audit_trail (
  IdAudit INT AUTO_INCREMENT PRIMARY KEY,
  DateHeure DATETIME NOT NULL,
  IdUtilisateur INT,
  Action VARCHAR(100),
  Entite VARCHAR(100),
  IdEntite INT,
  Details TEXT,
  IpAddress VARCHAR(45),
  INDEX idx_date (DateHeure),
  INDEX idx_user (IdUtilisateur)
);
```

**Estimation**: 2-3 jours

---

### 3. Multi-groupes pour un même lieu 📁
**Statut**: ❌ Non implémenté

**Description**:
Permettre d'associer un même lieu à plusieurs groupes différents (ex: un lieu peut être dans "Biomédical" ET "Service Technique" ET "Bloc Opératoire"), permettant des vues organisationnelles différentes selon les utilisateurs.

**Implémentation technique**:
- Actuellement: relation 1-N (un lieu = un groupe via `t_lieu.IdGroupe`)
- Nouveau: relation N-N (un lieu = plusieurs groupes)
- Créer table de liaison `t_lieu_groupe`:
  ```sql
  CREATE TABLE t_lieu_groupe (
    IdLieu INT NOT NULL,
    IdGroupe INT NOT NULL,
    OrdreAffichage INT DEFAULT 0,
    PRIMARY KEY (IdLieu, IdGroupe),
    FOREIGN KEY (IdLieu) REFERENCES t_lieu(IdLieu),
    FOREIGN KEY (IdGroupe) REFERENCES t_groupe(IdGroupe)
  );
  ```
- Modifier l'interface de paramétrage des lieux:
  - Remplacer le select simple par un multi-select avec chips
  - Permettre d'ajouter/retirer des groupes dynamiquement
- Modifier les requêtes Prisma:
  - Inclure `t_lieu_groupe` dans les relations
  - Filtrer par groupe en utilisant la table de liaison
- Interface de gestion:
  - Page "Paramètres > Lieux > [Lieu]" avec section "Groupes associés"
  - Possibilité d'ordonner les groupes par priorité

**Fichiers concernés**:
- Nouveau: Migration Prisma pour `t_lieu_groupe`
- Modifier: `prisma/schema.prisma` (relation N-N)
- Modifier: `src/app/(dashboard)/surveillance/server-sensors.tsx` (inclure groupes multiples)
- Modifier: `src/app/(dashboard)/settings/locations/[id]/page.tsx` (UI multi-groupes)
- Nouveau: `src/components/multi-group-selector.tsx`

**Estimation**: 2 jours

---

### 4. Commentaires d'alarme sur les courbes 💬
**Statut**: ❌ Non implémenté

**Description**:
Permettre d'associer un commentaire à une alarme et afficher ce commentaire directement sur la courbe de température via une signalisation visuelle (point, icône), accessible au survol ou clic sans aller dans la page Alarmes.

**Implémentation technique**:
- Ajouter un champ `Commentaire` dans `t_alarme` (TEXT)
- Sur les graphiques:
  - Afficher un marqueur (icône commentaire) aux dates où il y a une alarme avec commentaire
  - Au survol: tooltip avec le commentaire complet
  - Au clic: modal avec détails de l'alarme + commentaire éditable
- Dans la page Alarmes:
  - Ajouter colonne "Commentaire" dans le tableau
  - Permettre d'ajouter/modifier le commentaire via bouton ou double-clic
- API:
  - `PATCH /api/alarms/[id]` pour mettre à jour le commentaire
  - Inclure les alarmes avec leurs commentaires dans `/api/mesures/[idLieu]`

**Fichiers concernés**:
- Modifier: `src/components/monitoring-details-modal.tsx` (marqueurs sur graphique)
- Modifier: `src/components/monitoring-card.tsx` (marqueurs sur mini-graphique)
- Nouveau: `src/components/alarm-comment-marker.tsx`
- Nouveau: `src/app/api/alarms/[id]/comment/route.ts`
- Modifier: `src/app/api/mesures/[idLieu]/route.ts` (inclure alarmes avec commentaires)

**Base de données**:
```sql
ALTER TABLE t_alarme ADD COLUMN Commentaire TEXT NULL;
```

**Chart.js implémentation**:
```typescript
// Ajouter un plugin pour afficher des annotations
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(annotationPlugin);

// Dans les options du graphique:
plugins: {
  annotation: {
    annotations: alarmComments.map(alarm => ({
      type: 'point',
      xValue: alarm.DateHeureDebut,
      yValue: alarm.Valeur,
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      radius: 6,
      // ... tooltip avec commentaire
    }))
  }
}
```

**Estimation**: 2-3 jours

---

### 5. Filtre de site/groupe amélioré 🔍
**Statut**: ⚠️ Partiellement implémenté

**Description**:
Le filtrage existe déjà dans la page surveillance, mais il faut:
- Ajouter un filtre par site (en plus du groupe)
- Sauvegarder les préférences de filtrage par utilisateur
- Permettre la sélection multiple de sites/groupes
- Afficher le nombre de lieux affichés vs total

**Implémentation technique**:
- Ajouter un select "Site" à côté du select "Groupe"
- Stocker les filtres sélectionnés dans localStorage ET en base
- Ajouter table `t_utilisateur_filtres`:
  ```sql
  CREATE TABLE t_utilisateur_filtres (
    IdUtilisateur INT PRIMARY KEY,
    SitesSelectionnes JSON,
    GroupesSelectionnes JSON,
    FOREIGN KEY (IdUtilisateur) REFERENCES t_utilisateur(IdUtilisateur)
  );
  ```
- Afficher un compteur: "17 lieux affichés sur 42 total"
- Permettre "Tout sélectionner" / "Tout désélectionner"

**Fichiers concernés**:
- Modifier: `src/app/(dashboard)/surveillance/surveillance-client.tsx`
- Nouveau: `src/components/multi-site-group-filter.tsx`
- Nouveau: `src/app/api/user/filters/route.ts`

**Estimation**: 1 jour

---

## 🔬 MÉTROLOGIE

### 6. Calibrage sonde 2 points (y = ax + b) 📐
**Statut**: ❌ Non implémenté

**Description**:
Toutes les sondes utilisent un calibrage linéaire à 2 points de type `y = ax + b` où:
- `y` = valeur corrigée (affichée)
- `x` = valeur brute (lue par le capteur)
- `a` = coefficient multiplicateur (pente)
- `b` = offset (décalage)

**Implémentation technique**:
- Ajouter champs dans `t_sonde`:
  - `CalibrageA` (DECIMAL(10,6) DEFAULT 1.0) - coefficient
  - `CalibrageB` (DECIMAL(10,6) DEFAULT 0.0) - offset
  - `DateDernierCalibrage` (DATETIME)
  - `MethodeCalibrage` (ENUM('DEUX_POINTS', 'UN_POINT'))
- Lors de la réception d'une mesure:
  - Appliquer la formule: `valeurCorrigee = (valeurBrute * CalibrageA) + CalibrageB`
  - Stocker les deux valeurs (brute + corrigée) ou juste la corrigée
- Interface de calibrage:
  - Page "Paramètres > Sondes > [Sonde] > Calibrage"
  - Mode "2 points":
    * Point 1: Valeur de référence (thermomètre étalon) + Valeur lue par la sonde
    * Point 2: Idem à une autre température
    * Calculer automatiquement a et b
  - Afficher la formule calculée: `y = 0.9823x + 0.145`
  - Graphique de comparaison avant/après calibrage

**Calcul des coefficients** (2 points):
```typescript
// Point 1: (x1_brute, y1_reference)
// Point 2: (x2_brute, y2_reference)
const a = (y2_reference - y1_reference) / (x2_brute - x1_brute);
const b = y1_reference - (a * x1_brute);
```

**Fichiers concernés**:
- Modifier: Agent C# pour appliquer la correction avant envoi
- Nouveau: `src/app/(dashboard)/settings/sensors/[id]/calibration/page.tsx`
- Nouveau: `src/components/calibration-calculator.tsx`
- Nouveau: `src/app/api/sensors/[id]/calibrate/route.ts`

**Base de données**:
```sql
ALTER TABLE t_sonde 
ADD COLUMN CalibrageA DECIMAL(10,6) DEFAULT 1.0,
ADD COLUMN CalibrageB DECIMAL(10,6) DEFAULT 0.0,
ADD COLUMN DateDernierCalibrage DATETIME NULL,
ADD COLUMN MethodeCalibrage ENUM('DEUX_POINTS', 'UN_POINT') DEFAULT 'DEUX_POINTS';
```

**Estimation**: 2-3 jours

---

### 7. Étalonnage 1 point (méthode à définir) 📊
**Statut**: ❌ Non implémenté (en attente spécifications PPE)

**Description**:
Permettre un calibrage simplifié avec un seul point de référence. La méthode exacte doit être définie par PPE (Protocole de Performance et d'Étalonnage).

**Options possibles**:
1. **Offset pur**: `b = valeur_reference - valeur_brute`, `a = 1.0`
2. **Ratio pur**: `a = valeur_reference / valeur_brute`, `b = 0.0`
3. **Point de référence + pente fixe**: utiliser une pente standard (à définir par MC2)

**Implémentation technique** (en attente):
- Interface simplifiée avec un seul champ de saisie
- "Valeur de référence" + "Valeur lue"
- Calculer automatiquement selon la méthode choisie
- Avertissement: "Calibrage 1 point moins précis que 2 points"

**Fichiers concernés**:
- Même que calibrage 2 points, avec mode alternatif

**Estimation**: 1 jour (une fois la méthode définie)

---

## 🔧 EXPLOITATION

### 8. Formulaire de contact MC2 📧
**Statut**: ❌ Non implémenté

**Description**:
Ajouter un lien/bouton permettant d'envoyer une question à MC2 avec catégorisation:
- VigiTemp (questions logiciel)
- Métrologie prestation
- Maintenance MMM (matériel)
- Administratif
- Financier

**Implémentation technique**:
- Créer une page "Support > Contacter MC2"
- Formulaire avec:
  - Select catégorie (requis)
  - Sujet (requis)
  - Message (requis, min 20 caractères)
  - Pièces jointes (optionnel, max 10MB)
  - Infos auto-remplies: utilisateur, site, licence
- API backend qui envoie un email via service SMTP:
  - Configuration dans variables d'environnement
  - Adresses email différentes selon la catégorie
  - Template HTML avec infos du client
- Confirmation d'envoi + numéro de ticket (si système de ticketing)

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/support/contact/page.tsx`
- Nouveau: `src/app/api/support/send-message/route.ts`
- Nouveau: `src/lib/email-sender.ts` (utiliser nodemailer ou service externe)
- Modifier: `src/components/app-sidebar.tsx` (ajouter lien Support)

**Configuration email**:
```typescript
// .env.local
SMTP_HOST=smtp.mc2i.fr
SMTP_PORT=587
SMTP_USER=vigitemp@mc2i.fr
SMTP_PASS=***

// Catégories -> emails
const categoryEmails = {
  'vigitemp': 'support-vigitemp@mc2i.fr',
  'metrologie': 'metrologie@mc2i.fr',
  'maintenance': 'maintenance@mc2i.fr',
  'administratif': 'admin@mc2i.fr',
  'financier': 'compta@mc2i.fr',
};
```

**Estimation**: 1-2 jours

---

### 9. Gestion chaîne de transmission (PC > Module > Sonde > Lieu) 🔗
**Statut**: ❌ Non implémenté

**Description**:
Créer une interface unifiée permettant de visualiser et gérer toute la chaîne de transmission:
- PC/Logger → Module → Sonde → Lieu
- Lors de la sélection d'un module, afficher automatiquement les sondes et lieux associés
- Vue hiérarchique en arbre
- Possibilité de déplacer des éléments par drag & drop
- Indicateurs d'état de connexion à chaque niveau

**Implémentation technique**:
- Créer une page "Paramètres > Infrastructure"
- Affichage en arbre (tree view):
  ```
  📡 PC Principal (192.168.1.100)
    ├─ 🔌 Module IN2000
    │   ├─ 🌡️ Sonde IEEDXR → Lieu "Bureau Nico"
    │   └─ 🌡️ Sonde IEE6L2 → Lieu "CONGEL 2"
    └─ 🔌 Module IN2003
        └─ 🌡️ Sonde IEEDRS → Lieu "CONGEL 1"
  ```
- Composant interactif:
  - Cliquer sur un module → afficher ses sondes + statut
  - Cliquer sur une sonde → afficher son lieu + dernière mesure
  - Drag & drop pour réassocier sonde à un autre module
- Couleurs d'état:
  - Vert: communication OK
  - Orange: warning (pas de mesure depuis X temps)
  - Rouge: hors ligne
- Actions:
  - "Tester la connexion"
  - "Réassocier sonde"
  - "Ajouter nouveau module/sonde"

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/settings/infrastructure/page.tsx`
- Nouveau: `src/components/infrastructure-tree.tsx`
- Nouveau: `src/components/infrastructure-node.tsx`
- Nouveau: `src/app/api/infrastructure/tree/route.ts`
- Nouveau: `src/app/api/infrastructure/reassign/route.ts`

**Base de données** (si pas déjà existant):
```sql
-- Table des modules/loggers
CREATE TABLE t_module (
  IdModule INT AUTO_INCREMENT PRIMARY KEY,
  NumeroSerie VARCHAR(50) UNIQUE,
  Type VARCHAR(50),
  AdresseIP VARCHAR(45),
  Actif BOOLEAN DEFAULT TRUE,
  DerniereConnexion DATETIME
);

-- Relation module -> sonde
ALTER TABLE t_sonde ADD COLUMN IdModule INT;
ALTER TABLE t_sonde ADD FOREIGN KEY (IdModule) REFERENCES t_module(IdModule);
```

**Estimation**: 3-4 jours

---

## ⚙️ PARAMÉTRAGE

### 10. Gestion des actionneurs 🎛️
**Statut**: ❌ Non implémenté (nécessite clarification)

**Description**:
Permettre de paramétrer des actionneurs (relais, alarmes visuelles/sonores, etc.) et les associer à un ou plusieurs lieux. Un actionneur peut réagir aux alarmes de plusieurs lieux.

**Questions à clarifier avec PPE**:
- Qu'est-ce qu'un actionneur dans Vigitemp ? (relais physique, notification, autre ?)
- Comment sont-ils connectés ? (via module, via réseau, etc.)
- Quelles actions peuvent-ils effectuer ?
- Comment sont-ils déclenchés ? (alarme haute/basse, perte de communication, etc.)

**Implémentation technique** (hypothèse):
- Table `t_actionneur`:
  ```sql
  CREATE TABLE t_actionneur (
    IdActionneur INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(100),
    Type ENUM('RELAIS', 'BUZZER', 'EMAIL', 'SMS', 'WEBHOOK'),
    Configuration JSON,
    Actif BOOLEAN DEFAULT TRUE
  );
  ```
- Table de liaison `t_actionneur_lieu`:
  ```sql
  CREATE TABLE t_actionneur_lieu (
    IdActionneur INT,
    IdLieu INT,
    ConditionDeclenchement ENUM('ALARME_HAUTE', 'ALARME_BASSE', 'PERTE_COMMUNICATION'),
    Delai INT DEFAULT 0, -- secondes avant déclenchement
    PRIMARY KEY (IdActionneur, IdLieu)
  );
  ```
- Interface:
  - Page "Paramètres > Actionneurs"
  - Liste des actionneurs avec état (actif/inactif)
  - Pour chaque actionneur: liste des lieux associés
  - Bouton "Tester" pour déclencher manuellement
- Logique de déclenchement:
  - Quand une alarme se déclenche → vérifier si des actionneurs sont associés
  - Envoyer commande à l'actionneur (via API, MQTT, ou autre protocole)
  - Logger l'action dans audit trail

**Estimation**: 2-3 jours (après clarification)

---

### 11. Gestion des licences avec upgrade 📜
**Statut**: ⚠️ Partiellement implémenté

**Description**:
Créer une page dédiée à la gestion de la licence avec:
- Affichage du type de licence actuel (Light / Standard / Expert)
- Explication des fonctions disponibles dans chaque licence
- Tableau comparatif des 3 licences
- Bouton "Passer à la licence supérieure" attractif
- Contact commercial pour upgrade

**Implémentation technique**:
- Page "Paramètres > Licence"
- Composants:
  - Badge avec type de licence actuel
  - Tableau comparatif avec checkmarks:
    | Fonctionnalité | Light | Standard | Expert |
    |---|---|---|---|
    | Surveillance temps réel | ✓ | ✓ | ✓ |
    | Alarmes | ✓ | ✓ | ✓ |
    | Rapports automatiques | ✗ | ✓ | ✓ |
    | Actionneurs | ✗ | ✓ | ✓ |
    | Métrologie avancée | ✗ | ✗ | ✓ |
    | Utilisateurs simultanés | 1 | 5 | illimité |
  - CTA (Call To Action) design:
    * Bouton principal "Passer à Standard" avec gradient
    * Ou "Passer à Expert" si déjà Standard
    * Animation au survol
- Informations de contact:
  - Email: commercial@mc2i.fr
  - Téléphone: +33 X XX XX XX XX
  - Lien "Demander une démo"
- Stocker le type de licence:
  ```sql
  CREATE TABLE t_licence (
    Id INT PRIMARY KEY DEFAULT 1,
    Type ENUM('LIGHT', 'STANDARD', 'EXPERT') DEFAULT 'LIGHT',
    DateDebut DATE,
    DateFin DATE,
    NbUtilisateursMax INT DEFAULT 1,
    CleActivation VARCHAR(255),
    CONSTRAINT chk_single_row CHECK (Id = 1)
  );
  ```

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/settings/license/page.tsx`
- Nouveau: `src/components/license-comparison-table.tsx`
- Nouveau: `src/components/upgrade-cta-button.tsx`
- Nouveau: `src/app/api/license/info/route.ts`
- Modifier: `src/app/(dashboard)/layout.tsx` (vérifier licence pour débloquer fonctionnalités)

**Estimation**: 2 jours

---

### 12. Outils de dépannage 🛠️
**Statut**: ❌ Non implémenté (en attente définition hotline)

**Description**:
Créer une page avec des outils de diagnostic et dépannage pour la hotline MC2. Outils à définir avec l'équipe support.

**Exemples d'outils possibles**:
1. **Test de connexion**:
   - Ping des modules
   - Vérification connexion base de données
   - Vérification service agent Windows
2. **Diagnostic réseau**:
   - Afficher configuration IP
   - Tracer les paquets réseau
3. **Logs système**:
   - Visualiser les logs de l'agent
   - Télécharger les logs pour analyse
4. **Réinitialisation**:
   - Redémarrer l'agent
   - Vider le cache
   - Forcer resynchronisation
5. **Informations système**:
   - Version logiciel
   - Version base de données
   - État des services

**Implémentation technique**:
- Page "Paramètres > Outils de dépannage" (protégée par rôle admin)
- Chaque outil = composant avec bouton d'action
- Affichage des résultats en temps réel
- Possibilité d'exporter un rapport complet

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/settings/troubleshooting/page.tsx`
- Nouveau: `src/components/troubleshooting-tools/`
  - `connection-test.tsx`
  - `network-diagnostic.tsx`
  - `logs-viewer.tsx`
  - `system-info.tsx`
- Nouveau: `src/app/api/troubleshooting/[tool]/route.ts`

**Estimation**: 2-3 jours (après définition des outils)

---

### 13. Ajout de sonde par fichier de calibrage 📄
**Statut**: ❌ Non implémenté

**Description**:
Toute sonde sortant de MC2 dispose d'un fichier de calibrage. Permettre d'ajouter une nouvelle sonde simplement en uploadant ce fichier, qui contient toutes les informations nécessaires.

**Format du fichier de calibrage** (à définir):
```json
{
  "numeroSerie": "IEEDXR-2024-001",
  "modele": "IEEDXR",
  "type": "TEMPERATURE",
  "dateCalibrage": "2024-11-15",
  "calibrage": {
    "methode": "DEUX_POINTS",
    "coefficientA": 0.9823,
    "offsetB": 0.145,
    "point1": { "reference": 0.0, "lecture": -0.145 },
    "point2": { "reference": 20.0, "lecture": 19.85 }
  },
  "specifications": {
    "plageMin": -50,
    "plageMax": 100,
    "precision": 0.5,
    "resolution": 0.1
  },
  "certificat": "CERT-2024-001"
}
```

**Implémentation technique**:
- Page "Paramètres > Sondes > Ajouter une sonde"
- Zone de drag & drop pour fichier (.json, .xml, ou format propriétaire MC2)
- Parser le fichier et pré-remplir le formulaire automatiquement
- Validation des données
- Afficher aperçu avant enregistrement
- Stocker le fichier original (blob ou chemin fichier)
- Créer la sonde dans `t_sonde` avec toutes les infos

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/settings/sensors/import/page.tsx`
- Nouveau: `src/components/calibration-file-uploader.tsx`
- Nouveau: `src/lib/calibration-parser.ts`
- Nouveau: `src/app/api/sensors/import/route.ts`

**Base de données**:
```sql
ALTER TABLE t_sonde ADD COLUMN FichierCalibrageOriginal BLOB NULL;
ALTER TABLE t_sonde ADD COLUMN CertificatCalibrage VARCHAR(100) NULL;
```

**Estimation**: 2 jours

---

### 14. Gestion du matériel (sonde, module, logger) 📦
**Statut**: ❌ Non implémenté

**Description**:
Interface complète pour gérer le cycle de vie du matériel:
- **Ajout**: Enregistrer nouveau matériel (numéro série, modèle, date achat, etc.)
- **Modification**: Mettre à jour les informations (réaffectation, calibrage, etc.)
- **Réforme**: Marquer comme hors service / retiré

**Implémentation technique**:
- Page "Paramètres > Matériel" avec 3 onglets:
  1. **Sondes** (liste + CRUD)
  2. **Modules** (liste + CRUD)
  3. **Loggers** (liste + CRUD)
- Pour chaque type de matériel:
  - Tableau avec colonnes:
    * Numéro série
    * Modèle
    * État (Actif / En maintenance / Réformé)
    * Date acquisition
    * Dernier calibrage (sondes)
    * Dernière communication (modules)
    * Actions (Modifier / Réformer / Historique)
  - Formulaire d'ajout/modification
  - Modal de confirmation pour réforme
  - Historique complet (affectations, calibrages, pannes)
- Champs communs:
  ```sql
  -- Pour t_sonde
  ALTER TABLE t_sonde ADD COLUMN
    Etat ENUM('ACTIF', 'EN_MAINTENANCE', 'REFORME') DEFAULT 'ACTIF',
    DateAcquisition DATE,
    DateMiseEnService DATE,
    DateReforme DATE NULL,
    MotifReforme TEXT NULL,
    NumeroFacture VARCHAR(50);
  
  -- Pour t_module
  CREATE TABLE t_module (
    IdModule INT AUTO_INCREMENT PRIMARY KEY,
    NumeroSerie VARCHAR(50) UNIQUE,
    Modele VARCHAR(50),
    Etat ENUM('ACTIF', 'EN_MAINTENANCE', 'REFORME') DEFAULT 'ACTIF',
    DateAcquisition DATE,
    DateMiseEnService DATE,
    DateReforme DATE NULL,
    MotifReforme TEXT NULL,
    FirmwareVersion VARCHAR(20),
    AdresseIP VARCHAR(45),
    AdresseMAC VARCHAR(17)
  );
  ```
- Historique:
  ```sql
  CREATE TABLE t_materiel_historique (
    IdHistorique INT AUTO_INCREMENT PRIMARY KEY,
    TypeMateriel ENUM('SONDE', 'MODULE', 'LOGGER'),
    IdMateriel INT,
    DateAction DATETIME,
    Action VARCHAR(100),
    DetailsAvant JSON,
    DetailsApres JSON,
    IdUtilisateur INT
  );
  ```

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/settings/equipment/page.tsx`
- Nouveau: `src/components/equipment-table.tsx`
- Nouveau: `src/components/equipment-form-dialog.tsx`
- Nouveau: `src/components/equipment-history-modal.tsx`
- Nouveau: `src/app/api/equipment/[type]/route.ts` (GET, POST, PATCH, DELETE)

**Estimation**: 3-4 jours

---

## 🌐 GÉNÉRAL

### 15. Login / Création de compte + Gestion des accès 🔐
**Statut**: ⚠️ Partiellement implémenté

**Description**:
Système complet d'authentification et gestion des utilisateurs avec rôles et permissions.

**Fonctionnalités à implémenter**:
1. **Page de login** ✅ (déjà faite)
2. **Création de compte** ❌:
   - Formulaire d'inscription avec validation
   - Email de confirmation
   - Validation par admin avant activation (optionnel)
3. **Gestion des utilisateurs** ❌:
   - Page admin "Utilisateurs"
   - Liste avec filtres (actif/inactif, rôle)
   - CRUD complet
   - Activation/désactivation
4. **Système de rôles** ❌:
   - Rôles: Super Admin, Admin, Utilisateur, Invité
   - Permissions granulaires par fonctionnalité
   - Table `t_role` et `t_permission`
5. **Profil utilisateur** ❌:
   - Page "Mon profil"
   - Modification infos personnelles
   - Changement mot de passe (voir point 20)
   - Préférences (langue, notifications, etc.)

**Implémentation technique**:
- Utiliser NextAuth.js ou Clerk pour l'authentification
- Tables base de données:
  ```sql
  CREATE TABLE t_role (
    IdRole INT AUTO_INCREMENT PRIMARY KEY,
    Nom VARCHAR(50) UNIQUE,
    Description TEXT
  );
  
  CREATE TABLE t_permission (
    IdPermission INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(100) UNIQUE,
    Description TEXT,
    Module VARCHAR(50)
  );
  
  CREATE TABLE t_role_permission (
    IdRole INT,
    IdPermission INT,
    PRIMARY KEY (IdRole, IdPermission)
  );
  
  ALTER TABLE t_utilisateur ADD COLUMN IdRole INT;
  ALTER TABLE t_utilisateur ADD COLUMN EmailConfirme BOOLEAN DEFAULT FALSE;
  ALTER TABLE t_utilisateur ADD COLUMN TokenConfirmation VARCHAR(255);
  ```
- Middleware pour vérifier les permissions sur chaque route
- Composant `<ProtectedRoute requiredPermission="ALARMES_MODIFY">`

**Fichiers concernés**:
- Nouveau: `src/app/api/auth/[...nextauth]/route.ts`
- Nouveau: `src/app/register/page.tsx`
- Nouveau: `src/app/(dashboard)/users/page.tsx`
- Nouveau: `src/app/(dashboard)/profile/page.tsx`
- Nouveau: `src/middleware.ts` (vérification permissions)
- Nouveau: `src/lib/permissions.ts`
- Nouveau: `src/components/protected-route.tsx`

**Estimation**: 4-5 jours

---

### 16. Audit Trail complet 📝
**Statut**: ❌ Non implémenté

**Description**:
Tracer toutes les actions importantes effectuées dans le système pour assurer la traçabilité et la conformité.

**Actions à tracer**:
- Connexion/déconnexion utilisateur
- Création/modification/suppression d'entités (lieux, sondes, utilisateurs, etc.)
- Acquittement d'alarmes
- Désactivation/réactivation d'alarmes
- Changement de configuration
- Calibrage de sondes
- Export de données
- Modifications de paramètres système

**Implémentation technique**:
- Table `t_audit_trail` (voir point 2)
- Middleware automatique qui intercepte les requêtes API mutantes (POST, PUT, PATCH, DELETE)
- Pour chaque action:
  - Capturer: qui, quoi, quand, où (IP), avant/après (JSON)
  - Stocker de manière asynchrone (ne pas ralentir l'action)
- Page "Historique > Audit Trail":
  - Tableau filtrable par:
    * Date (plage)
    * Utilisateur
    * Type d'action
    * Entité concernée
  - Export CSV/PDF
  - Recherche full-text
- Rétention des données configurable (ex: 2 ans)
- Impossible de modifier ou supprimer les entrées (append-only)

**Fichiers concernés**:
- Nouveau: `src/middleware/audit-logger.ts`
- Nouveau: `src/app/(dashboard)/history/audit/page.tsx`
- Nouveau: `src/components/audit-trail-table.tsx`
- Nouveau: `src/app/api/audit/route.ts`
- Nouveau: `src/lib/audit-helper.ts`

**Exemple d'utilisation**:
```typescript
import { logAudit } from '@/lib/audit-helper';

// Dans une route API:
await logAudit({
  action: 'ALARM_ACKNOWLEDGED',
  entity: 't_alarme',
  entityId: alarmId,
  userId: session.user.id,
  ipAddress: req.ip,
  detailsBefore: { Acquite: false },
  detailsAfter: { Acquite: true, DateAcquittement: new Date() }
});
```

**Estimation**: 2-3 jours

---

### 17. Intégration TeamViewer (télémaintenance) 🖥️
**Statut**: ❌ Non implémenté

**Description**:
Intégrer un outil de télémaintenance (TeamViewer) pour permettre au support MC2 de se connecter à distance au poste client en cas de problème.

**Options d'intégration**:
1. **Lien simple**:
   - Bouton "Assistance à distance" qui ouvre TeamViewer QuickSupport
   - Génère un ID de session unique
   - Affiche l'ID à communiquer au support
2. **API TeamViewer**:
   - Utiliser l'API TeamViewer pour créer des sessions
   - Génération automatique de liens de connexion
   - Pas besoin d'installer TeamViewer (mode web)
3. **Alternative**: AnyDesk, RustDesk, ou autre solution

**Implémentation technique**:
- Page "Support > Télémaintenance"
- Bouton principal: "Démarrer une session d'assistance"
- Afficher:
  * ID de session TeamViewer
  * Lien de téléchargement TeamViewer QuickSupport
  * Instructions pour l'utilisateur
- Ou iframe TeamViewer Web Client (si disponible)
- Logger la session dans audit trail:
  * Début/fin de session
  * Utilisateur ayant autorisé
  * Durée

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/support/remote/page.tsx`
- Nouveau: `src/components/teamviewer-session.tsx`
- Configuration: Clé API TeamViewer dans env

**Estimation**: 1 jour

---

### 18. Gestion des utilisateurs simultanés (licences) 👥
**Statut**: ❌ Non implémenté

**Description**:
La licence définit le nombre d'utilisateurs pouvant être connectés simultanément (pas le nombre total d'utilisateurs créés).

**Règles**:
- **Licence Light**: 1 utilisateur simultané
- **Licence Standard**: 5 utilisateurs simultanés
- **Licence Expert**: illimité

**Implémentation technique**:
- Table pour tracker les sessions actives:
  ```sql
  CREATE TABLE t_session_active (
    IdSession VARCHAR(255) PRIMARY KEY,
    IdUtilisateur INT,
    DateDebut DATETIME,
    DerniereActivite DATETIME,
    AdresseIP VARCHAR(45),
    UserAgent TEXT,
    INDEX idx_user (IdUtilisateur)
  );
  ```
- À la connexion:
  1. Vérifier le nombre de sessions actives
  2. Si limite atteinte → refuser connexion avec message explicatif
  3. Sinon → créer session
- Heartbeat toutes les 30 secondes pour mettre à jour `DerniereActivite`
- Cleanup automatique des sessions inactives (>10 minutes sans heartbeat)
- Page admin "Sessions actives":
  * Liste des utilisateurs connectés
  * Possibilité de déconnecter forcément (admin only)
- Notification visuelle:
  * "X/Y utilisateurs connectés"
  * Alerte si proche de la limite

**Fichiers concernés**:
- Modifier: `src/app/api/auth/[...nextauth]/route.ts` (vérification limite)
- Nouveau: `src/app/api/sessions/heartbeat/route.ts`
- Nouveau: `src/app/api/sessions/active/route.ts`
- Nouveau: `src/app/(dashboard)/users/sessions/page.tsx`
- Nouveau: `src/hooks/useSessionHeartbeat.ts`
- Modifier: `src/app/(dashboard)/layout.tsx` (intégrer heartbeat)

**Estimation**: 2 jours

---

### 19. Système d'avertissement alarmes (en arrière-plan) 🔔
**Statut**: ❌ Non implémenté

**Description**:
Avertir l'utilisateur en cas d'alarme même si la fenêtre du navigateur est fermée ou minimisée. Utiliser l'agent Windows.

**Solutions possibles**:
1. **Notifications Windows** (via l'agent):
   - L'agent détecte les nouvelles alarmes
   - Envoie notification Windows native
   - Clic sur notification → ouvre le navigateur sur la page alarmes
2. **Desktop App** (Electron):
   - Application desktop légère qui tourne en arrière-plan
   - Icône dans la barre des tâches
   - Notifications + badge avec nombre d'alarmes
3. **Service Worker** (PWA):
   - Notifications navigateur même si onglet fermé
   - Nécessite que le navigateur reste ouvert en arrière-plan

**Implémentation recommandée**: Option 1 (Agent Windows)

**Modifications agent C#**:
```csharp
// Dans Vigitemp Agent/Program.cs
void CheckAndNotifyAlarms()
{
    // Récupérer nouvelles alarmes depuis API
    var alarms = GetActiveAlarms();
    
    if (alarms.Any())
    {
        // Afficher notification Windows
        ShowWindowsNotification(
            title: $"{alarms.Count} alarme(s) active(s)",
            message: $"Nouvelle alarme: {alarms.First().Location}",
            icon: "alarm-icon.ico"
        );
        
        // Jouer son (optionnel)
        PlayAlarmSound();
    }
}

void ShowWindowsNotification(string title, string message, string icon)
{
    var notification = new ToastNotification(...);
    ToastNotificationManager.CreateToastNotifier().Show(notification);
}
```

**Fichiers concernés**:
- Modifier: `Vigitemp Agent/Vigitemp Agent/Program.cs`
- Ajouter: Package NuGet `Microsoft.Toolkit.Uwp.Notifications`
- Configuration: Intervalle de vérification (ex: toutes les 30 secondes)
- Préférences utilisateur: Activer/désactiver notifications, choix du son

**Estimation**: 2 jours

---

### 20. Changement de mot de passe utilisateur + Sécurité 🔒
**Statut**: ❌ Non implémenté

**Description**:
Permettre à l'utilisateur de changer son mot de passe avec politique de sécurité stricte.

**Fonctionnalités**:
1. **Changement de mot de passe**:
   - Page "Mon profil > Sécurité"
   - Formulaire: Ancien MDP + Nouveau MDP + Confirmation
   - Validation en temps réel de la force du mot de passe
2. **Politique de mot de passe**:
   - Longueur minimale: 12 caractères (configurable)
   - Au moins: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
   - Pas de mots du dictionnaire courants
   - Pas de parties du nom d'utilisateur
3. **Historique des mots de passe**:
   - Empêcher réutilisation des N derniers mots de passe (configurable, ex: 5)
   - Stocker hash des mots de passe précédents
4. **Double authentification (2FA)** ⚠️:
   - Optionnelle mais recommandée
   - Méthodes:
     * Email (code à 6 chiffres envoyé par mail)
     * Authenticator app (TOTP: Google Authenticator, Microsoft Authenticator)
     * SMS (optionnel, coût)
   - Configuration dans "Mon profil > Sécurité > Activer 2FA"
5. **Expiration mot de passe**:
   - Configurable dans paramètres système
   - Ex: forcer changement tous les 90 jours
   - Notification 7 jours avant expiration

**Implémentation technique**:
- Utiliser bcrypt ou argon2 pour hasher les mots de passe
- Table historique:
  ```sql
  CREATE TABLE t_utilisateur_mdp_historique (
    IdHistorique INT AUTO_INCREMENT PRIMARY KEY,
    IdUtilisateur INT,
    HashMotDePasse VARCHAR(255),
    DateChangement DATETIME,
    FOREIGN KEY (IdUtilisateur) REFERENCES t_utilisateur(IdUtilisateur)
  );
  
  ALTER TABLE t_utilisateur ADD COLUMN
    MotDePasseExpireLe DATE NULL,
    Require2FA BOOLEAN DEFAULT FALSE,
    Secret2FA VARCHAR(100) NULL;
  ```
- Validation mot de passe:
  ```typescript
  import zxcvbn from 'zxcvbn'; // Librairie force mot de passe
  
  function validatePassword(password: string, oldPasswords: string[]): ValidationResult {
    // Règles de base
    if (password.length < 12) return { valid: false, error: 'Trop court' };
    if (!/[A-Z]/.test(password)) return { valid: false, error: 'Manque majuscule' };
    // ...
    
    // Force du mot de passe
    const strength = zxcvbn(password);
    if (strength.score < 3) return { valid: false, error: 'Mot de passe trop faible' };
    
    // Vérifier historique
    for (const oldHash of oldPasswords) {
      if (await bcrypt.compare(password, oldHash)) {
        return { valid: false, error: 'Mot de passe déjà utilisé' };
      }
    }
    
    return { valid: true };
  }
  ```
- 2FA avec TOTP:
  ```typescript
  import speakeasy from 'speakeasy';
  import QRCode from 'qrcode';
  
  // Générer secret
  const secret = speakeasy.generateSecret({ name: 'Vigitemp' });
  
  // Générer QR code pour scan dans authenticator
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  // Vérifier code
  const verified = speakeasy.totp.verify({
    secret: user.Secret2FA,
    encoding: 'base32',
    token: userInputCode
  });
  ```

**Fichiers concernés**:
- Nouveau: `src/app/(dashboard)/profile/security/page.tsx`
- Nouveau: `src/components/password-strength-meter.tsx`
- Nouveau: `src/components/setup-2fa-dialog.tsx`
- Nouveau: `src/app/api/user/change-password/route.ts`
- Nouveau: `src/app/api/user/setup-2fa/route.ts`
- Nouveau: `src/app/api/auth/verify-2fa/route.ts`
- Nouveau: `src/lib/password-policy.ts`
- Modifier: `src/app/login/login-form.tsx` (ajouter champ 2FA si activé)

**Estimation**: 3-4 jours

---

## 📊 Résumé par complexité

### 🟢 Facile (1 jour)
- Verrouillage d'écran temporisable
- Filtre site/groupe amélioré
- Formulaire contact MC2
- Intégration TeamViewer

### 🟡 Moyen (2-3 jours)
- Désactivation temporaire alarmes
- Multi-groupes pour lieux
- Commentaires alarme sur courbes
- Calibrage 2 points
- Gestion des licences
- Ajout sonde par fichier
- Audit Trail
- Gestion utilisateurs simultanés
- Notifications alarmes (agent)
- Gestion actionneurs

### 🔴 Complexe (3-5 jours)
- Chaîne transmission complète
- Gestion complète du matériel
- Authentification + rôles complets
- Changement MDP + 2FA
- Outils de dépannage

---

## 📅 Estimation totale

| Domaine | Nombre de tâches | Estimation (jours) |
|---------|------------------|-------------------|
| Surveillance | 5 | 8-11 |
| Métrologie | 2 | 3-4 |
| Exploitation | 2 | 4-7 |
| Paramétrage | 5 | 11-16 |
| Général | 6 | 14-19 |
| **TOTAL** | **20** | **40-57 jours** |

**Estimation réaliste pour 1 développeur**: **2-3 mois**

---

## 🎯 Ordre de priorité recommandé

### Phase 1 - Fondations (2-3 semaines)
1. Authentification complète + rôles
2. Audit Trail
3. Gestion utilisateurs simultanés
4. Changement mot de passe + 2FA

### Phase 2 - Surveillance (2 semaines)
5. Désactivation temporaire alarmes
6. Verrouillage écran
7. Commentaires alarmes sur courbes
8. Notifications alarmes (agent)

### Phase 3 - Paramétrage (2-3 semaines)
9. Gestion du matériel
10. Calibrage sondes (2 points)
11. Ajout sonde par fichier
12. Gestion licences

### Phase 4 - Exploitation (1 semaine)
13. Formulaire contact MC2
14. Chaîne transmission
15. Filtre site/groupe amélioré

### Phase 5 - Avancé (1-2 semaines)
16. Multi-groupes lieux
17. Actionneurs
18. Outils dépannage
19. TeamViewer
20. Étalonnage 1 point

---

## ℹ️ Points nécessitant des clarifications

### Priorité haute (bloquer développement)
1. **Actionneurs**: Qu'est-ce qu'un actionneur ? Comment fonctionne-t-il ?
2. **Étalonnage 1 point**: Quelle méthode utiliser ? (attente PPE)
3. **Outils de dépannage**: Liste précise des outils demandés par hotline

### Priorité moyenne (affiner avant implémentation)
4. **Format fichier calibrage**: Quel est le format exact des fichiers MC2 ?
5. **Configuration email**: Adresses email pour chaque catégorie de support
6. **Politique mots de passe**: Règles exactes souhaitées (longueur, complexité, expiration)
7. **Gestion licences**: Process exact d'activation/upgrade (clé, validation serveur, etc.)

---

## 📝 Notes

- Ce plan est basé sur les spécifications fournies
- Les estimations sont pour un développeur fullstack expérimenté
- Certaines fonctionnalités nécessitent des clarifications avant implémentation
- Les dépendances entre tâches doivent être gérées (ex: audit trail avant autres fonctionnalités)
- Prévoir temps pour tests, debug, et ajustements (~20% du temps total)
