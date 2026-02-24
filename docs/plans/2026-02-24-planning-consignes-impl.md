# Planning de Consignes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter un système de planning hebdomadaire qui modifie automatiquement les consignes et tolérances de chaque lieu via un SQL EVENT MySQL, sans toucher au serveur C#.

**Architecture:** Les colonnes existantes `Consigne/Sup/Inf` restent les champs "actifs" lus par le C#. On ajoute des colonnes `*_Base` pour stocker la référence hors-planning. Un SQL EVENT MySQL tourne chaque minute et applique les règles de `t_lieu_planning_regle` directement dans `t_lieu`. Les tolérances sont pré-calculées par l'API TypeScript au moment de la création de chaque règle.

**Tech Stack:** MySQL (SQL direct + EVENT), Prisma (`db pull`), Next.js 16 API routes, Zod, React 19, shadcn/ui, `computeEmt()` (website/src/lib/emt.ts)

---

### Task 1 : SQL — Supprimer les tables legacy

**Files:**
- Execute SQL on DB (connection string dans `website/.env` → `DATABASE_URL`)

**Step 1 : Supprimer les FK puis les tables**

```sql
-- Supprimer les relations legacy sur t_lieu d'abord
ALTER TABLE t_lieu
  DROP FOREIGN KEY FK_LIEU_PLANNING_ALARME,
  DROP FOREIGN KEY FK_LIEU_PLANNING_CONSIGNE,
  DROP FOREIGN KEY FK_PLANNING_HEURE_BASCULE;

-- Supprimer les tables legacy
DROP TABLE IF EXISTS t_planning_alarme;
DROP TABLE IF EXISTS t_planning_consigne;
DROP TABLE IF EXISTS t_planning_heure_bascule;
DROP TABLE IF EXISTS t_lieu_planning;
```

> Note: Les noms de FK peuvent varier. Vérifier avec `SHOW CREATE TABLE t_lieu` avant d'exécuter.

**Step 2 : Vérifier**

```sql
SHOW TABLES LIKE 't_planning%';
SHOW TABLES LIKE 't_lieu_planning';
-- Attendu : 0 résultats
```

**Step 3 : Commit note**

```bash
git -C "c:/VigitempProject/vigitemp" commit --allow-empty -m "chore: drop legacy planning tables (SQL executed directly)"
```

---

### Task 2 : SQL — Ajouter colonnes Base + métadonnées sur `t_lieu`

**Files:**
- Execute SQL on DB

**Step 1 : Ajouter les colonnes**

```sql
ALTER TABLE t_lieu
  -- Consignes de base (référence hors planning, jamais écrasée par l'event)
  ADD COLUMN Consigne_Base               DOUBLE NULL AFTER Consigne,
  ADD COLUMN Consigne_Sup_Base           DOUBLE NULL AFTER Consigne_Sup,
  ADD COLUMN Consigne_Inf_Base           DOUBLE NULL AFTER Consigne_Inf,
  -- Tolérances de base (pour le retour-base de l'event)
  ADD COLUMN Tolerance_Surveillance_Sup_Base DOUBLE NULL AFTER Tolerance_Surveillance_Sup,
  ADD COLUMN Tolerance_Surveillance_Inf_Base DOUBLE NULL AFTER Tolerance_Surveillance_Inf,
  -- Métadonnées planning
  ADD COLUMN Planning_Actif              TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN Planning_Source_Regle_Id   INT NULL,
  ADD COLUMN Planning_Derniere_Maj      DATETIME NULL;
```

**Step 2 : Initialiser les colonnes Base avec les valeurs actuelles**

```sql
-- Tous les lieux existants : base = valeurs actuelles
UPDATE t_lieu SET
  Consigne_Base = Consigne,
  Consigne_Sup_Base = Consigne_Sup,
  Consigne_Inf_Base = Consigne_Inf,
  Tolerance_Surveillance_Sup_Base = Tolerance_Surveillance_Sup,
  Tolerance_Surveillance_Inf_Base = Tolerance_Surveillance_Inf;
```

**Step 3 : Vérifier**

```sql
DESCRIBE t_lieu;
-- Vérifier que les 8 nouvelles colonnes apparaissent
SELECT Id_Lieu, Consigne, Consigne_Base, Planning_Actif
FROM t_lieu LIMIT 3;
-- Attendu : Consigne_Base = Consigne pour tous les lieux existants
```

---

### Task 3 : SQL — Créer `t_lieu_planning_regle`

**Files:**
- Execute SQL on DB

**Step 1 : Créer la table**

