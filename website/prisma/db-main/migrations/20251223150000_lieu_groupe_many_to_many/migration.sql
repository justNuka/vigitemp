-- Many-to-many relation between t_lieu and t_groupe
-- New join table: t_lieu_groupe (LieuGroup)

CREATE TABLE IF NOT EXISTS `t_lieu_groupe` (
  `Id_Lieu` INT NOT NULL,
  `Id_Groupe` INT NOT NULL,
  PRIMARY KEY (`Id_Lieu`, `Id_Groupe`),
  INDEX `IDX_LIEU_GROUPE_Id_Groupe` (`Id_Groupe`),
  INDEX `IDX_LIEU_GROUPE_Id_Lieu` (`Id_Lieu`),
  CONSTRAINT `FK_LIEU_LIEU_GROUPE` FOREIGN KEY (`Id_Lieu`) REFERENCES `t_lieu` (`Id_Lieu`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_GROUPE_LIEU_GROUPE` FOREIGN KEY (`Id_Groupe`) REFERENCES `t_groupe` (`Id_Groupe`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- Backfill from legacy columns (Id_Groupe1/Id_Groupe2)
INSERT IGNORE INTO `t_lieu_groupe` (`Id_Lieu`, `Id_Groupe`)
SELECT `Id_Lieu`, `Id_Groupe1`
FROM `t_lieu`
WHERE `Id_Groupe1` IS NOT NULL;

INSERT IGNORE INTO `t_lieu_groupe` (`Id_Lieu`, `Id_Groupe`)
SELECT `Id_Lieu`, `Id_Groupe2`
FROM `t_lieu`
WHERE `Id_Groupe2` IS NOT NULL;

