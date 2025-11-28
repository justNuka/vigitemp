# Schéma Base de Données Vigitemp

## Vue d'ensemble

La base de données Vigitemp est organisée en **deux schémas principaux** :

1. **`vigitemp`** : Configuration, utilisateurs, capteurs, alertes
2. **`vigitemp_mesure`** : Données de mesures time-series (800+ MB)

**Moteur** : MySQL 8.0+ / InnoDB  
**Encodage** : UTF-8 (latin1 pour tables legacy, utf8mb4 pour nouvelles tables)

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIGITEMP (Configuration)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Utilisateurs │  │   Capteurs   │  │   Lieux de   │         │
│  │    & Droits   │  │  & Étalons   │  │ Surveillance │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Alarmes   │  │   Modules    │  │  Métrologie  │         │
│  │  & Planning  │  │   & Plans    │  │ & Calibrage  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              VIGITEMP_MESURE (Données Time-Series)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  ts_mesure   │  │ ts_graphique │  │  ts_journal  │         │
│  │ (4.6M rows)  │  │  (1M rows)   │  │  (2.2M rows) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tables par Catégorie

### 1️⃣ **Utilisateurs & Authentification**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_utilisateur** | Comptes utilisateurs, profils, connexions | `IdUtilisateur` (PK), `Login` (UNIQUE), `ProfilUtilisateur` (FK) |
| **t_profil** | Profils (Admin, Utilisateur, Invité...) | `IdProfil` (PK), `ProfilUtilisateur` (UNIQUE) |
| **t_autorisation** | Permissions granulaires par fenêtre | `IdAutorisation` (PK), `CodeAutorisation` |
| **t_liaison_profil_autorisation** | Matrice Profils ↔ Autorisations | `IdProfil` + `IdAutorisation` (PK composite) |
| **t_groupe** | Regroupements (services, départements...) | `IdGroupe` (PK), `NumeroRegroupement` (1 ou 2) |
| **t_liaison_utilisateur_groupe** | Matrice Utilisateurs ↔ Groupes | `IdUtilisateur` (FK), `IdGroupe` (FK) |
| **t_ancienmotpasse** | Historique mots de passe (politique sécurité) | `IdUtilisateur` (FK) |
| **t_postes_clients** | Machines connectées, IP, audit | `IdPoste` (PK), `NomMachineConnexion` (UNIQUE) |

#### 🔑 **Relations clés** :
```sql
t_utilisateur.ProfilUtilisateur → t_profil.ProfilUtilisateur
t_profil.IdProfil ← t_liaison_profil_autorisation → t_autorisation.IdAutorisation
t_utilisateur.IdUtilisateur ← t_liaison_utilisateur_groupe → t_groupe.IdGroupe
```

---

### 2️⃣ **Capteurs & Sondes**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_sonde** | Sondes de mesure (température, humidité...) | `SondeNumeroSerie` (PK/UNIQUE), `IdModule` (FK), `Etat_Sonde` |
| **t_sonde_type** | Types de sondes (IN, IE, IP, IC, IH, EN, HN) | `SondeType` (PK) |
| **t_sonde_typemesure** | Types de mesures (temp, humidité, tension...) | `SondeTypeMesure` (PK), `UniteMesure` |
| **t_sonde_etat** | États sonde (Actif, Inactif, Défaut...) | `Etat_Sonde` (PK) |
| **t_liaison_sonde_type_mesure** | Matrice Type Sonde ↔ Type Mesure | `SondeType`, `SondeTypeMesure` |
| **t_etalon** | Sondes étalons (référence métrologique) | `EtalonNumeroSerie` (PK/UNIQUE), `Port_serie`, `IDmodule` |
| **t_etalontype** | Types d'étalons (PT100, PRT, LogTag...) | `TypeEtalon` (PK) |

