-- Add DateDerniereModificationMDP to track password change dates
ALTER TABLE `t_utilisateur` ADD COLUMN `DateDerniereModificationMDP` DATETIME(0) NULL;

-- Add password expiry parameters
INSERT INTO `t_parametre` (`Section`, `MotCle`, `Valeur`, `Commentaire`) VALUES
('security:password', 'expiry_days', '90', 'Durée de validité du mot de passe en jours (0 = désactivé)'),
('security:password', 'expiry_enabled', 'true', 'Activer l''expiration automatique des mots de passe'),
('security:email', 'smtp_host', '', 'Serveur SMTP pour l''envoi d''emails'),
('security:email', 'smtp_port', '587', 'Port SMTP'),
('security:email', 'smtp_user', '', 'Utilisateur SMTP'),
('security:email', 'smtp_password', '', 'Mot de passe SMTP'),
('security:email', 'smtp_from', 'noreply@vigitemp.com', 'Adresse email expéditeur'),
('security:email', 'smtp_enabled', 'false', 'Activer l''envoi d''emails')
ON DUPLICATE KEY UPDATE 
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);
