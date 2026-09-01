/*
  VigiSensys - Verification MSSQL
  Controle la presence des vues, triggers, procedures d'events et jobs SQL Server Agent.

  Usage:
  - executer le script complet dans SSMS
  - verifier que chaque section retourne exactement les objets attendus
*/

SET NOCOUNT ON;

PRINT '=== SEED / COLONNES REQUISES DU SCHEMA COURANT ===';

SELECT
  e.database_name,
  e.table_name,
  e.column_name,
  CASE
    WHEN COL_LENGTH(QUOTENAME(e.database_name) + N'.dbo.' + QUOTENAME(e.table_name), e.column_name) IS NULL
      THEN 'MISSING'
    ELSE 'OK'
  END AS verification
FROM (VALUES
  (N'vigi_main', N'liste_clients', N'Id_Client'),
  (N'vigi_main', N't_alarme', N'Est_Mail_Fin_Envoye'),
  (N'vigi_main', N't_alarme_histo', N'Est_Alarme_Vrai'),
  (N'vigi_main', N't_autorisation', N'Code_Autorisation'),
  (N'vigi_main', N't_etalonnage', N'Id_Bain'),
  (N'vigi_main', N't_etalonnage', N'Valide'),
  (N'vigi_main', N't_lieu', N'Est_Acq_Auto_Alarme_NR'),
  (N'vigi_main', N't_lieu', N'Est_Auto_Acquittement_Non_Reponse'),
  (N'vigi_main', N't_lieu', N'Est_Son_Alarme_Active'),
  (N'vigi_main', N't_lieu', N'Lieu_Etat'),
  (N'vigi_main', N't_materiel', N'Designation'),
  (N'vigi_main', N't_materiel', N'Gamme'),
  (N'vigi_main', N't_materiel', N'Type'),
  (N'vigi_main', N't_module', N'Port_Serie_Boucle2_GSO'),
  (N'vigi_main', N't_site', N'Code_Site'),
  (N'vigi_main', N't_sonde', N'Metrologie_en_cours'),
  (N'vigi_main', N't_sonde', N'Metrologie_cmd_envoyee'),
  (N'vigi_main', N't_sonde_type', N'Valeur_Min'),
  (N'vigi_main', N't_sonde_type', N'Valeur_Max'),
  (N'vigi_main', N't_utilisateur', N'Avatar_Utilisateur'),
  (N'vigi_mesures', N'tm_graphique', N'Planning_Actif'),
  (N'vigi_mesures', N'tm_mesures', N'Est_Mesure_Repeteur_GSO'),
  (N'vigi_mesures', N'tm_mesures_gso_build', N'Est_Mesure_Repeteur_GSO')
) e(database_name, table_name, column_name)
ORDER BY e.database_name, e.table_name, e.column_name;
GO

PRINT '=== SEED / COLONNES OBSOLETES ATTENDUES ABSENTES ===';

SELECT
  e.database_name,
  e.table_name,
  e.column_name,
  CASE
    WHEN COL_LENGTH(QUOTENAME(e.database_name) + N'.dbo.' + QUOTENAME(e.table_name), e.column_name) IS NULL
      THEN 'OK'
    ELSE 'OBSOLETE_PRESENT'
  END AS verification
FROM (VALUES
  (N'vigi_main', N't_alarme', N'Est_Alarme_Vrai'),
  (N'vigi_main', N't_alarme', N'Date_Heure_Debut_Alarme_Vrai'),
  (N'vigi_main', N't_autorisation', N'A_Acces_Admin'),
  (N'vigi_main', N't_autorisation', N'A_Acces_Metrologie'),
  (N'vigi_main', N't_autorisation', N'A_Acces_Surveillance'),
  (N'vigi_main', N't_autorisation', N'A_Acces_VigiLog'),
  (N'vigi_main', N't_etalon', N'Incertitude'),
  (N'vigi_main', N't_etalon', N'Resolution'),
  (N'vigi_main', N't_etalonnage', N'Id_Milieu'),
  (N'vigi_main', N't_etalonnage', N'Nom_Etalonnage'),
  (N'vigi_main', N't_lieu', N'Surveillance_Etat'),
  (N'vigi_main', N't_sonde', N'Surveillance_Etat'),
  (N'vigi_mesures', N'tm_mesures_ajustage_etalon', N'Adresse_Sonde'),
  (N'vigi_mesures', N'tm_mesures_ajustage_etalon', N'Unite'),
  (N'vigi_mesures', N'tm_mesures_gso_build', N'Id_GSO_Build'),
  (N'vigi_mesures', N'tm_mesures_gso_build', N'GSO_SN')
) e(database_name, table_name, column_name)
ORDER BY e.database_name, e.table_name, e.column_name;
GO