```sql
CREATE TABLE t_lieu_planning_regle (
  Id_Regle              INT NOT NULL AUTO_INCREMENT,
  Id_Lieu               INT NOT NULL,
  Actif                 TINYINT(1) NOT NULL DEFAULT 1,
  Jour_Debut            TINYINT NOT NULL COMMENT '1=Lun, 2=Mar, ..., 7=Dim',
  Heure_Debut           TIME NOT NULL,
  Jour_Fin              TINYINT NOT NULL,
  Heure_Fin             TIME NOT NULL,
  Consigne              DOUBLE NULL,
  Consigne_Sup          DOUBLE NULL,
  Consigne_Inf          DOUBLE NULL,
  Priorite              INT NOT NULL DEFAULT 0,
  Tolerance_Sup_Calc    DOUBLE NULL COMMENT 'Pré-calculée par API via computeEmt()',
  Tolerance_Inf_Calc    DOUBLE NULL COMMENT 'Pré-calculée par API via computeEmt()',
  Date_Creation         DATETIME NOT NULL DEFAULT NOW(),
  Date_Maj              DATETIME NULL ON UPDATE NOW(),
  PRIMARY KEY (Id_Regle),
  CONSTRAINT FK_PLANNING_REGLE_LIEU
    FOREIGN KEY (Id_Lieu) REFERENCES t_lieu(Id_Lieu) ON DELETE CASCADE,
  INDEX IDX_Id_Lieu (Id_Lieu),
  INDEX IDX_Actif_Lieu (Actif, Id_Lieu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Step 2 : Vérifier**

```sql
DESCRIBE t_lieu_planning_regle;
-- 14 colonnes attendues
```

---

### Task 4 : SQL — Créer `t_lieu_planning_audit`

**Files:**
- Execute SQL on DB

**Step 1 : Créer la table**

```sql
CREATE TABLE t_lieu_planning_audit (
  Id_Audit              INT NOT NULL AUTO_INCREMENT,
  Id_Lieu               INT NOT NULL,
  Timestamp             DATETIME NOT NULL DEFAULT NOW(),
  Type                  ENUM('ACTIVATION','RETOUR_BASE') NOT NULL,
  Planning_Regle_Id     INT NULL,
  Consigne_Avant        DOUBLE NULL,
  Consigne_Sup_Avant    DOUBLE NULL,
  Consigne_Inf_Avant    DOUBLE NULL,
  Consigne_Apres        DOUBLE NULL,
  Consigne_Sup_Apres    DOUBLE NULL,
  Consigne_Inf_Apres    DOUBLE NULL,
  PRIMARY KEY (Id_Audit),
  INDEX IDX_Id_Lieu_Timestamp (Id_Lieu, Timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Step 2 : Vérifier**

```sql
DESCRIBE t_lieu_planning_audit;
```

---

### Task 5 : SQL — Créer le MySQL EVENT

**Files:**
- Execute SQL on DB

**Step 1 : Vérifier que l'EVENT_SCHEDULER est activé**

```sql
SHOW VARIABLES LIKE 'event_scheduler';
-- Si OFF : SET GLOBAL event_scheduler = ON;
-- Pour persistance : ajouter event_scheduler=ON dans my.cnf/my.ini
```

**Step 2 : Créer l'event**

```sql
DELIMITER //

CREATE EVENT IF NOT EXISTS evt_planning_consigne
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP
COMMENT 'Applique les règles de planning de consignes chaque minute'
DO
BEGIN
  DECLARE v_now_day TINYINT;
  DECLARE v_now_time TIME;

  -- Convertir DAYOFWEEK MySQL (1=Dim..7=Sam) vers notre convention (1=Lun..7=Dim)
  SET v_now_day = IF(DAYOFWEEK(NOW()) = 1, 7, DAYOFWEEK(NOW()) - 1);
  SET v_now_time = TIME(NOW());

  -- ---------------------------------------------------------------
  -- ÉTAPE 1 : Appliquer la règle de plus haute priorité si elle existe
  -- ---------------------------------------------------------------
  UPDATE t_lieu l
  INNER JOIN (
    -- Trouver pour chaque lieu la règle active de plus haute priorité
    SELECT r.Id_Lieu, r.Id_Regle, r.Consigne, r.Consigne_Sup, r.Consigne_Inf,
           r.Tolerance_Sup_Calc, r.Tolerance_Inf_Calc
    FROM t_lieu_planning_regle r
    INNER JOIN (
      SELECT Id_Lieu, MAX(Priorite) AS max_prio
      FROM t_lieu_planning_regle
      WHERE Actif = 1
        AND (
          -- Plage normale (Jour_Debut <= Jour_Fin, ex: Lun→Ven)
          (Jour_Debut <= Jour_Fin AND (
            (v_now_day > Jour_Debut AND v_now_day < Jour_Fin)
            OR (v_now_day = Jour_Debut AND v_now_time >= Heure_Debut)
            OR (v_now_day = Jour_Fin   AND v_now_time <  Heure_Fin)
          ))
          OR
          -- Plage cross-semaine (Jour_Debut > Jour_Fin, ex: Ven→Lun)
          (Jour_Debut > Jour_Fin AND (
            (v_now_day = Jour_Debut AND v_now_time >= Heure_Debut)
            OR (v_now_day = Jour_Fin   AND v_now_time <  Heure_Fin)
            OR (v_now_day > Jour_Debut)
            OR (v_now_day < Jour_Fin)
          ))
        )
      GROUP BY Id_Lieu
    ) best_prio ON best_prio.Id_Lieu = r.Id_Lieu AND best_prio.max_prio = r.Priorite
    WHERE r.Actif = 1
      AND (
        (r.Jour_Debut <= r.Jour_Fin AND (
          (v_now_day > r.Jour_Debut AND v_now_day < r.Jour_Fin)
          OR (v_now_day = r.Jour_Debut AND v_now_time >= r.Heure_Debut)
          OR (v_now_day = r.Jour_Fin   AND v_now_time <  r.Heure_Fin)
        ))
        OR
        (r.Jour_Debut > r.Jour_Fin AND (
          (v_now_day = r.Jour_Debut AND v_now_time >= r.Heure_Debut)
          OR (v_now_day = r.Jour_Fin   AND v_now_time <  r.Heure_Fin)
          OR (v_now_day > r.Jour_Debut)
          OR (v_now_day < r.Jour_Fin)
        ))
      )
  ) best ON best.Id_Lieu = l.Id_Lieu
  SET
    l.Consigne                       = best.Consigne,
    l.Consigne_Sup                   = best.Consigne_Sup,
    l.Consigne_Inf                   = best.Consigne_Inf,
    l.Tolerance_Surveillance_Sup     = best.Tolerance_Sup_Calc,
    l.Tolerance_Surveillance_Inf     = best.Tolerance_Inf_Calc,
    l.Planning_Actif                 = 1,
    l.Planning_Source_Regle_Id       = best.Id_Regle,
    l.Planning_Derniere_Maj          = NOW()
  WHERE
    l.Planning_Source_Regle_Id != best.Id_Regle
    OR l.Planning_Source_Regle_Id IS NULL
    OR l.Planning_Actif = 0;

  -- Audit : ACTIVATION (lieux qui viennent de passer en planning)
  INSERT INTO t_lieu_planning_audit
    (Id_Lieu, Timestamp, Type, Planning_Regle_Id,
     Consigne_Avant, Consigne_Sup_Avant, Consigne_Inf_Avant,
     Consigne_Apres, Consigne_Sup_Apres, Consigne_Inf_Apres)
  SELECT l.Id_Lieu, NOW(), 'ACTIVATION', l.Planning_Source_Regle_Id,
    l.Consigne_Base, l.Consigne_Sup_Base, l.Consigne_Inf_Base,
    l.Consigne, l.Consigne_Sup, l.Consigne_Inf
  FROM t_lieu l
  WHERE l.Planning_Actif = 1
    AND l.Planning_Derniere_Maj >= NOW() - INTERVAL 1 MINUTE;

  -- ---------------------------------------------------------------
  -- ÉTAPE 2 : Retour aux valeurs de base pour les lieux sans règle active
  -- ---------------------------------------------------------------
  UPDATE t_lieu l
  SET
    l.Consigne                       = l.Consigne_Base,
    l.Consigne_Sup                   = l.Consigne_Sup_Base,
    l.Consigne_Inf                   = l.Consigne_Inf_Base,
    l.Tolerance_Surveillance_Sup     = l.Tolerance_Surveillance_Sup_Base,
    l.Tolerance_Surveillance_Inf     = l.Tolerance_Surveillance_Inf_Base,
    l.Planning_Actif                 = 0,
    l.Planning_Source_Regle_Id       = NULL,
    l.Planning_Derniere_Maj          = NOW()
  WHERE l.Planning_Actif = 1
    AND l.Id_Lieu NOT IN (
      SELECT DISTINCT r2.Id_Lieu
      FROM t_lieu_planning_regle r2
      WHERE r2.Actif = 1
        AND (
          (r2.Jour_Debut <= r2.Jour_Fin AND (
            (v_now_day > r2.Jour_Debut AND v_now_day < r2.Jour_Fin)
            OR (v_now_day = r2.Jour_Debut AND v_now_time >= r2.Heure_Debut)
            OR (v_now_day = r2.Jour_Fin   AND v_now_time <  r2.Heure_Fin)
          ))
          OR
          (r2.Jour_Debut > r2.Jour_Fin AND (
            (v_now_day = r2.Jour_Debut AND v_now_time >= r2.Heure_Debut)
            OR (v_now_day = r2.Jour_Fin   AND v_now_time <  r2.Heure_Fin)
            OR (v_now_day > r2.Jour_Debut)
            OR (v_now_day < r2.Jour_Fin)
          ))
        )
    );

  -- Audit : RETOUR_BASE
  INSERT INTO t_lieu_planning_audit
    (Id_Lieu, Timestamp, Type, Planning_Regle_Id,
     Consigne_Avant, Consigne_Sup_Avant, Consigne_Inf_Avant,
     Consigne_Apres, Consigne_Sup_Apres, Consigne_Inf_Apres)
  SELECT l.Id_Lieu, NOW(), 'RETOUR_BASE', NULL,
    NULL, NULL, NULL,
    l.Consigne_Base, l.Consigne_Sup_Base, l.Consigne_Inf_Base
  FROM t_lieu l
  WHERE l.Planning_Actif = 0
    AND l.Planning_Derniere_Maj >= NOW() - INTERVAL 1 MINUTE;

END//

DELIMITER ;
```

**Step 3 : Vérifier que l'event est créé**

```sql
SHOW EVENTS;
-- Attendu : evt_planning_consigne avec status ENABLED
```

**Step 4 : Test manuel**

```sql
-- Créer une règle de test qui s'applique maintenant
SET @now_day = IF(DAYOFWEEK(NOW()) = 1, 7, DAYOFWEEK(NOW()) - 1);
INSERT INTO t_lieu_planning_regle
  (Id_Lieu, Actif, Jour_Debut, Heure_Debut, Jour_Fin, Heure_Fin,
   Consigne, Consigne_Sup, Consigne_Inf, Tolerance_Sup_Calc, Tolerance_Inf_Calc)
VALUES
  (1, 1, @now_day, '00:00:00', @now_day, '23:59:59',
   10, 15, 5, 14, 6);

-- Attendre 1 min OU appeler l'event manuellement :
CALL evt_planning_consigne;  -- Si la proc est séparable, sinon attendre l'event

-- Vérifier
SELECT Id_Lieu, Consigne, Planning_Actif, Planning_Source_Regle_Id
FROM t_lieu WHERE Id_Lieu = 1;
-- Attendu : Consigne = 10, Planning_Actif = 1

-- Nettoyer
DELETE FROM t_lieu_planning_regle WHERE Id_Lieu = 1 AND Consigne = 10;
```

---

### Task 6 : Prisma — Synchroniser le schéma

**Files:**
- Modify: `website/prisma/db-main/schema.prisma`

**Step 1 : Lancer prisma db pull**

```bash
cd c:/VigitempProject/vigitemp/website
npx prisma db pull --schema=prisma/db-main/schema.prisma
```

Attendu : le fichier schema.prisma est mis à jour avec :
- Les nouvelles colonnes sur `t_lieu` (Consigne_Base, Planning_Actif, etc.)
- Les nouveaux modèles `t_lieu_planning_regle`, `t_lieu_planning_audit`
- Les anciens modèles legacy (`t_planning_consigne`, etc.) supprimés

**Step 2 : Vérifier le schéma généré**

Ouvrir `website/prisma/db-main/schema.prisma` et vérifier :
- `t_lieu` contient bien `Planning_Actif`, `Consigne_Base`, `Tolerance_Surveillance_Sup_Base`
- `t_lieu_planning_regle` est présent avec `Tolerance_Sup_Calc`, `Tolerance_Inf_Calc`
- `t_lieu_planning_audit` est présent
- Plus de `t_planning_consigne`, `t_planning_heure_bascule`, etc.

**Step 3 : Générer le client Prisma**

```bash
npx prisma generate --schema=prisma/db-main/schema.prisma
```

**Step 4 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

Corriger les erreurs dues aux champs renommés/supprimés dans le code existant si besoin.

**Step 5 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/prisma/db-main/schema.prisma
git -C "c:/VigitempProject/vigitemp" commit -m "feat: sync Prisma schema after planning DB changes"
```

---

### Task 7 : API — Mettre à jour POST/PATCH /api/lieux pour sauvegarder les colonnes Base

**Files:**
- Modify: `website/src/app/api/lieux/route.ts`
- Modify: `website/src/app/api/lieux/[id]/route.ts`

**Context :** Quand un utilisateur crée/modifie un lieu, les consignes doivent être sauvegardées dans DEUX endroits : les colonnes actives (`Consigne`, `Consigne_Sup`, `Consigne_Inf`) ET les colonnes de base (`Consigne_Base`, `Consigne_Sup_Base`, `Consigne_Inf_Base`). Idem pour les tolérances.

**Step 1 : Modifier le POST (`route.ts`)**

Après le calcul existant de `toleranceSup` / `toleranceInf`, ajouter dans l'objet `data` envoyé à Prisma :

```typescript
data: {
  // ... champs existants ...
  Consigne: validated.Consigne,
  Consigne_Sup: validated.Consigne_Sup,
  Consigne_Inf: validated.Consigne_Inf,
  Tolerance_Surveillance_Sup: toleranceSup,
  Tolerance_Surveillance_Inf: toleranceInf,
  // Nouvelles colonnes Base (identiques aux actives à la création)
  Consigne_Base: validated.Consigne,
  Consigne_Sup_Base: validated.Consigne_Sup,
  Consigne_Inf_Base: validated.Consigne_Inf,
  Tolerance_Surveillance_Sup_Base: toleranceSup,
  Tolerance_Surveillance_Inf_Base: toleranceInf,
}
```

**Step 2 : Modifier le PATCH (`[id]/route.ts`)**

Dans la section qui construit `lieuPatch`, ajouter le même mirroring pour les champs Base lorsqu'ils sont présents dans le payload :

```typescript
// Si les consignes sont mises à jour, mettre à jour aussi les bases
if (validated.Consigne !== undefined) {
  lieuPatch.Consigne_Base = validated.Consigne
}
if (validated.Consigne_Sup !== undefined) {
  lieuPatch.Consigne_Sup_Base = validated.Consigne_Sup
}
if (validated.Consigne_Inf !== undefined) {
  lieuPatch.Consigne_Inf_Base = validated.Consigne_Inf
}
// Pour les tolérances recalculées
lieuPatch.Tolerance_Surveillance_Sup_Base = toleranceSup ?? lieuPatch.Tolerance_Surveillance_Sup_Base
lieuPatch.Tolerance_Surveillance_Inf_Base = toleranceInf ?? lieuPatch.Tolerance_Surveillance_Inf_Base
```

**Step 3 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 4 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/api/lieux/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: save base consigne/tolerance columns on lieu create/update"
```

---

### Task 8 : API — Zod schema + types pour les règles de planning

**Files:**
- Create: `website/src/lib/planning-regle-schema.ts`

**Step 1 : Créer le fichier**

```typescript
import { z } from "zod"

export const planningRegleCreateSchema = z.object({
  Actif: z.boolean().default(true),
  Jour_Debut: z.number().int().min(1).max(7),
  Heure_Debut: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  Jour_Fin: z.number().int().min(1).max(7),
  Heure_Fin: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  Consigne: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Priorite: z.number().int().default(0),
})

export const planningRegleUpdateSchema = planningRegleCreateSchema.partial()

export type PlanningRegleCreate = z.infer<typeof planningRegleCreateSchema>
export type PlanningRegleUpdate = z.infer<typeof planningRegleUpdateSchema>

export type PlanningRegleResponse = {
  Id_Regle: number
  Id_Lieu: number
  Actif: boolean
  Jour_Debut: number
  Heure_Debut: string
  Jour_Fin: number
  Heure_Fin: string
  Consigne: number | null
  Consigne_Sup: number | null
  Consigne_Inf: number | null
  Priorite: number
  Tolerance_Sup_Calc: number | null
  Tolerance_Inf_Calc: number | null
  Date_Creation: string
  Date_Maj: string | null
}

// Helper : vérifie si un créneau (jour, heure) est dans la plage de la règle
export function isRegleActive(
  regle: Pick<PlanningRegleResponse, "Jour_Debut" | "Heure_Debut" | "Jour_Fin" | "Heure_Fin">,
  day: number, // 1=Lun..7=Dim
  time: string  // "HH:MM"
): boolean {
  const { Jour_Debut, Heure_Debut, Jour_Fin, Heure_Fin } = regle
  if (Jour_Debut <= Jour_Fin) {
    // Plage normale
    if (day > Jour_Debut && day < Jour_Fin) return true
    if (day === Jour_Debut && time >= Heure_Debut) return true
    if (day === Jour_Fin && time < Heure_Fin) return true
    return false
  } else {
    // Cross-semaine
    if (day === Jour_Debut && time >= Heure_Debut) return true
    if (day === Jour_Fin && time < Heure_Fin) return true
    if (day > Jour_Debut || day < Jour_Fin) return true
    return false
  }
}
```

**Step 2 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 3 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/lib/planning-regle-schema.ts
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add planning regle Zod schema and types"
```

---

### Task 9 : API — GET + POST `/api/lieux/[id]/planning/route.ts`

**Files:**
- Create: `website/src/app/api/lieux/[id]/planning/route.ts`

**Context :**
- GET : liste les règles du lieu, triées par priorité DESC
- POST : crée une règle, pré-calcule les tolérances via `computeEmt()`
- Pour le calcul EMT, on charge les paramètres du lieu (EMT_Choix_Mode, EMT, Derniere_Erreur_Justesse, Derniere_Incertitude, Derive, Est_Correction_Ej, Est_Correction_derive, Est_Consigne_Sup_Active, Est_Consigne_Inf_Active)

**Step 1 : Créer le fichier**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { planningRegleCreateSchema } from "@/lib/planning-regle-schema"
import { computeEmt } from "@/lib/emt"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idLieu = parseInt(params.id)
  if (isNaN(idLieu)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const regles = await db.t_lieu_planning_regle.findMany({
    where: { Id_Lieu: idLieu },
    orderBy: { Priorite: "desc" },
  })

  return NextResponse.json(regles)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idLieu = parseInt(params.id)
  if (isNaN(idLieu)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const body = await req.json()
  const parsed = planningRegleCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const validated = parsed.data

  // Charger les paramètres EMT du lieu
  const lieu = await db.t_lieu.findUnique({
    where: { Id_Lieu: idLieu },
    select: {
      EMT_Choix_Mode: true,
      EMT: true,
      Derniere_Erreur_Justesse: true,
      Derniere_Incertitude: true,
      Derive: true,
      Est_Correction_Ej: true,
      Est_Correction_derive: true,
      Est_Consigne_Sup_Active: true,
      Est_Consigne_Inf_Active: true,
    },
  })
  if (!lieu) return NextResponse.json({ error: "Lieu not found" }, { status: 404 })

  // Pré-calculer les tolérances pour cette règle
  const emtModes = ["quart", "manuel", "uncertainties", "sans-objet"] as const
  const emtMode = lieu.EMT_Choix_Mode != null ? emtModes[(lieu.EMT_Choix_Mode - 1)] : "sans-objet"

  const emt = computeEmt({
    mode: emtMode,
    emtValue: lieu.EMT,
    consigneSup: validated.Consigne_Sup ?? null,
    consigneInf: validated.Consigne_Inf ?? null,
    isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
    isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
    incertitude: lieu.Derniere_Incertitude,
    erreurJustesse: lieu.Derniere_Erreur_Justesse,
    derive: lieu.Derive,
    includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
    correctAccuracyError: !!lieu.Est_Correction_Ej,
  })

  const regle = await db.t_lieu_planning_regle.create({
    data: {
      Id_Lieu: idLieu,
      Actif: validated.Actif,
      Jour_Debut: validated.Jour_Debut,
      Heure_Debut: new Date(`1970-01-01T${validated.Heure_Debut}:00`),
      Jour_Fin: validated.Jour_Fin,
      Heure_Fin: new Date(`1970-01-01T${validated.Heure_Fin}:00`),
      Consigne: validated.Consigne ?? null,
      Consigne_Sup: validated.Consigne_Sup ?? null,
      Consigne_Inf: validated.Consigne_Inf ?? null,
      Priorite: validated.Priorite,
      Tolerance_Sup_Calc: emt.toleranceSup,
      Tolerance_Inf_Calc: emt.toleranceInf,
    },
  })

  return NextResponse.json(regle, { status: 201 })
}
```

**Step 2 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 3 : Test rapide (curl ou REST client)**

```bash
# GET - liste vide attendue
curl http://localhost:3000/api/lieux/1/planning

# POST - créer une règle
curl -X POST http://localhost:3000/api/lieux/1/planning \
  -H "Content-Type: application/json" \
  -d '{"Jour_Debut":5,"Heure_Debut":"19:00","Jour_Fin":1,"Heure_Fin":"07:00","Consigne":10,"Consigne_Sup":15,"Consigne_Inf":5,"Priorite":0}'
# Attendu : 201 avec la règle créée incluant Tolerance_Sup_Calc/Inf_Calc
```

**Step 4 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/api/lieux/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add GET + POST /api/lieux/[id]/planning"
```

---

### Task 10 : API — PATCH + DELETE `/api/lieux/[id]/planning/[regleId]/route.ts`

**Files:**
- Create: `website/src/app/api/lieux/[id]/planning/[regleId]/route.ts`

**Step 1 : Créer le fichier**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { planningRegleUpdateSchema } from "@/lib/planning-regle-schema"
import { computeEmt } from "@/lib/emt"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; regleId: string } }
) {
  const idLieu = parseInt(params.id)
  const idRegle = parseInt(params.regleId)
  if (isNaN(idLieu) || isNaN(idRegle)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const body = await req.json()
  const parsed = planningRegleUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const validated = parsed.data

  // Si les consignes changent, recalculer les tolérances
  let tolerancePatch: { Tolerance_Sup_Calc?: number | null; Tolerance_Inf_Calc?: number | null } = {}
  if (
    validated.Consigne_Sup !== undefined ||
    validated.Consigne_Inf !== undefined
  ) {
    const lieu = await db.t_lieu.findUnique({
      where: { Id_Lieu: idLieu },
      select: {
        EMT_Choix_Mode: true, EMT: true,
        Derniere_Erreur_Justesse: true, Derniere_Incertitude: true,
        Derive: true, Est_Correction_Ej: true, Est_Correction_derive: true,
        Est_Consigne_Sup_Active: true, Est_Consigne_Inf_Active: true,
      },
    })
    const existing = await db.t_lieu_planning_regle.findUnique({ where: { Id_Regle: idRegle } })
    if (lieu && existing) {
      const emtModes = ["quart", "manuel", "uncertainties", "sans-objet"] as const
      const emtMode = lieu.EMT_Choix_Mode != null ? emtModes[(lieu.EMT_Choix_Mode - 1)] : "sans-objet"
      const emt = computeEmt({
        mode: emtMode,
        emtValue: lieu.EMT,
        consigneSup: validated.Consigne_Sup ?? existing.Consigne_Sup,
        consigneInf: validated.Consigne_Inf ?? existing.Consigne_Inf,
        isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
        isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
        incertitude: lieu.Derniere_Incertitude,
        erreurJustesse: lieu.Derniere_Erreur_Justesse,
        derive: lieu.Derive,
        includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
        correctAccuracyError: !!lieu.Est_Correction_Ej,
      })
      tolerancePatch = {
        Tolerance_Sup_Calc: emt.toleranceSup,
        Tolerance_Inf_Calc: emt.toleranceInf,
      }
    }
  }

  const updated = await db.t_lieu_planning_regle.update({
    where: { Id_Regle: idRegle },
    data: {
      ...validated,
      ...(validated.Heure_Debut && { Heure_Debut: new Date(`1970-01-01T${validated.Heure_Debut}:00`) }),
      ...(validated.Heure_Fin && { Heure_Fin: new Date(`1970-01-01T${validated.Heure_Fin}:00`) }),
      ...tolerancePatch,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; regleId: string } }
) {
  const idRegle = parseInt(params.regleId)
  if (isNaN(idRegle)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  await db.t_lieu_planning_regle.delete({ where: { Id_Regle: idRegle } })
  return new NextResponse(null, { status: 204 })
}
```

**Step 2 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 3 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/api/lieux/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add PATCH + DELETE /api/lieux/[id]/planning/[regleId]"
```

---

### Task 11 : API — GET preview + cascade EMT

**Files:**
- Create: `website/src/app/api/lieux/[id]/planning/preview/route.ts`
- Modify: `website/src/app/api/lieux/[id]/route.ts`

**Step 1 : Créer le endpoint preview**

```typescript
// website/src/app/api/lieux/[id]/planning/preview/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isRegleActive } from "@/lib/planning-regle-schema"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idLieu = parseInt(params.id)
  const atParam = req.nextUrl.searchParams.get("at") // ISO datetime
  if (isNaN(idLieu)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const at = atParam ? new Date(atParam) : new Date()
  const jsDay = at.getDay() // 0=Dim..6=Sam
  const ourDay = jsDay === 0 ? 7 : jsDay // 1=Lun..7=Dim
  const timeStr = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`

  const regles = await db.t_lieu_planning_regle.findMany({
    where: { Id_Lieu: idLieu, Actif: true },
    orderBy: { Priorite: "desc" },
  })

  const regleActive = regles.find((r) =>
    isRegleActive(
      {
        Jour_Debut: r.Jour_Debut,
        Heure_Debut: String(r.Heure_Debut).slice(11, 16), // extract HH:MM from DateTime
        Jour_Fin: r.Jour_Fin,
        Heure_Fin: String(r.Heure_Fin).slice(11, 16),
      },
      ourDay,
      timeStr
    )
  ) ?? null

  const lieu = await db.t_lieu.findUnique({
    where: { Id_Lieu: idLieu },
    select: {
      Consigne_Base: true, Consigne_Sup_Base: true, Consigne_Inf_Base: true,
      Tolerance_Surveillance_Sup_Base: true, Tolerance_Surveillance_Inf_Base: true,
    },
  })

  return NextResponse.json({
    regleActive,
    consignesAttendues: regleActive
      ? {
          consigne: regleActive.Consigne,
          consigneSup: regleActive.Consigne_Sup,
          consigneInf: regleActive.Consigne_Inf,
          toleranceSup: regleActive.Tolerance_Sup_Calc,
          toleranceInf: regleActive.Tolerance_Inf_Calc,
        }
      : {
          consigne: lieu?.Consigne_Base,
          consigneSup: lieu?.Consigne_Sup_Base,
          consigneInf: lieu?.Consigne_Inf_Base,
          toleranceSup: lieu?.Tolerance_Surveillance_Sup_Base,
          toleranceInf: lieu?.Tolerance_Surveillance_Inf_Base,
        },
  })
}
```

**Step 2 : Cascade EMT dans PATCH /api/lieux/[id]/route.ts**

Après la mise à jour du lieu, si les paramètres EMT ont changé, recalculer les tolérances de toutes les règles actives :

```typescript
// Dans le handler PATCH, après db.t_lieu.update(...)
// Détecter si les paramètres EMT ont changé
const emtFieldsChanged =
  validated.EMT_Choix_Mode !== undefined ||
  validated.EMT !== undefined ||
  validated.Derniere_Erreur_Justesse !== undefined ||
  validated.Derniere_Incertitude !== undefined ||
  validated.Derive !== undefined ||
  validated.Est_Correction_Ej !== undefined ||
  validated.Est_Correction_derive !== undefined ||
  validated.Est_Consigne_Sup_Active !== undefined ||
  validated.Est_Consigne_Inf_Active !== undefined

if (emtFieldsChanged) {
  const regles = await db.t_lieu_planning_regle.findMany({
    where: { Id_Lieu: idLieu, Actif: true },
  })
  const updatedLieu = await db.t_lieu.findUnique({
    where: { Id_Lieu: idLieu },
    select: { EMT_Choix_Mode: true, EMT: true, /* ... tous champs EMT */ },
  })
  if (updatedLieu) {
    const emtModes = ["quart", "manuel", "uncertainties", "sans-objet"] as const
    const emtMode = updatedLieu.EMT_Choix_Mode != null ? emtModes[(updatedLieu.EMT_Choix_Mode - 1)] : "sans-objet"
    await Promise.all(
      regles.map((regle) => {
        const emt = computeEmt({ mode: emtMode, /* ... */ consigneSup: regle.Consigne_Sup, consigneInf: regle.Consigne_Inf })
        return db.t_lieu_planning_regle.update({
          where: { Id_Regle: regle.Id_Regle },
          data: { Tolerance_Sup_Calc: emt.toleranceSup, Tolerance_Inf_Calc: emt.toleranceInf },
        })
      })
    )
  }
}
```

**Step 3 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 4 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/api/lieux/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add planning preview endpoint and EMT cascade on lieu update"
```

---

### Task 12 : UI — Onglet Planning dans la modal lieu

**Files:**
- Create: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-planning.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx`

**Context :** Regarder `location-form-tab-metrology.tsx` et `location-form-tab-general.tsx` pour comprendre le pattern de tab. La modal utilise un composant Tabs de shadcn/ui.

**Step 1 : Créer le composant tab scaffold**

```typescript
// location-form-tab-planning.tsx
"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { LieuFormData } from "./location-form-types"

interface Props {
  idLieu: number | null // null si création
}

export function LocationFormTabPlanning({ idLieu }: Props) {
  const t = useTranslations("lieux.planning")
  // État: règles chargées depuis l'API
  // Composants: WeeklyPlanningView + PlanningRuleList + PlanningRuleFormDialog

  if (!idLieu) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        Sauvegardez le lieu avant de configurer le planning.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* TODO Task 13: WeeklyPlanningView */}
      {/* TODO Task 14: PlanningRuleList */}
      {/* TODO Task 15: Status indicator */}
    </div>
  )
}
```

**Step 2 : Ajouter l'onglet dans `location-form-dialog.tsx`**

Chercher le composant `<Tabs>` dans le fichier. Ajouter :
```tsx
<TabsTrigger value="planning">{t("lieux.tabs.planning")}</TabsTrigger>
// ...
<TabsContent value="planning">
  <LocationFormTabPlanning idLieu={formData.Id_Lieu ?? null} />
</TabsContent>
```

**Step 3 : Ajouter les clés i18n**

Dans `website/public/locales/fr.json` ET `en.json`, ajouter les clés manquantes pour `lieux.planning.*` et `lieux.tabs.planning`.

**Step 4 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 5 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add Planning tab scaffold to lieu modal"
```

---

### Task 13 : UI — Composant WeeklyPlanningView + PlanningRuleList

**Files:**
- Create: `website/src/app/[locale]/(admin)/admin/lieux/_components/planning-weekly-view.tsx`
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-planning.tsx`

**Context :** Visualisation hebdomadaire simple. Pour chaque règle, afficher un bloc coloré sur les jours concernés. Utiliser des div avec positionnement relatif, pas de lib externe.

**Step 1 : Créer le composant de visualisation**

```tsx
// planning-weekly-view.tsx
"use client"

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

interface PlanningRule {
  Id_Regle: number
  Jour_Debut: number // 1-7
  Jour_Fin: number
  Heure_Debut: string
  Heure_Fin: string
  Consigne_Sup: number | null
  Consigne_Inf: number | null
}

interface Props {
  regles: PlanningRule[]
  onSelectRegle?: (regle: PlanningRule) => void
}

export function WeeklyPlanningView({ regles, onSelectRegle }: Props) {
  // Pour chaque règle, calculer quels jours sont couverts
  // Afficher une grille 7 colonnes avec blocs colorés
  return (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {JOURS.map((jour, i) => {
        const day = i + 1 // 1=Lun..7=Dim
        const reglesDuJour = regles.filter((r) => {
          if (r.Jour_Debut <= r.Jour_Fin) return day >= r.Jour_Debut && day <= r.Jour_Fin
          return day >= r.Jour_Debut || day <= r.Jour_Fin
        })
        return (
          <div key={jour} className="flex flex-col items-center gap-1">
            <span className="font-medium text-muted-foreground">{jour}</span>
            {reglesDuJour.length > 0 ? (
              reglesDuJour.map((r) => (
                <button
                  key={r.Id_Regle}
                  onClick={() => onSelectRegle?.(r)}
                  className="w-full rounded bg-blue-500/20 border border-blue-500/40 px-1 py-0.5 text-blue-700 hover:bg-blue-500/30"
                >
                  {r.Heure_Debut}–{r.Heure_Fin}
                </button>
              ))
            ) : (
              <div className="w-full rounded bg-muted/30 px-1 py-0.5 text-center text-muted-foreground">—</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2 : Intégrer dans `location-form-tab-planning.tsx`**

- Charger les règles via `fetch("/api/lieux/{id}/planning")` avec `useSWR` ou `useEffect`
- Afficher `WeeklyPlanningView` avec les règles
- Afficher la liste des règles sous forme de cards (Jour_Debut → Jour_Fin, consignes, boutons Éditer/Supprimer)

**Step 3 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 4 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add WeeklyPlanningView and rule list to planning tab"
```

---

### Task 14 : UI — Formulaire d'ajout/édition de règle

**Files:**
- Create: `website/src/app/[locale]/(admin)/admin/lieux/_components/planning-rule-form-dialog.tsx`

**Step 1 : Créer le dialog de formulaire**

Pattern : Dialog shadcn/ui avec react-hook-form + zod resolver.

```tsx
// planning-rule-form-dialog.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { planningRegleCreateSchema, type PlanningRegleCreate } from "@/lib/planning-regle-schema"

const JOURS_OPTIONS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
]

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: PlanningRegleCreate) => Promise<void>
  defaultValues?: Partial<PlanningRegleCreate>
  title: string
}

export function PlanningRuleFormDialog({ open, onClose, onSubmit, defaultValues, title }: Props) {
  const form = useForm<PlanningRegleCreate>({
    resolver: zodResolver(planningRegleCreateSchema),
    defaultValues: {
      Actif: true,
      Priorite: 0,
      ...defaultValues,
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Jour début + Heure début */}
          {/* Jour fin + Heure fin */}
          {/* Consigne + Consigne Sup + Consigne Inf */}
          {/* Priorité */}
          {/* Boutons */}
          <Button type="submit">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2 : Intégrer dans `location-form-tab-planning.tsx`**

- Bouton "+ Ajouter" → ouvre le dialog en mode création
- Bouton "Éditer" sur une règle → ouvre le dialog pré-rempli
- `onSubmit` → POST ou PATCH selon le cas, puis recharger les règles

**Step 3 : Vérifier TypeScript**

```bash
pnpm tsc --noEmit
```

**Step 4 : Commit**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: add PlanningRuleFormDialog for create/edit"
```

---

### Task 15 : UI — Indicateur d'état + vérification finale

**Files:**
- Modify: `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-planning.tsx`

**Step 1 : Ajouter le status indicator**

```tsx
// Charger l'état actuel via GET /api/lieux/{id}/planning/preview
// Afficher selon Planning_Actif du lieu :
// - Planning_Actif = true → Badge vert "Planning actif — Règle #X"
// - Planning_Actif = false → Badge gris "Consignes de base"
const { data: preview } = useSWR(`/api/lieux/${idLieu}/planning/preview`, fetcher)

<div className="flex items-center gap-2">
  {preview?.regleActive ? (
    <Badge variant="default" className="bg-green-500">
      Planning actif — Règle #{preview.regleActive.Id_Regle}
    </Badge>
  ) : (
    <Badge variant="secondary">Consignes de base</Badge>
  )}
</div>
```

**Step 2 : Vérifier la compilation complète**

```bash
pnpm tsc --noEmit
# Attendu : 0 erreurs
```

**Step 3 : Test de recette manuel**

1. Créer un lieu avec Consigne_Sup = 20°, EMT_Mode = "sans-objet"
2. Aller dans l'onglet Planning → créer une règle qui couvre "maintenant" (même jour, 00:00→23:59)
3. Vérifier en DB que `Tolerance_Sup_Calc = 20` dans `t_lieu_planning_regle`
4. Attendre que l'event MySQL tourne (max 1 min) → vérifier que `t_lieu.Consigne_Sup = règle.Consigne_Sup`
5. Supprimer la règle → attendre → vérifier retour aux valeurs de base
6. Vérifier `t_lieu_planning_audit` contient les lignes ACTIVATION et RETOUR_BASE

**Step 4 : Commit final**

```bash
git -C "c:/VigitempProject/vigitemp" add website/src/app/
git -C "c:/VigitempProject/vigitemp" commit -m "feat: complete planning consignes feature - status indicator and final polish"
```
