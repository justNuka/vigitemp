-- =====================================================================
-- BOOTSTRAP SQL SERVER VigiSensys
-- Version produit / seed : 0.91.1
-- DDL traduit depuis le dump schema courant MySQL du 2026-08-25.
-- Les FK MySQL ne sont pas reproduites: SQL Server ne prend pas en
-- charge ON UPDATE CASCADE et refuse certains chemins de cascade multiples.
-- Colonnes, cles primaires, unicites et index sont conserves.
-- =====================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
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
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_conversation') AND name=N't_conversation_DM_Key_key')
  CREATE UNIQUE INDEX [t_conversation_DM_Key_key] ON dbo.[t_conversation] ([DM_Key]) WHERE [DM_Key] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_conversation') AND name=N't_conversation_Type_idx')
  CREATE INDEX [t_conversation_Type_idx] ON dbo.[t_conversation] ([Type]);
GO
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_conversation') AND name=N't_conversation_Date_Creation_idx')
  CREATE INDEX [t_conversation_Date_Creation_idx] ON dbo.[t_conversation] ([Date_Creation]);
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
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_conversation_participant') AND name=N't_conversation_participant_Id_Conversation_Id_Utilisateur_key')
  CREATE UNIQUE INDEX [t_conversation_participant_Id_Conversation_Id_Utilisateur_key] ON dbo.[t_conversation_participant] ([Id_Conversation], [Id_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_conversation_participant') AND name=N't_conversation_participant_Id_Utilisateur_idx')
  CREATE INDEX [t_conversation_participant_Id_Utilisateur_idx] ON dbo.[t_conversation_participant] ([Id_Utilisateur]);
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
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_message') AND name=N't_message_Id_Conversation_Id_Message_idx')
  CREATE INDEX [t_message_Id_Conversation_Id_Message_idx] ON dbo.[t_message] ([Id_Conversation], [Id_Message]);
GO
IF OBJECT_ID(N'dbo.t_message', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_message') AND name=N't_message_Date_Creation_idx')
  CREATE INDEX [t_message_Date_Creation_idx] ON dbo.[t_message] ([Date_Creation]);
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
IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_message_attachment') AND name=N'IDX_t_message_attachment_Id_Message')
  CREATE INDEX [IDX_t_message_attachment_Id_Message] ON dbo.[t_message_attachment] ([Id_Message]);
GO

IF DB_ID(N'vigi_main') IS NULL
BEGIN
  CREATE DATABASE [vigi_main];
END;
GO
USE [vigi_main];
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
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.liste_clients') AND name=N'UK_Num_Compte')
  CREATE UNIQUE INDEX [UK_Num_Compte] ON dbo.[liste_clients] ([Num_Compte]) WHERE [Num_Compte] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur] (
    [Id_Actionneur] INT IDENTITY(1,1) NOT NULL,
    [Num_Serie] VARCHAR(50) NULL,
    [Type] INT NULL,
    [Est_Etat] BIT NULL DEFAULT('0'),
    [Est_Demande] BIT NULL DEFAULT('0'),
    [Commentaire] VARCHAR(255) NULL,
    [Port_Serie] INT NULL,
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Est_Test] BIT NULL DEFAULT('0'),
    [Libelle_Erreur] VARCHAR(50) NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
    [Id_Worker] INT NULL DEFAULT('1'),
    CONSTRAINT [PK_t_actionneur] PRIMARY KEY ([Id_Actionneur])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur') AND name=N'IDX_Num_Serie')
  CREATE INDEX [IDX_Num_Serie] ON dbo.[t_actionneur] ([Num_Serie]);
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur') AND name=N'IDX_Type')
  CREATE INDEX [IDX_Type] ON dbo.[t_actionneur] ([Type]);
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur') AND name=N'IDX_Est_Etat')
  CREATE INDEX [IDX_Est_Etat] ON dbo.[t_actionneur] ([Est_Etat]);
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur') AND name=N'IDX_Id_Module')
  CREATE INDEX [IDX_Id_Module] ON dbo.[t_actionneur] ([Id_Module]);
GO
IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur') AND name=N'IDX_Id_Plan')
  CREATE INDEX [IDX_Id_Plan] ON dbo.[t_actionneur] ([Id_Plan]);
GO

IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur_type] (
    [Id_Actionneur_Type] INT IDENTITY(1,1) NOT NULL,
    [Type] INT NULL,
    [Description] VARCHAR(50) NULL,
    [Gere_Relais] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_actionneur_type] PRIMARY KEY ([Id_Actionneur_Type])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_actionneur_type') AND name=N'Type')
  CREATE UNIQUE INDEX [Type] ON dbo.[t_actionneur_type] ([Type]) WHERE [Type] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ajustage] (
    [Id_Ajustage] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Ajustage] DATETIME NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Coeff_X2] FLOAT NULL DEFAULT('0'),
    [Coeff_X] FLOAT NULL,
    [Coeff_Constant] FLOAT NULL,
    [Coeffs_Modifies_Depuis_Derniere_Mesure] BIT NOT NULL DEFAULT('0'),
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
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ajustage') AND name=N'IDX_Sonde_Numero_Serie')
  CREATE INDEX [IDX_Sonde_Numero_Serie] ON dbo.[t_ajustage] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ajustage') AND name=N'IDX_SE_Numero')
  CREATE INDEX [IDX_SE_Numero] ON dbo.[t_ajustage] ([SE_Numero]);
GO
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ajustage') AND name=N'IDX_Date_Heure_Calibrage')
  CREATE INDEX [IDX_Date_Heure_Calibrage] ON dbo.[t_ajustage] ([Date_Heure_Ajustage]);
GO
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ajustage') AND name=N'IDX_Id_Bain')
  CREATE INDEX [IDX_Id_Bain] ON dbo.[t_ajustage] ([Id_Milieu]);
GO
IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ajustage') AND name=N'idx_ajustage_sonde_date')
  CREATE INDEX [idx_ajustage_sonde_date] ON dbo.[t_ajustage] ([Sonde_Numero_Serie], [Date_Heure_Ajustage]);
GO

IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme] (
    [Id_Alarme] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(2) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT('0'),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL DEFAULT('0'),
    [Est_Mail_Envoye] BIT NULL,
    [Est_Mail_Fin_Envoye] BIT NOT NULL DEFAULT('0'),
    [Est_Tel_Acquittee] BIT NULL,
    CONSTRAINT [PK_t_alarme] PRIMARY KEY ([Id_Alarme])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Date_Heure_Debut')
  CREATE INDEX [IDX_Date_Heure_Debut] ON dbo.[t_alarme] ([Date_Heure_Debut]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Valeur')
  CREATE INDEX [IDX_Valeur] ON dbo.[t_alarme] ([Valeur]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Type')
  CREATE INDEX [IDX_Type] ON dbo.[t_alarme] ([Type]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Date_Heure_Fin')
  CREATE INDEX [IDX_Date_Heure_Fin] ON dbo.[t_alarme] ([Date_Heure_Fin]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Id_Lieu')
  CREATE INDEX [IDX_Id_Lieu] ON dbo.[t_alarme] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Sonde_Numero_Serie')
  CREATE INDEX [IDX_Sonde_Numero_Serie] ON dbo.[t_alarme] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Unite')
  CREATE INDEX [IDX_Unite] ON dbo.[t_alarme] ([Unite]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Est_Acquittee')
  CREATE INDEX [IDX_Est_Acquittee] ON dbo.[t_alarme] ([Est_Acquittee]);
GO
IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme') AND name=N'IDX_Date_Heure_Derniere_Mesure')
  CREATE INDEX [IDX_Date_Heure_Derniere_Mesure] ON dbo.[t_alarme] ([Date_Heure_Derniere_Mesure]);
GO

IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_histo] (
    [Id_Alarme_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Alarme] INT NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(2) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Est_Alarme_Vrai] BIT NULL DEFAULT('0'),
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT('0'),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Date_Heure_Debut_Alarme_Vrai] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL,
    [Est_Mail_Envoye] BIT NULL,
    [Est_Tel_Acquittee] BIT NULL,
    [Date_Heure_Acquittement] DATETIME NULL,
    CONSTRAINT [PK_t_alarme_histo] PRIMARY KEY ([Id_Alarme_Histo])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'Id_Alarme_Histo')
  CREATE INDEX [Id_Alarme_Histo] ON dbo.[t_alarme_histo] ([Id_Alarme_Histo]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Est_Acquittee')
  CREATE INDEX [IDX_HISTO_Est_Acquittee] ON dbo.[t_alarme_histo] ([Est_Acquittee]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Est_Alarme_Vrai')
  CREATE INDEX [IDX_HISTO_Est_Alarme_Vrai] ON dbo.[t_alarme_histo] ([Est_Alarme_Vrai]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Date_Heure_Debut')
  CREATE INDEX [IDX_HISTO_Date_Heure_Debut] ON dbo.[t_alarme_histo] ([Date_Heure_Debut]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Date_Heure_Fin')
  CREATE INDEX [IDX_HISTO_Date_Heure_Fin] ON dbo.[t_alarme_histo] ([Date_Heure_Fin]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Date_Heure_Debut_Alarme_Vrai')
  CREATE INDEX [IDX_HISTO_Date_Heure_Debut_Alarme_Vrai] ON dbo.[t_alarme_histo] ([Date_Heure_Debut_Alarme_Vrai]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Date_Heure_Derniere_Mesure')
  CREATE INDEX [IDX_HISTO_Date_Heure_Derniere_Mesure] ON dbo.[t_alarme_histo] ([Date_Heure_Derniere_Mesure]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Sonde_Numero_Serie')
  CREATE INDEX [IDX_HISTO_Sonde_Numero_Serie] ON dbo.[t_alarme_histo] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Id_Lieu')
  CREATE INDEX [IDX_HISTO_Id_Lieu] ON dbo.[t_alarme_histo] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Type')
  CREATE INDEX [IDX_HISTO_Type] ON dbo.[t_alarme_histo] ([Type]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Unite')
  CREATE INDEX [IDX_HISTO_Unite] ON dbo.[t_alarme_histo] ([Unite]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Valeur')
  CREATE INDEX [IDX_HISTO_Valeur] ON dbo.[t_alarme_histo] ([Valeur]);
GO
IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_histo') AND name=N'IDX_HISTO_Id_Alarme')
  CREATE INDEX [IDX_HISTO_Id_Alarme] ON dbo.[t_alarme_histo] ([Id_Alarme]);
GO

IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_message] (
    [Id_Alarme_Message] INT IDENTITY(1,1) NOT NULL,
    [Code_Alarme_Message] VARCHAR(20) NULL,
    [Type] VARCHAR(2) NULL,
    [Texte_Message] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_t_alarme_message] PRIMARY KEY ([Id_Alarme_Message])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_alarme_message') AND name=N'CodeAlarmeMessage')
  CREATE UNIQUE INDEX [CodeAlarmeMessage] ON dbo.[t_alarme_message] ([Code_Alarme_Message]) WHERE [Code_Alarme_Message] IS NOT NULL;
GO

SET IDENTITY_INSERT dbo.[t_alarme_message] ON;
IF EXISTS (SELECT 1 FROM dbo.[t_alarme_message] WHERE [Id_Alarme_Message] = 20)
  UPDATE dbo.[t_alarme_message] SET [Code_Alarme_Message]=N'CRITIQUE_BAS',[Type]='CB',[Texte_Message]=N'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.' WHERE [Id_Alarme_Message]=20;
ELSE
  INSERT INTO dbo.[t_alarme_message]([Id_Alarme_Message],[Code_Alarme_Message],[Type],[Texte_Message])
  VALUES(20,N'CRITIQUE_BAS','CB',N'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.');
IF EXISTS (SELECT 1 FROM dbo.[t_alarme_message] WHERE [Id_Alarme_Message] = 21)
  UPDATE dbo.[t_alarme_message] SET [Code_Alarme_Message]=N'CRITIQUE_HAUT',[Type]='CH',[Texte_Message]=N'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.' WHERE [Id_Alarme_Message]=21;
ELSE
  INSERT INTO dbo.[t_alarme_message]([Id_Alarme_Message],[Code_Alarme_Message],[Type],[Texte_Message])
  VALUES(21,N'CRITIQUE_HAUT','CH',N'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.');
SET IDENTITY_INSERT dbo.[t_alarme_message] OFF;
GO


IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ancien_mot_de_passe] (
    [Id_Ancien_Mot_De_Passe] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Mot_De_Passe] VARCHAR(100) NULL,
    [Est_Premiere_Connexion] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_ancien_mot_de_passe] PRIMARY KEY ([Id_Ancien_Mot_De_Passe])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_ancien_mot_de_passe') AND name=N'IDX_Id_Utilisateur')
  CREATE INDEX [IDX_Id_Utilisateur] ON dbo.[t_ancien_mot_de_passe] ([Id_Utilisateur]);
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
IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_autorisation') AND name=N'IDX_Code_Autorisation')
  CREATE INDEX [IDX_Code_Autorisation] ON dbo.[t_autorisation] ([Code_Autorisation]);
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
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Numero')
  CREATE INDEX [IDX_Numero] ON dbo.[t_certif] ([Numero]);
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Organisme')
  CREATE INDEX [IDX_Organisme] ON dbo.[t_certif] ([Organisme]);
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Date')
  CREATE INDEX [IDX_Date] ON dbo.[t_certif] ([Date]);
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Etalon_Numero_Serie')
  CREATE INDEX [IDX_Etalon_Numero_Serie] ON dbo.[t_certif] ([Etalon_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Unite')
  CREATE INDEX [IDX_Unite] ON dbo.[t_certif] ([Unite]);
GO
IF OBJECT_ID(N'dbo.t_certif', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif') AND name=N'IDX_Id_PDF')
  CREATE INDEX [IDX_Id_PDF] ON dbo.[t_certif] ([Id_PDF]);
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
IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_certif_mesure') AND name=N'IDX_Id_Certif')
  CREATE INDEX [IDX_Id_Certif] ON dbo.[t_certif_mesure] ([Id_Certif]);
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
    [Mode_Transmission] VARCHAR(6) NOT NULL,
    [Statut_Commande] VARCHAR(9) NOT NULL DEFAULT('BROUILLON'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Envoi] DATETIME NULL,
    [Id_Pdf] INT NULL,
    CONSTRAINT [CK_t_commande_materiel_Mode_Transmission] CHECK ([Mode_Transmission] IN ('SMTP','MAILTO')),
    CONSTRAINT [CK_t_commande_materiel_Statut_Commande] CHECK ([Statut_Commande] IN ('BROUILLON','ENVOYEE','PREPAREE')),
    CONSTRAINT [PK_t_commande_materiel] PRIMARY KEY ([Id_Commande_Materiel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commande_materiel') AND name=N'UK_t_commande_materiel_reference')
  CREATE UNIQUE INDEX [UK_t_commande_materiel_reference] ON dbo.[t_commande_materiel] ([Reference_Commande]);
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commande_materiel') AND name=N'IX_t_commande_materiel_utilisateur')
  CREATE INDEX [IX_t_commande_materiel_utilisateur] ON dbo.[t_commande_materiel] ([Id_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commande_materiel') AND name=N'IX_t_commande_materiel_pdf')
  CREATE INDEX [IX_t_commande_materiel_pdf] ON dbo.[t_commande_materiel] ([Id_Pdf]);
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
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commande_materiel_ligne') AND name=N'IX_t_commande_materiel_ligne_commande')
  CREATE INDEX [IX_t_commande_materiel_ligne_commande] ON dbo.[t_commande_materiel_ligne] ([Id_Commande_Materiel]);
GO
IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commande_materiel_ligne') AND name=N'IX_t_commande_materiel_ligne_materiel')
  CREATE INDEX [IX_t_commande_materiel_ligne_materiel] ON dbo.[t_commande_materiel_ligne] ([Id_Materiel]);
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
IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme') AND name=N'IDX_Type_Commentaire')
  CREATE INDEX [IDX_Type_Commentaire] ON dbo.[t_commentaire_acquittement_alarme] ([Type_Commentaire]);
GO
IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme') AND name=N'IDX_Texte')
  CREATE INDEX [IDX_Texte] ON dbo.[t_commentaire_acquittement_alarme] ([Texte]);
GO

IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon] (
    [Id_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
    [Etat_Etalon] VARCHAR(1) NULL,
    [Port_Serie] VARCHAR(10) NULL,
    [Est_Sonde_Externe] BIT NULL,
    [Coeff_A] FLOAT NULL,
    [Coeff_B] FLOAT NULL,
    [Coeff_C] FLOAT NULL,
    [Incertitude_Max] FLOAT NULL,
    [Nb_Decimale] INT NULL,
    [Reserve_MC2] VARCHAR(50) NULL,
    [Id_Worker] INT NULL,
    [Id_Module] INT NULL,
    CONSTRAINT [PK_t_etalon] PRIMARY KEY ([Id_Etalon])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalon') AND name=N'EtalonNumeroSerie_IDX')
  CREATE UNIQUE INDEX [EtalonNumeroSerie_IDX] ON dbo.[t_etalon] ([Etalon_Numero_Serie]) WHERE [Etalon_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon_type] (
    [Type_Etalon] VARCHAR(4) NOT NULL,
    [Nom] VARCHAR(30) NULL,
    [Descriptif] VARCHAR(100) NULL,
    [Est_Saisie_Module] BIT NULL DEFAULT('0'),
    [Est_Sonde_Externe] BIT NULL DEFAULT('0'),
    [Resolution] FLOAT NULL,
    CONSTRAINT [PK_t_etalon_type] PRIMARY KEY ([Type_Etalon])
  );
END;
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
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Date_Heure_Etalonnage')
  CREATE INDEX [IDX_Date_Heure_Etalonnage] ON dbo.[t_etalonnage] ([Date_Heure_Etalonnage]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Sonde_Numero_Serie')
  CREATE INDEX [IDX_Sonde_Numero_Serie] ON dbo.[t_etalonnage] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Etalon_Numero_Serie')
  CREATE INDEX [IDX_Etalon_Numero_Serie] ON dbo.[t_etalonnage] ([Etalon_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Date_Certif')
  CREATE INDEX [IDX_Date_Certif] ON dbo.[t_etalonnage] ([Date_Certif]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Organisme')
  CREATE INDEX [IDX_Organisme] ON dbo.[t_etalonnage] ([Organisme]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Num_Certif')
  CREATE INDEX [IDX_Num_Certif] ON dbo.[t_etalonnage] ([Num_Certif]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Unite')
  CREATE INDEX [IDX_Unite] ON dbo.[t_etalonnage] ([Unite]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Moyenne_Etalon')
  CREATE INDEX [IDX_Moyenne_Etalon] ON dbo.[t_etalonnage] ([Moyenne_Etalon]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Moyenne_Sonde')
  CREATE INDEX [IDX_Moyenne_Sonde] ON dbo.[t_etalonnage] ([Moyenne_Sonde]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Repetabilite')
  CREATE INDEX [IDX_Repetabilite] ON dbo.[t_etalonnage] ([Repetabilite]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Id_Bain')
  CREATE INDEX [IDX_Id_Bain] ON dbo.[t_etalonnage] ([Id_Bain]);
GO
IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage') AND name=N'IDX_Incertitude')
  CREATE INDEX [IDX_Incertitude] ON dbo.[t_etalonnage] ([Incertitude]);
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
IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etalonnage_mesure') AND name=N'IDX_Id_Etalonnage')
  CREATE INDEX [IDX_Id_Etalonnage] ON dbo.[t_etalonnage_mesure] ([Id_Etalonnage]);
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
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_etat_surveillance') AND name=N't_etat_surveillance_Surveillance_Etat_key')
  CREATE UNIQUE INDEX [t_etat_surveillance_Surveillance_Etat_key] ON dbo.[t_etat_surveillance] ([Surveillance_Etat]) WHERE [Surveillance_Etat] IS NOT NULL;
GO

SET IDENTITY_INSERT dbo.t_etat_surveillance ON;

MERGE dbo.t_etat_surveillance AS target
USING (VALUES
    (1, N'A', N'En ajustage'),
    (2, N'D', N'Surveillance désactivée'),
    (3, N'E', N'En étalonnage'),
    (4, N'S', N'Utilisée en surveillance'),
    (5, N'T', N'En test')
) AS source (
    Id_Surveillance_Etat,
    Surveillance_Etat,
    Surveillance_Etat_Libelle
)
ON target.Id_Surveillance_Etat = source.Id_Surveillance_Etat

WHEN MATCHED THEN UPDATE SET
    Surveillance_Etat = source.Surveillance_Etat,
    Surveillance_Etat_Libelle = source.Surveillance_Etat_Libelle

WHEN NOT MATCHED THEN INSERT (
    Id_Surveillance_Etat,
    Surveillance_Etat,
    Surveillance_Etat_Libelle
)
VALUES (
    source.Id_Surveillance_Etat,
    source.Surveillance_Etat,
    source.Surveillance_Etat_Libelle
);

SET IDENTITY_INSERT dbo.t_etat_surveillance OFF;
GO

IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_groupe] (
    [Id_Groupe] INT IDENTITY(1,1) NOT NULL,
    [Nom_Groupe] VARCHAR(64) NULL,
    [Numero_Regroupement] VARCHAR(1) NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_groupe] PRIMARY KEY ([Id_Groupe])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_groupe') AND name=N'Groupe_NomGroupe_IDX')
  CREATE UNIQUE INDEX [Groupe_NomGroupe_IDX] ON dbo.[t_groupe] ([Nom_Groupe]) WHERE [Nom_Groupe] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_groupe') AND name=N'IDX_Numero_Regroupement')
  CREATE INDEX [IDX_Numero_Regroupement] ON dbo.[t_groupe] ([Numero_Regroupement]);
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
IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_profil_autorisation') AND name=N'IDX_IdProfil')
  CREATE INDEX [IDX_IdProfil] ON dbo.[t_liaison_profil_autorisation] ([Id_Profil]);
GO
IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_profil_autorisation') AND name=N'IDX_IdAutorisation')
  CREATE INDEX [IDX_IdAutorisation] ON dbo.[t_liaison_profil_autorisation] ([Id_Autorisation]);
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
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe') AND name=N'IDX_IdUtilisateur')
  CREATE INDEX [IDX_IdUtilisateur] ON dbo.[t_liaison_utilisateur_groupe] ([Id_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe') AND name=N'IDX_IdGroupe')
  CREATE INDEX [IDX_IdGroupe] ON dbo.[t_liaison_utilisateur_groupe] ([Id_Groupe]);
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
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_site') AND name=N'UK_USER_SITE')
  CREATE UNIQUE INDEX [UK_USER_SITE] ON dbo.[t_liaison_utilisateur_site] ([Id_Utilisateur], [Id_Site]) WHERE [Id_Utilisateur] IS NOT NULL AND [Id_Site] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_site') AND name=N'IDX_IdUtilisateur')
  CREATE INDEX [IDX_IdUtilisateur] ON dbo.[t_liaison_utilisateur_site] ([Id_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_site') AND name=N'IDX_IdSite')
  CREATE INDEX [IDX_IdSite] ON dbo.[t_liaison_utilisateur_site] ([Id_Site]);
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_liaison_utilisateur_site') AND name=N'IDX_DateAffectation')
  CREATE INDEX [IDX_DateAffectation] ON dbo.[t_liaison_utilisateur_site] ([Date_Affectation]);
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
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Consigne_Sup] FLOAT NULL,
    [Tolerance_Surveillance_Sup] FLOAT NULL,
    [Est_Consigne_Sup_Active] BIT NULL DEFAULT('0'),
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NULL DEFAULT('0'),
    [Seuil_Critique_Haut] FLOAT NULL,
    [Est_Seuil_Critique_Haut_Active] BIT NOT NULL DEFAULT('0'),
    [Consigne_Inf] FLOAT NULL,
    [Tolerance_Surveillance_Inf] FLOAT NULL,
    [Est_Consigne_Inf_Active] BIT NULL DEFAULT('0'),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NULL DEFAULT('0'),
    [Seuil_Critique_Bas] FLOAT NULL,
    [Est_Seuil_Critique_Bas_Active] BIT NOT NULL DEFAULT('0'),
    [Frequence] INT NULL,
    [Lieu_Etat] VARCHAR(1) NULL DEFAULT('D'),
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Date_Creation] DATETIME NULL DEFAULT(GETDATE()),
    [Est_Archive] BIT NULL DEFAULT('0'),
    [Est_Tel_Actif] BIT NULL DEFAULT('0'),
    [Tel_Code] VARCHAR(4) NULL,
    [Tel_Son_Lieu] VARCHAR(260) NULL,
    [Id_Actionneur] INT NULL,
    [Est_Mode_Serotheque] BIT NULL DEFAULT('0'),
    [Coef_Sensibilite] INT NULL,
    [Id_PDF] INT NULL,
    [Est_DataLogger] BIT NULL DEFAULT('0'),
    [EMT] FLOAT NULL,
    [EMT_Choix_Mode] INT NULL DEFAULT('4'),
    [EMT_Sonde] FLOAT NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Derniere_Date_Heure] DATETIME NULL,
    [Derniere_Valeur] FLOAT NULL,
    [Derniere_Unite] VARCHAR(10) NULL,
    [Derniere_Nb_Decimal] INT NULL DEFAULT('2'),
    [Est_Lieu_En_Alarme] TINYINT NULL DEFAULT('0'),
    [Est_Lieu_Alarme_Terminee_Non_Acquittee] TINYINT NULL DEFAULT('0'),
    [Est_Auto_Acquittement_Non_Reponse] BIT NOT NULL DEFAULT('0'),
    [Est_Lieu_Alarme_Terminee_Non_Acquittee_T1] TINYINT NULL DEFAULT('0'),
    [Est_Lieu_En_Pre_Alarme] TINYINT NULL DEFAULT('0'),
    [Id_Alarme] INT NULL DEFAULT('0'),
    [Lieu_Etat_N1] VARCHAR(50) NULL,
    [Derniere_Date_Etalonnage] DATE NULL,
    [Derniere_Erreur_Justesse] FLOAT NULL,
    [Derniere_Incertitude] FLOAT NULL,
    [Retard_Non_Reponse] INT NULL DEFAULT('60'),
    [Date_Heure_Derniere_Reponse] DATETIME NULL,
    [Date_Heure_Derniere_Reponse_Recue_OK] DATETIME NULL,
    [Est_Correction_Ej] TINYINT NULL DEFAULT('0'),
    [Derive] FLOAT NULL DEFAULT('0'),
    [Est_Correction_derive] BIT NULL DEFAULT('0'),
    [Derniere_Valeur_Null] INT NULL DEFAULT('0'),
    [Type_Lieu] VARCHAR(20) NULL,
    [Date_Heure_Dernier_Acquittement_En_Cours] DATETIME NULL,
    [Date_Heure_Last_Update_EVT_GSO] DATETIME NULL,
    [Date_Heure_Reactivation_Alarme] DATETIME NULL,
    [Notification_Active] BIT NOT NULL DEFAULT('1'),
    [Commentaire] VARCHAR(200) NULL,
    [Infos_Modifiees_Depuis_Derniere_Mesure] BIT NOT NULL DEFAULT('1'),
    [Date_Heure_Reactivation_Surveillance] DATETIME NULL,
    [Date_Heure_Surveillance_On] DATETIME NULL,
    [Date_Heure_Surveillance_Off] DATETIME NULL,
    [Derniere_Val_Rssi] VARCHAR(10) NULL,
    [Derniere_Val_Batterie] INT NULL,
    [Derniere_Val_Tension] VARCHAR(10) NULL,
    [Est_Lieu_GSO] BIT NULL DEFAULT('0'),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT('1'),
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT('0'),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT('0'),
    [Planning_Actif] BIT NOT NULL DEFAULT('0'),
    [Planning_Source_Regle_Id] INT NULL,
    [Planning_Derniere_Maj] DATETIME NULL,
    [Planning_Regle_Existe] BIT NOT NULL DEFAULT('0'),
    [Consigne_Base] FLOAT NULL,
    [Consigne_Sup_Base] FLOAT NULL,
    [Consigne_Inf_Base] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Base] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Base] FLOAT NULL,
    [Est_Remontee_Memoire_A_Faire] BIT NOT NULL DEFAULT('0'),
    [Est_Acq_Auto_Alarme_NR] BIT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_lieu] PRIMARY KEY ([Id_Lieu])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Lieu_Etat')
  CREATE INDEX [IDX_Lieu_Etat] ON dbo.[t_lieu] ([Lieu_Etat]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Id_Plan')
  CREATE INDEX [IDX_Id_Plan] ON dbo.[t_lieu] ([Id_Plan]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Est_Archive')
  CREATE INDEX [IDX_Est_Archive] ON dbo.[t_lieu] ([Est_Archive]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Sonde_Numero_Serie')
  CREATE INDEX [IDX_Sonde_Numero_Serie] ON dbo.[t_lieu] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Est_Tel_Actif')
  CREATE INDEX [IDX_Est_Tel_Actif] ON dbo.[t_lieu] ([Est_Tel_Actif]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Tel_Code')
  CREATE INDEX [IDX_Tel_Code] ON dbo.[t_lieu] ([Tel_Code]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Tel_Son_Lieu')
  CREATE INDEX [IDX_Tel_Son_Lieu] ON dbo.[t_lieu] ([Tel_Son_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Id_Actionneur')
  CREATE INDEX [IDX_Id_Actionneur] ON dbo.[t_lieu] ([Id_Actionneur]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Id_Site')
  CREATE INDEX [IDX_Id_Site] ON dbo.[t_lieu] ([Id_Site]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Id_PDF')
  CREATE INDEX [IDX_Id_PDF] ON dbo.[t_lieu] ([Id_PDF]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Nom_Lieu')
  CREATE INDEX [IDX_Nom_Lieu] ON dbo.[t_lieu] ([Nom_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'idx_lieu_gso_etat')
  CREATE INDEX [idx_lieu_gso_etat] ON dbo.[t_lieu] ([Est_Lieu_GSO], [Lieu_Etat]);
GO
IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu') AND name=N'IDX_Date_Creation')
  CREATE INDEX [IDX_Date_Creation] ON dbo.[t_lieu] ([Date_Creation]);
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
IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_groupe') AND name=N'IDX_LIEU_GROUPE_Id_Groupe')
  CREATE INDEX [IDX_LIEU_GROUPE_Id_Groupe] ON dbo.[t_lieu_groupe] ([Id_Groupe]);
GO
IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_groupe') AND name=N'IDX_LIEU_GROUPE_Id_Lieu')
  CREATE INDEX [IDX_LIEU_GROUPE_Id_Lieu] ON dbo.[t_lieu_groupe] ([Id_Lieu]);
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
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_mail_tel') AND name=N'IDX_Id_Lieu')
  CREATE INDEX [IDX_Id_Lieu] ON dbo.[t_lieu_mail_tel] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_mail_tel') AND name=N'IDX_Id_Utilisateur')
  CREATE INDEX [IDX_Id_Utilisateur] ON dbo.[t_lieu_mail_tel] ([Id_Utilisateur]);
GO

IF OBJECT_ID(N'dbo.t_lieu_planning', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning] (
    [Id_Lieu_Planning] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NULL,
    [Est_Id_Jour] BIT NULL,
    [Est_Actif] BIT NULL DEFAULT('1'),
    [Heure_Debut_Periode1] VARCHAR(4) NULL DEFAULT('0000'),
    [Heure_Fin_Periode1] VARCHAR(4) NULL DEFAULT('0000'),
    [Heure_Debut_Periode2] VARCHAR(4) NULL DEFAULT('0000'),
    [Heure_Fin_Periode2] VARCHAR(4) NULL DEFAULT('0000'),
    CONSTRAINT [PK_t_lieu_planning] PRIMARY KEY ([Id_Lieu_Planning])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_planning') AND name=N'IdLieuJour')
  CREATE UNIQUE INDEX [IdLieuJour] ON dbo.[t_lieu_planning] ([Id_Lieu], [Est_Id_Jour]) WHERE [Id_Lieu] IS NOT NULL AND [Est_Id_Jour] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_planning') AND name=N'IDX_Id_Lieu')
  CREATE INDEX [IDX_Id_Lieu] ON dbo.[t_lieu_planning] ([Id_Lieu]);
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_audit] (
    [Id_Audit] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Debut_Changement] DATETIME NULL,
    [Date_Heure_Fin_Changement] DATETIME NULL,
    [Type] VARCHAR(10) NOT NULL,
    [Planning_Regle_Id] INT NULL,
    [Consigne_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Avant] FLOAT NULL,
    [Consigne_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Apres] FLOAT NULL,
    CONSTRAINT [CK_t_lieu_planning_audit_Type] CHECK ([Type] IN ('PLAN_APPLY')),
    CONSTRAINT [PK_t_lieu_planning_audit] PRIMARY KEY ([Id_Audit])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_planning_audit') AND name=N'IDX_Id_Lieu_Timestamp')
  CREATE INDEX [IDX_Id_Lieu_Timestamp] ON dbo.[t_lieu_planning_audit] ([Id_Lieu], [Timestamp]);
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_regle] (
    [Id_Regle] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Actif] BIT NOT NULL DEFAULT('1'),
    [Jour_Debut] TINYINT NOT NULL,
    [Heure_Debut] TIME NOT NULL,
    [Jour_Fin] TINYINT NOT NULL,
    [Heure_Fin] TIME NOT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Priorite] INT NOT NULL DEFAULT('0'),
    [Tolerance_Sup_Calc] FLOAT NULL,
    [Tolerance_Inf_Calc] FLOAT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    CONSTRAINT [PK_t_lieu_planning_regle] PRIMARY KEY ([Id_Regle])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_planning_regle') AND name=N'IDX_Id_Lieu')
  CREATE INDEX [IDX_Id_Lieu] ON dbo.[t_lieu_planning_regle] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_planning_regle') AND name=N'IDX_Actif_Lieu')
  CREATE INDEX [IDX_Actif_Lieu] ON dbo.[t_lieu_planning_regle] ([Actif], [Id_Lieu]);
GO

IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_template] (
    [Id_Lieu_Template] INT IDENTITY(1,1) NOT NULL,
    [Nom_Template] VARCHAR(80) NOT NULL,
    [Description] VARCHAR(255) NULL,
    [Lieu_Etat] VARCHAR(1) NOT NULL DEFAULT('D'),
    [Frequence] INT NULL,
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Retard_Non_Reponse] INT NULL DEFAULT('60'),
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Tolerance_Surveillance_Sup] FLOAT NULL,
    [Tolerance_Surveillance_Inf] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Seuil_Critique_Haut] FLOAT NULL,
    [Seuil_Critique_Bas] FLOAT NULL,
    [Est_Consigne_Sup_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Consigne_Inf_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Seuil_Critique_Haut_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Seuil_Critique_Bas_Active] BIT NOT NULL DEFAULT('0'),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT('1'),
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT('0'),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT('0'),
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Est_Archive] BIT NOT NULL DEFAULT('0'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Creation] INT NULL,
    [Id_Utilisateur_Maj] INT NULL,
    CONSTRAINT [PK_t_lieu_template] PRIMARY KEY ([Id_Lieu_Template])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_template') AND name=N'UK_t_lieu_template_nom')
  CREATE UNIQUE INDEX [UK_t_lieu_template_nom] ON dbo.[t_lieu_template] ([Nom_Template]);
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_template') AND name=N'IDX_t_lieu_template_archive')
  CREATE INDEX [IDX_t_lieu_template_archive] ON dbo.[t_lieu_template] ([Est_Archive]);
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_template') AND name=N'IDX_t_lieu_template_user_create')
  CREATE INDEX [IDX_t_lieu_template_user_create] ON dbo.[t_lieu_template] ([Id_Utilisateur_Creation]);
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_lieu_template') AND name=N'IDX_t_lieu_template_user_update')
  CREATE INDEX [IDX_t_lieu_template_user_update] ON dbo.[t_lieu_template] ([Id_Utilisateur_Maj]);
GO

IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_materiel] (
    [Id_Materiel] INT IDENTITY(1,1) NOT NULL,
    [Ref_Commercial] VARCHAR(50) NOT NULL DEFAULT(''),
    [Designation] VARCHAR(100) NOT NULL DEFAULT(''),
    [Descriptif] VARCHAR(1000) NOT NULL DEFAULT(''),
    [Gamme] VARCHAR(10) NOT NULL DEFAULT(''),
    [Type] VARCHAR(10) NOT NULL DEFAULT(''),
    [Chemin_Image] VARCHAR(500) NULL,
    CONSTRAINT [PK_t_materiel] PRIMARY KEY ([Id_Materiel])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_materiel') AND name=N'Id_Materiel')
  CREATE INDEX [Id_Materiel] ON dbo.[t_materiel] ([Id_Materiel]);
GO

IF OBJECT_ID(N'dbo.t_milieu_inter', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_milieu_inter] (
    [Id_Milieu] INT IDENTITY(1,1) NOT NULL,
    [Model] VARCHAR(50) NULL,
    [Reference] VARCHAR(50) NULL,
    [Stabilite] FLOAT NULL,
    [Homogeneite] FLOAT NULL,
    [Contenu] VARCHAR(50) NULL,
    [Est_Reserve_MC2] BIT NULL DEFAULT('0'),
    [Est_Archive] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_milieu_inter] PRIMARY KEY ([Id_Milieu])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_milieu_inter', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_milieu_inter') AND name=N'IDX_Model')
  CREATE INDEX [IDX_Model] ON dbo.[t_milieu_inter] ([Model]);
GO
IF OBJECT_ID(N'dbo.t_milieu_inter', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_milieu_inter') AND name=N'IDX_Reference')
  CREATE INDEX [IDX_Reference] ON dbo.[t_milieu_inter] ([Reference]);
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
    [Emplacement] VARCHAR(100) NULL,
    [Archive] TINYINT NULL DEFAULT('0'),
    [Id_Worker] INT NULL,
    [Est_Module_GSO] BIT NOT NULL DEFAULT('0'),
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    [Port_Serie_Boucle2_GSO] VARCHAR(10) NULL,
    CONSTRAINT [PK_t_module] PRIMARY KEY ([Id_Module])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_module') AND name=N'Identifiant_Module')
  CREATE UNIQUE INDEX [Identifiant_Module] ON dbo.[t_module] ([Type_Module], [Module_Numero_Serie]) WHERE [Type_Module] IS NOT NULL AND [Module_Numero_Serie] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_module') AND name=N'IDX_Module_Numero_Serie')
  CREATE INDEX [IDX_Module_Numero_Serie] ON dbo.[t_module] ([Module_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_module') AND name=N'IDX_Type_Module')
  CREATE INDEX [IDX_Type_Module] ON dbo.[t_module] ([Type_Module]);
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_module') AND name=N'IDX_Port_Serie')
  CREATE INDEX [IDX_Port_Serie] ON dbo.[t_module] ([Port_Serie]);
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_module') AND name=N'IDX_Id_Plan')
  CREATE INDEX [IDX_Id_Plan] ON dbo.[t_module] ([Id_Plan]);
GO

IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_module_type] (
    [Id_Module_Type] INT IDENTITY(1,1) NOT NULL,
    [Libelle_Type_Module] VARCHAR(50) NULL,
    [Libelle_Module] VARCHAR(100) NULL,
    [Est_Flag_Affiche_Plan] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_module_type] PRIMARY KEY ([Id_Module_Type])
  );
END;
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
    [Priorite] INT NULL DEFAULT('0'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Est_Archive] BIT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_notification] PRIMARY KEY ([Id_Notification])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification') AND name=N'IDX_Id_Alarme_Notification')
  CREATE INDEX [IDX_Id_Alarme_Notification] ON dbo.[t_notification] ([Id_Alarme]);
GO
IF OBJECT_ID(N'dbo.t_notification', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification') AND name=N'IDX_Date_Creation_Notification')
  CREATE INDEX [IDX_Date_Creation_Notification] ON dbo.[t_notification] ([Date_Creation]);
GO

IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification_delivery] (
    [Id_Delivery] INT IDENTITY(1,1) NOT NULL,
    [Id_Notification] INT NOT NULL,
    [Id_Poste] INT NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Statut] VARCHAR(32) NOT NULL,
    [Nb_Tentatives] INT NOT NULL DEFAULT('0'),
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
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_delivery') AND name=N'UK_NOTIFICATION_POSTE')
  CREATE UNIQUE INDEX [UK_NOTIFICATION_POSTE] ON dbo.[t_notification_delivery] ([Id_Notification], [Id_Poste]);
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_delivery') AND name=N'IDX_STATUT_DELIVERY')
  CREATE INDEX [IDX_STATUT_DELIVERY] ON dbo.[t_notification_delivery] ([Statut]);
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_delivery') AND name=N'IDX_Date_Envoi_Delivery')
  CREATE INDEX [IDX_Date_Envoi_Delivery] ON dbo.[t_notification_delivery] ([Date_Envoi]);
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_delivery') AND name=N'FK_POSTE_DELIVERY')
  CREATE INDEX [FK_POSTE_DELIVERY] ON dbo.[t_notification_delivery] ([Id_Poste]);
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_delivery') AND name=N'FK_UTILISATEUR_DELIVERY')
  CREATE INDEX [FK_UTILISATEUR_DELIVERY] ON dbo.[t_notification_delivery] ([Id_Utilisateur]);
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
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_event') AND name=N'IDX_Id_Delivery_Event')
  CREATE INDEX [IDX_Id_Delivery_Event] ON dbo.[t_notification_event] ([Id_Delivery]);
GO
IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_notification_event') AND name=N'IDX_Date_Event')
  CREATE INDEX [IDX_Date_Event] ON dbo.[t_notification_event] ([Date_Event]);
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
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_parametre') AND name=N'IDX_Section')
  CREATE INDEX [IDX_Section] ON dbo.[t_parametre] ([Section]);
GO
IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_parametre') AND name=N'IDX_Mot_Cle')
  CREATE INDEX [IDX_Mot_Cle] ON dbo.[t_parametre] ([Mot_Cle]);
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

IF OBJECT_ID(N'dbo.t_plan', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_plan] (
    [Id_Plan] INT IDENTITY(1,1) NOT NULL,
    [Image] VARBINARY(MAX) NULL,
    [Titre] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_plan] PRIMARY KEY ([Id_Plan])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_plan') AND name=N'Plan_Titre_IDX')
  CREATE UNIQUE INDEX [Plan_Titre_IDX] ON dbo.[t_plan] ([Titre]) WHERE [Titre] IS NOT NULL;
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
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_postes_clients') AND name=N'nomMachineId')
  CREATE UNIQUE INDEX [nomMachineId] ON dbo.[t_postes_clients] ([Nom_Machine_Connexion]) WHERE [Nom_Machine_Connexion] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_profil', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_profil] (
    [Id_Profil] INT IDENTITY(1,1) NOT NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(100) NULL,
    [Est_MC2] BIT NULL DEFAULT('0'),
    [Est_Archive] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_profil] PRIMARY KEY ([Id_Profil])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_profil') AND name=N'Profil_ProfilUtilisateur_IDX')
  CREATE UNIQUE INDEX [Profil_ProfilUtilisateur_IDX] ON dbo.[t_profil] ([Profil_Utilisateur]) WHERE [Profil_Utilisateur] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_profil') AND name=N'IDX_Est_Archive')
  CREATE INDEX [IDX_Est_Archive] ON dbo.[t_profil] ([Est_Archive]);
GO

IF OBJECT_ID(N'dbo.t_site', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_site] (
    [Id_Site] INT IDENTITY(1,1) NOT NULL,
    [Code_Site] VARCHAR(20) NULL,
    [Libelle_Site] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(200) NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_site] PRIMARY KEY ([Id_Site])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_site', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_site') AND name=N'CodeSite_IDX')
  CREATE UNIQUE INDEX [CodeSite_IDX] ON dbo.[t_site] ([Code_Site]) WHERE [Code_Site] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde] (
    [Id_Sonde] INT IDENTITY(1,1) NOT NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Est_Sonde_GSO] BIT NOT NULL DEFAULT('0'),
    [Port_Serie] VARCHAR(10) NULL,
    [Etat_Sonde] VARCHAR(1) NOT NULL DEFAULT('D'),
    [Metrologie_en_cours] BIT NOT NULL DEFAULT('0'),
    [Metrologie_cmd_envoyee] BIT NOT NULL DEFAULT('0'),
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Frequence_Mesure] INT NULL,
    [Frequence_Recup] INT NULL,
    [Est_Sonde_Reformee] BIT NULL,
    [Etat_Sonde_N1] VARCHAR(1) NULL,
    [Id_Worker] INT NULL,
    [Id_Sonde_Etat] INT NULL,
    [Sonde_Offset] FLOAT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_t_sonde] PRIMARY KEY ([Id_Sonde])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'Numero_serie')
  CREATE UNIQUE INDEX [Numero_serie] ON dbo.[t_sonde] ([Sonde_Numero_Serie]) WHERE [Sonde_Numero_Serie] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Id_Module')
  CREATE INDEX [IDX_Id_Module] ON dbo.[t_sonde] ([Id_Module]);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Adresse_Sonde')
  CREATE INDEX [IDX_Adresse_Sonde] ON dbo.[t_sonde] ([Adresse_Sonde]);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Port_Serie')
  CREATE INDEX [IDX_Port_Serie] ON dbo.[t_sonde] ([Port_Serie]);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Etat_Sonde')
  CREATE INDEX [IDX_Etat_Sonde] ON dbo.[t_sonde] ([Etat_Sonde]);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Id_Sonde_Etat')
  CREATE INDEX [IDX_Id_Sonde_Etat] ON dbo.[t_sonde] ([Id_Sonde_Etat]);
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde') AND name=N'IDX_Sonde_Type')
  CREATE INDEX [IDX_Sonde_Type] ON dbo.[t_sonde] ([Sonde_Type]);
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
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde_etat') AND name=N'Etat_Sonde')
  CREATE UNIQUE INDEX [Etat_Sonde] ON dbo.[t_sonde_etat] ([Etat_Sonde]) WHERE [Etat_Sonde] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde_type] (
    [Id_Sonde_Type] INT IDENTITY(1,1) NOT NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Libelle_Sonde_Type] VARCHAR(50) NULL,
    [Est_Gestion_Relais] BIT NULL,
    [Est_Double_Capteur] BIT NOT NULL DEFAULT('0'),
    [Famille_Sonde] VARCHAR(16) NOT NULL DEFAULT('CLASSIC'),
    [Unite] VARCHAR(10) NULL,
    [Valeur_Max] FLOAT NULL,
    [Valeur_Min] FLOAT NULL,
    CONSTRAINT [PK_t_sonde_type] PRIMARY KEY ([Id_Sonde_Type])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_sonde_type') AND name=N'Sonde_Type')
  CREATE UNIQUE INDEX [Sonde_Type] ON dbo.[t_sonde_type] ([Sonde_Type]) WHERE [Sonde_Type] IS NOT NULL;
GO

SET IDENTITY_INSERT dbo.t_sonde_type ON;

MERGE dbo.t_sonde_type AS target
USING (VALUES
    (1, N'E',    N'Sonde radio relais type E',                         1, 0, N'CLASSIC', NULL, NULL, NULL),
    (2, N'G',    N'Sonde radio relais type G',                         1, 0, N'CLASSIC', NULL, NULL, NULL),
    (3, N'H',    N'Sonde radio relais type H',                         1, 0, N'CLASSIC', NULL, NULL, NULL),
    (4, N'I',    N'Sonde radio de type I',                             0, 0, N'CLASSIC', NULL, NULL, NULL),
    (5, N'R',    N'Sonde radio',                                       0, 0, N'CLASSIC', NULL, NULL, NULL),
    (6, N'V',    N'Sonde filaire',                                     0, 0, N'CLASSIC', NULL, NULL, NULL),

    (7, N'GSO',  N'GemSenseOne',                                       0, 0, N'GSO', NULL, NULL, NULL),
    (8, N'GSP',  N'GemSensePro',                                       0, 0, N'GSP', NULL, NULL, NULL),

    (9, N'SOIT', N'Gemsense One Température interne',                  0, 0, N'GSO', N'°C', 40, -30),
    (10,N'SOIH', N'Gemsense One Température & humidité interne',       0, 1, N'GSO', NULL, NULL, NULL),
    (11,N'SOET', N'Gemsense One Température externe',                  0, 0, N'GSO', N'°C', 125, -40),
    (12,N'SOEH', N'Gemsense One Température & humidité externe',       0, 1, N'GSO', NULL, NULL, NULL),

    (13,N'SPNB', N'Gemsense Pro Numérique blanc',                      0, 0, N'GSP', N'°C', 125, -40),
    (14,N'SPNG', N'Gemsense Pro Numérique gris',                       0, 0, N'GSP', N'°C', 70, -40),

    (15,N'SPPS', N'Gemsense Pro platine',                              0, 0, N'GSP', N'°C', NULL, NULL),

    (16,N'SPAL', N'Gemsense Pro platine alimentaire',                  0, 0, N'GSP', N'°C', NULL, NULL),
    (17,N'SPPC', N'Gemsense Pro platine contact',                      0, 0, N'GSP', N'°C', NULL, NULL),
    (18,N'SPAU', N'Gemsense Pro platine autoclave',                    0, 0, N'GSP', N'°C', NULL, NULL),
    (19,N'SPCF', N'Gemsense Pro platine chambre froide',               0, 0, N'GSP', N'°C', NULL, NULL),
    (20,N'SPMI', N'Gemsense Pro platine micro-capteur',                0, 0, N'GSP', N'°C', NULL, NULL),

    (21,N'SPCO', N'Gemsense Pro CO2',                                  0, 0, N'GSP', N'%', 20, 0),
    (22,N'SPHY', N'Gemsense Pro hygrométrie',                          0, 0, N'GSP', N'%', 100, 0),
    (23,N'SPTH', N'Gemsense Pro thermocouple',                         0, 0, N'GSP', N'°C', NULL, NULL),

    (24,N'SPDI', N'Gemsense Pro pression différentielle',              0, 0, N'GSP', NULL, 250, -250),
    (25,N'SPAT', N'Gemsense Pro pression atmosphérique',               0, 0, N'GSP', NULL, 1200, 700),

    (26,N'SPLU', N'Gemsense Pro lumière',                              0, 0, N'GSP', NULL, NULL, NULL),
    (27,N'SP01', N'Gemsense Pro 0-1 Volt',                             0, 0, N'GSP', NULL, NULL, NULL),
    (28,N'SP42', N'Gemsense Pro 4-20 mA',                              0, 0, N'GSP', NULL, NULL, NULL),
    (29,N'SPOF', N'Gemsense Pro NO NF',                                0, 0, N'GSP', NULL, NULL, NULL),

    (30,N'SPXB', N'Gemsense Pro Ethernet numérique blanc',             0, 0, N'GSP', N'°C', 125, -40),
    (31,N'SPXG', N'Gemsense Pro Ethernet numérique gris',              0, 0, N'GSP', N'°C', 70, -40),
    (32,N'SPXP', N'Gemsense Pro Ethernet platine',                     0, 0, N'GSP', N'°C', NULL, NULL),

    (33,N'SPFB', N'Gemsense Pro filaire numérique blanc',              0, 0, N'GSP', N'°C', 125, -40),
    (34,N'SPFG', N'Gemsense Pro filaire numérique gris',               0, 0, N'GSP', N'°C', 70, -40),
    (35,N'SPFP', N'Gemsense Pro filaire platine',                      0, 0, N'GSP', N'°C', NULL, NULL)
) AS source (
    Id_Sonde_Type,
    Sonde_Type,
    Libelle_Sonde_Type,
    Est_Gestion_Relais,
    Est_Double_Capteur,
    Famille_Sonde,
    Unite,
    Valeur_Max,
    Valeur_Min
)
ON target.Id_Sonde_Type = source.Id_Sonde_Type

WHEN MATCHED THEN UPDATE SET
    Sonde_Type = source.Sonde_Type,
    Libelle_Sonde_Type = source.Libelle_Sonde_Type,
    Est_Gestion_Relais = source.Est_Gestion_Relais,
    Est_Double_Capteur = source.Est_Double_Capteur,
    Famille_Sonde = source.Famille_Sonde,
    Unite = source.Unite,
    Valeur_Max = source.Valeur_Max,
    Valeur_Min = source.Valeur_Min

WHEN NOT MATCHED THEN INSERT (
    Id_Sonde_Type,
    Sonde_Type,
    Libelle_Sonde_Type,
    Est_Gestion_Relais,
    Est_Double_Capteur,
    Famille_Sonde,
    Unite,
    Valeur_Max,
    Valeur_Min
)
VALUES (
    source.Id_Sonde_Type,
    source.Sonde_Type,
    source.Libelle_Sonde_Type,
    source.Est_Gestion_Relais,
    source.Est_Double_Capteur,
    source.Famille_Sonde,
    source.Unite,
    source.Valeur_Max,
    source.Valeur_Min
);

SET IDENTITY_INSERT dbo.t_sonde_type OFF;
GO

IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_utilisateur] (
    [Id_Utilisateur] INT IDENTITY(1,1) NOT NULL,
    [Login] VARCHAR(64) NULL,
    [Mot_De_Passe] VARCHAR(60) NULL,
    [Date_Validite] DATE NULL,
    [Date_Creation] DATE NULL,
    [Est_Archive] BIT NULL DEFAULT('0'),
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
    [Est_Mot_De_Passe_Temporaire] BIT NULL DEFAULT('0'),
    [Avatar_Utilisateur] VARCHAR(512) NULL,
    CONSTRAINT [PK_t_utilisateur] PRIMARY KEY ([Id_Utilisateur])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_utilisateur') AND name=N'Utilisateur_Nom_IDX')
  CREATE UNIQUE INDEX [Utilisateur_Nom_IDX] ON dbo.[t_utilisateur] ([Login]) WHERE [Login] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_utilisateur') AND name=N'Login')
  CREATE UNIQUE INDEX [Login] ON dbo.[t_utilisateur] ([Login]) WHERE [Login] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_utilisateur') AND name=N'IDX_Est_Archive')
  CREATE INDEX [IDX_Est_Archive] ON dbo.[t_utilisateur] ([Est_Archive]);
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_utilisateur') AND name=N'IDX_Profil_Utilisateur')
  CREATE INDEX [IDX_Profil_Utilisateur] ON dbo.[t_utilisateur] ([Profil_Utilisateur]);
GO

IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog] (
    [Id_VigiLog] INT IDENTITY(1,1) NOT NULL,
    [Numero_Serie] VARCHAR(30) NOT NULL,
    [Modele] VARCHAR(50) NULL,
    [Libelle] VARCHAR(100) NULL,
    [Actif] BIT NOT NULL DEFAULT('1'),
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
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog') AND name=N'UK_t_vigilog_numero_serie')
  CREATE UNIQUE INDEX [UK_t_vigilog_numero_serie] ON dbo.[t_vigilog] ([Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog') AND name=N'IDX_t_vigilog_actif')
  CREATE INDEX [IDX_t_vigilog_actif] ON dbo.[t_vigilog] ([Actif]);
GO
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog') AND name=N'IDX_t_vigilog_modele')
  CREATE INDEX [IDX_t_vigilog_modele] ON dbo.[t_vigilog] ([Modele]);
GO

IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_configuration] (
    [Id_VigiLog_Configuration] INT IDENTITY(1,1) NOT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Description_Configuration] VARCHAR(255) NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Limite_Basse_Active] BIT NOT NULL DEFAULT('0'),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT('0'),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT('0'),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT('1'),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT('1'),
    [Actif] BIT NOT NULL DEFAULT('1'),
    [Id_Utilisateur_Creation] INT NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Maj] INT NULL,
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_configuration] PRIMARY KEY ([Id_VigiLog_Configuration])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_configuration') AND name=N'UK_t_vigilog_configuration_nom')
  CREATE UNIQUE INDEX [UK_t_vigilog_configuration_nom] ON dbo.[t_vigilog_configuration] ([Nom_Configuration]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_configuration') AND name=N'IDX_t_vigilog_configuration_user_create')
  CREATE INDEX [IDX_t_vigilog_configuration_user_create] ON dbo.[t_vigilog_configuration] ([Id_Utilisateur_Creation]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_configuration') AND name=N'IDX_t_vigilog_configuration_user_update')
  CREATE INDEX [IDX_t_vigilog_configuration_user_update] ON dbo.[t_vigilog_configuration] ([Id_Utilisateur_Maj]);
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
    [Limite_Basse_Active] BIT NOT NULL DEFAULT('0'),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT('0'),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT('0'),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT('1'),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT('1'),
    [Nb_Mesures] INT NOT NULL DEFAULT('0'),
    [Temperature_Min] DECIMAL(10,2) NULL,
    [Temperature_Moyenne] DECIMAL(10,2) NULL,
    [Temperature_Max] DECIMAL(10,2) NULL,
    [Duree_Hors_Limites_Secondes] INT NOT NULL DEFAULT('0'),
    [Duree_Alarme_Secondes] INT NOT NULL DEFAULT('0'),
    [Est_Depassement_Limites] BIT NOT NULL DEFAULT('0'),
    [Est_Alarme] BIT NOT NULL DEFAULT('0'),
    [Est_Acquittee] BIT NOT NULL DEFAULT('0'),
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
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'UK_t_vigilog_tournee_reference')
  CREATE UNIQUE INDEX [UK_t_vigilog_tournee_reference] ON dbo.[t_vigilog_tournee] ([Reference_Tournee]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_config')
  CREATE INDEX [IDX_t_vigilog_tournee_config] ON dbo.[t_vigilog_tournee] ([Id_VigiLog_Configuration]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_site_depart')
  CREATE INDEX [IDX_t_vigilog_tournee_site_depart] ON dbo.[t_vigilog_tournee] ([Id_Site_Depart]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_site_arrivee')
  CREATE INDEX [IDX_t_vigilog_tournee_site_arrivee] ON dbo.[t_vigilog_tournee] ([Id_Site_Arrivee]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_logger')
  CREATE INDEX [IDX_t_vigilog_tournee_logger] ON dbo.[t_vigilog_tournee] ([Numero_Serie_VigiLog]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_statut')
  CREATE INDEX [IDX_t_vigilog_tournee_statut] ON dbo.[t_vigilog_tournee] ([Statut]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_depart_user')
  CREATE INDEX [IDX_t_vigilog_tournee_depart_user] ON dbo.[t_vigilog_tournee] ([Id_Utilisateur_Depart]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_arrivee_user')
  CREATE INDEX [IDX_t_vigilog_tournee_arrivee_user] ON dbo.[t_vigilog_tournee] ([Id_Utilisateur_Arrivee]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_acquit_user')
  CREATE INDEX [IDX_t_vigilog_tournee_acquit_user] ON dbo.[t_vigilog_tournee] ([Id_Utilisateur_Acquittement]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_tournee') AND name=N'IDX_t_vigilog_tournee_vigilog')
  CREATE INDEX [IDX_t_vigilog_tournee_vigilog] ON dbo.[t_vigilog_tournee] ([Id_VigiLog]);
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
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'UK_t_vigilog_usage_ponctuel_reference')
  CREATE UNIQUE INDEX [UK_t_vigilog_usage_ponctuel_reference] ON dbo.[t_vigilog_usage_ponctuel] ([Reference_Usage]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'IDX_t_vigilog_usage_ponctuel_statut')
  CREATE INDEX [IDX_t_vigilog_usage_ponctuel_statut] ON dbo.[t_vigilog_usage_ponctuel] ([Statut]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'IDX_t_vigilog_usage_ponctuel_logger')
  CREATE INDEX [IDX_t_vigilog_usage_ponctuel_logger] ON dbo.[t_vigilog_usage_ponctuel] ([Numero_Serie_VigiLog]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'IDX_t_vigilog_usage_ponctuel_started_by')
  CREATE INDEX [IDX_t_vigilog_usage_ponctuel_started_by] ON dbo.[t_vigilog_usage_ponctuel] ([Id_Utilisateur_Demarrage]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'IDX_t_vigilog_usage_ponctuel_stopped_by')
  CREATE INDEX [IDX_t_vigilog_usage_ponctuel_stopped_by] ON dbo.[t_vigilog_usage_ponctuel] ([Id_Utilisateur_Arret]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'FK_t_vigilog_usage_ponctuel_configuration')
  CREATE INDEX [FK_t_vigilog_usage_ponctuel_configuration] ON dbo.[t_vigilog_usage_ponctuel] ([Id_VigiLog_Configuration]);
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel') AND name=N'FK_t_vigilog_usage_ponctuel_logger')
  CREATE INDEX [FK_t_vigilog_usage_ponctuel_logger] ON dbo.[t_vigilog_usage_ponctuel] ([Id_VigiLog]);
GO

-- =====================================================================
-- Better Auth - schema preparatoire (runtime legacy conserve)
-- =====================================================================
-- Ces tables preparent BA-2 sans activer Better Auth dans l'application.
-- Conformement a ce seed SQL Server, les FK ne sont pas materialisees ici.
-- t_utilisateur reste l'identite metier de reference.
IF OBJECT_ID(N'dbo.t_auth_user', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_auth_user] (
    [id] VARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [emailVerified] BIT NOT NULL DEFAULT(0),
    [image] NVARCHAR(MAX) NULL,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [username] NVARCHAR(255) NULL,
    [displayUsername] NVARCHAR(255) NULL,
    [vigisensysUserId] INT NULL,
    CONSTRAINT [PK_t_auth_user] PRIMARY KEY ([id])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_auth_user', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_user') AND name=N'UK_t_auth_user_email')
  CREATE UNIQUE INDEX [UK_t_auth_user_email] ON dbo.[t_auth_user] ([email]);
GO
IF OBJECT_ID(N'dbo.t_auth_user', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_user') AND name=N'UK_t_auth_user_username')
  CREATE UNIQUE INDEX [UK_t_auth_user_username] ON dbo.[t_auth_user] ([username]) WHERE [username] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.t_auth_user', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_user') AND name=N'UK_t_auth_user_vigisensys_user')
  CREATE UNIQUE INDEX [UK_t_auth_user_vigisensys_user] ON dbo.[t_auth_user] ([vigisensysUserId]) WHERE [vigisensysUserId] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_auth_session', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_auth_session] (
    [id] VARCHAR(255) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [token] VARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    [ipAddress] VARCHAR(64) NULL,
    [userAgent] NVARCHAR(512) NULL,
    [userId] VARCHAR(255) NOT NULL,
    CONSTRAINT [PK_t_auth_session] PRIMARY KEY ([id])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_auth_session', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_session') AND name=N'UK_t_auth_session_token')
  CREATE UNIQUE INDEX [UK_t_auth_session_token] ON dbo.[t_auth_session] ([token]);
GO
IF OBJECT_ID(N'dbo.t_auth_session', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_session') AND name=N'IDX_t_auth_session_user')
  CREATE INDEX [IDX_t_auth_session_user] ON dbo.[t_auth_session] ([userId]);
GO

IF OBJECT_ID(N'dbo.t_auth_account', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_auth_account] (
    [id] VARCHAR(255) NOT NULL,
    [accountId] VARCHAR(255) NOT NULL,
    [providerId] VARCHAR(255) NOT NULL,
    [userId] VARCHAR(255) NOT NULL,
    [accessToken] NVARCHAR(MAX) NULL,
    [refreshToken] NVARCHAR(MAX) NULL,
    [idToken] NVARCHAR(MAX) NULL,
    [accessTokenExpiresAt] DATETIME2 NULL,
    [refreshTokenExpiresAt] DATETIME2 NULL,
    [scope] NVARCHAR(1024) NULL,
    [password] VARCHAR(255) NULL,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_t_auth_account] PRIMARY KEY ([id])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_auth_account', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_account') AND name=N'UK_t_auth_account_provider_account')
  CREATE UNIQUE INDEX [UK_t_auth_account_provider_account] ON dbo.[t_auth_account] ([providerId], [accountId]);
GO
IF OBJECT_ID(N'dbo.t_auth_account', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_account') AND name=N'IDX_t_auth_account_user')
  CREATE INDEX [IDX_t_auth_account_user] ON dbo.[t_auth_account] ([userId]);
GO

IF OBJECT_ID(N'dbo.t_auth_verification', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_auth_verification] (
    [id] VARCHAR(255) NOT NULL,
    [identifier] NVARCHAR(255) NOT NULL,
    [value] NVARCHAR(MAX) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_t_auth_verification] PRIMARY KEY ([id])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_auth_verification', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.t_auth_verification') AND name=N'IDX_t_auth_verification_identifier')
  CREATE INDEX [IDX_t_auth_verification_identifier] ON dbo.[t_auth_verification] ([identifier]);
GO

IF DB_ID(N'vigi_mesures') IS NULL
BEGIN
  CREATE DATABASE [vigi_mesures];
END;
GO
USE [vigi_mesures];
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

IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_graphique] (
    [Id_Graphique] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Planning_Actif] BIT NULL DEFAULT('0'),
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Id_Sonde] INT NULL,
    [Id_Lieu] INT NOT NULL DEFAULT('0'),
    [Est_Valeur_Null] BIT NOT NULL DEFAULT('0'),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] TINYINT NOT NULL DEFAULT('0'),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    CONSTRAINT [PK_tm_graphique] PRIMARY KEY ([Id_Graphique], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null], [Est_Etat_Alarme])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_graphique') AND name=N'IDX_Date_Heure_Mesure')
  CREATE INDEX [IDX_Date_Heure_Mesure] ON dbo.[tm_graphique] ([Date_Heure_Mesure]);
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_graphique') AND name=N'IDX_Id_Lieu')
  CREATE INDEX [IDX_Id_Lieu] ON dbo.[tm_graphique] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_graphique') AND name=N'IDX_Etat_Alarme')
  CREATE INDEX [IDX_Etat_Alarme] ON dbo.[tm_graphique] ([Est_Etat_Alarme]);
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_graphique') AND name=N'IDX_Valeur_Null')
  CREATE INDEX [IDX_Valeur_Null] ON dbo.[tm_graphique] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_graphique') AND name=N'IDX_Id_Sonde_Date_Heure_Mesure')
  CREATE INDEX [IDX_Id_Sonde_Date_Heure_Mesure] ON dbo.[tm_graphique] ([Id_Sonde], [Date_Heure_Mesure]);
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
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'IDX_Code_Journal')
  CREATE INDEX [IDX_Code_Journal] ON dbo.[tm_journal] ([Code_Journal]);
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'IDX_Nom_Utilisateur')
  CREATE INDEX [IDX_Nom_Utilisateur] ON dbo.[tm_journal] ([Nom_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'IDX_Profil_Utilisateur')
  CREATE INDEX [IDX_Profil_Utilisateur] ON dbo.[tm_journal] ([Profil_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'IDX_Date_Heure_Journal')
  CREATE INDEX [IDX_Date_Heure_Journal] ON dbo.[tm_journal] ([Date_Heure_Journal]);
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'Id_Journal')
  CREATE INDEX [Id_Journal] ON dbo.[tm_journal] ([Id_Journal]);
GO
IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal') AND name=N'IDX_tm_journal_Id_Lieu')
  CREATE INDEX [IDX_tm_journal_Id_Lieu] ON dbo.[tm_journal] ([Id_Lieu]);
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

INSERT INTO [tm_journal_code] ([Code_Journal], [Commentaire])
VALUES
    ('AACT', 'Association d''un module d''alarme'),
    ('ACQ', 'Acquittement alarme'),
    ('ACT', 'Activer la surveillance'),
    ('ACTU', 'Reactivation de l''utilisateur'),
    ('AIM', 'Analyse d''impact des mesures'),
    ('AJE', 'Ajoute evenement manuel'),
    ('ARC', 'Archivage des données'),
    ('AS', 'Arret de la surveillance'),
    ('AT', 'Activation de la surveillance telephonique'),
    ('CA', 'Demarrage d''un calibrage pour la sonde'),
    ('CC', 'Changement sur un element'),
    ('CDA', 'Changement d''etat du datalogger'),
    ('CF', 'Changement de frequence'),
    ('CONNEXION', 'Connexion de l''utilisateur'),
    ('CR', 'Changement de retard d''alarme'),
    ('CS', 'Changement de sonde'),
    ('DECONNEXION', 'Deconnexion de l''utilisateur'),
    ('DES', 'Desactiver la surveillance'),
    ('DS', 'Demarrage de la surveillance'),
    ('DT', 'Desactivation de la surveillance telephonique'),
    ('ET', 'Demarrage d''un etalonnage pour la sonde'),
    ('FERMSURV', 'Fermeture de la fenètre de surveillance'),
    ('GRPH', 'Ouverture d''un graphique'),
    ('IMP', 'Import de donnees'),
    ('MDP', 'Changement fiche utilisateur'),
    ('PLAN', 'Modification du planning'),
    ('PS', 'Le gestionnaire de port serie virtuel relancé'),
    ('SACT', 'Suppression du module d''alarme associée'),
    ('TC', 'Test de connexion de la sonde'),
    ('TEL', 'Systeme'),
    ('UT', ''),
    ('VLOG', 'Action VigiLog');

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
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_commentaire_libre') AND name=N'IDX_tm_journal_commentaire_libre_code')
  CREATE INDEX [IDX_tm_journal_commentaire_libre_code] ON dbo.[tm_journal_commentaire_libre] ([Code_Journal]);
GO
IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_commentaire_libre') AND name=N'IDX_tm_journal_commentaire_libre_date_creation')
  CREATE INDEX [IDX_tm_journal_commentaire_libre_date_creation] ON dbo.[tm_journal_commentaire_libre] ([Date_Creation]);
GO

IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_histo] (
    [Id_Journal_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Id_Journal] INT NOT NULL DEFAULT('0'),
    [Code_Journal] VARCHAR(50) NULL DEFAULT(''),
    [Commentaire] NVARCHAR(MAX) NULL,
    [Nom_Utilisateur] VARCHAR(50) NULL DEFAULT(''),
    [Profil_Utilisateur] VARCHAR(50) NULL DEFAULT(''),
    [Date_Heure_Journal] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Commentaire_Utilisateur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_journal_histo] PRIMARY KEY ([Id_Journal_Histo], [Id_Serveur_BDD], [Id_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_histo') AND name=N'IDX_Code_Journal')
  CREATE INDEX [IDX_Code_Journal] ON dbo.[tm_journal_histo] ([Code_Journal]);
GO
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_histo') AND name=N'IDX_Nom_Utilisateur')
  CREATE INDEX [IDX_Nom_Utilisateur] ON dbo.[tm_journal_histo] ([Nom_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_histo') AND name=N'IDX_Profil_Utilisateur')
  CREATE INDEX [IDX_Profil_Utilisateur] ON dbo.[tm_journal_histo] ([Profil_Utilisateur]);
GO
IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_journal_histo') AND name=N'IDX_Date_Heure_Journal')
  CREATE INDEX [IDX_Date_Heure_Journal] ON dbo.[tm_journal_histo] ([Date_Heure_Journal]);
GO

IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures] (
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Est_Valeur_Memoire] BIT NOT NULL DEFAULT('0'),
    [Planning_Regle_Existe] BIT NULL DEFAULT('0'),
    [Planning_Actif] BIT NULL DEFAULT('0'),
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL DEFAULT(''),
    [Sonde_Numero_Serie] VARCHAR(50) NULL DEFAULT(''),
    [Adresse_Sonde] VARCHAR(50) NULL,
    [COM_sonde] FLOAT NULL,
    [Est_Mesure_Repeteur_GSO] FLOAT NULL DEFAULT('0'),
    [Id_Lieu] INT NOT NULL DEFAULT('0'),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT('0'),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] BIT NOT NULL DEFAULT('0'),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    [Rssi] VARCHAR(10) NULL,
    [Tension] VARCHAR(10) NULL,
    CONSTRAINT [PK_tm_mesures] PRIMARY KEY ([Id_Serveur_BDD], [Id_Mesure], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'IDX_Date_Heure_Mesure')
  CREATE INDEX [IDX_Date_Heure_Mesure] ON dbo.[tm_mesures] ([Date_Heure_Mesure]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'IDX_Est_Etat_Alarme')
  CREATE INDEX [IDX_Est_Etat_Alarme] ON dbo.[tm_mesures] ([Est_Etat_Alarme]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'Mesure_Numero_lieu_IDX')
  CREATE INDEX [Mesure_Numero_lieu_IDX] ON dbo.[tm_mesures] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'Mesure_lieu')
  CREATE INDEX [Mesure_lieu] ON dbo.[tm_mesures] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'IDX_Date_Heure_Mesure_Id_Lieu')
  CREATE INDEX [IDX_Date_Heure_Mesure_Id_Lieu] ON dbo.[tm_mesures] ([Date_Heure_Mesure], [Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures') AND name=N'Id_Mesure')
  CREATE INDEX [Id_Mesure] ON dbo.[tm_mesures] ([Id_Mesure]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_ajustage] (
    [Id_Mesure_Ajustage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Adresse_Sonde] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_tm_mesures_ajustage] PRIMARY KEY ([Id_Mesure_Ajustage], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage') AND name=N'IDX_Valeur')
  CREATE INDEX [IDX_Valeur] ON dbo.[tm_mesures_ajustage] ([Valeur]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage') AND name=N'IDX_Valeur_Brute')
  CREATE INDEX [IDX_Valeur_Brute] ON dbo.[tm_mesures_ajustage] ([Valeur_Brute]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_ajustage] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage') AND name=N'IDX_Sonde_Numero_Serie')
  CREATE INDEX [IDX_Sonde_Numero_Serie] ON dbo.[tm_mesures_ajustage] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage') AND name=N'IDX_Date_Heure')
  CREATE INDEX [IDX_Date_Heure] ON dbo.[tm_mesures_ajustage] ([Date_Heure_Mesure]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_ajustage_etalon] (
    [Id_Mesure_Ajustage_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT('0'),
    [Date_Heure_Mesure] DATETIME NOT NULL,
    CONSTRAINT [PK_tm_mesures_ajustage_etalon] PRIMARY KEY ([Id_Mesure_Ajustage_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon') AND name=N'IDX_Valeur')
  CREATE INDEX [IDX_Valeur] ON dbo.[tm_mesures_ajustage_etalon] ([Valeur]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon') AND name=N'IDX_Valeur_Brute')
  CREATE INDEX [IDX_Valeur_Brute] ON dbo.[tm_mesures_ajustage_etalon] ([Valeur_Brute]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_ajustage_etalon] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon') AND name=N'IDX_Etalon_Numero_Serie')
  CREATE INDEX [IDX_Etalon_Numero_Serie] ON dbo.[tm_mesures_ajustage_etalon] ([Etalon_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon') AND name=N'IDX_Date_Heure')
  CREATE INDEX [IDX_Date_Heure] ON dbo.[tm_mesures_ajustage_etalon] ([Date_Heure_Mesure]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_etalon] (
    [Id_Mesure_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL,
    [Message_Erreur] VARCHAR(50) NOT NULL DEFAULT(''),
    CONSTRAINT [PK_tm_mesures_etalon] PRIMARY KEY ([Id_Mesure_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalon') AND name=N'IDX_Valeur_Brute')
  CREATE INDEX [IDX_Valeur_Brute] ON dbo.[tm_mesures_etalon] ([Valeur_Brute]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalon') AND name=N'IDX_Etalon_Numero_Serie')
  CREATE INDEX [IDX_Etalon_Numero_Serie] ON dbo.[tm_mesures_etalon] ([Etalon_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalon') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_etalon] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalon') AND name=N'IDX_Date_Heure')
  CREATE INDEX [IDX_Date_Heure] ON dbo.[tm_mesures_etalon] ([Date_Heure]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalon') AND name=N'IDX_Message_Erreur')
  CREATE INDEX [IDX_Message_Erreur] ON dbo.[tm_mesures_etalon] ([Message_Erreur]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_etalonnage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_etalonnage] (
    [Id_Mesure_Etalonnage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Sonde_Numero_serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Numero_Ordre] INT NULL,
    [Mesure_Sonde] FLOAT NULL,
    [Mesure_Etalon] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_etalonnage] PRIMARY KEY ([Id_Mesure_Etalonnage], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_etalonnage', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_etalonnage') AND name=N'IDX_Sonde_Numero_serie')
  CREATE INDEX [IDX_Sonde_Numero_serie] ON dbo.[tm_mesures_etalonnage] ([Sonde_Numero_serie]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso] (
    [Id_mesures_gso] INT IDENTITY(1,1) NOT NULL,
    [id_capteur] VARCHAR(50) NOT NULL DEFAULT(''),
    [tep] FLOAT NULL,
    [unite] VARCHAR(10) NULL DEFAULT(''),
    [date_mesure] DATETIME NOT NULL,
    [trame] BINARY(8) NULL,
    [rssi] VARCHAR(10) NULL,
    [tension] VARCHAR(10) NULL,
    [COM_sonde] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_gso] PRIMARY KEY ([id_capteur], [date_mesure])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_gso') AND name=N'Id_mesures_gso')
  CREATE INDEX [Id_mesures_gso] ON dbo.[tm_mesures_gso] ([Id_mesures_gso]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_build', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_build] (
    [Date_Heure_Mesure] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Est_Valeur_Memoire] BIT NOT NULL DEFAULT('0'),
    [Planning_Regle_Existe] BIT NULL DEFAULT('0'),
    [Planning_Actif] BIT NULL DEFAULT('0'),
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL DEFAULT(''),
    [Sonde_Numero_Serie] VARCHAR(50) NULL DEFAULT(''),
    [Adresse_Sonde] VARCHAR(50) NULL,
    [COM_sonde] FLOAT NULL,
    [Est_Mesure_Repeteur_GSO] FLOAT NULL DEFAULT('0'),
    [Id_Lieu] INT NOT NULL DEFAULT('0'),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Rssi] VARCHAR(10) NULL,
    [Tension] VARCHAR(10) NULL
  );
END;
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_commandes_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_commandes_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    [Commande_Globale_Begin] FLOAT NOT NULL DEFAULT('0'),
    [Commande_Globale_End] FLOAT NOT NULL DEFAULT('0'),
    [Missing_Data_Total] FLOAT NOT NULL DEFAULT('0'),
    [Commande_Mem_Globale] VARCHAR(50) NULL,
    [Date_Calcul] DATETIME NOT NULL,
    [Statut] VARCHAR(20) NOT NULL DEFAULT('0'),
    [Date_Heure_Demande_Mem] DATETIME NULL,
    CONSTRAINT [PK_tm_mesures_gso_commandes_mem] PRIMARY KEY ([GSO_SN], [Commande_Globale_Begin], [Commande_Globale_End], [Missing_Data_Total])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso_commandes_mem', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_gso_commandes_mem') AND name=N'Id')
  CREATE INDEX [Id] ON dbo.[tm_mesures_gso_commandes_mem] ([Id]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_count_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_count_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    [Missing_Data_Begin] FLOAT NOT NULL DEFAULT('0'),
    [Missing_Data_End] FLOAT NOT NULL DEFAULT('0'),
    [Missing_Data_Total] FLOAT NOT NULL DEFAULT('0'),
    [Commande_Mem] VARCHAR(50) NULL,
    [Statut] VARCHAR(20) NOT NULL DEFAULT('0'),
    [date_calcul] DATETIME NOT NULL,
    [Date_Heure_Demande_Mem] DATETIME NULL,
    CONSTRAINT [PK_tm_mesures_gso_count_mem] PRIMARY KEY ([GSO_SN], [Missing_Data_Begin], [Missing_Data_End], [date_calcul])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso_count_mem', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_gso_count_mem') AND name=N'Id')
  CREATE INDEX [Id] ON dbo.[tm_mesures_gso_count_mem] ([Id]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_read_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_read_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Ecart] VARCHAR(32) NULL,
    [Date_Heure_Read_Mem] DATETIME NULL
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso_read_mem', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_gso_read_mem') AND name=N'Id')
  CREATE INDEX [Id] ON dbo.[tm_mesures_gso_read_mem] ([Id]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_read_metro', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_read_metro] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Commande_metro] VARCHAR(32) NOT NULL,
    [Commande_metro_envoyee] BIT NOT NULL DEFAULT('0'),
    [Metro_en_cours] BIT NOT NULL DEFAULT('0'),
    [Dernier_Date_MAJ] DATETIME NULL,
    CONSTRAINT [PK_tm_mesures_gso_read_metro] PRIMARY KEY ([GSO_SN], [Commande_metro])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_gso_read_metro', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_gso_read_metro') AND name=N'Id')
  CREATE INDEX [Id] ON dbo.[tm_mesures_gso_read_metro] ([Id]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_histo] (
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Nb_decimal] TINYINT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL DEFAULT(''),
    [Sonde_Numero_Serie] VARCHAR(50) NULL DEFAULT(''),
    [Id_Lieu] INT NOT NULL DEFAULT('0'),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT('0'),
    [Frequence] INT NULL,
    [Est_En_Alarme] BIT NULL DEFAULT('0'),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_histo] PRIMARY KEY ([Id_Mesure], [Id_Serveur_BDD], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'IDX_Date_Heure_Mesure')
  CREATE INDEX [IDX_Date_Heure_Mesure] ON dbo.[tm_mesures_histo] ([Date_Heure_Mesure]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'IDX_Est_En_Alarme')
  CREATE INDEX [IDX_Est_En_Alarme] ON dbo.[tm_mesures_histo] ([Est_En_Alarme]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'Mesure_Numero_lieu_IDX')
  CREATE INDEX [Mesure_Numero_lieu_IDX] ON dbo.[tm_mesures_histo] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'IDX_Date_Heure_Mesure_Id_Lieu')
  CREATE INDEX [IDX_Date_Heure_Mesure_Id_Lieu] ON dbo.[tm_mesures_histo] ([Date_Heure_Mesure], [Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'Mesure_lieu')
  CREATE INDEX [Mesure_lieu] ON dbo.[tm_mesures_histo] ([Id_Lieu]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_histo') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_histo] ([Est_Valeur_Null]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test] (
    [Id_Mesure_Test] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur_Brute] FLOAT NOT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT('0'),
    [Nombre_Recu] INT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_tm_mesures_test] PRIMARY KEY ([Id_Mesure_Test], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test') AND name=N'Sonde')
  CREATE UNIQUE INDEX [Sonde] ON dbo.[tm_mesures_test] ([Sonde_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_test] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test') AND name=N'IDX_Date_Heure')
  CREATE INDEX [IDX_Date_Heure] ON dbo.[tm_mesures_test] ([Date_Heure]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test') AND name=N'IDX_Nombre_Total')
  CREATE INDEX [IDX_Nombre_Total] ON dbo.[tm_mesures_test] ([Nombre_Total]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test') AND name=N'IDX_Nombre_Recu')
  CREATE INDEX [IDX_Nombre_Recu] ON dbo.[tm_mesures_test] ([Nombre_Recu]);
GO

IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test_etalon] (
    [Id_Mesure_Test_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT('0'),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT('0'),
    [Nombre_Recu] INT NOT NULL DEFAULT('0'),
    CONSTRAINT [PK_tm_mesures_test_etalon] PRIMARY KEY ([Id_Mesure_Test_Etalon], [Id_Serveur_BDD])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test_etalon') AND name=N'Etalon')
  CREATE UNIQUE INDEX [Etalon] ON dbo.[tm_mesures_test_etalon] ([Etalon_Numero_Serie]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test_etalon') AND name=N'IDX_Est_Valeur_Null')
  CREATE INDEX [IDX_Est_Valeur_Null] ON dbo.[tm_mesures_test_etalon] ([Est_Valeur_Null]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test_etalon') AND name=N'IDX_Date_Heure')
  CREATE INDEX [IDX_Date_Heure] ON dbo.[tm_mesures_test_etalon] ([Date_Heure]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test_etalon') AND name=N'IDX_Nombre_Total')
  CREATE INDEX [IDX_Nombre_Total] ON dbo.[tm_mesures_test_etalon] ([Nombre_Total]);
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_mesures_test_etalon') AND name=N'IDX_Nombre_Recu')
  CREATE INDEX [IDX_Nombre_Recu] ON dbo.[tm_mesures_test_etalon] ([Nombre_Recu]);
GO

IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mode_degrade] (
    [Id_Mode_Degrade] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Date_Heure_Creation] DATETIME NULL,
    [Requete_SQL] VARCHAR(500) NULL,
    [Est_Archivee] BIT NOT NULL DEFAULT('0'),
    [Date_Heure_Archive] DATETIME NULL,
    CONSTRAINT [PK_tm_mode_degrade] PRIMARY KEY ([Id_Mode_Degrade])
  );
END;
GO

IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_parametre] (
    [Id_Parametre] INT IDENTITY(1,1) NOT NULL,
    [Cle_Parametre] VARCHAR(20) NOT NULL DEFAULT(''),
    [Valeur_Parametre] VARCHAR(50) NULL,
    [Groupe_Parametre] VARCHAR(50) NULL,
    [Commentaire_Parametre] VARCHAR(100) NULL,
    CONSTRAINT [PK_tm_parametre] PRIMARY KEY ([Id_Parametre], [Cle_Parametre])
  );
END;
GO

IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_remontee_plage_gsp] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [GSP_SN] VARCHAR(50) NOT NULL,
    [Date_Heure_Debut] DATETIME NOT NULL,
    [Date_Heure_Fin] DATETIME NOT NULL,
    [Statut] VARCHAR(20) NOT NULL DEFAULT('A_FAIRE'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Derniere_Maj] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nb_Tentatives] INT NOT NULL DEFAULT('0'),
    [Derniere_Erreur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_remontee_plage_gsp] PRIMARY KEY ([Id])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_remontee_plage_gsp') AND name=N'IDX_tm_remontee_plage_gsp_lieu_sonde_statut')
  CREATE INDEX [IDX_tm_remontee_plage_gsp_lieu_sonde_statut] ON dbo.[tm_remontee_plage_gsp] ([Id_Lieu], [GSP_SN], [Statut]);
GO
IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_remontee_plage_gsp') AND name=N'IDX_tm_remontee_plage_gsp_debut')
  CREATE INDEX [IDX_tm_remontee_plage_gsp_debut] ON dbo.[tm_remontee_plage_gsp] ([Date_Heure_Debut]);
GO
IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_remontee_plage_gsp') AND name=N'IDX_tm_remontee_plage_gsp_fin')
  CREATE INDEX [IDX_tm_remontee_plage_gsp_fin] ON dbo.[tm_remontee_plage_gsp] ([Date_Heure_Fin]);
GO

IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_vigilog_mesure] (
    [Id_VigiLog_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_VigiLog_Tournee] INT NOT NULL,
    [Numero_Ordre] INT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] DECIMAL(10,2) NULL,
    [Est_Hors_Limites] BIT NOT NULL DEFAULT('0'),
    [Est_En_Alarme] BIT NOT NULL DEFAULT('0'),
    [Est_Marqueur] BIT NOT NULL DEFAULT('0'),
    [Details] VARCHAR(200) NULL,
    [Date_Heure_Import] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_tm_vigilog_mesure] PRIMARY KEY ([Id_VigiLog_Mesure])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_vigilog_mesure') AND name=N'UK_tm_vigilog_mesure_unique')
  CREATE UNIQUE INDEX [UK_tm_vigilog_mesure_unique] ON dbo.[tm_vigilog_mesure] ([Id_VigiLog_Tournee], [Date_Heure_Mesure], [Numero_Ordre]) WHERE [Numero_Ordre] IS NOT NULL;
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_vigilog_mesure') AND name=N'IDX_tm_vigilog_mesure_tournee')
  CREATE INDEX [IDX_tm_vigilog_mesure_tournee] ON dbo.[tm_vigilog_mesure] ([Id_VigiLog_Tournee]);
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_vigilog_mesure') AND name=N'IDX_tm_vigilog_mesure_date')
  CREATE INDEX [IDX_tm_vigilog_mesure_date] ON dbo.[tm_vigilog_mesure] ([Date_Heure_Mesure]);
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_vigilog_mesure') AND name=N'IDX_tm_vigilog_mesure_alarm')
  CREATE INDEX [IDX_tm_vigilog_mesure_alarm] ON dbo.[tm_vigilog_mesure] ([Est_En_Alarme]);
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.tm_vigilog_mesure') AND name=N'IDX_tm_vigilog_mesure_marker')
  CREATE INDEX [IDX_tm_vigilog_mesure_marker] ON dbo.[tm_vigilog_mesure] ([Est_Marqueur]);
GO

USE [vigi_main];
GO

-- Donnees minimales obligatoires main
SET IDENTITY_INSERT dbo.t_profil ON;
MERGE dbo.t_profil AS target
USING (VALUES
  (1, N'Administrateurs', NULL, 0, 0)
) AS source (Id_Profil, Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive)
ON target.Id_Profil = source.Id_Profil
WHEN MATCHED THEN UPDATE SET
  Profil_Utilisateur=source.Profil_Utilisateur,
  Commentaire=source.Commentaire,
  Est_MC2=source.Est_MC2,
  Est_Archive=source.Est_Archive
WHEN NOT MATCHED THEN INSERT
  (Id_Profil, Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive)
  VALUES (source.Id_Profil, source.Profil_Utilisateur, source.Commentaire, source.Est_MC2, source.Est_Archive);
SET IDENTITY_INSERT dbo.t_profil OFF;
GO

SET IDENTITY_INSERT dbo.t_actionneur_type ON;
MERGE dbo.t_actionneur_type AS target
USING (VALUES
  (1, 4, N'IACTX Lumineux', 1),
  (2, 5, N'IACTX Lumineux contact', 1),
  (3, 6, N'IACTX Contact', 1),
  (4, 7, N'IACTX Sonore', 1)
) AS source (Id_Actionneur_Type, Type, Description, Gere_Relais)
ON target.Id_Actionneur_Type = source.Id_Actionneur_Type
WHEN MATCHED THEN UPDATE SET Type = source.Type, Description = source.Description, Gere_Relais = source.Gere_Relais
WHEN NOT MATCHED THEN INSERT (Id_Actionneur_Type, Type, Description, Gere_Relais) VALUES (source.Id_Actionneur_Type, source.Type, source.Description, source.Gere_Relais);
SET IDENTITY_INSERT dbo.t_actionneur_type OFF;
GO

SET IDENTITY_INSERT dbo.t_module_type ON;

MERGE dbo.t_module_type AS target
USING (VALUES
    (1, N'BIN', N'Boîtier filaire avec prise DB9 (port série)', 0),
    (2, N'BIR (filaire)', N'Boîtier réseau filaire avec prise RJ45 (prise réseau)', 1),
    (3, N'BTR', N'Boîtier radio avec prise DB9 (port série)', 0),
    (4, N'BIR (radio)', N'Boîtier réseau radio avec prise RJ45 (port série)', 1),
    (5, N'CORONIS', N'Boîtier radio CORONIS avec prise DB9 (port série)', 0),
    (6, N'MRH', N'Boîtier MRH', 0),

    (7, N'IUSB', N'CLE USB RADIO SONDES I', 0),
    (8, N'IETH', N'Module Ethernet', 0),
    (9, N'GSO-U', N'Module GSO USB', 0),
    (10, N'GSO-E', N'Module GSO Ethernet', 0),
    (11, N'BINX', N'Boîtier filaire Ethernet', 0),
    (12, N'SEF', N'Passerelle Sollae pour sonde étalon SEF', 0)
) AS source (
    Id_Module_Type,
    Libelle_Type_Module,
    Libelle_Module,
    Est_Flag_Affiche_Plan
)
ON target.Id_Module_Type = source.Id_Module_Type

WHEN MATCHED THEN UPDATE SET
    Libelle_Type_Module = source.Libelle_Type_Module,
    Libelle_Module = source.Libelle_Module,
    Est_Flag_Affiche_Plan = source.Est_Flag_Affiche_Plan

WHEN NOT MATCHED THEN INSERT (
    Id_Module_Type,
    Libelle_Type_Module,
    Libelle_Module,
    Est_Flag_Affiche_Plan
)
VALUES (
    source.Id_Module_Type,
    source.Libelle_Type_Module,
    source.Libelle_Module,
    source.Est_Flag_Affiche_Plan
);

SET IDENTITY_INSERT dbo.t_module_type OFF;
GO

MERGE dbo.t_etalon_type AS target
USING (VALUES
  (N'ES', N'VigiTemp Type ES', N'Sonde étalon radio type E', 1, 0, 0.05),
  (N'EX', N'Externe', N'Sonde externe', 1, 1, 0),
  (N'SEF', N'VigiTemp Type SEF', N'Sonde étalon filaire ou filaire/radio avec prise RJ45', 1, 0, 0.02),
  (N'SPET', N'Sonde étalon platine', N'Sonde étalon GSP platine', 1, 0, 0.02)
) AS source (Type_Etalon, Nom, Descriptif, Est_Saisie_Module, Est_Sonde_Externe, Resolution)
ON target.Type_Etalon = source.Type_Etalon
WHEN MATCHED THEN UPDATE SET Nom = source.Nom, Descriptif = source.Descriptif, Est_Saisie_Module = source.Est_Saisie_Module, Est_Sonde_Externe = source.Est_Sonde_Externe, Resolution = source.Resolution
WHEN NOT MATCHED THEN INSERT (Type_Etalon, Nom, Descriptif, Est_Saisie_Module, Est_Sonde_Externe, Resolution) VALUES (source.Type_Etalon, source.Nom, source.Descriptif, source.Est_Saisie_Module, source.Est_Sonde_Externe, source.Resolution);
GO
DECLARE @BootstrapAuth TABLE (
    Code NVARCHAR(50),
    Libelle NVARCHAR(100),
    Commentaire NVARCHAR(255)
);

INSERT INTO @BootstrapAuth (Code, Libelle, Commentaire) VALUES
(N'ACCES_DASHBOARD_UTILISATEUR',N'Accès dashboard utilisateur',N'Accès dashboard utilisateur'),
(N'ACCES_TABLEAU_BORD_UTILISATEUR',N'Accès tableau de bord utilisateur',N'Accès tableau de bord utilisateur'),
(N'ACCES_DASHBOARD_USER',N'Accès dashboard user',N'Accès dashboard user'),
(N'ACCES_SURVEILLANCE',N'Accès surveillance',N'Accès surveillance'),
(N'ACCES_VIGILOG',N'Accès VigiLog',N'Droit domaine VigiLog'),
(N'LIEU_VISUALISER',N'Visualiser les lieux',N'Visualiser les lieux'),
(N'ALARMES_GERER',N'Gérer les alarmes',N'Gérer les alarmes'),
(N'ACCES_DASHBOARD_ADMIN',N'Accès dashboard admin',N'Accès dashboard admin'),
(N'ACCES_TABLEAU_BORD_ADMIN',N'Accès tableau de bord admin',N'Accès tableau de bord admin'),
(N'ACCES_ADMIN',N'Accès admin',N'Accès admin'),
(N'ACCES_PARAMETRAGE_GENERAL',N'Accès paramétrage général',N'Accès paramétrage général'),
(N'PARAMETRAGE_GENERAL',N'Paramétrage général',N'Paramétrage général'),
(N'GERER_PROFIL',N'Gérer les profils',N'Gérer les profils'),
(N'PARAMETRES_GERER',N'Gérer les paramètres',N'Gérer les paramètres'),
(N'ACQUITTER_ALARME',N'Acquitter alarme',N'Acquitter alarme'),
(N'ACCES_ACQUITTEMENT_ALARME',N'Accès acquittement alarme',N'Accès acquittement alarme'),
(N'DESACTIVER_LIEU',N'Désactiver lieu',N'Désactiver lieu'),
(N'ACCES_DESACTIVATION_LIEU',N'Accès désactivation lieu',N'Accès désactivation lieu'),
(N'LIEU_ACTIV_DESACT',N'Activer/désactiver lieu',N'Activer/désactiver lieu'),
(N'PARAMETRER_LIEU',N'Paramétrer lieu',N'Paramétrer lieu'),
(N'ACCES_PARAMETRAGE_LIEU',N'Accès paramétrage lieu',N'Accès paramétrage lieu'),
(N'LIEU_GERER',N'Gérer les lieux',N'Gérer les lieux'),
(N'PARAMETRAGE_MATERIEL',N'Paramétrage matériel',N'Paramétrage matériel'),
(N'ACCES_PARAMETRAGE_MATERIEL',N'Accès paramétrage matériel',N'Accès paramétrage matériel'),
(N'ACCES_METROLOGIE',N'Accès métrologie',N'Accès métrologie'),
(N'ACCES_CONVERSATION',N'Accès conversation',N'Accès conversation'),
(N'MODULE_CONVERSATION',N'Module conversation',N'Module conversation'),
(N'REALISER_AJUSTAGE_ETALONNAGE',N'Réaliser ajustage étalonnage',N'Réaliser ajustage étalonnage'),
(N'ACCES_AJUSTAGE_ETALONNAGE',N'Accès ajustage étalonnage',N'Accès ajustage étalonnage'),
(N'ACQUITTER_ALARMES_MULTI_LIEUX',N'Acquitter plusieurs lieux',N'Acquitter des alarmes sur plusieurs lieux');

INSERT INTO dbo.t_autorisation (
    Code_Autorisation,
    Libelle_Autorisation,
    Commentaire
)
SELECT
    Code,
    Libelle,
    Commentaire
FROM @BootstrapAuth a
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.t_autorisation x
    WHERE x.Code_Autorisation = a.Code
);
GO
DECLARE @AdminProfilId INT = (SELECT TOP 1 Id_Profil FROM dbo.t_profil WHERE Profil_Utilisateur = N'Administrateurs');
INSERT INTO dbo.t_liaison_profil_autorisation (Id_Profil, Id_Autorisation) SELECT @AdminProfilId, a.Id_Autorisation FROM dbo.t_autorisation a WHERE @AdminProfilId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.t_liaison_profil_autorisation l WHERE l.Id_Profil = @AdminProfilId AND l.Id_Autorisation = a.Id_Autorisation);
GO
IF NOT EXISTS (SELECT 1 FROM dbo.t_utilisateur WHERE Login = N'admin') INSERT INTO dbo.t_utilisateur (Login, Mot_De_Passe, Est_Archive, Profil_Utilisateur, Est_Mot_De_Passe_Temporaire, Date_Creation, Date_Derniere_Modification_MDP) VALUES (N'admin', N'$2b$10$T.LiYgCAdm3FVYteRBfFFucmrl5PqcqdGxr2sdcseukhGylhM2oKe', 0, N'Administrateurs', 1, CAST(GETDATE() AS DATE), GETDATE());
ELSE UPDATE dbo.t_utilisateur SET Mot_De_Passe = N'$2b$10$T.LiYgCAdm3FVYteRBfFFucmrl5PqcqdGxr2sdcseukhGylhM2oKe', Est_Mot_De_Passe_Temporaire = 1, Profil_Utilisateur = COALESCE(Profil_Utilisateur, N'Administrateurs'), Est_Archive = 0 WHERE Login = N'admin' AND (Mot_De_Passe IS NULL OR Est_Mot_De_Passe_Temporaire = 1);
GO

USE [vigi_main];
GO

-- templates de lieu
-- parametres recents (uppercase)
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SHOW_NULL_NON_RESPONSE')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SHOW_NULL_NON_RESPONSE','0','Afficher les mesures null (non-réponse) dans les graphiques');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SURVEILLANCE_REFRESH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SURVEILLANCE_REFRESH','15','Rafraîchissement surveillance en secondes');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_NOTIFY_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_NOTIFY_PERCENT','50','Seuil (%) notification batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_EMAIL_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_EMAIL_PERCENT','25','Seuil (%) envoi email batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='ENABLED')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','ENABLED','0','Activation envoi recap mensuel stats');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='RECIPIENTS')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','RECIPIENTS','','Destinataires séparés par ; ou ,');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='DAY_OF_MONTH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','DAY_OF_MONTH','1','Jour du mois (1..31, replie au dernier jour du mois si necessaire)');
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
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','LAST_SENT_MONTH','','Dernier mois envoyé au format YYYY-MM');
GO

-- Parametres applicatifs conserves dans la base de reference
MERGE dbo.t_parametre AS target
USING (VALUES
  (N'CFR21', N'ACTIVATION_EXPIRATION_MOT_DE_PASSE', N'true', N'Activer l''expiration des mots de passe (CFR21)'),
  (N'CFR21', N'ACTIVATION_NORME_CFR21', N'1', N'Activer la conformité CFR21 (saisie des configurations)'),
  (N'CFR21', N'EVENEMENTS', N'1', N'Activation des événements'),
  (N'CFR21', N'JOURS_VALIDITE_MOT_DE_PASSE', N'90', NULL),
  (N'CFR21', N'MOT_DE_PASSE_PERMANENT', N'1', N'Le mot de passe ne peut pas être changé par l''utilisateur'),
  (N'CFR21', N'MOT_DE_PASSE_REUTILISABLE', N'0', N'L''utilisateur ne peut pas réutiliser un ancien mot de passe'),
  (N'CFR21', N'NOMBRE_TENTATIVES_MOT_DE_PASSE', N'3', N'Nombre de tentatives autorisées avant verrouillage du compte'),
  (N'CFR21', N'REACTIVATION_ALARME_SONORE', N'500', N'Délai de réactivation de l''alarme sonore en millisecondes'),
  (N'CFR21', N'SECURITE', N'0', N'Mode sécurité renforcé'),
  (N'CFR21', N'TEMPS_DECONNEXION_MINUTES', N'20', N'Temps d''inactivité avant deconnexion automatique en minutes'),
  (N'CFR21', N'VALIDITE_MOT_DE_PASSE_JOURS', N'90', N'Durée de validité du mot de passe en jours'),
  (N'SECURITE_EMAIL', N'SMTP_ACTIVATION', N'true', N'Activer l''envoi d''emails'),
  (N'SECURITE_EMAIL', N'SMTP_CONFIRME', N'false', N'Configuration SMTP validée par code email'),
  (N'SECURITE_EMAIL', N'SMTP_EXPEDITEUR', N'', N'Adresse email expéditeur (doit correspondre au domaine SMTP)'),
  (N'SECURITE_EMAIL', N'SMTP_MOT_DE_PASSE', N'', N'Mot de passe SMTP'),
  (N'SECURITE_EMAIL', N'SMTP_PORT', N'587', N'Port SMTP (587 pour TLS, 465 pour SSL)'),
  (N'SECURITE_EMAIL', N'SMTP_SERVEUR', N'', N'Serveur SMTP pour l''envoi d''emails'),
  (N'SECURITE_EMAIL', N'SMTP_UTILISATEUR', N'', N'Utilisateur SMTP'),
  (N'SECURITE_MOT_DE_PASSE', N'LONGUEUR_MINIMALE', N'8', N'Longueur minimale du mot de passe'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CARACTERES_SPECIAUX', N'1', N'Nombre minimum de caractères spéciaux'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CHIFFRES', N'1', N'Nombre minimum de chiffres'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MAJUSCULES', N'1', N'Nombre minimum de majuscules'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MINUSCULES', N'1', N'Nombre minimum de minuscules')
) AS source (Section, Mot_Cle, Valeur, Commentaire)
ON target.Section = source.Section AND target.Mot_Cle = source.Mot_Cle
WHEN NOT MATCHED THEN INSERT (Section, Mot_Cle, Valeur, Commentaire) VALUES (source.Section, source.Mot_Cle, source.Valeur, source.Commentaire);
GO
-- Parametres complementaires communs aux deux moteurs

DECLARE @RecentParams TABLE (
  Section NVARCHAR(100) NOT NULL,
  Mot_Cle NVARCHAR(100) NOT NULL,
  Valeur NVARCHAR(MAX) NULL,
  Commentaire NVARCHAR(MAX) NULL
);

INSERT INTO @RecentParams (Section, Mot_Cle, Valeur, Commentaire) VALUES
(N'VERSION',N'SCHEMA_VERSION',N'0.91.2',N'Version de schéma VigiSensys'),
(N'GENERAL',N'TIMEZONE',N'Europe/Paris',N'Fuseau horaire par defaut'),
(N'DASHBOARD',N'AUDIT_GRAPH_OPENINGS',N'false',N'Activer l audit trail a l ouverture des graphiques'),
(N'DASHBOARD',N'ETALONNAGE_WARNING_DAYS',N'90',N'Délai alerte validité étalonnage en jours'),
(N'DASHBOARD',N'REFRESH',N'30',N'Intervalle de rafraîchissement dashboard en secondes'),
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
(N'SERVICE',N'GSO_DERNIER_DATE_HEURE',NULL,N'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures'),
(N'SERVICES',N'COMMERCIAL_CONTACT_EMAIL',N'',N'Adresse email du service commercial utilisée pour les demandes de devis matériel'),
(N'TELEPHONIE',N'ENABLED',N'false',N'Activation globale de la téléphonie VoIP'),
(N'TELEPHONIE',N'PROVIDER',N'none',N'Fournisseur VoIP sélectionné'),
(N'TELEPHONIE',N'CALLER_ID',N'',N'Numéro présenté / caller ID'),
(N'TELEPHONIE',N'NOTES',N'',N'Notes d’intégration téléphonie'),
(N'TELEPHONIE',N'TWILIO_AUTH_MODE',N'api_key',N'Mode d’authentification Twilio'),
(N'TELEPHONIE',N'TWILIO_ACCOUNT_SID',N'',N'Compte Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SID',N'',N'API Key SID Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SECRET',N'',N'API Key Secret Twilio'),
(N'TELEPHONIE',N'TWILIO_AUTH_TOKEN',N'',N'Auth Token Twilio'),
(N'TELEPHONIE',N'TWILIO_FROM_NUMBER',N'',N'Numéro expéditeur Twilio'),
(N'TELEPHONIE',N'OVH_ENDPOINT',N'ovh-eu',N'Point d’accès API OVH'),
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

-- DONNEES COMPLEMENTAIRES (missing_data.sql)
SET IDENTITY_INSERT dbo.t_materiel ON;
MERGE dbo.t_materiel AS target
USING (VALUES
  (1, N'M-GSO-U', N'Module de réception pour sondes GemSense One USB', N'USB' + CHAR(13) + '' + CHAR(10) + 'Led d’activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSO', N'RADIO'),
  (2, N'M-GSO-E', N'Module de réception pour sondes GemSense One Ethernet', N'Ethernet RJ 45' + CHAR(13) + '' + CHAR(10) + 'Led activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSO', N'RADIO'),
  (3, N'GSO-IT', N'Gemsense One Température interne', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -20°C à 40°C', N'GSO', N'RADIO'),
  (4, N'GSO-ITH', N'Gemsense One Température & humidité interne', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : 10°C à 40°C' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : 10%Hr à 90%Hr', N'GSO', N'RADIO'),
  (5, N'GSO-ET', N'Gemsense One Température externe', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Protection : inox 316 L Ø 6 x 40 mm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -40°C à 125°C', N'GSO', N'RADIO'),
  (6, N'GSO-ETH', N'Gemsense One Température & humidité externe', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : 10°C à 80°C' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : 10%Hr à 90%Hr', N'GSO', N'RADIO'),
  (7, N'M-GSP', N'Module de réception pour sondes GemSense Pro Ethernet', N'Interface 10Base-T ou 100Base-TX' + CHAR(13) + '' + CHAR(10) + 'Connecteur RJ45' + CHAR(13) + '' + CHAR(10) + 'Led Link & activité' + CHAR(13) + '' + CHAR(10) + 'Sécurisé par mot de passe' + CHAR(13) + '' + CHAR(10) + 'CPU : DSTni-EX' + CHAR(13) + '' + CHAR(10) + 'Mémoire : 256k SRAM 512Kb flash' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSP', N'RADIO'),
  (8, N'GSP-RN-BL', N'Gemsense Pro Numérique blanc', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C Câble long 3 m BLANC', N'GSP', N'RADIO'),
  (9, N'GSP-RN-GR', N'Gemsense Pro Numérique gris', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C  Câble long 3 m GRIS PLAT', N'GSP', N'RADIO'),
  (10, N'GSP-RP', N'Gemsense Pro platine', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'RADIO'),
  (11, N'GSP-RP-ALIM', N'Gemsense Pro platine alimentaire', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L - Ø 5 mm, ' + CHAR(13) + '' + CHAR(10) + 'longueur utile : 150 mm' + CHAR(13) + '' + CHAR(10) + 'Poignée : surmoulée silicone THT 250 °C - couleur rouge brique, longueur 130 mm' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt1000 céramique DIN IEC 60751 classe B, simple en montage A' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : silicone atoxique THT 250 °C continu - Alimentaire couleur rouge brique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -50 à + 250 °C', N'GSP', N'RADIO'),
  (12, N'GSP-RP-CONT', N'Gemsense Pro platine contact', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 CEI 60751 classe A, ' + CHAR(13) + '' + CHAR(10) + 'simple enroulement, élément de mesure couche mince sous rétractable PFA' + CHAR(13) + '' + CHAR(10) + 'Sous film polyester ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -80+160 °C' + CHAR(13) + '' + CHAR(10) + 'Fixation par colle silicone sur surface dégraissée' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA, section 0,09 mm², longueur 2 mètres, 3 conducteurs', N'GSP', N'RADIO'),
  (13, N'GSP-RP-AU', N'Gemsense Pro platine autoclave', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L - Ø 6 x 200 mm, ' + CHAR(13) + '' + CHAR(10) + 'prolongée par câble PFA/silicone protégé par flexible inox Ø 7 mm, longueur 1,5 mètres puis gaine étanche Ø 6 x 100 mm pour passage de cloison' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, simple ou double enroulement en montage 3 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/silicone, longueur 2 mètres' + CHAR(13) + '' + CHAR(10) + 'Température maximale d''utilisation : +180 °C' + CHAR(13) + '' + CHAR(10) + 'Exécution étanche', N'GSP', N'RADIO'),
  (14, N'GSP-RP-CF', N'Gemsense Pro platine chambre froide', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Capteur muni à l''extrémité d''une ogive inox diamètre 6 mm ' + CHAR(13) + '' + CHAR(10) + 'sertie sur 15 mètres de câble silicone.' + CHAR(13) + '' + CHAR(10) + 'Configuration 3 fils' + CHAR(13) + '' + CHAR(10) + 'Elément sensible Pt100 suivant NF EN 60751 classe B' + CHAR(13) + '' + CHAR(10) + 'Ogive inox diamètre 6 mm, longueur 50 mm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -50°C à + 100°C' + CHAR(13) + '' + CHAR(10) + 'Sortie sur 15 mètres de câble : Conducteurs souples 7 brins ' + CHAR(13) + '' + CHAR(10) + 'de ø 0.2 mm isolés PFA sous gaine caoutchouc de silicone. ' + CHAR(13) + '' + CHAR(10) + '2 conducteurs rouges, 1 conducteur blanc', N'GSP', N'RADIO'),
  (15, N'GSP-RP-MICRO', N'Gemsense Pro platine micro-capteur', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température platine' + CHAR(13) + '' + CHAR(10) + 'Capteur micro ø 2,18mm L 4,75m : -70°C à + 250°C', N'GSP', N'RADIO'),
  (16, N'GSP-RQ-CO2', N'Gemsense Pro CO2', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Le capteur de dioxyde de carbone Vaisala CARBOCAP® GMP251 est une sonde intelligente et autonome.' + CHAR(13) + '' + CHAR(10) + 'La plage de température de fonctionnement va de -40 à +60 °C, ' + CHAR(13) + '' + CHAR(10) + 'et la plage de mesure est comprise entre 0 et 20 % de CO2' + CHAR(13) + '' + CHAR(10) + 'Le capteur GMP251 fait appel à la technologie unique de deuxième génération Vaisala CARBOCAP® qui offre une stabilité exceptionnelle. ' + CHAR(13) + '' + CHAR(10) + 'La durée de vie de la GMP251 est prolongée grâce à un nouveau type de source de lumière infrarouge (IR) qui remplace l''ampoule à incandescence traditionnelle. Elle bénéficie de compensations complètes de température et de pression de la mesure du CO2 - mesure de température intégrée pour la compensation.', N'GSP', N'RADIO'),
  (17, N'GSP-RQ-HYG', N'Gemsense Pro hygrométrie', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Plage de mesure de 0% à 100 %hr' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation de 10°C à +60°C' + CHAR(13) + '' + CHAR(10) + 'Capteur de diamètre 12 mm longueur 71 mm', N'GSP', N'RADIO'),
  (18, N'GSP-RQ-THE', N'Gemsense Pro thermocouple', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Capteur thermocouple J chemise (déformable) :' + CHAR(13) + '' + CHAR(10) + 'ø 3 mm longueur 50 cm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation  : 100°C à + 1500°C' + CHAR(13) + '' + CHAR(10) + 'Sortie sur câble tresse inox 1m', N'GSP', N'RADIO'),
  (19, N'GSP-RQ-PRES', N'Gemsense Pro pression différentielle', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de pression ' + CHAR(13) + '' + CHAR(10) + 'Capteur piézoélectique' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation  : 0 à 250 Pa' + CHAR(13) + '' + CHAR(10) + 'Sortie sur câble tresse inox 1m', N'GSP', N'RADIO'),
  (20, N'GSP-RQ-ATMO', N'Gemsense Pro pression atmosphérique', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de pression  ' + CHAR(13) + '' + CHAR(10) + 'Capteur ratiométrique' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : atmosphère ambiante', N'GSP', N'RADIO'),
  (21, N'GSP-RQ-LUM', N'Gemsense Pro lumière', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de lumière ' + CHAR(13) + '' + CHAR(10) + 'Capteur photorésistif' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : lumière ambiante', N'GSP', N'RADIO'),
  (22, N'GSP-RQ-01V', N'Gemsense Pro 0-1 Volt', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de tension ' + CHAR(13) + '' + CHAR(10) + 'Entrée 0-1Volt', N'GSP', N'RADIO'),
  (23, N'GSP-RQ-420MA', N'Gemsense Pro 4-20 mA', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de courant ' + CHAR(13) + '' + CHAR(10) + 'Entrée 4-20mA', N'GSP', N'RADIO'),
  (24, N'GSP-RQ-NONF', N'Gemsense Pro NO NF', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur TOR ' + CHAR(13) + '' + CHAR(10) + 'Entrée récuperation de contact NO ou NF' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : reprise de contact', N'GSP', N'RADIO'),
  (25, N'GSP-RP-ETAL', N'Gemsense Pro Étalon', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Lecture écran sous forme de liste pour des étalonnages ' + CHAR(13) + '' + CHAR(10) + 'plus faciles' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 3,5 longueur utile 150 mm ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe 1/3DIN, ' + CHAR(13) + '' + CHAR(10) + 'en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA ' + CHAR(13) + '' + CHAR(10) + 'Résolution d’affichage : 0,01°C ' + CHAR(13) + '' + CHAR(10) + 'Résolution de mesure : 0,003°C', N'GSP', N'ETALON'),
  (26, N'GSP-XN-BL', N'Gemsense Pro Ethernet numérique blanc', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', N'GSP', N'ETHERNET'),
  (27, N'GSP-XN-GR', N'Gemsense Pro Ethernet numérique gris', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', N'GSP', N'ETHERNET'),
  (28, N'GSP-XP', N'Gemsense Pro Ethernet platine', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'ETHERNET'),
  (29, N'M-GSP-F', N'Module de réception pour sondes GemSense Pro Filaire', N'Ethernet RJ 45' + CHAR(13) + '' + CHAR(10) + 'Led activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSP', N'FILAIRE'),
  (30, N'M-GSP-F-ALS', N'Alimentation supplémentaire pour sondes GemSense Pro Filaire', N'', N'GSP', N'FILAIRE'),
  (31, N'GSP-FN-BL', N'Gemsense Pro filaire numérique blanc', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', N'GSP', N'FILAIRE'),
  (32, N'GSP-FN-GR', N'Gemsense Pro filaire numérique gris', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', N'GSP', N'FILAIRE'),
  (33, N'GSP-FP', N'Gemsense Pro Filaire platine', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'FILAIRE')
) AS source (Id_Materiel, Ref_Commercial, Designation, Descriptif, Gamme, Type)
ON target.Id_Materiel = source.Id_Materiel
WHEN MATCHED THEN UPDATE SET Ref_Commercial = source.Ref_Commercial, Designation = source.Designation, Descriptif = source.Descriptif, Gamme = source.Gamme, Type = source.Type
WHEN NOT MATCHED THEN INSERT (Id_Materiel, Ref_Commercial, Designation, Descriptif, Gamme, Type) VALUES (source.Id_Materiel, source.Ref_Commercial, source.Designation, source.Descriptif, source.Gamme, source.Type);
SET IDENTITY_INSERT dbo.t_materiel OFF;
GO

SET IDENTITY_INSERT dbo.t_sonde_etat ON;
MERGE dbo.t_sonde_etat AS target
USING (VALUES
  (1, N'A', N'En ajustage'),
  (2, N'D', N'Surveillance désactivée'),
  (3, N'E', N'En étalonnage'),
  (4, N'S', N'Utilisée en surveillance'),
  (5, N'T', N'En test')
) AS source (Id_Sonde_Etat, Etat_Sonde, Etat_Libelle)
ON target.Id_Sonde_Etat = source.Id_Sonde_Etat
WHEN MATCHED THEN UPDATE SET Etat_Sonde = source.Etat_Sonde, Etat_Libelle = source.Etat_Libelle
WHEN NOT MATCHED THEN INSERT (Id_Sonde_Etat, Etat_Sonde, Etat_Libelle) VALUES (source.Id_Sonde_Etat, source.Etat_Sonde, source.Etat_Libelle);
SET IDENTITY_INSERT dbo.t_sonde_etat OFF;
GO

MERGE dbo.t_parametre AS target
USING (VALUES
  (N'CFR21', N'ACTIVATION_EXPIRATION_MOT_DE_PASSE', N'true', N'Activer l''expiration des mots de passe (CFR21)', NULL),
  (N'CFR21', N'ACTIVATION_NORME_CFR21', N'0', N'Activer la conformité CFR21 (saisie des configurations)', NULL),
  (N'CFR21', N'EVENEMENTS', N'1', N'Activation des événements', NULL),
  (N'CFR21', N'JOURS_VALIDITE_MOT_DE_PASSE', N'0', NULL, NULL),
  (N'CFR21', N'MOT_DE_PASSE_PERMANENT', N'1', N'Le mot de passe ne peut pas etre change par l''utilisateur', NULL),
  (N'CFR21', N'MOT_DE_PASSE_REUTILISABLE', N'0', N'L''utilisateur ne peut pas reutiliser un ancien mot de passe', NULL),
  (N'CFR21', N'NOMBRE_TENTATIVES_MOT_DE_PASSE', N'3', N'Nombre de tentatives autorisees avant verrouillage du compte', NULL),
  (N'CFR21', N'REACTIVATION_ALARME_SONORE', N'500', N'Delai de reactivation de l''alarme sonore en millisecondes', NULL),
  (N'CFR21', N'SECURITE', N'0', N'Mode securite renforcee', NULL),
  (N'CFR21', N'TEMPS_DECONNEXION_MINUTES', N'20', N'Temps d''inactivite avant deconnexion automatique en minutes', NULL),
  (N'CFR21', N'VALIDITE_MOT_DE_PASSE_JOURS', N'90', N'Durée de validité du mot de passe en jours', NULL),
  (N'DASHBOARD', N'AUDIT_GRAPH_OPENINGS', N'false', N'Activer l''audit trail a l''ouverture des graphiques', NULL),
  (N'DASHBOARD', N'ETALONNAGE_WARNING_DAYS', N'90', NULL, NULL),
  (N'DASHBOARD', N'REFRESH', N'30', N'Intervalle de rafraîchissement dashboard (secondes)', NULL),
  (N'DASHBOARD', N'REQUIRE_ACTION_COMMENT', N'false', NULL, NULL),
  (N'DASHBOARD', N'SHOW_NULL_NON_RESPONSE', N'true', N'Afficher les non-reponses (valeurs null) sur les graphes', NULL),
  (N'DASHBOARD', N'SURVEILLANCE_REFRESH', N'30', N'Délai auto de rafraîchissement de la surveillance (secondes)', NULL),
  (N'GENERAL', N'TIMEZONE', N'Europe/Paris', N'Fuseau horaire par defaut', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_ACKNOWLEDGED', N'true', N'Envoyer les emails d acquittement', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_ENDED', N'true', N'Envoyer les emails d alarme terminee', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_FALLBACK_TO_SYSTEM', N'true', N'Envoyer les emails d alarme aux destinataires systeme si aucun contact mail lieu n est configure', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_RECIPIENTS', N'', N'Emails en copie sur tous les emails systeme', NULL),
  (N'NOTIFICATIONS', N'EMAIL', N'true', N'Activation globale des emails systeme', NULL),
  (N'NOTIFICATIONS', N'GSP_BATTERY_EMAIL_PERCENT', N'25', N'Seuil (%) envoi email batterie faible sonde GSP', NULL),
  (N'NOTIFICATIONS', N'GSP_BATTERY_NOTIFY_PERCENT', N'50', N'Seuil (%) notification batterie faible sonde GSP', NULL),
  (N'NOTIFICATIONS_TEAMS', N'CHANNEL_LABEL', N'', N'Nom lisible du canal Teams cible.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'ENABLED', N'false', N'Active les notifications Teams via webhook Workflows.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_ACK', N'false', N'Envoie un message Teams a l acquittement.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_END', N'true', N'Envoie un message Teams a la fin alarme.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_TRIGGER', N'true', N'Envoie un message Teams au declenchement alarme.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'TIMEOUT_MS', N'5000', N'Timeout HTTP du webhook Teams en millisecondes.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'WEBHOOK_URL', N'', N'URL du webhook Teams Workflows. Secret a proteger.', NULL),
  (N'SECURITE_EMAIL', N'SMTP_ACTIVATION', N'false', N'Activer l''envoi d''emails', NULL),
  (N'SECURITE_EMAIL', N'SMTP_EXPEDITEUR', N'', N'Adresse email expéditeur (doit correspondre au domaine SMTP)', NULL),
  (N'SECURITE_EMAIL', N'SMTP_MOT_DE_PASSE', N'', N'Mot de passe SMTP', NULL),
  (N'SECURITE_EMAIL', N'SMTP_PORT', N'587', N'Port SMTP (587 pour TLS, 465 pour SSL)', NULL),
  (N'SECURITE_EMAIL', N'SMTP_SERVEUR', N'', N'Serveur SMTP pour l''envoi d''emails', NULL),
  (N'SECURITE_EMAIL', N'SMTP_UTILISATEUR', N'', N'Utilisateur SMTP', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'LONGUEUR_MINIMALE', N'4', N'Longueur minimale du mot de passe', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CARACTERES_SPECIAUX', N'0', N'Nombre minimum de caractères spéciaux', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CHIFFRES', N'0', N'Nombre minimum de chiffres', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MAJUSCULES', N'0', N'Nombre minimum de majuscules', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MINUSCULES', N'0', N'Nombre minimum de minuscules', NULL),
  (N'SERVICE', N'GSO_DERNIER_DATE_HEURE', NULL, N'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures', NULL),
  (N'SERVICES', N'COMMERCIAL_CONTACT_EMAIL', N'', N'Adresse email du service commercial utilisée pour les demandes de devis matériel', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'DAY_OF_MONTH', N'1', N'Jour du mois (1..31, replie au dernier jour du mois si necessaire)', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'ENABLED', N'0', N'Activation envoi recap mensuel stats', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'HOUR_LOCAL', N'8', N'Heure locale (0..23)', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_COUNT', N'1', N'Inclure nombre alarmes', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_HIGH_DURATION', N'1', N'Inclure duree alarme haute', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_LOW_DURATION', N'1', N'Inclure duree alarme basse', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_AVG', N'1', N'Inclure moyenne', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_LOCATION_SUMMARY', N'1', N'Inclure lieu/site/groupe', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_MAX', N'1', N'Inclure mesure max', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_MIN', N'1', N'Inclure mesure min', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_OVER_HIGH_NO_ALARM', N'1', N'Inclure depassement haut sans alarme', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_OVER_LOW_NO_ALARM', N'1', N'Inclure depassement bas sans alarme', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_SETTINGS_SUMMARY', N'1', N'Inclure consignes/tolerances/frequence/retards', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'LAST_SENT_MONTH', N'', N'Dernier mois envoyé au format YYYY-MM', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'RECIPIENTS', N'', N'Destinataires séparés par ; ou ,', NULL)
) AS source (Section, Mot_Cle, Valeur, Commentaire, Champ_DATETIME)
ON target.Section = source.Section AND target.Mot_Cle = source.Mot_Cle
WHEN MATCHED THEN UPDATE SET Valeur = source.Valeur, Commentaire = source.Commentaire, Champ_DATETIME = source.Champ_DATETIME
WHEN NOT MATCHED THEN INSERT (Section, Mot_Cle, Valeur, Commentaire, Champ_DATETIME) VALUES (source.Section, source.Mot_Cle, source.Valeur, source.Commentaire, source.Champ_DATETIME);
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

-- =====================================================================
-- Vues, equivalents SQL Server des events et triggers courants
-- =====================================================================
USE [vigi_mesures];
GO

CREATE OR ALTER VIEW dbo.[v_compteur_valeurs_gso]
AS
select
  [tm_mesures].[Adresse_Sonde] AS [Adresse_Sonde],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -1, getdate())) then 1 else 0 end) AS [quart_0_4=4m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -1, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -2, getdate())) then 1 else 0 end) AS [quart_4_8=4m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -2, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -4, getdate())) then 1 else 0 end) AS [quart_8_16=8m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -4, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -8, getdate())) then 1 else 0 end) AS [quart_16_32=16m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -8, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -16, getdate())) then 1 else 0 end) AS [quart_32_64=32m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -16, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -32, getdate())) then 1 else 0 end) AS [quart_64_128=64m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -32, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -64, getdate())) then 1 else 0 end) AS [quart_128_256=128m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -64, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -128, getdate())) then 1 else 0 end) AS [quart_256_512=256m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -128, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -175, getdate())) then 1 else 0 end) AS [quart_512_700=188m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] >= dateadd(minute, -10500, getdate())) then 1 else 0 end) AS [Total]
from dbo.[tm_mesures]
where [tm_mesures].[Adresse_Sonde] like '1__%'
  and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -175, getdate())
group by [tm_mesures].[Adresse_Sonde];
GO

USE [vigi_main];
GO

GO

USE [vigi_main];
GO

CREATE OR ALTER VIEW dbo.[v_tm_mesures_dernier]
AS
select
  [l].[Id_Lieu] AS [Id_Lieu],
  [l].[Sonde_Numero_Serie] AS [Sonde_Numero_Serie],
  [l].[Adresse_Sonde] AS [Adresse_Sonde],
  [l].[Nom_Lieu] AS [Nom_Lieu],
  [l].[Id_Alarme] AS [Id_Alarme],
  [l].[Est_Lieu_En_Alarme] AS [Alarme_en_cours],
  [m].[Valeur] AS [Dernier_Releve],
  [m].[Unite] AS [Unite],
  [m].[Date_Heure_Mesure] AS [Date_Heure_Mesure],
  [m].[COM_sonde] AS [COM_Lecture],
  [m].[Rssi] AS [Signal_Radio],
  [m].[Tension] AS [Tension_Piles],
  case when len(isnull([l].[Adresse_Sonde], '')) > 2 then left([l].[Adresse_Sonde], len([l].[Adresse_Sonde]) - 2) end AS [GSO_SN]
from [vigi_main].[dbo].[t_lieu] [l]
outer apply (
  select top 1
    [m1].[Valeur],
    [m1].[Unite],
    [m1].[Date_Heure_Mesure],
    [m1].[COM_sonde],
    [m1].[Rssi],
    [m1].[Tension]
  from [vigi_mesures].[dbo].[tm_mesures] [m1]
  where [m1].[Id_Lieu] = [l].[Id_Lieu]
  order by [m1].[Date_Heure_Mesure] desc
) [m]
where [l].[Lieu_Etat] = 'S'
  and [l].[Est_Lieu_GSO] = 1;
GO

USE [vigi_mesures];
GO

CREATE OR ALTER VIEW dbo.[v_config_lieu_planning_consignes]
AS
select
  [pl].[Id_Lieu] AS [Id_Lieu],
  [pl].[Date_Heure_Debut_Changement] AS [Date_Heure_Debut_Changement],
  [pl].[Date_Heure_Fin_Changement] AS [Date_Heure_Fin_Changement],
  [pl].[Consigne_Apres] AS [Consigne_Apres],
  [pl].[Tolerance_Surveillance_Sup_Apres] AS [Tolerance_Surveillance_Sup_Apres],
  [pl].[Tolerance_Surveillance_Inf_Apres] AS [Tolerance_Surveillance_Inf_Apres]
from [vigi_main].[dbo].[t_lieu_planning_audit] [pl];
GO

CREATE OR ALTER VIEW dbo.[v_config_lieu_sonde]
AS
SELECT
    [l].[Id_Lieu] AS [Id_Lieu],
    [l].[Sonde_Numero_Serie] AS [Sonde_Numero_Serie],
    LEFT([s].[Adresse_Sonde], LEN([s].[Adresse_Sonde]) - 2) AS [GSO_SN],
    [s].[Port_Serie] AS [Port_Serie],
    [l].[Adresse_Sonde] AS [Adresse_Sonde],
    [l].[Date_Heure_Surveillance_On] AS [Date_Heure_Surveillance_On],
    [l].[Planning_Actif] AS [Planning_Actif],
    [l].[Planning_Regle_Existe] AS [Planning_Regle_Existe],
    [l].[Consigne] AS [Consigne],
    [l].[Tolerance_Surveillance_Sup] AS [Consigne_Sup_Corr],
    [l].[Tolerance_Surveillance_Inf] AS [Consigne_Inf_Corr],
    [l].[Consigne_Sup_Pre_Alarme] AS [Consigne_Sup_Pre_Alarme],
    [l].[Consigne_Inf_Pre_Alarme] AS [Consigne_Inf_Pre_Alarme],
    [l].[Consigne_Base] AS [Consigne_Base],
    [l].[Tolerance_Surveillance_Sup_Base] AS [Tolerance_Surveillance_Sup_Base],
    [l].[Tolerance_Surveillance_Inf_Base] AS [Tolerance_Surveillance_Inf_Base],
    [l].[Retard_Alarme_Haut] AS [Retard_Haut],
    [l].[Retard_Alarme_Bas] AS [Retard_Bas],
    [s].[Sonde_Offset] AS [Sonde_Offset],
    ISNULL([aj].[Coeff_X], 1) AS [coeff_a],
    ISNULL([aj].[Coeff_Constant], 0) AS [coeff_b],
    ROUND(ISNULL(
        CASE
            WHEN [l].[Est_Correction_Ej] = 1 THEN -[l].[Derniere_Erreur_Justesse]
            ELSE 0
        END
    , 0), 2) AS [-(EJ)]
FROM [vigi_main].[dbo].[t_lieu] [l]
LEFT JOIN [vigi_main].[dbo].[t_sonde] [s]
    ON [s].[Sonde_Numero_Serie] = [l].[Sonde_Numero_Serie]
LEFT JOIN (
    SELECT
        [x].[Sonde_Numero_Serie],
        [x].[Coeff_X],
        [x].[Coeff_Constant]
    FROM (
        SELECT
            [a].[Sonde_Numero_Serie],
            [a].[Coeff_X],
            [a].[Coeff_Constant],
            ROW_NUMBER() OVER (
                PARTITION BY [a].[Sonde_Numero_Serie]
                ORDER BY [a].[Date_Heure_Ajustage] DESC
            ) AS [rn]
        FROM [vigi_main].[dbo].[t_ajustage] [a]
    ) [x]
    WHERE [x].[rn] = 1
) [aj]
    ON [aj].[Sonde_Numero_Serie] = [s].[Sonde_Numero_Serie]
WHERE
    [l].[Est_Lieu_GSO] = 1
    AND [l].[Lieu_Etat] = 'S';
GO

CREATE OR ALTER VIEW dbo.[v_config_sonde_com]
AS
SELECT
    [s].[Adresse_Sonde] AS [Adresse_Sonde],
    LEFT([s].[Adresse_Sonde], LEN([s].[Adresse_Sonde]) - 2) AS [GSO_SN],
    [s].[Etat_Sonde] AS [Etat_Sonde],
    [s].[Metrologie_en_cours] AS [Metrologie_en_cours],
    [s].[Metrologie_cmd_envoyee] AS [Metrologie_cmd_envoyee],
    [m].[Port_Serie_Send_GSO] AS [Port_Serie_Send_GSO],
    [m].[Port_Serie] AS [Port_Serie_Real],
    [s].[Sonde_Offset] AS [Sonde_Offset],
    ISNULL([aj].[Coeff_X], 1) AS [coeff_a],
    ISNULL([aj].[Coeff_Constant], 0) AS [coeff_b]
FROM [vigi_main].[dbo].[t_sonde] [s]
INNER JOIN [vigi_main].[dbo].[t_module] [m]
    ON [m].[Port_Serie] = [s].[Port_Serie]
LEFT JOIN (
    SELECT
        [x].[Sonde_Numero_Serie],
        [x].[Coeff_X],
        [x].[Coeff_Constant]
    FROM (
        SELECT
            [ta].[Sonde_Numero_Serie],
            [ta].[Coeff_X],
            [ta].[Coeff_Constant],
            ROW_NUMBER() OVER (
                PARTITION BY [ta].[Sonde_Numero_Serie]
                ORDER BY [ta].[Date_Heure_Ajustage] DESC
            ) AS [rn]
        FROM [vigi_main].[dbo].[t_ajustage] [ta]
    ) [x]
    WHERE [x].[rn] = 1
) [aj]
    ON [aj].[Sonde_Numero_Serie] = [s].[Sonde_Numero_Serie]
WHERE
    [s].[Est_Sonde_GSO] = 1;
GO

CREATE OR ALTER PROCEDURE dbo.[usp_EVT_PLANNING_CONSIGNE]
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  SET DATEFIRST 1;

  DECLARE @now DATETIME = GETDATE();
  DECLARE @v_now_day TINYINT = DATEPART(WEEKDAY, @now);
  DECLARE @v_now_time TIME = CAST(@now AS TIME);

  IF OBJECT_ID(N'tempdb..#tmp_planning_best') IS NOT NULL DROP TABLE #tmp_planning_best;
  IF OBJECT_ID(N'tempdb..#tmp_planning_apply') IS NOT NULL DROP TABLE #tmp_planning_apply;
  IF OBJECT_ID(N'tempdb..#tmp_planning_return') IS NOT NULL DROP TABLE #tmp_planning_return;

  SELECT
      r.[Id_Lieu],
      r.[Id_Regle],
      r.[Consigne],
      r.[Tolerance_Sup_Calc],
      r.[Tolerance_Inf_Calc],
      r.[Retard_Alarme_Changement_Consigne]
  INTO #tmp_planning_best
  FROM dbo.[t_lieu_planning_regle] r
  INNER JOIN (
    SELECT
        [Id_Lieu],
        MAX([Priorite]) AS [max_prio]
    FROM dbo.[t_lieu_planning_regle]
    WHERE [Actif] = 1
      AND (
        ([Jour_Debut] = [Jour_Fin]
          AND @v_now_day = [Jour_Debut]
          AND @v_now_time >= [Heure_Debut]
          AND @v_now_time <  [Heure_Fin])
        OR
        ([Jour_Debut] < [Jour_Fin] AND (
          (@v_now_day > [Jour_Debut] AND @v_now_day < [Jour_Fin])
          OR (@v_now_day = [Jour_Debut] AND @v_now_time >= [Heure_Debut])
          OR (@v_now_day = [Jour_Fin]   AND @v_now_time <  [Heure_Fin])
        ))
        OR
        ([Jour_Debut] > [Jour_Fin] AND (
          (@v_now_day = [Jour_Debut] AND @v_now_time >= [Heure_Debut])
          OR (@v_now_day = [Jour_Fin]   AND @v_now_time <  [Heure_Fin])
          OR (@v_now_day > [Jour_Debut])
          OR (@v_now_day < [Jour_Fin])
        ))
      )
    GROUP BY [Id_Lieu]
  ) best_prio
    ON best_prio.[Id_Lieu] = r.[Id_Lieu]
   AND best_prio.[max_prio] = r.[Priorite]
  WHERE r.[Actif] = 1
    AND (
      (r.[Jour_Debut] = r.[Jour_Fin]
        AND @v_now_day = r.[Jour_Debut]
        AND @v_now_time >= r.[Heure_Debut]
        AND @v_now_time <  r.[Heure_Fin])
      OR
      (r.[Jour_Debut] < r.[Jour_Fin] AND (
        (@v_now_day > r.[Jour_Debut] AND @v_now_day < r.[Jour_Fin])
        OR (@v_now_day = r.[Jour_Debut] AND @v_now_time >= r.[Heure_Debut])
        OR (@v_now_day = r.[Jour_Fin]   AND @v_now_time <  r.[Heure_Fin])
      ))
      OR
      (r.[Jour_Debut] > r.[Jour_Fin] AND (
        (@v_now_day = r.[Jour_Debut] AND @v_now_time >= r.[Heure_Debut])
        OR (@v_now_day = r.[Jour_Fin]   AND @v_now_time <  r.[Heure_Fin])
        OR (@v_now_day > r.[Jour_Debut])
        OR (@v_now_day < r.[Jour_Fin])
      ))
    );

  SELECT
      l.[Id_Lieu],
      best.[Id_Regle] AS [Planning_Regle_Id],
      l.[Consigne] AS [Consigne_Avant],
      l.[Tolerance_Surveillance_Sup] AS [Tolerance_Surveillance_Sup_Avant],
      l.[Tolerance_Surveillance_Inf] AS [Tolerance_Surveillance_Inf_Avant],
      best.[Consigne] AS [Consigne_Apres],
      best.[Tolerance_Sup_Calc] AS [Tolerance_Surveillance_Sup_Apres],
      best.[Tolerance_Inf_Calc] AS [Tolerance_Surveillance_Inf_Apres],
      best.[Retard_Alarme_Changement_Consigne]
  INTO #tmp_planning_apply
  FROM dbo.[t_lieu] l
  INNER JOIN #tmp_planning_best best
    ON best.[Id_Lieu] = l.[Id_Lieu]
  WHERE l.[Planning_Source_Regle_Id] <> best.[Id_Regle]
     OR l.[Planning_Source_Regle_Id] IS NULL
     OR l.[Planning_Actif] = 0
     OR ISNULL(l.[Consigne], -999999) <> ISNULL(best.[Consigne], -999999)
     OR ISNULL(l.[Tolerance_Surveillance_Sup], -999999) <> ISNULL(best.[Tolerance_Sup_Calc], -999999)
     OR ISNULL(l.[Tolerance_Surveillance_Inf], -999999) <> ISNULL(best.[Tolerance_Inf_Calc], -999999);

  UPDATE a
  SET a.[Date_Heure_Fin_Changement] = @now
  FROM dbo.[t_lieu_planning_audit] a
  INNER JOIN #tmp_planning_apply c
    ON c.[Id_Lieu] = a.[Id_Lieu]
  WHERE a.[Type] = 'PLAN_APPLY'
    AND a.[Date_Heure_Fin_Changement] IS NULL;

  UPDATE l
  SET
      l.[Consigne]                          = c.[Consigne_Apres],
      l.[Consigne_Sup]                      = c.[Tolerance_Surveillance_Sup_Apres],
      l.[Consigne_Inf]                      = c.[Tolerance_Surveillance_Inf_Apres],
      l.[Tolerance_Surveillance_Sup]        = c.[Tolerance_Surveillance_Sup_Apres],
      l.[Tolerance_Surveillance_Inf]        = c.[Tolerance_Surveillance_Inf_Apres],
      l.[Retard_Alarme_Changement_Consigne] = c.[Retard_Alarme_Changement_Consigne],
      l.[Planning_Actif]                    = 1,
      l.[Planning_Regle_Existe]             = 1,
      l.[Planning_Source_Regle_Id]          = c.[Planning_Regle_Id],
      l.[Planning_Derniere_Maj]             = @now
  FROM dbo.[t_lieu] l
  INNER JOIN #tmp_planning_apply c
    ON c.[Id_Lieu] = l.[Id_Lieu];

  INSERT INTO dbo.[t_lieu_planning_audit]
  (
    [Id_Lieu],
    [Timestamp],
    [Date_Heure_Debut_Changement],
    [Date_Heure_Fin_Changement],
    [Type],
    [Planning_Regle_Id],
    [Consigne_Avant],
    [Tolerance_Surveillance_Sup_Avant],
    [Tolerance_Surveillance_Inf_Avant],
    [Consigne_Apres],
    [Tolerance_Surveillance_Sup_Apres],
    [Tolerance_Surveillance_Inf_Apres]
  )
  SELECT
      c.[Id_Lieu],
      @now,
      @now,
      NULL,
      'PLAN_APPLY',
      c.[Planning_Regle_Id],
      c.[Consigne_Avant],
      c.[Tolerance_Surveillance_Sup_Avant],
      c.[Tolerance_Surveillance_Inf_Avant],
      c.[Consigne_Apres],
      c.[Tolerance_Surveillance_Sup_Apres],
      c.[Tolerance_Surveillance_Inf_Apres]
  FROM #tmp_planning_apply c;

  SELECT l.[Id_Lieu]
  INTO #tmp_planning_return
  FROM dbo.[t_lieu] l
  WHERE l.[Planning_Actif] = 1
    AND NOT EXISTS (
      SELECT 1
      FROM #tmp_planning_best best
      WHERE best.[Id_Lieu] = l.[Id_Lieu]
    );

  UPDATE a
  SET a.[Date_Heure_Fin_Changement] = @now
  FROM dbo.[t_lieu_planning_audit] a
  INNER JOIN #tmp_planning_return r
    ON r.[Id_Lieu] = a.[Id_Lieu]
  WHERE a.[Type] = 'PLAN_APPLY'
    AND a.[Date_Heure_Fin_Changement] IS NULL;

  UPDATE l
  SET
      l.[Consigne]                          = l.[Consigne_Base],
      l.[Consigne_Sup]                      = l.[Consigne_Sup_Base],
      l.[Consigne_Inf]                      = l.[Consigne_Inf_Base],
      l.[Tolerance_Surveillance_Sup]        = l.[Tolerance_Surveillance_Sup_Base],
      l.[Tolerance_Surveillance_Inf]        = l.[Tolerance_Surveillance_Inf_Base],
      l.[Retard_Alarme_Changement_Consigne] = NULL,
      l.[Planning_Actif]                    = 0,
      l.[Planning_Regle_Existe]             = CASE WHEN EXISTS (
                                                SELECT 1
                                                FROM dbo.[t_lieu_planning_regle] pr
                                                WHERE pr.[Id_Lieu] = l.[Id_Lieu]
                                              ) THEN 1 ELSE 0 END,
      l.[Planning_Source_Regle_Id]          = NULL,
      l.[Planning_Derniere_Maj]             = @now
  FROM dbo.[t_lieu] l
  INNER JOIN #tmp_planning_return r
    ON r.[Id_Lieu] = l.[Id_Lieu];
END;
GO

CREATE OR ALTER PROCEDURE dbo.[usp_EVT_GSO_DERNIERVALEUR_LIEU]
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE l
  SET
    [Derniere_Date_Heure] = v.[Date_Heure_Mesure],
    [Derniere_Valeur] = v.[Dernier_Releve],
    [Derniere_Unite] = v.[Unite],
    [Date_Heure_Derniere_Reponse] = v.[Date_Heure_Mesure],
    [Derniere_Val_Rssi] = v.[Signal_Radio],
    [Derniere_Val_Tension] = v.[Tension_Piles]
  FROM dbo.[t_lieu] l
  JOIN [vigi_main].[dbo].[v_tm_mesures_dernier] v
    ON v.[Id_Lieu] = l.[Id_Lieu];

  UPDATE dbo.[t_lieu]
  SET [Date_Heure_Derniere_Reponse_Recue_OK] = [Derniere_Date_Heure]
  WHERE [Derniere_Valeur] <= [Tolerance_Surveillance_Sup]
    AND [Derniere_Valeur] >= [Tolerance_Surveillance_Inf]
    AND [Est_Lieu_GSO] = 1
    AND [Lieu_Etat] = 'S';

  UPDATE dbo.[t_lieu]
  SET [Date_Heure_Derniere_Reponse_Recue_OK] = [Derniere_Date_Heure]
  WHERE [Derniere_Valeur] IS NOT NULL
    AND ([Tolerance_Surveillance_Sup] IS NULL OR [Tolerance_Surveillance_Inf] IS NULL)
    AND [Est_Lieu_GSO] = 1
    AND [Lieu_Etat] = 'S';

  UPDATE dbo.[t_lieu]
  SET [Date_Heure_Last_Update_EVT_GSO] = GETDATE()
  WHERE [Est_Lieu_GSO] = 1
    AND [Lieu_Etat] = 'S';

  UPDATE dbo.[t_parametre]
  SET [Champ_DATETIME] = (SELECT MAX([Date_Heure_Mesure]) FROM [vigi_main].[dbo].[v_tm_mesures_dernier])
  WHERE [Mot_Cle] = 'GSO_DERNIER_DATE_HEURE';

  DELETE FROM dbo.[t_lieu_planning_audit]
  WHERE [Date_Heure_Fin_Changement] < DATEADD(HOUR, -240, GETDATE());
END;
GO

USE [vigi_mesures];
GO

CREATE OR ALTER PROCEDURE dbo.[usp_EVT_CALCUL_MESURE_MEM_GSO]
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH [slots] AS (
    SELECT 1 AS [slot_index]
    UNION ALL
    SELECT [slot_index] + 1
    FROM [slots]
    WHERE [slot_index] < 699
  ),
  [base_time] AS (
    SELECT DATEADD(MINUTE, (DATEDIFF(MINUTE, 0, GETDATE()) / 15) * 15, 0) AS [ref_time]
  ),
  [sondes_param] AS (
    SELECT
      [s].[Adresse_Sonde],
      [c].[Port_Serie_Send_GSO],
      [s].[Date_Heure_Surveillance_On],
      CASE
        WHEN DATEDIFF(MINUTE, [s].[Date_Heure_Surveillance_On], [b].[ref_time]) / 15 > 699 THEN 699
        ELSE DATEDIFF(MINUTE, [s].[Date_Heure_Surveillance_On], [b].[ref_time]) / 15
      END AS [max_slot]
    FROM [vigi_mesures].[dbo].[v_config_lieu_sonde] [s]
    LEFT JOIN [vigi_mesures].[dbo].[v_config_sonde_com] [c]
      ON [c].[GSO_SN] = CASE WHEN LEN([s].[Adresse_Sonde]) > 2 THEN LEFT([s].[Adresse_Sonde], LEN([s].[Adresse_Sonde]) - 2) END
    CROSS JOIN [base_time] [b]
    WHERE [s].[Adresse_Sonde] IS NOT NULL
      AND [s].[Date_Heure_Surveillance_On] IS NOT NULL
      AND DATEDIFF(MINUTE, [s].[Date_Heure_Surveillance_On], [b].[ref_time]) >= 15
  ),
  [mesures_indexees] AS (
    SELECT
      [m].[Adresse_Sonde],
      DATEDIFF(MINUTE, [m].[Date_Heure_Mesure], [b].[ref_time]) / 15 AS [slot_index]
    FROM dbo.[tm_mesures] [m]
    CROSS JOIN [base_time] [b]
    WHERE [m].[Date_Heure_Mesure] >= DATEADD(MINUTE, -10500, [b].[ref_time])
      AND [m].[Adresse_Sonde] IS NOT NULL
  ),
  [slots_sondes] AS (
    SELECT
      [sp].[Adresse_Sonde],
      [sp].[Port_Serie_Send_GSO],
      [sl].[slot_index],
      700 - [sl].[slot_index] AS [numero_releve]
    FROM [sondes_param] [sp]
    JOIN [slots] [sl]
      ON [sl].[slot_index] <= [sp].[max_slot]
  ),
  [manquants] AS (
    SELECT
      [ss].[Adresse_Sonde],
      [ss].[Port_Serie_Send_GSO],
      [ss].[slot_index],
      [ss].[numero_releve]
    FROM [slots_sondes] [ss]
    LEFT JOIN [mesures_indexees] [mi]
      ON [mi].[Adresse_Sonde] = [ss].[Adresse_Sonde]
     AND [mi].[slot_index] = [ss].[slot_index]
    WHERE [mi].[slot_index] IS NULL
  ),
  [groupes] AS (
    SELECT
      [Adresse_Sonde],
      [Port_Serie_Send_GSO],
      [numero_releve],
      [numero_releve] - ROW_NUMBER() OVER (PARTITION BY [Adresse_Sonde] ORDER BY [numero_releve]) AS [grp]
    FROM [manquants]
  )
  INSERT INTO dbo.[tm_mesures_gso_count_mem]
  ([GSO_SN], [Port_Serie_Send_GSO], [Missing_Data_Begin], [Missing_Data_End], [Missing_Data_Total], [Commande_Mem], [date_calcul])
  SELECT
    CASE WHEN LEN([Adresse_Sonde]) > 2 THEN LEFT([Adresse_Sonde], LEN([Adresse_Sonde]) - 2) END AS [GSO_SN],
    MAX([Port_Serie_Send_GSO]) AS [Port_Serie_Send_GSO],
    MIN([numero_releve]) AS [Missing_Data_Begin],
    MAX([numero_releve]) AS [Missing_Data_End],
    COUNT(*) AS [Missing_Data_Total],
    CONCAT(
      '$<EDDT:',
      CASE WHEN LEN([Adresse_Sonde]) > 2 THEN LEFT([Adresse_Sonde], LEN([Adresse_Sonde]) - 2) END,
      '(',
      CASE WHEN MIN([numero_releve]) - 3 < 1 THEN 1 ELSE MIN([numero_releve]) - 3 END,
      '-',
      CASE WHEN MAX([numero_releve]) + 3 > 700 THEN 700 ELSE MAX([numero_releve]) + 3 END,
      ')>'
    ) AS [Commande_Mem],
    GETDATE() AS [date_calcul]
  FROM [groupes]
  GROUP BY [Adresse_Sonde], [grp]
  HAVING COUNT(*) >= 3
  OPTION (MAXRECURSION 700);

  INSERT INTO dbo.[tm_mesures_gso_commandes_mem]
  ([GSO_SN], [Port_Serie_Send_GSO], [Commande_Globale_Begin], [Commande_Globale_End], [Missing_Data_Total], [Commande_Mem_Globale], [Date_Calcul])
  SELECT
    [c].[GSO_SN],
    [c].[Port_Serie_Send_GSO],
    [c].[Missing_Data_Begin],
    [c].[Missing_Data_End],
    [c].[Missing_Data_Total],
    [c].[Commande_Mem],
    [c].[date_calcul]
  FROM dbo.[tm_mesures_gso_count_mem] [c]
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.[tm_mesures_gso_commandes_mem] [x]
    WHERE [x].[GSO_SN] = [c].[GSO_SN]
      AND [x].[Commande_Globale_Begin] = [c].[Missing_Data_Begin]
      AND [x].[Commande_Globale_End] = [c].[Missing_Data_End]
  );

  DELETE FROM dbo.[tm_mesures_gso_count_mem];
END;
GO

CREATE OR ALTER PROCEDURE dbo.[usp_EVT_CLEAN_GRAPH_MES_GSO]
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.[tm_graphique] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -72, GETDATE());
  DELETE FROM dbo.[tm_graphique] WHERE [Date_Heure_Mesure] > DATEADD(HOUR, 48, GETDATE());
  DELETE FROM dbo.[tm_mesures] WHERE [Date_Heure_Mesure] > DATEADD(HOUR, 48, GETDATE());
  DELETE FROM dbo.[tm_mesures_gso] WHERE [date_mesure] < DATEADD(HOUR, -720, GETDATE());
  DELETE FROM dbo.[tm_mesures_gso_build] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -720, GETDATE());
  DELETE FROM dbo.[tm_mesures_gso_commandes_mem] WHERE [Date_Calcul] < DATEADD(HOUR, -24, GETDATE());
  DELETE FROM dbo.[tm_mesures] WHERE [Id_Lieu] = 0;
  DELETE FROM dbo.[tm_graphique] WHERE [Id_Lieu] = 0;
  DELETE FROM dbo.[tm_mesures_ajustage] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -24, GETDATE());
  DELETE FROM dbo.[tm_mesures_etalonnage] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -24, GETDATE());
  DELETE FROM dbo.[tm_mesures_gso_read_metro] WHERE [Dernier_Date_MAJ] < DATEADD(HOUR, -2, GETDATE());
END;
GO

-- =====================================================================
-- Triggers GSO convertis depuis db/triggersvigisensys.sql
-- =====================================================================
USE [vigi_main];
GO

CREATE OR ALTER TRIGGER dbo.[TRG_GSO_BEF_DEL_ALARME]
ON dbo.[t_alarme]
AFTER DELETE
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[t_alarme_histo]
  ([Id_Alarme],[Date_Heure_Debut],[Valeur],[Type],[Date_Heure_Fin],[Id_Lieu],[Sonde_Numero_Serie],[Unite],[Est_Acquittee],[Date_Heure_Derniere_Mesure],[Est_Alarme_Pour_VigiTel],[Est_Mail_Envoye],[Est_Tel_Acquittee],[Date_Heure_Acquittement])
  SELECT
    d.[Id_Alarme],
    d.[Date_Heure_Debut],
    d.[Valeur],
    d.[Type],
    d.[Date_Heure_Fin],
    d.[Id_Lieu],
    d.[Sonde_Numero_Serie],
    d.[Unite],
    d.[Est_Acquittee],
    d.[Date_Heure_Derniere_Mesure],
    d.[Est_Alarme_Pour_VigiTel],
    d.[Est_Mail_Envoye],
    d.[Est_Tel_Acquittee],
    GETDATE()
  FROM deleted d;
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_GSO_BEF_UPD_LIEU_ALARME]
ON dbo.[t_lieu]
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF TRY_CAST(SESSION_CONTEXT(N'SKIP_LIEU_ALARM_LOGIC') AS bit) = 1
    RETURN;

  IF TRIGGER_NESTLEVEL() > 1
    RETURN;

  DECLARE
    @Id_Lieu INT,
    @Est_Lieu_GSO BIT,
    @Lieu_Etat VARCHAR(1),
    @Date_Heure_Dernier_Acquittement_En_Cours DATETIME,
    @Derniere_Date_Heure DATETIME,
    @Date_Heure_Derniere_Reponse DATETIME,
    @Retard_Non_Reponse INT,
    @Est_Acq_Auto_Alarme_NR BIT,
    @Derniere_Valeur FLOAT,
    @Tolerance_Surveillance_Inf FLOAT,
    @Tolerance_Surveillance_Sup FLOAT,
    @Retard_Alarme_Bas INT,
    @Retard_Alarme_Haut INT,
    @Sonde_Numero_Serie VARCHAR(50),
    @Date_Heure_Last_Update_EVT_GSO DATETIME,
    @Derniere_Unite VARCHAR(10),
    @Date_Heure_Derniere_Reponse_Recue_OK DATETIME,
    @Id_Alarme INT,
    @Est_Lieu_En_Alarme BIT,
    @Est_Lieu_En_Pre_Alarme BIT,
    @Est_Lieu_Alarme_Terminee_Non_Acquittee BIT,
    @Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 BIT,
    @Est_Consigne_Inf_Pre_Alarme_Active BIT,
    @Consigne_Inf_Pre_Alarme FLOAT,
    @Est_Consigne_Sup_Pre_Alarme_Active BIT,
    @Consigne_Sup_Pre_Alarme FLOAT,
    @v_Id_Alarme INT,
    @v_TypeAlarme VARCHAR(1),
    @New_Id_Alarme INT,
    @New_Derniere_Valeur FLOAT,
    @New_Derniere_Date_Heure DATETIME,
    @New_Est_Lieu_En_Alarme BIT,
    @New_Est_Lieu_En_Pre_Alarme BIT,
    @New_Est_Lieu_Alarme_Terminee_Non_Acquittee BIT,
    @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 BIT,
    @ApplyUpdate BIT;

  DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
    SELECT
      i.[Id_Lieu],
      ISNULL(i.[Est_Lieu_GSO], 0),
      i.[Lieu_Etat],
      i.[Date_Heure_Dernier_Acquittement_En_Cours],
      i.[Derniere_Date_Heure],
      i.[Date_Heure_Derniere_Reponse],
      ISNULL(i.[Retard_Non_Reponse], 0),
      ISNULL(i.[Est_Acq_Auto_Alarme_NR], 0),
      i.[Derniere_Valeur],
      i.[Tolerance_Surveillance_Inf],
      i.[Tolerance_Surveillance_Sup],
      ISNULL(i.[Retard_Alarme_Bas], 0),
      ISNULL(i.[Retard_Alarme_Haut], 0),
      i.[Sonde_Numero_Serie],
      i.[Date_Heure_Last_Update_EVT_GSO],
      i.[Derniere_Unite],
      i.[Date_Heure_Derniere_Reponse_Recue_OK],
      ISNULL(i.[Id_Alarme], 0),
      ISNULL(i.[Est_Lieu_En_Alarme], 0),
      ISNULL(i.[Est_Lieu_En_Pre_Alarme], 0),
      ISNULL(i.[Est_Lieu_Alarme_Terminee_Non_Acquittee], 0),
      ISNULL(i.[Est_Lieu_Alarme_Terminee_Non_Acquittee_T1], 0),
      ISNULL(i.[Est_Consigne_Inf_Pre_Alarme_Active], 0),
      i.[Consigne_Inf_Pre_Alarme],
      ISNULL(i.[Est_Consigne_Sup_Pre_Alarme_Active], 0),
      i.[Consigne_Sup_Pre_Alarme]
    FROM inserted i;

  OPEN cur;
  FETCH NEXT FROM cur INTO
    @Id_Lieu,@Est_Lieu_GSO,@Lieu_Etat,@Date_Heure_Dernier_Acquittement_En_Cours,@Derniere_Date_Heure,@Date_Heure_Derniere_Reponse,@Retard_Non_Reponse,
    @Est_Acq_Auto_Alarme_NR,
    @Derniere_Valeur,@Tolerance_Surveillance_Inf,@Tolerance_Surveillance_Sup,@Retard_Alarme_Bas,@Retard_Alarme_Haut,@Sonde_Numero_Serie,
    @Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite,@Date_Heure_Derniere_Reponse_Recue_OK,@Id_Alarme,@Est_Lieu_En_Alarme,@Est_Lieu_En_Pre_Alarme,
    @Est_Lieu_Alarme_Terminee_Non_Acquittee,@Est_Lieu_Alarme_Terminee_Non_Acquittee_T1,@Est_Consigne_Inf_Pre_Alarme_Active,@Consigne_Inf_Pre_Alarme,
    @Est_Consigne_Sup_Pre_Alarme_Active,@Consigne_Sup_Pre_Alarme;

  WHILE @@FETCH_STATUS = 0
  BEGIN
    IF @Est_Lieu_GSO = 1
    BEGIN
      SET @v_Id_Alarme = NULL;
      SET @v_TypeAlarme = NULL;
      SET @New_Id_Alarme = @Id_Alarme;
      SET @New_Derniere_Valeur = @Derniere_Valeur;
      SET @New_Derniere_Date_Heure = @Derniere_Date_Heure;
      SET @New_Est_Lieu_En_Alarme = @Est_Lieu_En_Alarme;
      SET @New_Est_Lieu_En_Pre_Alarme = @Est_Lieu_En_Pre_Alarme;
      SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = @Est_Lieu_Alarme_Terminee_Non_Acquittee;
      SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = @Est_Lieu_Alarme_Terminee_Non_Acquittee_T1;
      SET @ApplyUpdate = 0;

      IF @Date_Heure_Dernier_Acquittement_En_Cours IS NOT NULL
         AND @Derniere_Date_Heure <= @Date_Heure_Dernier_Acquittement_En_Cours
         AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
      BEGIN
        SET @New_Id_Alarme = 0;
        SET @New_Est_Lieu_En_Alarme = 0;
        SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
        SET @ApplyUpdate = 1;
      END
      ELSE
      BEGIN
        SELECT TOP 1 @v_Id_Alarme = [Id_Alarme], @v_TypeAlarme = [Type]
        FROM dbo.[t_alarme]
        WHERE [Id_Lieu] = @Id_Lieu
          AND [Type] IN ('B','H','N')
          AND [Date_Heure_Fin] IS NULL;

        IF @v_Id_Alarme IS NULL
        BEGIN
          IF @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
             AND @Derniere_Valeur < @Tolerance_Surveillance_Inf
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse_Recue_OK, @Derniere_Date_Heure) >= @Retard_Alarme_Bas * 60
          BEGIN
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse_Recue_OK,@Derniere_Valeur,'B',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY());
            SET @New_Est_Lieu_En_Alarme = 1;
            SET @New_Est_Lieu_En_Pre_Alarme = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            SET @ApplyUpdate = 1;
          END
          ELSE IF @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
             AND @Derniere_Valeur > @Tolerance_Surveillance_Sup
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse_Recue_OK, @Derniere_Date_Heure) >= @Retard_Alarme_Haut * 60
          BEGIN
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse_Recue_OK,@Derniere_Valeur,'H',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY());
            SET @New_Est_Lieu_En_Alarme = 1;
            SET @New_Est_Lieu_En_Pre_Alarme = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            SET @ApplyUpdate = 1;
          END
          ELSE IF @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) >= @Retard_Non_Reponse * 60
          BEGIN
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse,NULL,'N',@Id_Lieu,@Sonde_Numero_Serie,@Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY());
            SET @New_Derniere_Valeur = NULL;
            SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO;
            SET @New_Est_Lieu_En_Alarme = 1;
            SET @New_Est_Lieu_En_Pre_Alarme = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            SET @ApplyUpdate = 1;
          END
        END
        ELSE
        BEGIN
          IF @v_TypeAlarme = 'N'
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
             AND @Derniere_Valeur < @Tolerance_Surveillance_Inf
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'B',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'N'
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
             AND @Derniere_Valeur > @Tolerance_Surveillance_Sup
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'H',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'B'
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) >= @Retard_Non_Reponse * 60
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse,NULL,'N',@Id_Lieu,@Sonde_Numero_Serie,@Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Derniere_Valeur = NULL; SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'H'
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) >= @Retard_Non_Reponse * 60
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse,NULL,'N',@Id_Lieu,@Sonde_Numero_Serie,@Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Derniere_Valeur = NULL; SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'B'
             AND @Lieu_Etat = 'S'
             AND @Derniere_Valeur > @Tolerance_Surveillance_Sup
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'H',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'H'
             AND @Lieu_Etat = 'S'
             AND @Derniere_Valeur < @Tolerance_Surveillance_Inf
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'B',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'N'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) > @Retard_Non_Reponse * 60
          BEGIN
            UPDATE dbo.[t_alarme] SET [Valeur] = NULL, [Date_Heure_Derniere_Mesure] = @Date_Heure_Last_Update_EVT_GSO WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = @v_Id_Alarme; SET @New_Derniere_Valeur = NULL; SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme IN ('B','H')
             AND (@Derniere_Valeur < @Tolerance_Surveillance_Inf OR @Derniere_Valeur > @Tolerance_Surveillance_Sup)
          BEGIN
            UPDATE dbo.[t_alarme] SET [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = @v_Id_Alarme; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'N'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) < @Retard_Non_Reponse * 60
             AND @Est_Acq_Auto_Alarme_NR = 0
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = 0; SET @New_Est_Lieu_En_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme = 'N'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) < @Retard_Non_Reponse * 60
             AND @Est_Acq_Auto_Alarme_NR = 1
          BEGIN
            UPDATE dbo.[t_alarme]
            SET [Date_Heure_Fin] = @Derniere_Date_Heure,
                [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure
            WHERE [Id_Alarme] = @v_Id_Alarme;
            DELETE FROM dbo.[t_alarme] WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = 0;
            SET @New_Est_Lieu_En_Alarme = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme IN ('B','H')
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = 0; SET @New_Est_Lieu_En_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
        END

        IF @New_Est_Lieu_En_Alarme = 0
        BEGIN
          IF @Est_Consigne_Inf_Pre_Alarme_Active = 1
          BEGIN
            IF @Derniere_Valeur < @Consigne_Inf_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1
            BEGIN
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
              SET @New_Est_Lieu_En_Pre_Alarme = 1;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur < @Consigne_Inf_Pre_Alarme
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 1;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur >= @Consigne_Inf_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 0;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur >= @Consigne_Inf_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 0;
              SET @ApplyUpdate = 1;
            END
          END

          IF @Est_Consigne_Sup_Pre_Alarme_Active = 1
          BEGIN
            IF @Derniere_Valeur > @Consigne_Sup_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1
            BEGIN
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
              SET @New_Est_Lieu_En_Pre_Alarme = 1;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur > @Consigne_Sup_Pre_Alarme
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 1;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur <= @Consigne_Sup_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 0;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;
              SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
              SET @ApplyUpdate = 1;
            END
            ELSE IF @Derniere_Valeur <= @Consigne_Sup_Pre_Alarme AND @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0
            BEGIN
              SET @New_Est_Lieu_En_Pre_Alarme = 0;
              SET @ApplyUpdate = 1;
            END
          END
        END
      END

      IF @ApplyUpdate = 1
      BEGIN
        EXEC sp_set_session_context @key = N'SKIP_LIEU_ALARM_LOGIC', @value = 1;
        UPDATE dbo.[t_lieu]
        SET [Id_Alarme] = @New_Id_Alarme,
            [Derniere_Valeur] = @New_Derniere_Valeur,
            [Derniere_Date_Heure] = @New_Derniere_Date_Heure,
            [Est_Lieu_En_Alarme] = @New_Est_Lieu_En_Alarme,
            [Est_Lieu_En_Pre_Alarme] = @New_Est_Lieu_En_Pre_Alarme,
            [Est_Lieu_Alarme_Terminee_Non_Acquittee] = @New_Est_Lieu_Alarme_Terminee_Non_Acquittee,
            [Est_Lieu_Alarme_Terminee_Non_Acquittee_T1] = @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1
        WHERE [Id_Lieu] = @Id_Lieu;
        EXEC sp_set_session_context @key = N'SKIP_LIEU_ALARM_LOGIC', @value = NULL;
      END
    END

    FETCH NEXT FROM cur INTO
      @Id_Lieu,@Est_Lieu_GSO,@Lieu_Etat,@Date_Heure_Dernier_Acquittement_En_Cours,@Derniere_Date_Heure,@Date_Heure_Derniere_Reponse,@Retard_Non_Reponse,
      @Est_Acq_Auto_Alarme_NR,
      @Derniere_Valeur,@Tolerance_Surveillance_Inf,@Tolerance_Surveillance_Sup,@Retard_Alarme_Bas,@Retard_Alarme_Haut,@Sonde_Numero_Serie,
      @Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite,@Date_Heure_Derniere_Reponse_Recue_OK,@Id_Alarme,@Est_Lieu_En_Alarme,@Est_Lieu_En_Pre_Alarme,
      @Est_Lieu_Alarme_Terminee_Non_Acquittee,@Est_Lieu_Alarme_Terminee_Non_Acquittee_T1,@Est_Consigne_Inf_Pre_Alarme_Active,@Consigne_Inf_Pre_Alarme,
      @Est_Consigne_Sup_Pre_Alarme_Active,@Consigne_Sup_Pre_Alarme;
  END

  CLOSE cur;
  DEALLOCATE cur;
END;
GO

USE [vigi_mesures];
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_GSO_CMD_MEM]
ON dbo.[tm_mesures_gso_commandes_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE c
  SET [Port_Serie_Send_GSO] = v.[Port_Serie_Send_GSO]
  FROM dbo.[tm_mesures_gso_commandes_mem] c
  JOIN inserted i
    ON i.[GSO_SN] = c.[GSO_SN]
   AND i.[Commande_Globale_Begin] = c.[Commande_Globale_Begin]
   AND i.[Commande_Globale_End] = c.[Commande_Globale_End]
  JOIN dbo.[v_config_sonde_com] v
    ON v.[GSO_SN] = i.[GSO_SN]
  WHERE c.[Port_Serie_Send_GSO] IS NULL;
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_GSO_READ_MEM]
ON dbo.[tm_mesures_gso_read_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[tm_mesures_gso_read_metro] ([GSO_SN], [Commande_metro], [Commande_metro_envoyee], [Dernier_Date_MAJ])
  SELECT i.[GSO_SN], i.[Ecart], 1, i.[Date_Heure_Read_Mem]
  FROM inserted i
  WHERE i.[Ecart] = '0-1'
    AND EXISTS (SELECT 1 FROM dbo.[v_config_sonde_com] v WHERE v.[GSO_SN] = i.[GSO_SN] AND v.[Metrologie_en_cours] = 1)
    AND NOT EXISTS (
      SELECT 1 FROM dbo.[tm_mesures_gso_read_metro] x WHERE x.[GSO_SN] = i.[GSO_SN] AND x.[Commande_metro] = i.[Ecart]
    );
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_MES_GSO]
ON dbo.[tm_mesures_gso]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[tm_mesures_gso_build]
  ([Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[Rssi],[Tension],[COM_sonde],[Est_Mesure_Repeteur_GSO],[Id_Lieu],[Est_Valeur_Memoire],[Planning_Actif],[Planning_Regle_Existe])
  SELECT
    i.[date_mesure],
    i.[tep],
    i.[unite],
    i.[id_capteur],
    i.[rssi],
    i.[tension],
    i.[COM_sonde],
    CASE WHEN i.[trame] = 0x0000000000989680 THEN 1 ELSE 0 END,
    v.[Id_Lieu],
    CASE WHEN i.[date_mesure] <= DATEADD(MINUTE, -45, GETDATE()) THEN 1 ELSE 0 END,
    v.[Planning_Actif],
    v.[Planning_Regle_Existe]
  FROM inserted i
  JOIN dbo.[v_config_lieu_sonde] v ON v.[Adresse_Sonde] = i.[id_capteur]
  WHERE i.[trame] IN (0x0000000000000000, 0x0000000000000001, 0x0000000000989680)
    AND i.[date_mesure] >= DATEADD(HOUR, -192, GETDATE());

  INSERT INTO dbo.[tm_mesures_ajustage] ([Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde])
  SELECT i.[date_mesure], i.[tep], i.[unite], i.[id_capteur]
  FROM inserted i
  WHERE EXISTS (SELECT 1 FROM dbo.[v_config_sonde_com] v WHERE v.[Adresse_Sonde] = i.[id_capteur])
    AND i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());

  INSERT INTO dbo.[tm_mesures_etalonnage] ([Valeur],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde])
  SELECT
    ROUND((i.[tep] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0), 2),
    i.[date_mesure],
    i.[tep],
    i.[unite],
    i.[id_capteur]
  FROM inserted i
  JOIN dbo.[v_config_sonde_com] v ON v.[Adresse_Sonde] = i.[id_capteur]
  WHERE i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());

  UPDATE m
  SET [Metro_en_cours] = 1,
      [Dernier_Date_MAJ] = i.[date_mesure]
  FROM dbo.[tm_mesures_gso_read_metro] m
  JOIN inserted i
    ON m.[GSO_SN] = CASE WHEN LEN(i.[id_capteur]) > 2 THEN LEFT(i.[id_capteur], LEN(i.[id_capteur]) - 2) ELSE i.[id_capteur] END
  WHERE i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_MES_GSO_BUILD]
