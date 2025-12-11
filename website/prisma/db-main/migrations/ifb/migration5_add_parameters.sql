INSERT INTO `t_parametre` (`Section`, `MotCle`, `Valeur`, `Commentaire`) VALUES
('security:password', 'expiry_days', '90', 'Duree de validite du mot de passe en jours'),
('security:password', 'expiry_enabled', 'true', 'Activer expiration des mots de passe'),
('security:email', 'smtp_host', '', 'Serveur SMTP'),
('security:email', 'smtp_port', '587', 'Port SMTP'),
('security:email', 'smtp_user', '', 'Utilisateur SMTP'),
('security:email', 'smtp_password', '', 'Mot de passe SMTP'),
('security:email', 'smtp_from', 'noreply@vigitemp.com', 'Adresse email expediteur'),
('security:email', 'smtp_enabled', 'false', 'Activer envoi emails')
ON DUPLICATE KEY UPDATE 
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);
