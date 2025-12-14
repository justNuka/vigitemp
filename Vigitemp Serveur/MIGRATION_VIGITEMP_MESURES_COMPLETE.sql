-- ============================================================================
-- MIGRATION VIGITEMP_MESURES_IFB DATABASE SCHEMA NORMALIZATION
-- ============================================================================
-- Purpose: Rename tables (ts -> tm) and normalize column names to Snake_Case
-- Database: vigitemp_mesures_ifb
-- Date: 2025-12-12
-- ============================================================================

USE vigitemp_mesures_ifb;

SET FOREIGN_KEY_CHECKS=0;

-- Save current sql_mode and disable strict/no-zero-date checks so ALTER/UPDATE
-- on columns containing '0000-00-00 00:00:00' won't fail with error 1067/1292.
SET @OLD_SQL_MODE := @@SESSION.sql_mode;
SET SESSION sql_mode = REPLACE(REPLACE(REPLACE(@@SESSION.sql_mode,'NO_ZERO_DATE',''),'NO_ZERO_IN_DATE',''),'STRICT_TRANS_TABLES','');

-- ============================================================================
-- SECTION 1: DROP UNUSED TABLE
-- ============================================================================

DROP TABLE IF EXISTS ts_compteur_id_backup;

-- ============================================================================
-- SECTION 2: RENAME ts_compteur_idtable -> tm_compteur_id_table
-- ============================================================================

RENAME TABLE ts_compteur_idtable TO tm_compteur_id_table;

-- Rename columns in tm_compteur_id_table
ALTER TABLE tm_compteur_id_table CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_compteur_id_table CHANGE COLUMN NomTable Nom_Table VARCHAR(100);
ALTER TABLE tm_compteur_id_table CHANGE COLUMN CompteurID Compteur_Id INT;

-- ============================================================================
-- SECTION 3: RENAME ts_graphique -> tm_graphique
-- ============================================================================

RENAME TABLE ts_graphique TO tm_graphique;

-- Rename columns in tm_graphique
ALTER TABLE tm_graphique CHANGE COLUMN IdGraphique Id_Graphique INT;
-- Replace zero-dates before changing default to avoid Invalid default value (1067)
UPDATE tm_graphique SET DateHeureMesure = '1970-01-01 00:00:00' WHERE DateHeureMesure = '0000-00-00 00:00:00';
ALTER TABLE tm_graphique CHANGE COLUMN DateHeureMesure Date_Heure_Mesure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tm_graphique CHANGE COLUMN Valeur Valeur FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Resistance Resistance FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Nb_decimal Nb_Decimal INT;
ALTER TABLE tm_graphique CHANGE COLUMN Consigne Consigne FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Consigne_Sup Consigne_Sup FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Consigne_Inf Consigne_Inf FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Unite Unite VARCHAR(10);
ALTER TABLE tm_graphique CHANGE COLUMN SondeNumeroSerie Sonde_Numero_Serie VARCHAR(50);
ALTER TABLE tm_graphique CHANGE COLUMN IdSonde Id_Sonde INT;
ALTER TABLE tm_graphique CHANGE COLUMN IdLieu Id_Lieu INT;
ALTER TABLE tm_graphique CHANGE COLUMN ValeurNull Valeur_Null INT;
ALTER TABLE tm_graphique CHANGE COLUMN Frequence Frequence INT;
ALTER TABLE tm_graphique CHANGE COLUMN Etat_Alarme Etat_Alarme TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE tm_graphique CHANGE COLUMN Consigne_Inf_PreAlarme Consigne_Inf_Pre_Alarme FLOAT;
ALTER TABLE tm_graphique CHANGE COLUMN Consigne_Sup_PreAlarme Consigne_Sup_Pre_Alarme FLOAT;

-- ============================================================================
-- SECTION 4: RENAME ts_journal -> tm_journal
-- ============================================================================

RENAME TABLE ts_journal TO tm_journal;

