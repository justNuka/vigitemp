-- SQL script to rename boolean-like columns to French 'est_' prefixes
-- Run against the appropriate database (db-main and db-mesure) after backup.
-- Review before running. This script assumes MySQL and uses TINYINT(1) for boolean columns.
-- For columns with a default of true/false, defaults are kept (1/0). Nullable columns keep NULL.

SET @OLD_SQL_MODE := @@SESSION.sql_mode;
SET SESSION sql_mode = REPLACE(REPLACE(REPLACE(@@SESSION.sql_mode,'NO_ZERO_DATE',''),'NO_ZERO_IN_DATE',''),'STRICT_TRANS_TABLES','');

-- === DB-MAIN (schema: db-main) ===
USE vigitemp_ifb;

-- t_actionneur
ALTER TABLE `t_actionneur` CHANGE COLUMN `est_Etat` `Est_Etat` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_actionneur` CHANGE COLUMN `est_Demande` `Est_Demande` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_actionneur` CHANGE COLUMN `est_Test` `Est_Test` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_actionneur` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;

-- t_alarme
ALTER TABLE `t_alarme` CHANGE COLUMN `est_Alarme_Vrai` `Est_Alarme_Vrai` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_alarme` CHANGE COLUMN `est_Acquitee` `Est_Acquitee` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_alarme` CHANGE COLUMN `est_Alarme_Pour_VigiTel` `Est_Alarme_Pour_VigiTel` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_alarme` CHANGE COLUMN `est_Mail_Envoye` `Est_Mail_Envoye` TINYINT(1) NULL;
ALTER TABLE `t_alarme` CHANGE COLUMN `est_Tel_Acquitee` `Est_Tel_Acquitee` TINYINT(1) NULL;

-- t_autorisation
ALTER TABLE `t_autorisation` CHANGE COLUMN `est_Acces_Admin` `A_Acces_Admin` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_autorisation` CHANGE COLUMN `est_Acces_Metrologie` `A_Acces_Metrologie` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_autorisation` CHANGE COLUMN `est_Acces_Surveillance` `A_Acces_Surveillance` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_autorisation` CHANGE COLUMN `est_Acces_VigiLog` `A_Acces_VigiLog` TINYINT(1) NULL DEFAULT 0;

-- t_bain
ALTER TABLE `t_bain` CHANGE COLUMN `est_Reserve_MC2` `Est_Reserve_MC2` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_bain` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;

-- t_etalon
ALTER TABLE `t_etalon` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_etalon` CHANGE COLUMN `est_Sonde_Externe` `Est_Sonde_Externe` TINYINT(1) NULL;

-- t_groupe
ALTER TABLE `t_groupe` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;

-- t_lieu
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Consigne_Sup_Active` `Est_Consigne_Sup_Active` TINYINT(1) NULL DEFAULT 1;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Consigne_Sup_Pre_Alarme_Active` `Est_Consigne_Sup_Pre_Alarme_Active` TINYINT(1) NULL;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Consigne_Inf_Active` `Est_Consigne_Inf_Active` TINYINT(1) NULL DEFAULT 1;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Consigne_Inf_Pre_Alarme_Active` `Est_Consigne_Inf_Pre_Alarme_Active` TINYINT(1) NULL;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Tel_Actif` `Est_Tel_Actif` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Mode_Serotheque` `Est_Mode_Serotheque` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_DataLogger` `Est_DataLogger` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_lieu` CHANGE COLUMN `Correction_Ej` `Est_Correction_Ej` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_lieu` CHANGE COLUMN `est_Correction_derive` `Est_Correction_derive` TINYINT(1) NULL DEFAULT 0;

-- t_lieu_planning
ALTER TABLE `t_lieu_planning` CHANGE COLUMN `est_Id_Jour` `Est_Id_Jour` TINYINT(1) NULL;
ALTER TABLE `t_lieu_planning` CHANGE COLUMN `est_Actif` `Est_Actif` TINYINT(1) NULL DEFAULT 1;

-- t_lieu_tel_num
ALTER TABLE `t_lieu_tel_num` CHANGE COLUMN `est_Via_Telephone` `Est_Via_Telephone` TINYINT(1) NULL;
ALTER TABLE `t_lieu_tel_num` CHANGE COLUMN `est_Via_Email` `Est_Via_Email` TINYINT(1) NULL;

-- t_module_type
ALTER TABLE `t_module_type` CHANGE COLUMN `est_Flag_Affiche_Plan` `Est_Flag_Affiche_Plan` TINYINT(1) NULL DEFAULT 0;

-- t_plan
ALTER TABLE `t_plan` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;

-- t_profil
ALTER TABLE `t_profil` CHANGE COLUMN `est_MC2` `Est_MC2` TINYINT(1) NULL DEFAULT 0;

-- t_site
ALTER TABLE `t_site` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;

-- t_sonde
ALTER TABLE `t_sonde` CHANGE COLUMN `est_Sonde_Reformee` `Est_Sonde_Reformee` TINYINT(1) NULL;

-- t_sonde_type
ALTER TABLE `t_sonde_type` CHANGE COLUMN `est_Gestion_Relais` `Est_Gestion_Relais` TINYINT(1) NULL;

-- t_utilisateur
ALTER TABLE `t_utilisateur` CHANGE COLUMN `est_Archive` `Est_Archive` TINYINT(1) NULL DEFAULT 0;
ALTER TABLE `t_utilisateur` CHANGE COLUMN `est_Mot_De_Passe_Temporaire` `Est_Mot_De_Passe_Temporaire` TINYINT(1) NULL DEFAULT 0;

-- t_actionneur_type
ALTER TABLE `t_actionneur_type` CHANGE COLUMN `est_Gere_Relais` `Gere_Relais` TINYINT(1) NULL DEFAULT 0;

-- t_sonde_type_mesure
ALTER TABLE `t_sonde_type_mesure` CHANGE COLUMN `est_Flag_Relais` `Est_Flag_Relais` TINYINT(1) NULL;
ALTER TABLE `t_sonde_type_mesure` CHANGE COLUMN `est_Flag_Affiche_Information` `Est_Flag_Affiche_Information` TINYINT(1) NULL;

-- t_etalon_type
ALTER TABLE `t_etalon_type` CHANGE COLUMN `est_Saisie_Module` `Est_Saisie_Module` TINYINT(1) NULL;
ALTER TABLE `t_etalon_type` CHANGE COLUMN `est_Sonde_Externe` `Est_Sonde_Externe` TINYINT(1) NULL;


-- === DB-MESURE (schema: db-mesure) ===
USE vigitemp_mesures_ifb;

-- tm_datalogger_mesures
ALTER TABLE `tm_datalogger_mesures` CHANGE COLUMN `est_Est_Hors_Consignes` `Est_Hors_Consignes` TINYINT(1) NULL;
ALTER TABLE `tm_datalogger_mesures` CHANGE COLUMN `est_Est_En_Alarme` `Est_En_Alarme` TINYINT(1) NULL;
ALTER TABLE `tm_datalogger_mesures` CHANGE COLUMN `est_Marqueur` `Est_Marqueur` TINYINT(1) NULL;

-- tm_mesures
ALTER TABLE `tm_mesures` CHANGE COLUMN `est_Etat_Alarme` `Est_Etat_Alarme` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `tm_mesures` CHANGE COLUMN `est_Valeur_Null` `Est_Valeur_Null` TINYINT(1) NOT NULL DEFAULT 0;

-- End of script

-- Rollback: To revert, swap old/new column names in the above ALTER TABLE CHANGE COLUMN statements.
