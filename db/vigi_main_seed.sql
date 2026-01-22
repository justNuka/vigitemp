CREATE DATABASE IF NOT EXISTS `vigi_main` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vigi_main`;

SET FOREIGN_KEY_CHECKS=0;
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
DROP TABLE IF EXISTS `t_actionneur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_actionneur` (
  `Id_Actionneur` int NOT NULL AUTO_INCREMENT,
  `Num_Serie` varchar(50) DEFAULT NULL,
  `Type` int DEFAULT NULL,
  `Est_Etat` tinyint(1) DEFAULT '0',
  `Est_Demande` tinyint(1) DEFAULT '0',
  `Commentaire` varchar(255) DEFAULT NULL,
  `Port_Serie` int DEFAULT NULL,
  `Id_Module` int DEFAULT NULL,
  `Relai_1` varchar(50) DEFAULT NULL,
  `Relai_2` varchar(50) DEFAULT NULL,
  `Relai_3` varchar(50) DEFAULT NULL,
  `Relai_4` varchar(50) DEFAULT NULL,
  `Est_Test` tinyint(1) DEFAULT '0',
  `Libelle_Erreur` varchar(50) DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Id_Serveur` int DEFAULT '1',
  PRIMARY KEY (`Id_Actionneur`),
  KEY `IDX_Num_Serie` (`Num_Serie`),
  KEY `IDX_Type` (`Type`),
  KEY `IDX_Est_Etat` (`Est_Etat`),
  KEY `IDX_Id_Module` (`Id_Module`),
  KEY `IDX_Id_Plan` (`Id_Plan`),
  CONSTRAINT `FK_PLAN_ACTIONNEUR` FOREIGN KEY (`Id_Plan`) REFERENCES `t_plan` (`Id_Plan`),
  CONSTRAINT `FK_TYPE_ACTIONNEUR` FOREIGN KEY (`Type`) REFERENCES `t_actionneur_type` (`Type`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_actionneur_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_actionneur_type` (
  `Id_Actionneur_Type` int NOT NULL AUTO_INCREMENT,
  `Type` int DEFAULT NULL,
  `Description` varchar(50) DEFAULT NULL,
  `Gere_Relais` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Actionneur_Type`),
  UNIQUE KEY `Type` (`Type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme` (
  `Id_Alarme` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Debut` datetime DEFAULT NULL,
  `Valeur` float DEFAULT NULL,
  `Type` varchar(1) DEFAULT NULL,
  `Date_Heure_Fin` datetime DEFAULT NULL,
  `Est_Alarme_Vrai` tinyint(1) DEFAULT '0',
  `Id_Lieu` int DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Unite` varchar(10) DEFAULT NULL,
  `Est_Acquittee` tinyint(1) DEFAULT '0',
  `Date_Heure_Derniere_Mesure` datetime DEFAULT NULL,
  `Date_Heure_Debut_Alarme_Vrai` datetime DEFAULT NULL,
  `Est_Alarme_Pour_VigiTel` tinyint(1) DEFAULT '0',
  `Est_Mail_Envoye` tinyint(1) DEFAULT NULL,
  `Est_Tel_Acquittee` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id_Alarme`),
  KEY `IDX_Date_Heure_Debut` (`Date_Heure_Debut`),
  KEY `IDX_Valeur` (`Valeur`),
  KEY `IDX_Type` (`Type`),
  KEY `IDX_Date_Heure_Fin` (`Date_Heure_Fin`),
  KEY `IDX_Est_Alarme_Vrai` (`Est_Alarme_Vrai`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Est_Acquittee` (`Est_Acquittee`),
  KEY `IDX_Date_Heure_Derniere_Mesure` (`Date_Heure_Derniere_Mesure`),
  KEY `IDX_Date_Heure_Debut_Alarme_Vrai` (`Date_Heure_Debut_Alarme_Vrai`),
  CONSTRAINT `FK_LIEU_ALARME` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=27795 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_alarme_histo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme_histo` (
  `Id_Alarme_Histo` int NOT NULL AUTO_INCREMENT,
  `Id_Alarme` int NOT NULL,
  `Date_Heure_Debut` datetime DEFAULT NULL,
  `Valeur` float DEFAULT NULL,
  `Type` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Heure_Fin` datetime DEFAULT NULL,
  `Est_Alarme_Vrai` tinyint(1) DEFAULT '0',
  `Id_Lieu` int DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Unite` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Est_Acquittee` tinyint(1) DEFAULT '0',
  `Date_Heure_Derniere_Mesure` datetime DEFAULT NULL,
  `Date_Heure_Debut_Alarme_Vrai` datetime DEFAULT NULL,
  `Est_Alarme_Pour_VigiTel` tinyint(1) DEFAULT '0',
  `Est_Mail_Envoye` tinyint(1) DEFAULT NULL,
  `Est_Tel_Acquittee` tinyint(1) DEFAULT NULL,
  `Date_Heure_Acquittement` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Alarme_Histo`),
  KEY `IDX_HISTO_Id_Alarme` (`Id_Alarme`),
  KEY `IDX_HISTO_Est_Acquittee` (`Est_Acquittee`),
  KEY `IDX_HISTO_Est_Alarme_Vrai` (`Est_Alarme_Vrai`),
  KEY `IDX_HISTO_Date_Heure_Debut` (`Date_Heure_Debut`),
  KEY `IDX_HISTO_Date_Heure_Fin` (`Date_Heure_Fin`),
  KEY `IDX_HISTO_Date_Heure_Debut_Alarme_Vrai` (`Date_Heure_Debut_Alarme_Vrai`),
  KEY `IDX_HISTO_Date_Heure_Derniere_Mesure` (`Date_Heure_Derniere_Mesure`),
  KEY `IDX_HISTO_Date_Heure_Acquittement` (`Date_Heure_Acquittement`),
  KEY `IDX_HISTO_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_HISTO_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_HISTO_Type` (`Type`),
  KEY `IDX_HISTO_Unite` (`Unite`),
  KEY `IDX_HISTO_Valeur` (`Valeur`),
  CONSTRAINT `FK_LIEU_ALARME_HISTO` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_alarme_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_alarme_message` (
  `Id_Alarme_Message` int NOT NULL AUTO_INCREMENT,
  `Code_Alarme_Message` varchar(20) DEFAULT NULL,
  `Type` varchar(1) DEFAULT NULL,
  `Texte_Message` longtext,
  PRIMARY KEY (`Id_Alarme_Message`),
  UNIQUE KEY `CodeAlarmeMessage` (`Code_Alarme_Message`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_ancien_mot_de_passe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ancien_mot_de_passe` (
  `Id_Ancien_Mot_De_Passe` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Mot_De_Passe` varchar(100) DEFAULT NULL,
  `Est_Premiere_Connexion` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Ancien_Mot_De_Passe`),
  KEY `IDX_Id_Utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_UTILISATEUR_ANCIEN_MDP` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_UTILISATEUR_ANCIENMDP` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=989 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_autorisation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_autorisation` (
  `Id_Autorisation` int NOT NULL AUTO_INCREMENT,
  `Code_Autorisation` varchar(50) DEFAULT NULL,
  `Libelle_Autorisation` varchar(50) DEFAULT NULL,
  `Commentaire` varchar(200) DEFAULT NULL,
  `A_Acces_Admin` tinyint(1) DEFAULT '0',
  `A_Acces_Metrologie` tinyint(1) DEFAULT '0',
  `A_Acces_Surveillance` tinyint(1) DEFAULT '0',
  `A_Acces_VigiLog` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Autorisation`),
  KEY `IDX_Code_Autorisation` (`Code_Autorisation`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_bain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_bain` (
  `Id_Bain` int NOT NULL AUTO_INCREMENT,
  `Model` varchar(50) DEFAULT NULL,
  `Reference` varchar(50) DEFAULT NULL,
  `Stabilite` float DEFAULT NULL,
  `Homogeneite` float DEFAULT NULL,
  `Contenu` varchar(50) DEFAULT NULL,
  `Est_Reserve_MC2` tinyint(1) DEFAULT '0',
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Bain`),
  KEY `IDX_Model` (`Model`),
  KEY `IDX_Reference` (`Reference`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_calibrage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_calibrage` (
  `Id_Calibrage` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Calibrage` datetime DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Coeff_X2` float DEFAULT NULL,
  `Coeff_X` float DEFAULT NULL,
  `Coeff_Constant` float DEFAULT NULL,
  `Unite` varchar(10) DEFAULT NULL,
  `Nb_Decimale` int DEFAULT NULL,
  `Operateur` varchar(255) DEFAULT NULL,
  `SE_Numero` varchar(50) DEFAULT NULL,
  `SE_Organisme` varchar(50) DEFAULT NULL,
  `SE_Date_Certif` date DEFAULT NULL,
  `SE_Numero_Certif` varchar(50) DEFAULT NULL,
  `Mesure_Etalon1` float DEFAULT NULL,
  `Mesure_Etalon2` float DEFAULT NULL,
  `Valeur_Brute1` float DEFAULT NULL,
  `Valeur_Brute2` float DEFAULT NULL,
  `Ancienne_Mesure1` float DEFAULT NULL,
  `Ancienne_Mesure2` float DEFAULT NULL,
  `Nouvelle_Mesure1` float DEFAULT NULL,
  `Nouvelle_Mesure2` float DEFAULT NULL,
  `Id_Bain` int DEFAULT NULL,
  PRIMARY KEY (`Id_Calibrage`),
  KEY `IDX_Date_Heure_Calibrage` (`Date_Heure_Calibrage`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_SE_Numero` (`SE_Numero`),
  KEY `IDX_Id_Bain` (`Id_Bain`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_certif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_certif` (
  `Id_Certif` int NOT NULL AUTO_INCREMENT,
  `Numero` varchar(50) DEFAULT NULL,
  `Organisme` varchar(50) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Etalon_Numero_Serie` varchar(50) DEFAULT NULL,
  `Unite` varchar(10) DEFAULT NULL,
  `Id_PDF` int DEFAULT NULL,
  PRIMARY KEY (`Id_Certif`),
  KEY `IDX_Numero` (`Numero`),
  KEY `IDX_Organisme` (`Organisme`),
  KEY `IDX_Date` (`Date`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Id_PDF` (`Id_PDF`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_certif_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_certif_mesure` (
  `Id_Certif_Mesure` int NOT NULL AUTO_INCREMENT,
  `Id_Certif` int DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Temperature_Vraie` varchar(50) DEFAULT NULL,
  `Temperature_Reference` varchar(50) DEFAULT NULL,
  `Incertitude` float DEFAULT NULL,
  PRIMARY KEY (`Id_Certif_Mesure`),
  KEY `IDX_Id_Certif` (`Id_Certif`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_commentaire_acquittement_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_commentaire_acquittement_alarme` (
  `Id_Commentaire` int NOT NULL AUTO_INCREMENT,
  `Type_Commentaire` varchar(50) DEFAULT NULL,
  `Texte` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_Commentaire`),
  KEY `IDX_Type_Commentaire` (`Type_Commentaire`),
  KEY `IDX_Texte` (`Texte`)
) ENGINE=InnoDB AUTO_INCREMENT=380 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_alarme` (
  `Id_Log_Alarme` int NOT NULL,
  `Id_Reception` tinyint DEFAULT NULL,
  `Date_Debut` datetime NOT NULL,
  `Date_Fin` datetime NOT NULL,
  `Est_Acquitte` tinyint DEFAULT NULL,
  `Commentaire` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id_Log_Alarme`),
  KEY `IDX_Id_Reception` (`Id_Reception`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_coursier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_coursier` (
  `Id_Datalogger_Coursier` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(10) DEFAULT NULL,
  `Nom` varchar(64) DEFAULT NULL,
  `Prenom` varchar(64) DEFAULT NULL,
  `Date_Maj` date DEFAULT NULL,
  `Heure_Maj` time DEFAULT NULL,
  `Login_Maj` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Coursier`),
  UNIQUE KEY `Code` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_envoi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_envoi` (
  `Id_Datalogger_Envoi` int NOT NULL AUTO_INCREMENT,
  `Id_Datalogger_Reception` int DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  `Materiel` varchar(50) DEFAULT NULL,
  `Date_Maj` date DEFAULT NULL,
  `Heure_Maj` time DEFAULT NULL,
  `Login_Maj` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Envoi`),
  KEY `IDX_Id_Datalogger_Reception` (`Id_Datalogger_Reception`),
  KEY `IDX_Id_Site` (`Id_Site`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_etape`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_etape` (
  `Id_Datalogger_Etape` int NOT NULL AUTO_INCREMENT,
  `Id_Datalogger_Tournee` int DEFAULT '0',
  `Ordre` int DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Etape`),
  KEY `IDX_Id_Datalogger_Tournee` (`Id_Datalogger_Tournee`),
  CONSTRAINT `t_datalogger_etape_ibfk_1` FOREIGN KEY (`Id_Datalogger_Tournee`) REFERENCES `t_datalogger_tournee` (`Id_Datalogger_Tournee`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_reception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_reception` (
  `Id_Datalogger_Reception` int NOT NULL AUTO_INCREMENT,
  `Id_Tournee` varchar(50) DEFAULT NULL,
  `Id_Coursier` int DEFAULT NULL,
  `Id_Site_Depart` int DEFAULT '0',
  `Id_Site_Arrivee` int DEFAULT NULL,
  `Numserie_VigiLog` varchar(13) DEFAULT NULL,
  `Date_Reception` date DEFAULT NULL,
  `Heure_Reception` time DEFAULT NULL,
  `En_Attente` tinyint DEFAULT NULL,
  `Termine` tinyint DEFAULT NULL,
  `Duree_Livraison` int DEFAULT NULL,
  `Depassement_Temperature_Bool` tinyint DEFAULT NULL,
  `Depassement_Temps_Bool` tinyint DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Inf_Active` tinyint DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Consigne_Sup_Active` tinyint DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Retard_Alarme_Temps` int DEFAULT NULL,
  `Retard_Alarme_Temperature` int DEFAULT NULL,
  `Temps` int DEFAULT NULL,
  `Temperature_Moyenne` float DEFAULT NULL,
  `Temperature_Max` float DEFAULT NULL,
  `Temperature_Min` float DEFAULT NULL,
  `Somme_Valeur_Temperature` float DEFAULT NULL,
  `Nb_Valeur_Temperature` int DEFAULT NULL,
  `Depassement_Temperature` int DEFAULT NULL,
  `Depassement_Temps` int DEFAULT NULL,
  `Commentaire_Acquittement` longtext,
  `Date_Enregistrement` date DEFAULT NULL,
  `Heure_Enregistrement` time DEFAULT NULL,
  `Login_Enregistrement` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Reception`),
  KEY `IDX_Id_Tournee` (`Id_Tournee`),
  KEY `IDX_Id_Coursier` (`Id_Coursier`),
  KEY `IDX_Numserie_VigiLog` (`Numserie_VigiLog`),
  KEY `IDX_Id_Site_Depart` (`Id_Site_Depart`),
  KEY `IDX_Id_Site_Arrivee` (`Id_Site_Arrivee`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_sonde`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_sonde` (
  `Id_Datalogger_Sonde` int NOT NULL AUTO_INCREMENT,
  `Num_Serie` varchar(13) NOT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup_Active` tinyint DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Sup_Corrigee` float DEFAULT NULL,
  `Consigne_Inf_Active` tinyint DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Consigne_Inf_Corrigee` float DEFAULT NULL,
  `Avec_Prise_En_Compte_Incertitudes` tinyint DEFAULT NULL,
  `Frequence` int DEFAULT NULL,
  `Retard_Alarme_Temperature` int DEFAULT NULL,
  `Coeff_X` float DEFAULT NULL,
  `Coeff_Constant` float DEFAULT NULL,
  `Repetabilite` float DEFAULT NULL,
  `Incertitude` float DEFAULT NULL,
  `Err_Justesse` float DEFAULT NULL,
  `Date_Maj` date DEFAULT NULL,
  `Heure_Maj` time DEFAULT NULL,
  `Login_Maj` varchar(64) DEFAULT NULL,
  `Archive` tinyint DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Sonde`,`Num_Serie`) USING BTREE,
  UNIQUE KEY `NumSerie` (`Num_Serie`),
  KEY `IDX_Archive` (`Archive`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_datalogger_tournee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_datalogger_tournee` (
  `Id_Datalogger_Tournee` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(64) DEFAULT NULL,
  `Id_Site_Depart` int DEFAULT NULL,
  `Id_Site_Arrivee` int DEFAULT NULL,
  `Temps` int DEFAULT NULL,
  `Retard_Alarme_Temps` int DEFAULT NULL,
  `Date_Maj` date DEFAULT NULL,
  `Heure_Maj` time DEFAULT NULL,
  `Login_Maj` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`Id_Datalogger_Tournee`),
  UNIQUE KEY `Nom` (`Nom`),
  KEY `IDX_Id_Site_Depart` (`Id_Site_Depart`),
  KEY `IDX_Id_Site_Arrivee` (`Id_Site_Arrivee`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_etalon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalon` (
  `Id_Etalon` int NOT NULL AUTO_INCREMENT,
  `Etalon_Numero_Serie` varchar(50) DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Etat_Etalon` varchar(1) DEFAULT NULL,
  `Port_Serie` varchar(10) DEFAULT NULL,
  `Est_Sonde_Externe` tinyint(1) DEFAULT NULL,
  `Resolution` varchar(50) DEFAULT NULL,
  `Incertitude` varchar(50) DEFAULT NULL,
  `Nb_Decimale` int DEFAULT NULL,
  `Reserve_MC2` varchar(50) DEFAULT NULL,
  `Id_Serveur` int DEFAULT '1',
  `Id_Module` int DEFAULT NULL,
  PRIMARY KEY (`Id_Etalon`),
  UNIQUE KEY `EtalonNumeroSerie_IDX` (`Etalon_Numero_Serie`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_etalon_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalon_type` (
  `Type_Etalon` varchar(3) NOT NULL,
  `Nom` varchar(30) DEFAULT NULL,
  `Descriptif` varchar(100) DEFAULT NULL,
  `Est_Saisie_Module` tinyint(1) DEFAULT '0',
  `Est_Sonde_Externe` tinyint(1) DEFAULT '0',
  `Resolution` float DEFAULT NULL,
  PRIMARY KEY (`Type_Etalon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_etalonnage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etalonnage` (
  `Id_Etalonnage` int NOT NULL AUTO_INCREMENT,
  `Date_Heure_Etalonnage` datetime DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Date_Validite` date DEFAULT NULL,
  `Operateur` varchar(255) DEFAULT NULL,
  `Etalon_Numero_Serie` varchar(50) DEFAULT NULL,
  `Date_Certif` date DEFAULT NULL,
  `Organisme` varchar(50) DEFAULT NULL,
  `Num_Certif` varchar(50) DEFAULT NULL,
  `Unite` varchar(10) DEFAULT NULL,
  `Incertitude` varchar(50) DEFAULT NULL,
  `Moyenne_Etalon` float DEFAULT NULL,
  `Moyenne_Sonde` float DEFAULT NULL,
  `Repetabilite` varchar(50) DEFAULT NULL,
  `Id_Bain` int DEFAULT NULL,
  `Err_Justesse` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Etalonnage`),
  KEY `IDX_Date_Heure_Etalonnage` (`Date_Heure_Etalonnage`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`),
  KEY `IDX_Date_Certif` (`Date_Certif`),
  KEY `IDX_Organisme` (`Organisme`),
  KEY `IDX_Num_Certif` (`Num_Certif`),
  KEY `IDX_Unite` (`Unite`),
  KEY `IDX_Incertitude` (`Incertitude`),
  KEY `IDX_Moyenne_Etalon` (`Moyenne_Etalon`),
  KEY `IDX_Moyenne_Sonde` (`Moyenne_Sonde`),
  KEY `IDX_Repetabilite` (`Repetabilite`),
  KEY `IDX_Id_Bain` (`Id_Bain`)
) ENGINE=InnoDB AUTO_INCREMENT=9461 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_groupe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_groupe` (
  `Id_Groupe` int NOT NULL AUTO_INCREMENT,
  `Nom_Groupe` varchar(64) DEFAULT NULL,
  `Numero_Regroupement` varchar(1) DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Groupe`),
  UNIQUE KEY `Groupe_NomGroupe_IDX` (`Nom_Groupe`),
  KEY `IDX_Numero_Regroupement` (`Numero_Regroupement`)
) ENGINE=InnoDB AUTO_INCREMENT=391 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_liaison_sonde_type_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_liaison_sonde_type_mesure` (
  `Id_Liaison` int NOT NULL AUTO_INCREMENT,
  `Sonde_Type` varchar(50) DEFAULT NULL,
  `Sonde_Type_Mesure` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Liaison`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB AUTO_INCREMENT=58758 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
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
DROP TABLE IF EXISTS `t_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
DROP TABLE IF EXISTS `t_etat_surveillance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_etat_surveillance` (
  `Id_Surveillance_Etat` int NOT NULL AUTO_INCREMENT,
  `Surveillance_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Surveillance_Etat_Libelle` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Surveillance_Etat`),
  UNIQUE KEY `Surveillance_Etat` (`Surveillance_Etat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu` (
  `Id_Lieu` int NOT NULL AUTO_INCREMENT,
  `Id_Groupe1` int DEFAULT NULL,
  `Id_Groupe2` int DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  `Nom_Lieu` varchar(20) DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Consigne` float DEFAULT NULL,
  `Consigne_Sup` float DEFAULT NULL,
  `Consigne_Sup_Corrigee` float DEFAULT NULL,
  `Est_Consigne_Sup_Active` tinyint(1) DEFAULT '1',
  `Consigne_Sup_Pre_Alarme` float DEFAULT NULL,
  `Est_Consigne_Sup_Pre_Alarme_Active` tinyint(1) DEFAULT NULL,
  `Consigne_Inf` float DEFAULT NULL,
  `Consigne_Inf_Corrigee` float DEFAULT NULL,
  `Est_Consigne_Inf_Active` tinyint(1) DEFAULT '1',
  `Consigne_Inf_Pre_Alarme` float DEFAULT NULL,
  `Est_Consigne_Inf_Pre_Alarme_Active` tinyint(1) DEFAULT NULL,
  `Frequence` int DEFAULT NULL,
  `Lieu_Etat` varchar(1) DEFAULT NULL,
  `Surveillance_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Retard_Alarme_Haut` int DEFAULT NULL,
  `Retard_Alarme_Bas` int DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Date_Creation` date DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Est_Tel_Actif` tinyint(1) DEFAULT '0',
  `Notification_Active` tinyint(1) DEFAULT '1',
  `Date_Heure_Reactivation_Alarme` datetime DEFAULT NULL,
  `Tel_Code` varchar(4) DEFAULT NULL,
  `Tel_Son_Lieu` varchar(260) DEFAULT NULL,
  `Id_Actionneur` int DEFAULT NULL,
  `Est_Mode_Serotheque` tinyint(1) DEFAULT '0',
  `Coef_Sensibilite` int DEFAULT NULL,
  `Id_PDF` int DEFAULT NULL,
  `Est_DataLogger` tinyint(1) DEFAULT '0',
  `EMT` float DEFAULT NULL COMMENT 'Coefficient EMT',
  `EMT_Choix_Mode` int DEFAULT '1',
  `EMT_Sonde` float DEFAULT NULL,
  `Retard_Alarme_Changement_Consigne` int DEFAULT NULL,
  `Derniere_Date_Heure` datetime DEFAULT NULL,
  `Derniere_Valeur` float DEFAULT NULL,
  `Derniere_Unite` varchar(10) DEFAULT NULL,
  `Derniere_Nb_Decimal` int DEFAULT NULL,
  `Est_Lieu_En_Alarme` tinyint DEFAULT NULL,
  `Est_Lieu_Alarme_Termee_Non_Acquittee` tinyint DEFAULT NULL,
  `Est_Lieu_En_Pre_Alarme` tinyint DEFAULT NULL,
  `Id_Alarme` int DEFAULT NULL,
  `Lieu_Etat_N1` varchar(50) DEFAULT NULL,
  `Derniere_Date_Etalonnage` date DEFAULT NULL,
  `Derniere_Erreur_Justesse` varchar(50) DEFAULT NULL,
  `Derniere_Incertitude` varchar(50) DEFAULT NULL,
  `Retard_Non_Reponse` int DEFAULT NULL,
  `Date_Heure_Derniere_Reponse` datetime DEFAULT NULL,
  `Date_Heure_Derniere_Reponse_Recue_OK` datetime DEFAULT NULL,
  `Est_Correction_Ej` tinyint DEFAULT '0',
  `Derive` float DEFAULT '0',
  `Est_Correction_derive` tinyint(1) DEFAULT '0',
  `Derniere_Valeur_Null` int DEFAULT '0',
  `Type_Lieu` varchar(20) DEFAULT NULL,
  `Date_Heure_Dernier_Acquittement_En_Cours` datetime DEFAULT NULL,
  `Date_Heure_Last_Update_EVT_GSO` datetime DEFAULT NULL,
  `Est_Lieu_Alarme_Termee_Non_Acquittee_T1` tinyint DEFAULT NULL,
  PRIMARY KEY (`Id_Lieu`),
  KEY `IDX_Lieu_Etat` (`Lieu_Etat`),
  KEY `IDX_Surveillance_Etat` (`Surveillance_Etat`),
  KEY `IDX_Id_Plan` (`Id_Plan`),
  KEY `IDX_Date_Creation` (`Date_Creation`),
  KEY `IDX_Est_Archive` (`Est_Archive`),
  KEY `IDX_Sonde_Numero_Serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Est_Tel_Actif` (`Est_Tel_Actif`),
  KEY `IDX_Tel_Code` (`Tel_Code`),
  KEY `IDX_Tel_Son_Lieu` (`Tel_Son_Lieu`),
  KEY `IDX_Id_Actionneur` (`Id_Actionneur`),
  KEY `IDX_Id_Groupe1` (`Id_Groupe1`),
  KEY `IDX_Id_Groupe2` (`Id_Groupe2`),
  KEY `IDX_Id_Site` (`Id_Site`),
  KEY `IDX_Id_PDF` (`Id_PDF`),
  KEY `IDX_Nom_Lieu` (`Nom_Lieu`),
  CONSTRAINT `FK_GROUPE1_LIEU` FOREIGN KEY (`Id_Groupe1`) REFERENCES `t_groupe` (`Id_Groupe`),
  CONSTRAINT `FK_GROUPE2_LIEU` FOREIGN KEY (`Id_Groupe2`) REFERENCES `t_groupe` (`Id_Groupe`),
  CONSTRAINT `FK_LIEU_ETAT_SURVEILLANCE` FOREIGN KEY (`Surveillance_Etat`) REFERENCES `t_etat_surveillance` (`Surveillance_Etat`),
  CONSTRAINT `FK_PDF_LIEU` FOREIGN KEY (`Id_PDF`) REFERENCES `t_pdf` (`Id_PDF`),
  CONSTRAINT `FK_PLAN_LIEU` FOREIGN KEY (`Id_Plan`) REFERENCES `t_plan` (`Id_Plan`),
  CONSTRAINT `FK_SITE_LIEU` FOREIGN KEY (`Id_Site`) REFERENCES `t_site` (`Id_Site`),
  CONSTRAINT `FK_SONDE_LIEU` FOREIGN KEY (`Sonde_Numero_Serie`) REFERENCES `t_sonde` (`Sonde_Numero_Serie`)
) ENGINE=InnoDB AUTO_INCREMENT=2110 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
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
DROP TABLE IF EXISTS `t_lieu_planning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_planning` (
  `Id_Lieu_Planning` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Est_Id_Jour` tinyint(1) DEFAULT NULL,
  `Est_Actif` tinyint(1) DEFAULT '1',
  `Heure_Debut_Periode1` varchar(4) DEFAULT '0000',
  `Heure_Fin_Periode1` varchar(4) DEFAULT '0000',
  `Heure_Debut_Periode2` varchar(4) DEFAULT '0000',
  `Heure_Fin_Periode2` varchar(4) DEFAULT '0000',
  PRIMARY KEY (`Id_Lieu_Planning`),
  UNIQUE KEY `IdLieuJour` (`Id_Lieu`,`Est_Id_Jour`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  CONSTRAINT `FK_LIEU_PLANNING` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=67777 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_lieu_tel_num`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_lieu_tel_num` (
  `Id_Tel_Num` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Numero_Ordre` int DEFAULT NULL,
  `Id_Utilisateur` int DEFAULT NULL,
  `Est_Via_Telephone` tinyint(1) DEFAULT NULL,
  `Est_Via_Email` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id_Tel_Num`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  KEY `IDX_Id_Utilisateur` (`Id_Utilisateur`),
  CONSTRAINT `FK_LIEU_TEL_NUM` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=28817 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_module` (
  `Id_Module` int NOT NULL AUTO_INCREMENT,
  `Module_Numero_Serie` varchar(50) DEFAULT NULL,
  `Type_Module` int DEFAULT NULL,
  `Port_Serie` varchar(10) DEFAULT NULL,
  `Position_Plan_X` bigint DEFAULT NULL,
  `Position_Plan_Y` bigint DEFAULT NULL,
  `Id_Plan` int DEFAULT NULL,
  `Adresse_IP` varchar(50) DEFAULT NULL,
  `Delai_Reseau` int DEFAULT NULL,
  `Emplacement` varchar(50) DEFAULT NULL,
  `Archive` tinyint DEFAULT '0',
  `Id_Serveur` int DEFAULT '1',
  PRIMARY KEY (`Id_Module`),
  UNIQUE KEY `Identifiant_Module` (`Type_Module`,`Module_Numero_Serie`),
  KEY `IDX_Module_Numero_Serie` (`Module_Numero_Serie`),
  KEY `IDX_Type_Module` (`Type_Module`),
  KEY `IDX_Port_Serie` (`Port_Serie`),
  KEY `IDX_Id_Plan` (`Id_Plan`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_module_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_module_type` (
  `Id_Module_Type` int NOT NULL AUTO_INCREMENT,
  `Libelle_Type_Module` varchar(50) DEFAULT NULL,
  `Libelle_Module` varchar(100) DEFAULT NULL,
  `Est_Flag_Affiche_Plan` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Module_Type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_parametre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_parametre` (
  `Section` varchar(100) NOT NULL,
  `Mot_Cle` varchar(100) NOT NULL,
  `Valeur` longtext,
  `Commentaire` longtext,
  PRIMARY KEY (`Section`,`Mot_Cle`),
  KEY `IDX_Section` (`Section`),
  KEY `IDX_Mot_Cle` (`Mot_Cle`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_pdf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pdf` (
  `Id_PDF` int NOT NULL AUTO_INCREMENT,
  `Nom_PDF` varchar(50) DEFAULT NULL,
  `Contenu_PDF` longblob,
  PRIMARY KEY (`Id_PDF`)
) ENGINE=InnoDB AUTO_INCREMENT=2083 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_plan` (
  `Id_Plan` int NOT NULL AUTO_INCREMENT,
  `Image` longblob,
  `Titre` varchar(50) DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Plan`),
  UNIQUE KEY `Plan_Titre_IDX` (`Titre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_planning_alarme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_planning_alarme` (
  `Id_Planning_Alarme` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Code_Activation` varchar(8) DEFAULT '11111111',
  PRIMARY KEY (`Id_Planning_Alarme`),
  KEY `IDX_Id_Lieu` (`Id_Lieu`),
  CONSTRAINT `FK_LIEU_PLANNING_ALARME` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=1637 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_planning_consigne`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_planning_consigne` (
  `Id_Planning_Consigne` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Code_Consigne` varchar(3) DEFAULT NULL,
  `Valeur_Consigne_Jour1` float DEFAULT NULL,
  `Valeur_Consigne_Jour1b` float DEFAULT NULL,
  `Valeur_Consigne_Jour2` float DEFAULT NULL,
  `Valeur_Consigne_Jour2b` float DEFAULT NULL,
  `Valeur_Consigne_Jour3` float DEFAULT NULL,
  `Valeur_Consigne_Jour3b` float DEFAULT NULL,
  `Valeur_Consigne_Jour4` float DEFAULT NULL,
  `Valeur_Consigne_Jour4b` float DEFAULT NULL,
  `Valeur_Consigne_Jour5` float DEFAULT NULL,
  `Valeur_Consigne_Jour5b` float DEFAULT NULL,
  `Valeur_Consigne_Jour6` float DEFAULT NULL,
  `Valeur_Consigne_Jour6b` float DEFAULT NULL,
  `Valeur_Consigne_Jour7` float DEFAULT NULL,
  `Valeur_Consigne_Jour7b` float DEFAULT NULL,
  PRIMARY KEY (`Id_Planning_Consigne`),
  KEY `IdLieu` (`Id_Lieu`),
  CONSTRAINT `FK_LIEU_PLANNING_CONSIGNE` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_planning_heure_bascule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_planning_heure_bascule` (
  `Id_Planning_Heure_Bascule` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int DEFAULT NULL,
  `Heure_Jour1` time DEFAULT NULL,
  `Heure_Jour2` time DEFAULT NULL,
  `Heure_Jour3` time DEFAULT NULL,
  `Heure_Jour4` time DEFAULT NULL,
  `Heure_Jour5` time DEFAULT NULL,
  `Heure_Jour6` time DEFAULT NULL,
  `Heure_Jour7` time DEFAULT NULL,
  PRIMARY KEY (`Id_Planning_Heure_Bascule`),
  KEY `IdLieu` (`Id_Lieu`),
  CONSTRAINT `FK_PLANNING_HEURE_BASCULE` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=24020 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_postes_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_postes_clients` (
  `Id_Poste` int NOT NULL AUTO_INCREMENT,
  `Nom_Machine_Connexion` varchar(255) DEFAULT NULL,
  `Adresse_IP_Connexion` varchar(50) DEFAULT NULL,
  `Login` varchar(64) DEFAULT NULL,
  `Nom` varchar(50) DEFAULT NULL,
  `Prenom` varchar(50) DEFAULT NULL,
  `Date_Heure_Derniere_Connexion` datetime DEFAULT NULL,
  PRIMARY KEY (`Id_Poste`),
  UNIQUE KEY `nomMachineId` (`Nom_Machine_Connexion`)
) ENGINE=InnoDB AUTO_INCREMENT=54814 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_profil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_profil` (
  `Id_Profil` int NOT NULL AUTO_INCREMENT,
  `Profil_Utilisateur` varchar(50) DEFAULT NULL,
  `Commentaire` varchar(100) DEFAULT NULL,
  `Est_MC2` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Profil`),
  UNIQUE KEY `Profil_ProfilUtilisateur_IDX` (`Profil_Utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_push_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_push_subscription` (
  `Id_Push_Subscription` int NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` int DEFAULT NULL,
  `Endpoint` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Endpoint_Hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Key_P256dh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Key_Auth` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Expiration_Time` bigint DEFAULT NULL,
  `User_Agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Creation` datetime DEFAULT NULL,
  `Date_Modification` datetime DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Push_Subscription`),
  UNIQUE KEY `Endpoint_Hash` (`Endpoint_Hash`),
  KEY `IDX_Est_Archive_Push_Subscription` (`Est_Archive`),
  KEY `IDX_Id_Utilisateur_Push_Subscription` (`Id_Utilisateur`),
  CONSTRAINT `FK_UTILISATEUR_PUSH_SUBSCRIPTION` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_site` (
  `Id_Site` int NOT NULL AUTO_INCREMENT,
  `Code_Site` varchar(20) DEFAULT NULL,
  `Libelle_Site` varchar(50) DEFAULT NULL,
  `Commentaire` varchar(200) DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Site`),
  UNIQUE KEY `CodeSite_IDX` (`Code_Site`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_sonde`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde` (
  `Id_Sonde` int NOT NULL AUTO_INCREMENT,
  `Adresse_Sonde` varchar(50) DEFAULT NULL,
  `Sonde_Numero_Serie` varchar(50) DEFAULT NULL,
  `Port_Serie` varchar(10) DEFAULT NULL,
  `Surveillance_Etat` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Id_Module` int DEFAULT NULL,
  `Relai_1` varchar(50) DEFAULT NULL,
  `Relai_2` varchar(50) DEFAULT NULL,
  `Relai_3` varchar(50) DEFAULT NULL,
  `Relai_4` varchar(50) DEFAULT NULL,
  `Frequence_Mesure` int DEFAULT NULL,
  `Frequence_Recup` int DEFAULT NULL,
  `Est_Sonde_Reformee` tinyint(1) DEFAULT NULL,
  `Etat_Sonde_N1` varchar(1) DEFAULT NULL,
  `Id_Serveur` int DEFAULT NULL,
  PRIMARY KEY (`Id_Sonde`),
  UNIQUE KEY `Numero_serie` (`Sonde_Numero_Serie`),
  KEY `IDX_Id_Module` (`Id_Module`),
  KEY `IDX_Adresse_Sonde` (`Adresse_Sonde`),
  KEY `IDX_Port_Serie` (`Port_Serie`),
  KEY `IDX_Surveillance_Etat` (`Surveillance_Etat`),
  CONSTRAINT `FK_SONDE_ETAT_SURVEILLANCE` FOREIGN KEY (`Surveillance_Etat`) REFERENCES `t_etat_surveillance` (`Surveillance_Etat`)
) ENGINE=InnoDB AUTO_INCREMENT=3771 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_sonde_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde_type` (
  `Id_Sonde_Type` int NOT NULL AUTO_INCREMENT,
  `Sonde_Type` varchar(50) DEFAULT NULL,
  `Libelle_Sonde_Type` varchar(50) DEFAULT NULL,
  `Est_Gestion_Relais` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id_Sonde_Type`),
  UNIQUE KEY `Sonde_Type` (`Sonde_Type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_sonde_type_mesure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sonde_type_mesure` (
  `Id_Sonde_Type_Mesure` int NOT NULL AUTO_INCREMENT,
  `Sonde_Type_Mesure` varchar(50) DEFAULT NULL,
  `Libelle_Sonde_Type_Mesure` varchar(255) DEFAULT NULL,
  `Est_Flag_Relais` tinyint(1) DEFAULT NULL,
  `Est_Flag_Affiche_Information` tinyint(1) DEFAULT NULL,
  `Unite_Mesure` varchar(20) DEFAULT NULL,
  `Libelle_Unite_Mesure` varchar(50) DEFAULT NULL,
  `Reserve_MC2` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id_Sonde_Type_Mesure`),
  UNIQUE KEY `Sonde_Type_Mesure` (`Sonde_Type_Mesure`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `t_utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_utilisateur` (
  `Id_Utilisateur` int NOT NULL AUTO_INCREMENT,
  `Login` varchar(64) DEFAULT NULL,
  `Mot_De_Passe` varchar(60) DEFAULT NULL,
  `Date_Validite` date DEFAULT NULL,
  `Date_Creation` date DEFAULT NULL,
  `Est_Archive` tinyint(1) DEFAULT '0',
  `Profil_Utilisateur` varchar(50) DEFAULT NULL,
  `Date_Heure_Derniere_Connexion` datetime DEFAULT NULL,
  `Adresse_IP_Connexion` varchar(15) DEFAULT NULL,
  `Nom_Machine_Connexion` varchar(50) DEFAULT NULL,
  `Id_Site` int DEFAULT NULL,
  `Nom` varchar(50) DEFAULT NULL,
  `Prenom` varchar(50) DEFAULT NULL,
  `Tel_Num_Fixe` varchar(50) DEFAULT NULL,
  `Tel_Num_Mobile` varchar(50) DEFAULT NULL,
  `Adresse_Email` varchar(100) DEFAULT NULL,
  `Date_Derniere_Modification_MDP` datetime DEFAULT NULL,
  `Reset_Password_Token` varchar(255) DEFAULT NULL,
  `Reset_Password_Expires` datetime DEFAULT NULL,
  `Est_Mot_De_Passe_Temporaire` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id_Utilisateur`),
  UNIQUE KEY `Utilisateur_Nom_IDX` (`Login`),
  UNIQUE KEY `Login` (`Login`),
  KEY `IDX_Est_Archive` (`Est_Archive`),
  KEY `IDX_Profil_Utilisateur` (`Profil_Utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=355 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
SET FOREIGN_KEY_CHECKS=1;

SET FOREIGN_KEY_CHECKS=0;
INSERT INTO `t_actionneur_type` VALUES (1,4,'IACTX Lumineux',1),(2,5,'IACTX Lumineux contact',1),(3,6,'IACTX Contact',1),(4,7,'IACTX Sonore',1);
INSERT INTO `t_autorisation` VALUES (1,'PARAM_EDITION_STATISTIQUES','Paramétrage édition automatiques des statistique','Indique les heures d\'édition des rapports de statistiques',1,0,0,0),(2,'MATERIEL_MESURE_GERER','Gérer le matériel de mesure','Ajouter / Modifier / Supprimer du matériel',1,0,0,0),(3,'MATERIEL_MESURE_VISUALISER','Visualiser le schéma de l\'installation','Autorise la visualisation de la table sondes , table module',1,0,0,0),(4,'MATERIEL_ALARME_GERER','Gérer le matériel d\'alarme','',1,0,0,0),(5,'PARAMETRES_GERER','Gérer les paramÃ¨tres','Autorise l\'administration des tables de références',1,0,0,0),(6,'APPLICATION_QUITTER_ADMIN','Fermeture de l\'application depuis l\'administration','Autorise la fermeture de l\'application',1,0,0,0),(7,'MATERIEL_METROLOGIE_GERER','Gérer le matériel de métrologie','',0,1,0,0),(8,'METROLOGIE_REALISER','Réaliser la métrologie','',0,1,0,0),(9,'METROLOGIE_VISUALISER','Visualiser la métrologie','Autorise la visualisation de la table étalonnage, de la table calibrage',0,1,0,0),(10,'APPLICATION_QUITTER_METRO','Fermeture de l\'application depuis la métrologie','Autorise la fermeture de l\'application',0,1,0,0),(11,'LIEU_GERER','Gérer les lieux','Autorise la gestion des lieux',0,0,1,0),(12,'LIEU_VISUALISER','Visualiser les lieux','Autorise la visualisation de la table lieux',0,0,1,0),(13,'ALARMES_GERER','Gérer les alarmes','',0,0,1,0),(14,'LIEU_ACTIV_DESACT','Activer / Désactiver un lieu','Autorise l\'activation et la désactivation des lieux',0,0,1,0),(15,'APPLICATION_QUITTER_SURV','Fermeture de l\'application depuis la surveillance','Autorise la fermeture de l\'application',0,0,1,0),(16,'APPLICATION_QUITTER_VIGILOG','Fermeture de l\'application depuis VigiLog','Autorise la fermeture de l\'application',0,0,0,1),(17,'GERER_PROFIL','Gérer les profils et les autorisations','Autorise la gestion des profils et des autorisations pour les utilisateurs',1,0,0,0),(18,'TELE_ASSISTANCE','Demander une assistance','Autorise l\'utilisation de la téléassitace',0,0,1,0),(19,'SUPERPOSITION_COURBE','Réaliser une superposition de courbe','Autorise la fonction superposer les courbes',0,0,1,0);
INSERT INTO `t_etalon_type` VALUES ('ES','VigiTemp Type ES','Sonde talon radio type E',1,0,0.05),('EX','Externe','Sonde externe',1,1,0),('SEF','VigiTemp Type SEF','Sonde talon filaire ou filaire/radio avec prise RJ45',1,0,0.02);
INSERT INTO `t_liaison_profil_autorisation` VALUES (1,6),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(3,12),(3,13),(3,14),(3,15),(7,15),(8,1),(8,2),(8,3),(8,4),(8,5),(8,6),(8,7),(8,8),(8,9),(8,10),(8,11),(8,12),(8,13),(8,14),(8,15),(8,16),(8,17),(8,18),(8,19),(9,12),(9,13),(9,14),(9,15),(12,5),(12,6),(12,7),(12,8),(12,11),(12,12),(12,14),(12,16),(12,17);
INSERT INTO `t_liaison_sonde_type_mesure` VALUES (1,'E','C'),(2,'E','H'),(3,'E','N'),(4,'E','P'),(5,'G','C'),(6,'G','H'),(7,'G','N'),(8,'G','P'),(9,'H','C'),(10,'H','H'),(11,'H','N'),(12,'H','P'),(13,'R','C'),(14,'R','H'),(15,'R','N'),(16,'R','P'),(17,'V','C'),(18,'V','H'),(19,'V','N'),(20,'V','P'),(21,'I','C'),(22,'I','H'),(23,'I','N'),(24,'I','E'),(25,'I','P'),(26,'I','Q'),(27,'M','M'),(28,'H','Q'),(29,'V','Q');
INSERT INTO `t_module_type` VALUES (1,'BIN','Boitier filaire avec prise DB9 (port série)',0),(2,'BIR (filaire)','Boitier réseau filaire avec pris RJ45 (prise réseau)',1),(3,'BTR','Boitier radio avec prise DB9 (port série)',0),(4,'BIR (radio)','Boitier réseau radio avec prise RJ45 (port série)',1),(5,'CORONIS','Boitier radio CORONIS avec prise DB9 (port série)',0),(6,'MRH','Boitier MRH',0),(7,'ITR','Module port série',0),(8,'IETH','Module éthernet',0);
INSERT INTO `t_parametre` VALUES ('CFR21','ACTIVATION_EXPIRATION_MOT_DE_PASSE','true','Activer l\'expiration des mots de passe (CFR21)'),('CFR21','ACTIVATION_NORME_CFR21','1','Activer la conformité CFR21 (saisie des configurations)'),('CFR21','EVENEMENTS','1','Activation des événements'),('CFR21','JOURS_VALIDITE_MOT_DE_PASSE','90',NULL),('CFR21','MOT_DE_PASSE_PERMANENT','1','Le mot de passe ne peut pas Ãªtre changé par l\'utilisateur'),('CFR21','MOT_DE_PASSE_REUTILISABLE','0','L\'utilisateur ne peut pas réutiliser un ancien mot de passe'),('CFR21','NOMBRE_TENTATIVES_MOT_DE_PASSE','3','Nombre de tentatives autorisées avant verrouillage du compte'),('CFR21','REACTIVATION_ALARME_SONORE','500','Délai de réactivation de l\'alarme sonore en millisecondes'),('CFR21','SECURITE','0','Mode sécurité renforcé'),('CFR21','TEMPS_DECONNEXION_MINUTES','20','Temps d\'inactivité avant déconnexion automatique en minutes'),('CFR21','VALIDITE_MOT_DE_PASSE_JOURS','90','Durée de validité du mot de passe en jours'),('LICENCE','CLIENT','9310027000','Numéro client de licence'),('LICENCE','VIGITEL','Kd2sV0V5ujab8uqVIyIxGHVWx70','Clé de licence VigiTel'),('LICENCE','VIGITEMP','PzA5CoG+fGCp7L/SO3fTXQCa22Y','Clé de licence VigiTemp'),('MYSQL','MOT_DE_PASSE_CRYPTE','1','Le mot de passe MySQL est crypté'),('MYSQL','VERSION_BASE_DONNEES','20200201','Version de la base de données (utile pour les mises Ã  jour)'),('SAUVEGARDES','ADRESSE_IP_MACHINE','10.133.226.14','Adresse IP de la machine serveur'),('SAUVEGARDES','CONSTRUCTION_BATCH','','Script de construction batch pour les sauvegardes'),('SAUVEGARDES','DOSSIER_MYSQL','C:/MySQL/APP','Chemin du dossier d\'installation MySQL'),('SAUVEGARDES','DOSSIER_SAUVEGARDE','D:/MySQL/BACKUP','Chemin du dossier de sauvegarde'),('SAUVEGARDES','LISTE_FICHIERS','D:/MySQL/BACKUP/BackupVigiTempX_20251205_2200.sql	BackupVigiTempX_20251205_2200	20251205	220022	310566532\r\nD:/MySQL/BACKUP/BackupVigiTempX_20251206_2200.sql	BackupVigiTempX_20251206_2200	20251206	220018	310567296\r\nD:/MySQL/BACKUP/BackupVigiTempX_20251207_2200.sql	BackupVigiTempX_20251207_2200	20251207	220015	310567819\r\nD:/MySQL/BACKUP/BackupVigiTempX_mesure_20251205_2200.sql	BackupVigiTempX_mesure_20251205_2200	20251205	220331	5706207530\r\nD:/MySQL/BACKUP/BackupVigiTempX_mesure_20251206_2200.sql	BackupVigiTempX_mesure_20251206_2200	20251206	220328	5712244382\r\nD:/MySQL/BACKUP/BackupVigiTempX_mesure_20251207_2200.sql	BackupVigiTempX_mesure_20251207_2200	20251207	220324	5718306181','Liste des fichiers de sauvegarde avec détails'),('SAUVEGARDES','NOM_TACHE','SauvegardeVigiTempX','Nom de la tÃ¢che planifiée de sauvegarde'),('SECURITE','LONGUEUR_MINIMALE_MOT_DE_PASSE','8','Nombre minimum de caractÃ¨res pour un mot de passe'),('SECURITE','NOMBRE_MIN_CARACTERES_SPECIAUX','1','Nombre minimum de caractÃ¨res spéciaux requis (!@#$%^&* etc.)'),('SECURITE','NOMBRE_MIN_CHIFFRES','1','Nombre minimum de chiffres requis'),('SECURITE','NOMBRE_MIN_LETTRES_MAJUSCULES','1','Nombre minimum de lettres majuscules requises'),('SECURITE','NOMBRE_MIN_LETTRES_MINUSCULES','1','Nombre minimum de lettres minuscules requises'),('SECURITE_EMAIL','SMTP_ACTIVATION','true','Activer l\'envoi d\'emails'),('SECURITE_EMAIL','SMTP_EXPEDITEUR','noreply@vigitemp.fr','Adresse email expéditeur (doit correspondre au domaine SMTP)'),('SECURITE_EMAIL','SMTP_MOT_DE_PASSE','Password-123','Mot de passe SMTP'),('SECURITE_EMAIL','SMTP_PORT','587','Port SMTP (587 pour TLS, 465 pour SSL)'),('SECURITE_EMAIL','SMTP_SERVEUR','smtp-randommail18473.alwaysdata.net','Serveur SMTP pour l\'envoi d\'emails'),('SECURITE_EMAIL','SMTP_UTILISATEUR','randommail18473@alwaysdata.net','Utilisateur SMTP'),('SECURITE_MOT_DE_PASSE','LONGUEUR_MINIMALE','8','Longueur minimale du mot de passe'),('SECURITE_MOT_DE_PASSE','MIN_CARACTERES_SPECIAUX','1','Nombre minimum de caractÃ¨res spéciaux'),('SECURITE_MOT_DE_PASSE','MIN_CHIFFRES','1','Nombre minimum de chiffres'),('SECURITE_MOT_DE_PASSE','MIN_LETTRES_MAJUSCULES','1','Nombre minimum de majuscules'),('SECURITE_MOT_DE_PASSE','MIN_LETTRES_MINUSCULES','1','Nombre minimum de minuscules'),('STATISTIQUE','ENTETE_RAPPORT_UTILISATEUR_221','','En-tÃªte du rapport utilisateur 221'),('STATISTIQUE','ENTETE_RAPPORT_UTILISATEUR_81','','En-tÃªte du rapport utilisateur 81'),('STATISTIQUE','HEURE_RAPPORT_UTILISATEUR_221','','Heure du rapport utilisateur 221'),('STATISTIQUE','HEURE_RAPPORT_UTILISATEUR_81','','Heure du rapport utilisateur 81'),('STATISTIQUE','ORIENTATION_RAPPORT_221','','Orientation du rapport 221'),('STATISTIQUE','ORIENTATION_RAPPORT_81','','Orientation du rapport 81'),('VIGISERV','ACTIONS_PRIORITAIRES','0','Activation des actions prioritaires'),('VIGISERV','ACTIONS_PRIORITAIRES_DESACTIVATION','0','Désactivation des actions prioritaires (si égal Ã  1, les actions prioritaires n\'ont pas d\'effet)'),('VIGISERV','DATE_DERNIER_FICHIER_SAUVEGARDE','2025-12-07 22:03:24','Date du dernier fichier de sauvegarde remonté par VigiServ'),('VIGISERV','DELAI_ALERTE_MESURE_MINUTES','60','Délai de vérification maximum avant de lancer une alerte sur la derniÃ¨re mesure (en minutes)'),('VIGISERV','DELAI_REPONSE_SONDE_AVR_CENTIEMES_SECONDES','100','Délai maximum pour l\'attente de lecture des sondes AVR en centiÃ¨mes de seconde'),('VIGISERV','DELAI_REPONSE_SONDE_EI_CENTIEMES_SECONDES','150','Délai maximum pour l\'attente de lecture des sondes EI en centiÃ¨mes de seconde'),('VIGISERV','DELAI_SONNERIE_ALARME_MINUTES','2','Délai pour la vérification si des alarmes sont présentes avant activation d\'une alarme sonore (en minutes)'),('VIGISERV','DERNIER_MESURE_APPEL','SondesSurveillance','DerniÃ¨re fonction appelée par le service VigiServ'),('VIGISERV','DERNIER_MESURE_APPEL_1','SondesSurveillance','DerniÃ¨re fonction appelée par le service VigiServ (serveur 1)'),('VIGISERV','DERNIER_MESURE_APPEL_2','SondesSurveillance','DerniÃ¨re fonction appelée par le service VigiServ (serveur 2)'),('VIGISERV','DERNIER_MESURE_APPEL_3','SondesSurveillance','DerniÃ¨re fonction appelée par le service VigiServ (serveur 3)'),('VIGISERV','DERNIER_MESURE_DATE_HEURE','2025120822000153','Date heure de la derniÃ¨re mesure inscrite par le service VigiServ'),('VIGISERV','DERNIER_MESURE_DATE_HEURE_1','2025120822000152','Date heure de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 1)'),('VIGISERV','DERNIER_MESURE_DATE_HEURE_2','2025120822000152','Date heure de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 2)'),('VIGISERV','DERNIER_MESURE_DATE_HEURE_3','2025120822000220','Date heure de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 3)'),('VIGISERV','DERNIER_MESURE_SONDE','IPPD2I','Numéro de sonde de la derniÃ¨re mesure inscrite par le service VigiServ'),('VIGISERV','DERNIER_MESURE_SONDE_1','IN24CI','Numéro de sonde de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 1)'),('VIGISERV','DERNIER_MESURE_SONDE_2','IN22PP','Numéro de sonde de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 2)'),('VIGISERV','DERNIER_MESURE_SONDE_3','IN22GU','Numéro de sonde de la derniÃ¨re mesure inscrite par le service VigiServ (serveur 3)'),('VIGISERV','DIALOGUE_EN_MINUTES','1','Intervalle de dialogue avec le service VigiServ en minutes'),('VIGISERV','DUREE_LOGIN_SECONDES','60','Durée de validité du login (le login ne sera pas redemandé dans ce délai) (en secondes)'),('VIGISERV','ECRAN_OFF','1','Ã‰cran éteint'),('VIGISERV','ENREGISTREMENT_ON','1','Activation de l\'enregistrement'),('VIGISERV','FICHIER_EXTERNE','0','Utiliser un fichier externe'),('VIGISERV','FREQUENCE_NON_REPONSE_MINUTES','15','Fréquence Ã  appliquer si la derniÃ¨re mesure est en erreur (en minutes)'),('VIGISERV','FREQUENCE_VERIFICATION_MINUTES','15','Fréquence de vérification en minutes'),('VIGISERV','MEMOIRE_OFF','1','Mémoire éteinte'),('VIGISERV','NOM_UTILISATEUR_SERVEUR','Serveur VigiTemp MC2','Nom de l\'utilisateur du serveur'),('VIGISERV','PING_MODULE','1','Autorise ou pas le ping en cas de test d\'un module réseau (0 = OFF, 1 = ON)'),('VIGISERV','SATURATION_SONDE_LINEAIRE','-40','Seuil de saturation d\'une sonde linéaire'),('VIGISERV','SECONDES_ENTRE_MESURES_ETALONNAGE','30','Nombre de secondes entre chaque mesure d\'étalonnage'),('VIGISERV','SERVEUR_ADRESSE_IP','10.133.226.14','Adresse IP du serveur VigiServ'),('VIGISERV','SERVEUR_ADRESSE_IP_1','10.133.226.14','Adresse IP du serveur VigiServ (serveur 1)'),('VIGISERV','SERVEUR_ADRESSE_IP_2','10.133.226.14','Adresse IP du serveur VigiServ (serveur 2)'),('VIGISERV','SERVEUR_ADRESSE_IP_3','10.133.226.14','Adresse IP du serveur VigiServ (serveur 3)'),('VIGISERV','SERVEUR_NOM','SVM-IFB-VIGIS','Nom du serveur VigiServ'),('VIGISERV','SERVEUR_NOM_1','SVM-IFB-VIGIS','Nom du serveur VigiServ (serveur 1)'),('VIGISERV','SERVEUR_NOM_2','SVM-IFB-VIGIS','Nom du serveur VigiServ (serveur 2)'),('VIGISERV','SERVEUR_NOM_3','SVM-IFB-VIGIS','Nom du serveur VigiServ (serveur 3)'),('VIGISERV','SERVICE_DATE_HEURE','2025120822000219','Date heure inscrite par le service VigiServ'),('VIGISERV','SERVICE_DATE_HEURE_1','2025120822000144','Date heure inscrite par le service VigiServ (serveur 1)'),('VIGISERV','SERVICE_DATE_HEURE_2','2025120822000144','Date heure inscrite par le service VigiServ (serveur 2)'),('VIGISERV','SERVICE_DATE_HEURE_3','2025120822000219','Date heure inscrite par le service VigiServ (serveur 3)'),('VIGISERV','SONDE_EN_SEUIL_BAS','-60','Seuil bas pour les sondes de type EN'),('VIGISERV','SONDE_EN_SEUIL_HAUT','100','Seuil haut pour les sondes de type EN'),('VIGISERV','SONDE_EP_SEUIL_BAS','-400','Seuil bas pour les sondes de type EP'),('VIGISERV','SONDE_EP_SEUIL_HAUT','400','Seuil haut pour les sondes de type EP'),('VIGISERV','SONDE_GN_SEUIL_BAS','-60','Seuil bas pour les sondes de type GN'),('VIGISERV','SONDE_GN_SEUIL_HAUT','70','Seuil haut pour les sondes de type GN'),('VIGISERV','SONDE_GP_SEUIL_BAS','-400','Seuil bas pour les sondes de type GP'),('VIGISERV','SONDE_GP_SEUIL_HAUT','400','Seuil haut pour les sondes de type GP'),('VIGISERV','SONDE_HN_SEUIL_BAS','-60','Seuil bas pour les sondes de type HN'),('VIGISERV','SONDE_HN_SEUIL_HAUT','100','Seuil haut pour les sondes de type HN'),('VIGISERV','SONDE_HP_SEUIL_BAS','-400','Seuil bas pour les sondes de type HP'),('VIGISERV','SONDE_HP_SEUIL_HAUT','400','Seuil haut pour les sondes de type HP'),('VIGISERV','SONDE_IC_SEUIL_BAS','-400','Seuil bas pour les sondes de type IC'),('VIGISERV','SONDE_IC_SEUIL_HAUT','400','Seuil haut pour les sondes de type IC'),('VIGISERV','SONDE_IHCQP_SEUIL_BAS','-400','Seuil bas pour les sondes de type IHCQP'),('VIGISERV','SONDE_IHCQP_SEUIL_HAUT','1200','Seuil haut pour les sondes de type IHCQP'),('VIGISERV','SONDE_IH_SEUIL_BAS','-400','Seuil bas pour les sondes de type IH'),('VIGISERV','SONDE_IH_SEUIL_HAUT','400','Seuil haut pour les sondes de type IH'),('VIGISERV','SONDE_IN_SEUIL_BAS','-60','Seuil bas pour les sondes de type IN'),('VIGISERV','SONDE_IN_SEUIL_HAUT','80','Seuil haut pour les sondes de type IN'),('VIGISERV','SONDE_IP_SEUIL_BAS','-400','Seuil bas pour les sondes de type IP'),('VIGISERV','SONDE_IP_SEUIL_HAUT','400','Seuil haut pour les sondes de type IP'),('VIGISERV','SONDE_IQ_SEUIL_BAS','-400','Seuil bas pour les sondes de type IQ'),('VIGISERV','SONDE_IQ_SEUIL_HAUT','1100','Seuil haut pour les sondes de type IQ'),('VIGISERV','TIMEOUT_PING_MILLISECONDES','200','TimeOut de la durée d\'attente de la fonction Ping() en millisecondes'),('VIGISERV','TIMEOUT_PORT_SERIE_MILLISECONDES','5000','TimeOut de la durée d\'attente de la fonction sOuvre() en millisecondes'),('VIGISURV','ALARME_SONORE_LIEU_NON_ACQUITE','0','Alarme sonore pour les lieux non acquittés'),('VIGISURV','ALERTE_SURVEILLANCE','0','Alerte de surveillance'),('VIGISURV','DELAI_ARRET_THREAD_CHANGEMENT_GROUPE_MILLISECONDES','500','Délai laissé Ã  l\'application pour arrÃªter le thread de mise Ã  jour avant rafraÃ®chissement pour le changement de groupe (en millisecondes)'),('VIGISURV','DELAI_ARRET_THREAD_DESSIN_MILLISECONDES','100','Délai laissé Ã  l\'application avant de redémarrer le thread dessin aprÃ¨s un changement de groupe (en millisecondes)'),('VIGISURV','DELAI_AVANT_ARCHIVE_JOURS','365','Nombre de jours avant archivage automatique'),('VIGISURV','DELAI_PAUSE_THREAD_MAJ_DESSIN_SECONDES','25','Délai en secondes de pause entre 2 mises Ã  jour complÃ¨tes des dessins. Augmenter ce nombre pour dessiner moins souvent les graphes'),('VIGISURV','DELAI_PAUSE_THREAD_MAJ_SECONDES','30','Délai en secondes de pause entre 2 mises Ã  jour complÃ¨tes des lieux. Augmenter ce nombre pour rafraÃ®chir moins souvent'),('VIGISURV','DELAI_RAFRAICHISSEMENT_ADMIN_SECONDES','300','Délai de mise Ã  jour de l\'écran d\'administration en secondes'),('VIGISURV','DELAI_RAFRAICHISSEMENT_METROLOGIE_SECONDES','300','Délai de mise Ã  jour de l\'écran de métrologie en secondes'),('VIGISURV','DELAI_VERIFICATION_ALERTES_SECONDES','30','Délai de vérification des alertes en secondes'),('VIGISURV','DELAI_VERIFICATION_VIGISERV_MINUTES','60','Délai du message d\'alarme VigiServ en minutes'),('VIGISURV','DELAI_VERIFICATION_VIGITEL_MINUTES','60','Délai du message d\'alarme VigiTel en minutes'),('VIGISURV','EXPLICATIONS_TESTS','- Ping base VigiTemp\r\n  Permet de savoir si le serveur hébergeant la base de données VigiTemp est accessible. Un ping permet de connaÃ®tre son état de connexion au réseau.\r\n\r\n- RequÃªte base VigiTemp\r\n  Une requÃªte est exécutée sur la base de données VigiTemp afin de savoir si MySQL est bien opérationnel.\r\n\r\n- Ping serveur VigiServ\r\n  Permet de savoir si le serveur hébergeant la base de données des mesures est accessible. Un ping permet de connaÃ®tre son état de connexion au réseau.\r\n\r\n- RequÃªte serveur VigiServ\r\n  Une requÃªte est exécutée sur la base de données VigiTemp afin de savoir si la base de données Ã  bien été initialisée.\r\n\r\n- Interrogation VigiServ\r\n  Vérifie si VigiServ est actif. Le service VigiServ informe de son état de faÃ§on réguliÃ¨re en écrivant dans la base de données. Si cette écriture n\'a pas été effectuée récemment alors VigiServ est inactif.\r\n\r\n- Interrogation VigiTel\r\n  Vérifie si VigiTel est actif. Le service VigiTel informe de son état de faÃ§on réguliÃ¨re en écrivant dans la base de données. Si cette écriture n\'a pas été effectuée récemment alors VigiTel est inactif.','Texte d\'explication pour les tests de la fenÃªtre outils'),('VIGISURV','IDENT_VIGILOG','0','Identifiant VigiLog'),('VIGISURV','LANCEMENT_ROBOT_SURVEILLANCE_MINUTES','10','Lance la vérification (Ping, RequÃªtes, Services) toutes les 10 minutes'),('VIGISURV','LIAISON_ARMURE','0','Liaison avec l\'armoire'),('VIGISURV','LIAISON_ARMURE_MODE','1','Mode de liaison avec l\'armoire'),('VIGISURV','LIAISON_ARMURE_REPERTOIRE','','Répertoire de liaison avec l\'armoire'),('VIGISURV','MAX_VALIDITE_ETALONNAGE_JOURS','365','Nombre de jours durant lequel les étalonnages sont valides'),('VIGISURV','MAX_VALIDITE_SAUVEGARDE_JOURS','7','Nombre de jours durant lequel la sauvegarde est valide'),('VIGISURV','MOT_DE_PASSE_ETALONNAGE','METRO','Mot de passe pour les opérations d\'étalonnage'),('VIGISURV','REMONTER_HEURE_SERVEUR_LOGIN','0','Activer la remontée de l\'heure du serveur au login'),('VIGISURV','TAUX_RAFRAICHISSEMENT_INITIALISATION_ECRAN','10','Nombre de lieux Ã  afficher lors du chargement de l\'écran. Augmenter ce nombre pour accélérer le premier chargement'),('VIGISURV','TEXTE_SAUVEGARDE','La mise en place des sauvegardes s\'effectue sur le poste serveur VigiTemp.','Texte d\'information sur les sauvegardes'),('VIGISURV','VISION_SIMPLE','0','Mode vision simple'),('VIGITEL','ALARME_NON_REPONSE','0','Alarme de non-réponse'),('VIGITEL','DUREE_LOGIN_SECONDES','60','Durée de validité du login VigiTel (en secondes)'),('VIGITEL','EMAIL_ALARME_EXPEDITEUR','vigitemp@chu-toulouse.fr','Adresse e-mail expéditeur pour les alarmes'),('VIGITEL','EMAIL_ALARME_MESSAGE','Le lieu en alarme est : %Lieu (sonde nÂ° %NumSonde)\r\nType d\'alarme : %AlarmeTexteMessage\r\nDernier relevé : %Valeur %Unité','Template du message d\'alarme par e-mail'),('VIGITEL','EMAIL_ALARME_OBJET','Alarme VigiTemp','Objet de l\'e-mail d\'alarme'),('VIGITEL','FORMAT_FICHIER_SON','41','Format du fichier son (41 = SAFTCCITT_ALaw_8kHzMono)'),('VIGITEL','FREQUENCE_VERIFICATION_MINUTES','15','Fréquence de vérification VigiTel en minutes'),('VIGITEL','MODE_DEBUG','0','Activer le mode débogage de VigiTel'),('VIGITEL','NOM_MODEM','Diva Server \'POTS2<41060>\' Chn 1 Ln 1 Ctrl \'1\'','Nom du modem utilisé'),('VIGITEL','SEPARATEUR_DECIMAL',',','Séparateur décimal (. ou ,) pour la mise en forme d\'une valeur relevée'),('VIGITEL','SERVICE_DATE_HEURE','2025120821594515','Date heure inscrite par le service VigiTel'),('VIGITEL','SMTP_COMPTE','','Compte SMTP VigiTel'),('VIGITEL','SMTP_MODE_ASYNCHRONE','0','Mode asynchrone SMTP'),('VIGITEL','SMTP_MOT_DE_PASSE','','Mot de passe SMTP VigiTel'),('VIGITEL','SMTP_PORT','25','Port SMTP VigiTel'),('VIGITEL','SMTP_SECURISE_TSL','0','Activer la sécurisation TSL du SMTP'),('VIGITEL','SMTP_SERVEUR','smtp','Serveur SMTP VigiTel'),('VIGITEL','VITESSE_VOIX','1','Vitesse de la voix (de -10 Ã  10)'),('VIGITEL','VOLUME_VOIX','100','Volume de la voix (de 1 Ã  100)');
INSERT INTO `t_profil` VALUES (1,'Administrateurs',NULL,0),(3,'Consultation + Acquittement',NULL,0),(7,'VIGITEL','',0),(8,'ADMINistrateurs +','',0),(9,'Consultation + Acquittement + Désactivation','',0),(12,'Test ajout',NULL,0);
INSERT INTO `t_etat_surveillance` VALUES (1,'C','En calibrage'),(2,'D','Surveillance désactivée'),(3,'E','En étalonnage'),(4,'S','Utilisée en surveillance'),(5,'T','En test');
INSERT INTO `t_sonde_type` VALUES (1,'E','Sonde radio relais type E',1),(2,'G','Sonde radio relais type G',1),(3,'H','Sonde radio relais type H',1),(4,'I','Sonde radio de type I',0),(5,'R','Sonde radio',0),(6,'V','Sonde filaire',0);
INSERT INTO `t_utilisateur` (Login, Mot_De_Passe, Est_Archive, Profil_Utilisateur, Est_Mot_De_Passe_Temporaire, Date_Creation, Date_Derniere_Modification_MDP) VALUES ('admin', '$2b$10$exu0K3GI93aCnu8S1rXqle6QFUblWAwv5LPer2swBja/XGpjRiTCG', 0, 'Administrateurs', 1, NOW(), NOW());
DROP TRIGGER IF EXISTS trg_alarme_to_histo;
DELIMITER $$
CREATE TRIGGER trg_alarme_to_histo
BEFORE DELETE ON t_alarme
FOR EACH ROW
BEGIN
  INSERT INTO t_alarme_histo (
    Id_Alarme,
    Date_Heure_Debut,
    Valeur,
    Type,
    Date_Heure_Fin,
    Est_Alarme_Vrai,
    Id_Lieu,
    Sonde_Numero_Serie,
    Unite,
    Est_Acquittee,
    Date_Heure_Derniere_Mesure,
    Date_Heure_Debut_Alarme_Vrai,
    Est_Alarme_Pour_VigiTel,
    Est_Mail_Envoye,
    Est_Tel_Acquittee,
    Date_Heure_Acquittement
  ) VALUES (
    OLD.Id_Alarme,
    OLD.Date_Heure_Debut,
    OLD.Valeur,
    OLD.Type,
    OLD.Date_Heure_Fin,
    OLD.Est_Alarme_Vrai,
    OLD.Id_Lieu,
    OLD.Sonde_Numero_Serie,
    OLD.Unite,
    OLD.Est_Acquittee,
    OLD.Date_Heure_Derniere_Mesure,
    OLD.Date_Heure_Debut_Alarme_Vrai,
    OLD.Est_Alarme_Pour_VigiTel,
    OLD.Est_Mail_Envoye,
    OLD.Est_Tel_Acquittee,
    NOW()
  );
END$$
DELIMITER ;
SET FOREIGN_KEY_CHECKS=1;