PRINT '=== VERSION ET DONNEES DE REFERENCE ===';
USE [vigi_main];
GO

SELECT
  N'0.90.001' AS expected_version,
  MAX(CASE WHEN [Section] = 'VERSION' AND [Mot_Cle] = 'SCHEMA_VERSION' THEN [Valeur] END) AS installed_version,
  CASE
    WHEN MAX(CASE WHEN [Section] = 'VERSION' AND [Mot_Cle] = 'SCHEMA_VERSION' THEN [Valeur] END) = N'0.90.001' THEN 'OK'
    ELSE 'KO'
  END AS status
FROM dbo.t_parametre;

SELECT
  (SELECT COUNT(*) FROM dbo.t_actionneur_type) AS actionneur_types,
  (SELECT COUNT(*) FROM dbo.t_module_type) AS module_types,
  (SELECT COUNT(*) FROM dbo.t_etalon_type) AS etalon_types,
  (SELECT COUNT(*) FROM dbo.t_parametre WHERE [Section] <> 'LICENCE') AS seeded_parameters,
  CASE
    WHEN (SELECT COUNT(*) FROM dbo.t_actionneur_type) >= 4
     AND (SELECT COUNT(*) FROM dbo.t_module_type) >= 8
     AND (SELECT COUNT(*) FROM dbo.t_etalon_type) >= 4
     AND (SELECT COUNT(*) FROM dbo.t_parametre WHERE [Section] <> 'LICENCE') = 89
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'CFR21' AND [Mot_Cle] = 'ACTIVATION_NORME_CFR21')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'DASHBOARD' AND [Mot_Cle] = 'SURVEILLANCE_REFRESH')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'NOTIFICATIONS' AND [Mot_Cle] = 'EMAIL')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'SECURITE_EMAIL' AND [Mot_Cle] = 'SMTP_ACTIVATION')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'TELEPHONIE' AND [Mot_Cle] = 'PROVIDER')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'STATISTICS_MONTHLY_REPORT' AND [Mot_Cle] = 'ENABLED')
     AND EXISTS (SELECT 1 FROM dbo.t_parametre WHERE [Section] = 'VERSION' AND [Mot_Cle] = 'SCHEMA_VERSION')
     AND NOT EXISTS (
       SELECT 1
       FROM dbo.t_parametre
       WHERE [Section] IN ('MYSQL', 'SAUVEGARDES', 'SECURITE', 'STATISTIQUE', 'VIGISERV', 'VIGISURV', 'VIGITEL')
          OR [Section] + N'/' + [Mot_Cle] IN (
            N'GENERAL/GLOBAL_LANGUAGE',
            N'MESSAGING/ENABLED',
            N'NOTIFICATIONS/EMAIL_CC_RECIPIENTS',
            N'NOTIFICATIONS/EMAIL_SEND_ACK',
            N'NOTIFICATIONS/EMAIL_SEND_RESOLVED',
            N'NOTIFICATIONS_TEAMS/DEDUPE_WINDOW_MINUTES'
          )
     )
      THEN 'OK'
    ELSE 'KO'
  END AS status;
GO

PRINT '=== VIGI_MAIN / VIEWS ===';
USE [vigi_main];
GO

SELECT
  DB_NAME() AS database_name,
  s.name AS schema_name,
  v.name AS view_name
