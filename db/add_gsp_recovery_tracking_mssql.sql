USE [vigi_mesures];
GO

IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_remontee_plage_gsp] (
    [Id] INT IDENTITY(1,1) NOT NULL CONSTRAINT [PK_tm_remontee_plage_gsp] PRIMARY KEY,
    [Id_Lieu] INT NOT NULL,
    [GSP_SN] VARCHAR(50) NOT NULL,
    [Date_Heure_Debut] DATETIME NOT NULL,
    [Date_Heure_Fin] DATETIME NOT NULL,
    [Statut] VARCHAR(20) NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Statut] DEFAULT('A_FAIRE'),
    [Date_Creation] DATETIME NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Date_Creation] DEFAULT(GETDATE()),
    [Date_Derniere_Maj] DATETIME NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Date_Derniere_Maj] DEFAULT(GETDATE()),
    [Nb_Tentatives] INT NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Nb_Tentatives] DEFAULT(0),
    [Derniere_Erreur] VARCHAR(MAX) NULL
  );

  CREATE INDEX [IDX_tm_remontee_plage_gsp_lieu_sonde_statut]
    ON dbo.[tm_remontee_plage_gsp]([Id_Lieu], [GSP_SN], [Statut]);
  CREATE INDEX [IDX_tm_remontee_plage_gsp_debut]
    ON dbo.[tm_remontee_plage_gsp]([Date_Heure_Debut]);
  CREATE INDEX [IDX_tm_remontee_plage_gsp_fin]
    ON dbo.[tm_remontee_plage_gsp]([Date_Heure_Fin]);
END;
GO
