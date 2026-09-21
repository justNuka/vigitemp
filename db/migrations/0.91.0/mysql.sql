-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.0
-- MySQL 8.x
-- Baseline attendue : 0.90.2
-- =====================================================================
--
-- Changements :
--   1. ajoute les seuils critiques haut/bas sur t_lieu ;
--   2. ajoute les mêmes champs aux templates de lieu ;
--   3. positionne VERSION/SCHEMA_VERSION à 0.91.0 à la fin.
--
-- Un seuil critique actif est évalué par VigiSensys Serveur et déclenche
-- immédiatement l'alarme haute/basse correspondante, sans attendre le
-- retard d'alarme normal. Il n'est pas envoyé au firmware GSP.

USE `vigi_main`;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu'
    AND COLUMN_NAME = 'Seuil_Critique_Haut'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu` ADD COLUMN `Seuil_Critique_Haut` float DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu'
    AND COLUMN_NAME = 'Est_Seuil_Critique_Haut_Active'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu` ADD COLUMN `Est_Seuil_Critique_Haut_Active` tinyint(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu'
    AND COLUMN_NAME = 'Seuil_Critique_Bas'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu` ADD COLUMN `Seuil_Critique_Bas` float DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu'
    AND COLUMN_NAME = 'Est_Seuil_Critique_Bas_Active'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu` ADD COLUMN `Est_Seuil_Critique_Bas_Active` tinyint(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu_template'
    AND COLUMN_NAME = 'Seuil_Critique_Haut'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu_template` ADD COLUMN `Seuil_Critique_Haut` decimal(10,2) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu_template'
    AND COLUMN_NAME = 'Est_Seuil_Critique_Haut_Active'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu_template` ADD COLUMN `Est_Seuil_Critique_Haut_Active` tinyint(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu_template'
    AND COLUMN_NAME = 'Seuil_Critique_Bas'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu_template` ADD COLUMN `Seuil_Critique_Bas` decimal(10,2) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_lieu_template'
    AND COLUMN_NAME = 'Est_Seuil_Critique_Bas_Active'
);
SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_lieu_template` ADD COLUMN `Est_Seuil_Critique_Bas_Active` tinyint(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('VERSION', 'SCHEMA_VERSION', '0.91.0', 'Version de schéma VigiSensys')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

SELECT 'Migration VigiSensys DB 0.91.0 terminée' AS Migration_Status;