FROM sys.views v
JOIN sys.schemas s ON s.schema_id = v.schema_id
WHERE v.name IN (
  'v_tm_mesures_dernier'
)
ORDER BY v.name;
GO

PRINT '=== VIGI_MAIN / TRIGGERS ===';
USE [vigi_main];
GO

SELECT
  DB_NAME() AS database_name,
  s.name AS schema_name,
  t.name AS table_name,
  tr.name AS trigger_name,
  tr.is_disabled
FROM sys.triggers tr
JOIN sys.tables t ON t.object_id = tr.parent_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE tr.name IN (
  'TRG_GSO_BEF_DEL_ALARME',
  'TRG_GSO_BEF_UPD_LIEU_ALARME'
)
ORDER BY tr.name;
GO

PRINT '=== VIGI_MAIN / PROCEDURES ===';
USE [vigi_main];
GO

SELECT
  DB_NAME() AS database_name,
  SCHEMA_NAME(schema_id) AS schema_name,
  name AS procedure_name
FROM sys.procedures
WHERE name IN (
  'usp_EVT_PLANNING_CONSIGNE',
  'usp_EVT_GSO_DERNIERVALEUR_LIEU'
)
ORDER BY name;
GO

PRINT '=== VIGI_MESURES / VIEWS ===';
USE [vigi_mesures];
GO

SELECT
  DB_NAME() AS database_name,
  s.name AS schema_name,
  v.name AS view_name
FROM sys.views v
JOIN sys.schemas s ON s.schema_id = v.schema_id
WHERE v.name IN (
  'v_compteur_valeurs_gso',
  'v_config_lieu_planning_consignes',
  'v_config_lieu_sonde',
  'v_config_sonde_com'
)
ORDER BY v.name;
GO

PRINT '=== VIGI_MESURES / TRIGGERS ===';
USE [vigi_mesures];
GO

SELECT
  DB_NAME() AS database_name,
  s.name AS schema_name,
  t.name AS table_name,
  tr.name AS trigger_name,
  tr.is_disabled
FROM sys.triggers tr
JOIN sys.tables t ON t.object_id = tr.parent_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE tr.name IN (
  'TRG_AFT_INS_GSO_CMD_MEM',
  'TRG_AFT_INS_GSO_READ_MEM',
  'TRG_AFT_INS_MES_GSO',
  'TRG_AFT_INS_MES_GSO_BUILD',
  'TRG_BEF_INS_GSO_COUNT'
)
ORDER BY tr.name;
GO

PRINT '=== VIGI_MESURES / PROCEDURES ===';
USE [vigi_mesures];
GO

SELECT
  DB_NAME() AS database_name,
  SCHEMA_NAME(schema_id) AS schema_name,
  name AS procedure_name
FROM sys.procedures
WHERE name IN (
  'usp_EVT_CALCUL_MESURE_MEM_GSO',
  'usp_EVT_CLEAN_GRAPH_MES_GSO'
)
ORDER BY name;
GO

PRINT '=== SQL SERVER AGENT / JOBS ===';
USE [msdb];
GO

SELECT
  name AS job_name
FROM dbo.sysjobs
WHERE name IN (
  'VigiSensys - EVT_PLANNING_CONSIGNE',
  'VigiSensys - EVT_GSO_DERNIERVALEUR_LIEU',
  'VigiSensys - EVT_CALCUL_MESURE_MEM_GSO',
  'VigiSensys - EVT_CLEAN_GRAPH_MES_GSO'
)
ORDER BY name;
GO

PRINT '=== SQL SERVER AGENT / JOB STEPS ===';
USE [msdb];
GO

SELECT
  j.name AS job_name,
  s.step_id,
  s.step_name,
  s.database_name,
  s.command
FROM dbo.sysjobs j
JOIN dbo.sysjobsteps s ON s.job_id = j.job_id
WHERE j.name IN (
  'VigiSensys - EVT_PLANNING_CONSIGNE',
  'VigiSensys - EVT_GSO_DERNIERVALEUR_LIEU',
  'VigiSensys - EVT_CALCUL_MESURE_MEM_GSO',
  'VigiSensys - EVT_CLEAN_GRAPH_MES_GSO'
)
ORDER BY j.name, s.step_id;
GO

