USE vigi_main;

SET SQL_SAFE_UPDATE = 0;

ALTER TABLE `t_lieu_planning_audit`
  ADD COLUMN `Date_Heure_Debut_Changement` DATETIME NULL AFTER `Timestamp`,
  ADD COLUMN `Date_Heure_Fin_Changement` DATETIME NULL AFTER `Date_Heure_Debut_Changement`;

ALTER TABLE `t_lieu_planning_audit`
  CHANGE COLUMN `Consigne_Sup_Avant` `Tolerance_Surveillance_Sup_Avant` FLOAT NULL,
  CHANGE COLUMN `Consigne_Inf_Avant` `Tolerance_Surveillance_Inf_Avant` FLOAT NULL,
  CHANGE COLUMN `Consigne_Sup_Apres` `Tolerance_Surveillance_Sup_Apres` FLOAT NULL,
  CHANGE COLUMN `Consigne_Inf_Apres` `Tolerance_Surveillance_Inf_Apres` FLOAT NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_planning_audit_next;
CREATE TEMPORARY TABLE tmp_planning_audit_next AS
SELECT
  Id_Audit,
  Type,
  `Timestamp` AS StartTs,
  LEAD(`Timestamp`) OVER (PARTITION BY Id_Lieu ORDER BY `Timestamp`, Id_Audit) AS NextTs
FROM `t_lieu_planning_audit`;

UPDATE `t_lieu_planning_audit` a
INNER JOIN tmp_planning_audit_next n ON n.Id_Audit = a.Id_Audit
SET a.`Date_Heure_Debut_Changement` = n.StartTs,
    a.`Date_Heure_Fin_Changement` = CASE WHEN a.`Type` = 'ACTIVATION' THEN n.NextTs ELSE NULL END;

DROP TEMPORARY TABLE IF EXISTS tmp_planning_audit_next;

DELETE FROM `t_lieu_planning_audit`
WHERE `Type` = 'RETOUR_BASE';

UPDATE `t_lieu_planning_audit`
SET `Type` = 'PLAN_APPLY'
WHERE `Type` = 'ACTIVATION';

ALTER TABLE `t_lieu_planning_audit`
  MODIFY COLUMN `Type` ENUM('ACTIVATION','RETOUR_BASE','PLAN_APPLY') NOT NULL;

UPDATE `t_lieu_planning_audit`
SET `Type` = 'PLAN_APPLY'
WHERE `Type` = 'ACTIVATION';

DELETE FROM `t_lieu_planning_audit`
WHERE `Type` = 'RETOUR_BASE';

ALTER TABLE `t_lieu_planning_audit`
  MODIFY COLUMN `Type` ENUM('PLAN_APPLY') NOT NULL;