ON dbo.[tm_mesures_gso_build]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH src AS (
    SELECT
      i.[Date_Heure_Mesure],
      i.[Valeur_Brute],
      i.[Unite],
      i.[Adresse_Sonde],
      i.[COM_sonde],
      i.[Est_Mesure_Repeteur_GSO],
      i.[Id_Lieu],
      i.[Rssi],
      i.[Tension],
      i.[Est_Valeur_Memoire],
      i.[Planning_Actif],
      i.[Planning_Regle_Existe],
      v.[Sonde_Numero_Serie],
      v.[Consigne],
      v.[Consigne_Sup_Corr],
      v.[Consigne_Inf_Corr],
      v.[Consigne_Sup_Pre_Alarme],
      v.[Consigne_Inf_Pre_Alarme],
      v.[Consigne_Base],
      v.[Tolerance_Surveillance_Sup_Base],
      v.[Tolerance_Surveillance_Inf_Base],
      v.[coeff_a],
      v.[coeff_b],
      v.[Sonde_Offset],
      v.[-(EJ)] AS [NegEJ],
      p.[Consigne_Apres],
      p.[Tolerance_Surveillance_Sup_Apres],
      p.[Tolerance_Surveillance_Inf_Apres],
      ROUND((i.[Valeur_Brute] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0) + ISNULL(v.[-(EJ)], 0), 2) AS [ValeurCalc]
    FROM inserted i
    JOIN dbo.[v_config_lieu_sonde] v ON v.[Id_Lieu] = i.[Id_Lieu]
    OUTER APPLY (
      SELECT TOP 1
        pc.[Consigne_Apres],
        pc.[Tolerance_Surveillance_Sup_Apres],
        pc.[Tolerance_Surveillance_Inf_Apres]
      FROM dbo.[v_config_lieu_planning_consignes] pc
      WHERE pc.[Id_Lieu] = i.[Id_Lieu]
        AND (
          i.[Date_Heure_Mesure] BETWEEN pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement]
          OR (i.[Date_Heure_Mesure] > pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement] IS NULL)
        )
    ) p
  )
  INSERT INTO dbo.[tm_mesures]
  ([Valeur],[Sonde_Numero_Serie],[Consigne],[Consigne_Sup],[Consigne_Inf],[Consigne_Sup_Pre_Alarme],[Consigne_Inf_Pre_Alarme],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[COM_sonde],[Est_Mesure_Repeteur_GSO],[Id_Lieu],[Rssi],[Tension],[Est_Valeur_Memoire],[Planning_Actif],[Planning_Regle_Existe])
  SELECT
    s.[ValeurCalc],
    s.[Sonde_Numero_Serie],
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Consigne_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne])
      ELSE s.[Consigne]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Tolerance_Surveillance_Sup_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Sup_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Consigne_Sup_Corr])
      ELSE s.[Consigne_Sup_Corr]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Tolerance_Surveillance_Inf_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Inf_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Consigne_Inf_Corr])
      ELSE s.[Consigne_Inf_Corr]
    END,
    s.[Consigne_Sup_Pre_Alarme],
    s.[Consigne_Inf_Pre_Alarme],
    s.[Date_Heure_Mesure],
    s.[Valeur_Brute],
    s.[Unite],
    s.[Adresse_Sonde],
    s.[COM_sonde],
    s.[Est_Mesure_Repeteur_GSO],
    s.[Id_Lieu],
    s.[Rssi],
    s.[Tension],
    s.[Est_Valeur_Memoire],
    s.[Planning_Actif],
    s.[Planning_Regle_Existe]
  FROM src s;

  ;WITH src AS (
    SELECT
      i.[Date_Heure_Mesure],
      i.[Valeur_Brute],
      i.[Unite],
      i.[Adresse_Sonde],
      i.[COM_sonde],
      i.[Est_Mesure_Repeteur_GSO],
      i.[Id_Lieu],
      i.[Rssi],
      i.[Tension],
      i.[Est_Valeur_Memoire],
      i.[Planning_Actif],
      i.[Planning_Regle_Existe],
      v.[Sonde_Numero_Serie],
      v.[Consigne],
      v.[Consigne_Sup_Corr],
      v.[Consigne_Inf_Corr],
      v.[Consigne_Sup_Pre_Alarme],
      v.[Consigne_Inf_Pre_Alarme],
      v.[Consigne_Base],
      v.[Tolerance_Surveillance_Sup_Base],
      v.[Tolerance_Surveillance_Inf_Base],
      v.[coeff_a],
      v.[coeff_b],
      v.[Sonde_Offset],
      v.[-(EJ)] AS [NegEJ],
      p.[Consigne_Apres],
      p.[Tolerance_Surveillance_Sup_Apres],
      p.[Tolerance_Surveillance_Inf_Apres],
      ROUND((i.[Valeur_Brute] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0) + ISNULL(v.[-(EJ)], 0), 2) AS [ValeurCalc]
    FROM inserted i
    JOIN dbo.[v_config_lieu_sonde] v ON v.[Id_Lieu] = i.[Id_Lieu]
    OUTER APPLY (
      SELECT TOP 1
        pc.[Consigne_Apres],
        pc.[Tolerance_Surveillance_Sup_Apres],
        pc.[Tolerance_Surveillance_Inf_Apres]
      FROM dbo.[v_config_lieu_planning_consignes] pc
      WHERE pc.[Id_Lieu] = i.[Id_Lieu]
        AND (
          i.[Date_Heure_Mesure] BETWEEN pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement]
          OR (i.[Date_Heure_Mesure] > pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement] IS NULL)
        )
    ) p
  )
  INSERT INTO dbo.[tm_graphique]
  ([Valeur],[Sonde_Numero_Serie],[Consigne],[Consigne_Sup],[Consigne_Inf],[Consigne_Sup_Pre_Alarme],[Consigne_Inf_Pre_Alarme],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[Id_Lieu])
  SELECT
    s.[ValeurCalc],
    s.[Sonde_Numero_Serie],
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Consigne_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne])
      ELSE s.[Consigne]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Tolerance_Surveillance_Sup_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Sup_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Consigne_Sup_Corr])
      ELSE s.[Consigne_Sup_Corr]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Tolerance_Surveillance_Inf_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Inf_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Consigne_Inf_Corr])
      ELSE s.[Consigne_Inf_Corr]
    END,
    s.[Consigne_Sup_Pre_Alarme],
    s.[Consigne_Inf_Pre_Alarme],
    s.[Date_Heure_Mesure],
    s.[Valeur_Brute],
    s.[Unite],
    s.[Adresse_Sonde],
    s.[Id_Lieu]
  FROM src s;
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_BEF_INS_GSO_COUNT]
ON dbo.[tm_mesures_gso_count_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE c
  SET [Port_Serie_Send_GSO] = v.[Port_Serie_Send_GSO]
  FROM dbo.[tm_mesures_gso_count_mem] c
  JOIN inserted i
    ON i.[GSO_SN] = c.[GSO_SN]
   AND i.[Missing_Data_Begin] = c.[Missing_Data_Begin]
   AND i.[Missing_Data_End] = c.[Missing_Data_End]
  JOIN dbo.[v_config_sonde_com] v
    ON v.[GSO_SN] = i.[GSO_SN]
  WHERE c.[Port_Serie_Send_GSO] IS NULL;
END;
GO
