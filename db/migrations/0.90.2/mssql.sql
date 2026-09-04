-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.90.2
-- Microsoft SQL Server
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

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
SET XACT_ABORT ON;
GO

USE [vigi_main];
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- -----------------------------------------------------------------
    -- 1. Métrologie : dirty flag des coefficients d'ajustage
    -- -----------------------------------------------------------------
    IF COL_LENGTH('dbo.t_ajustage', 'Coeffs_Modifies_Depuis_Derniere_Mesure') IS NULL
    BEGIN
        ALTER TABLE dbo.t_ajustage
            ADD Coeffs_Modifies_Depuis_Derniere_Mesure bit NOT NULL
                CONSTRAINT DF_t_ajustage_Coeffs_Modifies DEFAULT (0);
    END;

    -- -----------------------------------------------------------------
    -- 2. Better Auth : schéma préparatoire uniquement
    -- -----------------------------------------------------------------
    IF OBJECT_ID(N'dbo.t_auth_user', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.t_auth_user (
            id VARCHAR(255) NOT NULL,
            name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL,
            emailVerified BIT NOT NULL CONSTRAINT DF_t_auth_user_emailVerified DEFAULT (0),
            image NVARCHAR(MAX) NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            username NVARCHAR(255) NULL,
            displayUsername NVARCHAR(255) NULL,
            vigisensysUserId INT NULL,
            CONSTRAINT PK_t_auth_user PRIMARY KEY (id)
        );
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_user')
          AND name = N'UK_t_auth_user_email'
    )
        CREATE UNIQUE INDEX UK_t_auth_user_email ON dbo.t_auth_user (email);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_user')
          AND name = N'UK_t_auth_user_username'
    )
        CREATE UNIQUE INDEX UK_t_auth_user_username ON dbo.t_auth_user (username)
        WHERE username IS NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_user')
          AND name = N'UK_t_auth_user_vigisensys_user'
    )
        CREATE UNIQUE INDEX UK_t_auth_user_vigisensys_user ON dbo.t_auth_user (vigisensysUserId)
        WHERE vigisensysUserId IS NOT NULL;

    IF OBJECT_ID(N'dbo.t_auth_session', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.t_auth_session (
            id VARCHAR(255) NOT NULL,
            expiresAt DATETIME2 NOT NULL,
            token VARCHAR(255) NOT NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            ipAddress VARCHAR(64) NULL,
            userAgent NVARCHAR(512) NULL,
            userId VARCHAR(255) NOT NULL,
            CONSTRAINT PK_t_auth_session PRIMARY KEY (id)
        );
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_session')
          AND name = N'UK_t_auth_session_token'
    )
        CREATE UNIQUE INDEX UK_t_auth_session_token ON dbo.t_auth_session (token);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_session')
          AND name = N'IDX_t_auth_session_user'
    )
        CREATE INDEX IDX_t_auth_session_user ON dbo.t_auth_session (userId);

    IF OBJECT_ID(N'dbo.t_auth_account', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.t_auth_account (
            id VARCHAR(255) NOT NULL,
            accountId VARCHAR(255) NOT NULL,
            providerId VARCHAR(255) NOT NULL,
            userId VARCHAR(255) NOT NULL,
            accessToken NVARCHAR(MAX) NULL,
            refreshToken NVARCHAR(MAX) NULL,
            idToken NVARCHAR(MAX) NULL,
            accessTokenExpiresAt DATETIME2 NULL,
            refreshTokenExpiresAt DATETIME2 NULL,
            scope NVARCHAR(1024) NULL,
            password VARCHAR(255) NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            CONSTRAINT PK_t_auth_account PRIMARY KEY (id)
        );
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_account')
          AND name = N'UK_t_auth_account_provider_account'
    )
        CREATE UNIQUE INDEX UK_t_auth_account_provider_account
            ON dbo.t_auth_account (providerId, accountId);

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_account')
          AND name = N'IDX_t_auth_account_user'
    )
        CREATE INDEX IDX_t_auth_account_user ON dbo.t_auth_account (userId);

    IF OBJECT_ID(N'dbo.t_auth_verification', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.t_auth_verification (
            id VARCHAR(255) NOT NULL,
            identifier NVARCHAR(255) NOT NULL,
            value NVARCHAR(MAX) NOT NULL,
            expiresAt DATETIME2 NOT NULL,
            createdAt DATETIME2 NOT NULL,
            updatedAt DATETIME2 NOT NULL,
            CONSTRAINT PK_t_auth_verification PRIMARY KEY (id)
        );
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.t_auth_verification')
          AND name = N'IDX_t_auth_verification_identifier'
    )
        CREATE INDEX IDX_t_auth_verification_identifier
            ON dbo.t_auth_verification (identifier);

    -- -----------------------------------------------------------------
    -- 3. Version de schéma
    -- -----------------------------------------------------------------
    UPDATE dbo.t_parametre
       SET Valeur = N'0.90.2',
           Commentaire = N'Version produit commune des seeds MySQL et SQL Server'
     WHERE Section = 'VERSION'
       AND Mot_Cle = 'SCHEMA_VERSION';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.t_parametre (Section, Mot_Cle, Valeur, Commentaire)
        VALUES ('VERSION', 'SCHEMA_VERSION', N'0.90.2', N'Version produit commune des seeds MySQL et SQL Server');
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

SELECT N'Migration VigiSensys DB 0.90.2 terminée' AS Migration_Status;
GO
