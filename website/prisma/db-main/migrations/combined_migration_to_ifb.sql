-- Script de migration complet pour migrer vers vigitemp_ifb
-- Applique toutes les migrations dans l'ordre chronologique
-- À exécuter sur la base vigitemp_ifb

-- ============================================
-- Migration 1: Étendre le champ Mot_de_passe pour bcrypt
-- Date: 2025-12-04
-- ============================================
ALTER TABLE `t_utilisateur` MODIFY COLUMN `Mot_de_passe` VARCHAR(60);

-- ============================================
-- Migration 2: Ajouter les champs d'expiration de mot de passe
-- Date: 2025-12-09
-- ============================================
ALTER TABLE `t_utilisateur` ADD COLUMN `DateDerniereModificationMDP` DATETIME(0) NULL;

-- Ajouter les paramètres de sécurité
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

-- ============================================
-- Migration 3: Ajouter les champs de réinitialisation de mot de passe
-- Date: 2025-12-10
-- ============================================
ALTER TABLE `t_utilisateur` 
ADD COLUMN `ResetPasswordToken` VARCHAR(255) NULL,
ADD COLUMN `ResetPasswordExpires` DATETIME(0) NULL;

-- ============================================
-- Migration 4: Ajouter le flag de mot de passe temporaire
-- Date: 2025-12-10
-- ============================================
ALTER TABLE `t_utilisateur` 
ADD COLUMN `MotDePasseTemporaire` BOOLEAN DEFAULT FALSE;
