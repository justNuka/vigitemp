-- t_commande_materiel
CREATE TABLE `t_commande_materiel` (
	`Id_Commande_Materiel` INT NOT NULL AUTO_INCREMENT,
	`Reference_Commande` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Utilisateur` INT NOT NULL,
	`Nom_Demandeur` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Email_Demandeur` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Email_Commercial` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Commentaire` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Mode_Transmission` ENUM('SMTP','MAILTO') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Statut_Commande` ENUM('BROUILLON','ENVOYEE','PREPAREE') NOT NULL DEFAULT 'BROUILLON' COLLATE 'utf8mb4_unicode_ci',
	`Date_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Envoi` DATETIME NULL DEFAULT NULL,
	`Id_Pdf` INT NULL DEFAULT NULL,
	PRIMARY KEY (`Id_Commande_Materiel`) USING BTREE,
	UNIQUE INDEX `UK_t_commande_materiel_reference` (`Reference_Commande`) USING BTREE,
	INDEX `IX_t_commande_materiel_utilisateur` (`Id_Utilisateur`) USING BTREE,
	INDEX `IX_t_commande_materiel_pdf` (`Id_Pdf`) USING BTREE,
	CONSTRAINT `FK_t_commande_materiel_pdf` FOREIGN KEY (`Id_Pdf`) REFERENCES `t_pdf` (`Id_PDF`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `FK_t_commande_materiel_utilisateur` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;

-- t_commande_materiel_ligne
CREATE TABLE `t_commande_materiel_ligne` (
	`Id_Commande_Materiel_Ligne` INT NOT NULL AUTO_INCREMENT,
	`Id_Commande_Materiel` INT NOT NULL,
	`Id_Materiel` INT NOT NULL,
	`Ref_Commercial` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Designation` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Descriptif` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Gamme` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Type` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Quantite` INT NOT NULL,
	PRIMARY KEY (`Id_Commande_Materiel_Ligne`) USING BTREE,
	INDEX `IX_t_commande_materiel_ligne_commande` (`Id_Commande_Materiel`) USING BTREE,
	INDEX `IX_t_commande_materiel_ligne_materiel` (`Id_Materiel`) USING BTREE,
	CONSTRAINT `FK_t_commande_materiel_ligne_commande` FOREIGN KEY (`Id_Commande_Materiel`) REFERENCES `t_commande_materiel` (`Id_Commande_Materiel`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT `FK_t_commande_materiel_ligne_materiel` FOREIGN KEY (`Id_Materiel`) REFERENCES `t_materiel` (`Id_Materiel`) ON UPDATE CASCADE ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;

-- t_lieu_planning_regle
CREATE TABLE `t_lieu_planning_regle` (
	`Id_Regle` INT NOT NULL AUTO_INCREMENT,
	`Id_Lieu` INT NOT NULL,
	`Actif` TINYINT(1) NOT NULL DEFAULT '1',
	`Jour_Debut` TINYINT NOT NULL,
	`Heure_Debut` TIME NOT NULL,
	`Jour_Fin` TINYINT NOT NULL,
	`Heure_Fin` TIME NOT NULL,
	`Consigne` FLOAT NULL DEFAULT NULL,
	`Consigne_Sup` FLOAT NULL DEFAULT NULL,
	`Consigne_Inf` FLOAT NULL DEFAULT NULL,
	`Priorite` INT NOT NULL DEFAULT '0',
	`Tolerance_Sup_Calc` FLOAT NULL DEFAULT NULL,
	`Tolerance_Inf_Calc` FLOAT NULL DEFAULT NULL,
	`Date_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Maj` DATETIME NULL DEFAULT NULL,
	`Retard_Alarme_Changement_Consigne` INT NULL DEFAULT NULL,
	PRIMARY KEY (`Id_Regle`) USING BTREE,
	INDEX `IDX_Id_Lieu` (`Id_Lieu`) USING BTREE,
	INDEX `IDX_Actif_Lieu` (`Actif`, `Id_Lieu`) USING BTREE,
	CONSTRAINT `FK_PLANNING_REGLE_LIEU` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`) ON UPDATE NO ACTION ON DELETE CASCADE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=68
;

-- t_lieu_template
CREATE TABLE `t_lieu_template` (
	`Id_Lieu_Template` INT NOT NULL AUTO_INCREMENT,
	`Nom_Template` VARCHAR(80) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Description` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Lieu_Etat` VARCHAR(1) NOT NULL DEFAULT 'D' COLLATE 'utf8mb4_unicode_ci',
	`Frequence` INT NULL DEFAULT NULL,
	`Retard_Alarme_Haut` INT NULL DEFAULT NULL,
	`Retard_Alarme_Bas` INT NULL DEFAULT NULL,
	`Retard_Non_Reponse` INT NULL DEFAULT '60',
	`Retard_Alarme_Changement_Consigne` INT NULL DEFAULT NULL,
	`Consigne` DECIMAL(10,2) NULL DEFAULT NULL,
	`Consigne_Sup` DECIMAL(10,2) NULL DEFAULT NULL,
	`Consigne_Inf` DECIMAL(10,2) NULL DEFAULT NULL,
	`Tolerance_Surveillance_Sup` DECIMAL(10,2) NULL DEFAULT NULL,
	`Tolerance_Surveillance_Inf` DECIMAL(10,2) NULL DEFAULT NULL,
	`Consigne_Sup_Pre_Alarme` DECIMAL(10,2) NULL DEFAULT NULL,
	`Consigne_Inf_Pre_Alarme` DECIMAL(10,2) NULL DEFAULT NULL,
	`Est_Consigne_Sup_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Consigne_Inf_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Consigne_Sup_Pre_Alarme_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Consigne_Inf_Pre_Alarme_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Son_Alarme_Active` TINYINT(1) NOT NULL DEFAULT '1',
	`Est_Redeclenchement_Immediat` TINYINT(1) NOT NULL DEFAULT '0',
	`Nb_Mesures_Temporisation_Redeclenchement` INT NULL DEFAULT '0',
	`Observations_Info` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Est_Archive` TINYINT(1) NOT NULL DEFAULT '0',
	`Date_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Maj` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`Id_Utilisateur_Creation` INT NULL DEFAULT NULL,
	`Id_Utilisateur_Maj` INT NULL DEFAULT NULL,
	PRIMARY KEY (`Id_Lieu_Template`) USING BTREE,
	UNIQUE INDEX `UK_t_lieu_template_nom` (`Nom_Template`) USING BTREE,
	INDEX `IDX_t_lieu_template_archive` (`Est_Archive`) USING BTREE,
	INDEX `IDX_t_lieu_template_user_create` (`Id_Utilisateur_Creation`) USING BTREE,
	INDEX `IDX_t_lieu_template_user_update` (`Id_Utilisateur_Maj`) USING BTREE,
	CONSTRAINT `FK_t_lieu_template_user_create` FOREIGN KEY (`Id_Utilisateur_Creation`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE NO ACTION ON DELETE SET NULL,
	CONSTRAINT `FK_t_lieu_template_user_update` FOREIGN KEY (`Id_Utilisateur_Maj`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE NO ACTION ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

-- t_materiel
CREATE TABLE `t_materiel` (
	`Id_Materiel` INT NOT NULL AUTO_INCREMENT,
	`Ref_Commercial` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Designation` VARCHAR(100) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Descriptif` VARCHAR(1000) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Gamme` VARCHAR(10) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Type` VARCHAR(10) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Chemin_Image` VARCHAR(500) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`Id_Materiel`) USING BTREE,
	INDEX `Id_Materiel` (`Id_Materiel`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=34
;

-- t_notification
CREATE TABLE `t_notification` (
	`Id_Notification` INT NOT NULL AUTO_INCREMENT,
	`Type` VARCHAR(32) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Alarme` INT NULL DEFAULT NULL,
	`Titre` VARCHAR(128) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Message` VARCHAR(512) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Payload_Json` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Priorite` INT NULL DEFAULT '0',
	`Date_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Est_Archive` TINYINT(1) NOT NULL DEFAULT '0',
	PRIMARY KEY (`Id_Notification`) USING BTREE,
	INDEX `IDX_Id_Alarme_Notification` (`Id_Alarme`) USING BTREE,
	INDEX `IDX_Date_Creation_Notification` (`Date_Creation`) USING BTREE,
	CONSTRAINT `FK_ALARME_NOTIFICATION` FOREIGN KEY (`Id_Alarme`) REFERENCES `t_alarme` (`Id_Alarme`) ON UPDATE NO ACTION ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=106266
;

-- t_notification_delivery
CREATE TABLE `t_notification_delivery` (
	`Id_Delivery` INT NOT NULL AUTO_INCREMENT,
	`Id_Notification` INT NOT NULL,
	`Id_Poste` INT NOT NULL,
	`Id_Utilisateur` INT NULL DEFAULT NULL,
	`Statut` VARCHAR(32) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Nb_Tentatives` INT NOT NULL DEFAULT '0',
	`Derniere_Erreur` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Date_Queue` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Envoi` DATETIME NULL DEFAULT NULL,
	`Date_Ack_Agent` DATETIME NULL DEFAULT NULL,
	`Date_Dernier_Event` DATETIME NULL DEFAULT NULL,
	`Correlation_Id` VARCHAR(64) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`Id_Delivery`) USING BTREE,
	UNIQUE INDEX `UK_NOTIFICATION_POSTE` (`Id_Notification`, `Id_Poste`) USING BTREE,
	INDEX `IDX_STATUT_DELIVERY` (`Statut`) USING BTREE,
	INDEX `IDX_Date_Envoi_Delivery` (`Date_Envoi`) USING BTREE,
	INDEX `FK_POSTE_DELIVERY` (`Id_Poste`) USING BTREE,
	INDEX `FK_UTILISATEUR_DELIVERY` (`Id_Utilisateur`) USING BTREE,
	CONSTRAINT `FK_NOTIFICATION_DELIVERY` FOREIGN KEY (`Id_Notification`) REFERENCES `t_notification` (`Id_Notification`) ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `FK_POSTE_DELIVERY` FOREIGN KEY (`Id_Poste`) REFERENCES `t_postes_clients` (`Id_Poste`) ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `FK_UTILISATEUR_DELIVERY` FOREIGN KEY (`Id_Utilisateur`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3902
;

-- t_notification_event
CREATE TABLE `t_notification_event` (
	`Id_Event` INT NOT NULL AUTO_INCREMENT,
	`Id_Delivery` INT NOT NULL,
	`Event_Type` VARCHAR(32) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Event_Data` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Date_Event` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY (`Id_Event`) USING BTREE,
	INDEX `IDX_Id_Delivery_Event` (`Id_Delivery`) USING BTREE,
	INDEX `IDX_Date_Event` (`Date_Event`) USING BTREE,
	CONSTRAINT `FK_DELIVERY_EVENT` FOREIGN KEY (`Id_Delivery`) REFERENCES `t_notification_delivery` (`Id_Delivery`) ON UPDATE NO ACTION ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3901
;

-- t_sonde_etat
CREATE TABLE `t_sonde_etat` (
	`Id_Sonde_Etat` INT NOT NULL AUTO_INCREMENT,
	`Etat_Sonde` VARCHAR(1) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Etat_Libelle` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`Id_Sonde_Etat`) USING BTREE,
	UNIQUE INDEX `Etat_Sonde` (`Etat_Sonde`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=6
;

-- t_vigilog
CREATE TABLE `t_vigilog` (
	`Id_VigiLog` INT NOT NULL AUTO_INCREMENT,
	`Numero_Serie` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Modele` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Libelle` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Actif` TINYINT(1) NOT NULL DEFAULT '1',
	`Date_Etalonnage` DATETIME NULL DEFAULT NULL,
	`Date_Validite` DATE NULL DEFAULT NULL,
	`Duree_Validite_Jours` INT NULL DEFAULT NULL,
	`Err_Justesse` FLOAT NULL DEFAULT NULL,
	`Commentaire` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Utilisateur_Creation` INT NULL DEFAULT NULL,
	`Date_Heure_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Id_Utilisateur_Maj` INT NULL DEFAULT NULL,
	`Date_Heure_Maj` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`Id_VigiLog`) USING BTREE,
	UNIQUE INDEX `UK_t_vigilog_numero_serie` (`Numero_Serie`) USING BTREE,
	INDEX `IDX_t_vigilog_actif` (`Actif`) USING BTREE,
	INDEX `IDX_t_vigilog_modele` (`Modele`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=9
;

-- t_vigilog_configuration
CREATE TABLE `t_vigilog_configuration` (
	`Id_VigiLog_Configuration` INT NOT NULL AUTO_INCREMENT,
	`Nom_Configuration` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Description_Configuration` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Consigne` DECIMAL(10,2) NULL DEFAULT NULL,
	`Limite_Basse_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Limite_Basse` DECIMAL(10,2) NULL DEFAULT NULL,
	`Limite_Haute_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Limite_Haute` DECIMAL(10,2) NULL DEFAULT NULL,
	`Frequence_Min` INT NOT NULL,
	`Retard_Alarme_Min` INT NOT NULL,
	`Delai_Demarrage_Min` INT NOT NULL DEFAULT '0',
	`Autorise_Arret_Bouton_Stop` TINYINT(1) NOT NULL DEFAULT '1',
	`Reinitialise_Avec_Bouton_Start` TINYINT(1) NOT NULL DEFAULT '1',
	`Actif` TINYINT(1) NOT NULL DEFAULT '1',
	`Id_Utilisateur_Creation` INT NULL DEFAULT NULL,
	`Date_Heure_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Id_Utilisateur_Maj` INT NULL DEFAULT NULL,
	`Date_Heure_Maj` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`Id_VigiLog_Configuration`) USING BTREE,
	UNIQUE INDEX `UK_t_vigilog_configuration_nom` (`Nom_Configuration`) USING BTREE,
	INDEX `IDX_t_vigilog_configuration_user_create` (`Id_Utilisateur_Creation`) USING BTREE,
	INDEX `IDX_t_vigilog_configuration_user_update` (`Id_Utilisateur_Maj`) USING BTREE,
	CONSTRAINT `FK_t_vigilog_configuration_user_creation` FOREIGN KEY (`Id_Utilisateur_Creation`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `FK_t_vigilog_configuration_user_maj` FOREIGN KEY (`Id_Utilisateur_Maj`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=6
;

-- t_vigilog_tournee
CREATE TABLE `t_vigilog_tournee` (
	`Id_VigiLog_Tournee` INT NOT NULL AUTO_INCREMENT,
	`Reference_Tournee` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_VigiLog_Configuration` INT NULL DEFAULT NULL,
	`Id_VigiLog` INT NULL DEFAULT NULL,
	`Nom_Configuration` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Site_Depart` INT NOT NULL,
	`Id_Site_Arrivee` INT NOT NULL,
	`Numero_Serie_VigiLog` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Statut` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`Resultat_Feu` VARCHAR(10) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Utilisateur_Depart` INT NOT NULL,
	`Date_Heure_Depart` DATETIME NOT NULL,
	`Id_Utilisateur_Arrivee` INT NULL DEFAULT NULL,
	`Date_Heure_Arrivee` DATETIME NULL DEFAULT NULL,
	`Consigne` DECIMAL(10,2) NULL DEFAULT NULL,
	`Limite_Basse_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Limite_Basse` DECIMAL(10,2) NULL DEFAULT NULL,
	`Limite_Haute_Active` TINYINT(1) NOT NULL DEFAULT '0',
	`Limite_Haute` DECIMAL(10,2) NULL DEFAULT NULL,
	`Frequence_Min` INT NOT NULL,
	`Retard_Alarme_Min` INT NOT NULL,
	`Delai_Demarrage_Min` INT NOT NULL DEFAULT '0',
	`Autorise_Arret_Bouton_Stop` TINYINT(1) NOT NULL DEFAULT '1',
	`Reinitialise_Avec_Bouton_Start` TINYINT(1) NOT NULL DEFAULT '1',
	`Nb_Mesures` INT NOT NULL DEFAULT '0',
	`Temperature_Min` DECIMAL(10,2) NULL DEFAULT NULL,
	`Temperature_Moyenne` DECIMAL(10,2) NULL DEFAULT NULL,
	`Temperature_Max` DECIMAL(10,2) NULL DEFAULT NULL,
	`Duree_Hors_Limites_Secondes` INT NOT NULL DEFAULT '0',
	`Duree_Alarme_Secondes` INT NOT NULL DEFAULT '0',
	`Est_Depassement_Limites` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Alarme` TINYINT(1) NOT NULL DEFAULT '0',
	`Est_Acquittee` TINYINT(1) NOT NULL DEFAULT '0',
	`Commentaire` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Commentaire_Acquittement` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`Id_Utilisateur_Acquittement` INT NULL DEFAULT NULL,
	`Date_Heure_Acquittement` DATETIME NULL DEFAULT NULL,
	`Date_Heure_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Heure_Maj` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`Id_VigiLog_Tournee`) USING BTREE,
	UNIQUE INDEX `UK_t_vigilog_tournee_reference` (`Reference_Tournee`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_config` (`Id_VigiLog_Configuration`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_site_depart` (`Id_Site_Depart`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_site_arrivee` (`Id_Site_Arrivee`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_logger` (`Numero_Serie_VigiLog`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_statut` (`Statut`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_depart_user` (`Id_Utilisateur_Depart`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_arrivee_user` (`Id_Utilisateur_Arrivee`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_acquit_user` (`Id_Utilisateur_Acquittement`) USING BTREE,
	INDEX `IDX_t_vigilog_tournee_vigilog` (`Id_VigiLog`) USING BTREE,
	CONSTRAINT `FK_t_vigilog_tournee_configuration` FOREIGN KEY (`Id_VigiLog_Configuration`) REFERENCES `t_vigilog_configuration` (`Id_VigiLog_Configuration`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `FK_t_vigilog_tournee_site_arrivee` FOREIGN KEY (`Id_Site_Arrivee`) REFERENCES `t_site` (`Id_Site`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `FK_t_vigilog_tournee_site_depart` FOREIGN KEY (`Id_Site_Depart`) REFERENCES `t_site` (`Id_Site`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `FK_t_vigilog_tournee_user_acquittement` FOREIGN KEY (`Id_Utilisateur_Acquittement`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `FK_t_vigilog_tournee_user_arrivee` FOREIGN KEY (`Id_Utilisateur_Arrivee`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `FK_t_vigilog_tournee_user_depart` FOREIGN KEY (`Id_Utilisateur_Depart`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `FK_t_vigilog_tournee_vigilog` FOREIGN KEY (`Id_VigiLog`) REFERENCES `t_vigilog` (`Id_VigiLog`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=14
;

-- t_notification_usage_ponctuel
CREATE TABLE `t_vigilog_usage_ponctuel` (
	`Id_VigiLog_Usage_Ponctuel` INT NOT NULL AUTO_INCREMENT,
	`Reference_Usage` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Id_VigiLog_Configuration` INT NULL DEFAULT NULL,
	`Id_VigiLog` INT NULL DEFAULT NULL,
	`Nom_Configuration` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Numero_Serie_VigiLog` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Nom_Lieu_Temporaire` VARCHAR(120) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Statut` VARCHAR(30) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Id_Utilisateur_Demarrage` INT NOT NULL,
	`Date_Heure_Demarrage` DATETIME NOT NULL,
	`Commentaire_Demarrage` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Id_Utilisateur_Arret` INT NULL DEFAULT NULL,
	`Date_Heure_Arret` DATETIME NULL DEFAULT NULL,
	`Commentaire_Arret` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Date_Heure_Creation` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`Date_Heure_Maj` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`Id_VigiLog_Usage_Ponctuel`) USING BTREE,
	UNIQUE INDEX `UK_t_vigilog_usage_ponctuel_reference` (`Reference_Usage`) USING BTREE,
	INDEX `IDX_t_vigilog_usage_ponctuel_statut` (`Statut`) USING BTREE,
	INDEX `IDX_t_vigilog_usage_ponctuel_logger` (`Numero_Serie_VigiLog`) USING BTREE,
	INDEX `IDX_t_vigilog_usage_ponctuel_started_by` (`Id_Utilisateur_Demarrage`) USING BTREE,
	INDEX `IDX_t_vigilog_usage_ponctuel_stopped_by` (`Id_Utilisateur_Arret`) USING BTREE,
	INDEX `FK_t_vigilog_usage_ponctuel_configuration` (`Id_VigiLog_Configuration`) USING BTREE,
	INDEX `FK_t_vigilog_usage_ponctuel_logger` (`Id_VigiLog`) USING BTREE,
	CONSTRAINT `FK_t_vigilog_usage_ponctuel_configuration` FOREIGN KEY (`Id_VigiLog_Configuration`) REFERENCES `t_vigilog_configuration` (`Id_VigiLog_Configuration`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FK_t_vigilog_usage_ponctuel_logger` FOREIGN KEY (`Id_VigiLog`) REFERENCES `t_vigilog` (`Id_VigiLog`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FK_t_vigilog_usage_ponctuel_user_start` FOREIGN KEY (`Id_Utilisateur_Demarrage`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FK_t_vigilog_usage_ponctuel_user_stop` FOREIGN KEY (`Id_Utilisateur_Arret`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;


-- vigi_mesures

-- tm_mesres_etalon
CREATE TABLE `tm_mesures_etalon` (
	`Id_Mesure_Etalon` INT NOT NULL AUTO_INCREMENT,
	`Id_Serveur_BDD` INT NOT NULL DEFAULT '0',
	`Valeur_Brute` FLOAT NOT NULL,
	`Etalon_Numero_Serie` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	`Est_Valeur_Null` TINYINT NOT NULL,
	`Date_Heure` DATETIME NOT NULL,
	`Message_Erreur` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`Id_Mesure_Etalon`, `Id_Serveur_BDD`) USING BTREE,
	INDEX `IDX_Valeur_Brute` (`Valeur_Brute`) USING BTREE,
	INDEX `IDX_Etalon_Numero_Serie` (`Etalon_Numero_Serie`) USING BTREE,
	INDEX `IDX_Est_Valeur_Null` (`Est_Valeur_Null`) USING BTREE,
	INDEX `IDX_Date_Heure` (`Date_Heure`) USING BTREE,
	INDEX `IDX_Message_Erreur` (`Message_Erreur`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;
