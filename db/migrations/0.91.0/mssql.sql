-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.0
-- Microsoft SQL Server
-- Baseline attendue : 0.90.2
-- =====================================================================
--
-- Changements :
--   1. ajoute les seuils critiques haut/bas sur t_lieu ;
--   2. ajoute les mêmes champs aux templates de lieu ;
--   3. positionne VERSION/SCHEMA_VERSION à 0.91.0 à la fin.
--
-- Un seuil critique actif est évalué par VigiSensys Serveur et déclenche
-- immédiatement l'alarme haute/basse correspondante, sans attendre le
-- retard d'alarme normal. Il n'est pas envoyé au firmware GSP.

SET XACT_ABORT ON;
GO

USE [vigi_main];
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH('dbo.t_lieu', 'Seuil_Critique_Haut') IS NULL
        ALTER TABLE dbo.t_lieu ADD Seuil_Critique_Haut FLOAT NULL;

    IF COL_LENGTH('dbo.t_lieu', 'Est_Seuil_Critique_Haut_Active') IS NULL
        ALTER TABLE dbo.t_lieu
            ADD Est_Seuil_Critique_Haut_Active BIT NOT NULL
                CONSTRAINT DF_t_lieu_Seuil_Critique_Haut_Active DEFAULT (0);

    IF COL_LENGTH('dbo.t_lieu', 'Seuil_Critique_Bas') IS NULL
        ALTER TABLE dbo.t_lieu ADD Seuil_Critique_Bas FLOAT NULL;

    IF COL_LENGTH('dbo.t_lieu', 'Est_Seuil_Critique_Bas_Active') IS NULL
        ALTER TABLE dbo.t_lieu
            ADD Est_Seuil_Critique_Bas_Active BIT NOT NULL
                CONSTRAINT DF_t_lieu_Seuil_Critique_Bas_Active DEFAULT (0);

    IF COL_LENGTH('dbo.t_lieu_template', 'Seuil_Critique_Haut') IS NULL
        ALTER TABLE dbo.t_lieu_template ADD Seuil_Critique_Haut DECIMAL(10,2) NULL;

    IF COL_LENGTH('dbo.t_lieu_template', 'Est_Seuil_Critique_Haut_Active') IS NULL
        ALTER TABLE dbo.t_lieu_template
            ADD Est_Seuil_Critique_Haut_Active BIT NOT NULL
                CONSTRAINT DF_t_lieu_template_Seuil_Critique_Haut_Active DEFAULT (0);

    IF COL_LENGTH('dbo.t_lieu_template', 'Seuil_Critique_Bas') IS NULL
        ALTER TABLE dbo.t_lieu_template ADD Seuil_Critique_Bas DECIMAL(10,2) NULL;

    IF COL_LENGTH('dbo.t_lieu_template', 'Est_Seuil_Critique_Bas_Active') IS NULL
        ALTER TABLE dbo.t_lieu_template
            ADD Est_Seuil_Critique_Bas_Active BIT NOT NULL
                CONSTRAINT DF_t_lieu_template_Seuil_Critique_Bas_Active DEFAULT (0);

    UPDATE dbo.t_parametre
       SET Valeur = N'0.91.0',
           Commentaire = N'Version de schéma VigiSensys'
     WHERE Section = 'VERSION'
       AND Mot_Cle = 'SCHEMA_VERSION';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.t_parametre (Section, Mot_Cle, Valeur, Commentaire)
        VALUES ('VERSION', 'SCHEMA_VERSION', N'0.91.0', N'Version de schéma VigiSensys');
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

SELECT N'Migration VigiSensys DB 0.91.0 terminée' AS Migration_Status;
GO
