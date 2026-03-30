SET @has_col := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 't_etalonnage'
    AND column_name = 'Valide'
);

SET @sql := IF(
  @has_col = 0,
  'ALTER TABLE `t_etalonnage` ADD COLUMN `Valide` DATETIME NULL AFTER `Duree_Validite_Jours`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
