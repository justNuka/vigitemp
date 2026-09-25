-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.2
-- Microsoft SQL Server
-- Baseline attendue : 0.91.1
-- =====================================================================
--
-- Changements :
--   1. élargit les types d'alarme de 1 à 2 caractères ;
--   2. ajoute les messages CRITIQUE_BAS (CB) et CRITIQUE_HAUT (CH) ;
--   3. conserve volontairement le trigger GSO de 0.91.1 sans traitement
--      direct des seuils critiques ;
--   4. positionne VERSION/SCHEMA_VERSION à 0.91.2 à la fin.
--

USE [vigi_main];
GO

ALTER TABLE dbo.[t_alarme] ALTER COLUMN [Type] VARCHAR(2) NULL;
ALTER TABLE dbo.[t_alarme_histo] ALTER COLUMN [Type] VARCHAR(2) NULL;
ALTER TABLE dbo.[t_alarme_message] ALTER COLUMN [Type] VARCHAR(2) NULL;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.[t_alarme_message] WHERE [Id_Alarme_Message] = 20)
    BEGIN
        UPDATE dbo.[t_alarme_message]
           SET [Code_Alarme_Message] = 'CRITIQUE_BAS',
               [Type] = 'CB',
               [Texte_Message] = N'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.'
         WHERE [Id_Alarme_Message] = 20;
    END
    ELSE
    BEGIN
        SET IDENTITY_INSERT dbo.[t_alarme_message] ON;
        INSERT INTO dbo.[t_alarme_message]
          ([Id_Alarme_Message], [Code_Alarme_Message], [Type], [Texte_Message])
        VALUES
          (20, 'CRITIQUE_BAS', 'CB', N'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.');
        SET IDENTITY_INSERT dbo.[t_alarme_message] OFF;
    END;

    IF EXISTS (SELECT 1 FROM dbo.[t_alarme_message] WHERE [Id_Alarme_Message] = 21)
    BEGIN
        UPDATE dbo.[t_alarme_message]
           SET [Code_Alarme_Message] = 'CRITIQUE_HAUT',
               [Type] = 'CH',
               [Texte_Message] = N'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.'
         WHERE [Id_Alarme_Message] = 21;
    END
    ELSE
    BEGIN
        SET IDENTITY_INSERT dbo.[t_alarme_message] ON;
        INSERT INTO dbo.[t_alarme_message]
          ([Id_Alarme_Message], [Code_Alarme_Message], [Type], [Texte_Message])
        VALUES
          (21, 'CRITIQUE_HAUT', 'CH', N'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.');
        SET IDENTITY_INSERT dbo.[t_alarme_message] OFF;
    END;

    UPDATE dbo.[t_parametre]
       SET [Valeur] = N'0.91.2',
           [Commentaire] = N'Version de schéma VigiSensys'
     WHERE [Section] = 'VERSION'
       AND [Mot_Cle] = 'SCHEMA_VERSION';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.[t_parametre] ([Section], [Mot_Cle], [Valeur], [Commentaire])
        VALUES ('VERSION', 'SCHEMA_VERSION', N'0.91.2', N'Version de schéma VigiSensys');
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    IF OBJECTPROPERTY(OBJECT_ID(N'dbo.t_alarme_message'), 'TableHasIdentity') = 1
    BEGIN TRY
        SET IDENTITY_INSERT dbo.[t_alarme_message] OFF;
    END TRY
    BEGIN CATCH
        -- Ignore cleanup error and rethrow the original migration error below.
    END CATCH;

    THROW;
END CATCH;
GO

SELECT N'Migration VigiSensys DB 0.91.2 terminée' AS Migration_Status;
GO
