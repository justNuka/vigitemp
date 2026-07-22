USE `vigi_mesures`;

CREATE TABLE IF NOT EXISTS `tm_remontee_plage_gsp` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Id_Lieu` int NOT NULL,
  `GSP_SN` varchar(50) NOT NULL,
  `Date_Heure_Debut` datetime NOT NULL,
  `Date_Heure_Fin` datetime NOT NULL,
  `Statut` varchar(20) NOT NULL DEFAULT 'A_FAIRE',
  `Date_Creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Derniere_Maj` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Nb_Tentatives` int NOT NULL DEFAULT '0',
  `Derniere_Erreur` longtext,
  PRIMARY KEY (`Id`),
  KEY `IDX_tm_remontee_plage_gsp_lieu_sonde_statut` (`Id_Lieu`,`GSP_SN`,`Statut`),
  KEY `IDX_tm_remontee_plage_gsp_debut` (`Date_Heure_Debut`),
  KEY `IDX_tm_remontee_plage_gsp_fin` (`Date_Heure_Fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
