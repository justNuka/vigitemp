
IF DB_ID(N'vigi_mesures') IS NULL
BEGIN
  CREATE DATABASE [vigi_mesures];
END;
GO
USE [vigi_mesures];
GO

IF OBJECT_ID('dbo.tm_journal_commentaire_libre', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.tm_journal_commentaire_libre (
    Id_Commentaire_Journal INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code_Journal NVARCHAR(32) NOT NULL,
    Commentaire NVARCHAR(MAX) NOT NULL,
    Date_Creation DATETIME NOT NULL CONSTRAINT DF_tm_journal_commentaire_libre_DateCreation DEFAULT(GETDATE()),
    Date_Modification DATETIME NULL
  );

  CREATE INDEX IDX_tm_journal_commentaire_libre_code
    ON dbo.tm_journal_commentaire_libre(Code_Journal);

  CREATE INDEX IDX_tm_journal_commentaire_libre_date_creation
    ON dbo.tm_journal_commentaire_libre(Date_Creation);
END;
GO

-- =====================================================================
-- ALIGNEMENT SQL SERVER <-> SCHEMA PRISMA (Mise a jour 2026-02)
-- Script idempotent (complement de seed)
-- =====================================================================

IF COL_LENGTH('dbo.tm_graphique', 'Adresse_Sonde') IS NULL
  ALTER TABLE dbo.tm_graphique ADD Adresse_Sonde VARCHAR(50) NULL;
GO

IF COL_LENGTH('dbo.tm_mesures', 'Adresse_Sonde') IS NULL
  ALTER TABLE dbo.tm_mesures ADD Adresse_Sonde VARCHAR(50) NULL;
GO

-- Conserve format texte pour RSSI/Tension (unites incluses)
IF COL_LENGTH('dbo.tm_mesures', 'Rssi') IS NOT NULL
BEGIN
  DECLARE @typeRssi NVARCHAR(128);
  SELECT @typeRssi = t.name
  FROM sys.columns c
  JOIN sys.types t ON c.user_type_id = t.user_type_id
  WHERE c.object_id = OBJECT_ID('dbo.tm_mesures') AND c.name = 'Rssi';
  IF @typeRssi <> 'varchar' AND @typeRssi <> 'nvarchar'
    ALTER TABLE dbo.tm_mesures ALTER COLUMN Rssi VARCHAR(10) NULL;
END;
GO

IF COL_LENGTH('dbo.tm_mesures', 'Tension') IS NOT NULL
BEGIN
  DECLARE @typeTension NVARCHAR(128);
  SELECT @typeTension = t.name
  FROM sys.columns c
  JOIN sys.types t ON c.user_type_id = t.user_type_id
  WHERE c.object_id = OBJECT_ID('dbo.tm_mesures') AND c.name = 'Tension';
  IF @typeTension <> 'varchar' AND @typeTension <> 'nvarchar'
    ALTER TABLE dbo.tm_mesures ALTER COLUMN Tension VARCHAR(10) NULL;
END;
GO
