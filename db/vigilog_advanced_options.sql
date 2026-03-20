ALTER TABLE `t_vigilog_configuration`
  ADD COLUMN `Delai_Demarrage_Min` INT NOT NULL DEFAULT 0 AFTER `Retard_Alarme_Min`,
  ADD COLUMN `Autorise_Arret_Bouton_Stop` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Delai_Demarrage_Min`,
  ADD COLUMN `Reinitialise_Avec_Bouton_Start` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Autorise_Arret_Bouton_Stop`;

ALTER TABLE `t_vigilog_tournee`
  ADD COLUMN `Delai_Demarrage_Min` INT NOT NULL DEFAULT 0 AFTER `Retard_Alarme_Min`,
  ADD COLUMN `Autorise_Arret_Bouton_Stop` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Delai_Demarrage_Min`,
  ADD COLUMN `Reinitialise_Avec_Bouton_Start` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Autorise_Arret_Bouton_Stop`;

UPDATE `t_vigilog_tournee`
SET
  `Delai_Demarrage_Min` = 0,
  `Autorise_Arret_Bouton_Stop` = 1,
  `Reinitialise_Avec_Bouton_Start` = 1
WHERE
  `Delai_Demarrage_Min` IS NULL
  OR `Autorise_Arret_Bouton_Stop` IS NULL
  OR `Reinitialise_Avec_Bouton_Start` IS NULL;
