-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.1
-- SQL Server
-- Baseline attendue : 0.91.0
-- =====================================================================
--
-- Changements :
--   1. aligne les champs numériques de dbo.t_lieu_template sur FLOAT ;
--   2. réinstalle TRG_GSO_BEF_UPD_LIEU_ALARME sans le traitement
--      immédiat des seuils critiques, comme les seeds courants ;
--   3. positionne VERSION/SCHEMA_VERSION à 0.91.1 à la fin.
--

USE [vigi_main];
GO

ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Consigne] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Consigne_Sup] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Consigne_Inf] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Tolerance_Surveillance_Sup] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Tolerance_Surveillance_Inf] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Consigne_Sup_Pre_Alarme] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Consigne_Inf_Pre_Alarme] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Seuil_Critique_Haut] FLOAT NULL;
ALTER TABLE dbo.[t_lieu_template] ALTER COLUMN [Seuil_Critique_Bas] FLOAT NULL;
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

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE dbo.t_parametre
       SET Valeur = N'0.91.1',
           Commentaire = N'Version de schéma VigiSensys'
     WHERE Section = 'VERSION'
       AND Mot_Cle = 'SCHEMA_VERSION';

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.t_parametre (Section, Mot_Cle, Valeur, Commentaire)
        VALUES ('VERSION', 'SCHEMA_VERSION', N'0.91.1', N'Version de schéma VigiSensys');
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

SELECT N'Migration VigiSensys DB 0.91.1 terminée' AS Migration_Status;
GO
