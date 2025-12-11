-- Extend Mot_de_passe field to support bcrypt hashes (60 chars)
ALTER TABLE `t_utilisateur` MODIFY COLUMN `Mot_de_passe` VARCHAR(60);
