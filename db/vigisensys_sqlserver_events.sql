/*
  VigiSensys - Conversion des MySQL EVENTS vers SQL Server
  Version produit : 0.90.001
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =====================================================================
   vigi_main - EVT_PLANNING_CONSIGNE
   MySQL: EVERY 1 MINUTE
   ===================================================================== */
USE [vigi_main];
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

/* =====================================================================
   vigi_main - EVT_GSO_DERNIERVALEUR_LIEU
   MySQL: EVERY 2 MINUTE
   ===================================================================== */
USE [vigi_main];
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

/* =====================================================================
   vigi_mesures - EVT_CALCUL_MESURE_MEM_GSO
   MySQL: EVERY 45 MINUTE
   ===================================================================== */
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


/* =====================================================================
   vigi_mesures - EVT_CLEAN_GRAPH_MES_GSO
   MySQL: EVERY 1 HOUR
   ===================================================================== */
USE [vigi_mesures];
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


/* =====================================================================
   Création optionnelle des SQL Server Agent Jobs

   Prérequis :
   - SQL Server Agent disponible et démarré.
   - Droits suffisants sur msdb.
   - Non disponible sur SQL Server Express.
   ===================================================================== */
USE [msdb];
GO

DECLARE @job_name SYSNAME;
DECLARE @schedule_name SYSNAME;

/* 1 minute - Planning consignes */
SET @job_name = N'VigiSensys - EVT_PLANNING_CONSIGNE';
SET @schedule_name = N'VigiSensys - schedule - EVT_PLANNING_CONSIGNE - 1min';

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE [name] = @job_name)
  EXEC msdb.dbo.sp_delete_job @job_name = @job_name, @delete_unused_schedule = 1;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysschedules WHERE [name] = @schedule_name)
  EXEC msdb.dbo.sp_delete_schedule @schedule_name = @schedule_name, @force_delete = 1;

EXEC msdb.dbo.sp_add_job @job_name = @job_name, @enabled = 1, @description = N'Equivalent SQL Server de l''event MySQL EVT_PLANNING_CONSIGNE.';
EXEC msdb.dbo.sp_add_jobstep @job_name = @job_name, @step_name = N'EXEC usp_EVT_PLANNING_CONSIGNE', @subsystem = N'TSQL', @database_name = N'vigi_main', @command = N'EXEC dbo.[usp_EVT_PLANNING_CONSIGNE];';
EXEC msdb.dbo.sp_add_schedule @schedule_name = @schedule_name, @enabled = 1, @freq_type = 4, @freq_interval = 1, @freq_subday_type = 4, @freq_subday_interval = 1, @active_start_time = 0;
EXEC msdb.dbo.sp_attach_schedule @job_name = @job_name, @schedule_name = @schedule_name;
EXEC msdb.dbo.sp_add_jobserver @job_name = @job_name;
GO

/* 2 minutes - Refresh lieux GSO */
DECLARE @job_name SYSNAME = N'VigiSensys - EVT_GSO_DERNIERVALEUR_LIEU';
DECLARE @schedule_name SYSNAME = N'VigiSensys - schedule - EVT_GSO_DERNIERVALEUR_LIEU - 2min';

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE [name] = @job_name)
  EXEC msdb.dbo.sp_delete_job @job_name = @job_name, @delete_unused_schedule = 1;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysschedules WHERE [name] = @schedule_name)
  EXEC msdb.dbo.sp_delete_schedule @schedule_name = @schedule_name, @force_delete = 1;

