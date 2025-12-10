-- Insérer les paramètres de sécurité par défaut pour les mots de passe
INSERT INTO `t_parametre` (`Section`, `MotCle`, `Valeur`, `Commentaire`) VALUES
('security:password', 'password_min_length', '8', 'Longueur minimale du mot de passe'),
('security:password', 'password_min_uppercase', '1', 'Nombre minimum de majuscules'),
('security:password', 'password_min_lowercase', '1', 'Nombre minimum de minuscules'),
('security:password', 'password_min_numbers', '1', 'Nombre minimum de chiffres'),
('security:password', 'password_min_special', '1', 'Nombre minimum de caractères spéciaux'),
('security:password', 'password_history_count', '5', 'Nombre d''anciens mots de passe à mémoriser')
ON DUPLICATE KEY UPDATE 
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);
