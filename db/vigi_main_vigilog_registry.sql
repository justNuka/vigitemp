CREATE TABLE IF NOT EXISTS `t_vigilog` (
  `Id_VigiLog` INT NOT NULL AUTO_INCREMENT,
  `Numero_Serie` VARCHAR(30) NOT NULL,
  `Modele` VARCHAR(50) NULL,
  `Libelle` VARCHAR(100) NULL,
  `Actif` TINYINT(1) NOT NULL DEFAULT 1,
  `Date_Etalonnage` DATETIME NULL,
  `Date_Validite` DATE NULL,
  `Duree_Validite_Jours` INT NULL,
  `Err_Justesse` FLOAT NULL,
  `Commentaire` TEXT NULL,
  `Id_Utilisateur_Creation` INT NULL,
  `Date_Heure_Creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Id_Utilisateur_Maj` INT NULL,
  `Date_Heure_Maj` DATETIME NULL,
  PRIMARY KEY (`Id_VigiLog`),
  UNIQUE KEY `UK_t_vigilog_numero_serie` (`Numero_Serie`),
  KEY `IDX_t_vigilog_actif` (`Actif`),
  KEY `IDX_t_vigilog_modele` (`Modele`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `t_vigilog_tournee`
  ADD COLUMN `Id_VigiLog` INT NULL AFTER `Id_VigiLog_Configuration`,
  ADD KEY `IDX_t_vigilog_tournee_vigilog` (`Id_VigiLog`),
  ADD CONSTRAINT `FK_t_vigilog_tournee_vigilog`
    FOREIGN KEY (`Id_VigiLog`) REFERENCES `t_vigilog` (`Id_VigiLog`)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

UPDATE `t_vigilog_tournee` vt
LEFT JOIN `t_vigilog` v ON v.`Numero_Serie` = vt.`Numero_Serie_VigiLog`
SET vt.`Id_VigiLog` = v.`Id_VigiLog`
WHERE vt.`Id_VigiLog` IS NULL;