PRINT '=== RESUME ATTENDU ===';
WITH expected_counts AS (
  SELECT 'vigi_main.views' AS check_name, 1 AS expected_count
  UNION ALL SELECT 'vigi_main.triggers', 2
  UNION ALL SELECT 'vigi_main.procedures', 2
  UNION ALL SELECT 'vigi_mesures.views', 4
  UNION ALL SELECT 'vigi_mesures.triggers', 5
  UNION ALL SELECT 'vigi_mesures.procedures', 2
  UNION ALL SELECT 'msdb.jobs', 4
  UNION ALL SELECT 'msdb.job_steps', 4
),
actual_counts AS (
  SELECT
    'vigi_main.views' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_main].sys.views
  WHERE name IN (
    'v_tm_mesures_dernier'
  )

  UNION ALL

  SELECT
    'vigi_main.triggers' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_main].sys.triggers
  WHERE name IN (
    'TRG_GSO_BEF_DEL_ALARME',
    'TRG_GSO_BEF_UPD_LIEU_ALARME'
  )

  UNION ALL

  SELECT
    'vigi_main.procedures' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_main].sys.procedures
  WHERE name IN (
    'usp_EVT_PLANNING_CONSIGNE',
    'usp_EVT_GSO_DERNIERVALEUR_LIEU'
  )

  UNION ALL

  SELECT
    'vigi_mesures.views' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_mesures].sys.views
  WHERE name IN (
    'v_compteur_valeurs_gso',
    'v_config_lieu_planning_consignes',
    'v_config_lieu_sonde',
    'v_config_sonde_com'
  )

  UNION ALL

  SELECT
    'vigi_mesures.triggers' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_mesures].sys.triggers
  WHERE name IN (
    'TRG_AFT_INS_GSO_CMD_MEM',
    'TRG_AFT_INS_GSO_READ_MEM',
    'TRG_AFT_INS_MES_GSO',
    'TRG_AFT_INS_MES_GSO_BUILD',
    'TRG_BEF_INS_GSO_COUNT'
  )

  UNION ALL

  SELECT
    'vigi_mesures.procedures' AS check_name,
    COUNT(*) AS actual_count
  FROM [vigi_mesures].sys.procedures
  WHERE name IN (
    'usp_EVT_CALCUL_MESURE_MEM_GSO',
    'usp_EVT_CLEAN_GRAPH_MES_GSO'
  )

  UNION ALL

  SELECT
    'msdb.jobs' AS check_name,
    COUNT(*) AS actual_count
  FROM [msdb].dbo.sysjobs
  WHERE name IN (
    'VigiSensys - EVT_PLANNING_CONSIGNE',
    'VigiSensys - EVT_GSO_DERNIERVALEUR_LIEU',
    'VigiSensys - EVT_CALCUL_MESURE_MEM_GSO',
    'VigiSensys - EVT_CLEAN_GRAPH_MES_GSO'
  )

  UNION ALL

  SELECT
    'msdb.job_steps' AS check_name,
    COUNT(*) AS actual_count
  FROM [msdb].dbo.sysjobs j
  JOIN [msdb].dbo.sysjobsteps s ON s.job_id = j.job_id
  WHERE j.name IN (
    'VigiSensys - EVT_PLANNING_CONSIGNE',
    'VigiSensys - EVT_GSO_DERNIERVALEUR_LIEU',
    'VigiSensys - EVT_CALCUL_MESURE_MEM_GSO',
    'VigiSensys - EVT_CLEAN_GRAPH_MES_GSO'
  )
)
SELECT
  e.check_name,
  e.expected_count,
  ISNULL(a.actual_count, 0) AS actual_count,
  CASE
    WHEN ISNULL(a.actual_count, 0) = e.expected_count THEN 'OK'
    ELSE 'KO'
  END AS status
FROM expected_counts e
LEFT JOIN actual_counts a
  ON a.check_name = e.check_name
ORDER BY e.check_name;
GO