-- Rename columns in tm_journal
ALTER TABLE tm_journal CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_journal CHANGE COLUMN IdJournal Id_Journal INT;
ALTER TABLE tm_journal CHANGE COLUMN CodeJournal Code_Journal VARCHAR(50);
ALTER TABLE tm_journal CHANGE COLUMN Commentaire Commentaire LONGTEXT;
ALTER TABLE tm_journal CHANGE COLUMN NomUtilisateur Nom_Utilisateur VARCHAR(50);
ALTER TABLE tm_journal CHANGE COLUMN ProfilUtilisateur Profil_Utilisateur VARCHAR(50);
ALTER TABLE tm_journal CHANGE COLUMN DateHeureJournal Date_Heure_Journal DATETIME(0);
ALTER TABLE tm_journal CHANGE COLUMN IdLieu Id_Lieu INT;
ALTER TABLE tm_journal CHANGE COLUMN CommentaireUtilisateur Commentaire_Utilisateur LONGTEXT;

-- ============================================================================
-- SECTION 5: RENAME ts_journal_code -> tm_journal_code
-- ============================================================================

RENAME TABLE ts_journal_code TO tm_journal_code;

-- Rename columns in tm_journal_code
ALTER TABLE tm_journal_code CHANGE COLUMN CodeJournal Code_Journal VARCHAR(50);
ALTER TABLE tm_journal_code CHANGE COLUMN Commentaire Commentaire VARCHAR(200);

-- ============================================================================
-- SECTION 6: RENAME ts_logmesures -> tm_datalogger_mesures
-- ============================================================================

RENAME TABLE ts_logmesures TO tm_datalogger_mesures;

-- Rename columns and remove "b" prefix from boolean columns
-- Replace zero-dates before any ALTER to avoid Invalid default value errors
UPDATE tm_datalogger_mesures SET DateHeureMesure = '1970-01-01 00:00:00' WHERE DateHeureMesure = '0000-00-00 00:00:00';
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN IdLogMesures Id_Datalogger_Mesures INT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN IdReception Id_Reception INT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN DateHeureMesure Date_Heure_Mesure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN Valeur Valeur FLOAT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN Est_Hors_Consignes Est_Hors_Consignes TINYINT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN Est_En_Alarme Est_En_Alarme TINYINT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN Marqueur Marqueur TINYINT;
ALTER TABLE tm_datalogger_mesures CHANGE COLUMN Details Details VARCHAR(200);

-- ============================================================================
-- SECTION 7: RENAME ts_mesure -> tm_mesures
-- ============================================================================

RENAME TABLE ts_mesure TO tm_mesures;

-- Replace zero-dates before altering to avoid Invalid default/datetime errors
UPDATE tm_mesures SET DateHeureMesure = '1970-01-01 00:00:00' WHERE DateHeureMesure = '0000-00-00 00:00:00';

-- Consolidated ALTER for tm_mesures with INPLACE hint to minimize full table copy
ALTER TABLE tm_mesures ALGORITHM=INPLACE, LOCK=NONE
	CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT,
	CHANGE COLUMN IdMesure Id_Mesure INT,
	CHANGE COLUMN DateHeureMesure Date_Heure_Mesure DATETIME(0),
	CHANGE COLUMN Valeur Valeur FLOAT,
	CHANGE COLUMN Resistance Valeur_Brute FLOAT,
	CHANGE COLUMN Nb_decimal Nb_Decimal INT,
	CHANGE COLUMN Consigne Consigne FLOAT,
	CHANGE COLUMN Consigne_Sup Consigne_Sup FLOAT,
	CHANGE COLUMN Consigne_Inf Consigne_Inf FLOAT,
	CHANGE COLUMN Unite Unite VARCHAR(10),
	CHANGE COLUMN SondeNumeroSerie Sonde_Numero_Serie VARCHAR(50),
	CHANGE COLUMN IdLieu Id_Lieu INT,
	CHANGE COLUMN ValeurNull Valeur_Null INT,
	CHANGE COLUMN Frequence Frequence INT,
	CHANGE COLUMN Etat_Alarme Etat_Alarme TINYINT(1),
	CHANGE COLUMN Consigne_Inf_PreAlarme Consigne_Inf_Pre_Alarme FLOAT,
	CHANGE COLUMN Consigne_Sup_PreAlarme Consigne_Sup_Pre_Alarme FLOAT,
	CHANGE COLUMN Moyenne Moyenne FLOAT;

-- ============================================================================
-- SECTION 8: RENAME ts_mesurecalibrage -> tm_mesure_calibrage
-- ============================================================================

