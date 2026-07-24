USE vigi_main;

-- ============================================================
-- Activer ou desactiver une selection de sondes/lieux GSP.
--
-- @target_state = 'S' : activer la surveillance
-- @target_state = 'D' : desactiver la surveillance
--
-- Ajouter un INSERT par numero de serie a traiter.
-- Aucun autre lieu ni aucune autre sonde ne sera modifie.
-- ============================================================

SET @target_state = 'S';

DROP TEMPORARY TABLE IF EXISTS tmp_gsp_selection;
CREATE TEMPORARY TABLE tmp_gsp_selection (
  Sonde_Numero_Serie varchar(50) NOT NULL,
  PRIMARY KEY (Sonde_Numero_Serie)
) ENGINE=Memory;

-- Selection a personnaliser.
INSERT INTO tmp_gsp_selection (Sonde_Numero_Serie) VALUES
  ('SPNB-26000065');

-- Exemple avec plusieurs sondes :
-- INSERT INTO tmp_gsp_selection (Sonde_Numero_Serie) VALUES
--   ('SPNB-26000065'),
--   ('SPNB-26000068'),
--   ('SPPS-26000007');

SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

-- Verification avant modification.
SELECT
  l.Id_Lieu,
  l.Nom_Lieu,
  l.Sonde_Numero_Serie,
  l.Adresse_Sonde,
  l.Lieu_Etat AS Ancien_Etat_Lieu,
  s.Etat_Sonde AS Ancien_Etat_Sonde,
  s.Sonde_Type
FROM t_lieu l
LEFT JOIN t_sonde s
  ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie
WHERE
  l.Est_Archive = 0
  AND EXISTS (
    SELECT 1
    FROM tmp_gsp_selection selection
    WHERE selection.Sonde_Numero_Serie = l.Sonde_Numero_Serie
  )
ORDER BY l.Id_Lieu;

-- Mise a jour des lieux selectionnes.
UPDATE t_lieu l
SET
  l.Lieu_Etat = @target_state,
  l.Date_Heure_Surveillance_On = CASE
    WHEN @target_state = 'S' THEN NOW()
    ELSE l.Date_Heure_Surveillance_On
  END,
  l.Date_Heure_Surveillance_Off = CASE
    WHEN @target_state = 'D' THEN NOW()
    ELSE NULL
  END,
  l.Date_Heure_Reactivation_Surveillance = NULL,
  l.Date_Heure_Derniere_Reponse = CASE
    WHEN @target_state = 'S' THEN NULL
    ELSE l.Date_Heure_Derniere_Reponse
  END,
  l.Infos_Modifiees_Depuis_Derniere_Mesure = 1
WHERE
  l.Est_Archive = 0
  AND EXISTS (
    SELECT 1
    FROM tmp_gsp_selection selection
    WHERE selection.Sonde_Numero_Serie = l.Sonde_Numero_Serie
  );

SET @updated_lieux = ROW_COUNT();

-- Mise a jour des sondes selectionnees.
UPDATE t_sonde s
SET s.Etat_Sonde = @target_state
WHERE EXISTS (
  SELECT 1
  FROM tmp_gsp_selection selection
  WHERE selection.Sonde_Numero_Serie = s.Sonde_Numero_Serie
);

SET @updated_sondes = ROW_COUNT();

-- Verification apres modification.
SELECT
  l.Id_Lieu,
  l.Nom_Lieu,
  l.Sonde_Numero_Serie,
  l.Lieu_Etat,
  s.Etat_Sonde,
  l.Date_Heure_Surveillance_On,
  l.Date_Heure_Surveillance_Off,
  l.Date_Heure_Derniere_Reponse
FROM t_lieu l
LEFT JOIN t_sonde s
  ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie
WHERE
  l.Est_Archive = 0
  AND EXISTS (
    SELECT 1
    FROM tmp_gsp_selection selection
    WHERE selection.Sonde_Numero_Serie = l.Sonde_Numero_Serie
  )
ORDER BY l.Id_Lieu;

SELECT
  @target_state AS Etat_Demande,
  @updated_lieux AS Lieux_Modifies,
  @updated_sondes AS Sondes_Modifiees;

COMMIT;

SET SQL_SAFE_UPDATES = @old_safe_updates;
DROP TEMPORARY TABLE IF EXISTS tmp_gsp_selection;
