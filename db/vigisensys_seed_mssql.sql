-- =====================================================================
-- BOOTSTRAP SQL SERVER VigiSensys
-- Cree les 3 bases et les tables absentes avant le seed/alignement.
-- Genere depuis les schemas Prisma, sans FK bloquantes pour rester idempotent.
-- =====================================================================

IF DB_ID(N'vigi_main') IS NULL
BEGIN
  CREATE DATABASE [vigi_main];
END;
GO
USE [vigi_main];
GO

IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur] (
    [Id_Actionneur] INT IDENTITY(1,1) NOT NULL,
    [Num_Serie] VARCHAR(50) NULL,
    [Type] INT NULL,
    [Est_Etat] BIT NULL DEFAULT(0),
    [Est_Demande] BIT NULL DEFAULT(0),
    [Commentaire] VARCHAR(255) NULL,
    [Port_Serie] INT NULL,
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Est_Test] BIT NULL DEFAULT(0),
    [Libelle_Erreur] VARCHAR(50) NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Id_Serveur] INT NULL DEFAULT(1),
    CONSTRAINT [PK_t_actionneur] PRIMARY KEY ([Id_Actionneur])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Id_Actionneur') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Id_Actionneur] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Num_Serie') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Num_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Type') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Type] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Est_Etat') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Est_Etat] BIT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Est_Demande') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Est_Demande] BIT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Commentaire') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Commentaire] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Port_Serie') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Port_Serie] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Id_Module') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Id_Module] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Relai_1') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Relai_1] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Relai_2') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Relai_2] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Relai_3') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Relai_3] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Relai_4') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Relai_4] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Est_Test') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Est_Test] BIT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Libelle_Erreur') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Libelle_Erreur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Id_Plan') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Id_Plan] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Position_Plan_X') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Position_Plan_X] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Position_Plan_Y') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Position_Plan_Y] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Est_Archive] BIT NULL;
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur', N'Id_Serveur') IS NULL ALTER TABLE dbo.[t_actionneur] ADD [Id_Serveur] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme] (
    [Id_Alarme] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(1) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT(0),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL DEFAULT(0),
    [Est_Mail_Envoye] BIT NULL,
    [Est_Tel_Acquittee] BIT NULL,
    CONSTRAINT [PK_t_alarme] PRIMARY KEY ([Id_Alarme])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Id_Alarme') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Id_Alarme] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Date_Heure_Debut') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Date_Heure_Debut] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Valeur') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Type') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Type] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Date_Heure_Fin') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Date_Heure_Fin] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Unite') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Est_Acquittee') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Est_Acquittee] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Date_Heure_Derniere_Mesure') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Date_Heure_Derniere_Mesure] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Est_Alarme_Pour_VigiTel') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Est_Alarme_Pour_VigiTel] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Est_Mail_Envoye') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Est_Mail_Envoye] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme', N'Est_Tel_Acquittee') IS NULL ALTER TABLE dbo.[t_alarme] ADD [Est_Tel_Acquittee] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_histo] (
    [Id_Alarme_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Alarme] INT NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(1) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT(0),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL,
    [Est_Mail_Envoye] BIT NULL,
    [Est_Tel_Acquittee] BIT NULL,
    [Date_Heure_Acquittement] DATETIME NULL,
    CONSTRAINT [PK_t_alarme_histo] PRIMARY KEY ([Id_Alarme_Histo])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Id_Alarme_Histo') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Id_Alarme_Histo] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Id_Alarme') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Id_Alarme] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Date_Heure_Debut') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Date_Heure_Debut] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Valeur') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Type') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Type] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Date_Heure_Fin') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Date_Heure_Fin] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Unite') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Est_Acquittee') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Est_Acquittee] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Date_Heure_Derniere_Mesure') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Date_Heure_Derniere_Mesure] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Est_Alarme_Pour_VigiTel') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Est_Alarme_Pour_VigiTel] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Est_Mail_Envoye') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Est_Mail_Envoye] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Est_Tel_Acquittee') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Est_Tel_Acquittee] BIT NULL;
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_histo', N'Date_Heure_Acquittement') IS NULL ALTER TABLE dbo.[t_alarme_histo] ADD [Date_Heure_Acquittement] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_message] (
    [Id_Alarme_Message] INT IDENTITY(1,1) NOT NULL,
    [Code_Alarme_Message] VARCHAR(20) NULL,
    [Type] VARCHAR(1) NULL,
    [Texte_Message] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_t_alarme_message] PRIMARY KEY ([Id_Alarme_Message])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_message', N'Id_Alarme_Message') IS NULL ALTER TABLE dbo.[t_alarme_message] ADD [Id_Alarme_Message] INT NULL;
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_message', N'Code_Alarme_Message') IS NULL ALTER TABLE dbo.[t_alarme_message] ADD [Code_Alarme_Message] VARCHAR(20) NULL;
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_message', N'Type') IS NULL ALTER TABLE dbo.[t_alarme_message] ADD [Type] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_alarme_message', N'Texte_Message') IS NULL ALTER TABLE dbo.[t_alarme_message] ADD [Texte_Message] NVARCHAR(MAX) NULL;
GO
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_alarme_message_Code_Alarme_Message' AND object_id = OBJECT_ID(N'dbo.t_alarme_message')) CREATE UNIQUE INDEX [UX_t_alarme_message_Code_Alarme_Message] ON dbo.[t_alarme_message]([Code_Alarme_Message]) WHERE [Code_Alarme_Message] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_autorisation] (
    [Id_Autorisation] INT IDENTITY(1,1) NOT NULL,
    [Code_Autorisation] VARCHAR(50) NULL,
    [Libelle_Autorisation] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(200) NULL,
    CONSTRAINT [PK_t_autorisation] PRIMARY KEY ([Id_Autorisation])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_autorisation', N'Id_Autorisation') IS NULL ALTER TABLE dbo.[t_autorisation] ADD [Id_Autorisation] INT NULL;
IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_autorisation', N'Code_Autorisation') IS NULL ALTER TABLE dbo.[t_autorisation] ADD [Code_Autorisation] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_autorisation', N'Libelle_Autorisation') IS NULL ALTER TABLE dbo.[t_autorisation] ADD [Libelle_Autorisation] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_autorisation', N'Commentaire') IS NULL ALTER TABLE dbo.[t_autorisation] ADD [Commentaire] VARCHAR(200) NULL;
GO

IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_milieu] (
    [Id_Milieu] INT IDENTITY(1,1) NOT NULL,
    [Model] VARCHAR(50) NULL,
    [Reference] VARCHAR(50) NULL,
    [Stabilite] FLOAT NULL,
    [Homogeneite] FLOAT NULL,
    [Contenu] VARCHAR(50) NULL,
    [Est_Reserve_MC2] BIT NULL DEFAULT(0),
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_milieu] PRIMARY KEY ([Id_Milieu])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Id_Milieu') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Id_Milieu] INT NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Model') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Model] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Reference') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Reference] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Stabilite') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Stabilite] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Homogeneite') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Homogeneite] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Contenu') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Contenu] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Est_Reserve_MC2') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Est_Reserve_MC2] BIT NULL;
IF OBJECT_ID(N'dbo.t_milieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_milieu', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_milieu] ADD [Est_Archive] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ajustage] (
    [Id_Ajustage] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Ajustage] DATETIME NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Coeff_X2] FLOAT NULL DEFAULT(0),
    [Coeff_X] FLOAT NULL,
    [Coeff_Constant] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Nb_Decimale] INT NULL,
    [Operateur] VARCHAR(255) NULL,
    [SE_Numero] VARCHAR(50) NULL,
    [SE_Organisme] VARCHAR(50) NULL,
    [SE_Date_Certif] DATE NULL,
    [SE_Numero_Certif] VARCHAR(50) NULL,
    [Mesure_Etalon1] FLOAT NULL,
    [Mesure_Etalon2] FLOAT NULL,
    [Valeur_Brute1] FLOAT NULL,
    [Valeur_Brute2] FLOAT NULL,
    [Ancienne_Mesure1] FLOAT NULL,
    [Ancienne_Mesure2] FLOAT NULL,
    [Nouvelle_Mesure1] FLOAT NULL,
    [Nouvelle_Mesure2] FLOAT NULL,
    [Id_Milieu] INT NULL,
    CONSTRAINT [PK_t_ajustage] PRIMARY KEY ([Id_Ajustage])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Id_Ajustage') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Id_Ajustage] INT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Date_Heure_Ajustage') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Date_Heure_Ajustage] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Coeff_X2') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Coeff_X2] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Coeff_X') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Coeff_X] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Coeff_Constant') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Coeff_Constant] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Unite') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Nb_Decimale') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Nb_Decimale] INT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Operateur') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Operateur] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'SE_Numero') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [SE_Numero] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'SE_Organisme') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [SE_Organisme] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'SE_Date_Certif') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [SE_Date_Certif] DATE NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'SE_Numero_Certif') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [SE_Numero_Certif] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Mesure_Etalon1') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Mesure_Etalon1] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Mesure_Etalon2') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Mesure_Etalon2] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Valeur_Brute1') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Valeur_Brute1] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Valeur_Brute2') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Valeur_Brute2] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Ancienne_Mesure1') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Ancienne_Mesure1] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Ancienne_Mesure2') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Ancienne_Mesure2] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Nouvelle_Mesure1') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Nouvelle_Mesure1] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Nouvelle_Mesure2') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Nouvelle_Mesure2] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ajustage', N'Id_Milieu') IS NULL ALTER TABLE dbo.[t_ajustage] ADD [Id_Milieu] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_certif', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_certif] (
    [Id_Certif] INT IDENTITY(1,1) NOT NULL,
    [Numero] VARCHAR(50) NULL,
    [Organisme] VARCHAR(50) NULL,
    [Date] DATE NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Id_PDF] INT NULL,
    CONSTRAINT [PK_t_certif] PRIMARY KEY ([Id_Certif])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Id_Certif') IS NULL ALTER TABLE dbo.[t_certif] ADD [Id_Certif] INT NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Numero') IS NULL ALTER TABLE dbo.[t_certif] ADD [Numero] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Organisme') IS NULL ALTER TABLE dbo.[t_certif] ADD [Organisme] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Date') IS NULL ALTER TABLE dbo.[t_certif] ADD [Date] DATE NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[t_certif] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Unite') IS NULL ALTER TABLE dbo.[t_certif] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif', N'Id_PDF') IS NULL ALTER TABLE dbo.[t_certif] ADD [Id_PDF] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_certif_mesure] (
    [Id_Certif_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_Certif] INT NULL,
    [Numero_Ordre] INT NULL,
    [Temperature_Vraie] VARCHAR(50) NULL,
    [Temperature_Reference] VARCHAR(50) NULL,
    [Incertitude] FLOAT NULL,
    CONSTRAINT [PK_t_certif_mesure] PRIMARY KEY ([Id_Certif_Mesure])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Id_Certif_Mesure') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Id_Certif_Mesure] INT NULL;
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Id_Certif') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Id_Certif] INT NULL;
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Numero_Ordre') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Numero_Ordre] INT NULL;
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Temperature_Vraie') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Temperature_Vraie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Temperature_Reference') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Temperature_Reference] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_certif_mesure', N'Incertitude') IS NULL ALTER TABLE dbo.[t_certif_mesure] ADD [Incertitude] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon] (
    [Id_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Etat_Etalon] VARCHAR(1) NULL,
    [Port_Serie] VARCHAR(10) NULL,
    [Est_Sonde_Externe] BIT NULL,
    [Resolution] VARCHAR(50) NULL,
    [Incertitude] VARCHAR(50) NULL,
    [Nb_Decimale] INT NULL,
    [Reserve_MC2] VARCHAR(50) NULL,
    [Id_Serveur] INT NULL,
    [Id_Module] INT NULL,
    CONSTRAINT [PK_t_etalon] PRIMARY KEY ([Id_Etalon])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Id_Etalon') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Id_Etalon] INT NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Est_Archive] BIT NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Etat_Etalon') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Etat_Etalon] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Port_Serie') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Port_Serie] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Est_Sonde_Externe') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Est_Sonde_Externe] BIT NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Resolution') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Resolution] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Incertitude') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Incertitude] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Nb_Decimale') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Nb_Decimale] INT NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Reserve_MC2') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Reserve_MC2] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Id_Serveur') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Id_Serveur] INT NULL;
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon', N'Id_Module') IS NULL ALTER TABLE dbo.[t_etalon] ADD [Id_Module] INT NULL;
GO
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_etalon_Etalon_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_etalon')) CREATE UNIQUE INDEX [UX_t_etalon_Etalon_Numero_Serie] ON dbo.[t_etalon]([Etalon_Numero_Serie]) WHERE [Etalon_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalonnage] (
    [Id_Etalonnage] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Etalonnage] DATETIME NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Date_Validite] DATE NULL,
    [Duree_Validite_Jours] INT NULL,
    [Valide] DATETIME NULL,
    [Operateur] VARCHAR(255) NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Date_Certif] DATE NULL,
    [Organisme] VARCHAR(50) NULL,
    [Num_Certif] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Incertitude] FLOAT NULL,
    [Moyenne_Etalon] FLOAT NULL,
    [Moyenne_Sonde] FLOAT NULL,
    [Repetabilite] VARCHAR(50) NULL,
    [Id_Bain] INT NULL,
    [Err_Justesse] FLOAT NULL,
    CONSTRAINT [PK_t_etalonnage] PRIMARY KEY ([Id_Etalonnage])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Id_Etalonnage') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Id_Etalonnage] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Date_Heure_Etalonnage') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Date_Heure_Etalonnage] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Date_Validite') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Date_Validite] DATE NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Duree_Validite_Jours') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Duree_Validite_Jours] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Valide') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Valide] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Operateur') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Operateur] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Date_Certif') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Date_Certif] DATE NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Organisme') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Organisme] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Num_Certif') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Num_Certif] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Unite') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Incertitude') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Incertitude] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Moyenne_Etalon') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Moyenne_Etalon] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Moyenne_Sonde') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Moyenne_Sonde] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Repetabilite') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Repetabilite] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Id_Bain') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Id_Bain] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage', N'Err_Justesse') IS NULL ALTER TABLE dbo.[t_etalonnage] ADD [Err_Justesse] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalonnage_mesure] (
    [Id_Etalonnage_Mesure_Sonde] INT IDENTITY(1,1) NOT NULL,
    [Id_Etalonnage] INT NULL,
    [Numero_Ordre] INT NULL,
    [Mesure_Sonde] FLOAT NULL,
    [Mesure_Etalon] FLOAT NULL,
    CONSTRAINT [PK_t_etalonnage_mesure] PRIMARY KEY ([Id_Etalonnage_Mesure_Sonde])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage_mesure', N'Id_Etalonnage_Mesure_Sonde') IS NULL ALTER TABLE dbo.[t_etalonnage_mesure] ADD [Id_Etalonnage_Mesure_Sonde] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage_mesure', N'Id_Etalonnage') IS NULL ALTER TABLE dbo.[t_etalonnage_mesure] ADD [Id_Etalonnage] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage_mesure', N'Numero_Ordre') IS NULL ALTER TABLE dbo.[t_etalonnage_mesure] ADD [Numero_Ordre] INT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage_mesure', N'Mesure_Sonde') IS NULL ALTER TABLE dbo.[t_etalonnage_mesure] ADD [Mesure_Sonde] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalonnage_mesure', N'Mesure_Etalon') IS NULL ALTER TABLE dbo.[t_etalonnage_mesure] ADD [Mesure_Etalon] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_groupe] (
    [Id_Groupe] INT IDENTITY(1,1) NOT NULL,
    [Nom_Groupe] VARCHAR(64) NULL,
    [Numero_Regroupement] VARCHAR(1) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_groupe] PRIMARY KEY ([Id_Groupe])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_groupe', N'Id_Groupe') IS NULL ALTER TABLE dbo.[t_groupe] ADD [Id_Groupe] INT NULL;
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_groupe', N'Nom_Groupe') IS NULL ALTER TABLE dbo.[t_groupe] ADD [Nom_Groupe] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_groupe', N'Numero_Regroupement') IS NULL ALTER TABLE dbo.[t_groupe] ADD [Numero_Regroupement] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_groupe', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_groupe] ADD [Est_Archive] BIT NULL;
GO
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_groupe_Nom_Groupe' AND object_id = OBJECT_ID(N'dbo.t_groupe')) CREATE UNIQUE INDEX [UX_t_groupe_Nom_Groupe] ON dbo.[t_groupe]([Nom_Groupe]) WHERE [Nom_Groupe] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_profil_autorisation] (
    [Id_Profil] INT NOT NULL,
    [Id_Autorisation] INT NOT NULL,
    CONSTRAINT [PK_t_liaison_profil_autorisation] PRIMARY KEY ([Id_Profil], [Id_Autorisation])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_profil_autorisation', N'Id_Profil') IS NULL ALTER TABLE dbo.[t_liaison_profil_autorisation] ADD [Id_Profil] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_profil_autorisation', N'Id_Autorisation') IS NULL ALTER TABLE dbo.[t_liaison_profil_autorisation] ADD [Id_Autorisation] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_utilisateur_groupe] (
    [Id_Liaison_u_g] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Id_Groupe] INT NULL,
    CONSTRAINT [PK_t_liaison_utilisateur_groupe] PRIMARY KEY ([Id_Liaison_u_g])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_groupe', N'Id_Liaison_u_g') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_groupe] ADD [Id_Liaison_u_g] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_groupe', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_groupe] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_groupe', N'Id_Groupe') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_groupe] ADD [Id_Groupe] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_utilisateur_site] (
    [Id_Liaison] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Id_Site] INT NULL,
    [Date_Affectation] DATETIME NULL,
    CONSTRAINT [PK_t_liaison_utilisateur_site] PRIMARY KEY ([Id_Liaison])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_site', N'Id_Liaison') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_site] ADD [Id_Liaison] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_site', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_site] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_site', N'Id_Site') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_site] ADD [Id_Site] INT NULL;
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_liaison_utilisateur_site', N'Date_Affectation') IS NULL ALTER TABLE dbo.[t_liaison_utilisateur_site] ADD [Date_Affectation] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_USER_SITE' AND object_id = OBJECT_ID(N'dbo.t_liaison_utilisateur_site')) CREATE UNIQUE INDEX [UK_USER_SITE] ON dbo.[t_liaison_utilisateur_site]([Id_Utilisateur], [Id_Site]);
GO

IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_groupe] (
    [Id_Lieu] INT NOT NULL,
    [Id_Groupe] INT NOT NULL,
    CONSTRAINT [PK_t_lieu_groupe] PRIMARY KEY ([Id_Lieu], [Id_Groupe])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_groupe', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_lieu_groupe] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_groupe', N'Id_Groupe') IS NULL ALTER TABLE dbo.[t_lieu_groupe] ADD [Id_Groupe] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu] (
    [Id_Lieu] INT IDENTITY(1,1) NOT NULL,
    [Id_Site] INT NULL,
    [Nom_Lieu] VARCHAR(30) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Base] FLOAT NULL,
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Sup_Base] FLOAT NULL,
    [Tolerance_Surveillance_Sup] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Base] FLOAT NULL,
    [Est_Consigne_Sup_Active] BIT NULL DEFAULT(0),
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NULL DEFAULT(0),
    [Consigne_Inf] FLOAT NULL,
    [Consigne_Inf_Base] FLOAT NULL,
    [Tolerance_Surveillance_Inf] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Base] FLOAT NULL,
    [Est_Consigne_Inf_Active] BIT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Lieu_Etat] VARCHAR(1) NULL,
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Date_Creation] DATE NULL DEFAULT(GETDATE()),
    [Est_Archive] BIT NULL DEFAULT(0),
    [Est_Tel_Actif] BIT NULL DEFAULT(0),
    [Tel_Code] VARCHAR(4) NULL,
    [Tel_Son_Lieu] VARCHAR(260) NULL,
    [Id_Actionneur] INT NULL,
    [Est_Mode_Serotheque] BIT NULL DEFAULT(0),
    [Coef_Sensibilite] INT NULL,
    [Id_PDF] INT NULL,
    [Est_DataLogger] BIT NULL DEFAULT(0),
    [EMT] FLOAT NULL,
    [EMT_Choix_Mode] INT NULL DEFAULT(4),
    [EMT_Sonde] FLOAT NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Derniere_Date_Heure] DATETIME NULL,
    [Derniere_Valeur] FLOAT NULL,
    [Derniere_Unite] VARCHAR(10) NULL,
    [Derniere_Nb_Decimal] INT NULL DEFAULT(2),
    [Est_Lieu_En_Alarme] TINYINT NULL DEFAULT(0),
    [Est_Lieu_Alarme_Terminee_Non_Acquittee] TINYINT NULL DEFAULT(0),
    [Est_Lieu_Alarme_Terminee_Non_Acquittee_T1] TINYINT NULL DEFAULT(0),
    [Est_Lieu_En_Pre_Alarme] TINYINT NULL DEFAULT(0),
    [Id_Alarme] INT NULL DEFAULT(0),
    [Lieu_Etat_N1] VARCHAR(50) NULL,
    [Derniere_Date_Etalonnage] DATE NULL,
    [Derniere_Erreur_Justesse] FLOAT NULL,
    [Derniere_Incertitude] FLOAT NULL,
    [Retard_Non_Reponse] INT NULL DEFAULT(60),
    [Date_Heure_Derniere_Reponse] DATETIME NULL,
    [Date_Heure_Derniere_Reponse_Recue_OK] DATETIME NULL,
    [Est_Correction_Ej] TINYINT NULL DEFAULT(0),
    [Derive] FLOAT NULL DEFAULT(0),
    [Est_Correction_derive] BIT NULL DEFAULT(0),
    [Derniere_Valeur_Null] INT NULL DEFAULT(0),
    [Type_Lieu] VARCHAR(20) NULL,
    [Date_Heure_Dernier_Acquittement_En_Cours] DATETIME NULL,
    [Date_Heure_Last_Update_EVT_GSO] DATETIME NULL,
    [Date_Heure_Reactivation_Alarme] DATETIME NULL,
    [Notification_Active] BIT NOT NULL DEFAULT(1),
    [Commentaire] VARCHAR(200) NULL,
    [Infos_Modifiees_Depuis_Derniere_Mesure] BIT NOT NULL DEFAULT(1),
    [Date_Heure_Reactivation_Surveillance] DATETIME NULL,
    [Date_Heure_Surveillance_On] DATETIME NULL,
    [Date_Heure_Surveillance_Off] DATETIME NULL,
    [Derniere_Val_Rssi] VARCHAR(10) NULL,
    [Derniere_Val_Batterie] INT NULL,
    [Derniere_Val_Tension] VARCHAR(10) NULL,
    [Est_Lieu_GSO] BIT NULL DEFAULT(0),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT(1),
    [Planning_Actif] BIT NOT NULL DEFAULT(0),
    [Planning_Regle_Existe] BIT NULL DEFAULT(0),
    [Planning_Source_Regle_Id] INT NULL,
    [Planning_Derniere_Maj] DATETIME NULL,
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT(0),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT(0),
    CONSTRAINT [PK_t_lieu] PRIMARY KEY ([Id_Lieu])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_Site') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_Site] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Nom_Lieu') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Nom_Lieu] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Adresse_Sonde') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Adresse_Sonde] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Base') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Base] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Observations_Info') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Observations_Info] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Sup_Base') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Sup_Base] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tolerance_Surveillance_Sup') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tolerance_Surveillance_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tolerance_Surveillance_Sup_Base') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tolerance_Surveillance_Sup_Base] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Consigne_Sup_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Consigne_Sup_Active] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Sup_Pre_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Sup_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Consigne_Sup_Pre_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Consigne_Sup_Pre_Alarme_Active] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Inf_Base') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Inf_Base] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tolerance_Surveillance_Inf') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tolerance_Surveillance_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tolerance_Surveillance_Inf_Base') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tolerance_Surveillance_Inf_Base] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Consigne_Inf_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Consigne_Inf_Active] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Consigne_Inf_Pre_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Consigne_Inf_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Consigne_Inf_Pre_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Consigne_Inf_Pre_Alarme_Active] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Frequence') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Frequence] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Lieu_Etat') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Lieu_Etat] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Retard_Alarme_Haut') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Retard_Alarme_Haut] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Retard_Alarme_Bas') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Retard_Alarme_Bas] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_Plan') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_Plan] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Position_Plan_X') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Position_Plan_X] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Position_Plan_Y') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Position_Plan_Y] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Creation] DATE NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Archive] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Tel_Actif') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Tel_Actif] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tel_Code') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tel_Code] VARCHAR(4) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Tel_Son_Lieu') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Tel_Son_Lieu] VARCHAR(260) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_Actionneur') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_Actionneur] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Mode_Serotheque') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Mode_Serotheque] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Coef_Sensibilite') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Coef_Sensibilite] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_PDF') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_PDF] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_DataLogger') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_DataLogger] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'EMT') IS NULL ALTER TABLE dbo.[t_lieu] ADD [EMT] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'EMT_Choix_Mode') IS NULL ALTER TABLE dbo.[t_lieu] ADD [EMT_Choix_Mode] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'EMT_Sonde') IS NULL ALTER TABLE dbo.[t_lieu] ADD [EMT_Sonde] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Retard_Alarme_Changement_Consigne') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Retard_Alarme_Changement_Consigne] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Date_Heure') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Date_Heure] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Valeur') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Unite') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Nb_Decimal') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Nb_Decimal] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Lieu_En_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Lieu_En_Alarme] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Lieu_Alarme_Terminee_Non_Acquittee') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Lieu_Alarme_Terminee_Non_Acquittee] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Lieu_Alarme_Terminee_Non_Acquittee_T1') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Lieu_Alarme_Terminee_Non_Acquittee_T1] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Lieu_En_Pre_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Lieu_En_Pre_Alarme] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Id_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Id_Alarme] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Lieu_Etat_N1') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Lieu_Etat_N1] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Date_Etalonnage') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Date_Etalonnage] DATE NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Erreur_Justesse') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Erreur_Justesse] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Incertitude') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Incertitude] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Retard_Non_Reponse') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Retard_Non_Reponse] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Derniere_Reponse') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Derniere_Reponse] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Derniere_Reponse_Recue_OK') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Derniere_Reponse_Recue_OK] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Correction_Ej') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Correction_Ej] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derive') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derive] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Correction_derive') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Correction_derive] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Valeur_Null') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Valeur_Null] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Type_Lieu') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Type_Lieu] VARCHAR(20) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Dernier_Acquittement_En_Cours') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Dernier_Acquittement_En_Cours] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Last_Update_EVT_GSO') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Last_Update_EVT_GSO] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Reactivation_Alarme') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Reactivation_Alarme] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Notification_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Notification_Active] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Commentaire') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Commentaire] VARCHAR(200) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Infos_Modifiees_Depuis_Derniere_Mesure') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Infos_Modifiees_Depuis_Derniere_Mesure] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Reactivation_Surveillance') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Reactivation_Surveillance] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Surveillance_On') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Surveillance_On] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Date_Heure_Surveillance_Off') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Date_Heure_Surveillance_Off] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Val_Rssi') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Val_Rssi] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Val_Batterie') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Val_Batterie] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Derniere_Val_Tension') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Derniere_Val_Tension] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Lieu_GSO') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Lieu_GSO] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Son_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Son_Alarme_Active] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Planning_Actif') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Planning_Actif] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Planning_Regle_Existe') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Planning_Regle_Existe] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Planning_Source_Regle_Id') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Planning_Source_Regle_Id] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Planning_Derniere_Maj') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Planning_Derniere_Maj] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Est_Redeclenchement_Immediat') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Est_Redeclenchement_Immediat] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu', N'Nb_Mesures_Temporisation_Redeclenchement') IS NULL ALTER TABLE dbo.[t_lieu] ADD [Nb_Mesures_Temporisation_Redeclenchement] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_template] (
    [Id_Lieu_Template] INT IDENTITY(1,1) NOT NULL,
    [Nom_Template] VARCHAR(80) NOT NULL,
    [Description] VARCHAR(255) NULL,
    [Lieu_Etat] VARCHAR(1) NOT NULL,
    [Frequence] INT NULL,
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Retard_Non_Reponse] INT NULL DEFAULT(60),
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Consigne_Sup] DECIMAL(10,2) NULL,
    [Consigne_Inf] DECIMAL(10,2) NULL,
    [Tolerance_Surveillance_Sup] DECIMAL(10,2) NULL,
    [Tolerance_Surveillance_Inf] DECIMAL(10,2) NULL,
    [Consigne_Sup_Pre_Alarme] DECIMAL(10,2) NULL,
    [Consigne_Inf_Pre_Alarme] DECIMAL(10,2) NULL,
    [Est_Consigne_Sup_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Inf_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NOT NULL DEFAULT(0),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT(1),
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT(0),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT(0),
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Est_Archive] BIT NOT NULL DEFAULT(0),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Creation] INT NULL,
    [Id_Utilisateur_Maj] INT NULL,
    CONSTRAINT [PK_t_lieu_template] PRIMARY KEY ([Id_Lieu_Template])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Id_Lieu_Template') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Id_Lieu_Template] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Nom_Template') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Nom_Template] VARCHAR(80) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Description') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Description] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Lieu_Etat') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Lieu_Etat] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Frequence') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Frequence] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Retard_Alarme_Haut') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Retard_Alarme_Haut] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Retard_Alarme_Bas') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Retard_Alarme_Bas] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Retard_Non_Reponse') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Retard_Non_Reponse] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Retard_Alarme_Changement_Consigne') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Retard_Alarme_Changement_Consigne] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Consigne') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Consigne] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Consigne_Sup] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Consigne_Inf] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Tolerance_Surveillance_Sup') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Tolerance_Surveillance_Sup] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Tolerance_Surveillance_Inf') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Tolerance_Surveillance_Inf] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Consigne_Sup_Pre_Alarme') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Consigne_Sup_Pre_Alarme] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Consigne_Inf_Pre_Alarme') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Consigne_Inf_Pre_Alarme] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Consigne_Sup_Active') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Consigne_Sup_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Consigne_Inf_Active') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Consigne_Inf_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Consigne_Sup_Pre_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Consigne_Sup_Pre_Alarme_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Consigne_Inf_Pre_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Consigne_Inf_Pre_Alarme_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Son_Alarme_Active') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Son_Alarme_Active] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Redeclenchement_Immediat') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Redeclenchement_Immediat] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Nb_Mesures_Temporisation_Redeclenchement') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Nb_Mesures_Temporisation_Redeclenchement] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Observations_Info') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Observations_Info] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Est_Archive] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Date_Maj') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Date_Maj] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Id_Utilisateur_Creation') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Id_Utilisateur_Creation] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_template', N'Id_Utilisateur_Maj') IS NULL ALTER TABLE dbo.[t_lieu_template] ADD [Id_Utilisateur_Maj] INT NULL;
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_lieu_template_Nom_Template' AND object_id = OBJECT_ID(N'dbo.t_lieu_template')) CREATE UNIQUE INDEX [UX_t_lieu_template_Nom_Template] ON dbo.[t_lieu_template]([Nom_Template]) WHERE [Nom_Template] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_module', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_module] (
    [Id_Module] INT IDENTITY(1,1) NOT NULL,
    [Module_Numero_Serie] VARCHAR(50) NULL,
    [Type_Module] INT NULL,
    [Port_Serie] VARCHAR(10) NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Id_Plan] INT NULL,
    [Adresse_IP] VARCHAR(50) NULL,
    [Delai_Reseau] INT NULL,
    [Emplacement] VARCHAR(50) NULL,
    [Archive] TINYINT NULL DEFAULT(0),
    [Id_Serveur] INT NULL,
    [Est_Module_GSO] BIT NOT NULL DEFAULT(0),
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    CONSTRAINT [PK_t_module] PRIMARY KEY ([Id_Module])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Id_Module') IS NULL ALTER TABLE dbo.[t_module] ADD [Id_Module] INT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Module_Numero_Serie') IS NULL ALTER TABLE dbo.[t_module] ADD [Module_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Type_Module') IS NULL ALTER TABLE dbo.[t_module] ADD [Type_Module] INT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Port_Serie') IS NULL ALTER TABLE dbo.[t_module] ADD [Port_Serie] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Position_Plan_X') IS NULL ALTER TABLE dbo.[t_module] ADD [Position_Plan_X] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Position_Plan_Y') IS NULL ALTER TABLE dbo.[t_module] ADD [Position_Plan_Y] BIGINT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Id_Plan') IS NULL ALTER TABLE dbo.[t_module] ADD [Id_Plan] INT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Adresse_IP') IS NULL ALTER TABLE dbo.[t_module] ADD [Adresse_IP] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Delai_Reseau') IS NULL ALTER TABLE dbo.[t_module] ADD [Delai_Reseau] INT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Emplacement') IS NULL ALTER TABLE dbo.[t_module] ADD [Emplacement] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Archive') IS NULL ALTER TABLE dbo.[t_module] ADD [Archive] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Id_Serveur') IS NULL ALTER TABLE dbo.[t_module] ADD [Id_Serveur] INT NULL;
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Est_Module_GSO') IS NULL ALTER TABLE dbo.[t_module] ADD [Est_Module_GSO] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module', N'Port_Serie_Send_GSO') IS NULL ALTER TABLE dbo.[t_module] ADD [Port_Serie_Send_GSO] VARCHAR(10) NULL;
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Identifiant_Module' AND object_id = OBJECT_ID(N'dbo.t_module')) CREATE UNIQUE INDEX [Identifiant_Module] ON dbo.[t_module]([Type_Module], [Module_Numero_Serie]);
GO

IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_module_type] (
    [Id_Module_Type] INT IDENTITY(1,1) NOT NULL,
    [Libelle_Type_Module] VARCHAR(50) NULL,
    [Libelle_Module] VARCHAR(100) NULL,
    [Est_Flag_Affiche_Plan] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_module_type] PRIMARY KEY ([Id_Module_Type])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module_type', N'Id_Module_Type') IS NULL ALTER TABLE dbo.[t_module_type] ADD [Id_Module_Type] INT NULL;
IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module_type', N'Libelle_Type_Module') IS NULL ALTER TABLE dbo.[t_module_type] ADD [Libelle_Type_Module] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module_type', N'Libelle_Module') IS NULL ALTER TABLE dbo.[t_module_type] ADD [Libelle_Module] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_module_type', N'Est_Flag_Affiche_Plan') IS NULL ALTER TABLE dbo.[t_module_type] ADD [Est_Flag_Affiche_Plan] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_parametre] (
    [Section] VARCHAR(100) NOT NULL,
    [Mot_Cle] VARCHAR(100) NOT NULL,
    [Valeur] NVARCHAR(MAX) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Champ_DATETIME] DATETIME NULL,
    CONSTRAINT [PK_t_parametre] PRIMARY KEY ([Section], [Mot_Cle])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_parametre', N'Section') IS NULL ALTER TABLE dbo.[t_parametre] ADD [Section] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_parametre', N'Mot_Cle') IS NULL ALTER TABLE dbo.[t_parametre] ADD [Mot_Cle] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_parametre', N'Valeur') IS NULL ALTER TABLE dbo.[t_parametre] ADD [Valeur] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_parametre', N'Commentaire') IS NULL ALTER TABLE dbo.[t_parametre] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_parametre', N'Champ_DATETIME') IS NULL ALTER TABLE dbo.[t_parametre] ADD [Champ_DATETIME] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.t_pdf', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_pdf] (
    [Id_PDF] INT IDENTITY(1,1) NOT NULL,
    [Nom_PDF] VARCHAR(50) NULL,
    [Contenu_PDF] VARBINARY(MAX) NULL,
    CONSTRAINT [PK_t_pdf] PRIMARY KEY ([Id_PDF])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_pdf', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_pdf', N'Id_PDF') IS NULL ALTER TABLE dbo.[t_pdf] ADD [Id_PDF] INT NULL;
IF OBJECT_ID(N'dbo.t_pdf', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_pdf', N'Nom_PDF') IS NULL ALTER TABLE dbo.[t_pdf] ADD [Nom_PDF] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_pdf', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_pdf', N'Contenu_PDF') IS NULL ALTER TABLE dbo.[t_pdf] ADD [Contenu_PDF] VARBINARY(MAX) NULL;
GO

IF OBJECT_ID(N'dbo.t_plan', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_plan] (
    [Id_Plan] INT IDENTITY(1,1) NOT NULL,
    [Image] VARBINARY(MAX) NULL,
    [Titre] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_plan] PRIMARY KEY ([Id_Plan])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_plan', N'Id_Plan') IS NULL ALTER TABLE dbo.[t_plan] ADD [Id_Plan] INT NULL;
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_plan', N'Image') IS NULL ALTER TABLE dbo.[t_plan] ADD [Image] VARBINARY(MAX) NULL;
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_plan', N'Titre') IS NULL ALTER TABLE dbo.[t_plan] ADD [Titre] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_plan', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_plan] ADD [Est_Archive] BIT NULL;
GO
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_plan_Titre' AND object_id = OBJECT_ID(N'dbo.t_plan')) CREATE UNIQUE INDEX [UX_t_plan_Titre] ON dbo.[t_plan]([Titre]) WHERE [Titre] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_postes_clients] (
    [Id_Poste] INT IDENTITY(1,1) NOT NULL,
    [Nom_Machine_Connexion] VARCHAR(255) NULL,
    [Adresse_IP_Connexion] VARCHAR(50) NULL,
    [Login] VARCHAR(64) NULL,
    [Nom] VARCHAR(50) NULL,
    [Prenom] VARCHAR(50) NULL,
    [Date_Heure_Derniere_Connexion] DATETIME NULL,
    CONSTRAINT [PK_t_postes_clients] PRIMARY KEY ([Id_Poste])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Id_Poste') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Id_Poste] INT NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Nom_Machine_Connexion') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Nom_Machine_Connexion] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Adresse_IP_Connexion') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Adresse_IP_Connexion] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Login') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Login] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Nom') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Nom] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Prenom') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Prenom] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_postes_clients', N'Date_Heure_Derniere_Connexion') IS NULL ALTER TABLE dbo.[t_postes_clients] ADD [Date_Heure_Derniere_Connexion] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_postes_clients_Nom_Machine_Connexion' AND object_id = OBJECT_ID(N'dbo.t_postes_clients')) CREATE UNIQUE INDEX [UX_t_postes_clients_Nom_Machine_Connexion] ON dbo.[t_postes_clients]([Nom_Machine_Connexion]) WHERE [Nom_Machine_Connexion] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_profil', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_profil] (
    [Id_Profil] INT IDENTITY(1,1) NOT NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(100) NULL,
    [Est_MC2] BIT NULL DEFAULT(0),
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_profil] PRIMARY KEY ([Id_Profil])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_profil', N'Id_Profil') IS NULL ALTER TABLE dbo.[t_profil] ADD [Id_Profil] INT NULL;
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_profil', N'Profil_Utilisateur') IS NULL ALTER TABLE dbo.[t_profil] ADD [Profil_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_profil', N'Commentaire') IS NULL ALTER TABLE dbo.[t_profil] ADD [Commentaire] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_profil', N'Est_MC2') IS NULL ALTER TABLE dbo.[t_profil] ADD [Est_MC2] BIT NULL;
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_profil', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_profil] ADD [Est_Archive] BIT NULL;
GO
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_profil_Profil_Utilisateur' AND object_id = OBJECT_ID(N'dbo.t_profil')) CREATE UNIQUE INDEX [UX_t_profil_Profil_Utilisateur] ON dbo.[t_profil]([Profil_Utilisateur]) WHERE [Profil_Utilisateur] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_site', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_site] (
    [Id_Site] INT IDENTITY(1,1) NOT NULL,
    [Libelle_Site] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(200) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_site] PRIMARY KEY ([Id_Site])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_site', N'Id_Site') IS NULL ALTER TABLE dbo.[t_site] ADD [Id_Site] INT NULL;
IF OBJECT_ID(N'dbo.t_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_site', N'Libelle_Site') IS NULL ALTER TABLE dbo.[t_site] ADD [Libelle_Site] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_site', N'Commentaire') IS NULL ALTER TABLE dbo.[t_site] ADD [Commentaire] VARCHAR(200) NULL;
IF OBJECT_ID(N'dbo.t_site', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_site', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_site] ADD [Est_Archive] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde] (
    [Id_Sonde] INT IDENTITY(1,1) NOT NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Est_Sonde_GSO] BIT NOT NULL DEFAULT(0),
    [Port_Serie] VARCHAR(10) NULL,
    [Surveillance_Etat] VARCHAR(1) NOT NULL DEFAULT(N'D'),
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Frequence_Mesure] INT NULL,
    [Frequence_Recup] INT NULL,
    [Est_Sonde_Reformee] BIT NULL,
    [Etat_Sonde_N1] VARCHAR(1) NULL,
    [Id_Serveur] INT NULL,
    [Id_Sonde_Etat] INT NULL,
    [Sonde_Offset] FLOAT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_t_sonde] PRIMARY KEY ([Id_Sonde])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Id_Sonde') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Id_Sonde] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Adresse_Sonde') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Adresse_Sonde] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Sonde_Type') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Sonde_Type] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Est_Sonde_GSO') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Est_Sonde_GSO] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Port_Serie') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Port_Serie] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Surveillance_Etat') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Surveillance_Etat] VARCHAR(1) NULL DEFAULT(N'D');
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Id_Module') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Id_Module] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Relai_1') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Relai_1] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Relai_2') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Relai_2] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Relai_3') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Relai_3] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Relai_4') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Relai_4] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Frequence_Mesure') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Frequence_Mesure] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Frequence_Recup') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Frequence_Recup] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Est_Sonde_Reformee') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Est_Sonde_Reformee] BIT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Etat_Sonde_N1') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Etat_Sonde_N1] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Id_Serveur') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Id_Serveur] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Id_Sonde_Etat') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Id_Sonde_Etat] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde', N'Sonde_Offset') IS NULL ALTER TABLE dbo.[t_sonde] ADD [Sonde_Offset] FLOAT NULL DEFAULT(0);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_Sonde_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_sonde')) CREATE UNIQUE INDEX [UX_t_sonde_Sonde_Numero_Serie] ON dbo.[t_sonde]([Sonde_Numero_Serie]) WHERE [Sonde_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etat_surveillance] (
    [Id_Surveillance_Etat] INT IDENTITY(1,1) NOT NULL,
    [Surveillance_Etat] VARCHAR(1) NULL,
    [Surveillance_Etat_Libelle] VARCHAR(50) NULL,
    CONSTRAINT [PK_t_etat_surveillance] PRIMARY KEY ([Id_Surveillance_Etat])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etat_surveillance', N'Id_Surveillance_Etat') IS NULL ALTER TABLE dbo.[t_etat_surveillance] ADD [Id_Surveillance_Etat] INT NULL;
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etat_surveillance', N'Surveillance_Etat') IS NULL ALTER TABLE dbo.[t_etat_surveillance] ADD [Surveillance_Etat] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etat_surveillance', N'Surveillance_Etat_Libelle') IS NULL ALTER TABLE dbo.[t_etat_surveillance] ADD [Surveillance_Etat_Libelle] VARCHAR(50) NULL;
GO
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_etat_surveillance_Surveillance_Etat' AND object_id = OBJECT_ID(N'dbo.t_etat_surveillance')) CREATE UNIQUE INDEX [UX_t_etat_surveillance_Surveillance_Etat] ON dbo.[t_etat_surveillance]([Surveillance_Etat]) WHERE [Surveillance_Etat] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde_type] (
    [Id_Sonde_Type] INT IDENTITY(1,1) NOT NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Libelle_Sonde_Type] VARCHAR(50) NULL,
    [Est_Gestion_Relais] BIT NULL,
    [Est_Double_Capteur] BIT NOT NULL DEFAULT(0),
    [Famille_Sonde] VARCHAR(16) NOT NULL,
    CONSTRAINT [PK_t_sonde_type] PRIMARY KEY ([Id_Sonde_Type])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Id_Sonde_Type') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Id_Sonde_Type] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Sonde_Type') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Sonde_Type] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Libelle_Sonde_Type') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Libelle_Sonde_Type] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Est_Gestion_Relais') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Est_Gestion_Relais] BIT NULL;
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Est_Double_Capteur') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Est_Double_Capteur] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_type', N'Famille_Sonde') IS NULL ALTER TABLE dbo.[t_sonde_type] ADD [Famille_Sonde] VARCHAR(16) NULL;
GO
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_type_Sonde_Type' AND object_id = OBJECT_ID(N'dbo.t_sonde_type')) CREATE UNIQUE INDEX [UX_t_sonde_type_Sonde_Type] ON dbo.[t_sonde_type]([Sonde_Type]) WHERE [Sonde_Type] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_utilisateur] (
    [Id_Utilisateur] INT IDENTITY(1,1) NOT NULL,
    [Login] VARCHAR(64) NULL,
    [Mot_De_Passe] VARCHAR(60) NULL,
    [Date_Validite] DATE NULL,
    [Date_Creation] DATE NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Derniere_Connexion] DATETIME NULL,
    [Adresse_IP_Connexion] VARCHAR(50) NULL,
    [Nom_Machine_Connexion] VARCHAR(50) NULL,
    [Id_Site] INT NULL,
    [Nom] VARCHAR(50) NULL,
    [Prenom] VARCHAR(50) NULL,
    [Tel_Num_Fixe] VARCHAR(50) NULL,
    [Tel_Num_Mobile] VARCHAR(50) NULL,
    [Adresse_Email] VARCHAR(100) NULL,
    [Date_Derniere_Modification_MDP] DATETIME NULL,
    [Reset_Password_Token] VARCHAR(255) NULL,
    [Reset_Password_Expires] DATETIME NULL,
    [Est_Mot_De_Passe_Temporaire] BIT NULL DEFAULT(0),
    [Avatar_Utilisateur] VARCHAR(512) NULL,
    CONSTRAINT [PK_t_utilisateur] PRIMARY KEY ([Id_Utilisateur])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Login') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Login] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Mot_De_Passe') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Mot_De_Passe] VARCHAR(60) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Date_Validite') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Date_Validite] DATE NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Date_Creation] DATE NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Est_Archive] BIT NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Profil_Utilisateur') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Profil_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Date_Heure_Derniere_Connexion') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Date_Heure_Derniere_Connexion] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Adresse_IP_Connexion') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Adresse_IP_Connexion] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Nom_Machine_Connexion') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Nom_Machine_Connexion] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Id_Site') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Id_Site] INT NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Nom') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Nom] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Prenom') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Prenom] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Tel_Num_Fixe') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Tel_Num_Fixe] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Tel_Num_Mobile') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Tel_Num_Mobile] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Adresse_Email') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Adresse_Email] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Date_Derniere_Modification_MDP') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Date_Derniere_Modification_MDP] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Reset_Password_Token') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Reset_Password_Token] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Reset_Password_Expires') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Reset_Password_Expires] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Est_Mot_De_Passe_Temporaire') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Est_Mot_De_Passe_Temporaire] BIT NULL;
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_utilisateur', N'Avatar_Utilisateur') IS NULL ALTER TABLE dbo.[t_utilisateur] ADD [Avatar_Utilisateur] VARCHAR(512) NULL;
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_utilisateur_Login' AND object_id = OBJECT_ID(N'dbo.t_utilisateur')) CREATE UNIQUE INDEX [UX_t_utilisateur_Login] ON dbo.[t_utilisateur]([Login]) WHERE [Login] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_notification', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification] (
    [Id_Notification] INT IDENTITY(1,1) NOT NULL,
    [Type] VARCHAR(32) NOT NULL,
    [Id_Alarme] INT NULL,
    [Titre] VARCHAR(128) NULL,
    [Message] VARCHAR(512) NOT NULL,
    [Payload_Json] NVARCHAR(MAX) NULL,
    [Priorite] INT NULL DEFAULT(0),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Est_Archive] BIT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_t_notification] PRIMARY KEY ([Id_Notification])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Id_Notification') IS NULL ALTER TABLE dbo.[t_notification] ADD [Id_Notification] INT NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Type') IS NULL ALTER TABLE dbo.[t_notification] ADD [Type] VARCHAR(32) NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Id_Alarme') IS NULL ALTER TABLE dbo.[t_notification] ADD [Id_Alarme] INT NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Titre') IS NULL ALTER TABLE dbo.[t_notification] ADD [Titre] VARCHAR(128) NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Message') IS NULL ALTER TABLE dbo.[t_notification] ADD [Message] VARCHAR(512) NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Payload_Json') IS NULL ALTER TABLE dbo.[t_notification] ADD [Payload_Json] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Priorite') IS NULL ALTER TABLE dbo.[t_notification] ADD [Priorite] INT NULL;
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_notification] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification', N'Est_Archive') IS NULL ALTER TABLE dbo.[t_notification] ADD [Est_Archive] BIT NULL DEFAULT(0);
GO

IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification_delivery] (
    [Id_Delivery] INT IDENTITY(1,1) NOT NULL,
    [Id_Notification] INT NOT NULL,
    [Id_Poste] INT NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Statut] VARCHAR(32) NOT NULL,
    [Nb_Tentatives] INT NOT NULL DEFAULT(0),
    [Derniere_Erreur] VARCHAR(255) NULL,
    [Date_Queue] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Envoi] DATETIME NULL,
    [Date_Ack_Agent] DATETIME NULL,
    [Date_Dernier_Event] DATETIME NULL,
    [Correlation_Id] VARCHAR(64) NULL,
    CONSTRAINT [PK_t_notification_delivery] PRIMARY KEY ([Id_Delivery])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Id_Delivery') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Id_Delivery] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Id_Notification') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Id_Notification] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Id_Poste') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Id_Poste] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Statut') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Statut] VARCHAR(32) NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Nb_Tentatives') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Nb_Tentatives] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Derniere_Erreur') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Derniere_Erreur] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Date_Queue') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Date_Queue] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Date_Envoi') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Date_Envoi] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Date_Ack_Agent') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Date_Ack_Agent] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Date_Dernier_Event') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Date_Dernier_Event] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_delivery', N'Correlation_Id') IS NULL ALTER TABLE dbo.[t_notification_delivery] ADD [Correlation_Id] VARCHAR(64) NULL;
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_NOTIFICATION_POSTE' AND object_id = OBJECT_ID(N'dbo.t_notification_delivery')) CREATE UNIQUE INDEX [UK_NOTIFICATION_POSTE] ON dbo.[t_notification_delivery]([Id_Notification], [Id_Poste]);
GO

IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification_event] (
    [Id_Event] INT IDENTITY(1,1) NOT NULL,
    [Id_Delivery] INT NOT NULL,
    [Event_Type] VARCHAR(32) NOT NULL,
    [Event_Data] NVARCHAR(MAX) NULL,
    [Date_Event] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_notification_event] PRIMARY KEY ([Id_Event])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_event', N'Id_Event') IS NULL ALTER TABLE dbo.[t_notification_event] ADD [Id_Event] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_event', N'Id_Delivery') IS NULL ALTER TABLE dbo.[t_notification_event] ADD [Id_Delivery] INT NULL;
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_event', N'Event_Type') IS NULL ALTER TABLE dbo.[t_notification_event] ADD [Event_Type] VARCHAR(32) NULL;
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_event', N'Event_Data') IS NULL ALTER TABLE dbo.[t_notification_event] ADD [Event_Data] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_notification_event', N'Date_Event') IS NULL ALTER TABLE dbo.[t_notification_event] ADD [Date_Event] DATETIME NULL DEFAULT(GETDATE());
GO

IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[liste_clients] (
    [Id_Client] INT IDENTITY(1,1) NOT NULL,
    [Nom] VARCHAR(100) NOT NULL,
    [Num_Compte] VARCHAR(50) NULL,
    [VigiServ_Derniere_Date_Heure] DATETIME NULL,
    [Vigitel_Derniere_Date_Heure] DATETIME NULL,
    CONSTRAINT [PK_liste_clients] PRIMARY KEY ([Id_Client])
  );
END;
GO
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.liste_clients', N'Id_Client') IS NULL ALTER TABLE dbo.[liste_clients] ADD [Id_Client] INT NULL;
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.liste_clients', N'Nom') IS NULL ALTER TABLE dbo.[liste_clients] ADD [Nom] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.liste_clients', N'Num_Compte') IS NULL ALTER TABLE dbo.[liste_clients] ADD [Num_Compte] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.liste_clients', N'VigiServ_Derniere_Date_Heure') IS NULL ALTER TABLE dbo.[liste_clients] ADD [VigiServ_Derniere_Date_Heure] DATETIME NULL;
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.liste_clients', N'Vigitel_Derniere_Date_Heure') IS NULL ALTER TABLE dbo.[liste_clients] ADD [Vigitel_Derniere_Date_Heure] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_liste_clients_Num_Compte' AND object_id = OBJECT_ID(N'dbo.liste_clients')) CREATE UNIQUE INDEX [UX_liste_clients_Num_Compte] ON dbo.[liste_clients]([Num_Compte]) WHERE [Num_Compte] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur_type] (
    [Id_Actionneur_Type] INT IDENTITY(1,1) NOT NULL,
    [Type] INT NULL,
    [Description] VARCHAR(50) NULL,
    [Gere_Relais] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_actionneur_type] PRIMARY KEY ([Id_Actionneur_Type])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur_type', N'Id_Actionneur_Type') IS NULL ALTER TABLE dbo.[t_actionneur_type] ADD [Id_Actionneur_Type] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur_type', N'Type') IS NULL ALTER TABLE dbo.[t_actionneur_type] ADD [Type] INT NULL;
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur_type', N'Description') IS NULL ALTER TABLE dbo.[t_actionneur_type] ADD [Description] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_actionneur_type', N'Gere_Relais') IS NULL ALTER TABLE dbo.[t_actionneur_type] ADD [Gere_Relais] BIT NULL;
GO
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_actionneur_type_Type' AND object_id = OBJECT_ID(N'dbo.t_actionneur_type')) CREATE UNIQUE INDEX [UX_t_actionneur_type_Type] ON dbo.[t_actionneur_type]([Type]) WHERE [Type] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ancien_mot_de_passe] (
    [Id_Ancien_Mot_De_Passe] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Mot_De_Passe] VARCHAR(100) NULL,
    [Est_Premiere_Connexion] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_ancien_mot_de_passe] PRIMARY KEY ([Id_Ancien_Mot_De_Passe])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ancien_mot_de_passe', N'Id_Ancien_Mot_De_Passe') IS NULL ALTER TABLE dbo.[t_ancien_mot_de_passe] ADD [Id_Ancien_Mot_De_Passe] INT NULL;
IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ancien_mot_de_passe', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_ancien_mot_de_passe] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ancien_mot_de_passe', N'Mot_De_Passe') IS NULL ALTER TABLE dbo.[t_ancien_mot_de_passe] ADD [Mot_De_Passe] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_ancien_mot_de_passe', N'Est_Premiere_Connexion') IS NULL ALTER TABLE dbo.[t_ancien_mot_de_passe] ADD [Est_Premiere_Connexion] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commentaire_acquittement_alarme] (
    [Id_Commentaire] INT IDENTITY(1,1) NOT NULL,
    [Type_Commentaire] VARCHAR(50) NULL,
    [Texte] VARCHAR(255) NULL,
    CONSTRAINT [PK_t_commentaire_acquittement_alarme] PRIMARY KEY ([Id_Commentaire])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commentaire_acquittement_alarme', N'Id_Commentaire') IS NULL ALTER TABLE dbo.[t_commentaire_acquittement_alarme] ADD [Id_Commentaire] INT NULL;
IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commentaire_acquittement_alarme', N'Type_Commentaire') IS NULL ALTER TABLE dbo.[t_commentaire_acquittement_alarme] ADD [Type_Commentaire] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commentaire_acquittement_alarme', N'Texte') IS NULL ALTER TABLE dbo.[t_commentaire_acquittement_alarme] ADD [Texte] VARCHAR(255) NULL;
GO

IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon_type] (
    [Type_Etalon] VARCHAR(4) NOT NULL,
    [Nom] VARCHAR(30) NULL,
    [Descriptif] VARCHAR(100) NULL,
    [Est_Saisie_Module] BIT NULL DEFAULT(0),
    [Est_Sonde_Externe] BIT NULL DEFAULT(0),
    [Resolution] FLOAT NULL,
    CONSTRAINT [PK_t_etalon_type] PRIMARY KEY ([Type_Etalon])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Type_Etalon') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Type_Etalon] VARCHAR(4) NULL;
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Nom') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Nom] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Descriptif') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Descriptif] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Est_Saisie_Module') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Est_Saisie_Module] BIT NULL;
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Est_Sonde_Externe') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Est_Sonde_Externe] BIT NULL;
IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_etalon_type', N'Resolution') IS NULL ALTER TABLE dbo.[t_etalon_type] ADD [Resolution] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_mem_gso] (
    [id] INT NOT NULL,
    [last_sonde] VARCHAR(20) NULL,
    [cycle_MEM] INT NULL,
    [cycle_start] DATETIME NULL,
    [last_update] DATETIME NULL,
    CONSTRAINT [PK_t_mem_gso] PRIMARY KEY ([id])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_mem_gso', N'id') IS NULL ALTER TABLE dbo.[t_mem_gso] ADD [id] INT NULL;
IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_mem_gso', N'last_sonde') IS NULL ALTER TABLE dbo.[t_mem_gso] ADD [last_sonde] VARCHAR(20) NULL;
IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_mem_gso', N'cycle_MEM') IS NULL ALTER TABLE dbo.[t_mem_gso] ADD [cycle_MEM] INT NULL;
IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_mem_gso', N'cycle_start') IS NULL ALTER TABLE dbo.[t_mem_gso] ADD [cycle_start] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_mem_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_mem_gso', N'last_update') IS NULL ALTER TABLE dbo.[t_mem_gso] ADD [last_update] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde_etat] (
    [Id_Sonde_Etat] INT IDENTITY(1,1) NOT NULL,
    [Etat_Sonde] VARCHAR(1) NULL,
    [Etat_Libelle] VARCHAR(50) NULL,
    CONSTRAINT [PK_t_sonde_etat] PRIMARY KEY ([Id_Sonde_Etat])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_etat', N'Id_Sonde_Etat') IS NULL ALTER TABLE dbo.[t_sonde_etat] ADD [Id_Sonde_Etat] INT NULL;
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_etat', N'Etat_Sonde') IS NULL ALTER TABLE dbo.[t_sonde_etat] ADD [Etat_Sonde] VARCHAR(1) NULL;
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_sonde_etat', N'Etat_Libelle') IS NULL ALTER TABLE dbo.[t_sonde_etat] ADD [Etat_Libelle] VARCHAR(50) NULL;
GO
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_etat_Etat_Sonde' AND object_id = OBJECT_ID(N'dbo.t_sonde_etat')) CREATE UNIQUE INDEX [UX_t_sonde_etat_Etat_Sonde] ON dbo.[t_sonde_etat]([Etat_Sonde]) WHERE [Etat_Sonde] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_mail_tel] (
    [Id_Mail_Tel] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NULL,
    [Ordre_Contact] INT NULL,
    [Id_Utilisateur] INT NULL,
    [Est_Via_Telephone] BIT NULL,
    [Est_Via_Email] BIT NULL,
    CONSTRAINT [PK_t_lieu_mail_tel] PRIMARY KEY ([Id_Mail_Tel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Id_Mail_Tel') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Id_Mail_Tel] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Ordre_Contact') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Ordre_Contact] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Est_Via_Telephone') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Est_Via_Telephone] BIT NULL;
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_mail_tel', N'Est_Via_Email') IS NULL ALTER TABLE dbo.[t_lieu_mail_tel] ADD [Est_Via_Email] BIT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_audit] (
    [Id_Audit] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Debut_Changement] DATETIME NULL,
    [Date_Heure_Fin_Changement] DATETIME NULL,
    [Type] VARCHAR(64) NOT NULL,
    [Planning_Regle_Id] INT NULL,
    [Consigne_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Avant] FLOAT NULL,
    [Consigne_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Apres] FLOAT NULL,
    CONSTRAINT [PK_t_lieu_planning_audit] PRIMARY KEY ([Id_Audit])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Id_Audit') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Id_Audit] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Timestamp') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Timestamp] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Date_Heure_Debut_Changement') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Date_Heure_Debut_Changement] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Date_Heure_Fin_Changement') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Date_Heure_Fin_Changement] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Type') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Type] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Planning_Regle_Id') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Planning_Regle_Id] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Consigne_Avant') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Consigne_Avant] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Tolerance_Surveillance_Sup_Avant') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Tolerance_Surveillance_Sup_Avant] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Tolerance_Surveillance_Inf_Avant') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Tolerance_Surveillance_Inf_Avant] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Consigne_Apres') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Consigne_Apres] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Tolerance_Surveillance_Sup_Apres') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Tolerance_Surveillance_Sup_Apres] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_audit', N'Tolerance_Surveillance_Inf_Apres') IS NULL ALTER TABLE dbo.[t_lieu_planning_audit] ADD [Tolerance_Surveillance_Inf_Apres] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_regle] (
    [Id_Regle] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Actif] BIT NOT NULL DEFAULT(1),
    [Jour_Debut] TINYINT NOT NULL,
    [Heure_Debut] TIME NOT NULL,
    [Jour_Fin] TINYINT NOT NULL,
    [Heure_Fin] TIME NOT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Priorite] INT NOT NULL DEFAULT(0),
    [Tolerance_Sup_Calc] FLOAT NULL,
    [Tolerance_Inf_Calc] FLOAT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    CONSTRAINT [PK_t_lieu_planning_regle] PRIMARY KEY ([Id_Regle])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Id_Regle') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Id_Regle] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Id_Lieu') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Actif') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Actif] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Jour_Debut') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Jour_Debut] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Heure_Debut') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Heure_Debut] TIME NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Jour_Fin') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Jour_Fin] TINYINT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Heure_Fin') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Heure_Fin] TIME NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Consigne') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Consigne] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Consigne_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Consigne_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Priorite') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Priorite] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Tolerance_Sup_Calc') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Tolerance_Sup_Calc] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Tolerance_Inf_Calc') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Tolerance_Inf_Calc] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Date_Maj') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Date_Maj] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_lieu_planning_regle', N'Retard_Alarme_Changement_Consigne') IS NULL ALTER TABLE dbo.[t_lieu_planning_regle] ADD [Retard_Alarme_Changement_Consigne] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_materiel] (
    [Id_Materiel] INT IDENTITY(1,1) NOT NULL,
    [Ref_Commercial] VARCHAR(50) NOT NULL,
    [Designation] VARCHAR(100) NOT NULL,
    [Descriptif] VARCHAR(1000) NOT NULL,
    [Gamme] VARCHAR(10) NOT NULL,
    [Type] VARCHAR(10) NOT NULL,
    [Chemin_Image] VARCHAR(500) NULL,
    CONSTRAINT [PK_t_materiel] PRIMARY KEY ([Id_Materiel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Id_Materiel') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Id_Materiel] INT NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Ref_Commercial') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Ref_Commercial] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Designation') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Designation] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Descriptif') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Descriptif] VARCHAR(1000) NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Gamme') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Gamme] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Type') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Type] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_materiel', N'Chemin_Image') IS NULL ALTER TABLE dbo.[t_materiel] ADD [Chemin_Image] VARCHAR(500) NULL;
GO

IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commande_materiel] (
    [Id_Commande_Materiel] INT IDENTITY(1,1) NOT NULL,
    [Reference_Commande] VARCHAR(64) NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Nom_Demandeur] VARCHAR(255) NOT NULL,
    [Email_Demandeur] VARCHAR(255) NULL,
    [Email_Commercial] VARCHAR(255) NOT NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Mode_Transmission] VARCHAR(64) NOT NULL,
    [Statut_Commande] VARCHAR(64) NOT NULL DEFAULT(N'BROUILLON'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Envoi] DATETIME NULL,
    [Id_Pdf] INT NULL,
    CONSTRAINT [PK_t_commande_materiel] PRIMARY KEY ([Id_Commande_Materiel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Id_Commande_Materiel') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Id_Commande_Materiel] INT NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Reference_Commande') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Reference_Commande] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Nom_Demandeur') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Nom_Demandeur] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Email_Demandeur') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Email_Demandeur] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Email_Commercial') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Email_Commercial] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Commentaire') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Mode_Transmission') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Mode_Transmission] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Statut_Commande') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Statut_Commande] VARCHAR(64) NULL DEFAULT(N'BROUILLON');
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Date_Envoi') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Date_Envoi] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel', N'Id_Pdf') IS NULL ALTER TABLE dbo.[t_commande_materiel] ADD [Id_Pdf] INT NULL;
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_commande_materiel_Reference_Commande' AND object_id = OBJECT_ID(N'dbo.t_commande_materiel')) CREATE UNIQUE INDEX [UX_t_commande_materiel_Reference_Commande] ON dbo.[t_commande_materiel]([Reference_Commande]) WHERE [Reference_Commande] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commande_materiel_ligne] (
    [Id_Commande_Materiel_Ligne] INT IDENTITY(1,1) NOT NULL,
    [Id_Commande_Materiel] INT NOT NULL,
    [Id_Materiel] INT NOT NULL,
    [Ref_Commercial] VARCHAR(100) NOT NULL,
    [Designation] VARCHAR(255) NOT NULL,
    [Descriptif] NVARCHAR(MAX) NULL,
    [Gamme] VARCHAR(50) NULL,
    [Type] VARCHAR(50) NULL,
    [Quantite] INT NOT NULL,
    CONSTRAINT [PK_t_commande_materiel_ligne] PRIMARY KEY ([Id_Commande_Materiel_Ligne])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Id_Commande_Materiel_Ligne') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Id_Commande_Materiel_Ligne] INT NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Id_Commande_Materiel') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Id_Commande_Materiel] INT NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Id_Materiel') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Id_Materiel] INT NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Ref_Commercial') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Ref_Commercial] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Designation') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Designation] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Descriptif') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Descriptif] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Gamme') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Gamme] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Type') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Type] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_commande_materiel_ligne', N'Quantite') IS NULL ALTER TABLE dbo.[t_commande_materiel_ligne] ADD [Quantite] INT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_configuration] (
    [Id_VigiLog_Configuration] INT IDENTITY(1,1) NOT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Description_Configuration] VARCHAR(255) NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Limite_Basse_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT(0),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT(1),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT(1),
    [Actif] BIT NOT NULL DEFAULT(1),
    [Id_Utilisateur_Creation] INT NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Maj] INT NULL,
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_configuration] PRIMARY KEY ([Id_VigiLog_Configuration])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Id_VigiLog_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Id_VigiLog_Configuration] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Nom_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Nom_Configuration] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Description_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Description_Configuration] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Consigne') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Consigne] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Limite_Basse_Active') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Limite_Basse_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Limite_Basse') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Limite_Basse] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Limite_Haute_Active') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Limite_Haute_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Limite_Haute') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Limite_Haute] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Frequence_Min') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Frequence_Min] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Retard_Alarme_Min') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Retard_Alarme_Min] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Delai_Demarrage_Min') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Delai_Demarrage_Min] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Autorise_Arret_Bouton_Stop') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Autorise_Arret_Bouton_Stop] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Reinitialise_Avec_Bouton_Start') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Reinitialise_Avec_Bouton_Start] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Actif') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Actif] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Id_Utilisateur_Creation') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Id_Utilisateur_Creation] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Date_Heure_Creation') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Date_Heure_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Id_Utilisateur_Maj') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Id_Utilisateur_Maj] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_configuration', N'Date_Heure_Maj') IS NULL ALTER TABLE dbo.[t_vigilog_configuration] ADD [Date_Heure_Maj] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_configuration_Nom_Configuration' AND object_id = OBJECT_ID(N'dbo.t_vigilog_configuration')) CREATE UNIQUE INDEX [UX_t_vigilog_configuration_Nom_Configuration] ON dbo.[t_vigilog_configuration]([Nom_Configuration]) WHERE [Nom_Configuration] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog] (
    [Id_VigiLog] INT IDENTITY(1,1) NOT NULL,
    [Numero_Serie] VARCHAR(30) NOT NULL,
    [Modele] VARCHAR(50) NULL,
    [Libelle] VARCHAR(100) NULL,
    [Actif] BIT NOT NULL DEFAULT(1),
    [Date_Etalonnage] DATETIME NULL,
    [Date_Validite] DATE NULL,
    [Duree_Validite_Jours] INT NULL,
    [Err_Justesse] FLOAT NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Creation] INT NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Maj] INT NULL,
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog] PRIMARY KEY ([Id_VigiLog])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Id_VigiLog') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Id_VigiLog] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Numero_Serie') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Numero_Serie] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Modele') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Modele] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Libelle') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Libelle] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Actif') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Actif] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Date_Etalonnage') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Date_Etalonnage] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Date_Validite') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Date_Validite] DATE NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Duree_Validite_Jours') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Duree_Validite_Jours] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Err_Justesse') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Err_Justesse] FLOAT NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Commentaire') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Id_Utilisateur_Creation') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Id_Utilisateur_Creation] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Date_Heure_Creation') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Date_Heure_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Id_Utilisateur_Maj') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Id_Utilisateur_Maj] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog', N'Date_Heure_Maj') IS NULL ALTER TABLE dbo.[t_vigilog] ADD [Date_Heure_Maj] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_vigilog')) CREATE UNIQUE INDEX [UX_t_vigilog_Numero_Serie] ON dbo.[t_vigilog]([Numero_Serie]) WHERE [Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_usage_ponctuel] (
    [Id_VigiLog_Usage_Ponctuel] INT IDENTITY(1,1) NOT NULL,
    [Reference_Usage] VARCHAR(50) NOT NULL,
    [Id_VigiLog_Configuration] INT NULL,
    [Id_VigiLog] INT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Numero_Serie_VigiLog] VARCHAR(30) NOT NULL,
    [Nom_Lieu_Temporaire] VARCHAR(120) NOT NULL,
    [Statut] VARCHAR(30) NOT NULL,
    [Id_Utilisateur_Demarrage] INT NOT NULL,
    [Date_Heure_Demarrage] DATETIME NOT NULL,
    [Commentaire_Demarrage] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Arret] INT NULL,
    [Date_Heure_Arret] DATETIME NULL,
    [Commentaire_Arret] NVARCHAR(MAX) NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_usage_ponctuel] PRIMARY KEY ([Id_VigiLog_Usage_Ponctuel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Id_VigiLog_Usage_Ponctuel') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Id_VigiLog_Usage_Ponctuel] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Reference_Usage') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Reference_Usage] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Id_VigiLog_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Id_VigiLog_Configuration] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Id_VigiLog') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Id_VigiLog] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Nom_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Nom_Configuration] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Numero_Serie_VigiLog') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Numero_Serie_VigiLog] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Nom_Lieu_Temporaire') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Nom_Lieu_Temporaire] VARCHAR(120) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Statut') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Statut] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Id_Utilisateur_Demarrage') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Id_Utilisateur_Demarrage] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Date_Heure_Demarrage') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Date_Heure_Demarrage] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Commentaire_Demarrage') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Commentaire_Demarrage] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Id_Utilisateur_Arret') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Id_Utilisateur_Arret] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Date_Heure_Arret') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Date_Heure_Arret] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Commentaire_Arret') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Commentaire_Arret] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Date_Heure_Creation') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Date_Heure_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_usage_ponctuel', N'Date_Heure_Maj') IS NULL ALTER TABLE dbo.[t_vigilog_usage_ponctuel] ADD [Date_Heure_Maj] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_usage_ponctuel_Reference_Usage' AND object_id = OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel')) CREATE UNIQUE INDEX [UX_t_vigilog_usage_ponctuel_Reference_Usage] ON dbo.[t_vigilog_usage_ponctuel]([Reference_Usage]) WHERE [Reference_Usage] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_tournee] (
    [Id_VigiLog_Tournee] INT IDENTITY(1,1) NOT NULL,
    [Reference_Tournee] VARCHAR(50) NOT NULL,
    [Id_VigiLog_Configuration] INT NULL,
    [Id_VigiLog] INT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Id_Site_Depart] INT NOT NULL,
    [Id_Site_Arrivee] INT NOT NULL,
    [Numero_Serie_VigiLog] VARCHAR(30) NOT NULL,
    [Statut] VARCHAR(30) NOT NULL,
    [Resultat_Feu] VARCHAR(10) NULL,
    [Id_Utilisateur_Depart] INT NOT NULL,
    [Date_Heure_Depart] DATETIME NOT NULL,
    [Id_Utilisateur_Arrivee] INT NULL,
    [Date_Heure_Arrivee] DATETIME NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Limite_Basse_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT(0),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT(1),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT(1),
    [Nb_Mesures] INT NOT NULL DEFAULT(0),
    [Temperature_Min] DECIMAL(10,2) NULL,
    [Temperature_Moyenne] DECIMAL(10,2) NULL,
    [Temperature_Max] DECIMAL(10,2) NULL,
    [Duree_Hors_Limites_Secondes] INT NOT NULL DEFAULT(0),
    [Duree_Alarme_Secondes] INT NOT NULL DEFAULT(0),
    [Est_Depassement_Limites] BIT NOT NULL DEFAULT(0),
    [Est_Alarme] BIT NOT NULL DEFAULT(0),
    [Est_Acquittee] BIT NOT NULL DEFAULT(0),
    [Commentaire] NVARCHAR(MAX) NULL,
    [Commentaire_Acquittement] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Acquittement] INT NULL,
    [Date_Heure_Acquittement] DATETIME NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_tournee] PRIMARY KEY ([Id_VigiLog_Tournee])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_VigiLog_Tournee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_VigiLog_Tournee] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Reference_Tournee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Reference_Tournee] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_VigiLog_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_VigiLog_Configuration] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_VigiLog') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_VigiLog] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Nom_Configuration') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Nom_Configuration] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_Site_Depart') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_Site_Depart] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_Site_Arrivee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_Site_Arrivee] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Numero_Serie_VigiLog') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Numero_Serie_VigiLog] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Statut') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Statut] VARCHAR(30) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Resultat_Feu') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Resultat_Feu] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_Utilisateur_Depart') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_Utilisateur_Depart] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Date_Heure_Depart') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Date_Heure_Depart] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_Utilisateur_Arrivee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_Utilisateur_Arrivee] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Date_Heure_Arrivee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Date_Heure_Arrivee] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Consigne') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Consigne] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Limite_Basse_Active') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Limite_Basse_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Limite_Basse') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Limite_Basse] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Limite_Haute_Active') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Limite_Haute_Active] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Limite_Haute') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Limite_Haute] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Frequence_Min') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Frequence_Min] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Retard_Alarme_Min') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Retard_Alarme_Min] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Delai_Demarrage_Min') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Delai_Demarrage_Min] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Autorise_Arret_Bouton_Stop') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Autorise_Arret_Bouton_Stop] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Reinitialise_Avec_Bouton_Start') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Reinitialise_Avec_Bouton_Start] BIT NULL DEFAULT(1);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Nb_Mesures') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Nb_Mesures] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Temperature_Min') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Temperature_Min] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Temperature_Moyenne') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Temperature_Moyenne] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Temperature_Max') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Temperature_Max] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Duree_Hors_Limites_Secondes') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Duree_Hors_Limites_Secondes] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Duree_Alarme_Secondes') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Duree_Alarme_Secondes] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Est_Depassement_Limites') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Est_Depassement_Limites] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Est_Alarme') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Est_Alarme] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Est_Acquittee') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Est_Acquittee] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Commentaire') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Commentaire_Acquittement') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Commentaire_Acquittement] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Id_Utilisateur_Acquittement') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Id_Utilisateur_Acquittement] INT NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Date_Heure_Acquittement') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Date_Heure_Acquittement] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Date_Heure_Creation') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Date_Heure_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_vigilog_tournee', N'Date_Heure_Maj') IS NULL ALTER TABLE dbo.[t_vigilog_tournee] ADD [Date_Heure_Maj] DATETIME NULL;
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_tournee_Reference_Tournee' AND object_id = OBJECT_ID(N'dbo.t_vigilog_tournee')) CREATE UNIQUE INDEX [UX_t_vigilog_tournee_Reference_Tournee] ON dbo.[t_vigilog_tournee]([Reference_Tournee]) WHERE [Reference_Tournee] IS NOT NULL;
GO

IF DB_ID(N'vigi_mesures') IS NULL
BEGIN
  CREATE DATABASE [vigi_mesures];
END;
GO
USE [vigi_mesures];
GO

IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_graphique] (
    [Id_Graphique] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Id_Sonde] INT NULL,
    [Id_Lieu] INT NOT NULL,
    [Est_Valeur_Null] BIT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] TINYINT NOT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    CONSTRAINT [PK_tm_graphique] PRIMARY KEY ([Id_Graphique], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null], [Est_Etat_Alarme])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Id_Graphique') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Id_Graphique] INT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Date_Heure_Mesure') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Date_Heure_Mesure] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Valeur') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Nb_Decimal') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Nb_Decimal] INT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Consigne') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Consigne] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Consigne_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Consigne_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Unite') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Adresse_Sonde') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Adresse_Sonde] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Id_Sonde') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Id_Sonde] INT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Id_Lieu') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Est_Valeur_Null] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Frequence') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Frequence] INT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Est_Etat_Alarme') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Est_Etat_Alarme] TINYINT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Consigne_Inf_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Consigne_Inf_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_graphique', N'Consigne_Sup_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_graphique] ADD [Consigne_Sup_Pre_Alarme] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal] (
    [Id_Serveur_BDD] INT NOT NULL,
    [Id_Journal] INT IDENTITY(1,1) NOT NULL,
    [Code_Journal] VARCHAR(50) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Nom_Utilisateur] VARCHAR(50) NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Journal] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Commentaire_Utilisateur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_journal] PRIMARY KEY ([Id_Serveur_BDD], [Id_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Id_Serveur_BDD] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Id_Journal') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Id_Journal] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Code_Journal') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Code_Journal] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Commentaire') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Nom_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Nom_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Profil_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Profil_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Date_Heure_Journal') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Date_Heure_Journal] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Id_Lieu') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal', N'Commentaire_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal] ADD [Commentaire_Utilisateur] NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID(N'dbo.tm_journal_code', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_code] (
    [Code_Journal] VARCHAR(50) NOT NULL,
    [Commentaire] VARCHAR(200) NULL,
    CONSTRAINT [PK_tm_journal_code] PRIMARY KEY ([Code_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_journal_code', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_code', N'Code_Journal') IS NULL ALTER TABLE dbo.[tm_journal_code] ADD [Code_Journal] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal_code', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_code', N'Commentaire') IS NULL ALTER TABLE dbo.[tm_journal_code] ADD [Commentaire] VARCHAR(200) NULL;
GO

IF OBJECT_ID(N'dbo.tm_compteur_id_table', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_compteur_id_table] (
    [Id_Serveur_BDD] INT NOT NULL,
    [Nom_Table] VARCHAR(100) NOT NULL,
    [Compteur_Id] INT NULL,
    CONSTRAINT [PK_tm_compteur_id_table] PRIMARY KEY ([Id_Serveur_BDD], [Nom_Table])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_compteur_id_table', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_compteur_id_table', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_compteur_id_table] ADD [Id_Serveur_BDD] INT NULL;
IF OBJECT_ID(N'dbo.tm_compteur_id_table', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_compteur_id_table', N'Nom_Table') IS NULL ALTER TABLE dbo.[tm_compteur_id_table] ADD [Nom_Table] VARCHAR(100) NULL;
IF OBJECT_ID(N'dbo.tm_compteur_id_table', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_compteur_id_table', N'Compteur_Id') IS NULL ALTER TABLE dbo.[tm_compteur_id_table] ADD [Compteur_Id] INT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures] (
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Est_Valeur_Memoire] BIT NOT NULL DEFAULT(0),
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Id_Lieu] INT NOT NULL DEFAULT(0),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] BIT NOT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    [Rssi] VARCHAR(10) NULL,
    [Tension] VARCHAR(10) NULL,
    CONSTRAINT [PK_tm_mesures] PRIMARY KEY ([Id_Serveur_BDD], [Id_Mesure], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Id_Mesure') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Id_Mesure] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Date_Heure_Mesure') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Date_Heure_Mesure] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Valeur') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Est_Valeur_Memoire') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Est_Valeur_Memoire] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Nb_Decimal') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Nb_Decimal] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Consigne') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Consigne] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Consigne_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Consigne_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Unite') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Adresse_Sonde') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Adresse_Sonde] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Id_Lieu') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Id_Lieu] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Est_Valeur_Null] TINYINT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Frequence') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Frequence] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Est_Etat_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Est_Etat_Alarme] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Consigne_Inf_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Consigne_Inf_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Consigne_Sup_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Consigne_Sup_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Moyenne') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Moyenne] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Rssi') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Rssi] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures', N'Tension') IS NULL ALTER TABLE dbo.[tm_mesures] ADD [Tension] VARCHAR(10) NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso] (
    [Id_mesures_gso] INT IDENTITY(1,1) NOT NULL,
    [id_capteur] VARCHAR(50) NOT NULL,
    [tep] FLOAT NULL,
    [unite] VARCHAR(10) NULL,
    [date_mesure] DATETIME NOT NULL,
    [rssi] VARCHAR(10) NULL,
    [tension] VARCHAR(10) NULL,
    CONSTRAINT [PK_tm_mesures_gso] PRIMARY KEY ([id_capteur], [date_mesure])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'Id_mesures_gso') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [Id_mesures_gso] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'id_capteur') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [id_capteur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'tep') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [tep] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'unite') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'date_mesure') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [date_mesure] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'rssi') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [rssi] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_gso', N'tension') IS NULL ALTER TABLE dbo.[tm_mesures_gso] ADD [tension] VARCHAR(10) NULL;
GO

IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_histo] (
    [Id_Journal_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Id_Journal] INT NOT NULL DEFAULT(0),
    [Code_Journal] VARCHAR(50) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Nom_Utilisateur] VARCHAR(50) NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Journal] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Commentaire_Utilisateur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_journal_histo] PRIMARY KEY ([Id_Journal_Histo], [Id_Serveur_BDD], [Id_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Id_Journal_Histo') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Id_Journal_Histo] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Id_Journal') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Id_Journal] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Code_Journal') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Code_Journal] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Commentaire') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Nom_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Nom_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Profil_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Profil_Utilisateur] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Date_Heure_Journal') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Date_Heure_Journal] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Id_Lieu') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Id_Lieu] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_histo', N'Commentaire_Utilisateur') IS NULL ALTER TABLE dbo.[tm_journal_histo] ADD [Commentaire_Utilisateur] NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesure_calibrage] (
    [Id_Mesure_Calibrage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur] FLOAT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL DEFAULT(0),
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL,
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_tm_mesure_calibrage] PRIMARY KEY ([Id_Mesure_Calibrage], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Id_Mesure_Calibrage') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Id_Mesure_Calibrage] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Valeur') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Valeur] FLOAT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Valeur_Brute] FLOAT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Est_Valeur_Null] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage] ADD [Date_Heure] DATETIME NULL DEFAULT(GETDATE());
GO

IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesure_calibrage_etalon] (
    [Id_Mesure_Calibrage_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur] FLOAT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL DEFAULT(0),
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL,
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_tm_mesure_calibrage_etalon] PRIMARY KEY ([Id_Mesure_Calibrage_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Id_Mesure_Calibrage_Etalon') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Id_Mesure_Calibrage_Etalon] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Valeur') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Valeur] FLOAT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Valeur_Brute] FLOAT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Est_Valeur_Null] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_calibrage_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_calibrage_etalon', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesure_calibrage_etalon] ADD [Date_Heure] DATETIME NULL DEFAULT(GETDATE());
GO

IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesure_etalon] (
    [Id_Mesure_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL,
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL,
    [Message_Erreur] VARCHAR(50) NOT NULL,
    CONSTRAINT [PK_tm_mesure_etalon] PRIMARY KEY ([Id_Mesure_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Id_Mesure_Etalon') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Id_Mesure_Etalon] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Est_Valeur_Null] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Date_Heure] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalon', N'Message_Erreur') IS NULL ALTER TABLE dbo.[tm_mesure_etalon] ADD [Message_Erreur] VARCHAR(50) NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesure_etalonnage] (
    [Id_Mesure_Etalonnage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Sonde_Numero_serie] VARCHAR(50) NULL,
    [Numero_Ordre] INT NULL,
    [Mesure_Sonde] FLOAT NULL,
    [Mesure_Etalon] FLOAT NULL,
    [Date_Heure] DATETIME NULL,
    CONSTRAINT [PK_tm_mesure_etalonnage] PRIMARY KEY ([Id_Mesure_Etalonnage], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Id_Mesure_Etalonnage') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Id_Mesure_Etalonnage] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Sonde_Numero_serie') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Sonde_Numero_serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Numero_Ordre') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Numero_Ordre] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Mesure_Sonde') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Mesure_Sonde] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Mesure_Etalon') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Mesure_Etalon] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesure_etalonnage', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesure_etalonnage', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesure_etalonnage] ADD [Date_Heure] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_histo] (
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Nb_decimal] TINYINT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Id_Lieu] INT NOT NULL DEFAULT(0),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_En_Alarme] BIT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_histo] PRIMARY KEY ([Id_Mesure], [Id_Serveur_BDD], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Id_Mesure') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Id_Mesure] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Date_Heure_Mesure') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Date_Heure_Mesure] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Valeur') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Valeur] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Nb_decimal') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Nb_decimal] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Consigne') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Consigne] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Consigne_Sup') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Consigne_Sup] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Consigne_Inf') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Consigne_Inf] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Unite') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Unite] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Id_Lieu') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Id_Lieu] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Est_Valeur_Null] TINYINT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Frequence') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Frequence] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Est_En_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Est_En_Alarme] BIT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Consigne_Inf_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Consigne_Inf_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Consigne_Sup_Pre_Alarme') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Consigne_Sup_Pre_Alarme] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_histo', N'Moyenne') IS NULL ALTER TABLE dbo.[tm_mesures_histo] ADD [Moyenne] FLOAT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test] (
    [Id_Mesure_Test] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL,
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT(0),
    [Nombre_Recu] INT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_test] PRIMARY KEY ([Id_Mesure_Test], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Id_Mesure_Test') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Id_Mesure_Test] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Sonde_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Sonde_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Est_Valeur_Null] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Date_Heure] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Nombre_Total') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Nombre_Total] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test', N'Nombre_Recu') IS NULL ALTER TABLE dbo.[tm_mesures_test] ADD [Nombre_Recu] INT NULL DEFAULT(0);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_tm_mesures_test_Sonde_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.tm_mesures_test')) CREATE UNIQUE INDEX [UX_tm_mesures_test_Sonde_Numero_Serie] ON dbo.[tm_mesures_test]([Sonde_Numero_Serie]) WHERE [Sonde_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test_etalon] (
    [Id_Mesure_Test_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL,
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT(0),
    [Nombre_Recu] INT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_test_etalon] PRIMARY KEY ([Id_Mesure_Test_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Id_Mesure_Test_Etalon') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Id_Mesure_Test_Etalon] INT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Id_Serveur_BDD') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Id_Serveur_BDD] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Valeur_Brute') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Valeur_Brute] FLOAT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Etalon_Numero_Serie') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Etalon_Numero_Serie] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Est_Valeur_Null') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Est_Valeur_Null] TINYINT NULL;
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Date_Heure') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Date_Heure] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Nombre_Total') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Nombre_Total] INT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mesures_test_etalon', N'Nombre_Recu') IS NULL ALTER TABLE dbo.[tm_mesures_test_etalon] ADD [Nombre_Recu] INT NULL DEFAULT(0);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_tm_mesures_test_etalon_Etalon_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.tm_mesures_test_etalon')) CREATE UNIQUE INDEX [UX_tm_mesures_test_etalon_Etalon_Numero_Serie] ON dbo.[tm_mesures_test_etalon]([Etalon_Numero_Serie]) WHERE [Etalon_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mode_degrade] (
    [Id_Mode_Degrade] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Date_Heure_Creation] DATETIME NULL,
    [Requete_SQL] VARCHAR(500) NULL,
    [Est_Archivee] BIT NOT NULL DEFAULT(0),
    [Date_Heure_Archive] DATETIME NULL,
    CONSTRAINT [PK_tm_mode_degrade] PRIMARY KEY ([Id_Mode_Degrade])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Id_Mode_Degrade') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Id_Mode_Degrade] INT NULL;
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Date_Heure_Creation') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Date_Heure_Creation] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Requete_SQL') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Requete_SQL] VARCHAR(500) NULL;
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Est_Archivee') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Est_Archivee] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_mode_degrade', N'Date_Heure_Archive') IS NULL ALTER TABLE dbo.[tm_mode_degrade] ADD [Date_Heure_Archive] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_parametre] (
    [Id_Parametre] INT IDENTITY(1,1) NOT NULL,
    [Cle_Parametre] VARCHAR(20) NOT NULL,
    [Valeur_Parametre] VARCHAR(50) NULL,
    [Groupe_Parametre] VARCHAR(50) NULL,
    [Commentaire_Parametre] VARCHAR(100) NULL,
    CONSTRAINT [PK_tm_parametre] PRIMARY KEY ([Id_Parametre], [Cle_Parametre])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_parametre', N'Id_Parametre') IS NULL ALTER TABLE dbo.[tm_parametre] ADD [Id_Parametre] INT NULL;
IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_parametre', N'Cle_Parametre') IS NULL ALTER TABLE dbo.[tm_parametre] ADD [Cle_Parametre] VARCHAR(20) NULL;
IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_parametre', N'Valeur_Parametre') IS NULL ALTER TABLE dbo.[tm_parametre] ADD [Valeur_Parametre] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_parametre', N'Groupe_Parametre') IS NULL ALTER TABLE dbo.[tm_parametre] ADD [Groupe_Parametre] VARCHAR(50) NULL;
IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_parametre', N'Commentaire_Parametre') IS NULL ALTER TABLE dbo.[tm_parametre] ADD [Commentaire_Parametre] VARCHAR(100) NULL;
GO

IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_vigilog_mesure] (
    [Id_VigiLog_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_VigiLog_Tournee] INT NOT NULL,
    [Numero_Ordre] INT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] DECIMAL(10,2) NULL,
    [Est_Hors_Limites] BIT NOT NULL DEFAULT(0),
    [Est_En_Alarme] BIT NOT NULL DEFAULT(0),
    [Est_Marqueur] BIT NOT NULL DEFAULT(0),
    [Details] VARCHAR(200) NULL,
    [Date_Heure_Import] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_tm_vigilog_mesure] PRIMARY KEY ([Id_VigiLog_Mesure])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Id_VigiLog_Mesure') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Id_VigiLog_Mesure] INT NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Id_VigiLog_Tournee') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Id_VigiLog_Tournee] INT NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Numero_Ordre') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Numero_Ordre] INT NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Date_Heure_Mesure') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Date_Heure_Mesure] DATETIME NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Valeur') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Valeur] DECIMAL(10,2) NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Est_Hors_Limites') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Est_Hors_Limites] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Est_En_Alarme') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Est_En_Alarme] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Est_Marqueur') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Est_Marqueur] BIT NULL DEFAULT(0);
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Details') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Details] VARCHAR(200) NULL;
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_vigilog_mesure', N'Date_Heure_Import') IS NULL ALTER TABLE dbo.[tm_vigilog_mesure] ADD [Date_Heure_Import] DATETIME NULL DEFAULT(GETDATE());
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_tm_vigilog_mesure_unique' AND object_id = OBJECT_ID(N'dbo.tm_vigilog_mesure')) CREATE UNIQUE INDEX [UK_tm_vigilog_mesure_unique] ON dbo.[tm_vigilog_mesure]([Id_VigiLog_Tournee], [Date_Heure_Mesure], [Numero_Ordre]);
GO

IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_commentaire_libre] (
    [Id_Commentaire_Journal] INT IDENTITY(1,1) NOT NULL,
    [Code_Journal] VARCHAR(32) NOT NULL,
    [Commentaire] NVARCHAR(MAX) NOT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Modification] DATETIME NULL,
    CONSTRAINT [PK_tm_journal_commentaire_libre] PRIMARY KEY ([Id_Commentaire_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_commentaire_libre', N'Id_Commentaire_Journal') IS NULL ALTER TABLE dbo.[tm_journal_commentaire_libre] ADD [Id_Commentaire_Journal] INT NULL;
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_commentaire_libre', N'Code_Journal') IS NULL ALTER TABLE dbo.[tm_journal_commentaire_libre] ADD [Code_Journal] VARCHAR(32) NULL;
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_commentaire_libre', N'Commentaire') IS NULL ALTER TABLE dbo.[tm_journal_commentaire_libre] ADD [Commentaire] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_commentaire_libre', N'Date_Creation') IS NULL ALTER TABLE dbo.[tm_journal_commentaire_libre] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.tm_journal_commentaire_libre', N'Date_Modification') IS NULL ALTER TABLE dbo.[tm_journal_commentaire_libre] ADD [Date_Modification] DATETIME NULL;
GO

IF DB_ID(N'vigi_chat') IS NULL
BEGIN
  CREATE DATABASE [vigi_chat];
END;
GO
USE [vigi_chat];
GO

IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_conversation] (
    [Id_Conversation] INT IDENTITY(1,1) NOT NULL,
    [Type] VARCHAR(10) NOT NULL,
    [Titre] VARCHAR(128) NULL,
    [DM_Key] VARCHAR(64) NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_conversation] PRIMARY KEY ([Id_Conversation])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation', N'Id_Conversation') IS NULL ALTER TABLE dbo.[t_conversation] ADD [Id_Conversation] INT NULL;
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation', N'Type') IS NULL ALTER TABLE dbo.[t_conversation] ADD [Type] VARCHAR(10) NULL;
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation', N'Titre') IS NULL ALTER TABLE dbo.[t_conversation] ADD [Titre] VARCHAR(128) NULL;
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation', N'DM_Key') IS NULL ALTER TABLE dbo.[t_conversation] ADD [DM_Key] VARCHAR(64) NULL;
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_conversation] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
GO
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_conversation_DM_Key' AND object_id = OBJECT_ID(N'dbo.t_conversation')) CREATE UNIQUE INDEX [UX_t_conversation_DM_Key] ON dbo.[t_conversation]([DM_Key]) WHERE [DM_Key] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_conversation_participant] (
    [Id_Participant] INT IDENTITY(1,1) NOT NULL,
    [Id_Conversation] INT NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Last_Read_Msg_Id] INT NULL,
    [Date_Ajout] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_conversation_participant] PRIMARY KEY ([Id_Participant])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation_participant', N'Id_Participant') IS NULL ALTER TABLE dbo.[t_conversation_participant] ADD [Id_Participant] INT NULL;
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation_participant', N'Id_Conversation') IS NULL ALTER TABLE dbo.[t_conversation_participant] ADD [Id_Conversation] INT NULL;
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation_participant', N'Id_Utilisateur') IS NULL ALTER TABLE dbo.[t_conversation_participant] ADD [Id_Utilisateur] INT NULL;
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation_participant', N'Last_Read_Msg_Id') IS NULL ALTER TABLE dbo.[t_conversation_participant] ADD [Last_Read_Msg_Id] INT NULL;
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_conversation_participant', N'Date_Ajout') IS NULL ALTER TABLE dbo.[t_conversation_participant] ADD [Date_Ajout] DATETIME NULL DEFAULT(GETDATE());
GO
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_t_conversation_participant_1' AND object_id = OBJECT_ID(N'dbo.t_conversation_participant')) CREATE UNIQUE INDEX [UK_t_conversation_participant_1] ON dbo.[t_conversation_participant]([Id_Conversation], [Id_Utilisateur]);
GO

IF OBJECT_ID(N'dbo.t_message', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_message] (
    [Id_Message] INT IDENTITY(1,1) NOT NULL,
    [Id_Conversation] INT NOT NULL,
    [Sender_Id] INT NOT NULL,
    [Contenu] NVARCHAR(MAX) NOT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Modification] DATETIME NULL,
    [Date_Suppression] DATETIME NULL,
    CONSTRAINT [PK_t_message] PRIMARY KEY ([Id_Message])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Id_Message') IS NULL ALTER TABLE dbo.[t_message] ADD [Id_Message] INT NULL;
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Id_Conversation') IS NULL ALTER TABLE dbo.[t_message] ADD [Id_Conversation] INT NULL;
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Sender_Id') IS NULL ALTER TABLE dbo.[t_message] ADD [Sender_Id] INT NULL;
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Contenu') IS NULL ALTER TABLE dbo.[t_message] ADD [Contenu] NVARCHAR(MAX) NULL;
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Date_Creation') IS NULL ALTER TABLE dbo.[t_message] ADD [Date_Creation] DATETIME NULL DEFAULT(GETDATE());
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Date_Modification') IS NULL ALTER TABLE dbo.[t_message] ADD [Date_Modification] DATETIME NULL;
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message', N'Date_Suppression') IS NULL ALTER TABLE dbo.[t_message] ADD [Date_Suppression] DATETIME NULL;
GO

IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_message_attachment] (
    [Id_Attachment] INT IDENTITY(1,1) NOT NULL,
    [Id_Message] INT NOT NULL,
    [File_Name] VARCHAR(255) NOT NULL,
    [File_Path] VARCHAR(512) NOT NULL,
    [File_Size] INT NOT NULL,
    [Mime_Type] VARCHAR(128) NOT NULL,
    [Date_Upload] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_message_attachment] PRIMARY KEY ([Id_Attachment])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'Id_Attachment') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [Id_Attachment] INT NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'Id_Message') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [Id_Message] INT NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'File_Name') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [File_Name] VARCHAR(255) NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'File_Path') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [File_Path] VARCHAR(512) NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'File_Size') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [File_Size] INT NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'Mime_Type') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [Mime_Type] VARCHAR(128) NULL;
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.t_message_attachment', N'Date_Upload') IS NULL ALTER TABLE dbo.[t_message_attachment] ADD [Date_Upload] DATETIME NULL DEFAULT(GETDATE());
GO

USE [vigi_main];
GO

-- Donnees minimales obligatoires main
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'Administrateurs') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'Administrateurs', NULL, 0, 0);
GO
DECLARE @BootstrapAuth TABLE (Code NVARCHAR(50), Libelle NVARCHAR(100));
INSERT INTO @BootstrapAuth (Code, Libelle) VALUES
(N'ACCES_DASHBOARD_UTILISATEUR',N'Acces dashboard utilisateur'),
(N'ACCES_TABLEAU_BORD_UTILISATEUR',N'Acces tableau de bord utilisateur'),
(N'ACCES_DASHBOARD_USER',N'Acces dashboard user'),
(N'ACCES_SURVEILLANCE',N'Acces surveillance'),
(N'LIEU_VISUALISER',N'Visualiser les lieux'),
(N'ALARMES_GERER',N'Gerer les alarmes'),
(N'ACCES_DASHBOARD_ADMIN',N'Acces dashboard admin'),
(N'ACCES_TABLEAU_BORD_ADMIN',N'Acces tableau de bord admin'),
(N'ACCES_ADMIN',N'Acces admin'),
(N'ACCES_PARAMETRAGE_GENERAL',N'Acces parametrage general'),
(N'PARAMETRAGE_GENERAL',N'Parametrage general'),
(N'GERER_PROFIL',N'Gerer les profils'),
(N'PARAMETRES_GERER',N'Gerer les parametres'),
(N'ACQUITTER_ALARME',N'Acquitter alarme'),
(N'ACCES_ACQUITTEMENT_ALARME',N'Acces acquittement alarme'),
(N'DESACTIVER_LIEU',N'Desactiver lieu'),
(N'ACCES_DESACTIVATION_LIEU',N'Acces desactivation lieu'),
(N'LIEU_ACTIV_DESACT',N'Activer/desactiver lieu'),
(N'PARAMETRER_LIEU',N'Parametrer lieu'),
(N'ACCES_PARAMETRAGE_LIEU',N'Acces parametrage lieu'),
(N'LIEU_GERER',N'Gerer les lieux'),
(N'PARAMETRAGE_MATERIEL',N'Parametrage materiel'),
(N'ACCES_PARAMETRAGE_MATERIEL',N'Acces parametrage materiel'),
(N'ACCES_METROLOGIE',N'Acces metrologie'),
(N'ACCES_CONVERSATION',N'Acces conversation'),
(N'MODULE_CONVERSATION',N'Module conversation'),
(N'REALISER_AJUSTAGE_ETALONNAGE',N'Realiser ajustage etalonnage'),
(N'ACCES_AJUSTAGE_ETALONNAGE',N'Acces ajustage etalonnage');
INSERT INTO dbo.t_autorisation (Code_Autorisation, Libelle_Autorisation, Commentaire) SELECT Code, Libelle, Libelle FROM @BootstrapAuth a WHERE NOT EXISTS (SELECT 1 FROM dbo.t_autorisation x WHERE x.Code_Autorisation = a.Code);
GO
DECLARE @AdminProfilId INT = (SELECT TOP 1 Id_Profil FROM dbo.t_profil WHERE Profil_Utilisateur = N'Administrateurs');
INSERT INTO dbo.t_liaison_profil_autorisation (Id_Profil, Id_Autorisation) SELECT @AdminProfilId, a.Id_Autorisation FROM dbo.t_autorisation a WHERE @AdminProfilId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.t_liaison_profil_autorisation l WHERE l.Id_Profil = @AdminProfilId AND l.Id_Autorisation = a.Id_Autorisation);
GO
IF NOT EXISTS (SELECT 1 FROM dbo.t_utilisateur WHERE Login = N'admin') INSERT INTO dbo.t_utilisateur (Login, Mot_De_Passe, Est_Archive, Profil_Utilisateur, Est_Mot_De_Passe_Temporaire, Date_Creation, Date_Derniere_Modification_MDP) VALUES (N'admin', N'$2b$10$EPQPVuaZ6RX4JhMpgR8BD.44ZEuC9OsH7hRMdt2j/GO64eWJcA7.W', 0, N'Administrateurs', 1, CAST(GETDATE() AS DATE), GETDATE());
ELSE UPDATE dbo.t_utilisateur SET Mot_De_Passe = N'$2b$10$EPQPVuaZ6RX4JhMpgR8BD.44ZEuC9OsH7hRMdt2j/GO64eWJcA7.W', Est_Mot_De_Passe_Temporaire = 1, Profil_Utilisateur = COALESCE(Profil_Utilisateur, N'Administrateurs'), Est_Archive = 0 WHERE Login = N'admin' AND (Mot_De_Passe IS NULL OR Est_Mot_De_Passe_Temporaire = 1);
GO

USE [vigi_main];
GO

-- =====================================================================
-- ALIGNEMENT SQL SERVER <-> SCHEMA PRISMA (Mise a jour 2026-02)
-- Script idempotent (complement de seed)
-- =====================================================================

