# Design : Planning de Consignes

**Date :** 2026-02-24
**Statut :** Validé

---

## 1. Objectif

Permettre de définir, pour chaque lieu, des plages horaires récurrentes (hebdomadaires) qui modifient automatiquement les consignes haute/centrale/basse et les tolérances de surveillance. Retour automatique aux consignes de base hors plage.

---

## 2. Décisions clés

| Décision | Choix retenu |
|---|---|
| Plages multi-jours | Une seule règle avec `Jour_Debut/Heure_Debut → Jour_Fin/Heure_Fin` |
| Exceptions (jours fériés) | Reporté V2 |
| Calcul des tolérances | Pré-calculées par l'API TypeScript à la création, stockées dans la règle |
| Moteur d'exécution | SQL EVENT MySQL toutes les minutes |
| UI | Onglet Planning dans modal lieu — calendrier hebdomadaire visuel |
| Tables legacy | `t_planning_consigne`, `t_planning_heure_bascule`, `t_planning_alarme`, `t_lieu_planning` supprimées |
| Serveur C# | Zéro changement de logique — lit `t_lieu` comme aujourd'hui |
| Workflow DB | SQL direct sur base → `prisma db pull` (pas de migration Prisma classique) |

---

## 3. Modèle de données

### 3.1 Évolutions `t_lieu`

**Nouvelles colonnes :**
```sql
-- Consignes de base (référence hors planning)
Consigne_Base           DOUBLE NULL
Consigne_Sup_Base       DOUBLE NULL
Consigne_Inf_Base       DOUBLE NULL

-- Métadonnées planning
Planning_Actif              TINYINT(1) NOT NULL DEFAULT 0
Planning_Source_Regle_Id    INT NULL
Planning_Derniere_Maj       DATETIME NULL
```

**Renommages :**
```sql
-- Colonnes actives (lues par le serveur C#)
Consigne      → Consigne_Active
Consigne_Sup  → Consigne_Sup_Active
Consigne_Inf  → Consigne_Inf_Active
```
Les flags `Est_Consigne_*_Active` restent inchangés.

### 3.2 Nouvelle table `t_lieu_planning_regle`

```sql
CREATE TABLE t_lieu_planning_regle (
  Id_Regle              INT AUTO_INCREMENT PRIMARY KEY,
  Id_Lieu               INT NOT NULL,
  Actif                 TINYINT(1) NOT NULL DEFAULT 1,
  Jour_Debut            TINYINT NOT NULL,   -- 1=Lun, 7=Dim
  Heure_Debut           TIME NOT NULL,
  Jour_Fin              TINYINT NOT NULL,
  Heure_Fin             TIME NOT NULL,
  Consigne              DOUBLE NULL,
  Consigne_Sup          DOUBLE NULL,
  Consigne_Inf          DOUBLE NULL,
  Priorite              INT NOT NULL DEFAULT 0,
  Tolerance_Sup_Calc    DOUBLE NULL,        -- pré-calculée par l'API (computeEmt)
  Tolerance_Inf_Calc    DOUBLE NULL,        -- pré-calculée par l'API (computeEmt)
  Date_Creation         DATETIME NOT NULL DEFAULT NOW(),
  Date_Maj              DATETIME NULL,
  FOREIGN KEY (Id_Lieu) REFERENCES t_lieu(Id_Lieu) ON DELETE CASCADE
);
```

**Gestion cross-semaine :** si `Jour_Debut > Jour_Fin` (ex: Ven→Lun, 5→1), le SQL event gère le passage de semaine nativement.

### 3.3 Table d'audit `t_lieu_planning_audit`

```sql
CREATE TABLE t_lieu_planning_audit (
  Id_Audit              INT AUTO_INCREMENT PRIMARY KEY,
  Id_Lieu               INT NOT NULL,
  Timestamp             DATETIME NOT NULL DEFAULT NOW(),
  Type                  ENUM('ACTIVATION','DESACTIVATION','RETOUR_BASE'),
  Planning_Regle_Id     INT NULL,
  Consigne_Avant        DOUBLE NULL,
  Consigne_Sup_Avant    DOUBLE NULL,
  Consigne_Inf_Avant    DOUBLE NULL,
  Consigne_Apres        DOUBLE NULL,
  Consigne_Sup_Apres    DOUBLE NULL,
  Consigne_Inf_Apres    DOUBLE NULL
);
```

### 3.4 Tables legacy à supprimer
- `t_planning_consigne`
- `t_planning_heure_bascule`
- `t_planning_alarme`
- `t_lieu_planning`

---

## 4. SQL Event

Event MySQL tournant chaque minute. Logique :

