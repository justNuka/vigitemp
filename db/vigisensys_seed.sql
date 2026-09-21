-- Version produit / seed : 0.90.2
-- DDL synchronise sur le dump schema courant du 2026-08-25.
-- Les DEFINER et compteurs AUTO_INCREMENT de production sont volontairement retires.

CREATE DATABASE  IF NOT EXISTS `vigi_chat` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vigi_chat`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Source: schema-only dump of the current VigiSensys databases
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `t_conversation`
--

DROP TABLE IF EXISTS `t_conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_conversation` (
  `Id_Conversation` int NOT NULL AUTO_INCREMENT,
  `Type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Titre` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DM_Key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Conversation`),
  UNIQUE KEY `t_conversation_DM_Key_key` (`DM_Key`),
  KEY `t_conversation_Type_idx` (`Type`),
  KEY `t_conversation_Date_Creation_idx` (`Date_Creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_conversation_participant`
--

DROP TABLE IF EXISTS `t_conversation_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_conversation_participant` (
  `Id_Participant` int NOT NULL AUTO_INCREMENT,
  `Id_Conversation` int NOT NULL,
  `Id_Utilisateur` int NOT NULL,
  `Last_Read_Msg_Id` int DEFAULT NULL,
  `Date_Ajout` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Participant`),
  UNIQUE KEY `t_conversation_participant_Id_Conversation_Id_Utilisateur_key` (`Id_Conversation`,`Id_Utilisateur`),
  KEY `t_conversation_participant_Id_Utilisateur_idx` (`Id_Utilisateur`),
  CONSTRAINT `t_conversation_participant_Id_Conversation_fkey` FOREIGN KEY (`Id_Conversation`) REFERENCES `t_conversation` (`Id_Conversation`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_message`
--

DROP TABLE IF EXISTS `t_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_message` (
  `Id_Message` int NOT NULL AUTO_INCREMENT,
  `Id_Conversation` int NOT NULL,
  `Sender_Id` int NOT NULL,
  `Contenu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Modification` datetime DEFAULT NULL,
  `Date_Suppression` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Message`),
  KEY `t_message_Id_Conversation_Id_Message_idx` (`Id_Conversation`,`Id_Message`),
  KEY `t_message_Date_Creation_idx` (`Date_Creation`),
  CONSTRAINT `t_message_Id_Conversation_fkey` FOREIGN KEY (`Id_Conversation`) REFERENCES `t_conversation` (`Id_Conversation`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_message_attachment`
--

DROP TABLE IF EXISTS `t_message_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_message_attachment` (
  `Id_Attachment` int NOT NULL AUTO_INCREMENT,
  `Id_Message` int NOT NULL,
  `File_Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `File_Path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `File_Size` int NOT NULL,
  `Mime_Type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date_Upload` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Attachment`),
  KEY `IDX_t_message_attachment_Id_Message` (`Id_Message`),
  CONSTRAINT `FK_t_message_attachment_message` FOREIGN KEY (`Id_Message`) REFERENCES `t_message` (`Id_Message`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'vigi_chat'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


CREATE DATABASE  IF NOT EXISTS `vigi_main` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vigi_main`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Source: schema-only dump of the current VigiSensys databases
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `liste_clients`
--

DROP TABLE IF EXISTS `liste_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liste_clients` (
  `Id_Client` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Num_Compte` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VigiServ_Derniere_Date_Heure` datetime DEFAULT NULL,
  `Vigitel_Derniere_Date_Heure` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Client`),
  UNIQUE KEY `UK_Num_Compte` (`Num_Compte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_actionneur`
--

DROP TABLE IF EXISTS `t_actionneur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_actionneur` (
  `Id_Actionneur` int NOT NULL AUTO_INCREMENT,
  `Num_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type` int DEFAULT NULL,
  `Est_Etat` tinyint(1) DEFAULT '0',
  `Est_Demande` tinyint(1) DEFAULT '0',
  `Commentaire` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Port_Serie` int DEFAULT NULL,
  `Id_Module` int DEFAULT NULL,
  `Relai_1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_3` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_4` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Test` tinyint(1) DEFAULT '0',
  `Libelle_Erreur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Id_Worker` int DEFAULT '1',
  PRIMARY KEY (`Id_Actionneur`),
  KEY `IDX_Num_Serie` (`Num_Serie`),
  KEY `IDX_Type` (`Type`),
  KEY `IDX_Est_Etat` (`Est_Etat`),
  KEY `IDX_Id_Module` (`Id_Module`),
  KEY `IDX_Id_Plan` (`Id_Plan`),
  CONSTRAINT `FK_PLAN_ACTIONNEUR` FOREIGN KEY (`Id_Plan`) REFERENCES `t_plan` (`Id_Plan`),
  CONSTRAINT `FK_TYPE_ACTIONNEUR` FOREIGN KEY (`Type`) REFERENCES `t_actionneur_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_actionneur_type`
--

DROP TABLE IF EXISTS `t_actionneur_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_actionneur_type` (
  `Id_Actionneur_Type` int NOT NULL AUTO_INCREMENT,
  `Type` int DEFAULT NULL,
  `Description` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Gere_Relais` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Actionneur_Type`),
  UNIQUE KEY `Type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_ajustage`
--

DROP TABLE IF EXISTS `t_ajustage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ajustage` (
  `Id_Ajustage` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Ajustage` datetime DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Coeff_X2` float DEFAULT '0',
  `Coeff_X` float DEFAULT NULL,
  `Coeff_Constant` float DEFAULT NULL,
  `Coeffs_Modifies_Depuis_Derniere_Mesure` tinyint(1) NOT NULL DEFAULT '0',
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nb_Decimale` int DEFAULT NULL,
  `Operateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SE_Numero` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SE_Organisme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SE_Date_Certif` date DEFAULT NULL,
  `SE_Numero_Certif` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Mesure_Etalon1` float DEFAULT NULL,
  `Mesure_Etalon2` float DEFAULT NULL,
  `Valeur_Brute1` float DEFAULT NULL,
  `Valeur_Brute2` float DEFAULT NULL,
  `Ancienne_Mesure1` float DEFAULT NULL,
  `Ancienne_Mesure2` float DEFAULT NULL,
  `Nouvelle_Mesure1` float DEFAULT NULL,
  `Nouvelle_Mesure2` float DEFAULT NULL,
  `Id_Milieu` int DEFAULT NULL,
  PRIMARY KEY (`Id_Ajustage`) USING BTREE,
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_SE_Numero` (`SE_Numero`),
  KEY `IDX_Date_Heure_Calibrage` (`Date_Heure_Ajustage`) USING BTREE,
  KEY `IDX_Id_Bain` (`Id_Milieu`) USING BTREE,
  KEY `idx_ajustage_sonde_date` (`Sonde_Numero_Serie`,`Date_Heure_Ajustage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alarme`
--

DROP TABLE IF EXISTS `t_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme` (
  `Id_Alarme` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Debut` datetime DEFAULT NULL,
  `Valeur` float DEFAULT NULL,
  `Type` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Fin` datetime DEFAULT NULL,
  `Id_Lieu` int DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Acquittee` tinyint(1) DEFAULT '0',
  `Date_Heure_Derniere_Mesure` datetime DEFAULT NULL,
  `Est_Alarme_Pour_VigiTel` tinyint(1) DEFAULT '0',
  `Est_Mail_Envoye` tinyint(1) DEFAULT NULL,
  `Est_Mail_Fin_Envoye` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Tel_Acquittee` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id_Alarme`),
  KEY `IDX_Date_Heure_Debut` (`Date_Heure_Debut`),
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Type` (`Type`),
  KEY `IDX_Date_Heure_Fin` (`Date_Heure_Fin`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Est_Acquittee` (`Est_Acquittee`),
  KEY `IDX_Date_Heure_Derniere_Mesure` (`Date_Heure_Derniere_Mesure`),
  CONSTRAINT `FK_LIEU_ALARME` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_GSO_BEF_DEL_ALARME` BEFORE DELETE ON `t_alarme` FOR EACH ROW BEGIN

INSERT INTO t_alarme_histo

(Id_Alarme,Date_Heure_Debut,Valeur,`Type`,Date_Heure_Fin,Id_Lieu,Sonde_Numero_Serie,Unite,Est_Acquittee,Date_Heure_Derniere_Mesure,Est_Alarme_Pour_VigiTel,Est_Mail_Envoye,Est_Tel_Acquittee,Date_Heure_Acquittement)

VALUES

(OLD.Id_Alarme, OLD.Date_Heure_Debut, OLD.Valeur, OLD.`Type`, OLD.Date_Heure_Fin, OLD.Id_Lieu, OLD.Sonde_Numero_Serie, OLD.Unite, OLD.Est_Acquittee, OLD.Date_Heure_Derniere_Mesure, OLD.Est_Alarme_Pour_VigiTel,

OLD.Est_Mail_Envoye, OLD.Est_Tel_Acquittee, NOW());

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `t_alarme_histo`
--

DROP TABLE IF EXISTS `t_alarme_histo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme_histo` (
  `Id_Alarme_Histo` int NOT NULL AUTO_INCREMENT,
  `Id_Alarme` int NOT NULL,
  `Date_Heure_Debut` datetime DEFAULT NULL,
  `Valeur` float DEFAULT NULL,
  `Type` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Fin` datetime DEFAULT NULL,
  `Est_Alarme_Vrai` tinyint(1) DEFAULT '0',
  `Id_Lieu` int DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Acquittee` tinyint(1) DEFAULT '0',
  `Date_Heure_Derniere_Mesure` datetime DEFAULT NULL,
  `Date_Heure_Debut_Alarme_Vrai` datetime DEFAULT NULL,
  `Est_Alarme_Pour_VigiTel` tinyint(1) DEFAULT NULL,
  `Est_Mail_Envoye` tinyint(1) DEFAULT NULL,
  `Est_Tel_Acquittee` tinyint(1) DEFAULT NULL,
  `Date_Heure_Acquittement` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Alarme_Histo`),
  KEY `Id_Alarme_Histo` (`Id_Alarme_Histo`),
  KEY `IDX_HISTO_Est_Acquittee` (`Est_Acquittee`),
  KEY `IDX_HISTO_Est_Alarme_Vrai` (`Est_Alarme_Vrai`),
  KEY `IDX_HISTO_Date_Heure_Debut` (`Date_Heure_Debut`),
  KEY `IDX_HISTO_Date_Heure_Fin` (`Date_Heure_Fin`),
  KEY `IDX_HISTO_Date_Heure_Debut_Alarme_Vrai` (`Date_Heure_Debut_Alarme_Vrai`),
  KEY `IDX_HISTO_Date_Heure_Derniere_Mesure` (`Date_Heure_Derniere_Mesure`),
  KEY `IDX_HISTO_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_HISTO_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_HISTO_Type` (`Type`),
  KEY `IDX_HISTO_Unite` (`Unite`),
  KEY `IDX_HISTO_Valeur` (`Valeur`),
  KEY `IDX_HISTO_Id_Alarme` (`Id_Alarme`),
  CONSTRAINT `FK_LIEU_ALARME_HISTO` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_alarme_message`
--

DROP TABLE IF EXISTS `t_alarme_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme_message` (
  `Id_Alarme_Message` int NOT NULL AUTO_INCREMENT,
  `Code_Alarme_Message` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Texte_Message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id_Alarme_Message`),
  UNIQUE KEY `CodeAlarmeMessage` (`Code_Alarme_Message`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_ancien_mot_de_passe`
--

DROP TABLE IF EXISTS `t_ancien_mot_de_passe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ancien_mot_de_passe` (
  `Id_Ancien_Mot_De_Passe` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Mot_De_Passe` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Premiere_Connexion` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Ancien_Mot_De_Passe`),
  KEY `IDX_Id_Utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_UTILISATEUR_ANCIEN_MDP` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_UTILISATEUR_ANCIENMDP` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_autorisation`
--

DROP TABLE IF EXISTS `t_autorisation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_autorisation` (
  `Id_Autorisation` int NOT NULL AUTO_INCREMENT,
  `Code_Autorisation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Libelle_Autorisation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commentaire` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Autorisation`),
  KEY `IDX_Code_Autorisation` (`Code_Autorisation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_certif`
--

DROP TABLE IF EXISTS `t_certif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_certif` (
  `Id_Certif` int NOT NULL AUTO_INCREMENT,
  `Numero` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Organisme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_PDF` int DEFAULT NULL,
  PRIMARY KEY (`Id_Certif`),
  KEY `IDX_Numero` (`Numero`),
  KEY `IDX_Organisme` (`Organisme`),
  KEY `IDX_Date` (`Date`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Id_PDF` (`Id_PDF`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_certif_mesure`
--

DROP TABLE IF EXISTS `t_certif_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_certif_mesure` (
  `Id_Certif_Mesure` int NOT NULL AUTO_INCREMENT,
  `Id_Certif` int DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Temperature_Vraie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Temperature_Reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Incertitude` float DEFAULT NULL,
  PRIMARY KEY (`Id_Certif_Mesure`),
  KEY `IDX_Id_Certif` (`Id_Certif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_commande_materiel`
--

DROP TABLE IF EXISTS `t_commande_materiel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_commande_materiel` (
  `Id_Commande_Materiel` int NOT NULL AUTO_INCREMENT,
  `Reference_Commande` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_Utilisateur` int NOT NULL,
  `Nom_Demandeur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email_Demandeur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email_Commercial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Mode_Transmission` enum('SMTP','MAILTO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Statut_Commande` enum('BROUILLON','ENVOYEE','PREPAREE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BROUILLON',
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Envoi` datetime DEFAULT NULL,
  `Id_Pdf` int DEFAULT NULL,
  PRIMARY KEY (`Id_Commande_Materiel`),
  UNIQUE KEY `UK_t_commande_materiel_reference` (`Reference_Commande`),
  KEY `IX_t_commande_materiel_utilisateur` (`Id_Utilisateur`),
  KEY `IX_t_commande_materiel_pdf` (`Id_Pdf`),
  CONSTRAINT `FK_t_commande_materiel_pdf` FOREIGN KEY (`Id_Pdf`) REFERENCES `t_pdf` (`Id_PDF`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_t_commande_materiel_utilisateur` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_commande_materiel_ligne`
--

DROP TABLE IF EXISTS `t_commande_materiel_ligne`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_commande_materiel_ligne` (
  `Id_Commande_Materiel_Ligne` int NOT NULL AUTO_INCREMENT,
  `Id_Commande_Materiel` int NOT NULL,
  `Id_Materiel` int NOT NULL,
  `Ref_Commercial` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Descriptif` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Gamme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Quantite` int NOT NULL,
  PRIMARY KEY (`Id_Commande_Materiel_Ligne`),
  KEY `IX_t_commande_materiel_ligne_commande` (`Id_Commande_Materiel`),
  KEY `IX_t_commande_materiel_ligne_materiel` (`Id_Materiel`),
  CONSTRAINT `FK_t_commande_materiel_ligne_commande` FOREIGN KEY (`Id_Commande_Materiel`) REFERENCES `t_commande_materiel` (`Id_Commande_Materiel`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_t_commande_materiel_ligne_materiel` FOREIGN KEY (`Id_Materiel`) REFERENCES `t_materiel` (`Id_Materiel`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_commentaire_acquittement_alarme`
--

DROP TABLE IF EXISTS `t_commentaire_acquittement_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_commentaire_acquittement_alarme` (
  `Id_Commentaire` int NOT NULL AUTO_INCREMENT,
  `Type_Commentaire` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Texte` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Commentaire`),
  KEY `IDX_Type_Commentaire` (`Type_Commentaire`),
  KEY `IDX_Texte` (`Texte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_etalon`
--

DROP TABLE IF EXISTS `t_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalon` (
  `Id_Etalon` int NOT NULL AUTO_INCREMENT,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Etat_Etalon` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Port_Serie` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Sonde_Externe` tinyint(1) DEFAULT NULL,
  `Coeff_A` float DEFAULT NULL,
  `Coeff_B` float DEFAULT NULL,
  `Coeff_C` float DEFAULT NULL,
  `Incertitude_Max` float DEFAULT NULL,
  `Nb_Decimale` int DEFAULT NULL,
  `Reserve_MC2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Worker` int DEFAULT NULL,
  `Id_Module` int DEFAULT NULL,
  PRIMARY KEY (`Id_Etalon`),
  UNIQUE KEY `EtalonNumeroSerie_IDX` (`Etalon_Numero_Serie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_etalon_type`
--

DROP TABLE IF EXISTS `t_etalon_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalon_type` (
  `Type_Etalon` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Descriptif` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Saisie_Module` tinyint(1) DEFAULT '0',
  `Est_Sonde_Externe` tinyint(1) DEFAULT '0',
  `Resolution` float DEFAULT NULL,
  PRIMARY KEY (`Type_Etalon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_etalonnage`
--

DROP TABLE IF EXISTS `t_etalonnage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalonnage` (
  `Id_Etalonnage` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Etalonnage` datetime DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Validite` date DEFAULT NULL,
  `Duree_Validite_Jours` int DEFAULT NULL,
  `Valide` datetime DEFAULT NULL,
  `Operateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Certif` date DEFAULT NULL,
  `Organisme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Num_Certif` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Incertitude` float DEFAULT NULL,
  `Moyenne_Etalon` float DEFAULT NULL,
  `Moyenne_Sonde` float DEFAULT NULL,
  `Repetabilite` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Bain` int DEFAULT NULL,
  `Err_Justesse` float DEFAULT NULL,
  PRIMARY KEY (`Id_Etalonnage`),
  KEY `IDX_Date_Heure_Etalonnage` (`Date_Heure_Etalonnage`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Date_Certif` (`Date_Certif`),
  KEY `IDX_Organisme` (`Organisme`),
  KEY `IDX_Num_Certif` (`Num_Certif`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Moyenne_Etalon` (`Moyenne_Etalon`),
  KEY `IDX_Moyenne_Sonde` (`Moyenne_Sonde`),
  KEY `IDX_Repetabilite` (`Repetabilite`),
  KEY `IDX_Id_Bain` (`Id_Bain`),
  KEY `IDX_Incertitude` (`Incertitude`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_etalonnage_mesure`
--

DROP TABLE IF EXISTS `t_etalonnage_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalonnage_mesure` (
  `Id_Etalonnage_Mesure_Sonde` int NOT NULL AUTO_INCREMENT,
  `Id_Etalonnage` int DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Mesure_Sonde` float DEFAULT NULL,
  `Mesure_Etalon` float DEFAULT NULL,
  PRIMARY KEY (`Id_Etalonnage_Mesure_Sonde`),
  KEY `IDX_Id_Etalonnage` (`Id_Etalonnage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_etat_surveillance`
--

DROP TABLE IF EXISTS `t_etat_surveillance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etat_surveillance` (
  `Id_Surveillance_Etat` int NOT NULL AUTO_INCREMENT,
  `Surveillance_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Surveillance_Etat_Libelle` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Surveillance_Etat`),
  UNIQUE KEY `t_etat_surveillance_Surveillance_Etat_key` (`Surveillance_Etat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_groupe`
--

DROP TABLE IF EXISTS `t_groupe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_groupe` (
  `Id_Groupe` int NOT NULL AUTO_INCREMENT,
  `Nom_Groupe` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Numero_Regroupement` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Groupe`),
  UNIQUE KEY `Groupe_NomGroupe_IDX` (`Nom_Groupe`),
  KEY `IDX_Numero_Regroupement` (`Numero_Regroupement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_liaison_profil_autorisation`
--

DROP TABLE IF EXISTS `t_liaison_profil_autorisation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_liaison_profil_autorisation` (
  `Id_Profil` int NOT NULL,
  `Id_Autorisation` int NOT NULL,
  PRIMARY KEY (`Id_Profil`,`Id_Autorisation`),
  KEY `IDX_IdProfil` (`Id_Profil`),
  KEY `IDX_IdAutorisation` (`Id_Autorisation`),
  CONSTRAINT `FK_AUTORISATION_LIAISON` FOREIGN KEY (`Id_Autorisation`) REFERENCES `t_autorisation` (`Id_Autorisation`),
  CONSTRAINT `FK_PROFIL_LIAISON` FOREIGN KEY (`Id_Profil`) REFERENCES `t_profil` (`Id_Profil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_liaison_utilisateur_groupe`
--

DROP TABLE IF EXISTS `t_liaison_utilisateur_groupe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_liaison_utilisateur_groupe` (
  `Id_Liaison_u_g` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int NOT NULL,
  `Id_Groupe` int DEFAULT NULL,
  PRIMARY KEY (`Id_Liaison_u_g`),
  KEY `IDX_IdUtilisateur` (`Id_Utilisateur`),
  KEY `IDX_IdGroupe` (`Id_Groupe`),
  CONSTRAINT `FK_GROUPE_LIAISON_UTILISATEUR` FOREIGN KEY (`Id_Groupe`) REFERENCES `t_groupe` (`Id_Groupe`),
  CONSTRAINT `FK_UTILISATEUR_LIAISON` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_liaison_utilisateur_site`
--

DROP TABLE IF EXISTS `t_liaison_utilisateur_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_liaison_utilisateur_site` (
  `Id_Liaison` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  `Date_Affectation` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Liaison`),
  UNIQUE KEY `UK_USER_SITE` (`Id_Utilisateur`,`Id_Site`),
  KEY `IDX_IdUtilisateur` (`Id_Utilisateur`),
  KEY `IDX_IdSite` (`Id_Site`),
  KEY `IDX_DateAffectation` (`Date_Affectation`),
  CONSTRAINT `FK_SITE_LIAISON_UTILISATEUR` FOREIGN KEY (`Id_Site`) REFERENCES `t_site` (`Id_Site`) ON DELETE CASCADE,
  CONSTRAINT `FK_UTILISATEUR_LIAISON_SITE` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu`
--

DROP TABLE IF EXISTS `t_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu` (
  `Id_Lieu` int NOT NULL AUTO_INCREMENT,
  `Id_Site` int DEFAULT NULL,
  `Nom_Lieu` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Observations_Info` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Consigne_Sup` float DEFAULT NULL,
  `Tolerance_Surveillance_Sup` float DEFAULT NULL,
  `Est_Consigne_Sup_Active` tinyint(1) DEFAULT '0',
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Est_Consigne_Sup_Pre_Alarme_Active` tinyint(1) DEFAULT '0',
  `Seuil_Critique_Haut` float DEFAULT NULL,
  `Est_Seuil_Critique_Haut_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Consigne_Inf` float DEFAULT NULL,
  `Tolerance_Surveillance_Inf` float DEFAULT NULL,
  `Est_Consigne_Inf_Active` tinyint(1) DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Est_Consigne_Inf_Pre_Alarme_Active` tinyint(1) DEFAULT '0',
  `Seuil_Critique_Bas` float DEFAULT NULL,
  `Est_Seuil_Critique_Bas_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Frequence` int DEFAULT NULL,
  `Lieu_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'D',
  `Retard_Alarme_Haut` int DEFAULT NULL,
  `Retard_Alarme_Bas` int DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Date_Creation` datetime DEFAULT (now()),
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Est_Tel_Actif` tinyint(1) DEFAULT '0',
  `Tel_Code` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_Son_Lieu` varchar(260) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Actionneur` int DEFAULT NULL,
  `Est_Mode_Serotheque` tinyint(1) DEFAULT '0',
  `Coef_Sensibilite` int DEFAULT NULL,
  `Id_PDF` int DEFAULT NULL,
  `Est_DataLogger` tinyint(1) DEFAULT '0',
  `EMT` float DEFAULT NULL COMMENT 'Coefficient EMT',
  `EMT_Choix_Mode` int DEFAULT '4',
  `EMT_Sonde` float DEFAULT NULL,
  `Retard_Alarme_Changement_Consigne` int DEFAULT NULL,
  `Derniere_Date_Heure` datetime DEFAULT NULL,
  `Derniere_Valeur` float DEFAULT NULL,
  `Derniere_Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_Nb_Decimal` int DEFAULT '2',
  `Est_Lieu_En_Alarme` tinyint DEFAULT '0',
  `Est_Lieu_Alarme_Terminee_Non_Acquittee` tinyint DEFAULT '0',
  `Est_Auto_Acquittement_Non_Reponse` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Lieu_Alarme_Terminee_Non_Acquittee_T1` tinyint DEFAULT '0' COMMENT 'Etat transitoire : 1 si un lieu en alarme terminee non acquittee passe en pre-alarme. Permet de ne pas perdre cet etat precedent.',
  `Est_Lieu_En_Pre_Alarme` tinyint DEFAULT '0',
  `Id_Alarme` int DEFAULT '0',
  `Lieu_Etat_N1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_Date_Etalonnage` date DEFAULT NULL,
  `Derniere_Erreur_Justesse` float DEFAULT NULL,
  `Derniere_Incertitude` float DEFAULT NULL,
  `Retard_Non_Reponse` int DEFAULT '60' COMMENT 'Retard de non-réponse de la sonde en minutes, 60 par défaut',
  `Date_Heure_Derniere_Reponse` datetime DEFAULT NULL COMMENT 'Date/Heure dernière vraie réponse sonde (hors ou dans tolérances)',
  `Date_Heure_Derniere_Reponse_Recue_OK` datetime DEFAULT NULL COMMENT 'Date/Heure dernière vraie réponse sonde dans les tolérances',
  `Est_Correction_Ej` tinyint DEFAULT '0',
  `Derive` float DEFAULT '0',
  `Est_Correction_derive` tinyint(1) DEFAULT '0',
  `Derniere_Valeur_Null` int DEFAULT '0',
  `Type_Lieu` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Dernier_Acquittement_En_Cours` datetime DEFAULT NULL COMMENT 'Si acquittement alarme en cours = Date/Heure acquittement',
  `Date_Heure_Last_Update_EVT_GSO` datetime DEFAULT NULL COMMENT 'Date/Heure derniere MAJ par EVT_GSO_DERNIERVALEURLIEU',
  `Date_Heure_Reactivation_Alarme` datetime DEFAULT NULL,
  `Notification_Active` tinyint(1) NOT NULL DEFAULT '1',
  `Commentaire` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Infos_Modifiees_Depuis_Derniere_Mesure` tinyint(1) NOT NULL DEFAULT '1',
  `Date_Heure_Reactivation_Surveillance` datetime DEFAULT NULL,
  `Date_Heure_Surveillance_On` datetime DEFAULT NULL,
  `Date_Heure_Surveillance_Off` datetime DEFAULT NULL,
  `Derniere_Val_Rssi` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Derniere_Val_Batterie` int DEFAULT NULL,
  `Derniere_Val_Tension` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Lieu_GSO` tinyint(1) DEFAULT '0' COMMENT '1 pour un lieu surveille par sonde GSO',
  `Est_Son_Alarme_Active` tinyint(1) NOT NULL DEFAULT '1',
  `Est_Redeclenchement_Immediat` tinyint(1) NOT NULL DEFAULT '0',
  `Nb_Mesures_Temporisation_Redeclenchement` int DEFAULT '0',
  `Planning_Actif` tinyint(1) NOT NULL DEFAULT '0',
  `Planning_Source_Regle_Id` int DEFAULT NULL,
  `Planning_Derniere_Maj` datetime DEFAULT NULL,
  `Planning_Regle_Existe` tinyint(1) NOT NULL DEFAULT '0',
  `Consigne_Base` float DEFAULT NULL,
  `Consigne_Sup_Base` float DEFAULT NULL,
  `Consigne_Inf_Base` float DEFAULT NULL,
  `Tolerance_Surveillance_Sup_Base` float DEFAULT NULL,
  `Tolerance_Surveillance_Inf_Base` float DEFAULT NULL,
  `Est_Remontee_Memoire_A_Faire` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Acq_Auto_Alarme_NR` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Lieu`),
  KEY `IDX_Lieu_Etat` (`Lieu_Etat`),
  KEY `IDX_Id_Plan` (`Id_Plan`),
  KEY `IDX_Est_Archive` (`Est_Archive`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Est_Tel_Actif` (`Est_Tel_Actif`),
  KEY `IDX_Tel_Code` (`Tel_Code`),
  KEY `IDX_Tel_Son_Lieu` (`Tel_Son_Lieu`),
  KEY `IDX_Id_Actionneur` (`Id_Actionneur`),
  KEY `IDX_Id_Site` (`Id_Site`),
  KEY `IDX_Id_PDF` (`Id_PDF`),
  KEY `IDX_Nom_Lieu` (`Nom_Lieu`),
  KEY `idx_lieu_gso_etat` (`Est_Lieu_GSO`,`Lieu_Etat`),
  KEY `IDX_Date_Creation` (`Date_Creation`) USING BTREE,
  CONSTRAINT `FK_LIEU_ETAT_SURVEILLANCE` FOREIGN KEY (`Lieu_Etat`) REFERENCES `t_etat_surveillance` (`Surveillance_Etat`),
  CONSTRAINT `FK_PDF_LIEU` FOREIGN KEY (`Id_PDF`) REFERENCES `t_pdf` (`Id_PDF`),
  CONSTRAINT `FK_PLAN_LIEU` FOREIGN KEY (`Id_Plan`) REFERENCES `t_plan` (`Id_Plan`),
  CONSTRAINT `FK_SITE_LIEU` FOREIGN KEY (`Id_Site`) REFERENCES `t_site` (`Id_Site`),
  CONSTRAINT `FK_SONDE_LIEU` FOREIGN KEY (`Sonde_Numero_Serie`) REFERENCES `t_sonde` (`Sonde_Numero_Serie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_GSO_BEF_UPD_LIEU_ALARME` BEFORE UPDATE ON `t_lieu` FOR EACH ROW main_block: BEGIN



    DECLARE v_Id_Alarme INT DEFAULT NULL;

    DECLARE v_TypeAlarme CHAR(1);

    

    /* =========================================================================================

       0. SKIP DE LA LOGIQUE SI ACQUITTEMENT D'ALARME

       ========================================================================================= */

    IF COALESCE(@SKIP_LIEU_ALARM_LOGIC, 0) = 1 THEN

	  LEAVE main_block;

	END IF;

    

    /* =========================================================================================

       0b. SKIP DE LA LOGIQUE NON GSO POUR EVITER DE PASSER LES VERIFS

       ========================================================================================= */

	IF COALESCE(NEW.Est_Lieu_GSO, 0) <> 1 THEN

	  LEAVE main_block;

	END IF;





    /* ==========================================================================================

       1. BLOCAGE APRES ACQUITTEMENT ALARME EN COURS : ne pas redeclencher l'alarme immediatement

       ========================================================================================== */

    IF NEW.Est_Lieu_GSO=1 AND NEW.Date_Heure_Dernier_Acquittement_En_Cours IS NOT NULL

       AND NEW.Derniere_Date_Heure <= NEW.Date_Heure_Dernier_Acquittement_En_Cours

	   AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

    THEN

        SET NEW.Id_Alarme = 0;

        SET NEW.Est_Lieu_En_Alarme = 0;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

        LEAVE main_block;

    END IF;



    /* ==========================================================

       2. RECHERCHE ALARME B/H/N OUVERTE-EN COURS

       ========================================================== */

    SELECT Id_Alarme, Type

    INTO v_Id_Alarme, v_TypeAlarme

    FROM t_alarme

    WHERE Id_Lieu = NEW.Id_Lieu AND NEW.Est_Lieu_GSO = 1

      AND Type IN ('B','H','N')

      AND Date_Heure_Fin IS NULL

    LIMIT 1;	





    /* ==========================================================

       3. CAS : AUCUNE ALARME OUVERTE → CREATION

       ========================================================== */

    IF v_Id_Alarme IS NULL THEN

	

	



        /* --- ALARME BASSE --- */

        IF NEW.Est_Lieu_GSO=1

		AND NEW.Lieu_Etat = 'S'

		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

		AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf

		AND TIMESTAMPDIFF(SECOND,NEW.Date_Heure_Derniere_Reponse_Recue_OK,NEW.Derniere_Date_Heure) >= NEW.Retard_Alarme_Bas * 60

        THEN

            INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Date_Heure_Derniere_Reponse_Recue_OK,

                 NEW.Derniere_Valeur,

                 'B',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

        END IF;



        /* --- ALARME HAUTE --- */

        IF NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse_Recue_OK, NEW.Derniere_Date_Heure) >= NEW.Retard_Alarme_Haut * 60

        THEN

            INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Date_Heure_Derniere_Reponse_Recue_OK,

                 NEW.Derniere_Valeur,

                 'H',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

        END IF;

		

		/* --- ALARME NON REPONSE --- */

		IF NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60

		THEN

            INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Date_Heure_Derniere_Reponse,

                 NULL,

                 'N',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Date_Heure_Last_Update_EVT_GSO,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

			SET NEW.Derniere_Valeur = NULL;

			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

        END IF;

		

		



    /* ==========================================================

       4. CAS : ALARME OUVERTE → SUIVI / TRANSITION / FIN

       ========================================================== */

    ELSE

		

		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=0 > BAS --- */

		IF  v_TypeAlarme = 'N'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

			AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf

			AND NEW.Est_Acq_Auto_Alarme_NR = 0

		THEN

			UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;

			

			INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'B',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

            

      /* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=1 > BAS --- */

		ELSEIF  v_TypeAlarme = 'N'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

			AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf

			AND NEW.Est_Acq_Auto_Alarme_NR = 1

		THEN

			UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;

         DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;

			

			INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'B',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

			

		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=0 > HAUT --- */

		ELSEIF  v_TypeAlarme = 'N'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup

			AND NEW.Est_Acq_Auto_Alarme_NR = 0

		THEN

			UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;

			

			INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'H',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;	

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

            

		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=1 > HAUT --- */

		ELSEIF  v_TypeAlarme = 'N'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60

			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup

			AND NEW.Est_Acq_Auto_Alarme_NR = 1

		THEN

			UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;

            DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;

			

			INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'H',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;	

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;            

		

		/* --- TRANSITION BAS → N --- */

		ELSEIF v_TypeAlarme = 'B'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60

		THEN

            UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;



		INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Date_Heure_Derniere_Reponse,

                 NULL,

                 'N',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Date_Heure_Last_Update_EVT_GSO,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

			SET NEW.Derniere_Valeur = NULL;

			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;



		/* --- TRANSITION HAUT → N --- */

		ELSEIF v_TypeAlarme = 'H'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60

			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60

		THEN

            UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;



		INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Date_Heure_Derniere_Reponse,

                 NULL,

                 'N',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Date_Heure_Last_Update_EVT_GSO,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

			SET NEW.Derniere_Valeur = NULL;

			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

			

		

        /* --- TRANSITION BAS → HAUT --- */

        ELSEIF v_TypeAlarme = 'B'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

           AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup

        THEN

            UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;



            INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'H',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;



        /* --- TRANSITION HAUT → BAS --- */

        ELSEIF v_TypeAlarme = 'H'

			AND NEW.Est_Lieu_GSO=1

			AND NEW.Lieu_Etat = 'S'

           AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf

        THEN

            UPDATE t_alarme

            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

                Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;



            INSERT INTO t_alarme

                (Date_Heure_Debut, Valeur, Type,

                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)

            VALUES

                (NEW.Derniere_Date_Heure,

                 NEW.Derniere_Valeur,

                 'B',

                 NEW.Id_Lieu,

                 NEW.Sonde_Numero_Serie,

                 NEW.Derniere_Date_Heure,

					  NEW.Derniere_Unite);



            SET NEW.Id_Alarme = LAST_INSERT_ID();

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

			

			/* --- ALARME TOUJOURS ACTIVE N --- */

		ELSEIF v_TypeAlarme = 'N'

		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) > NEW.Retard_Non_Reponse * 60

		THEN

		UPDATE t_alarme

		SET Valeur = NULL,

			Date_Heure_Derniere_Mesure = NEW.Date_Heure_Last_Update_EVT_GSO

		WHERE Id_Alarme = v_Id_Alarme;

		

		SET NEW.Id_Alarme = v_Id_Alarme;

		SET NEW.Derniere_Valeur=NULL;

		SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;

		SET NEW.Est_Lieu_En_Alarme = 1;

		SET NEW.Est_Lieu_En_Pre_Alarme = 0;

      SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

      SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

		LEAVE main_block;



        /* --- ALARME TOUJOURS ACTIVE B ou H --- */

        ELSEIF v_TypeAlarme IN ('B','H')

				AND (NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf

					OR NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup)

        THEN

            UPDATE t_alarme

            SET Valeur = NEW.Derniere_Valeur,

                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

            WHERE Id_Alarme = v_Id_Alarme;



            SET NEW.Id_Alarme = v_Id_Alarme;

            SET NEW.Est_Lieu_En_Alarme = 1;

            SET NEW.Est_Lieu_En_Pre_Alarme = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

            LEAVE main_block;

			

        /* --- FIN D’ALARME N, Est_Acq_Auto_Alarme_NR=0  --- */

		ELSEIF v_TypeAlarme = 'N'

		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) < NEW.Retard_Non_Reponse * 60

		AND NEW.Est_Acq_Auto_Alarme_NR=0

		THEN

		UPDATE t_alarme

		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

		WHERE Id_Alarme = v_Id_Alarme;



		SET NEW.Id_Alarme = 0;

		SET NEW.Est_Lieu_En_Alarme = 0;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

		LEAVE main_block;

		

		/* --- FIN D’ALARME N, Est_Acq_Auto_Alarme_NR=1  --- */

		ELSEIF v_TypeAlarme = 'N'

		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) < NEW.Retard_Non_Reponse * 60

		AND NEW.Est_Acq_Auto_Alarme_NR=1

		THEN

		UPDATE t_alarme

		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

		WHERE Id_Alarme = v_Id_Alarme;

		DELETE FROM t_alarme

		WHERE Id_Alarme = v_Id_Alarme;



		SET NEW.Id_Alarme = 0;

		SET NEW.Est_Lieu_En_Alarme = 0;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

		LEAVE main_block;



/* --- FIN D’ALARME B/H --- */

	ELSEIF v_TypeAlarme IN('B','H') THEN 

		UPDATE t_alarme

		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,

        Valeur = NEW.Derniere_Valeur,

        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure

		WHERE Id_Alarme = v_Id_Alarme;



		SET NEW.Id_Alarme = 0;

		SET NEW.Est_Lieu_En_Alarme = 0;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;

		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

		LEAVE main_block;

		

		

        END IF;



    END IF;

    

    IF NEW.Est_Lieu_En_Alarme = 0 THEN

    

    /* =======================================================

		5- CAS DES PRE-ALARMES (BASSE / HAUTE)

	========================================================== */



/* --- PRE-ALARME BASSE --- */

IF NEW.Est_Consigne_Inf_Pre_Alarme_Active = 1 THEN



    /* Entrée en pré-alarme basse d'un lieu en alarme terminee non acquittee */

    IF NEW.Derniere_Valeur < NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1 THEN

        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=0; SET NEW.Est_Lieu_En_Pre_Alarme = 1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;

        

       /* Entrée en pré-alarme basse d'un lieu sans etat d'alarme */

    ELSEIF NEW.Derniere_Valeur < NEW.Consigne_Inf_Pre_Alarme THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 1;     



    /* Sortie de pré-alarme basse (retour zone normale) puis retour a TermineeNonAcquitee */

    ELSEIF NEW.Derniere_Valeur >= NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1 THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 0; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

        

     /* Sortie de pré-alarme basse (retour zone normale) sans retour a TermineeNonAcquitee */

    ELSEIF NEW.Derniere_Valeur >= NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0 THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 0;    

    END IF;



END IF;





/* --- PRE-ALARME HAUTE --- */

IF NEW.Est_Consigne_Sup_Pre_Alarme_Active = 1 THEN



    /* Entrée en pré-alarme haute d'un lieu en alarme terminee non acquittee */

    IF NEW.Derniere_Valeur > NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1 THEN

        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=0; SET NEW.Est_Lieu_En_Pre_Alarme = 1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;

        

       /* Entrée en pré-alarme haute d'un lieu sans etat d'alarme */

    ELSEIF NEW.Derniere_Valeur > NEW.Consigne_Sup_Pre_Alarme THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 1;     



    /* Sortie de pré-alarme haute (retour zone normale) puis retour a TermineeNonAcquitee */

    ELSEIF NEW.Derniere_Valeur <= NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1 THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 0; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;

        

     /* Sortie de pré-alarme haute (retour zone normale) sans retour a TermineeNonAcquitee */

    ELSEIF NEW.Derniere_Valeur <= NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0 THEN

        SET NEW.Est_Lieu_En_Pre_Alarme = 0;    

    END IF;



END IF;



END IF;



END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `t_lieu_groupe`
--

DROP TABLE IF EXISTS `t_lieu_groupe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_groupe` (
  `Id_Lieu` int NOT NULL,
  `Id_Groupe` int NOT NULL,
  PRIMARY KEY (`Id_Lieu`,`Id_Groupe`),
  KEY `IDX_LIEU_GROUPE_Id_Groupe` (`Id_Groupe`),
  KEY `IDX_LIEU_GROUPE_Id_Lieu` (`Id_Lieu`),
  CONSTRAINT `FK_GROUPE_LIEU_GROUPE` FOREIGN KEY (`Id_Groupe`) REFERENCES `t_groupe` (`Id_Groupe`) ON DELETE CASCADE,
  CONSTRAINT `FK_LIEU_LIEU_GROUPE` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu_mail_tel`
--

DROP TABLE IF EXISTS `t_lieu_mail_tel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_mail_tel` (
  `Id_Mail_Tel` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Ordre_Contact` int DEFAULT NULL,
  `Id_Utilisateur` int DEFAULT NULL,
  `Est_Via_Telephone` tinyint(1) DEFAULT NULL,
  `Est_Via_Email` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id_Mail_Tel`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Id_Utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_LIEU_TEL_NUM` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu_planning`
--

DROP TABLE IF EXISTS `t_lieu_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_planning` (
  `Id_Lieu_Planning` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Est_Id_Jour` tinyint(1) DEFAULT NULL,
  `Est_Actif` tinyint(1) DEFAULT '1',
  `Heure_Debut_Periode1` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0000',
  `Heure_Fin_Periode1` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0000',
  `Heure_Debut_Periode2` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0000',
  `Heure_Fin_Periode2` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '0000',
  PRIMARY KEY (`Id_Lieu_Planning`),
  UNIQUE KEY `IdLieuJour` (`Id_Lieu`,`Est_Id_Jour`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  CONSTRAINT `FK_LIEU_PLANNING` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu_planning_audit`
--

DROP TABLE IF EXISTS `t_lieu_planning_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_planning_audit` (
  `Id_Audit` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Heure_Debut_Changement` datetime DEFAULT NULL,
  `Date_Heure_Fin_Changement` datetime DEFAULT NULL,
  `Type` enum('PLAN_APPLY') NOT NULL,
  `Planning_Regle_Id` int DEFAULT NULL,
  `Consigne_Avant` float DEFAULT NULL,
  `Tolerance_Surveillance_Sup_Avant` float DEFAULT NULL,
  `Tolerance_Surveillance_Inf_Avant` float DEFAULT NULL,
  `Consigne_Apres` float DEFAULT NULL,
  `Tolerance_Surveillance_Sup_Apres` float DEFAULT NULL,
  `Tolerance_Surveillance_Inf_Apres` float DEFAULT NULL,
  PRIMARY KEY (`Id_Audit`),
  KEY `IDX_Id_Lieu_Timestamp` (`Id_Lieu`,`Timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu_planning_regle`
--

DROP TABLE IF EXISTS `t_lieu_planning_regle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_planning_regle` (
  `Id_Regle` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int NOT NULL,
  `Actif` tinyint(1) NOT NULL DEFAULT '1',
  `Jour_Debut` tinyint NOT NULL,
  `Heure_Debut` time NOT NULL,
  `Jour_Fin` tinyint NOT NULL,
  `Heure_Fin` time NOT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Priorite` int NOT NULL DEFAULT '0',
  `Tolerance_Sup_Calc` float DEFAULT NULL,
  `Tolerance_Inf_Calc` float DEFAULT NULL,
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Maj` datetime DEFAULT NULL,
  `Retard_Alarme_Changement_Consigne` int DEFAULT NULL,
  PRIMARY KEY (`Id_Regle`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Actif_Lieu` (`Actif`,`Id_Lieu`),
  CONSTRAINT `FK_PLANNING_REGLE_LIEU` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_lieu_template`
--

DROP TABLE IF EXISTS `t_lieu_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_template` (
  `Id_Lieu_Template` int NOT NULL AUTO_INCREMENT,
  `Nom_Template` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Lieu_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'D',
  `Frequence` int DEFAULT NULL,
  `Retard_Alarme_Haut` int DEFAULT NULL,
  `Retard_Alarme_Bas` int DEFAULT NULL,
  `Retard_Non_Reponse` int DEFAULT '60',
  `Retard_Alarme_Changement_Consigne` int DEFAULT NULL,
  `Consigne` decimal(10,2) DEFAULT NULL,
  `Consigne_Sup` decimal(10,2) DEFAULT NULL,
  `Consigne_Inf` decimal(10,2) DEFAULT NULL,
  `Tolerance_Surveillance_Sup` decimal(10,2) DEFAULT NULL,
  `Tolerance_Surveillance_Inf` decimal(10,2) DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` decimal(10,2) DEFAULT NULL,
  `Consigne_Inf_Pre_Alarme` decimal(10,2) DEFAULT NULL,
  `Seuil_Critique_Haut` decimal(10,2) DEFAULT NULL,
  `Seuil_Critique_Bas` decimal(10,2) DEFAULT NULL,
  `Est_Consigne_Sup_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Consigne_Inf_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Consigne_Sup_Pre_Alarme_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Consigne_Inf_Pre_Alarme_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Seuil_Critique_Haut_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Seuil_Critique_Bas_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Son_Alarme_Active` tinyint(1) NOT NULL DEFAULT '1',
  `Est_Redeclenchement_Immediat` tinyint(1) NOT NULL DEFAULT '0',
  `Nb_Mesures_Temporisation_Redeclenchement` int DEFAULT '0',
  `Observations_Info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Est_Archive` tinyint(1) NOT NULL DEFAULT '0',
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Maj` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Id_Utilisateur_Creation` int DEFAULT NULL,
  `Id_Utilisateur_Maj` int DEFAULT NULL,
  PRIMARY KEY (`Id_Lieu_Template`),
  UNIQUE KEY `UK_t_lieu_template_nom` (`Nom_Template`),
  KEY `IDX_t_lieu_template_archive` (`Est_Archive`),
  KEY `IDX_t_lieu_template_user_create` (`Id_Utilisateur_Creation`),
  KEY `IDX_t_lieu_template_user_update` (`Id_Utilisateur_Maj`),
  CONSTRAINT `FK_t_lieu_template_user_create` FOREIGN KEY (`Id_Utilisateur_Creation`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL,
  CONSTRAINT `FK_t_lieu_template_user_update` FOREIGN KEY (`Id_Utilisateur_Maj`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_materiel`
--

DROP TABLE IF EXISTS `t_materiel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_materiel` (
  `Id_Materiel` int NOT NULL AUTO_INCREMENT,
  `Ref_Commercial` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Designation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Descriptif` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Gamme` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Chemin_Image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Materiel`),
  KEY `Id_Materiel` (`Id_Materiel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_milieu_inter`
--

DROP TABLE IF EXISTS `t_milieu_inter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_milieu_inter` (
  `Id_Milieu` int NOT NULL AUTO_INCREMENT,
  `Model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Stabilite` float DEFAULT NULL,
  `Homogeneite` float DEFAULT NULL,
  `Contenu` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Reserve_MC2` tinyint(1) DEFAULT '0',
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Milieu`) USING BTREE,
  KEY `IDX_Model` (`Model`),
  KEY `IDX_Reference` (`Reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_module`
--

DROP TABLE IF EXISTS `t_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_module` (
  `Id_Module` int NOT NULL AUTO_INCREMENT,
  `Module_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Type_Module` int DEFAULT NULL,
  `Port_Serie` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Adresse_IP` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Delai_Reseau` int DEFAULT NULL,
  `Emplacement` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Archive` tinyint DEFAULT '0',
  `Id_Worker` int DEFAULT NULL,
  `Est_Module_GSO` tinyint(1) NOT NULL DEFAULT '0',
  `Port_Serie_Send_GSO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Port_Serie_Boucle2_GSO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Module`),
  UNIQUE KEY `Identifiant_Module` (`Type_Module`,`Module_Numero_Serie`),
  KEY `IDX_Module_Numero_Serie` (`Module_Numero_Serie`),
  KEY `IDX_Type_Module` (`Type_Module`),
  KEY `IDX_Port_Serie` (`Port_Serie`),
  KEY `IDX_Id_Plan` (`Id_Plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_module_type`
--

DROP TABLE IF EXISTS `t_module_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_module_type` (
  `Id_Module_Type` int NOT NULL AUTO_INCREMENT,
  `Libelle_Type_Module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Libelle_Module` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Flag_Affiche_Plan` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Module_Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_notification`
--

DROP TABLE IF EXISTS `t_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification` (
  `Id_Notification` int NOT NULL AUTO_INCREMENT,
  `Type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_Alarme` int DEFAULT NULL,
  `Titre` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Message` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Payload_Json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Priorite` int DEFAULT '0',
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Est_Archive` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Notification`),
  KEY `IDX_Id_Alarme_Notification` (`Id_Alarme`),
  KEY `IDX_Date_Creation_Notification` (`Date_Creation`),
  CONSTRAINT `FK_ALARME_NOTIFICATION` FOREIGN KEY (`Id_Alarme`) REFERENCES `t_alarme` (`Id_Alarme`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_notification_delivery`
--

DROP TABLE IF EXISTS `t_notification_delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification_delivery` (
  `Id_Delivery` int NOT NULL AUTO_INCREMENT,
  `Id_Notification` int NOT NULL,
  `Id_Poste` int NOT NULL,
  `Id_Utilisateur` int DEFAULT NULL,
  `Statut` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nb_Tentatives` int NOT NULL DEFAULT '0',
  `Derniere_Erreur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Queue` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Envoi` datetime DEFAULT NULL,
  `Date_Ack_Agent` datetime DEFAULT NULL,
  `Date_Dernier_Event` datetime DEFAULT NULL,
  `Correlation_Id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Delivery`),
  UNIQUE KEY `UK_NOTIFICATION_POSTE` (`Id_Notification`,`Id_Poste`),
  KEY `IDX_STATUT_DELIVERY` (`Statut`),
  KEY `IDX_Date_Envoi_Delivery` (`Date_Envoi`),
  KEY `FK_POSTE_DELIVERY` (`Id_Poste`),
  KEY `FK_UTILISATEUR_DELIVERY` (`Id_Utilisateur`),
  CONSTRAINT `FK_NOTIFICATION_DELIVERY` FOREIGN KEY (`Id_Notification`) REFERENCES `t_notification` (`Id_Notification`) ON DELETE CASCADE,
  CONSTRAINT `FK_POSTE_DELIVERY` FOREIGN KEY (`Id_Poste`) REFERENCES `t_postes_clients` (`Id_Poste`) ON DELETE CASCADE,
  CONSTRAINT `FK_UTILISATEUR_DELIVERY` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_notification_event`
--

DROP TABLE IF EXISTS `t_notification_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_notification_event` (
  `Id_Event` int NOT NULL AUTO_INCREMENT,
  `Id_Delivery` int NOT NULL,
  `Event_Type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Event_Data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Date_Event` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Event`),
  KEY `IDX_Id_Delivery_Event` (`Id_Delivery`),
  KEY `IDX_Date_Event` (`Date_Event`),
  CONSTRAINT `FK_DELIVERY_EVENT` FOREIGN KEY (`Id_Delivery`) REFERENCES `t_notification_delivery` (`Id_Delivery`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_parametre`
--

DROP TABLE IF EXISTS `t_parametre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_parametre` (
  `Section` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Mot_Cle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Valeur` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Commentaire` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Champ_DATETIME` datetime DEFAULT NULL COMMENT 'Champ optionnel. A peupler si besoin.',
  PRIMARY KEY (`Section`,`Mot_Cle`),
  KEY `IDX_Section` (`Section`),
  KEY `IDX_Mot_Cle` (`Mot_Cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pdf`
--

DROP TABLE IF EXISTS `t_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pdf` (
  `Id_PDF` int NOT NULL AUTO_INCREMENT,
  `Nom_PDF` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Contenu_PDF` longblob,
  PRIMARY KEY (`Id_PDF`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_plan`
--

DROP TABLE IF EXISTS `t_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_plan` (
  `Id_Plan` int NOT NULL AUTO_INCREMENT,
  `Image` longblob,
  `Titre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Plan`),
  UNIQUE KEY `Plan_Titre_IDX` (`Titre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_postes_clients`
--

DROP TABLE IF EXISTS `t_postes_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_postes_clients` (
  `Id_Poste` int NOT NULL AUTO_INCREMENT,
  `Nom_Machine_Connexion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse_IP_Connexion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Login` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Prenom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Derniere_Connexion` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Poste`),
  UNIQUE KEY `nomMachineId` (`Nom_Machine_Connexion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_profil`
--

DROP TABLE IF EXISTS `t_profil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_profil` (
  `Id_Profil` int NOT NULL AUTO_INCREMENT,
  `Profil_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commentaire` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_MC2` tinyint(1) DEFAULT '0',
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Profil`),
  UNIQUE KEY `Profil_ProfilUtilisateur_IDX` (`Profil_Utilisateur`),
  KEY `IDX_Est_Archive` (`Est_Archive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_site`
--

DROP TABLE IF EXISTS `t_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_site` (
  `Id_Site` int NOT NULL AUTO_INCREMENT,
  `Code_Site` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Libelle_Site` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commentaire` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Site`),
  UNIQUE KEY `CodeSite_IDX` (`Code_Site`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sonde`
--

DROP TABLE IF EXISTS `t_sonde`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde` (
  `Id_Sonde` int NOT NULL AUTO_INCREMENT,
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Sonde_Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Sonde_GSO` tinyint(1) NOT NULL DEFAULT '0',
  `Port_Serie` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Etat_Sonde` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'D',
  `Metrologie_en_cours` tinyint(1) NOT NULL DEFAULT '0',
  `Metrologie_cmd_envoyee` tinyint(1) NOT NULL DEFAULT '0',
  `Id_Module` int DEFAULT NULL,
  `Relai_1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_3` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Relai_4` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Frequence_Mesure` int DEFAULT NULL,
  `Frequence_Recup` int DEFAULT NULL,
  `Est_Sonde_Reformee` tinyint(1) DEFAULT NULL,
  `Etat_Sonde_N1` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Worker` int DEFAULT NULL,
  `Id_Sonde_Etat` int DEFAULT NULL,
  `Sonde_Offset` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Sonde`),
  UNIQUE KEY `Numero_serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Id_Module` (`Id_Module`),
  KEY `IDX_Adresse_Sonde` (`Adresse_Sonde`),
  KEY `IDX_Port_Serie` (`Port_Serie`),
  KEY `IDX_Etat_Sonde` (`Etat_Sonde`),
  KEY `IDX_Id_Sonde_Etat` (`Id_Sonde_Etat`),
  KEY `IDX_Sonde_Type` (`Sonde_Type`),
  CONSTRAINT `FK_SONDE_ETAT` FOREIGN KEY (`Id_Sonde_Etat`) REFERENCES `t_sonde_etat` (`Id_Sonde_Etat`),
  CONSTRAINT `FK_SONDE_ETAT_SURVEILLANCE` FOREIGN KEY (`Etat_Sonde`) REFERENCES `t_etat_surveillance` (`Surveillance_Etat`),
  CONSTRAINT `FK_SONDE_SONDE_TYPE` FOREIGN KEY (`Sonde_Type`) REFERENCES `t_sonde_type` (`Sonde_Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sonde_etat`
--

DROP TABLE IF EXISTS `t_sonde_etat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde_etat` (
  `Id_Sonde_Etat` int NOT NULL AUTO_INCREMENT,
  `Etat_Sonde` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Etat_Libelle` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Sonde_Etat`),
  UNIQUE KEY `Etat_Sonde` (`Etat_Sonde`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sonde_type`
--

DROP TABLE IF EXISTS `t_sonde_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde_type` (
  `Id_Sonde_Type` int NOT NULL AUTO_INCREMENT,
  `Sonde_Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Libelle_Sonde_Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Gestion_Relais` tinyint(1) DEFAULT NULL,
  `Est_Double_Capteur` tinyint(1) NOT NULL DEFAULT '0',
  `Famille_Sonde` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CLASSIC',
  `Unite` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Valeur_Max` float DEFAULT NULL,
  `Valeur_Min` float DEFAULT NULL,
  PRIMARY KEY (`Id_Sonde_Type`),
  UNIQUE KEY `Sonde_Type` (`Sonde_Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_utilisateur`
--

DROP TABLE IF EXISTS `t_utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_utilisateur` (
  `Id_Utilisateur` int NOT NULL AUTO_INCREMENT,
  `Login` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Mot_De_Passe` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Validite` date DEFAULT NULL,
  `Date_Creation` date DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Profil_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Derniere_Connexion` datetime DEFAULT NULL,
  `Adresse_IP_Connexion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Nom_Machine_Connexion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  `Nom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Prenom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_Num_Fixe` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tel_Num_Mobile` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse_Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Derniere_Modification_MDP` datetime DEFAULT NULL,
  `Reset_Password_Token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Reset_Password_Expires` datetime DEFAULT NULL,
  `Est_Mot_De_Passe_Temporaire` tinyint(1) DEFAULT '0',
  `Avatar_Utilisateur` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Utilisateur`),
  UNIQUE KEY `Utilisateur_Nom_IDX` (`Login`),
  UNIQUE KEY `Login` (`Login`),
  KEY `IDX_Est_Archive` (`Est_Archive`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vigilog`
--

DROP TABLE IF EXISTS `t_vigilog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vigilog` (
  `Id_VigiLog` int NOT NULL AUTO_INCREMENT,
  `Numero_Serie` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Modele` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Libelle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Actif` tinyint(1) NOT NULL DEFAULT '1',
  `Date_Etalonnage` datetime DEFAULT NULL,
  `Date_Validite` date DEFAULT NULL,
  `Duree_Validite_Jours` int DEFAULT NULL,
  `Err_Justesse` float DEFAULT NULL,
  `Commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Id_Utilisateur_Creation` int DEFAULT NULL,
  `Date_Heure_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Id_Utilisateur_Maj` int DEFAULT NULL,
  `Date_Heure_Maj` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_VigiLog`),
  UNIQUE KEY `UK_t_vigilog_numero_serie` (`Numero_Serie`),
  KEY `IDX_t_vigilog_actif` (`Actif`),
  KEY `IDX_t_vigilog_modele` (`Modele`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vigilog_configuration`
--

DROP TABLE IF EXISTS `t_vigilog_configuration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vigilog_configuration` (
  `Id_VigiLog_Configuration` int NOT NULL AUTO_INCREMENT,
  `Nom_Configuration` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description_Configuration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Consigne` decimal(10,2) DEFAULT NULL,
  `Limite_Basse_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Limite_Basse` decimal(10,2) DEFAULT NULL,
  `Limite_Haute_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Limite_Haute` decimal(10,2) DEFAULT NULL,
  `Frequence_Min` int NOT NULL,
  `Retard_Alarme_Min` int NOT NULL,
  `Delai_Demarrage_Min` int NOT NULL DEFAULT '0',
  `Autorise_Arret_Bouton_Stop` tinyint(1) NOT NULL DEFAULT '1',
  `Reinitialise_Avec_Bouton_Start` tinyint(1) NOT NULL DEFAULT '1',
  `Actif` tinyint(1) NOT NULL DEFAULT '1',
  `Id_Utilisateur_Creation` int DEFAULT NULL,
  `Date_Heure_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Id_Utilisateur_Maj` int DEFAULT NULL,
  `Date_Heure_Maj` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_VigiLog_Configuration`),
  UNIQUE KEY `UK_t_vigilog_configuration_nom` (`Nom_Configuration`),
  KEY `IDX_t_vigilog_configuration_user_create` (`Id_Utilisateur_Creation`),
  KEY `IDX_t_vigilog_configuration_user_update` (`Id_Utilisateur_Maj`),
  CONSTRAINT `FK_t_vigilog_configuration_user_creation` FOREIGN KEY (`Id_Utilisateur_Creation`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_configuration_user_maj` FOREIGN KEY (`Id_Utilisateur_Maj`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vigilog_tournee`
--

DROP TABLE IF EXISTS `t_vigilog_tournee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vigilog_tournee` (
  `Id_VigiLog_Tournee` int NOT NULL AUTO_INCREMENT,
  `Reference_Tournee` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_VigiLog_Configuration` int DEFAULT NULL,
  `Id_VigiLog` int DEFAULT NULL,
  `Nom_Configuration` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_Site_Depart` int NOT NULL,
  `Id_Site_Arrivee` int NOT NULL,
  `Numero_Serie_VigiLog` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Statut` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Resultat_Feu` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Utilisateur_Depart` int NOT NULL,
  `Date_Heure_Depart` datetime NOT NULL,
  `Id_Utilisateur_Arrivee` int DEFAULT NULL,
  `Date_Heure_Arrivee` datetime DEFAULT NULL,
  `Consigne` decimal(10,2) DEFAULT NULL,
  `Limite_Basse_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Limite_Basse` decimal(10,2) DEFAULT NULL,
  `Limite_Haute_Active` tinyint(1) NOT NULL DEFAULT '0',
  `Limite_Haute` decimal(10,2) DEFAULT NULL,
  `Frequence_Min` int NOT NULL,
  `Retard_Alarme_Min` int NOT NULL,
  `Delai_Demarrage_Min` int NOT NULL DEFAULT '0',
  `Autorise_Arret_Bouton_Stop` tinyint(1) NOT NULL DEFAULT '1',
  `Reinitialise_Avec_Bouton_Start` tinyint(1) NOT NULL DEFAULT '1',
  `Nb_Mesures` int NOT NULL DEFAULT '0',
  `Temperature_Min` decimal(10,2) DEFAULT NULL,
  `Temperature_Moyenne` decimal(10,2) DEFAULT NULL,
  `Temperature_Max` decimal(10,2) DEFAULT NULL,
  `Duree_Hors_Limites_Secondes` int NOT NULL DEFAULT '0',
  `Duree_Alarme_Secondes` int NOT NULL DEFAULT '0',
  `Est_Depassement_Limites` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Alarme` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Acquittee` tinyint(1) NOT NULL DEFAULT '0',
  `Commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Commentaire_Acquittement` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Id_Utilisateur_Acquittement` int DEFAULT NULL,
  `Date_Heure_Acquittement` datetime DEFAULT NULL,
  `Date_Heure_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Heure_Maj` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_VigiLog_Tournee`),
  UNIQUE KEY `UK_t_vigilog_tournee_reference` (`Reference_Tournee`),
  KEY `IDX_t_vigilog_tournee_config` (`Id_VigiLog_Configuration`),
  KEY `IDX_t_vigilog_tournee_site_depart` (`Id_Site_Depart`),
  KEY `IDX_t_vigilog_tournee_site_arrivee` (`Id_Site_Arrivee`),
  KEY `IDX_t_vigilog_tournee_logger` (`Numero_Serie_VigiLog`),
  KEY `IDX_t_vigilog_tournee_statut` (`Statut`),
  KEY `IDX_t_vigilog_tournee_depart_user` (`Id_Utilisateur_Depart`),
  KEY `IDX_t_vigilog_tournee_arrivee_user` (`Id_Utilisateur_Arrivee`),
  KEY `IDX_t_vigilog_tournee_acquit_user` (`Id_Utilisateur_Acquittement`),
  KEY `IDX_t_vigilog_tournee_vigilog` (`Id_VigiLog`),
  CONSTRAINT `FK_t_vigilog_tournee_configuration` FOREIGN KEY (`Id_VigiLog_Configuration`) REFERENCES `t_vigilog_configuration` (`Id_VigiLog_Configuration`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_site_arrivee` FOREIGN KEY (`Id_Site_Arrivee`) REFERENCES `t_site` (`Id_Site`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_site_depart` FOREIGN KEY (`Id_Site_Depart`) REFERENCES `t_site` (`Id_Site`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_user_acquittement` FOREIGN KEY (`Id_Utilisateur_Acquittement`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_user_arrivee` FOREIGN KEY (`Id_Utilisateur_Arrivee`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_user_depart` FOREIGN KEY (`Id_Utilisateur_Depart`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_t_vigilog_tournee_vigilog` FOREIGN KEY (`Id_VigiLog`) REFERENCES `t_vigilog` (`Id_VigiLog`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vigilog_usage_ponctuel`
--

DROP TABLE IF EXISTS `t_vigilog_usage_ponctuel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vigilog_usage_ponctuel` (
  `Id_VigiLog_Usage_Ponctuel` int NOT NULL AUTO_INCREMENT,
  `Reference_Usage` varchar(50) NOT NULL,
  `Id_VigiLog_Configuration` int DEFAULT NULL,
  `Id_VigiLog` int DEFAULT NULL,
  `Nom_Configuration` varchar(100) NOT NULL,
  `Numero_Serie_VigiLog` varchar(30) NOT NULL,
  `Nom_Lieu_Temporaire` varchar(120) NOT NULL,
  `Statut` varchar(30) NOT NULL,
  `Id_Utilisateur_Demarrage` int NOT NULL,
  `Date_Heure_Demarrage` datetime NOT NULL,
  `Commentaire_Demarrage` text,
  `Id_Utilisateur_Arret` int DEFAULT NULL,
  `Date_Heure_Arret` datetime DEFAULT NULL,
  `Commentaire_Arret` text,
  `Date_Heure_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Heure_Maj` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_VigiLog_Usage_Ponctuel`),
  UNIQUE KEY `UK_t_vigilog_usage_ponctuel_reference` (`Reference_Usage`),
  KEY `IDX_t_vigilog_usage_ponctuel_statut` (`Statut`),
  KEY `IDX_t_vigilog_usage_ponctuel_logger` (`Numero_Serie_VigiLog`),
  KEY `IDX_t_vigilog_usage_ponctuel_started_by` (`Id_Utilisateur_Demarrage`),
  KEY `IDX_t_vigilog_usage_ponctuel_stopped_by` (`Id_Utilisateur_Arret`),
  KEY `FK_t_vigilog_usage_ponctuel_configuration` (`Id_VigiLog_Configuration`),
  KEY `FK_t_vigilog_usage_ponctuel_logger` (`Id_VigiLog`),
  CONSTRAINT `FK_t_vigilog_usage_ponctuel_configuration` FOREIGN KEY (`Id_VigiLog_Configuration`) REFERENCES `t_vigilog_configuration` (`Id_VigiLog_Configuration`),
  CONSTRAINT `FK_t_vigilog_usage_ponctuel_logger` FOREIGN KEY (`Id_VigiLog`) REFERENCES `t_vigilog` (`Id_VigiLog`),
  CONSTRAINT `FK_t_vigilog_usage_ponctuel_user_start` FOREIGN KEY (`Id_Utilisateur_Demarrage`) REFERENCES `t_utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_t_vigilog_usage_ponctuel_user_stop` FOREIGN KEY (`Id_Utilisateur_Arret`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `v_tm_mesures_dernier`
--

DROP TABLE IF EXISTS `v_tm_mesures_dernier`;
/*!50001 DROP VIEW IF EXISTS `v_tm_mesures_dernier`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_tm_mesures_dernier` AS SELECT 
 1 AS `Id_Lieu`,
 1 AS `Sonde_Numero_Serie`,
 1 AS `Adresse_Sonde`,
 1 AS `Nom_Lieu`,
 1 AS `Id_Alarme`,
 1 AS `Alarme_en_cours`,
 1 AS `Dernier_Releve`,
 1 AS `Unite`,
 1 AS `Date_Heure_Mesure`,
 1 AS `COM_Lecture`,
 1 AS `Signal_Radio`,
 1 AS `Tension_Piles`,
 1 AS `GSO_SN`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'vigi_main'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `EVT_GSO_DERNIERVALEUR_LIEU` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50106 EVENT `EVT_GSO_DERNIERVALEUR_LIEU` ON SCHEDULE EVERY 2 MINUTE STARTS '2026-05-06 11:32:30' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN



UPDATE vigi_main.t_lieu

JOIN v_tm_mesures_dernier ON v_tm_mesures_dernier.Id_Lieu=vigi_main.t_lieu.Id_Lieu

SET

vigi_main.t_lieu.Derniere_Date_Heure=v_tm_mesures_dernier.Date_Heure_Mesure,

vigi_main.t_lieu.Derniere_Valeur=v_tm_mesures_dernier.Dernier_Releve,

vigi_main.t_lieu.Derniere_Unite=v_tm_mesures_dernier.Unite,

vigi_main.t_lieu.Date_Heure_Derniere_Reponse=v_tm_mesures_dernier.Date_Heure_Mesure,

vigi_main.t_lieu.Derniere_Val_Rssi=v_tm_mesures_dernier.Signal_Radio,

vigi_main.t_lieu.Derniere_Val_Tension=v_tm_mesures_dernier.Tension_Piles;





UPDATE vigi_main.t_lieu

SET vigi_main.t_lieu.Date_Heure_Derniere_Reponse_Recue_OK=vigi_main.t_lieu.Derniere_Date_Heure

WHERE (vigi_main.t_lieu.Derniere_Valeur <= vigi_main.t_lieu.Tolerance_Surveillance_Sup AND vigi_main.t_lieu.Derniere_Valeur >= vigi_main.t_lieu.Tolerance_Surveillance_Inf)

AND vigi_main.t_lieu.Est_Lieu_GSO=1 AND vigi_main.t_lieu.Lieu_Etat='S';



UPDATE vigi_main.t_lieu

SET vigi_main.t_lieu.Date_Heure_Derniere_Reponse_Recue_OK=vigi_main.t_lieu.Derniere_Date_Heure

WHERE vigi_main.t_lieu.Derniere_Valeur IS NOT NULL AND (vigi_main.t_lieu.Tolerance_Surveillance_Sup IS NULL OR vigi_main.t_lieu.Tolerance_Surveillance_Inf IS NULL)

AND vigi_main.t_lieu.Est_Lieu_GSO=1 AND vigi_main.t_lieu.Lieu_Etat='S';



UPDATE vigi_main.t_lieu SET vigi_main.t_lieu.Date_Heure_Last_Update_EVT_GSO=NOW() WHERE vigi_main.t_lieu.Est_Lieu_GSO=1 AND vigi_main.t_lieu.Lieu_Etat='S';



UPDATE vigi_main.t_parametre

SET vigi_main.t_parametre.Champ_DATETIME = (SELECT v_tm_mesures_dernier.Date_Heure_Mesure FROM v_tm_mesures_dernier ORDER BY v_tm_mesures_dernier.Date_Heure_Mesure DESC LIMIT 1)

WHERE vigi_main.t_parametre.Mot_Cle='GSO_DERNIER_DATE_HEURE';



DELETE FROM t_lieu_planning_audit WHERE ((t_lieu_planning_audit.Date_Heure_Fin_Changement<DATE_SUB(NOW(), INTERVAL 240 HOUR)));



END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `EVT_PLANNING_CONSIGNE` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50106 EVENT `EVT_PLANNING_CONSIGNE` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-03-24 16:11:55' ON COMPLETION NOT PRESERVE ENABLE COMMENT 'Applique les regles de planning de consignes chaque minute' DO BEGIN

  DECLARE v_now_day TINYINT;

  DECLARE v_now_time TIME;



  SET v_now_day = IF(DAYOFWEEK(NOW()) = 1, 7, DAYOFWEEK(NOW()) - 1);

  SET v_now_time = TIME(NOW());



  DROP TEMPORARY TABLE IF EXISTS tmp_planning_best;

  CREATE TEMPORARY TABLE tmp_planning_best AS

  SELECT r.Id_Lieu,

         r.Id_Regle,

         r.Consigne,

         r.Tolerance_Sup_Calc,

         r.Tolerance_Inf_Calc,

         r.Retard_Alarme_Changement_Consigne

  FROM t_lieu_planning_regle r

  INNER JOIN (

    SELECT Id_Lieu, MAX(Priorite) AS max_prio

    FROM t_lieu_planning_regle

    WHERE Actif = 1

      AND (

        (Jour_Debut = Jour_Fin AND

          v_now_day = Jour_Debut AND

          v_now_time >= Heure_Debut AND

          v_now_time <  Heure_Fin)

        OR

        (Jour_Debut < Jour_Fin AND (

          (v_now_day > Jour_Debut AND v_now_day < Jour_Fin)

          OR (v_now_day = Jour_Debut AND v_now_time >= Heure_Debut)

          OR (v_now_day = Jour_Fin   AND v_now_time <  Heure_Fin)

        ))

        OR

        (Jour_Debut > Jour_Fin AND (

          (v_now_day = Jour_Debut AND v_now_time >= Heure_Debut)

          OR (v_now_day = Jour_Fin   AND v_now_time <  Heure_Fin)

          OR (v_now_day > Jour_Debut)

          OR (v_now_day < Jour_Fin)

        ))

      )

    GROUP BY Id_Lieu

  ) best_prio ON best_prio.Id_Lieu = r.Id_Lieu AND best_prio.max_prio = r.Priorite

  WHERE r.Actif = 1

    AND (

      (r.Jour_Debut = r.Jour_Fin AND

        v_now_day = r.Jour_Debut AND

        v_now_time >= r.Heure_Debut AND

        v_now_time <  r.Heure_Fin)

      OR

      (r.Jour_Debut < r.Jour_Fin AND (

        (v_now_day > r.Jour_Debut AND v_now_day < r.Jour_Fin)

        OR (v_now_day = r.Jour_Debut AND v_now_time >= r.Heure_Debut)

        OR (v_now_day = r.Jour_Fin   AND v_now_time <  r.Heure_Fin)

      ))

      OR

      (r.Jour_Debut > r.Jour_Fin AND (

        (v_now_day = r.Jour_Debut AND v_now_time >= r.Heure_Debut)

        OR (v_now_day = r.Jour_Fin   AND v_now_time <  r.Heure_Fin)

        OR (v_now_day > r.Jour_Debut)

        OR (v_now_day < r.Jour_Fin)

      ))

    );



  DROP TEMPORARY TABLE IF EXISTS tmp_planning_apply;

  CREATE TEMPORARY TABLE tmp_planning_apply AS

  SELECT l.Id_Lieu,

         best.Id_Regle AS Planning_Regle_Id,

         l.Consigne AS Consigne_Avant,

         l.Tolerance_Surveillance_Sup AS Tolerance_Surveillance_Sup_Avant,

         l.Tolerance_Surveillance_Inf AS Tolerance_Surveillance_Inf_Avant,

         best.Consigne AS Consigne_Apres,

         best.Tolerance_Sup_Calc AS Tolerance_Surveillance_Sup_Apres,

         best.Tolerance_Inf_Calc AS Tolerance_Surveillance_Inf_Apres,

         best.Retard_Alarme_Changement_Consigne

  FROM t_lieu l

  INNER JOIN tmp_planning_best best ON best.Id_Lieu = l.Id_Lieu

  WHERE l.Planning_Source_Regle_Id <> best.Id_Regle

     OR l.Planning_Source_Regle_Id IS NULL

     OR l.Planning_Actif = 0

     OR IFNULL(l.Consigne, -999999) <> IFNULL(best.Consigne, -999999)

     OR IFNULL(l.Tolerance_Surveillance_Sup, -999999) <> IFNULL(best.Tolerance_Sup_Calc, -999999)

     OR IFNULL(l.Tolerance_Surveillance_Inf, -999999) <> IFNULL(best.Tolerance_Inf_Calc, -999999);



  UPDATE t_lieu_planning_audit a

  INNER JOIN tmp_planning_apply c ON c.Id_Lieu = a.Id_Lieu

  SET a.Date_Heure_Fin_Changement = NOW()

  WHERE a.Type = 'PLAN_APPLY'

    AND a.Date_Heure_Fin_Changement IS NULL;



  UPDATE t_lieu l

  INNER JOIN tmp_planning_apply c ON c.Id_Lieu = l.Id_Lieu

  SET l.Consigne                          = c.Consigne_Apres,

      l.Consigne_Sup                      = c.Tolerance_Surveillance_Sup_Apres,

      l.Consigne_Inf                      = c.Tolerance_Surveillance_Inf_Apres,

      l.Tolerance_Surveillance_Sup        = c.Tolerance_Surveillance_Sup_Apres,

      l.Tolerance_Surveillance_Inf        = c.Tolerance_Surveillance_Inf_Apres,

      l.Retard_Alarme_Changement_Consigne = c.Retard_Alarme_Changement_Consigne,

      l.Planning_Actif                    = 1,

      l.Planning_Source_Regle_Id          = c.Planning_Regle_Id,

      l.Planning_Derniere_Maj             = NOW();



  INSERT INTO t_lieu_planning_audit

    (Id_Lieu, Timestamp, Date_Heure_Debut_Changement, Date_Heure_Fin_Changement, Type,

     Planning_Regle_Id,

     Consigne_Avant, Tolerance_Surveillance_Sup_Avant, Tolerance_Surveillance_Inf_Avant,

     Consigne_Apres, Tolerance_Surveillance_Sup_Apres, Tolerance_Surveillance_Inf_Apres)

  SELECT c.Id_Lieu,

         NOW(),

         NOW(),

         NULL,

         'PLAN_APPLY',

         c.Planning_Regle_Id,

         c.Consigne_Avant,

         c.Tolerance_Surveillance_Sup_Avant,

         c.Tolerance_Surveillance_Inf_Avant,

         c.Consigne_Apres,

         c.Tolerance_Surveillance_Sup_Apres,

         c.Tolerance_Surveillance_Inf_Apres

  FROM tmp_planning_apply c;



  DROP TEMPORARY TABLE IF EXISTS tmp_planning_return;

  CREATE TEMPORARY TABLE tmp_planning_return AS

  SELECT l.Id_Lieu

  FROM t_lieu l

  WHERE l.Planning_Actif = 1

    AND NOT EXISTS (

      SELECT 1

      FROM tmp_planning_best best

      WHERE best.Id_Lieu = l.Id_Lieu

    );



  UPDATE t_lieu_planning_audit a

  INNER JOIN tmp_planning_return r ON r.Id_Lieu = a.Id_Lieu

  SET a.Date_Heure_Fin_Changement = NOW()

  WHERE a.Type = 'PLAN_APPLY'

    AND a.Date_Heure_Fin_Changement IS NULL;



  UPDATE t_lieu l

  INNER JOIN tmp_planning_return r ON r.Id_Lieu = l.Id_Lieu

  SET l.Consigne                          = l.Consigne_Base,

      l.Consigne_Sup                      = l.Consigne_Sup_Base,

      l.Consigne_Inf                      = l.Consigne_Inf_Base,

      l.Tolerance_Surveillance_Sup        = l.Tolerance_Surveillance_Sup_Base,

      l.Tolerance_Surveillance_Inf        = l.Tolerance_Surveillance_Inf_Base,

      l.Retard_Alarme_Changement_Consigne = NULL,

      l.Planning_Actif                    = 0,

      l.Planning_Source_Regle_Id          = NULL,

      l.Planning_Derniere_Maj             = NOW();



  DROP TEMPORARY TABLE IF EXISTS tmp_planning_return;

  DROP TEMPORARY TABLE IF EXISTS tmp_planning_apply;

  DROP TEMPORARY TABLE IF EXISTS tmp_planning_best;

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- =====================================================================
-- Better Auth - schema preparatoire (runtime legacy conserve)
-- =====================================================================
-- Ces tables preparent BA-2 sans activer Better Auth dans l'application.
-- t_utilisateur reste l'identite metier de reference.
DROP TABLE IF EXISTS `t_auth_session`;
DROP TABLE IF EXISTS `t_auth_account`;
DROP TABLE IF EXISTS `t_auth_verification`;
DROP TABLE IF EXISTS `t_auth_user`;

CREATE TABLE `t_auth_user` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayUsername` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vigisensysUserId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_user_email` (`email`),
  UNIQUE KEY `UK_t_auth_user_username` (`username`),
  UNIQUE KEY `UK_t_auth_user_vigisensys_user` (`vigisensysUserId`),
  CONSTRAINT `FK_t_auth_user_vigisensys_user` FOREIGN KEY (`vigisensysUserId`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `t_auth_session` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ipAddress` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_session_token` (`token`),
  KEY `IDX_t_auth_session_user` (`userId`),
  CONSTRAINT `FK_t_auth_session_user` FOREIGN KEY (`userId`) REFERENCES `t_auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `t_auth_account` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `refreshToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `idToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `accessTokenExpiresAt` datetime DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `scope` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_account_provider_account` (`providerId`,`accountId`),
  KEY `IDX_t_auth_account_user` (`userId`),
  CONSTRAINT `FK_t_auth_account_user` FOREIGN KEY (`userId`) REFERENCES `t_auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `t_auth_verification` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_t_auth_verification_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE DATABASE  IF NOT EXISTS `vigi_mesures` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vigi_mesures`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Source: schema-only dump of the current VigiSensys databases
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tm_compteur_id_table`
--

DROP TABLE IF EXISTS `tm_compteur_id_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_compteur_id_table` (
  `Id_Serveur_BDD` int NOT NULL,
  `Nom_Table` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Compteur_Id` int DEFAULT NULL,
  PRIMARY KEY (`Id_Serveur_BDD`,`Nom_Table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_graphique`
--

DROP TABLE IF EXISTS `tm_graphique`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_graphique` (
  `Id_Graphique` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Mesure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Planning_Actif` tinyint(1) DEFAULT '0',
  `Nb_Decimal` int DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Sonde` int DEFAULT NULL,
  `Id_Lieu` int NOT NULL DEFAULT '0',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_journal`
--

DROP TABLE IF EXISTS `tm_journal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal` (
  `Id_Serveur_BDD` int NOT NULL,
  `Id_Journal` int NOT NULL AUTO_INCREMENT,
  `Code_Journal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commentaire` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Nom_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Profil_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Journal` datetime DEFAULT NULL,
  `Id_Lieu` int DEFAULT NULL,
  `Commentaire_Utilisateur` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id_Serveur_BDD`,`Id_Journal`),
  KEY `IDX_Code_Journal` (`Code_Journal`),
  KEY `IDX_Nom_Utilisateur` (`Nom_Utilisateur`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`),
  KEY `IDX_Date_Heure_Journal` (`Date_Heure_Journal`),
  KEY `Id_Journal` (`Id_Journal`),
  KEY `IDX_tm_journal_Id_Lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_journal_code`
--

DROP TABLE IF EXISTS `tm_journal_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal_code` (
  `Code_Journal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Commentaire` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Code_Journal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tm_journal_code`
--

LOCK TABLES `tm_journal_code` WRITE;
/*!40000 ALTER TABLE `tm_journal_code` DISABLE KEYS */;
INSERT INTO `tm_journal_code` VALUES ('AACT','Association d\'un module d\'alarme'),('ACQ','Acquittement alarme'),('ACT','Activer la surveillance'),('ACTU','Reactivation de l\'utilisateur'),('AIM','Analyse d\'impact des mesures'),('AJE','Ajoute evenement manuel'),('ARC','Archivage des données'),('AS','Arret de la surveillance'),('AT','Activation de la surveillance telephonique'),('CA','Demarrage d\'un calibrage pour la sonde'),('CC','Changement sur un element'),('CDA','Changement d\'etat du datalogger'),('CF','Changement de frequence'),('CONNEXION','Connexion de l\'utilisateur'),('CR','Changement de retard d\'alarme'),('CS','Changement de sonde'),('DECONNEXION','Deconnexion de l\'utilisateur'),('DES','Desactiver la surveillance'),('DS','Demarrage de la surveillance'),('DT','Desactivation de la surveillance telephonique'),('ET','Demarrage d\'un etalonnage pour la sonde'),('FERMSURV','Fermeture de la fenètre de surveillance'),('GRPH','Ouverture d\'un graphique'),('IMP','Import de donnees'),('MDP','Changement fiche utilisateur'),('PLAN','Modification du planning'),('PS','Le gestionnaire de port serie virtuel relancé'),('SACT','Suppression du module d\'alarme associée'),('TC','Test de connexion de la sonde'),('TEL','Systeme'),('UT',''),('VLOG','Action VigiLog');
/*!40000 ALTER TABLE `tm_journal_code` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

--
-- Table structure for table `tm_journal_commentaire_libre`
--

DROP TABLE IF EXISTS `tm_journal_commentaire_libre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal_commentaire_libre` (
  `Id_Commentaire_Journal` int NOT NULL AUTO_INCREMENT,
  `Code_Journal` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Commentaire` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Modification` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Commentaire_Journal`),
  KEY `IDX_tm_journal_commentaire_libre_code` (`Code_Journal`),
  KEY `IDX_tm_journal_commentaire_libre_date_creation` (`Date_Creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_journal_histo`
--

DROP TABLE IF EXISTS `tm_journal_histo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_journal_histo` (
  `Id_Journal_Histo` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Id_Journal` int NOT NULL DEFAULT '0',
  `Code_Journal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Commentaire` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Nom_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Profil_Utilisateur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Date_Heure_Journal` datetime DEFAULT NULL,
  `Id_Lieu` int DEFAULT NULL,
  `Commentaire_Utilisateur` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id_Journal_Histo`,`Id_Serveur_BDD`,`Id_Journal`),
  KEY `IDX_Code_Journal` (`Code_Journal`),
  KEY `IDX_Nom_Utilisateur` (`Nom_Utilisateur`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`),
  KEY `IDX_Date_Heure_Journal` (`Date_Heure_Journal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures`
--

DROP TABLE IF EXISTS `tm_mesures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures` (
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Id_Mesure` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Mesure` datetime NOT NULL,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Est_Valeur_Memoire` tinyint(1) NOT NULL DEFAULT '0',
  `Planning_Regle_Existe` tinyint(1) DEFAULT '0',
  `Planning_Actif` tinyint(1) DEFAULT '0',
  `Nb_Decimal` int DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `COM_sonde` float DEFAULT NULL,
  `Est_Mesure_Repeteur_GSO` float DEFAULT '0',
  `Id_Lieu` int NOT NULL DEFAULT '0',
  `Est_Valeur_Null` tinyint NOT NULL DEFAULT '0',
  `Frequence` int DEFAULT NULL,
  `Est_Etat_Alarme` tinyint(1) NOT NULL DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Moyenne` float DEFAULT NULL,
  `Rssi` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tension` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Serveur_BDD`,`Id_Mesure`,`Date_Heure_Mesure`,`Id_Lieu`,`Est_Valeur_Null`),
  KEY `IDX_Date_Heure_Mesure` (`Date_Heure_Mesure`),
  KEY `IDX_Est_Etat_Alarme` (`Est_Etat_Alarme`),
  KEY `Mesure_Numero_lieu_IDX` (`Id_Lieu`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `Mesure_lieu` (`Id_Lieu`),
  KEY `IDX_Date_Heure_Mesure_Id_Lieu` (`Date_Heure_Mesure`,`Id_Lieu`),
  KEY `Id_Mesure` (`Id_Mesure`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_ajustage`
--

DROP TABLE IF EXISTS `tm_mesures_ajustage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_ajustage` (
  `Id_Mesure_Ajustage` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Mesure` datetime NOT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id_Mesure_Ajustage`,`Id_Serveur_BDD`) USING BTREE,
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Date_Heure` (`Date_Heure_Mesure`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_ajustage_etalon`
--

DROP TABLE IF EXISTS `tm_mesures_ajustage_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_ajustage_etalon` (
  `Id_Mesure_Ajustage_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL DEFAULT '0',
  `Date_Heure_Mesure` datetime NOT NULL,
  PRIMARY KEY (`Id_Mesure_Ajustage_Etalon`,`Id_Serveur_BDD`) USING BTREE,
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Date_Heure` (`Date_Heure_Mesure`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_etalon`
--

DROP TABLE IF EXISTS `tm_mesures_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_etalon` (
  `Id_Mesure_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Est_Valeur_Null` tinyint NOT NULL,
  `Date_Heure` datetime NOT NULL,
  `Message_Erreur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`Id_Mesure_Etalon`,`Id_Serveur_BDD`),
  KEY `IDX_Valeur_Brute` (`Valeur_Brute`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Est_Valeur_Null` (`Est_Valeur_Null`),
  KEY `IDX_Date_Heure` (`Date_Heure`),
  KEY `IDX_Message_Erreur` (`Message_Erreur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_etalonnage`
--

DROP TABLE IF EXISTS `tm_mesures_etalonnage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_etalonnage` (
  `Id_Mesure_Etalonnage` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Mesure` datetime NOT NULL,
  `Sonde_Numero_serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Mesure_Sonde` float DEFAULT NULL,
  `Mesure_Etalon` float DEFAULT NULL,
  PRIMARY KEY (`Id_Mesure_Etalonnage`,`Id_Serveur_BDD`),
  KEY `IDX_Sonde_Numero_serie` (`Sonde_Numero_serie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_gso`
--

DROP TABLE IF EXISTS `tm_mesures_gso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso` (
  `Id_mesures_gso` int NOT NULL AUTO_INCREMENT,
  `id_capteur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tep` float DEFAULT NULL,
  `unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `date_mesure` datetime NOT NULL,
  `trame` binary(8) DEFAULT NULL,
  `rssi` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tension` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `COM_sonde` float DEFAULT NULL,
  PRIMARY KEY (`id_capteur`,`date_mesure`) USING BTREE,
  KEY `Id_mesures_gso` (`Id_mesures_gso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_AFT_INS_MES_GSO` AFTER INSERT ON `tm_mesures_gso` FOR EACH ROW BEGIN

IF NEW.id_capteur IN(SELECT Adresse_Sonde from v_config_lieu_sonde) AND NEW.trame IN(00000000,00000001,10000000) AND NEW.date_mesure >= NOW() - INTERVAL 192 HOUR THEN

        INSERT INTO tm_mesures_gso_build

            (Date_Heure_Mesure, Valeur_Brute, Unite, Adresse_Sonde, Rssi, Tension,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Est_Valeur_Memoire,Planning_Actif,Planning_Regle_Existe)

        VALUES

            (NEW.date_mesure,

             NEW.tep,

             NEW.unite,

             NEW.id_capteur,

             NEW.rssi,

             NEW.tension,

				 NEW.COM_sonde,

				 (IF (NEW.trame=10000000,1,0)),

				 (SELECT Id_Lieu from v_config_lieu_sonde WHERE NEW.id_capteur=v_config_lieu_sonde.Adresse_Sonde),

				 (IF (NEW.date_mesure <= NOW() - INTERVAL 45 MINUTE,1,0)),

				 (SELECT Planning_Actif from v_config_lieu_sonde WHERE NEW.id_capteur=v_config_lieu_sonde.Adresse_Sonde),

				 (SELECT Planning_Regle_Existe from v_config_lieu_sonde WHERE NEW.id_capteur=v_config_lieu_sonde.Adresse_Sonde)

				 );

END IF;



IF NEW.id_capteur IN(SELECT Adresse_Sonde from v_config_sonde_com) AND NEW.trame IN(00000010,00000110) AND NEW.date_mesure >= NOW() - INTERVAL 2 HOUR THEN

        INSERT INTO tm_mesures_ajustage

            (Date_Heure_Mesure, Valeur_Brute, Unite, Adresse_Sonde)

        VALUES

            (NEW.date_mesure,

             NEW.tep,

             NEW.unite,

             NEW.id_capteur);

END IF;



IF NEW.id_capteur IN(SELECT Adresse_Sonde from v_config_sonde_com) AND NEW.trame IN(00000010,00000110) AND NEW.date_mesure >= NOW() - INTERVAL 2 HOUR THEN

        INSERT INTO tm_mesures_etalonnage

            (Valeur,Date_Heure_Mesure, Valeur_Brute, Unite, Adresse_Sonde)

        VALUES(

        (ROUND(((NEW.tep) * (SELECT v_config_sonde_com.coeff_a FROM v_config_sonde_com WHERE NEW.id_capteur=v_config_sonde_com.Adresse_Sonde))

		+ (SELECT v_config_sonde_com.coeff_b FROM v_config_sonde_com WHERE NEW.id_capteur=v_config_sonde_com.Adresse_Sonde)

		+ (SELECT v_config_sonde_com.Sonde_Offset FROM v_config_sonde_com WHERE NEW.id_capteur=v_config_sonde_com.Adresse_Sonde),2)),			 

			 NEW.date_mesure,

             NEW.tep,

             NEW.unite,

             NEW.id_capteur			

);

END IF;





IF NEW.trame IN(00000010,00000110) AND NEW.date_mesure >= NOW() - INTERVAL 2 HOUR THEN

	UPDATE tm_mesures_gso_read_metro

	SET

	tm_mesures_gso_read_metro.Metro_en_cours=1,

	tm_mesures_gso_read_metro.Dernier_Date_MAJ=NEW.date_mesure

	WHERE tm_mesures_gso_read_metro.GSO_SN=left(NEW.id_capteur,(length(NEW.id_capteur)-2));

END IF;



END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tm_mesures_gso_build`
--

DROP TABLE IF EXISTS `tm_mesures_gso_build`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso_build` (
  `Date_Heure_Mesure` datetime DEFAULT NULL,
  `Valeur` float DEFAULT NULL,
  `Valeur_Brute` float DEFAULT NULL,
  `Est_Valeur_Memoire` tinyint(1) NOT NULL DEFAULT '0',
  `Planning_Regle_Existe` tinyint(1) DEFAULT '0',
  `Planning_Actif` tinyint(1) DEFAULT '0',
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Adresse_Sonde` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `COM_sonde` float DEFAULT NULL,
  `Est_Mesure_Repeteur_GSO` float DEFAULT '0',
  `Id_Lieu` int NOT NULL DEFAULT '0',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Rssi` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tension` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_AFT_INS_MES_GSO_BUILD` AFTER INSERT ON `tm_mesures_gso_build` FOR EACH ROW BEGIN



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=0 AND (NEW.Planning_Regle_Existe=0 OR NEW.Planning_Regle_Existe=1) THEN

INSERT INTO tm_mesures (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Rssi,Tension,Est_Valeur_Memoire,Planning_Actif,Planning_Regle_Existe)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.COM_sonde, NEW.Est_Mesure_Repeteur_GSO,NEW.Id_Lieu, NEW.Rssi, NEW.Tension, NEW.Est_Valeur_Memoire, NEW.Planning_Actif, NEW.Planning_Regle_Existe

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=0 AND (NEW.Planning_Regle_Existe=0 OR NEW.Planning_Regle_Existe=1) THEN

INSERT INTO tm_graphique (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,Id_Lieu)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.Id_Lieu

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=1 AND NEW.Planning_Regle_Existe=0 THEN

INSERT INTO tm_mesures (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Rssi,Tension,Est_Valeur_Memoire,Planning_Actif,Planning_Regle_Existe)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.COM_sonde, NEW.Est_Mesure_Repeteur_GSO, NEW.Id_Lieu, NEW.Rssi, NEW.Tension, NEW.Est_Valeur_Memoire, NEW.Planning_Actif, NEW.Planning_Regle_Existe

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=1 AND NEW.Planning_Regle_Existe=0 THEN

INSERT INTO tm_graphique (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,Id_Lieu)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.Id_Lieu

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=1 AND NEW.Planning_Regle_Existe=1 THEN

INSERT INTO tm_mesures (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Rssi,Tension,Est_Valeur_Memoire,Planning_Actif, Planning_Regle_Existe)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT IFNULL((SELECT Consigne_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL)))

,(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT IFNULL((SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL)))

,(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT IFNULL((SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.COM_sonde, NEW.Est_Mesure_Repeteur_GSO, NEW.Id_Lieu, NEW.Rssi, NEW.Tension, NEW.Est_Valeur_Memoire, NEW.Planning_Actif, NEW.Planning_Regle_Existe

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=0 AND NEW.Est_Valeur_Memoire=1 AND NEW.Planning_Regle_Existe=1 THEN

INSERT INTO tm_graphique (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,Id_Lieu)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT IFNULL((SELECT Consigne_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL)))

,(SELECT Consigne FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT IFNULL((SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL)))

,(SELECT Consigne_Sup_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT IFNULL((SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Consigne_Inf_Corr FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.Id_Lieu

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=1 AND NEW.Est_Valeur_Memoire=0 THEN

INSERT INTO tm_mesures (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Rssi,Tension,Est_Valeur_Memoire,Planning_Actif, Planning_Regle_Existe)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.COM_sonde, NEW.Est_Mesure_Repeteur_GSO, NEW.Id_Lieu, NEW.Rssi, NEW.Tension, NEW.Est_Valeur_Memoire, NEW.Planning_Actif, NEW.Planning_Regle_Existe

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=1 AND NEW.Est_Valeur_Memoire=0 THEN

INSERT INTO tm_graphique (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,Id_Lieu)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.Id_Lieu

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=1 AND NEW.Est_Valeur_Memoire=1 THEN

INSERT INTO tm_mesures (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,COM_sonde,Est_Mesure_Repeteur_GSO,Id_Lieu,Rssi,Tension,Est_Valeur_Memoire,Planning_Actif, Planning_Regle_Existe)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT IFNULL

(

(SELECT Consigne_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Consigne_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT IFNULL

(

(SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Tolerance_Surveillance_Sup_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT IFNULL

(

(SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Tolerance_Surveillance_Inf_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.COM_sonde, NEW.Est_Mesure_Repeteur_GSO, NEW.Id_Lieu, NEW.Rssi, NEW.Tension, NEW.Est_Valeur_Memoire, NEW.Planning_Actif, NEW.Planning_Regle_Existe

);

END IF;



IF NEW.Id_Lieu IN (SELECT Id_Lieu FROM v_config_lieu_sonde) AND NEW.Planning_Actif=1 AND NEW.Est_Valeur_Memoire=1 THEN

INSERT INTO tm_graphique (Valeur,Sonde_Numero_Serie,Consigne,Consigne_Sup,Consigne_Inf,Consigne_Sup_Pre_Alarme,Consigne_Inf_Pre_Alarme,Date_Heure_Mesure,Valeur_Brute,Unite,Adresse_Sonde,Id_Lieu)

VALUES(

(ROUND((((NEW.Valeur_Brute) * (SELECT v_config_lieu_sonde.coeff_a FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT v_config_lieu_sonde.coeff_b FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu))

+ (SELECT Sonde_Offset FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

+ (SELECT `-(EJ)` FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),2)),

(SELECT Sonde_Numero_Serie FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT IFNULL

(

(SELECT Consigne_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Consigne_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT IFNULL

(

(SELECT Tolerance_Surveillance_Sup_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Tolerance_Surveillance_Sup_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT IFNULL

(

(SELECT Tolerance_Surveillance_Inf_Apres FROM v_config_lieu_planning_consignes

WHERE (NEW.Id_Lieu=v_config_lieu_planning_consignes.Id_Lieu)

AND ((NEW.Date_Heure_Mesure BETWEEN v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement)

OR (NEW.Date_Heure_Mesure>v_config_lieu_planning_consignes.Date_Heure_Debut_Changement AND v_config_lieu_planning_consignes.Date_Heure_Fin_Changement IS NULL))LIMIT 1)

,(SELECT Tolerance_Surveillance_Inf_Base FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu)

)

),

(SELECT Consigne_Sup_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

(SELECT Consigne_Inf_Pre_Alarme FROM v_config_lieu_sonde WHERE NEW.Id_Lieu=v_config_lieu_sonde.Id_Lieu),

NEW.Date_Heure_Mesure, NEW.Valeur_Brute, NEW.Unite, NEW.Adresse_Sonde, NEW.Id_Lieu

);

END IF;



END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tm_mesures_gso_commandes_mem`
--

DROP TABLE IF EXISTS `tm_mesures_gso_commandes_mem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso_commandes_mem` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `GSO_SN` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Port_Serie_Send_GSO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commande_Globale_Begin` float NOT NULL DEFAULT '0',
  `Commande_Globale_End` float NOT NULL DEFAULT '0',
  `Missing_Data_Total` float NOT NULL DEFAULT '0',
  `Commande_Mem_Globale` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Calcul` datetime NOT NULL,
  `Statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `Date_Heure_Demande_Mem` datetime DEFAULT NULL,
  PRIMARY KEY (`GSO_SN`,`Commande_Globale_Begin`,`Commande_Globale_End`,`Missing_Data_Total`) USING BTREE,
  KEY `Id` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_AFT_INS_GSO_CMD_MEM` BEFORE INSERT ON `tm_mesures_gso_commandes_mem` FOR EACH ROW BEGIN

IF NEW.Port_Serie_Send_GSO IS NULL THEN

SET NEW.Port_Serie_Send_GSO=(SELECT DISTINCT v_config_sonde_com.Port_Serie_Send_GSO FROM v_config_sonde_com

WHERE v_config_sonde_com.GSO_SN = NEW.GSO_SN);

END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tm_mesures_gso_count_mem`
--

DROP TABLE IF EXISTS `tm_mesures_gso_count_mem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso_count_mem` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `GSO_SN` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Port_Serie_Send_GSO` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Missing_Data_Begin` float NOT NULL DEFAULT '0',
  `Missing_Data_End` float NOT NULL DEFAULT '0',
  `Missing_Data_Total` float NOT NULL DEFAULT '0',
  `Commande_Mem` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '0 : a emettre - 1 : commande emise',
  `date_calcul` datetime NOT NULL,
  `Date_Heure_Demande_Mem` datetime DEFAULT NULL,
  PRIMARY KEY (`GSO_SN`,`Missing_Data_Begin`,`Missing_Data_End`,`date_calcul`) USING BTREE,
  KEY `Id` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_BEF_INS_GSO_COUNT` BEFORE INSERT ON `tm_mesures_gso_count_mem` FOR EACH ROW BEGIN

SET NEW.Port_Serie_Send_GSO=(SELECT DISTINCT v_config_sonde_com.Port_Serie_Send_GSO FROM v_config_sonde_com

WHERE v_config_sonde_com.GSO_SN = NEW.GSO_SN);

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tm_mesures_gso_read_mem`
--

DROP TABLE IF EXISTS `tm_mesures_gso_read_mem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso_read_mem` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `GSO_SN` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Ecart` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Read_Mem` datetime DEFAULT NULL,
  KEY `Id` (`Id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_AFT_INS_GSO_READ_MEM` AFTER INSERT ON `tm_mesures_gso_read_mem` FOR EACH ROW BEGIN

IF NEW.Ecart='0-1' AND NEW.GSO_SN IN (SELECT v.GSO_SN FROM v_config_sonde_com v WHERE v.Metrologie_en_cours=1) THEN

INSERT IGNORE INTO tm_mesures_gso_read_metro (GSO_SN, Commande_metro, Commande_metro_envoyee, Dernier_Date_MAJ)

VALUES (NEW.GSO_SN, NEW.Ecart,1, NEW.Date_Heure_Read_Mem);

END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tm_mesures_gso_read_metro`
--

DROP TABLE IF EXISTS `tm_mesures_gso_read_metro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_gso_read_metro` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `GSO_SN` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Commande_metro` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Commande_metro_envoyee` tinyint(1) NOT NULL DEFAULT '0',
  `Metro_en_cours` tinyint(1) NOT NULL DEFAULT '0',
  `Dernier_Date_MAJ` datetime DEFAULT NULL,
  PRIMARY KEY (`GSO_SN`,`Commande_metro`),
  KEY `Id` (`Id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_histo`
--

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
  `Unite` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_test`
--

DROP TABLE IF EXISTS `tm_mesures_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_test` (
  `Id_Mesure_Test` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Sonde_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mesures_test_etalon`
--

DROP TABLE IF EXISTS `tm_mesures_test_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mesures_test_etalon` (
  `Id_Mesure_Test_Etalon` int NOT NULL AUTO_INCREMENT,
  `Id_Serveur_BDD` int NOT NULL DEFAULT '0',
  `Valeur_Brute` float NOT NULL,
  `Etalon_Numero_Serie` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_mode_degrade`
--

DROP TABLE IF EXISTS `tm_mode_degrade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_mode_degrade` (
  `Id_Mode_Degrade` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Date_Heure_Creation` datetime DEFAULT NULL,
  `Requete_SQL` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Archivee` tinyint(1) NOT NULL DEFAULT '0',
  `Date_Heure_Archive` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Mode_Degrade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_parametre`
--

DROP TABLE IF EXISTS `tm_parametre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_parametre` (
  `Id_Parametre` int NOT NULL AUTO_INCREMENT,
  `Cle_Parametre` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Valeur_Parametre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Groupe_Parametre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Commentaire_Parametre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Parametre`,`Cle_Parametre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_remontee_plage_gsp`
--

DROP TABLE IF EXISTS `tm_remontee_plage_gsp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_remontee_plage_gsp` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int NOT NULL,
  `GSP_SN` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Date_Heure_Debut` datetime NOT NULL,
  `Date_Heure_Fin` datetime NOT NULL,
  `Statut` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'A_FAIRE',
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Derniere_Maj` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Nb_Tentatives` int NOT NULL DEFAULT '0',
  `Derniere_Erreur` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`Id`),
  KEY `IDX_tm_remontee_plage_gsp_lieu_sonde_statut` (`Id_Lieu`,`GSP_SN`,`Statut`),
  KEY `IDX_tm_remontee_plage_gsp_debut` (`Date_Heure_Debut`),
  KEY `IDX_tm_remontee_plage_gsp_fin` (`Date_Heure_Fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tm_vigilog_mesure`
--

DROP TABLE IF EXISTS `tm_vigilog_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tm_vigilog_mesure` (
  `Id_VigiLog_Mesure` int NOT NULL AUTO_INCREMENT,
  `Id_VigiLog_Tournee` int NOT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Date_Heure_Mesure` datetime NOT NULL,
  `Valeur` decimal(10,2) DEFAULT NULL,
  `Est_Hors_Limites` tinyint(1) NOT NULL DEFAULT '0',
  `Est_En_Alarme` tinyint(1) NOT NULL DEFAULT '0',
  `Est_Marqueur` tinyint(1) NOT NULL DEFAULT '0',
  `Details` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Import` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_VigiLog_Mesure`),
  UNIQUE KEY `UK_tm_vigilog_mesure_unique` (`Id_VigiLog_Tournee`,`Date_Heure_Mesure`,`Numero_Ordre`),
  KEY `IDX_tm_vigilog_mesure_tournee` (`Id_VigiLog_Tournee`),
  KEY `IDX_tm_vigilog_mesure_date` (`Date_Heure_Mesure`),
  KEY `IDX_tm_vigilog_mesure_alarm` (`Est_En_Alarme`),
  KEY `IDX_tm_vigilog_mesure_marker` (`Est_Marqueur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `v_compteur_valeurs_gso`
--

DROP TABLE IF EXISTS `v_compteur_valeurs_gso`;
/*!50001 DROP VIEW IF EXISTS `v_compteur_valeurs_gso`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_compteur_valeurs_gso` AS SELECT 
 1 AS `Adresse_Sonde`,
 1 AS `quart_0_4=4m`,
 1 AS `quart_4_8=4m`,
 1 AS `quart_8_16=8m`,
 1 AS `quart_16_32=16m`,
 1 AS `quart_32_64=32m`,
 1 AS `quart_64_128=64m`,
 1 AS `quart_128_256=128m`,
 1 AS `quart_256_512=256m`,
 1 AS `quart_512_700=188m`,
 1 AS `Total`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_config_lieu_planning_consignes`
--

DROP TABLE IF EXISTS `v_config_lieu_planning_consignes`;
/*!50001 DROP VIEW IF EXISTS `v_config_lieu_planning_consignes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_config_lieu_planning_consignes` AS SELECT 
 1 AS `Id_Lieu`,
 1 AS `Date_Heure_Debut_Changement`,
 1 AS `Date_Heure_Fin_Changement`,
 1 AS `Consigne_Apres`,
 1 AS `Tolerance_Surveillance_Sup_Apres`,
 1 AS `Tolerance_Surveillance_Inf_Apres`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_config_lieu_sonde`
--

DROP TABLE IF EXISTS `v_config_lieu_sonde`;
/*!50001 DROP VIEW IF EXISTS `v_config_lieu_sonde`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_config_lieu_sonde` AS SELECT 
 1 AS `Id_Lieu`,
 1 AS `Sonde_Numero_Serie`,
 1 AS `GSO_SN`,
 1 AS `Port_Serie`,
 1 AS `Adresse_Sonde`,
 1 AS `Date_Heure_Surveillance_On`,
 1 AS `Planning_Actif`,
 1 AS `Planning_Regle_Existe`,
 1 AS `Consigne`,
 1 AS `Consigne_Sup_Corr`,
 1 AS `Consigne_Inf_Corr`,
 1 AS `Consigne_Sup_Pre_Alarme`,
 1 AS `Consigne_Inf_Pre_Alarme`,
 1 AS `Consigne_Base`,
 1 AS `Tolerance_Surveillance_Sup_Base`,
 1 AS `Tolerance_Surveillance_Inf_Base`,
 1 AS `Retard_Haut`,
 1 AS `Retard_Bas`,
 1 AS `Sonde_Offset`,
 1 AS `coeff_a`,
 1 AS `coeff_b`,
 1 AS `-(EJ)`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_config_sonde_com`
--

DROP TABLE IF EXISTS `v_config_sonde_com`;
/*!50001 DROP VIEW IF EXISTS `v_config_sonde_com`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_config_sonde_com` AS SELECT 
 1 AS `Adresse_Sonde`,
 1 AS `GSO_SN`,
 1 AS `Etat_Sonde`,
 1 AS `Metrologie_en_cours`,
 1 AS `Metrologie_cmd_envoyee`,
 1 AS `Port_Serie_Send_GSO`,
 1 AS `Port_Serie_Real`,
 1 AS `Sonde_Offset`,
 1 AS `coeff_a`,
 1 AS `coeff_b`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'vigi_mesures'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `EVT_CALCUL_MESURE_MEM_GSO` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50106 EVENT `EVT_CALCUL_MESURE_MEM_GSO` ON SCHEDULE EVERY 45 MINUTE STARTS '2026-08-16 07:21:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

INSERT IGNORE INTO tm_mesures_gso_count_mem

(GSO_SN,Missing_Data_Begin,Missing_Data_End,Missing_Data_Total,Commande_Mem,date_calcul)



WITH RECURSIVE slots AS (

    SELECT 1 AS slot_index

    UNION ALL

    SELECT slot_index + 1

    FROM slots

    WHERE slot_index < 699

),



base_time AS (

    SELECT FROM_UNIXTIME(

        FLOOR(UNIX_TIMESTAMP(NOW()) / 900) * 900

    ) AS ref_time

),



sondes_param AS (

    SELECT

        s.Adresse_Sonde,

        s.Date_Heure_Surveillance_On,

        LEAST(

            699,

            FLOOR(

                TIMESTAMPDIFF(

                    MINUTE,

                    s.Date_Heure_Surveillance_On,

                    b.ref_time

                ) / 15

            )

        ) AS max_slot

    FROM v_config_lieu_sonde s

    CROSS JOIN base_time b

),



mesures_indexees AS (

    SELECT

        m.Adresse_Sonde,

        FLOOR(

            TIMESTAMPDIFF(

                MINUTE,

                m.Date_Heure_Mesure,

                b.ref_time

            ) / 15

        ) AS slot_index

    FROM tm_mesures m

    CROSS JOIN base_time b

    WHERE m.Date_Heure_Mesure >= b.ref_time - INTERVAL 10500 MINUTE

),



slots_sondes AS (

    SELECT

        sp.Adresse_Sonde,

        sl.slot_index,

        CAST(700 - sl.slot_index AS SIGNED) AS numero_releve

    FROM sondes_param sp

    JOIN slots sl

      ON sl.slot_index <= sp.max_slot

),



manquants AS (

    SELECT

        ss.Adresse_Sonde,

        ss.slot_index,

        ss.numero_releve

    FROM slots_sondes ss

    LEFT JOIN mesures_indexees mi

        ON mi.Adresse_Sonde = ss.Adresse_Sonde

       AND mi.slot_index = ss.slot_index

    WHERE mi.slot_index IS NULL

),



groupes AS (

    SELECT

        Adresse_Sonde,

        numero_releve,

        CAST(numero_releve AS SIGNED) -

        CAST(

            ROW_NUMBER() OVER (

                PARTITION BY Adresse_Sonde

                ORDER BY numero_releve

            ) AS SIGNED

        ) AS grp

    FROM manquants

)



SELECT

    LEFT(Adresse_Sonde,(length(Adresse_Sonde) - 2)) AS GSO_SN,

    MIN(numero_releve) AS debut,

    MAX(numero_releve) AS fin,

    COUNT(*) AS taille,

    CONCAT(

        '$<EDDT:',

        LEFT(Adresse_Sonde,(length(Adresse_Sonde) - 2)),

        '(',

        GREATEST (MIN(numero_releve)-3,1),

        '-',

        LEAST (MAX(numero_releve)+3,700),

        ')>'

    ) AS commande,

    NOW() AS Date_Heure_Requete

FROM groupes

GROUP BY Adresse_Sonde, grp

HAVING COUNT(*) >= 3;



INSERT IGNORE INTO tm_mesures_gso_commandes_mem

(GSO_SN,Port_Serie_Send_GSO,Commande_Globale_Begin,Commande_Globale_End,Missing_Data_Total,Commande_Mem_Globale,Date_Calcul)



SELECT GSO_SN, Port_Serie_Send_GSO,Missing_Data_Begin,Missing_Data_End,Missing_Data_Total,Commande_Mem,date_calcul

FROM tm_mesures_gso_count_mem;



DELETE FROM tm_mesures_gso_count_mem;



END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `EVT_CLEAN_GRAPH_MES_GSO` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50106 EVENT `EVT_CLEAN_GRAPH_MES_GSO` ON SCHEDULE EVERY 1 HOUR STARTS '2026-01-21 12:00:00' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN

DELETE FROM tm_graphique WHERE ((tm_graphique.Date_Heure_Mesure<DATE_SUB(NOW(), INTERVAL 72 HOUR)));

DELETE FROM tm_graphique WHERE ((tm_graphique.Date_Heure_Mesure>DATE_SUB(NOW(), INTERVAL -48 HOUR)));

DELETE FROM tm_mesures WHERE ((tm_mesures.Date_Heure_Mesure>DATE_SUB(NOW(), INTERVAL -48 HOUR)));

DELETE FROM tm_mesures_gso WHERE ((tm_mesures_gso.date_mesure<DATE_SUB(NOW(), INTERVAL 720 HOUR)));

DELETE FROM tm_mesures_gso_build WHERE ((tm_mesures_gso_build.Date_Heure_Mesure<DATE_SUB(NOW(), INTERVAL 720 HOUR)));

DELETE FROM tm_mesures_gso_commandes_mem WHERE ((tm_mesures_gso_commandes_mem.Date_Calcul<DATE_SUB(NOW(), INTERVAL 24 HOUR)));

DELETE FROM tm_mesures WHERE tm_mesures.Id_Lieu=0;

DELETE FROM tm_graphique WHERE tm_graphique.Id_Lieu=0;

DELETE FROM tm_mesures_ajustage WHERE ((tm_mesures_ajustage.Date_Heure_Mesure<DATE_SUB(NOW(), INTERVAL 24 HOUR)));

DELETE FROM tm_mesures_etalonnage WHERE ((tm_mesures_etalonnage.Date_Heure_Mesure<DATE_SUB(NOW(), INTERVAL 24 HOUR)));

DELETE FROM tm_mesures_gso_read_metro WHERE ((tm_mesures_gso_read_metro.Dernier_Date_MAJ<DATE_SUB(NOW(), INTERVAL 2 HOUR)));

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Final view structure for view `v_compteur_valeurs_gso`
--

/*!50001 DROP VIEW IF EXISTS `v_compteur_valeurs_gso`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `v_compteur_valeurs_gso` AS select `tm_mesures`.`Adresse_Sonde` AS `Adresse_Sonde`,sum((case when (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 1 hour)) then 1 else 0 end)) AS `quart_0_4=4m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 1 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 2 hour))) then 1 else 0 end)) AS `quart_4_8=4m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 2 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 4 hour))) then 1 else 0 end)) AS `quart_8_16=8m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 4 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 8 hour))) then 1 else 0 end)) AS `quart_16_32=16m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 8 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 16 hour))) then 1 else 0 end)) AS `quart_32_64=32m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 16 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 32 hour))) then 1 else 0 end)) AS `quart_64_128=64m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 32 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 64 hour))) then 1 else 0 end)) AS `quart_128_256=128m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 64 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 128 hour))) then 1 else 0 end)) AS `quart_256_512=256m`,sum((case when ((`tm_mesures`.`Date_Heure_Mesure` < (now() - interval 128 hour)) and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 175 hour))) then 1 else 0 end)) AS `quart_512_700=188m`,sum((`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 10500 minute))) AS `Total` from `tm_mesures` where ((`tm_mesures`.`Adresse_Sonde` like '1__%') and (`tm_mesures`.`Date_Heure_Mesure` >= (now() - interval 175 hour))) group by `tm_mesures`.`Adresse_Sonde` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_config_lieu_planning_consignes`
--

/*!50001 DROP VIEW IF EXISTS `v_config_lieu_planning_consignes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `v_config_lieu_planning_consignes` AS select `pl`.`Id_Lieu` AS `Id_Lieu`,`pl`.`Date_Heure_Debut_Changement` AS `Date_Heure_Debut_Changement`,`pl`.`Date_Heure_Fin_Changement` AS `Date_Heure_Fin_Changement`,`pl`.`Consigne_Apres` AS `Consigne_Apres`,`pl`.`Tolerance_Surveillance_Sup_Apres` AS `Tolerance_Surveillance_Sup_Apres`,`pl`.`Tolerance_Surveillance_Inf_Apres` AS `Tolerance_Surveillance_Inf_Apres` from `vigi_main`.`t_lieu_planning_audit` `pl` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_config_lieu_sonde`
--

/*!50001 DROP VIEW IF EXISTS `v_config_lieu_sonde`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `v_config_lieu_sonde` AS select `l`.`Id_Lieu` AS `Id_Lieu`,`l`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,left(`s`.`Adresse_Sonde`,(length(`s`.`Adresse_Sonde`) - 2)) AS `GSO_SN`,`s`.`Port_Serie` AS `Port_Serie`,`l`.`Adresse_Sonde` AS `Adresse_Sonde`,`l`.`Date_Heure_Surveillance_On` AS `Date_Heure_Surveillance_On`,`l`.`Planning_Actif` AS `Planning_Actif`,`l`.`Planning_Regle_Existe` AS `Planning_Regle_Existe`,`l`.`Consigne` AS `Consigne`,`l`.`Tolerance_Surveillance_Sup` AS `Consigne_Sup_Corr`,`l`.`Tolerance_Surveillance_Inf` AS `Consigne_Inf_Corr`,`l`.`Consigne_Sup_Pre_Alarme` AS `Consigne_Sup_Pre_Alarme`,`l`.`Consigne_Inf_Pre_Alarme` AS `Consigne_Inf_Pre_Alarme`,`l`.`Consigne_Base` AS `Consigne_Base`,`l`.`Tolerance_Surveillance_Sup_Base` AS `Tolerance_Surveillance_Sup_Base`,`l`.`Tolerance_Surveillance_Inf_Base` AS `Tolerance_Surveillance_Inf_Base`,`l`.`Retard_Alarme_Haut` AS `Retard_Haut`,`l`.`Retard_Alarme_Bas` AS `Retard_Bas`,`s`.`Sonde_Offset` AS `Sonde_Offset`,ifnull(`aj`.`Coeff_X`,1) AS `coeff_a`,ifnull(`aj`.`Coeff_Constant`,0) AS `coeff_b`,round(ifnull(-((select `l`.`Derniere_Erreur_Justesse` from DUAL  where (`l`.`Est_Correction_Ej` = 1))),0),2) AS `-(EJ)` from ((`vigi_main`.`t_lieu` `l` left join `vigi_main`.`t_sonde` `s` on((`s`.`Sonde_Numero_Serie` = `l`.`Sonde_Numero_Serie`))) left join (select `x`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,`x`.`Coeff_X` AS `Coeff_X`,`x`.`Coeff_Constant` AS `Coeff_Constant` from (select `vigi_main`.`t_ajustage`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,`vigi_main`.`t_ajustage`.`Coeff_X` AS `Coeff_X`,`vigi_main`.`t_ajustage`.`Coeff_Constant` AS `Coeff_Constant`,row_number() OVER (PARTITION BY `vigi_main`.`t_ajustage`.`Sonde_Numero_Serie` ORDER BY `vigi_main`.`t_ajustage`.`Date_Heure_Ajustage` desc )  AS `rn` from `vigi_main`.`t_ajustage`) `x` where (`x`.`rn` = 1)) `aj` on((`aj`.`Sonde_Numero_Serie` = `s`.`Sonde_Numero_Serie`))) where ((`l`.`Est_Lieu_GSO` = 1) and (`l`.`Lieu_Etat` = 'S')) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_config_sonde_com`
--

/*!50001 DROP VIEW IF EXISTS `v_config_sonde_com`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `v_config_sonde_com` AS select `s`.`Adresse_Sonde` AS `Adresse_Sonde`,left(`s`.`Adresse_Sonde`,(length(`s`.`Adresse_Sonde`) - 2)) AS `GSO_SN`,`s`.`Etat_Sonde` AS `Etat_Sonde`,`s`.`Metrologie_en_cours` AS `Metrologie_en_cours`,`s`.`Metrologie_cmd_envoyee` AS `Metrologie_cmd_envoyee`,`m`.`Port_Serie_Send_GSO` AS `Port_Serie_Send_GSO`,`m`.`Port_Serie` AS `Port_Serie_Real`,`s`.`Sonde_Offset` AS `Sonde_Offset`,ifnull(`aj`.`Coeff_X`,1) AS `coeff_a`,ifnull(`aj`.`Coeff_Constant`,0) AS `coeff_b` from ((`vigi_main`.`t_sonde` `s` join `vigi_main`.`t_module` `m` on((`m`.`Port_Serie` = `s`.`Port_Serie`))) left join (select `x`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,`x`.`Coeff_X` AS `Coeff_X`,`x`.`Coeff_Constant` AS `Coeff_Constant` from (select `ta`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,`ta`.`Coeff_X` AS `Coeff_X`,`ta`.`Coeff_Constant` AS `Coeff_Constant`,row_number() OVER (PARTITION BY `ta`.`Sonde_Numero_Serie` ORDER BY `ta`.`Date_Heure_Ajustage` desc )  AS `rn` from `vigi_main`.`t_ajustage` `ta`) `x` where (`x`.`rn` = 1)) `aj` on((`aj`.`Sonde_Numero_Serie` = `s`.`Sonde_Numero_Serie`))) where (`s`.`Est_Sonde_GSO` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- =====================================================================
-- Donnees d'installation communes MySQL / SQL Server
-- =====================================================================
USE `vigi_main`;
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `t_actionneur_type` VALUES (1,4,'IACTX Lumineux',1),(2,5,'IACTX Lumineux contact',1),(3,6,'IACTX Contact',1),(4,7,'IACTX Sonore',1);
INSERT INTO `t_autorisation`
  (`Code_Autorisation`,`Libelle_Autorisation`,`Commentaire`)
VALUES
  ('ACCES_DASHBOARD_UTILISATEUR','Accès dashboard utilisateur','Accès dashboard utilisateur'),
  ('ACCES_TABLEAU_BORD_UTILISATEUR','Accès tableau de bord utilisateur','Accès tableau de bord utilisateur'),
  ('ACCES_DASHBOARD_USER','Accès dashboard user','Accès dashboard user'),
  ('ACCES_SURVEILLANCE','Accès surveillance','Accès surveillance'),
  ('ACCES_VIGILOG','Accès VigiLog','Droit domaine VigiLog'),
  ('LIEU_VISUALISER','Visualiser les lieux','Visualiser les lieux'),
  ('ALARMES_GERER','Gérer les alarmes','Gérer les alarmes'),
  ('ACCES_DASHBOARD_ADMIN','Accès dashboard admin','Accès dashboard admin'),
  ('ACCES_TABLEAU_BORD_ADMIN','Accès tableau de bord admin','Accès tableau de bord admin'),
  ('ACCES_ADMIN','Accès admin','Accès admin'),
  ('ACCES_PARAMETRAGE_GENERAL','Accès paramétrage général','Accès paramétrage général'),
  ('PARAMETRAGE_GENERAL','Paramétrage général','Paramétrage général'),
  ('GERER_PROFIL','Gérer les profils','Gérer les profils'),
  ('PARAMETRES_GERER','Gérer les paramètres','Gérer les paramètres'),
  ('ACQUITTER_ALARME','Acquitter alarme','Acquitter alarme'),
  ('ACCES_ACQUITTEMENT_ALARME','Accès acquittement alarme','Accès acquittement alarme'),
  ('DESACTIVER_LIEU','Désactiver lieu','Désactiver lieu'),
  ('ACCES_DESACTIVATION_LIEU','Accès désactivation lieu','Accès désactivation lieu'),
  ('LIEU_ACTIV_DESACT','Activer/désactiver lieu','Activer/désactiver lieu'),
  ('PARAMETRER_LIEU','Paramétrer lieu','Paramétrer lieu'),
  ('ACCES_PARAMETRAGE_LIEU','Accès paramétrage lieu','Accès paramétrage lieu'),
  ('LIEU_GERER','Gérer les lieux','Gérer les lieux'),
  ('PARAMETRAGE_MATERIEL','Paramétrage matériel','Paramétrage matériel'),
  ('ACCES_PARAMETRAGE_MATERIEL','Accès paramétrage matériel','Accès paramétrage matériel'),
  ('ACCES_METROLOGIE','Accès métrologie','Accès métrologie'),
  ('ACCES_CONVERSATION','Accès conversation','Accès conversation'),
  ('MODULE_CONVERSATION','Module conversation','Module conversation'),
  ('REALISER_AJUSTAGE_ETALONNAGE','Réaliser ajustage étalonnage','Réaliser ajustage étalonnage'),
  ('ACCES_AJUSTAGE_ETALONNAGE','Accès ajustage étalonnage','Accès ajustage étalonnage'),
  ('ACQUITTER_ALARMES_MULTI_LIEUX','Acquitter plusieurs lieux','Acquitter des alarmes sur plusieurs lieux');
INSERT INTO `t_etalon_type` VALUES ('ES','VigiTemp Type ES','Sonde étalon radio type E',1,0,0.05),('EX','Externe','Sonde externe',1,1,0),('SEF','VigiTemp Type SEF','Sonde étalon filaire ou filaire/radio avec prise RJ45',1,0,0.02),('SPET','Sonde étalon platine','Sonde étalon GSP platine',1,0,0.02);
INSERT INTO `t_module_type` VALUES
(1,'BIN','Boîtier filaire avec prise DB9 (port série)',0),
(2,'BIR (filaire)','Boîtier réseau filaire avec prise RJ45 (prise réseau)',1),
(3,'BTR','Boîtier radio avec prise DB9 (port série)',0),
(4,'BIR (radio)','Boîtier réseau radio avec prise RJ45 (port série)',1),
(5,'CORONIS','Boîtier radio CORONIS avec prise DB9 (port série)',0),
(6,'MRH','Boîtier MRH',0),

(7,'IUSB','CLE USB RADIO SONDES I',0),
(8,'IETH','Module Ethernet',0),
(9,'GSO-U','Module GSO USB',0),
(10,'GSO-E','Module GSO Ethernet',0),
(11,'BINX','Boîtier filaire Ethernet',0),
(12,'SEF','Passerelle Sollae pour sonde étalon SEF',0);
INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`) VALUES ('CFR21','ACTIVATION_EXPIRATION_MOT_DE_PASSE','true','Activer l\'expiration des mots de passe (CFR21)'),('CFR21','ACTIVATION_NORME_CFR21','1','Activer la conformité CFR21 (saisie des configurations)'),('CFR21','EVENEMENTS','1','Activation des événements'),('CFR21','JOURS_VALIDITE_MOT_DE_PASSE','90',NULL),('CFR21','MOT_DE_PASSE_PERMANENT','1','Le mot de passe ne peut pas être changé par l\'utilisateur'),('CFR21','MOT_DE_PASSE_REUTILISABLE','0','L\'utilisateur ne peut pas réutiliser un ancien mot de passe'),('CFR21','NOMBRE_TENTATIVES_MOT_DE_PASSE','3','Nombre de tentatives autorisées avant verrouillage du compte'),('CFR21','REACTIVATION_ALARME_SONORE','500','Délai de réactivation de l\'alarme sonore en millisecondes'),('CFR21','SECURITE','0','Mode sécurité renforcé'),('CFR21','TEMPS_DECONNEXION_MINUTES','20','Temps d\'inactivité avant deconnexion automatique en minutes'),('CFR21','VALIDITE_MOT_DE_PASSE_JOURS','90','Durée de validité du mot de passe en jours'),('SECURITE_EMAIL','SMTP_ACTIVATION','true','Activer l\'envoi d\'emails'),('SECURITE_EMAIL','SMTP_CONFIRME','false','Configuration SMTP validée par code email'),('SECURITE_EMAIL','SMTP_EXPEDITEUR','','Adresse email expéditeur (doit correspondre au domaine SMTP)'),('SECURITE_EMAIL','SMTP_MOT_DE_PASSE','','Mot de passe SMTP'),('SECURITE_EMAIL','SMTP_PORT','587','Port SMTP (587 pour TLS, 465 pour SSL)'),('SECURITE_EMAIL','SMTP_SERVEUR','','Serveur SMTP pour l\'envoi d\'emails'),('SECURITE_EMAIL','SMTP_UTILISATEUR','','Utilisateur SMTP'),('SECURITE_MOT_DE_PASSE','LONGUEUR_MINIMALE','8','Longueur minimale du mot de passe'),('SECURITE_MOT_DE_PASSE','MIN_CARACTERES_SPECIAUX','1','Nombre minimum de caractères spéciaux'),('SECURITE_MOT_DE_PASSE','MIN_CHIFFRES','1','Nombre minimum de chiffres'),('SECURITE_MOT_DE_PASSE','MIN_LETTRES_MAJUSCULES','1','Nombre minimum de majuscules'),('SECURITE_MOT_DE_PASSE','MIN_LETTRES_MINUSCULES','1','Nombre minimum de minuscules');
INSERT INTO `t_profil` (`Id_Profil`, `Profil_Utilisateur`, `Commentaire`, `Est_MC2`, `Est_Archive`) VALUES
(1,'Administrateurs',NULL,0,0);
INSERT INTO `t_liaison_profil_autorisation` (`Id_Profil`,`Id_Autorisation`)
SELECT p.`Id_Profil`, a.`Id_Autorisation`
FROM `t_profil` p CROSS JOIN `t_autorisation` a
WHERE p.`Profil_Utilisateur`='Administrateurs';
INSERT INTO `t_etat_surveillance` VALUES (1,'A','En ajustage'),(2,'D','Surveillance désactivée'),(3,'E','En étalonnage'),(4,'S','Utilisée en surveillance'),(5,'T','En test');
INSERT INTO `t_sonde_type`
(
  `Id_Sonde_Type`,
  `Sonde_Type`,
  `Libelle_Sonde_Type`,
  `Est_Gestion_Relais`,
  `Est_Double_Capteur`,
  `Famille_Sonde`,
  `Unite`,
  `Valeur_Max`,
  `Valeur_Min`
)
VALUES
(1,'E','Sonde radio relais type E',1,0,'CLASSIC',NULL,NULL,NULL),
(2,'G','Sonde radio relais type G',1,0,'CLASSIC',NULL,NULL,NULL),
(3,'H','Sonde radio relais type H',1,0,'CLASSIC',NULL,NULL,NULL),
(4,'I','Sonde radio de type I',0,0,'CLASSIC',NULL,NULL,NULL),
(5,'R','Sonde radio',0,0,'CLASSIC',NULL,NULL,NULL),
(6,'V','Sonde filaire',0,0,'CLASSIC',NULL,NULL,NULL),

(9,'SOIT','Gemsense One Température interne',0,0,'GSO','°C',40,-30),
(10,'SOIH','Gemsense One Température & humidité interne',0,1,'GSO',NULL,NULL,NULL),
(11,'SOET','Gemsense One Température externe',0,0,'GSO','°C',125,-40),
(12,'SOEH','Gemsense One Température & humidité externe',0,1,'GSO',NULL,NULL,NULL),

(13,'SPNB','Gemsense Pro Numérique blanc',0,0,'GSP','°C',125,-40),
(14,'SPNG','Gemsense Pro Numérique gris',0,0,'GSP','°C',70,-40),

(15,'SPPS','Gemsense Pro platine',0,0,'GSP','°C',NULL,NULL),

(16,'SPAL','Gemsense Pro platine alimentaire',0,0,'GSP','°C',NULL,NULL),
(17,'SPPC','Gemsense Pro platine contact',0,0,'GSP','°C',NULL,NULL),
(18,'SPAU','Gemsense Pro platine autoclave',0,0,'GSP','°C',NULL,NULL),
(19,'SPCF','Gemsense Pro platine chambre froide',0,0,'GSP','°C',NULL,NULL),
(20,'SPMI','Gemsense Pro platine micro-capteur',0,0,'GSP','°C',NULL,NULL),

(21,'SPCO','Gemsense Pro CO2',0,0,'GSP','%',20,0),
(22,'SPHY','Gemsense Pro hygrométrie',0,0,'GSP','%',100,0),
(23,'SPTH','Gemsense Pro thermocouple',0,0,'GSP','°C',NULL,NULL),

(24,'SPDI','Gemsense Pro pression différentielle',0,0,'GSP',NULL,250,-250),
(25,'SPAT','Gemsense Pro pression atmosphérique',0,0,'GSP',NULL,1200,700),

(26,'SPLU','Gemsense Pro lumière',0,0,'GSP',NULL,NULL,NULL),
(27,'SP01','Gemsense Pro 0-1 Volt',0,0,'GSP',NULL,NULL,NULL),
(28,'SP42','Gemsense Pro 4-20 mA',0,0,'GSP',NULL,NULL,NULL),
(29,'SPOF','Gemsense Pro NO NF',0,0,'GSP',NULL,NULL,NULL),

(30,'SPXB','Gemsense Pro Ethernet numérique blanc',0,0,'GSP','°C',125,-40),
(31,'SPXG','Gemsense Pro Ethernet numérique gris',0,0,'GSP','°C',70,-40),
(32,'SPXP','Gemsense Pro Ethernet platine',0,0,'GSP','°C',NULL,NULL),

(33,'SPFB','Gemsense Pro filaire numérique blanc',0,0,'GSP','°C',125,-40),
(34,'SPFG','Gemsense Pro filaire numérique gris',0,0,'GSP','°C',70,-40),
(35,'SPFP','Gemsense Pro filaire platine',0,0,'GSP','°C',NULL,NULL);
INSERT INTO `t_utilisateur` (Login, Mot_De_Passe, Est_Archive, Profil_Utilisateur, Est_Mot_De_Passe_Temporaire, Date_Creation, Date_Derniere_Modification_MDP) VALUES ('admin', '$2b$10$T.LiYgCAdm3FVYteRBfFFucmrl5PqcqdGxr2sdcseukhGylhM2oKe', 0, 'Administrateurs', 1, NOW(), NOW());
SET FOREIGN_KEY_CHECKS=1;

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('VERSION', 'SCHEMA_VERSION', '0.91.0', 'Version de schéma VigiSensys')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('dashboard', 'surveillance_refresh', '15', 'Délai auto de rafraîchissement de la surveillance (secondes)')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('dashboard', 'show_null_non_response', 'false', 'Afficher les mesures de non-réponse (valeur null) sur la courbe et le tableau')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('dashboard', 'etalonnage_warning_days', '30', 'Nombre de jours avant expiration pour avertir sur la validité des étalonnages')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('notifications', 'alarm_email_recipients', '', 'Liste des destinataires des emails d''alarme (séparés par virgule, point-virgule ou retour ligne)')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

-- DONNEES COMPLEMENTAIRES (missing_data.sql)
INSERT IGNORE INTO `t_materiel` (`Id_Materiel`,`Ref_Commercial`,`Designation`,`Descriptif`,`Gamme`,`Type`) VALUES
  (1, 'M-GSO-U', 'Module de réception pour sondes GemSense One USB', 'USB\\r\\nLed d’activité\\r\\nAlimentation sur secteur', 'GSO', 'RADIO'),
  (2, 'M-GSO-E', 'Module de réception pour sondes GemSense One Ethernet', 'Ethernet RJ 45\\r\\nLed activité\\r\\nAlimentation sur secteur', 'GSO', 'RADIO'),
  (3, 'GSO-IT', 'Gemsense One Température interne', 'Fréquence de mesure 15 min fixe \\r\\nFonction mémoire (700 valeurs)\\r\\nPiles AAA*2 (2 ans selon utilisation)\\r\\nTempérature d\'utilisation : -20°C à 40°C', 'GSO', 'RADIO'),
  (4, 'GSO-ITH', 'Gemsense One Température & humidité interne', 'Fréquence de mesure 15 min fixe \\r\\nFonction mémoire (700 valeurs)\\r\\nPiles AAA*2 (2 ans selon utilisation)\\r\\nTempérature d\'utilisation : 10°C à 40°C\\r\\nDomaine d\'utilisation : 10%Hr à 90%Hr', 'GSO', 'RADIO'),
  (5, 'GSO-ET', 'Gemsense One Température externe', 'Fréquence de mesure 15 min fixe \\r\\nFonction mémoire (700 valeurs)\\r\\nPiles AAA*2 (2 ans selon utilisation)\\r\\nProtection : inox 316 L Ø 6 x 40 mm\\r\\nTempérature d\'utilisation : -40°C à 125°C', 'GSO', 'RADIO'),
  (6, 'GSO-ETH', 'Gemsense One Température & humidité externe', 'Fréquence de mesure 15 min fixe \\r\\nFonction mémoire (700 valeurs)\\r\\nPiles AAA*2 (2 ans selon utilisation)\\r\\nTempérature d\'utilisation : 10°C à 80°C\\r\\nDomaine d\'utilisation : 10%Hr à 90%Hr', 'GSO', 'RADIO'),
  (7, 'M-GSP', 'Module de réception pour sondes GemSense Pro Ethernet', 'Interface 10Base-T ou 100Base-TX\\r\\nConnecteur RJ45\\r\\nLed Link & activité\\r\\nSécurisé par mot de passe\\r\\nCPU : DSTni-EX\\r\\nMémoire : 256k SRAM 512Kb flash\\r\\nAlimentation sur secteur', 'GSP', 'RADIO'),
  (8, 'GSP-RN-BL', 'Gemsense Pro Numérique blanc', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 125°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C Câble long 3 m BLANC', 'GSP', 'RADIO'),
  (9, 'GSP-RN-GR', 'Gemsense Pro Numérique gris', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 70°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C  Câble long 3 m GRIS PLAT', 'GSP', 'RADIO'),
  (10, 'GSP-RP', 'Gemsense Pro platine', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nGaine de protection : acier inox 316 L, Ø 6 \\r\\nTempérature d\'utilisation : -200 à 200°C\\r\\nSonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils\\r\\nCâble de raccordement : PFA/PFA', 'GSP', 'RADIO'),
  (11, 'GSP-RP-ALIM', 'Gemsense Pro platine alimentaire', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nGaine de protection : acier inox 316 L - Ø 5 mm, \\r\\nlongueur utile : 150 mm\\r\\nPoignée : surmoulée silicone THT 250 °C - couleur rouge brique, longueur 130 mm\\r\\nSonde : Pt1000 céramique DIN IEC 60751 classe B, simple en montage A\\r\\nCâble de raccordement : silicone atoxique THT 250 °C continu - Alimentaire couleur rouge brique\\r\\nTempérature d\'utilisation : -50 à + 250 °C', 'GSP', 'RADIO'),
  (12, 'GSP-RP-CONT', 'Gemsense Pro platine contact', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de température\\r\\nSonde : Pt 100 CEI 60751 classe A, \\r\\nsimple enroulement, élément de mesure couche mince sous rétractable PFA\\r\\nSous film polyester \\r\\nTempérature d\'utilisation : -80+160 °C\\r\\nFixation par colle silicone sur surface dégraissée\\r\\nCâble de raccordement : PFA/PFA, section 0,09 mm², longueur 2 mètres, 3 conducteurs', 'GSP', 'RADIO'),
  (13, 'GSP-RP-AU', 'Gemsense Pro platine autoclave', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de température\\r\\nGaine de protection : acier inox 316 L - Ø 6 x 200 mm, \\r\\nprolongée par câble PFA/silicone protégé par flexible inox Ø 7 mm, longueur 1,5 mètres puis gaine étanche Ø 6 x 100 mm pour passage de cloison\\r\\nSonde : Pt 100 céramique CEI 60751 classe A, simple ou double enroulement en montage 3 fils\\r\\nCâble de raccordement : PFA/silicone, longueur 2 mètres\\r\\nTempérature maximale d\'utilisation : +180 °C\\r\\nExécution étanche', 'GSP', 'RADIO'),
  (14, 'GSP-RP-CF', 'Gemsense Pro platine chambre froide', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de température\\r\\nCapteur muni à l\'extrémité d\'une ogive inox diamètre 6 mm \\r\\nsertie sur 15 mètres de câble silicone.\\r\\nConfiguration 3 fils\\r\\nElément sensible Pt100 suivant NF EN 60751 classe B\\r\\nOgive inox diamètre 6 mm, longueur 50 mm\\r\\nTempérature d\'utilisation : -50°C à + 100°C\\r\\nSortie sur 15 mètres de câble : Conducteurs souples 7 brins \\r\\nde ø 0.2 mm isolés PFA sous gaine caoutchouc de silicone. \\r\\n2 conducteurs rouges, 1 conducteur blanc', 'GSP', 'RADIO'),
  (15, 'GSP-RP-MICRO', 'Gemsense Pro platine micro-capteur', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de température platine\\r\\nCapteur micro ø 2,18mm L 4,75m : -70°C à + 250°C', 'GSP', 'RADIO'),
  (16, 'GSP-RQ-CO2', 'Gemsense Pro CO2', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nGamme pro avec portée étendue\\r\\nLe capteur de dioxyde de carbone Vaisala CARBOCAP® GMP251 est une sonde intelligente et autonome.\\r\\nLa plage de température de fonctionnement va de -40 à +60 °C, \\r\\net la plage de mesure est comprise entre 0 et 20 % de CO2\\r\\nLe capteur GMP251 fait appel à la technologie unique de deuxième génération Vaisala CARBOCAP® qui offre une stabilité exceptionnelle. \\r\\nLa durée de vie de la GMP251 est prolongée grâce à un nouveau type de source de lumière infrarouge (IR) qui remplace l\'ampoule à incandescence traditionnelle. Elle bénéficie de compensations complètes de température et de pression de la mesure du CO2 - mesure de température intégrée pour la compensation.', 'GSP', 'RADIO'),
  (17, 'GSP-RQ-HYG', 'Gemsense Pro hygrométrie', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nGamme pro avec portée étendue\\r\\nPlage de mesure de 0% à 100 %hr\\r\\nTempérature d\'utilisation de 10°C à +60°C\\r\\nCapteur de diamètre 12 mm longueur 71 mm', 'GSP', 'RADIO'),
  (18, 'GSP-RQ-THE', 'Gemsense Pro thermocouple', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de température\\r\\nCapteur thermocouple J chemise (déformable) :\\r\\nø 3 mm longueur 50 cm\\r\\nTempérature d\'utilisation  : 100°C à + 1500°C\\r\\nSortie sur câble tresse inox 1m', 'GSP', 'RADIO'),
  (19, 'GSP-RQ-PRES', 'Gemsense Pro pression différentielle', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de pression \\r\\nCapteur piézoélectique\\r\\nDomaine d\'utilisation  : 0 à 250 Pa\\r\\nSortie sur câble tresse inox 1m', 'GSP', 'RADIO'),
  (20, 'GSP-RQ-ATMO', 'Gemsense Pro pression atmosphérique', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de pression  \\r\\nCapteur ratiométrique\\r\\nDomaine d\'utilisation : atmosphère ambiante', 'GSP', 'RADIO'),
  (21, 'GSP-RQ-LUM', 'Gemsense Pro lumière', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de lumière \\r\\nCapteur photorésistif\\r\\nDomaine d\'utilisation : lumière ambiante', 'GSP', 'RADIO'),
  (22, 'GSP-RQ-01V', 'Gemsense Pro 0-1 Volt', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de tension \\r\\nEntrée 0-1Volt', 'GSP', 'RADIO'),
  (23, 'GSP-RQ-420MA', 'Gemsense Pro 4-20 mA', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur de courant \\r\\nEntrée 4-20mA', 'GSP', 'RADIO'),
  (24, 'GSP-RQ-NONF', 'Gemsense Pro NO NF', 'Sonde GemSense Pro avec écran 2,9" \\r\\nFonction mémoire (5300 valeurs)\\r\\nBatterie de secours (10 jours)\\r\\nGamme pro avec portée étendue\\r\\nCapteur TOR \\r\\nEntrée récuperation de contact NO ou NF\\r\\nDomaine d\'utilisation : reprise de contact', 'GSP', 'RADIO'),
  (25, 'GSP-RP-ETAL', 'Gemsense Pro Étalon', 'Sonde GemSense Pro avec écran 2,9" \\r\\nLecture écran sous forme de liste pour des étalonnages \\r\\nplus faciles\\r\\nBatterie de secours (15 jours)\\r\\nGamme pro avec portée étendue\\r\\nGaine de protection : acier inox 316 L, Ø 3,5 longueur utile 150 mm \\r\\nTempérature d\'utilisation : -200 à 200°C\\r\\nSonde : Pt 100 céramique CEI 60751 classe 1/3DIN, \\r\\nen montage 4 fils\\r\\nCâble de raccordement : PFA/PFA \\r\\nRésolution d’affichage : 0,01°C \\r\\nRésolution de mesure : 0,003°C', 'GSP', 'ETALON'),
  (26, 'GSP-XN-BL', 'Gemsense Pro Ethernet numérique blanc', 'Liaison Ethernet RJ45 \\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 125°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', 'GSP', 'ETHERNET'),
  (27, 'GSP-XN-GR', 'Gemsense Pro Ethernet numérique gris', 'Liaison Ethernet RJ45 \\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 70°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', 'GSP', 'ETHERNET'),
  (28, 'GSP-XP', 'Gemsense Pro Ethernet platine', 'Liaison Ethernet RJ45 \\r\\nGaine de protection : acier inox 316 L, Ø 6 \\r\\nTempérature d\'utilisation : -200 à 200°C\\r\\nSonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils\\r\\nCâble de raccordement : PFA/PFA', 'GSP', 'ETHERNET'),
  (29, 'M-GSP-F', 'Module de réception pour sondes GemSense Pro Filaire', 'Ethernet RJ 45\\r\\nLed activité\\r\\nAlimentation sur secteur', 'GSP', 'FILAIRE'),
  (30, 'M-GSP-F-ALS', 'Alimentation supplémentaire pour sondes GemSense Pro Filaire', '', 'GSP', 'FILAIRE'),
  (31, 'GSP-FN-BL', 'Gemsense Pro filaire numérique blanc', 'Bus d’alimentation de data RS485\\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 125°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', 'GSP', 'FILAIRE'),
  (32, 'GSP-FN-GR', 'Gemsense Pro filaire numérique gris', 'Bus d’alimentation de data RS485\\r\\nCapteur numérique\\r\\nTempérature d\'utilisation : -30°C à 70°C\\r\\nCapteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', 'GSP', 'FILAIRE'),
  (33, 'GSP-FP', 'Gemsense Pro Filaire platine', 'Bus d’alimentation de data RS485\\r\\nGaine de protection : acier inox 316 L, Ø 6 \\r\\nTempérature d\'utilisation : -200 à 200°C\\r\\nSonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils\\r\\nCâble de raccordement : PFA/PFA', 'GSP', 'FILAIRE');

INSERT IGNORE INTO `t_sonde_etat` (`Id_Sonde_Etat`,`Etat_Sonde`,`Etat_Libelle`) VALUES
  (1, 'A', 'En ajustage'),
  (2, 'D', 'Surveillance désactivée'),
  (3, 'E', 'En étalonnage'),
  (4, 'S', 'Utilisée en surveillance'),
  (5, 'T', 'En test');

INSERT INTO `t_parametre` (`Section`,`Mot_Cle`,`Valeur`,`Commentaire`,`Champ_DATETIME`) VALUES
  ('CFR21', 'ACTIVATION_EXPIRATION_MOT_DE_PASSE', 'true', 'Activer l\'expiration des mots de passe (CFR21)', NULL),
  ('CFR21', 'ACTIVATION_NORME_CFR21', '0', 'Activer la conformité CFR21 (saisie des configurations)', NULL),
  ('CFR21', 'EVENEMENTS', '1', 'Activation des événements', NULL),
  ('CFR21', 'JOURS_VALIDITE_MOT_DE_PASSE', '0', NULL, NULL),
  ('CFR21', 'MOT_DE_PASSE_PERMANENT', '1', 'Le mot de passe ne peut pas etre change par l\'utilisateur', NULL),
  ('CFR21', 'MOT_DE_PASSE_REUTILISABLE', '0', 'L\'utilisateur ne peut pas reutiliser un ancien mot de passe', NULL),
  ('CFR21', 'NOMBRE_TENTATIVES_MOT_DE_PASSE', '3', 'Nombre de tentatives autorisees avant verrouillage du compte', NULL),
  ('CFR21', 'REACTIVATION_ALARME_SONORE', '500', 'Délai de réactivation de l\'alarme sonore en millisecondes', NULL),
  ('CFR21', 'SECURITE', '0', 'Mode securite renforcee', NULL),
  ('CFR21', 'TEMPS_DECONNEXION_MINUTES', '20', 'Temps d\'inactivité avant déconnexion automatique en minutes', NULL),
  ('CFR21', 'VALIDITE_MOT_DE_PASSE_JOURS', '90', 'Durée de validité du mot de passe en jours', NULL),
  ('DASHBOARD', 'AUDIT_GRAPH_OPENINGS', 'false', 'Activer l\'audit trail a l\'ouverture des graphiques', NULL),
  ('DASHBOARD', 'ETALONNAGE_WARNING_DAYS', '90', NULL, NULL),
  ('DASHBOARD', 'REFRESH', '30', 'Intervalle de rafraîchissement dashboard (secondes)', NULL),
  ('DASHBOARD', 'REQUIRE_ACTION_COMMENT', 'false', NULL, NULL),
  ('DASHBOARD', 'SHOW_NULL_NON_RESPONSE', 'true', 'Afficher les non-reponses (valeurs null) sur les graphes', NULL),
  ('DASHBOARD', 'SURVEILLANCE_REFRESH', '30', 'Délai auto de rafraîchissement de la surveillance (secondes)', NULL),
  ('GENERAL', 'TIMEZONE', 'Europe/Paris', 'Fuseau horaire par defaut', NULL),
  ('NOTIFICATIONS', 'ALARM_EMAIL_ACKNOWLEDGED', 'true', 'Envoyer les emails d acquittement', NULL),
  ('NOTIFICATIONS', 'ALARM_EMAIL_ENDED', 'true', 'Envoyer les emails d alarme terminee', NULL),
  ('NOTIFICATIONS', 'ALARM_EMAIL_FALLBACK_TO_SYSTEM', 'true', 'Envoyer les emails d alarme aux destinataires systeme si aucun contact mail lieu n est configure', NULL),
  ('NOTIFICATIONS', 'ALARM_EMAIL_RECIPIENTS', '', 'Emails en copie sur tous les emails systeme', NULL),
  ('NOTIFICATIONS', 'EMAIL', 'true', 'Activation globale des emails systeme', NULL),
  ('NOTIFICATIONS', 'GSP_BATTERY_EMAIL_PERCENT', '25', 'Seuil (%) envoi email batterie faible sonde GSP', NULL),
  ('NOTIFICATIONS', 'GSP_BATTERY_NOTIFY_PERCENT', '50', 'Seuil (%) notification batterie faible sonde GSP', NULL),
  ('NOTIFICATIONS_TEAMS', 'CHANNEL_LABEL', '', 'Nom lisible du canal Teams cible.', NULL),
  ('NOTIFICATIONS_TEAMS', 'ENABLED', 'false', 'Active les notifications Teams via webhook Workflows.', NULL),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_ACK', 'false', 'Envoie un message Teams a l acquittement.', NULL),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_END', 'true', 'Envoie un message Teams a la fin alarme.', NULL),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_TRIGGER', 'true', 'Envoie un message Teams au declenchement alarme.', NULL),
  ('NOTIFICATIONS_TEAMS', 'TIMEOUT_MS', '5000', 'Timeout HTTP du webhook Teams en millisecondes.', NULL),
  ('NOTIFICATIONS_TEAMS', 'WEBHOOK_URL', '', 'URL du webhook Teams Workflows. Secret a proteger.', NULL),
  ('SECURITE_EMAIL', 'SMTP_ACTIVATION', 'false', 'Activer l\'envoi d\'emails', NULL),
  ('SECURITE_EMAIL', 'SMTP_EXPEDITEUR', '', 'Adresse email expéditeur (doit correspondre au domaine SMTP)', NULL),
  ('SECURITE_EMAIL', 'SMTP_MOT_DE_PASSE', '', 'Mot de passe SMTP', NULL),
  ('SECURITE_EMAIL', 'SMTP_PORT', '587', 'Port SMTP (587 pour TLS, 465 pour SSL)', NULL),
  ('SECURITE_EMAIL', 'SMTP_SERVEUR', '', 'Serveur SMTP pour l\'envoi d\'emails', NULL),
  ('SECURITE_EMAIL', 'SMTP_UTILISATEUR', '', 'Utilisateur SMTP', NULL),
  ('SECURITE_MOT_DE_PASSE', 'LONGUEUR_MINIMALE', '4', 'Longueur minimale du mot de passe', NULL),
  ('SECURITE_MOT_DE_PASSE', 'MIN_CARACTERES_SPECIAUX', '0', 'Nombre minimum de caractères spéciaux', NULL),
  ('SECURITE_MOT_DE_PASSE', 'MIN_CHIFFRES', '0', 'Nombre minimum de chiffres', NULL),
  ('SECURITE_MOT_DE_PASSE', 'MIN_LETTRES_MAJUSCULES', '0', 'Nombre minimum de majuscules', NULL),
  ('SECURITE_MOT_DE_PASSE', 'MIN_LETTRES_MINUSCULES', '0', 'Nombre minimum de minuscules', NULL),
  ('SERVICE', 'GSO_DERNIER_DATE_HEURE', NULL, 'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures', NULL),
  ('SERVICES', 'COMMERCIAL_CONTACT_EMAIL', '', 'Adresse email du service commercial utilisée pour les demandes de devis matériel', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'DAY_OF_MONTH', '1', 'Jour du mois (1..31, replie au dernier jour du mois si necessaire)', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'ENABLED', '0', 'Activation envoi recap mensuel stats', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'HOUR_LOCAL', '8', 'Heure locale (0..23)', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_ALARM_COUNT', '1', 'Inclure nombre alarmes', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_ALARM_HIGH_DURATION', '1', 'Inclure duree alarme haute', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_ALARM_LOW_DURATION', '1', 'Inclure duree alarme basse', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_AVG', '1', 'Inclure moyenne', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_LOCATION_SUMMARY', '1', 'Inclure lieu/site/groupe', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_MAX', '1', 'Inclure mesure max', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_MIN', '1', 'Inclure mesure min', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_OVER_HIGH_NO_ALARM', '1', 'Inclure depassement haut sans alarme', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_OVER_LOW_NO_ALARM', '1', 'Inclure depassement bas sans alarme', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'INCLUDE_SETTINGS_SUMMARY', '1', 'Inclure consignes/tolerances/frequence/retards', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'LAST_SENT_MONTH', '', 'Dernier mois envoyé au format YYYY-MM', NULL),
  ('STATISTICS_MONTHLY_REPORT', 'RECIPIENTS', '', 'Destinataires séparés par ; ou ,', NULL)
ON DUPLICATE KEY UPDATE `Valeur` = VALUES(`Valeur`), `Commentaire` = VALUES(`Commentaire`), `Champ_DATETIME` = VALUES(`Champ_DATETIME`);

-- Parametres applicatifs communs aux deux fournisseurs de base de donnees.
INSERT INTO `t_parametre` (`Section`,`Mot_Cle`,`Valeur`,`Commentaire`) VALUES
  ('TELEPHONIE','ENABLED','false','Activation globale de la téléphonie VoIP'),
  ('TELEPHONIE','PROVIDER','none','Fournisseur VoIP sélectionné'),
  ('TELEPHONIE','CALLER_ID','','Numéro présenté / caller ID'),
  ('TELEPHONIE','NOTES','','Notes d’intégration téléphonie'),
  ('TELEPHONIE','TWILIO_AUTH_MODE','api_key','Mode d’authentification Twilio'),
  ('TELEPHONIE','TWILIO_ACCOUNT_SID','','Compte Twilio'),
  ('TELEPHONIE','TWILIO_API_KEY_SID','','API Key SID Twilio'),
  ('TELEPHONIE','TWILIO_API_KEY_SECRET','','API Key Secret Twilio'),
  ('TELEPHONIE','TWILIO_AUTH_TOKEN','','Auth Token Twilio'),
  ('TELEPHONIE','TWILIO_FROM_NUMBER','','Numéro expéditeur Twilio'),
  ('TELEPHONIE','OVH_ENDPOINT','ovh-eu','Point d’accès API OVH'),
  ('TELEPHONIE','OVH_APPLICATION_KEY','','Application Key OVH'),
  ('TELEPHONIE','OVH_APPLICATION_SECRET','','Application Secret OVH'),
  ('TELEPHONIE','OVH_CONSUMER_KEY','','Consumer Key OVH'),
  ('TELEPHONIE','OVH_BILLING_ACCOUNT','','Compte de facturation OVH'),
  ('TELEPHONIE','OVH_SERVICE_NAME','','Nom du service / ligne OVH'),
  ('TELEPHONIE','OVH_CLICK2CALL_USER_ID','','Identifiant utilisateur Click2Call OVH'),
  ('TELEPHONIE','OVH_CLICK2CALL_LOGIN','','Login utilisateur Click2Call OVH'),
  ('TELEPHONIE','OVH_CLICK2CALL_PASSWORD','','Mot de passe utilisateur Click2Call OVH'),
  ('TELEPHONIE','KEYYO_CLIENT_ID','','Client ID Keyyo'),
  ('TELEPHONIE','KEYYO_CLIENT_SECRET','','Client Secret Keyyo'),
  ('TELEPHONIE','KEYYO_ACCESS_TOKEN','','Access token Keyyo'),
  ('TELEPHONIE','KEYYO_REFRESH_TOKEN','','Refresh token Keyyo'),
  ('TELEPHONIE','KEYYO_LINE_ID','','Identifiant ligne Keyyo'),
  ('TELEPHONIE','ASTERISK_BASE_URL','http://127.0.0.1:8088/ari','URL ARI Asterisk'),
  ('TELEPHONIE','ASTERISK_USERNAME','','Utilisateur Asterisk ARI'),
  ('TELEPHONIE','ASTERISK_PASSWORD','','Mot de passe Asterisk ARI'),
  ('TELEPHONIE','ASTERISK_APP_NAME','vigitemp','Nom application Asterisk ARI')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

-- Deferred fresh-install view: v_tm_mesures_dernier
USE `vigi_main`;
--
-- Final view structure for view `v_tm_mesures_dernier`
--

/*!50001 DROP VIEW IF EXISTS `v_tm_mesures_dernier`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 SQL SECURITY INVOKER */
/*!50001 VIEW `v_tm_mesures_dernier` AS select `l`.`Id_Lieu` AS `Id_Lieu`,`l`.`Sonde_Numero_Serie` AS `Sonde_Numero_Serie`,`l`.`Adresse_Sonde` AS `Adresse_Sonde`,`l`.`Nom_Lieu` AS `Nom_Lieu`,`l`.`Id_Alarme` AS `Id_Alarme`,`l`.`Est_Lieu_En_Alarme` AS `Alarme_en_cours`,`m`.`Valeur` AS `Dernier_Releve`,`m`.`Unite` AS `Unite`,`m`.`Date_Heure_Mesure` AS `Date_Heure_Mesure`,`m`.`COM_sonde` AS `COM_Lecture`,`m`.`Rssi` AS `Signal_Radio`,`m`.`Tension` AS `Tension_Piles`,left(`l`.`Adresse_Sonde`,(length(`l`.`Adresse_Sonde`) - 2)) AS `GSO_SN` from (`t_lieu` `l` left join `vigi_mesures`.`tm_mesures` `m` on(((`m`.`Id_Lieu` = `l`.`Id_Lieu`) and (`m`.`Date_Heure_Mesure` = (select `m2`.`Date_Heure_Mesure` from `vigi_mesures`.`tm_mesures` `m2` where (`m2`.`Id_Lieu` = `l`.`Id_Lieu`) order by `m2`.`Date_Heure_Mesure` desc limit 1))))) where ((`l`.`Lieu_Etat` = 'S') and (`l`.`Est_Lieu_GSO` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

