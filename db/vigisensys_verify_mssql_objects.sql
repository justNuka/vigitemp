/*
  VigiSensys - Verification MSSQL
  Controle la presence des vues, triggers, procedures d'events et jobs SQL Server Agent.

  Usage:
  - executer le script complet dans SSMS
  - verifier que chaque section retourne exactement les objets attendus
*/

SET NOCOUNT ON;

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
