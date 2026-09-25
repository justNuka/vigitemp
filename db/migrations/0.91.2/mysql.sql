-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.2
-- MySQL
-- Baseline attendue : 0.91.1
-- =====================================================================
--
-- Changements :
--   1. élargit les types d'alarme de 1 à 2 caractères ;
--   2. ajoute les messages CRITIQUE_BAS (CB) et CRITIQUE_HAUT (CH) ;
--   3. conserve volontairement le trigger GSO de 0.91.1 sans traitement
--      direct des seuils critiques ;
--   4. positionne VERSION/SCHEMA_VERSION à 0.91.2 à la fin.
--

USE `vigi_main`;

ALTER TABLE `t_alarme`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

ALTER TABLE `t_alarme_histo`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

ALTER TABLE `t_alarme_message`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

INSERT INTO `t_alarme_message`
  (`Id_Alarme_Message`, `Code_Alarme_Message`, `Type`, `Texte_Message`)
VALUES
  (20, 'CRITIQUE_BAS', 'CB', 'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.'),
  (21, 'CRITIQUE_HAUT', 'CH', 'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.')
ON DUPLICATE KEY UPDATE
  `Code_Alarme_Message` = VALUES(`Code_Alarme_Message`),
  `Type` = VALUES(`Type`),
  `Texte_Message` = VALUES(`Texte_Message`);

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('VERSION', 'SCHEMA_VERSION', '0.91.2', 'Version de schéma VigiSensys')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

SELECT 'Migration VigiSensys DB 0.91.2 terminée' AS Migration_Status;
