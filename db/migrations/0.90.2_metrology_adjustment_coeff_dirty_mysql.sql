-- VigiSensys DB 0.90.2
-- MySQL 8.x
--
-- Ajoute un drapeau de synchronisation des coefficients directement sur
-- t_ajustage. Ce drapeau est réservé aux parcours Ajustage / Étalonnage et
-- remplace l'utilisation de t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure
-- pour ces opérations.

USE `vigi_main`;

SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_ajustage'
    AND COLUMN_NAME = 'Coeffs_Modifies_Depuis_Derniere_Mesure'
);

SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_ajustage` ADD COLUMN `Coeffs_Modifies_Depuis_Derniere_Mesure` tinyint(1) NOT NULL DEFAULT 0 AFTER `Coeff_Constant`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
