
IF DB_ID(N'vigi_mesures') IS NULL
BEGIN
  CREATE DATABASE [vigi_mesures];
END;
GO
USE [vigi_mesures];
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
