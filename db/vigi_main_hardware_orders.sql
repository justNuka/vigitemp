CREATE TABLE IF NOT EXISTS `t_commande_materiel` (
  `Id_Commande_Materiel` INT NOT NULL AUTO_INCREMENT,
  `Id_Utilisateur` INT NULL,
  `Nom_Demandeur` VARCHAR(255) NULL,
  `Email_Demandeur` VARCHAR(255) NULL,
  `Statut` VARCHAR(30) NOT NULL DEFAULT 'BROUILLON',
  `Mode_Transmission` VARCHAR(30) NULL,
  `Email_Commercial` VARCHAR(255) NULL,
  `Commentaire` LONGTEXT NULL,
  `Date_Creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Validation` DATETIME NULL,
  `Id_PDF` INT NULL,
  PRIMARY KEY (`Id_Commande_Materiel`),
  KEY `IDX_Commande_Materiel_Date_Creation` (`Date_Creation`),
  KEY `IDX_Commande_Materiel_Id_PDF` (`Id_PDF`),
  KEY `IDX_Commande_Materiel_Id_Utilisateur` (`Id_Utilisateur`),
  KEY `IDX_Commande_Materiel_Statut` (`Statut`),
  CONSTRAINT `FK_PDF_COMMANDE_MATERIEL`
    FOREIGN KEY (`Id_PDF`) REFERENCES `t_pdf` (`Id_PDF`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `t_commande_materiel_ligne` (
  `Id_Commande_Materiel_Ligne` INT NOT NULL AUTO_INCREMENT,
  `Id_Commande_Materiel` INT NOT NULL,
  `Id_Materiel` INT NULL,
  `Quantite` INT NOT NULL DEFAULT 1,
  `Ref_Commercial` VARCHAR(50) NULL,
  `Designation` VARCHAR(100) NULL,
  `Descriptif` VARCHAR(1000) NULL,
  `Gamme` VARCHAR(10) NULL,
  `Type` VARCHAR(10) NULL,
  PRIMARY KEY (`Id_Commande_Materiel_Ligne`),
  KEY `IDX_Commande_Materiel_Ligne_Commande` (`Id_Commande_Materiel`),
  KEY `IDX_Commande_Materiel_Ligne_Materiel` (`Id_Materiel`),
  CONSTRAINT `FK_COMMANDE_MATERIEL_LIGNE`
    FOREIGN KEY (`Id_Commande_Materiel`) REFERENCES `t_commande_materiel` (`Id_Commande_Materiel`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_MATERIEL_COMMANDE_LIGNE`
    FOREIGN KEY (`Id_Materiel`) REFERENCES `t_materiel` (`Id_Materiel`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`, `Champ_DATETIME`)
VALUES (
  'SERVICES',
  'COMMERCIAL_CONTACT_EMAIL',
  'contactsite@mc2lab.fr',
  'Adresse email du service commercial MC2 utilisee pour les demandes de devis materiel',
  NULL
)
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);