#### 📊 **Caractéristiques** :
- **Adressage** : Série (ex: `IH054321`) + Port COM + Module
- **États** : `A` (Actif), `I` (Inactif), `D` (Défaut), `T` (Test)
- **Relais** : 1-6 relais configurables pour actions automatiques
- **Fréquences** : Mesure (60s, 300s...) et récupération (temps USB LogTag)

---

### 3️⃣ **Lieux de Surveillance**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_lieu** | Points de mesure (frigos, chambres froides...) | `IdLieu` (PK), `SondeNumeroSerie` (FK), `IdGroupe1/2` |
| **t_lieu_planning** | Planning hebdomadaire (7 jours × 2 périodes) | `IdLieu` (FK), `IdJour` (1-7), `HeureDebutPeriode1/2` |
| **t_lieu_tel_num** | Destinataires alertes (tél + email) | `IdLieu` (FK), `IdUtilisateur` (FK), `NumeroOrdre` |
| **t_planningalarme** | Activation alarmes par jour (8 bits = lun-dim) | `IdLieu` (FK), `CodeActivation` (ex: `11111110` = pas d'alarme dim) |
| **t_planningconsigne** | Consignes variables (jour/nuit, semaine) | `IdLieu` (FK), `ValeurConsigneJour1` à `Jour7b` |
| **t_planningheurebascule** | Heures de bascule consignes (7 jours) | `IdLieu` (FK), `HeureJour1` à `HeureJour7` |

#### 🎯 **Attributs critiques** :
```sql
-- Consignes & Alarmes
Consigne: 4.0              -- Température cible
Consigne_Sup: 8.0          -- Seuil haut (alarme si dépassé)
Consigne_Inf: 2.0          -- Seuil bas
Consigne_Sup_PreAlarme: 7.0 -- Pré-alarme (warning)
Retard_alarme_haut: 300    -- Délai avant alarme (secondes)
Correction_Ej: 1           -- Correction erreur de justesse (métrologie)

-- États
Lieu_Etat: 'S'             -- S (Surveillance), P (Pause), A (Arrêt), C (Calibrage)
bLieuEnAlarme: 1           -- Lieu actuellement en alarme
bLieuAlarmeTermineeNonAcquitee: 1 -- Alarme passée non acquittée

-- Métrologie
EMT: 0.5                   -- Erreur Maximale Tolérée
EMTChoixMode: 1            -- 1 (Incertitude élargie), 2 (Autre)
```

#### 🔗 **Relations** :
```sql
t_lieu.IdGroupe1 → t_groupe.IdGroupe (Regroupement 1)
t_lieu.IdGroupe2 → t_groupe.IdGroupe (Regroupement 2)
t_lieu.SondeNumeroSerie → t_sonde.SondeNumeroSerie
t_lieu.IdPlan → t_plan.IdPlan (Cartographie)
t_lieu.IdActionneur → t_actionneur.IdActionneur (Relais automatique)
```

---

### 4️⃣ **Modules & Communication**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_module** | Modules série/IP (MC2, LogTag, Ethernet...) | `IdModule` (PK), `ModuleNumeroSerie`, `Port_serie`, `AdresseIP` |
| **t_module_type** | Types modules (USB, RS485, Ethernet, LogTag) | `Type_module` (PK) |
| **t_actionneur** | Actionneurs (relais, alarmes sonores...) | `IdActionneur` (PK), `IdModule` (FK), `Port_serie` |
| **t_actionneurtype** | Types actionneurs (Relais 4ch, Sirène...) | `Type` (PK), `GereRelais` |

#### 📡 **Communication** :
- **Port série** : COM1-COM255 (RS232/RS485)
- **Adresse IP** : Pour modules Ethernet (ex: `192.168.1.50`)
- **Délai réseau** : Timeout requêtes (ms)

---

### 5️⃣ **Alarmes & Notifications**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_alarme** | Alarmes actives (température, panne sonde...) | `IdAlarme` (PK), `IdLieu` (FK), `Type`, `Alarme_Vrai`, `Acquite` |
| **t_alarme_archive** | Historique alarmes (> 6 mois archivées) | Même structure que `t_alarme` |
| **t_alarme_message** | Messages vocaux VigiTel (fichiers WAV) | `CodeAlarmeMessage`, `Type`, `TexteMessage` |
| **t_logalarme** | Log alarmes VigiLog (transport) | `IdReception` (FK), `DateDebut`, `DateFin` |

#### ⚠️ **Types d'alarmes** :
```sql
'H' : Température haute (> Consigne_Sup)
'B' : Température basse (< Consigne_Inf)
'P' : Pré-alarme (entre consigne et pré-alarme)
'S' : Panne sonde (pas de communication)
'C' : Panne capteur (valeur aberrante)
'N' : Non-réponse (RetardNonReponse dépassé)
```

#### 🔄 **Cycle de vie alarme** :
```sql
1. Création : Alarme_Vrai = 0, DateHeureDebut définie
2. Confirmation : Alarme_Vrai = 1 (après retard), DateHeureDebutAlarme_Vrai
3. Notification : MailEnvoye = 1, AlarmePourVigiTel = 1
4. Fin alarme : DateHeureFin définie (retour normal)
5. Acquittement : Acquite = 1, TelAcquite = 1
6. Archivage : Déplacée vers t_alarme_archive après 6 mois
```

---

### 6️⃣ **Mesures & Données Time-Series**

| Table | Description | Volume | Clés importantes |
|-------|-------------|--------|------------------|
| **ts_mesure** | Mesures actuelles (< 3 mois) | **4.6M rows** | `IdMesure` (PK), `IdLieu`, `DateHeureMesure`, `Valeur` |
| **ts_mesurehisto** | Mesures historiques (> 3 mois) | Très volumineux | Même structure que `ts_mesure` |
| **ts_graphique** | Cache graphiques (optimisation affichage) | **1M rows** | `IdGraphique`, `IdLieu`, `DateHeureMesure` |
| **ts_journal** | Journal événements (connexions, calibrages...) | **2.2M rows** | `IdJournal`, `CodeJournal`, `IdLieu` |
| **ts_journalhisto** | Historique journal (> 6 mois) | Volumineux | Même structure que `ts_journal` |

#### 📈 **Structure ts_mesure** :
```sql
IdServeurBDD: 1                      -- ID serveur (multi-serveurs)
IdMesure: 4628076                    -- Auto-increment global
DateHeureMesure: '2024-11-28 14:30:00'
Valeur: 5.2                          -- Température mesurée (°C)
Resistance: 1085.5                   -- Résistance sonde (Ω)
Nb_decimal: 1                        -- Précision affichage
Consigne: 4.0                        -- Copie consigne lieu (dénormalisation)
Consigne_Sup: 8.0
Consigne_Inf: 2.0
Unite: '°C'
SondeNumeroSerie: 'IH054321'
IdLieu: 42
ValeurNull: 0                        -- 1 si erreur lecture, 0 sinon
Frequence: 60                        -- Fréquence mesure (secondes)
Etat_Alarme: 0                       -- 0 (Normal), 1 (Alarme), 2 (Pré-alarme)
Moyenne: 5.1                         -- Moyenne mobile (si activée)
```

#### 🔍 **Index critiques** :
```sql
PRIMARY KEY (IdServeurBDD, IdMesure, DateHeureMesure, IdLieu, ValeurNull)
INDEX Mesure_Date_mesure_IDX (DateHeureMesure)  -- Requêtes temporelles
INDEX Mesure_Numero_lieu_IDX (IdLieu)           -- Filtrage par lieu
INDEX Mesure_Etat_Alarme_IDX (Etat_Alarme)      -- Alarmes actives
INDEX Mesure_date_lieu (DateHeureMesure, IdLieu) -- Composite (graphiques)
```

---

### 7️⃣ **Journal & Événements**

| Table | Description | Codes événements |
|-------|-------------|------------------|
| **ts_journal** | Traçabilité actions utilisateurs | Voir codes ci-dessous |
| **ts_journal_code** | Dictionnaire codes événements | `CodeJournal` (PK), `Commentaire` |

#### 📝 **Codes événements principaux** :
```sql
'CONNEXION'    : Connexion utilisateur
'DECONNEXION'  : Déconnexion
'DS'           : Démarrage Surveillance lieu
'AS'           : Arrêt Surveillance
'CA'           : Début Calibrage
'FC'           : Fin Calibrage
'ET'           : Étalonnage sonde
'MC'           : Modification Consignes
'MU'           : Modification Utilisateur
'AL'           : Alarme déclenchée
'AA'           : Alarme acquittée
'BACKUP'       : Sauvegarde BDD
```

#### 🔗 **Exemple requête** :
```sql
SELECT 
  DateHeureJournal,
  CodeJournal,
  NomUtilisateur,
  Commentaire
FROM ts_journal
WHERE IdLieu = 42
  AND CodeJournal IN ('DS', 'AS', 'MC')
  AND DateHeureJournal >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY DateHeureJournal DESC;
```

---

### 8️⃣ **Métrologie & Calibrage**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_calibrage** | Historique calibrages sondes (2 points) | `IdCalibrage` (PK), `SondeNumeroSerie` (FK), `IdBain` (FK) |
| **t_etalonnage** | Étalonnages complets (multi-points) | `IdEtalonnage` (PK), `SondeNumeroserie` (FK), `EtalonNumeroSerie` (FK) |
| **t_etalonnage_mesure** | Détail mesures étalonnage (10-15 points) | `IdEtalonnage` (FK), `MesureSonde`, `MesureEtalon` |
| **t_certif** | Certificats étalons (COFRAC, LNE...) | `IdCertif` (PK), `EtalonNumeroSerie` (FK), `IdPDF` (FK) |
| **t_certif_mesure** | Points certificat (températures, incertitudes) | `IdCertif` (FK), `TemperatureVraie`, `Incertitude` |
| **t_bain** | Bains thermostatés (équipements métrologie) | `IdBain` (PK), `Stablilite`, `Homogeneite` |
| **ts_mesurecalibrage** | Mesures temps réel calibrage | `IdMesureCalibrage`, `SondeNumeroSerie`, `DateHeure` |
| **ts_mesureetalonnage** | Mesures temps réel étalonnage | `IdMesureEtalonnage`, `SondeNumeroserie`, `NumeroOrdre` |

#### 🧪 **Processus calibrage (2 points)** :
```sql
-- 1. Immersion sonde + étalon dans bain (ex: 0°C)
-- 2. Acquisition 10-20 mesures → Moyenne → Resistance1, MesureEtalon1
-- 3. Changement bain (ex: 100°C)
-- 4. Acquisition 10-20 mesures → Resistance2, MesureEtalon2
-- 5. Calcul coefficients : y = ax + b
--    Coeff_X = (MesureEtalon2 - MesureEtalon1) / (Resistance2 - Resistance1)
--    Coeff_Constant = MesureEtalon1 - (Coeff_X * Resistance1)
-- 6. Enregistrement dans t_calibrage + Application aux mesures futures
```

#### 🎓 **Processus étalonnage (multi-points)** :
```sql
-- 1. Immersion dans bain stabilisé (-20°C, 0°C, 20°C, 40°C, 60°C...)
-- 2. Acquisition 10+ mesures par point
-- 3. Calcul Moyenne, Écart-type, Répétabilité
-- 4. Erreur de justesse = |Moyenne_Sonde - Moyenne_Etalon|
-- 5. Incertitude élargie (k=2) : U = 2 * √(u_etalon² + u_répétabilité²)
-- 6. Génération PDF certificat (t_pdf) + Enregistrement
```

---

### 9️⃣ **VigiLog (Traçabilité Transport)**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_logreception** | Réceptions transport (LogTag USB) | `IdLogReception` (PK), `NumserieVigiLog`, `IdTournee` |
| **t_logtournee** | Tournées définies (circuits logistiques) | `IdLogTournee` (PK), `IdSiteDepart`, `IdSiteArrivee` |
| **t_logetape** | Étapes tournée (multi-sites) | `IdLogTournee` (FK), `IdSite` (FK), `Ordre` |
| **t_logsonde** | Configuration sondes LogTag | `NumSerie` (PK), `Consigne`, `Frequence` |
| **t_logcoursier** | Coursiers/livreurs | `IdCoursier` (PK), `Code`, `Nom` |
| **t_logenvoi** | Envois/départs matériel | `IdLogReception` (FK), `IdSite` (FK) |
| **ts_logmesures** | Mesures LogTag importées | `IdReception` (FK), `DateHeureMesure`, `Valeur` |

#### 🚚 **Workflow transport** :
```sql
1. Départ : Création t_logenvoi (site départ, coursier, LogTag)
2. Transport : LogTag enregistre mesures (fréquence 1-5 min)
3. Arrivée : Branchement USB LogTag → Import mesures dans ts_logmesures
4. Analyse : 
   - DepassementTemperature (> Consigne + Tolérance)
   - DepassementTemps (> Temps tournée planifié)
   - Calcul TemperatureMoyenne, Min, Max
5. Validation : bEnAttente → bTermine
6. Alerte si dépassements : Notification responsable qualité
```

---

### 🔟 **Paramètres & Configuration**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_parametre** | Paramètres applicatifs (INI-like) | `Section` + `MotCle` (PK composite), `Valeur` |
| **ts_parametre** | Paramètres time-series (spécifiques mesures) | `CleParametre` (PK), `ValeurParametre` |
| **ts_compteur_idtable** | Compteurs auto-increment par table | `IdServeurBDD` + `NomTable` (PK), `CompteurID` |
| **ts_modedegrade** | Requêtes mode dégradé (SQL en attente) | `IdModeDegrade`, `RequeteSQL`, `RequeteArchivee` |
| **liste_clients** | Clients/installations (multi-tenant) | `IDClient` (PK), `Num_Compte` |

#### ⚙️ **Exemples paramètres** :
```sql
-- Système
Section: 'General', MotCle: 'Version', Valeur: '3.2.1'
Section: 'General', MotCle: 'DateDernierBackup', Valeur: '2024-11-28'

-- Alarmes
Section: 'Alarme', MotCle: 'DelaiEnvoiMail', Valeur: '60' (secondes)
Section: 'Alarme', MotCle: 'NbRappelsMax', Valeur: '3'

-- Mesures
Section: 'Mesure', MotCle: 'DureeArchivage', Valeur: '90' (jours avant historique)
Section: 'Mesure', MotCle: 'FrequenceGraphique', Valeur: '5' (minutes)
```

---

### 1️⃣1️⃣ **Plans & Cartographie**

| Table | Description | Clés importantes |
|-------|-------------|------------------|
| **t_plan** | Plans/schémas (images BLOB) | `IdPlan` (PK), `Titre` (UNIQUE), `Image` |
| **t_pdf** | Documents PDF (certifs, rapports...) | `IdPDF` (PK), `NomPDF`, `ContenuPDF` |
| **t_commentaire** | Commentaires types (listes déroulantes) | `IdCommentaire`, `TypeCommentaire`, `Texte` |
| **t_site** | Sites géographiques (bâtiments, agences...) | `IdSite` (PK), `CodeSite` (UNIQUE), `LibelleSite` |

#### 🗺️ **Cartographie** :
```sql
-- Positionnement sur plan
t_lieu.IdPlan → t_plan.IdPlan
t_lieu.Position_Plan_X : 1024 (pixels)
t_lieu.Position_Plan_Y : 768

-- Positionnement modules/actionneurs
t_module.IdPlan, Position_Plan_X, Position_Plan_Y
t_actionneur.IdPlan, Position_Plan_X, Position_Plan_Y
```

---

## 🔗 Relations Inter-Tables Principales

### Diagramme simplifié :

```
t_utilisateur ──[ProfilUtilisateur]──► t_profil ──[liaison]──► t_autorisation
      │
      └──[liaison]──► t_groupe
      
t_sonde ──[IdModule]──► t_module ──[Type_module]──► t_module_type
   │
   └──[SondeNumeroSerie]──► t_lieu ──[IdGroupe1/2]──► t_groupe
                                │
                                ├──[IdPlan]──► t_plan
                                ├──[IdActionneur]──► t_actionneur
                                └──[IdLieu]──► t_alarme
                                
t_lieu ──[IdLieu]──► ts_mesure ──[DateHeureMesure]──► ts_graphique

t_calibrage ──[SondeNumeroSerie]──► t_sonde
            └──[IdBain]──► t_bain
            
t_etalonnage ──[SondeNumeroserie]──► t_sonde
             ├──[EtalonNumeroSerie]──► t_etalon
             ├──[IdBain]──► t_bain
             └──[IdPDF]──► t_pdf
```

---

## 📊 Statistiques & Volumétrie

### Tables volumineuses (> 1M rows) :

| Table | Rows approximatifs | Taille disque | Croissance |
|-------|-------------------|---------------|------------|
| **ts_mesure** | ~4.6M | ~800 MB | +150k/jour (100 lieux × 1440 mesures/jour) |
| **ts_mesurehisto** | ~50M+ | ~8 GB | Archivage mensuel depuis ts_mesure |
| **ts_journal** | ~2.2M | ~200 MB | +5k/jour (connexions, actions) |
| **ts_graphique** | ~1M | ~100 MB | Cache régénéré toutes les 5 min |
| **t_alarme** | ~2.7M | ~250 MB | +200/jour (alarmes actives + archivées) |
| **t_alarme_archive** | ~2k | ~500 KB | Archivage automatique > 6 mois |

### Maintenance recommandée :

```sql
-- 1. Archivage mesures (tous les mois)
INSERT INTO ts_mesurehisto 
SELECT * FROM ts_mesure 
WHERE DateHeureMesure < DATE_SUB(NOW(), INTERVAL 3 MONTH);

DELETE FROM ts_mesure 
WHERE DateHeureMesure < DATE_SUB(NOW(), INTERVAL 3 MONTH);

-- 2. Archivage alarmes (tous les 6 mois)
INSERT INTO t_alarme_archive 
SELECT * FROM t_alarme 
WHERE DateHeureDebut < DATE_SUB(NOW(), INTERVAL 6 MONTH) 
  AND Acquite = 1;

DELETE FROM t_alarme 
WHERE IdAlarme IN (SELECT IdAlarme FROM t_alarme_archive);

-- 3. Optimisation tables fragmentées
OPTIMIZE TABLE ts_mesure, ts_graphique, t_alarme;

-- 4. Analyse index (tous les mois)
ANALYZE TABLE ts_mesure, ts_journal, t_alarme;
```

---

## 🔐 Contraintes d'Intégrité Référentielle

### Cascades importantes :

```sql
-- Suppression lieu → Suppression alarmes
ALTER TABLE t_alarme 
ADD CONSTRAINT FK_LIEU_ALARME 
FOREIGN KEY (IdLieu) REFERENCES t_lieu(IdLieu) 
ON DELETE CASCADE;

-- Suppression module → Mise à NULL sondes (conservation historique)
ALTER TABLE t_sonde 
ADD CONSTRAINT FK_MODULE_SONDE 
FOREIGN KEY (IdModule) REFERENCES t_module(IdModule) 
ON DELETE SET NULL;

-- Suppression profil → Impossible si utilisateurs liés
ALTER TABLE t_utilisateur 
ADD CONSTRAINT FK_PROFIL_UTILISATEUR 
FOREIGN KEY (ProfilUtilisateur) REFERENCES t_profil(ProfilUtilisateur) 
ON DELETE RESTRICT;
```

---

## 📈 Requêtes Typiques Optimisées

### 1. Dernières mesures d'un lieu (24h) :

```sql
SELECT 
  DateHeureMesure,
  Valeur,
  Unite,
  Etat_Alarme,
  Consigne_Sup,
  Consigne_Inf
FROM ts_mesure
WHERE IdLieu = 42
  AND ValeurNull = 0
  AND DateHeureMesure >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY DateHeureMesure DESC;

-- Index utilisé : Mesure_date_lieu (DateHeureMesure, IdLieu)
```

### 2. Alarmes actives non acquittées :

```sql
SELECT 
  a.IdAlarme,
  a.DateHeureDebut,
  a.Type,
  a.Valeur,
  l.Nom_Lieu,
  l.Consigne_Sup,
  l.Consigne_Inf,
  TIMESTAMPDIFF(MINUTE, a.DateHeureDebut, NOW()) AS DureeMinutes
FROM t_alarme a
INNER JOIN t_lieu l ON a.IdLieu = l.IdLieu
WHERE a.Acquite = 0
  AND a.Alarme_Vrai = 1
  AND a.DateHeureFin IS NULL
ORDER BY a.DateHeureDebut ASC;

-- Index utilisés : Alarme_Acquite_IDX, Alarme_Alarme_Vrai_IDX
```

### 3. Graphique temps réel (cache) :

```sql
SELECT 
  DATE_FORMAT(DateHeureMesure, '%Y-%m-%d %H:%i:00') AS DateTrunc,
  AVG(Valeur) AS ValeurMoyenne,
  MAX(Consigne_Sup) AS SeuilHaut,
  MIN(Consigne_Inf) AS SeuilBas
FROM ts_graphique
WHERE IdLieu = 42
  AND DateHeureMesure >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND ValeurNull = 0
GROUP BY DateTrunc
ORDER BY DateTrunc ASC;

-- Index utilisé : WDIDX_ts_graphique_IdLieu + DateHeureMesure
```

### 4. Traçabilité utilisateur (7 derniers jours) :

```sql
SELECT 
  j.DateHeureJournal,
  j.CodeJournal,
  jc.Commentaire AS TypeAction,
  j.NomUtilisateur,
  l.Nom_Lieu,
  j.CommentaireUtilisateur
FROM ts_journal j
LEFT JOIN ts_journal_code jc ON j.CodeJournal = jc.CodeJournal
LEFT JOIN t_lieu l ON j.IdLieu = l.IdLieu
WHERE j.NomUtilisateur = 'DUPONT Jean'
  AND j.DateHeureJournal >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY j.DateHeureJournal DESC
LIMIT 100;

-- Index utilisé : Journal_Nomutilisateur_IDX + Journal_DateHeure_IDX
```

### 5. Sondes à étalonner (validité < 1 mois) :

```sql
SELECT 
  s.SondeNumeroSerie,
  l.Nom_Lieu,
  e.DateHeureEtalonnage AS DernierEtalonnage,
  e.Date_Validite,
  DATEDIFF(e.Date_Validite, NOW()) AS JoursRestants,
  e.ErrJustesse
FROM t_sonde s
INNER JOIN t_lieu l ON s.SondeNumeroSerie = l.SondeNumeroSerie
LEFT JOIN (
  SELECT 
    SondeNumeroserie,
    MAX(IdEtalonnage) AS IdDernierEtalonnage
  FROM t_etalonnage
  GROUP BY SondeNumeroserie
) der ON s.SondeNumeroSerie = der.SondeNumeroserie
LEFT JOIN t_etalonnage e ON der.IdDernierEtalonnage = e.IdEtalonnage
WHERE e.Date_Validite <= DATE_ADD(NOW(), INTERVAL 30 DAY)
  OR e.Date_Validite IS NULL
  AND l.Archive = 0
ORDER BY e.Date_Validite ASC;
```

---

## 🛠️ Scripts Utilitaires

### Création base de données :

```sql
CREATE DATABASE vigitemp 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

CREATE DATABASE vigitemp_mesure 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Créer utilisateur applicatif
CREATE USER 'vigitemp_app'@'localhost' IDENTIFIED BY 'PASSWORD_SECURE';
GRANT SELECT, INSERT, UPDATE, DELETE ON vigitemp.* TO 'vigitemp_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON vigitemp_mesure.* TO 'vigitemp_app'@'localhost';
FLUSH PRIVILEGES;
```

### Sauvegarde automatique :

```bash
#!/bin/bash
# Backup quotidien (structure + configuration uniquement)
mysqldump --single-transaction --no-data vigitemp > /backup/vigitemp_structure_$(date +%Y%m%d).sql
mysqldump --single-transaction --ignore-table=vigitemp_mesure.ts_mesure vigitemp_mesure > /backup/vigitemp_config_$(date +%Y%m%d).sql

# Backup mesures (hebdomadaire, dernières 7 jours uniquement)
mysqldump --single-transaction vigitemp_mesure ts_mesure \
  --where="DateHeureMesure >= DATE_SUB(NOW(), INTERVAL 7 DAY)" \
  > /backup/vigitemp_mesures_7j_$(date +%Y%m%d).sql
```

---

## 📝 Notes Importantes

### 🔴 **Points d'attention** :

1. **Volumétrie** : `ts_mesure` croît de ~150k rows/jour → Archivage mensuel obligatoire
2. **Index fragmentés** : `OPTIMIZE TABLE` mensuel sur tables volumineuses
3. **Encodage** : Migration progressive `latin1` → `utf8mb4` en cours
4. **Clés composites** : PK complexes (IdServeurBDD + IdMesure + Date...) pour multi-serveurs
5. **BLOB** : Images plans, PDF certifs → Éviter SELECT * (performance)

### ✅ **Bonnes pratiques** :

- Toujours filtrer `ValeurNull = 0` sur `ts_mesure` (exclut erreurs capteurs)
- Utiliser `ts_graphique` pour affichages (cache pré-calculé)
- Requêtes temporelles : Toujours index sur `DateHeureMesure`
- Alarmes : Vérifier `Alarme_Vrai = 1` ET `Acquite = 0` (alarmes actives réelles)
- Transactions : Utiliser pour opérations multi-tables (calibrage, étalonnage)

---

## 🔄 Migrations & Évolutions Prévues

### Version 4.0 (Prévue Q2 2025) :

1. **Migration UTF-8** : Conversion complète `latin1` → `utf8mb4`
2. **Partitionnement** : `ts_mesure` par mois (performance requêtes temporelles)
3. **JSON** : Ajout colonnes JSON pour métadonnées extensibles
4. **Audit** : Table `t_audit` dédiée (remplacement logs application)
5. **API REST** : Contraintes UNIQUE renforcées (idempotence POST/PUT)

### Partitionnement `ts_mesure` :

```sql
ALTER TABLE ts_mesure
PARTITION BY RANGE (TO_DAYS(DateHeureMesure)) (
  PARTITION p202411 VALUES LESS THAN (TO_DAYS('2024-12-01')),
  PARTITION p202412 VALUES LESS THAN (TO_DAYS('2025-01-01')),
  PARTITION p202501 VALUES LESS THAN (TO_DAYS('2025-02-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## 📚 Ressources Complémentaires

- **Documentation Agent C#** : `docs/notion/AGENT.md`
- **Documentation Backend Server** : `docs/notion/BACKEND_SERVER.md`
- **Architecture Générale** : `docs/architecture/ARCHITECTURE_GENERALE.md`
- **Fichier SQL complet** : `docs/db/vigitemp_full_db.sql` (800 MB)
- **Structure extraite** : `docs/db/schema_clean.sql` (tables uniquement)

---

**Dernière mise à jour** : 28 novembre 2025  
**Version BDD** : 3.2.1  
**Contributeurs** : MC2 Technologies, Équipe Vigitemp