-- t_autorisation: suppression anciens flags
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Admin') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Admin;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Metrologie') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Metrologie;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Surveillance') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Surveillance;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_VigiLog') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_VigiLog;
GO

-- t_lieu
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Sup_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Sup_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Inf_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Inf_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Tolerance_Surveillance_Sup_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Tolerance_Surveillance_Sup_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Tolerance_Surveillance_Inf_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Tolerance_Surveillance_Inf_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Planning_Actif') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Actif BIT NOT NULL CONSTRAINT DF_t_lieu_Planning_Actif DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Planning_Regle_Existe') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Regle_Existe BIT NOT NULL CONSTRAINT DF_t_lieu_Planning_Regle_Existe DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Planning_Source_Regle_Id') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Source_Regle_Id INT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Planning_Derniere_Maj') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Derniere_Maj DATETIME NULL;
IF COL_LENGTH('dbo.t_lieu', 'Est_Redeclenchement_Immediat') IS NULL ALTER TABLE dbo.t_lieu ADD Est_Redeclenchement_Immediat BIT NOT NULL CONSTRAINT DF_t_lieu_Est_Redeclenchement_Immediat DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Nb_Mesures_Temporisation_Redeclenchement') IS NULL ALTER TABLE dbo.t_lieu ADD Nb_Mesures_Temporisation_Redeclenchement INT NULL CONSTRAINT DF_t_lieu_Nb_Mesures_Temporisation_Redeclenchement DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Surveillance_Etat') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Surveillance_Etat;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Sup_Corrigee') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Consigne_Sup_Corrigee;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Inf_Corrigee') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Consigne_Inf_Corrigee;
IF OBJECT_ID('dbo.t_lieu_planning_regle', 'U') IS NOT NULL
BEGIN
  UPDATE l
  SET Planning_Regle_Existe = CASE
    WHEN EXISTS (SELECT 1 FROM dbo.t_lieu_planning_regle r WHERE r.Id_Lieu = l.Id_Lieu) THEN 1
    ELSE 0
  END
  FROM dbo.t_lieu l;
END;
GO

-- t_module / t_parametre / t_utilisateur
IF COL_LENGTH('dbo.t_module', 'Est_Module_GSO') IS NULL ALTER TABLE dbo.t_module ADD Est_Module_GSO BIT NOT NULL CONSTRAINT DF_t_module_Est_Module_GSO DEFAULT(0);
IF COL_LENGTH('dbo.t_module', 'Port_Serie_Send_GSO') IS NULL ALTER TABLE dbo.t_module ADD Port_Serie_Send_GSO VARCHAR(10) NULL;
IF COL_LENGTH('dbo.t_parametre', 'Champ_DATETIME') IS NULL ALTER TABLE dbo.t_parametre ADD Champ_DATETIME DATETIME NULL;
IF COL_LENGTH('dbo.t_utilisateur', 'Avatar_Utilisateur') IS NULL ALTER TABLE dbo.t_utilisateur ADD Avatar_Utilisateur VARCHAR(512) NULL;
GO

-- t_sonde / t_sonde_type
IF OBJECT_ID('dbo.t_sonde', 'U') IS NOT NULL
BEGIN
  IF COL_LENGTH('dbo.t_sonde', 'Sonde_Type') IS NULL ALTER TABLE dbo.t_sonde ADD Sonde_Type VARCHAR(50) NULL;
  IF COL_LENGTH('dbo.t_sonde', 'Est_Sonde_GSO') IS NULL ALTER TABLE dbo.t_sonde ADD Est_Sonde_GSO BIT NOT NULL CONSTRAINT DF_t_sonde_Est_Sonde_GSO DEFAULT(0);
END;
GO
IF OBJECT_ID('dbo.t_sonde_type', 'U') IS NOT NULL
BEGIN
  IF COL_LENGTH('dbo.t_sonde_type', 'Est_Double_Capteur') IS NULL ALTER TABLE dbo.t_sonde_type ADD Est_Double_Capteur BIT NOT NULL CONSTRAINT DF_t_sonde_type_Est_Double_Capteur DEFAULT(0);
  IF COL_LENGTH('dbo.t_sonde_type', 'Famille_Sonde') IS NULL ALTER TABLE dbo.t_sonde_type ADD Famille_Sonde VARCHAR(16) NOT NULL CONSTRAINT DF_t_sonde_type_Famille_Sonde DEFAULT('CLASSIC');

  MERGE dbo.t_sonde_type AS target
  USING (VALUES
    (1,'E','Sonde radio relais type E',1,0,'CLASSIC'),
    (2,'G','Sonde radio relais type G',1,0,'CLASSIC'),
    (3,'H','Sonde radio relais type H',1,0,'CLASSIC'),
    (4,'I','Sonde radio de type I',0,0,'CLASSIC'),
    (5,'R','Sonde radio',0,0,'CLASSIC'),
    (6,'V','Sonde filaire',0,0,'CLASSIC'),
    (9,'SOIT','Gemsense One Temperature interne',0,0,'GSO'),
    (10,'SOIH','Gemsense One Temperature & humidite interne',0,1,'GSO'),
    (11,'SOET','Gemsense One Temperature externe',0,0,'GSO'),
    (12,'SOEH','Gemsense One Temperature & humidite externe',0,1,'GSO'),
    (13,'SPNB','Gemsense Pro Numerique blanc',0,0,'GSP'),
    (14,'SPNG','Gemsense Pro Numerique gris',0,0,'GSP'),
    (15,'SPPS','Gemsense Pro platine',0,0,'GSP'),
    (16,'SPAL','Gemsense Pro platine alimentaire',0,0,'GSP'),
    (17,'SPPC','Gemsense Pro platine contact',0,0,'GSP'),
    (18,'SPAU','Gemsense Pro platine autoclave',0,0,'GSP'),
    (19,'SPCF','Gemsense Pro platine chambre froide',0,0,'GSP'),
    (20,'SPMI','Gemsense Pro platine micro-capteur',0,0,'GSP'),
    (21,'SPCO','Gemsense Pro CO2',0,0,'GSP'),
    (22,'SPHY','Gemsense Pro hygrometrie',0,0,'GSP'),
    (23,'SPTH','Gemsense Pro thermocouple',0,0,'GSP'),
    (24,'SPDI','Gemsense Pro pression differentielle',0,0,'GSP'),
    (25,'SPAT','Gemsense Pro pression atmospherique',0,0,'GSP'),
    (26,'SPLU','Gemsense Pro lumiere',0,0,'GSP'),
    (27,'SP01','Gemsense Pro 0-1 Volt',0,0,'GSP'),
    (28,'SP42','Gemsense Pro 4-20 mA',0,0,'GSP'),
    (29,'SPOF','Gemsense Pro NO NF',0,0,'GSP'),
    (30,'SPXB','Gemsense Pro Ethernet numerique blanc',0,0,'GSP'),
    (31,'SPXG','Gemsense Pro Ethernet numerique gris',0,0,'GSP'),
    (32,'SPXP','Gemsense Pro Ethernet platine',0,0,'GSP'),
    (33,'SPFB','Gemsense Pro filaire numerique blanc',0,0,'GSP'),
    (34,'SPFG','Gemsense Pro filaire numerique gris',0,0,'GSP'),
    (35,'SPFP','Gemsense Pro filaire platine',0,0,'GSP')
  ) AS source (Id_Sonde_Type, Sonde_Type, Libelle_Sonde_Type, Est_Gestion_Relais, Est_Double_Capteur, Famille_Sonde)
  ON target.Sonde_Type = source.Sonde_Type
  WHEN MATCHED THEN
    UPDATE SET
      target.Libelle_Sonde_Type = source.Libelle_Sonde_Type,
      target.Est_Gestion_Relais = source.Est_Gestion_Relais,
      target.Est_Double_Capteur = source.Est_Double_Capteur,
      target.Famille_Sonde = source.Famille_Sonde
  WHEN NOT MATCHED BY TARGET THEN
    INSERT (Sonde_Type, Libelle_Sonde_Type, Est_Gestion_Relais, Est_Double_Capteur, Famille_Sonde)
    VALUES (source.Sonde_Type, source.Libelle_Sonde_Type, source.Est_Gestion_Relais, source.Est_Double_Capteur, source.Famille_Sonde);
END;
GO

