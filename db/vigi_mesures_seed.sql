CREATE DATABASE IF NOT EXISTS `vigi_mesures` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vigi_mesures`;

-- Active l'event scheduler pour le nettoyage du cache tm_graphique.
-- Requiert les droits SUPER/ADMIN sur MySQL.
SET GLOBAL event_scheduler = ON;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `tm_compteur_id_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_compteur_id_table` (
  `Id_Serveur_BDD` int NOT NULL,
  `Nom_Table` varchar(100) NOT NULL,
  `Compteur_Id` int DEFAULT NULL,
  PRIMARY KEY (`Id_Serveur_BDD`,`Nom_Table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_datalogger_mesures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_datalogger_mesures` (
  `Id_Datalogger_Mesures` int NOT NULL,
  `Id_Reception` int DEFAULT NULL,
  `Date_Heure_Mesure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Valeur` float DEFAULT NULL,
  `Est_Hors_Consignes` tinyint DEFAULT NULL,
  `Est_En_Alarme` tinyint DEFAULT NULL,
  `Est_Marqueur` tinyint DEFAULT NULL,
  `Details` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Mesures`),
  KEY `IDX_Id_Reception` (`Id_Reception`),
  KEY `IDX_Date_Heure_Mesure` (`Date_Heure_Mesure`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_graphique`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_graphique` (
  `Id_Graphique` int NOT NULL,
  `Date_Heure_Mesure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Nb_Decimal` int DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Id_Sonde` int DEFAULT NULL,
  `Id_Lieu` int NOT NULL,
  `Est_Valeur_Null` tinyint(1) NOT NULL DEFAULT '0',
  `Frequence` int DEFAULT NULL,
  `Est_Etat_Alarme` tinyint NOT NULL DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  PRIMARY KEY (`Id_Graphique`,`Date_Heure_Mesure`,`Id_Lieu`,`Est_Valeur_Null`,`Est_Etat_Alarme`),
  KEY `IDX_Date_Heure_Mesure` (`Date_Heure_Mesure`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Etat_Alarme` (`Est_Etat_Alarme`),
  KEY `IDX_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Id_Sonde_Date_Heure_Mesure` (`Id_Sonde`,`Date_Heure_Mesure` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_journal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal` (
  `Id_Serveur_BDD` int NOT NULL,
  `Id_Journal` int NOT NULL,
  `Code_Journal` varchar(50) DEFAULT NULL,
  `Commentaire` longtext,
  `Nom_Utilisateur` varchar(50) DEFAULT NULL,
  `Profil_Utilisateur` varchar(50) DEFAULT NULL,
  `Date_Heure_Journal` datetime DEFAULT NULL,
  `Id_Lieu` int DEFAULT NULL,
  `Commentaire_Utilisateur` longtext,
  PRIMARY KEY (`Id_Serveur_BDD`,`Id_Journal`),
  KEY `IDX_Code_Journal` (`Code_Journal`),
  KEY `IDX_Nom_Utilisateur` (`Nom_Utilisateur`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`),
  KEY `IDX_Date_Heure_Journal` (`Date_Heure_Journal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_journal_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal_code` (
  `Code_Journal` varchar(50) NOT NULL,
  `Commentaire` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Code_Journal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_journal_histo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal_histo` (
  `Id_Journal_Histo` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Id_Journal` int NOT NULL DEFAULT '0',
  `Code_Journal` varchar(50) DEFAULT '',
  `Commentaire` longtext,
  `Nom_Utilisateur` varchar(50) DEFAULT '',
  `Profil_Utilisateur` varchar(50) DEFAULT '',
  `Date_Heure_Journal` datetime DEFAULT NULL,
  `Id_Lieu` int DEFAULT NULL,
  `Commentaire_Utilisateur` longtext,
  PRIMARY KEY (`Id_Journal_Histo`,`Id_Serveur_BDD`,`Id_Journal`),
  KEY `IDX_Code_Journal` (`Code_Journal`),
  KEY `IDX_Nom_Utilisateur` (`Nom_Utilisateur`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`),
  KEY `IDX_Date_Heure_Journal` (`Date_Heure_Journal`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesure_calibrage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesure_calibrage` (
  `Id_Mesure_Calibrage` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur` float NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL DEFAULT '0',
  `Sonde_Numero_Serie` varchar(50) NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Mesure_Calibrage`,`Id_Serveur_BDD`),
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesure_calibrage_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesure_calibrage_etalon` (
  `Id_Mesure_Calibrage_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur` float NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL DEFAULT '0',
  `Etalon_Numero_Serie` varchar(50) NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Mesure_Calibrage_Etalon`,`Id_Serveur_BDD`),
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesure_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesure_etalon` (
  `Id_Mesure_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Etalon_Numero_Serie` varchar(50) NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` datetime NOT NULL,
  `Message_Erreur` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`Id_Mesure_Etalon`,`Id_Serveur_BDD`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Message_Erreur` (`Message_Erreur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesure_etalonnage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesure_etalonnage` (
  `Id_Mesure_Etalonnage` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Sonde_Numero_serie` varchar(50) DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Mesure_Sonde` float DEFAULT NULL,
  `Mesure_Etalon` float DEFAULT NULL,
  `Date_Heure` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Mesure_Etalonnage`,`Id_Serveur_BDD`),
  KEY `IDX_Sonde_Numero_serie` (`Sonde_Numero_serie`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures` (
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Id_Mesure` int NOT NULL DEFAULT '0',
  `Date_Heure_Mesure` datetime NOT NULL,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Nb_Decimal` int DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Id_Lieu` int NOT NULL DEFAULT '0',
  `Est_Valeur_Null` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Valeur_Memoire` tinyint(1) NOT NULL DEFAULT '0',
  `Frequence` int DEFAULT NULL,
  `Est_Etat_Alarme` tinyint(1) NOT NULL DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Moyenne` float DEFAULT NULL,
  `Rssi` int DEFAULT NULL,
  `Tension` float DEFAULT NULL,
  PRIMARY KEY (`Id_Serveur_BDD`,`Id_Mesure`,`Date_Heure_Mesure`,`Id_Lieu`,`Est_Valeur_Null`),
  KEY `IDX_Date_Heure_Mesure` (`Date_Heure_Mesure`),
  KEY `IDX_Est_Etat_Alarme` (`Est_Etat_Alarme`),
  KEY `Mesure_Numero_lieu_IDX` (`Id_Lieu`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `Mesure_lieu` (`Id_Lieu`),
  KEY `IDX_Date_Heure_Mesure_Id_Lieu` (`Date_Heure_Mesure`,`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesures_gso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso` (
  `Id_mesures_gso` int NOT NULL AUTO_INCREMENT,
  `id_capteur` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tep` double DEFAULT NULL,
  `unite` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `date_mesure` datetime NOT NULL,
  `rssi` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tension` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_capteur`,`date_mesure`),
  KEY `Id_mesures_gso` (`Id_mesures_gso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesures_histo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_histo` (
  `Id_Mesure` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Date_Heure_Mesure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Nb_decimal` tinyint DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) DEFAULT '',
  `Sonde_Numero_Serie` varchar(50) DEFAULT '',
  `Id_Lieu` int NOT NULL DEFAULT '0',
  `Est_Valeur_Null` tinyint NOT NULL DEFAULT '0',
  `Frequence` int DEFAULT NULL,
  `Est_En_Alarme` tinyint(1) DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Moyenne` float DEFAULT NULL,
  PRIMARY KEY (`Id_Mesure`,`Id_Serveur_BDD`,`Date_Heure_Mesure`,`Id_Lieu`,`Est_Valeur_Null`),
  KEY `IDX_Date_Heure_Mesure` (`Date_Heure_Mesure`),
  KEY `IDX_Est_En_Alarme` (`Est_En_Alarme`),
  KEY `Mesure_Numero_lieu_IDX` (`Id_Lieu`),
  KEY `IDX_Date_Heure_Mesure_Id_Lieu` (`Date_Heure_Mesure`,`Id_Lieu`),
  KEY `Mesure_lieu` (`Id_Lieu`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesures_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_test` (
  `Id_Mesure_Test` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Sonde_Numero_Serie` varchar(50) NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Nombre_Total` int NOT NULL DEFAULT '0',
  `Nombre_Recu` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Mesure_Test`,`Id_Serveur_BDD`),
  UNIQUE KEY `Sonde` (`Sonde_Numero_Serie`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Nombre_Total` (`Nombre_Total`),
  KEY `IDX_Nombre_Recu` (`Nombre_Recu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mesures_test_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_test_etalon` (
  `Id_Mesure_Test_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Etalon_Numero_Serie` varchar(50) NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Nombre_Total` int NOT NULL DEFAULT '0',
  `Nombre_Recu` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Mesure_Test_Etalon`,`Id_Serveur_BDD`),
  UNIQUE KEY `Etalon` (`Etalon_Numero_Serie`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Nombre_Total` (`Nombre_Total`),
  KEY `IDX_Nombre_Recu` (`Nombre_Recu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_mode_degrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mode_degrade` (
  `Id_Mode_Degrade` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Date_Heure_Creation` datetime DEFAULT NULL,
  `Requete_SQL` varchar(500) DEFAULT NULL,
  `Est_Archivee` tinyint(1) NOT NULL DEFAULT '0',
  `Date_Heure_Archive` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Mode_Degrade`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tm_parametre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_parametre` (
  `Id_Parametre` int NOT NULL AUTO_INCREMENT,
  `Cle_Parametre` varchar(20) NOT NULL DEFAULT '',
  `Valeur_Parametre` varchar(50) DEFAULT NULL,
  `Groupe_Parametre` varchar(50) DEFAULT NULL,
  `Commentaire_Parametre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id_Parametre`,`Cle_Parametre`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
SET FOREIGN_KEY_CHECKS=1;

-- Cache tm_graphique: garder 150 mesures par sonde (nettoyage périodique)
-- NOTE: nécessite l'event_scheduler activé côté MySQL.
DROP EVENT IF EXISTS `evt_trim_tm_graphique`;
CREATE EVENT `evt_trim_tm_graphique`
ON SCHEDULE EVERY 5 MINUTE
DO
  WITH ranked AS (
    SELECT
      Id_Graphique,
      Date_Heure_Mesure,
      Id_Lieu,
      Est_Valeur_Null,
      Est_Etat_Alarme,
      ROW_NUMBER() OVER (
        PARTITION BY Id_Sonde
        ORDER BY Date_Heure_Mesure DESC, Id_Graphique DESC
      ) AS rn
    FROM tm_graphique
  )
  DELETE g
  FROM tm_graphique g
  JOIN ranked r
    ON g.Id_Graphique = r.Id_Graphique
   AND g.Date_Heure_Mesure = r.Date_Heure_Mesure
   AND g.Id_Lieu = r.Id_Lieu
   AND g.Est_Valeur_Null = r.Est_Valeur_Null
   AND g.Est_Etat_Alarme = r.Est_Etat_Alarme
  WHERE r.rn > 150;

SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `tm_journal_code` VALUES ('AACT','Association d\'un module d\'alarme %1'),('ACQ','Acquitter les alarmes'),('ACT','Activer la surveillance'),('ACTU','Réactivation de l\'utilisateur %1'),('AJE','Ajoute évènement manuel'),('ARC','Archivage des données %1 %2'),('AS','Arrêt de la surveillance'),('AT','Activation de la surveillance téléphonique %1'),('CA','Démarrage d\'un calibrage pour la sonde'),('CC','Changement sur un élement %1'),('CDA','Changement d\'état du datalogger %1'),('CF','Changement de fréquence %1'),('CONNEXION','Connexion de l\'utilisateur %1'),('CR','Changement de retard d\'alarme %1'),('CS','Changement de sonde %1'),('DECONNEXION','Déconnexion de l\'utilisateur %1'),('DES','Désactiver la surveillance'),('DS','Démarrage de la surveillance'),('DT','Désactivation de la surveillance téléphonique %1'),('ET','Démarrage d\'un étalonnage pour la sonde'),('FERMSURV','Fermeture de la fenêtre de surveillance'),('MDP','Changement fiche utilisateur %1'),('PS','Le gestionnaire de port série virtuel à été relancé'),('SACT','Suppression du module d\'alarme associé %1'),('TC','Test de connexion de la sonde'),('TEL','Système'),('UT','');
SET FOREIGN_KEY_CHECKS=1;

-- =====================================================================
-- Alignement seed <-> schema Prisma (compatibilite install recente)
-- Version safe MariaDB/MySQL (checks information_schema)
-- =====================================================================
SET @has_tbl := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tm_graphique');
SET @has_col := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tm_graphique' AND column_name = 'Adresse_Sonde');
SET @sql := IF(@has_tbl = 1 AND @has_col = 0,
  'ALTER TABLE `tm_graphique` ADD COLUMN `Adresse_Sonde` VARCHAR(50) NULL AFTER `Sonde_Numero_Serie`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_tbl := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tm_mesures');
SET @has_col := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tm_mesures' AND column_name = 'Adresse_Sonde');
SET @sql := IF(@has_tbl = 1 AND @has_col = 0,
  'ALTER TABLE `tm_mesures` ADD COLUMN `Adresse_Sonde` VARCHAR(50) NULL AFTER `Sonde_Numero_Serie`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col_rssi := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tm_mesures' AND column_name = 'Rssi');
SET @has_col_tension := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tm_mesures' AND column_name = 'Tension');
SET @sql := IF(@has_tbl = 1 AND @has_col_rssi = 1,
  'ALTER TABLE `tm_mesures` MODIFY COLUMN `Rssi` VARCHAR(10) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql := IF(@has_tbl = 1 AND @has_col_tension = 1,
  'ALTER TABLE `tm_mesures` MODIFY COLUMN `Tension` VARCHAR(10) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