EXEC msdb.dbo.sp_add_job @job_name = @job_name, @enabled = 1, @description = N'Equivalent SQL Server de l''event MySQL EVT_GSO_DERNIERVALEUR_LIEU.';
EXEC msdb.dbo.sp_add_jobstep @job_name = @job_name, @step_name = N'EXEC usp_EVT_GSO_DERNIERVALEUR_LIEU', @subsystem = N'TSQL', @database_name = N'vigi_main', @command = N'EXEC dbo.[usp_EVT_GSO_DERNIERVALEUR_LIEU];';
EXEC msdb.dbo.sp_add_schedule @schedule_name = @schedule_name, @enabled = 1, @freq_type = 4, @freq_interval = 1, @freq_subday_type = 4, @freq_subday_interval = 2, @active_start_time = 0;
EXEC msdb.dbo.sp_attach_schedule @job_name = @job_name, @schedule_name = @schedule_name;
EXEC msdb.dbo.sp_add_jobserver @job_name = @job_name;
GO

/* 45 minutes - Build commandes memoire GSO */
DECLARE @job_name SYSNAME = N'VigiSensys - EVT_CALCUL_MESURE_MEM_GSO';
DECLARE @schedule_name SYSNAME = N'VigiSensys - schedule - EVT_CALCUL_MESURE_MEM_GSO - 45min';

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE [name] = @job_name)
  EXEC msdb.dbo.sp_delete_job @job_name = @job_name, @delete_unused_schedule = 1;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysschedules WHERE [name] = @schedule_name)
  EXEC msdb.dbo.sp_delete_schedule @schedule_name = @schedule_name, @force_delete = 1;

EXEC msdb.dbo.sp_add_job @job_name = @job_name, @enabled = 1, @description = N'Equivalent SQL Server de l''event MySQL EVT_CALCUL_MESURE_MEM_GSO.';
EXEC msdb.dbo.sp_add_jobstep @job_name = @job_name, @step_name = N'EXEC usp_EVT_CALCUL_MESURE_MEM_GSO', @subsystem = N'TSQL', @database_name = N'vigi_mesures', @command = N'EXEC dbo.[usp_EVT_CALCUL_MESURE_MEM_GSO];';
EXEC msdb.dbo.sp_add_schedule @schedule_name = @schedule_name, @enabled = 1, @freq_type = 4, @freq_interval = 1, @freq_subday_type = 4, @freq_subday_interval = 45, @active_start_time = 0;
EXEC msdb.dbo.sp_attach_schedule @job_name = @job_name, @schedule_name = @schedule_name;
EXEC msdb.dbo.sp_add_jobserver @job_name = @job_name;
GO

/* 1 heure - Clean graph / archives */
DECLARE @job_name SYSNAME = N'VigiSensys - EVT_CLEAN_GRAPH_MES_GSO';
DECLARE @schedule_name SYSNAME = N'VigiSensys - schedule - EVT_CLEAN_GRAPH_MES_GSO - 1h';

IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE [name] = @job_name)
  EXEC msdb.dbo.sp_delete_job @job_name = @job_name, @delete_unused_schedule = 1;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysschedules WHERE [name] = @schedule_name)
  EXEC msdb.dbo.sp_delete_schedule @schedule_name = @schedule_name, @force_delete = 1;

EXEC msdb.dbo.sp_add_job @job_name = @job_name, @enabled = 1, @description = N'Equivalent SQL Server de l''event MySQL EVT_CLEAN_GRAPH_MES_GSO.';
EXEC msdb.dbo.sp_add_jobstep @job_name = @job_name, @step_name = N'EXEC usp_EVT_CLEAN_GRAPH_MES_GSO', @subsystem = N'TSQL', @database_name = N'vigi_mesures', @command = N'EXEC dbo.[usp_EVT_CLEAN_GRAPH_MES_GSO];';
EXEC msdb.dbo.sp_add_schedule @schedule_name = @schedule_name, @enabled = 1, @freq_type = 4, @freq_interval = 1, @freq_subday_type = 8, @freq_subday_interval = 1, @active_start_time = 0;
EXEC msdb.dbo.sp_attach_schedule @job_name = @job_name, @schedule_name = @schedule_name;
EXEC msdb.dbo.sp_add_jobserver @job_name = @job_name;
GO
