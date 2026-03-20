CREATE TABLE IF NOT EXISTS `t_message_attachment` (
  `Id_Attachment` INT NOT NULL AUTO_INCREMENT,
  `Id_Message` INT NOT NULL,
  `File_Name` VARCHAR(255) NOT NULL,
  `File_Path` VARCHAR(512) NOT NULL,
  `File_Size` INT NOT NULL,
  `Mime_Type` VARCHAR(128) NOT NULL,
  `Date_Upload` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_Attachment`),
  KEY `IDX_t_message_attachment_Id_Message` (`Id_Message`),
  CONSTRAINT `FK_t_message_attachment_message`
    FOREIGN KEY (`Id_Message`) REFERENCES `t_message` (`Id_Message`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