-- t_lieu_mail_tel
IF OBJECT_ID('dbo.t_lieu_mail_tel', 'U') IS NULL AND OBJECT_ID('dbo.t_lieu_tel_num', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_lieu_tel_num', 't_lieu_mail_tel';
END;
GO
IF OBJECT_ID('dbo.t_lieu_mail_tel', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_mail_tel (
    Id_Mail_Tel INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NULL,
    Ordre_Contact INT NULL,
    Id_Utilisateur INT NULL,
    Est_Via_Telephone BIT NULL,
    Est_Via_Email BIT NULL
  );
  CREATE INDEX IDX_Id_Lieu ON dbo.t_lieu_mail_tel(Id_Lieu);
  CREATE INDEX IDX_Id_Utilisateur ON dbo.t_lieu_mail_tel(Id_Utilisateur);
END;
GO
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Id_Tel_Num') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Id_Tel_Num', 'Id_Mail_Tel', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Numero_Ordre') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Numero_Ordre', 'Ordre_Contact', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Id_Utilisation') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Id_Utilisation', 'Id_Utilisateur', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Est_Via_Mail') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Est_Via_Mail', 'Est_Via_Email', 'COLUMN';
GO

-- t_ajustage / t_milieu
IF OBJECT_ID('dbo.t_ajustage', 'U') IS NULL AND OBJECT_ID('dbo.t_calibrage', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_calibrage', 't_ajustage';
END;
GO
IF OBJECT_ID('dbo.t_milieu', 'U') IS NULL AND OBJECT_ID('dbo.t_bain', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_bain', 't_milieu';
END;
GO
IF OBJECT_ID('dbo.t_ajustage', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_ajustage (
    Id_Ajustage INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Date_Heure_Ajustage DATETIME NULL,
    Sonde_Numero_Serie VARCHAR(50) NULL,
    Coeff_X2 FLOAT NULL,
    Coeff_X FLOAT NULL,
    Coeff_Constant FLOAT NULL,
    Unite VARCHAR(10) NULL,
    Nb_Decimale INT NULL,
    Operateur VARCHAR(255) NULL,
    SE_Numero VARCHAR(50) NULL,
    SE_Organisme VARCHAR(50) NULL,
    SE_Date_Certif DATE NULL,
    SE_Numero_Certif VARCHAR(50) NULL,
    Mesure_Etalon1 FLOAT NULL,
    Mesure_Etalon2 FLOAT NULL,
    Valeur_Brute1 FLOAT NULL,
    Valeur_Brute2 FLOAT NULL,
    Ancienne_Mesure1 FLOAT NULL,
    Ancienne_Mesure2 FLOAT NULL,
    Nouvelle_Mesure1 FLOAT NULL,
    Nouvelle_Mesure2 FLOAT NULL,
    Id_Milieu INT NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_milieu', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_milieu (
    Id_Milieu INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Model VARCHAR(50) NULL,
    Reference VARCHAR(50) NULL,
    Stabilite FLOAT NULL,
    Homogeneite FLOAT NULL,
    Contenu VARCHAR(50) NULL,
    Est_Reserve_MC2 BIT NULL,
    Est_Archive BIT NULL
  );
END;
GO

-- t_sonde_etat
IF OBJECT_ID('dbo.t_sonde_etat', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_sonde_etat (
    Id_Sonde_Etat INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Etat_Sonde VARCHAR(1) NULL UNIQUE,
    Etat_Libelle VARCHAR(50) NULL
  );
END;
GO
IF NOT EXISTS (SELECT 1 FROM dbo.t_sonde_etat WHERE Etat_Sonde = 'D') INSERT INTO dbo.t_sonde_etat(Etat_Sonde, Etat_Libelle) VALUES ('D','DESACTIVE');
IF NOT EXISTS (SELECT 1 FROM dbo.t_sonde_etat WHERE Etat_Sonde = 'S') INSERT INTO dbo.t_sonde_etat(Etat_Sonde, Etat_Libelle) VALUES ('S','SURVEILLANCE ACTIVE');
GO

-- notifications
IF OBJECT_ID('dbo.t_notification', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification (
    Id_Notification INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Type VARCHAR(32) NOT NULL,
    Id_Alarme INT NULL,
    Titre VARCHAR(128) NULL,
    Message VARCHAR(512) NOT NULL,
    Payload_Json NVARCHAR(MAX) NULL,
    Priorite INT NULL CONSTRAINT DF_t_notification_Priorite DEFAULT(0),
    Date_Creation DATETIME NOT NULL CONSTRAINT DF_t_notification_Date DEFAULT(GETDATE()),
    Est_Archive BIT NOT NULL CONSTRAINT DF_t_notification_Archive DEFAULT(0)
  );
  CREATE INDEX IDX_Id_Alarme_Notification ON dbo.t_notification(Id_Alarme);
  CREATE INDEX IDX_Date_Creation_Notification ON dbo.t_notification(Date_Creation);
END;
GO
IF OBJECT_ID('dbo.t_notification_delivery', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification_delivery (
    Id_Delivery INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Notification INT NOT NULL,
    Id_Poste INT NOT NULL,
    Id_Utilisateur INT NULL,
    Statut VARCHAR(32) NOT NULL,
    Nb_Tentatives INT NOT NULL CONSTRAINT DF_t_notification_delivery_NbTentatives DEFAULT(0),
    Derniere_Erreur VARCHAR(255) NULL,
    Date_Queue DATETIME NOT NULL CONSTRAINT DF_t_notification_delivery_DateQueue DEFAULT(GETDATE()),
    Date_Envoi DATETIME NULL,
    Date_Ack_Agent DATETIME NULL,
    Date_Dernier_Event DATETIME NULL,
    Correlation_Id VARCHAR(64) NULL,
    CONSTRAINT UK_NOTIFICATION_POSTE UNIQUE(Id_Notification, Id_Poste)
  );
  CREATE INDEX IDX_STATUT_DELIVERY ON dbo.t_notification_delivery(Statut);
  CREATE INDEX IDX_Date_Envoi_Delivery ON dbo.t_notification_delivery(Date_Envoi);
END;
GO
IF OBJECT_ID('dbo.t_notification_event', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification_event (
    Id_Event INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Delivery INT NOT NULL,
    Event_Type VARCHAR(32) NOT NULL,
    Event_Data NVARCHAR(MAX) NULL,
    Date_Event DATETIME NOT NULL CONSTRAINT DF_t_notification_event_Date DEFAULT(GETDATE())
  );
  CREATE INDEX IDX_Id_Delivery_Event ON dbo.t_notification_event(Id_Delivery);
  CREATE INDEX IDX_Date_Event ON dbo.t_notification_event(Date_Event);
END;
GO

-- t_vigilog_usage_ponctuel
IF OBJECT_ID('dbo.t_vigilog_usage_ponctuel', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_vigilog_usage_ponctuel (
    Id_VigiLog_Usage_Ponctuel INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Reference_Usage VARCHAR(50) NOT NULL,
    Id_VigiLog_Configuration INT NULL,
    Id_VigiLog INT NULL,
    Nom_Configuration VARCHAR(100) NOT NULL,
    Numero_Serie_VigiLog VARCHAR(30) NOT NULL,
    Nom_Lieu_Temporaire VARCHAR(120) NOT NULL,
    Statut VARCHAR(30) NOT NULL,
    Id_Utilisateur_Demarrage INT NOT NULL,
    Date_Heure_Demarrage DATETIME NOT NULL,
    Commentaire_Demarrage VARCHAR(MAX) NULL,
    Id_Utilisateur_Arret INT NULL,
    Date_Heure_Arret DATETIME NULL,
    Commentaire_Arret VARCHAR(MAX) NULL,
    Date_Heure_Creation DATETIME NOT NULL CONSTRAINT DF_t_vigilog_usage_ponctuel_DateCreation DEFAULT(GETDATE()),
    Date_Heure_Maj DATETIME NULL,
    CONSTRAINT UK_t_vigilog_usage_ponctuel_reference UNIQUE (Reference_Usage),
    CONSTRAINT FK_t_vigilog_usage_ponctuel_configuration FOREIGN KEY (Id_VigiLog_Configuration) REFERENCES dbo.t_vigilog_configuration(Id_VigiLog_Configuration),
    CONSTRAINT FK_t_vigilog_usage_ponctuel_logger FOREIGN KEY (Id_VigiLog) REFERENCES dbo.t_vigilog(Id_VigiLog),
    CONSTRAINT FK_t_vigilog_usage_ponctuel_user_start FOREIGN KEY (Id_Utilisateur_Demarrage) REFERENCES dbo.t_utilisateur(Id_Utilisateur),
    CONSTRAINT FK_t_vigilog_usage_ponctuel_user_stop FOREIGN KEY (Id_Utilisateur_Arret) REFERENCES dbo.t_utilisateur(Id_Utilisateur)
  );
  CREATE INDEX IDX_t_vigilog_usage_ponctuel_statut ON dbo.t_vigilog_usage_ponctuel(Statut);
  CREATE INDEX IDX_t_vigilog_usage_ponctuel_logger ON dbo.t_vigilog_usage_ponctuel(Numero_Serie_VigiLog);
  CREATE INDEX IDX_t_vigilog_usage_ponctuel_started_by ON dbo.t_vigilog_usage_ponctuel(Id_Utilisateur_Demarrage);
  CREATE INDEX IDX_t_vigilog_usage_ponctuel_stopped_by ON dbo.t_vigilog_usage_ponctuel(Id_Utilisateur_Arret);
END;
GO

-- planning
IF OBJECT_ID('dbo.t_lieu_planning_regle', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_planning_regle (
    Id_Regle INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NOT NULL,
    Actif BIT NOT NULL CONSTRAINT DF_t_lieu_planning_regle_Actif DEFAULT(1),
    Jour_Debut TINYINT NOT NULL,
    Heure_Debut TIME NOT NULL,
    Jour_Fin TINYINT NOT NULL,
    Heure_Fin TIME NOT NULL,
    Consigne FLOAT NULL,
    Consigne_Sup FLOAT NULL,
    Consigne_Inf FLOAT NULL,
    Priorite INT NOT NULL CONSTRAINT DF_t_lieu_planning_regle_Priorite DEFAULT(0),
    Tolerance_Sup_Calc FLOAT NULL,
    Tolerance_Inf_Calc FLOAT NULL,
    Retard_Alarme_Changement_Consigne INT NULL,
    Date_Creation DATETIME NOT NULL CONSTRAINT DF_t_lieu_planning_regle_DateCreation DEFAULT(GETDATE()),
    Date_Maj DATETIME NULL
  );
  CREATE INDEX IDX_Actif_Lieu ON dbo.t_lieu_planning_regle(Actif, Id_Lieu);
  CREATE INDEX IDX_Id_Lieu ON dbo.t_lieu_planning_regle(Id_Lieu);
END;
GO
IF OBJECT_ID('dbo.t_lieu_planning_audit', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_planning_audit (
    Id_Audit INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NOT NULL,
    [Timestamp] DATETIME NOT NULL CONSTRAINT DF_t_lieu_planning_audit_Timestamp DEFAULT(GETDATE()),
    Date_Heure_Debut_Changement DATETIME NULL,
    Date_Heure_Fin_Changement DATETIME NULL,
    [Type] VARCHAR(32) NOT NULL,
    CONSTRAINT CK_t_lieu_planning_audit_Type CHECK ([Type] IN ('PLAN_APPLY')),
    Planning_Regle_Id INT NULL,
    Consigne_Avant FLOAT NULL,
    Tolerance_Surveillance_Sup_Avant FLOAT NULL,
    Tolerance_Surveillance_Inf_Avant FLOAT NULL,
    Consigne_Apres FLOAT NULL,
    Tolerance_Surveillance_Sup_Apres FLOAT NULL,
    Tolerance_Surveillance_Inf_Apres FLOAT NULL
  );
  CREATE INDEX IDX_Id_Lieu_Timestamp ON dbo.t_lieu_planning_audit(Id_Lieu, [Timestamp]);
END;
GO


-- NOTE MSSQL: le scheduling planning consignes doit etre implemente via SQL Server Agent job
-- equivalent a EVT_PLANNING_CONSIGNE (MySQL), cadence recommandee: 1 minute.
-- tables techniques
IF OBJECT_ID('dbo.liste_clients', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.liste_clients (
    Id_Client INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Num_Compte VARCHAR(50) NULL UNIQUE,
    VigiServ_Derniere_Date_Heure DATETIME NULL,
    Vigitel_Derniere_Date_Heure DATETIME NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_mem_gso', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_mem_gso (
    id INT NOT NULL PRIMARY KEY,
    last_sonde VARCHAR(20) NULL,
    cycle_MEM INT NULL,
    cycle_start DATETIME NULL,
    last_update DATETIME NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_mem_gso_2', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_mem_gso_2 (
    com_port_send INT NOT NULL PRIMARY KEY,
    last_sonde VARCHAR(20) NULL,
    last_sonde_datetime DATETIME NULL,
    cycle_MEM INT NULL,
    cycle_start DATETIME NULL,
    last_update DATETIME NULL
  );
END;
GO

-- templates de lieu
IF OBJECT_ID('dbo.t_lieu_template', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_template (
    Id_Lieu_Template INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Nom_Template VARCHAR(80) NOT NULL,
    Description VARCHAR(255) NULL,
    Lieu_Etat VARCHAR(1) NOT NULL DEFAULT 'D',
    Frequence INT NULL,
    Retard_Alarme_Haut INT NULL,
    Retard_Alarme_Bas INT NULL,
    Retard_Non_Reponse INT NULL DEFAULT 60,
    Retard_Alarme_Changement_Consigne INT NULL,
    Consigne DECIMAL(10,2) NULL,
    Consigne_Sup DECIMAL(10,2) NULL,
    Consigne_Inf DECIMAL(10,2) NULL,
    Tolerance_Surveillance_Sup DECIMAL(10,2) NULL,
    Tolerance_Surveillance_Inf DECIMAL(10,2) NULL,
    Consigne_Sup_Pre_Alarme DECIMAL(10,2) NULL,
    Consigne_Inf_Pre_Alarme DECIMAL(10,2) NULL,
    Est_Consigne_Sup_Active BIT NOT NULL DEFAULT 0,
    Est_Consigne_Inf_Active BIT NOT NULL DEFAULT 0,
    Est_Consigne_Sup_Pre_Alarme_Active BIT NOT NULL DEFAULT 0,
    Est_Consigne_Inf_Pre_Alarme_Active BIT NOT NULL DEFAULT 0,
    Est_Son_Alarme_Active BIT NOT NULL DEFAULT 1,
    Est_Redeclenchement_Immediat BIT NOT NULL DEFAULT 0,
    Nb_Mesures_Temporisation_Redeclenchement INT NULL DEFAULT 0,
    Observations_Info VARCHAR(MAX) NULL,
    Est_Archive BIT NOT NULL DEFAULT 0,
    Date_Creation DATETIME NOT NULL DEFAULT GETDATE(),
    Date_Maj DATETIME NOT NULL DEFAULT GETDATE(),
    Id_Utilisateur_Creation INT NULL,
    Id_Utilisateur_Maj INT NULL
  );

  ALTER TABLE dbo.t_lieu_template
    ADD CONSTRAINT UK_t_lieu_template_nom UNIQUE (Nom_Template);

  CREATE INDEX IDX_t_lieu_template_archive ON dbo.t_lieu_template(Est_Archive);
  CREATE INDEX IDX_t_lieu_template_user_create ON dbo.t_lieu_template(Id_Utilisateur_Creation);
  CREATE INDEX IDX_t_lieu_template_user_update ON dbo.t_lieu_template(Id_Utilisateur_Maj);

  IF OBJECT_ID('dbo.t_utilisateur', 'U') IS NOT NULL
  BEGIN
    ALTER TABLE dbo.t_lieu_template
      ADD CONSTRAINT FK_t_lieu_template_user_create FOREIGN KEY (Id_Utilisateur_Creation) REFERENCES dbo.t_utilisateur(Id_Utilisateur) ON DELETE SET NULL;
    ALTER TABLE dbo.t_lieu_template
      ADD CONSTRAINT FK_t_lieu_template_user_update FOREIGN KEY (Id_Utilisateur_Maj) REFERENCES dbo.t_utilisateur(Id_Utilisateur) ON DELETE SET NULL;
  END;
END;
GO

-- parametres recents (uppercase)
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='GENERAL' AND Mot_Cle='GLOBAL_LANGUAGE')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('GENERAL','GLOBAL_LANGUAGE','fr','Langue globale de l''application (mails et futurs modules)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SHOW_NULL_NON_RESPONSE')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SHOW_NULL_NON_RESPONSE','0','Afficher les mesures null (non-reponse) dans les graphiques');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SURVEILLANCE_REFRESH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SURVEILLANCE_REFRESH','15','Rafraichissement surveillance en secondes');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_CC_RECIPIENTS')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_CC_RECIPIENTS','','Destinataires en copie sur tous les emails');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_SEND_ACK')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_SEND_ACK','1','Activer envoi email lors acquittement alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_SEND_RESOLVED')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_SEND_RESOLVED','1','Activer envoi email lors fin alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_NOTIFY_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_NOTIFY_PERCENT','50','Seuil (%) notification batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_EMAIL_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_EMAIL_PERCENT','25','Seuil (%) envoi email batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='ENABLED')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','ENABLED','0','Activation envoi recap mensuel stats');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='RECIPIENTS')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','RECIPIENTS','','Destinataires separes par ; ou ,');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='DAY_OF_MONTH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','DAY_OF_MONTH','1','Jour du mois (1..28)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='HOUR_LOCAL')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','HOUR_LOCAL','8','Heure locale (0..23)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_LOCATION_SUMMARY')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_LOCATION_SUMMARY','1','Inclure lieu/site/groupe');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_SETTINGS_SUMMARY')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_SETTINGS_SUMMARY','1','Inclure consignes/tolerances/frequence/retards');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_MAX')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_MAX','1','Inclure mesure max');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_MIN')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_MIN','1','Inclure mesure min');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_AVG')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_AVG','1','Inclure moyenne');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_COUNT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_COUNT','1','Inclure nombre alarmes');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_HIGH_DURATION')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_HIGH_DURATION','1','Inclure duree alarme haute');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_LOW_DURATION')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_LOW_DURATION','1','Inclure duree alarme basse');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_OVER_HIGH_NO_ALARM')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_OVER_HIGH_NO_ALARM','1','Inclure depassement haut sans alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_OVER_LOW_NO_ALARM')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_OVER_LOW_NO_ALARM','1','Inclure depassement bas sans alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='LAST_SENT_MONTH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','LAST_SENT_MONTH','','Dernier mois envoye au format YYYY-MM');
GO

DECLARE @RecentParams TABLE (
  Section NVARCHAR(100) NOT NULL,
  Mot_Cle NVARCHAR(100) NOT NULL,
  Valeur NVARCHAR(MAX) NULL,
  Commentaire NVARCHAR(MAX) NULL
);

INSERT INTO @RecentParams (Section, Mot_Cle, Valeur, Commentaire) VALUES
(N'GENERAL',N'TIMEZONE',N'Europe/Paris',N'Fuseau horaire par defaut'),
(N'DASHBOARD',N'AUDIT_GRAPH_OPENINGS',N'false',N'Activer l audit trail a l ouverture des graphiques'),
(N'DASHBOARD',N'ETALONNAGE_WARNING_DAYS',N'90',N'Delai alerte validite etalonnage en jours'),
(N'DASHBOARD',N'REFRESH',N'30',N'Intervalle de rafraichissement dashboard en secondes'),
(N'DASHBOARD',N'REQUIRE_ACTION_COMMENT',N'false',N'Exiger un commentaire pour les actions de surveillance'),
(N'NOTIFICATIONS',N'EMAIL',N'true',N'Activation globale des emails systeme'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_RECIPIENTS',N'',N'Emails systeme utilises en copie ou fallback selon configuration'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_FALLBACK_TO_SYSTEM',N'false',N'Envoyer aux emails systeme si aucun contact lieu n est renseigne'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_ACKNOWLEDGED',N'true',N'Envoyer les emails d acquittement'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_ENDED',N'true',N'Envoyer les emails d alarme terminee'),
(N'NOTIFICATIONS_TEAMS',N'ENABLED',N'false',N'Active les notifications Teams via webhook Workflows'),
(N'NOTIFICATIONS_TEAMS',N'WEBHOOK_URL',N'',N'URL du webhook Teams Workflows. Secret a proteger'),
(N'NOTIFICATIONS_TEAMS',N'CHANNEL_LABEL',N'',N'Nom lisible du canal Teams cible'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_TRIGGER',N'true',N'Envoie un message Teams au declenchement alarme'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_END',N'true',N'Envoie un message Teams a la fin alarme'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_ACK',N'false',N'Envoie un message Teams a l acquittement'),
(N'NOTIFICATIONS_TEAMS',N'TIMEOUT_MS',N'5000',N'Timeout HTTP du webhook Teams en millisecondes'),
(N'NOTIFICATIONS_TEAMS',N'DEDUPE_WINDOW_MINUTES',N'10',N'Fenetre anti-doublon Teams par alarme/evenement'),
(N'SERVICE',N'GSO_DERNIER_DATE_HEURE',NULL,N'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures'),
(N'SERVICES',N'COMMERCIAL_CONTACT_EMAIL',N'',N'Adresse email du service commercial utilisee pour les demandes de devis materiel'),
(N'messaging',N'enabled',N'true',N'Active la messagerie interne'),
(N'TELEPHONIE',N'ENABLED',N'false',N'Activation globale de la telephonie VoIP'),
(N'TELEPHONIE',N'PROVIDER',N'none',N'Fournisseur VoIP selectionne'),
(N'TELEPHONIE',N'CALLER_ID',N'',N'Numero presente / caller ID'),
(N'TELEPHONIE',N'NOTES',N'',N'Notes d integration telephonie'),
(N'TELEPHONIE',N'TWILIO_AUTH_MODE',N'api_key',N'Mode authentification Twilio'),
(N'TELEPHONIE',N'TWILIO_ACCOUNT_SID',N'',N'Compte Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SID',N'',N'API Key SID Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SECRET',N'',N'API Key Secret Twilio'),
(N'TELEPHONIE',N'TWILIO_AUTH_TOKEN',N'',N'Auth Token Twilio'),
(N'TELEPHONIE',N'TWILIO_FROM_NUMBER',N'',N'Numero expediteur Twilio'),
(N'TELEPHONIE',N'OVH_ENDPOINT',N'ovh-eu',N'Point d acces API OVH'),
(N'TELEPHONIE',N'OVH_APPLICATION_KEY',N'',N'Application Key OVH'),
(N'TELEPHONIE',N'OVH_APPLICATION_SECRET',N'',N'Application Secret OVH'),
(N'TELEPHONIE',N'OVH_CONSUMER_KEY',N'',N'Consumer Key OVH'),
(N'TELEPHONIE',N'OVH_BILLING_ACCOUNT',N'',N'Compte de facturation OVH'),
(N'TELEPHONIE',N'OVH_SERVICE_NAME',N'',N'Nom du service / ligne OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_USER_ID',N'',N'Identifiant utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_LOGIN',N'',N'Login utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_PASSWORD',N'',N'Mot de passe utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'KEYYO_CLIENT_ID',N'',N'Client ID Keyyo'),
(N'TELEPHONIE',N'KEYYO_CLIENT_SECRET',N'',N'Client Secret Keyyo'),
(N'TELEPHONIE',N'KEYYO_ACCESS_TOKEN',N'',N'Access token Keyyo'),
(N'TELEPHONIE',N'KEYYO_REFRESH_TOKEN',N'',N'Refresh token Keyyo'),
(N'TELEPHONIE',N'KEYYO_LINE_ID',N'',N'Identifiant ligne Keyyo'),
(N'TELEPHONIE',N'ASTERISK_BASE_URL',N'http://127.0.0.1:8088/ari',N'URL ARI Asterisk'),
(N'TELEPHONIE',N'ASTERISK_USERNAME',N'',N'Utilisateur Asterisk ARI'),
(N'TELEPHONIE',N'ASTERISK_PASSWORD',N'',N'Mot de passe Asterisk ARI'),
(N'TELEPHONIE',N'ASTERISK_APP_NAME',N'vigitemp',N'Nom application Asterisk ARI');

INSERT INTO dbo.t_parametre (Section, Mot_Cle, Valeur, Commentaire)
SELECT p.Section, p.Mot_Cle, p.Valeur, p.Commentaire
FROM @RecentParams p
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.t_parametre existing
  WHERE existing.Section = p.Section
    AND existing.Mot_Cle = p.Mot_Cle
);
GO

-- =====================================================================
-- NETTOYAGE AUTORISATIONS LEGACY NON UTILISEES (2026-04-13)
-- =====================================================================
IF OBJECT_ID('dbo.t_autorisation', 'U') IS NOT NULL
BEGIN
  DECLARE @CodesToRemove TABLE (code NVARCHAR(50) PRIMARY KEY);
  INSERT INTO @CodesToRemove (code) VALUES
    (N'PARAM_EDITION_STATISTIQUES'),
    (N'MATERIEL_MESURE_GERER'),
    (N'MATERIEL_MESURE_VISUALISER'),
    (N'MATERIEL_ALARME_GERER'),
    (N'APPLICATION_QUITTER_ADMIN'),
    (N'MATERIEL_METROLOGIE_GERER'),
    (N'METROLOGIE_REALISER'),
    (N'METROLOGIE_VISUALISER'),
    (N'APPLICATION_QUITTER_METRO'),
    (N'APPLICATION_QUITTER_SURV'),
    (N'APPLICATION_QUITTER_VIGILOG'),
    (N'TELE_ASSISTANCE'),
    (N'SUPERPOSITION_COURBE');

  IF OBJECT_ID('dbo.t_liaison_profil_autorisation', 'U') IS NOT NULL
  BEGIN
    DELETE l
    FROM dbo.t_liaison_profil_autorisation l
    JOIN dbo.t_autorisation a
      ON a.Id_Autorisation = l.Id_Autorisation
    JOIN @CodesToRemove c
      ON c.code = a.Code_Autorisation;
  END;

  DELETE a
  FROM dbo.t_autorisation a
  JOIN @CodesToRemove c
    ON c.code = a.Code_Autorisation;
END;
GO

