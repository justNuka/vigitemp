-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.90.2
-- MySQL 8.x
-- Baseline attendue : 0.90.1
-- =====================================================================
--
-- Cette migration est destinée aux bases existantes. Ne pas utiliser le
-- seed complet sur une base client déjà en production.
--
-- Changements :
--   1. ajoute t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure ;
--   2. crée les tables préparatoires Better Auth t_auth_* ;
--   3. positionne VERSION/SCHEMA_VERSION à 0.90.2 à la fin.
--
-- Better Auth n'est PAS activé par cette migration.

USE `vigi_main`;

-- ---------------------------------------------------------------------
-- 1. Métrologie : dirty flag des coefficients d'ajustage
-- ---------------------------------------------------------------------
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 't_ajustage'
    AND COLUMN_NAME = 'Coeffs_Modifies_Depuis_Derniere_Mesure'
);

SET @ddl := IF(
  @column_exists = 0,
  'ALTER TABLE `t_ajustage` ADD COLUMN `Coeffs_Modifies_Depuis_Derniere_Mesure` tinyint(1) NOT NULL DEFAULT 0 AFTER `Coeff_Constant`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 2. Better Auth : schéma préparatoire uniquement
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `t_auth_user` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `displayUsername` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vigisensysUserId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_user_email` (`email`),
  UNIQUE KEY `UK_t_auth_user_username` (`username`),
  UNIQUE KEY `UK_t_auth_user_vigisensys_user` (`vigisensysUserId`),
  CONSTRAINT `FK_t_auth_user_vigisensys_user` FOREIGN KEY (`vigisensysUserId`) REFERENCES `t_utilisateur` (`Id_Utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `t_auth_session` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ipAddress` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_session_token` (`token`),
  KEY `IDX_t_auth_session_user` (`userId`),
  CONSTRAINT `FK_t_auth_session_user` FOREIGN KEY (`userId`) REFERENCES `t_auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `t_auth_account` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `refreshToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `idToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `accessTokenExpiresAt` datetime DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `scope` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_t_auth_account_provider_account` (`providerId`,`accountId`),
  KEY `IDX_t_auth_account_user` (`userId`),
  CONSTRAINT `FK_t_auth_account_user` FOREIGN KEY (`userId`) REFERENCES `t_auth_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `t_auth_verification` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_t_auth_verification_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Version de schéma
-- ---------------------------------------------------------------------
-- Cette écriture est volontairement placée en fin de migration.
INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('VERSION', 'SCHEMA_VERSION', '0.90.2', 'Version produit commune des seeds MySQL et SQL Server')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

SELECT 'Migration VigiSensys DB 0.90.2 terminée' AS Migration_Status;
