ALTER TABLE `t_utilisateur` ADD COLUMN `ResetPasswordToken` VARCHAR(255) NULL;
ALTER TABLE `t_utilisateur` ADD COLUMN `ResetPasswordExpires` DATETIME(0) NULL;
