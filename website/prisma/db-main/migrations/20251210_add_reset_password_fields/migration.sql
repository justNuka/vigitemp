-- Add password reset fields to t_utilisateur
ALTER TABLE `t_utilisateur` 
ADD COLUMN `ResetPasswordToken` VARCHAR(255) NULL,
ADD COLUMN `ResetPasswordExpires` DATETIME(0) NULL;