RENAME TABLE ts_mesurecalibrage TO tm_mesure_calibrage;

-- Rename columns in tm_mesure_calibrage
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN IdMesureCalibrage Id_Mesure_Calibrage INT;
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN SondeNumeroSerie Sonde_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_calibrage SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_calibrage CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 9: RENAME ts_mesurecalibrageetalon -> tm_mesure_calibrage_etalon
-- ============================================================================

RENAME TABLE ts_mesurecalibrageetalon TO tm_mesure_calibrage_etalon;

-- Rename columns in tm_mesure_calibrage_etalon
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN IdMesureCalibrageEtalon Id_Mesure_Calibrage_Etalon INT;
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN EtalonNumeroSerie Etalon_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_calibrage_etalon SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_calibrage_etalon CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 10: RENAME ts_mesureetalon -> tm_mesure_etalon
-- ============================================================================

RENAME TABLE ts_mesureetalon TO tm_mesure_etalon;

-- Rename columns in tm_mesure_etalon
ALTER TABLE tm_mesure_etalon CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_etalon CHANGE COLUMN IdMesureEtalon Id_Mesure_Etalon INT;
ALTER TABLE tm_mesure_etalon CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_etalon CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_etalon CHANGE COLUMN EtalonNumeroSerie Etalon_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_etalon CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_etalon SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_etalon CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 11: RENAME ts_mesureetalonnage -> tm_mesure_etalonnage
-- ============================================================================

RENAME TABLE ts_mesureetalonnage TO tm_mesure_etalonnage;

-- Rename columns in tm_mesure_etalonnage
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN IdMesureEtalonnage Id_Mesure_Etalonnage INT;
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN SondeNumeroSerie Sonde_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_etalonnage SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_etalonnage CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 12: RENAME ts_mesuretest -> tm_mesure_test
-- ============================================================================

RENAME TABLE ts_mesuretest TO tm_mesure_test;

-- Rename columns in tm_mesure_test
ALTER TABLE tm_mesure_test CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_test CHANGE COLUMN IdMesureTest Id_Mesure_Test INT;
ALTER TABLE tm_mesure_test CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_test CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_test CHANGE COLUMN SondeNumeroSerie Sonde_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_test CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_test SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_test CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 13: RENAME ts_mesuretestetalon -> tm_mesure_test_etalon
-- ============================================================================

RENAME TABLE ts_mesuretestetalon TO tm_mesure_test_etalon;

-- Rename columns in tm_mesure_test_etalon
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN IdMesureTestEtalon Id_Mesure_Test_Etalon INT;
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN Valeur Valeur VARCHAR(50);
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN Resistance Resistance VARCHAR(50);
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN EtalonNumeroSerie Etalon_Numero_Serie VARCHAR(50);
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN ValeurNull Valeur_Null INT;
-- Replace zero-dates before changing default
UPDATE tm_mesure_test_etalon SET DateHeure = '1970-01-01 00:00:00' WHERE DateHeure = '0000-00-00 00:00:00';
ALTER TABLE tm_mesure_test_etalon CHANGE COLUMN DateHeure Date_Heure DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- SECTION 14: DROP UNUSED TABLE
-- ============================================================================

DROP TABLE IF EXISTS ts_modedegrade;

-- ============================================================================
-- SECTION 15: RENAME ts_parametre -> tm_parametre
-- ============================================================================

RENAME TABLE ts_parametre TO tm_parametre;

-- Rename columns in tm_parametre
ALTER TABLE tm_parametre CHANGE COLUMN IdServeurBDD Id_Serveur_BDD INT;
ALTER TABLE tm_parametre CHANGE COLUMN CodeParametre Code_Parametre VARCHAR(50);
ALTER TABLE tm_parametre CHANGE COLUMN Valeur Valeur LONGTEXT;
ALTER TABLE tm_parametre CHANGE COLUMN Commentaire Commentaire VARCHAR(200);

-- Restore previous sql_mode
SET SESSION sql_mode = @OLD_SQL_MODE;

SET FOREIGN_KEY_CHECKS=1;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'MIGRATION COMPLETE! All tables renamed (ts -> tm) and columns normalized.' AS status;

SHOW TABLES;