1. Pour chaque lieu, déterminer la règle active (`Actif=1`, plage horaire contenant `NOW()`)
2. En cas de chevauchement → règle avec `Priorite` la plus haute
3. Si règle trouvée et différente de l'état actuel :
   - Copier `Consigne/Sup/Inf` + `Tolerance_Sup_Calc/Inf_Calc` → `t_lieu`
   - `Planning_Actif = 1`, `Planning_Source_Regle_Id = Id_Regle`
   - Insérer ligne dans `t_lieu_planning_audit` (type: ACTIVATION)
4. Si aucune règle et `Planning_Actif = 1` :
   - Restaurer les consignes de base (`Consigne_Base`, `Consigne_Sup_Base`, `Consigne_Inf_Base`)
   - Restaurer les tolérances de base
   - `Planning_Actif = 0`, `Planning_Source_Regle_Id = NULL`
   - Insérer ligne dans `t_lieu_planning_audit` (type: RETOUR_BASE)
5. Écriture uniquement si changement réel (pas de write inutile chaque minute)

**Exigence MySQL :** `EVENT_SCHEDULER = ON` requis sur le serveur.

---

## 5. API Web

### Nouvelles routes

```
GET    /api/lieux/[id]/planning                 → liste les règles
POST   /api/lieux/[id]/planning                 → crée une règle
PATCH  /api/lieux/[id]/planning/[regleId]        → modifie une règle
DELETE /api/lieux/[id]/planning/[regleId]        → supprime une règle
GET    /api/lieux/[id]/planning/preview?at=...   → aperçu à une date/heure
```

### Comportement POST/PATCH
1. Valider la plage (jour 1-7, heure valide)
2. Appeler `computeEmt()` avec les consignes de la règle + paramètres EMT du lieu
3. Stocker `Tolerance_Sup_Calc` / `Tolerance_Inf_Calc`
4. Avertir si chevauchement avec une règle existante de même priorité

### Cascade sur changement EMT (`PATCH /api/lieux/[id]`)
Si les paramètres EMT du lieu changent → recalculer et mettre à jour `Tolerance_Sup_Calc` / `Tolerance_Inf_Calc` de toutes les règles actives du lieu.

### Endpoint preview
```
GET /api/lieux/[id]/planning/preview?at=2026-02-28T19:00
→ { regleActive: { ... } | null, consignesAttendues: { sup, ref, inf, toleranceSup, toleranceInf } }
```

---

## 6. UI — Onglet Planning (modal lieu)

**Structure de l'onglet :**

```
┌─────────────────────────────────────────────────────┐
│  PLANNING DES CONSIGNES              [+ Ajouter]    │
├─────────────────────────────────────────────────────┤
│  Vue hebdomadaire (blocs colorés par règle)         │
│  Lun  Mar  Mer  Jeu  Ven  Sam  Dim                  │
│  ░░░  ░░░  ░░░  ░░░  ████  ███  ░░░                 │
│                       19h        7h                 │
├─────────────────────────────────────────────────────┤
│  Règles actives (liste)                             │
│  ┌──────────────────────────────────────────────┐   │
│  │ Ven 19:00 → Lun 07:00                        │   │
│  │ Sup: 5° / Ref: 0° / Inf: -5°  Priorité: 0   │   │
│  │                      [Éditer] [Supprimer]    │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  État actuel                                        │
│  ● Hors planning — consignes de base               │
└─────────────────────────────────────────────────────┘
```

**Formulaire d'ajout/édition :**
- `Jour début` + `Heure début` → `Jour fin` + `Heure fin`
- `Consigne` / `Consigne Sup` / `Consigne Inf` (selon flags actifs du lieu)
- `Priorité` (int)
- Aperçu tolerances en temps réel (appel `computeEmt()` côté client)

---

## 7. Serveur C# — Impact

**`Database.cs` — ReadLieuAlarmSettingsV2 :** mettre à jour les 2 lignes qui référencent `Consigne`, `Consigne_Sup`, `Consigne_Inf` → `Consigne_Active`, `Consigne_Sup_Active`, `Consigne_Inf_Active`.

Aucune autre modification. La logique d'alarme, de retard, de pré-alarme reste intacte.

---

## 8. Plan de mise en œuvre recommandé

1. SQL : supprimer tables legacy + modifier `t_lieu` (colonnes base/active + métadonnées planning) → `prisma db pull`
2. SQL : créer `t_lieu_planning_regle` + `t_lieu_planning_audit` → `prisma db pull`
3. SQL : créer `evt_planning_consigne` (SQL EVENT)
4. C# : mettre à jour les 2 références dans `Database.cs`
5. API : routes CRUD `/api/lieux/[id]/planning`
6. API : cascade EMT dans `PATCH /api/lieux/[id]`
7. API : endpoint preview
8. UI : onglet Planning dans modal lieu
9. Tests de recette (bascule, retour base, cross-semaine, chevauchement)
