-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.92.0
-- Microsoft SQL Server
-- Baseline attendue : 0.91.1
-- =====================================================================
--
-- Changements :
--   1. élargit t_alarme.Type, t_alarme_histo.Type et
--      t_alarme_message.Type de 1 à 2 caractères ;
--   2. ajoute les messages CRITIQUE_BAS (CB) et CRITIQUE_HAUT (CH) ;
--   3. réinstalle le trigger GSO avec déclenchement critique initial CB/CH ;
--   4. positionne VERSION/SCHEMA_VERSION à 0.92.0 uniquement à la fin.
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

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    BEGIN TRY
        SET IDENTITY_INSERT dbo.[t_alarme_message] OFF;
    END TRY
    BEGIN CATCH
        -- Ignore cleanup error and rethrow the original migration error below.
    END CATCH;

    THROW;
END CATCH;
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
    @Seuil_Critique_Bas FLOAT,
    @Est_Seuil_Critique_Bas_Active BIT,
    @Seuil_Critique_Haut FLOAT,
    @Est_Seuil_Critique_Haut_Active BIT,
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
    @v_TypeAlarme VARCHAR(2),
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
      i.[Seuil_Critique_Bas],
      ISNULL(i.[Est_Seuil_Critique_Bas_Active], 0),
      i.[Seuil_Critique_Haut],
      ISNULL(i.[Est_Seuil_Critique_Haut_Active], 0),
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
    @Derniere_Valeur,@Tolerance_Surveillance_Inf,@Tolerance_Surveillance_Sup,@Seuil_Critique_Bas,@Est_Seuil_Critique_Bas_Active,@Seuil_Critique_Haut,@Est_Seuil_Critique_Haut_Active,@Retard_Alarme_Bas,@Retard_Alarme_Haut,@Sonde_Numero_Serie,
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
          AND [Type] IN ('B','CB','H','CH','N')
          AND [Date_Heure_Fin] IS NULL;

        IF @Lieu_Etat = 'S'
           AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
           AND @Est_Seuil_Critique_Bas_Active = 1
           AND @Seuil_Critique_Bas IS NOT NULL
           AND @Derniere_Valeur < @Seuil_Critique_Bas
        BEGIN
          IF @v_Id_Alarme IS NOT NULL AND @v_TypeAlarme IN ('B','CB')
          BEGIN
            UPDATE dbo.[t_alarme]
            SET [Valeur] = @Derniere_Valeur,
                [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure
            WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = @v_Id_Alarme;
          END
          ELSE
          BEGIN
            IF @v_Id_Alarme IS NOT NULL
            BEGIN
              UPDATE dbo.[t_alarme]
              SET [Date_Heure_Fin] = @Derniere_Date_Heure,
                  [Valeur] = @Derniere_Valeur,
                  [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure
              WHERE [Id_Alarme] = @v_Id_Alarme;
              IF @v_TypeAlarme = 'N' AND @Est_Acq_Auto_Alarme_NR = 1
                DELETE FROM dbo.[t_alarme] WHERE [Id_Alarme] = @v_Id_Alarme;
            END
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'CB',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY());
          END
          SET @New_Est_Lieu_En_Alarme = 1;
          SET @New_Est_Lieu_En_Pre_Alarme = 0;
          SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
          SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
          SET @ApplyUpdate = 1;
        END
        ELSE IF @Lieu_Etat = 'S'
           AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) <= @Retard_Non_Reponse * 60
           AND @Est_Seuil_Critique_Haut_Active = 1
           AND @Seuil_Critique_Haut IS NOT NULL
           AND @Derniere_Valeur > @Seuil_Critique_Haut
        BEGIN
          IF @v_Id_Alarme IS NOT NULL AND @v_TypeAlarme IN ('H','CH')
          BEGIN
            UPDATE dbo.[t_alarme]
            SET [Valeur] = @Derniere_Valeur,
                [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure
            WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = @v_Id_Alarme;
          END
          ELSE
          BEGIN
            IF @v_Id_Alarme IS NOT NULL
            BEGIN
              UPDATE dbo.[t_alarme]
              SET [Date_Heure_Fin] = @Derniere_Date_Heure,
                  [Valeur] = @Derniere_Valeur,
                  [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure
              WHERE [Id_Alarme] = @v_Id_Alarme;
              IF @v_TypeAlarme = 'N' AND @Est_Acq_Auto_Alarme_NR = 1
                DELETE FROM dbo.[t_alarme] WHERE [Id_Alarme] = @v_Id_Alarme;
            END
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'CH',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY());
          END
          SET @New_Est_Lieu_En_Alarme = 1;
          SET @New_Est_Lieu_En_Pre_Alarme = 0;
          SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
          SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
          SET @ApplyUpdate = 1;
        END
        ELSE IF @v_Id_Alarme IS NULL
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
          ELSE IF @v_TypeAlarme IN ('B','CB')
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) >= @Retard_Non_Reponse * 60
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse,NULL,'N',@Id_Lieu,@Sonde_Numero_Serie,@Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Derniere_Valeur = NULL; SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme IN ('H','CH')
             AND @Lieu_Etat = 'S'
             AND DATEDIFF(SECOND, @Date_Heure_Derniere_Reponse, GETDATE()) >= @Retard_Non_Reponse * 60
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Date_Heure_Derniere_Reponse,NULL,'N',@Id_Lieu,@Sonde_Numero_Serie,@Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Derniere_Valeur = NULL; SET @New_Derniere_Date_Heure = @Date_Heure_Last_Update_EVT_GSO; SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme IN ('B','CB')
             AND @Lieu_Etat = 'S'
             AND @Derniere_Valeur > @Tolerance_Surveillance_Sup
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Valeur] = @Derniere_Valeur, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            INSERT INTO dbo.[t_alarme]([Date_Heure_Debut],[Valeur],[Type],[Id_Lieu],[Sonde_Numero_Serie],[Date_Heure_Derniere_Mesure],[Unite])
            VALUES(@Derniere_Date_Heure,@Derniere_Valeur,'H',@Id_Lieu,@Sonde_Numero_Serie,@Derniere_Date_Heure,@Derniere_Unite);
            SET @New_Id_Alarme = CONVERT(INT, SCOPE_IDENTITY()); SET @New_Est_Lieu_En_Alarme = 1; SET @New_Est_Lieu_En_Pre_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
          END
          ELSE IF @v_TypeAlarme IN ('H','CH')
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
          ELSE IF @v_TypeAlarme IN ('B','CB','H','CH')
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
          ELSE IF @v_TypeAlarme IN ('B','CB','H','CH')
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
      @Derniere_Valeur,@Tolerance_Surveillance_Inf,@Tolerance_Surveillance_Sup,@Seuil_Critique_Bas,@Est_Seuil_Critique_Bas_Active,@Seuil_Critique_Haut,@Est_Seuil_Critique_Haut_Active,@Retard_Alarme_Bas,@Retard_Alarme_Haut,@Sonde_Numero_Serie,
      @Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite,@Date_Heure_Derniere_Reponse_Recue_OK,@Id_Alarme,@Est_Lieu_En_Alarme,@Est_Lieu_En_Pre_Alarme,
      @Est_Lieu_Alarme_Terminee_Non_Acquittee,@Est_Lieu_Alarme_Terminee_Non_Acquittee_T1,@Est_Consigne_Inf_Pre_Alarme_Active,@Consigne_Inf_Pre_Alarme,
      @Est_Consigne_Sup_Pre_Alarme_Active,@Consigne_Sup_Pre_Alarme;
  END

  CLOSE cur;
  DEALLOCATE cur;
END;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE dbo.[t_parametre]
       SET [Valeur] = N'0.92.0',
           [Commentaire] = N'Version de schéma VigiSensys'
     WHERE [Section] = 'VERSION'
       AND [Mot_Cle] = 'SCHEMA_VERSION';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.[t_parametre] ([Section], [Mot_Cle], [Valeur], [Commentaire])
        VALUES ('VERSION', 'SCHEMA_VERSION', N'0.92.0', N'Version de schéma VigiSensys');
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

SELECT N'Migration VigiSensys DB 0.92.0 terminée' AS Migration_Status;
GO

