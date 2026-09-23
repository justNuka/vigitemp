-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.91.1
-- MySQL 8.x
-- Baseline attendue : 0.91.0
-- =====================================================================
--
-- Changements :
--   1. aligne les champs numériques de t_lieu_template sur FLOAT ;
--   2. réinstalle TRG_GSO_BEF_UPD_LIEU_ALARME sans le traitement
--      immédiat des seuils critiques, comme le seed MySQL courant ;
--   3. positionne VERSION/SCHEMA_VERSION à 0.91.1 à la fin.
--

USE `vigi_main`;

ALTER TABLE `t_lieu_template`
  MODIFY COLUMN `Consigne` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Consigne_Sup` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Consigne_Inf` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Tolerance_Surveillance_Sup` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Tolerance_Surveillance_Inf` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Consigne_Sup_Pre_Alarme` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Consigne_Inf_Pre_Alarme` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Seuil_Critique_Haut` FLOAT DEFAULT NULL,
  MODIFY COLUMN `Seuil_Critique_Bas` FLOAT DEFAULT NULL;

DROP TRIGGER IF EXISTS `TRG_GSO_BEF_UPD_LIEU_ALARME`;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_GSO_BEF_UPD_LIEU_ALARME` BEFORE UPDATE ON `t_lieu` FOR EACH ROW main_block: BEGIN

    DECLARE v_Id_Alarme INT DEFAULT NULL;
    DECLARE v_TypeAlarme CHAR(1);
    
    /* =========================================================================================
       0. SKIP DE LA LOGIQUE SI ACQUITTEMENT D'ALARME
       ========================================================================================= */
    IF COALESCE(@SKIP_LIEU_ALARM_LOGIC, 0) = 1 THEN
	  LEAVE main_block;
	END IF;
    
    /* =========================================================================================
       0b. SKIP DE LA LOGIQUE NON GSO POUR EVITER DE PASSER LES VERIFS
       ========================================================================================= */
	IF COALESCE(NEW.Est_Lieu_GSO, 0) <> 1 THEN
	  LEAVE main_block;
	END IF;


    /* ==========================================================================================
       1. BLOCAGE APRES ACQUITTEMENT ALARME EN COURS : ne pas redeclencher l'alarme immediatement
       ========================================================================================== */
    IF NEW.Est_Lieu_GSO=1 AND NEW.Date_Heure_Dernier_Acquittement_En_Cours IS NOT NULL
       AND NEW.Derniere_Date_Heure <= NEW.Date_Heure_Dernier_Acquittement_En_Cours
	   AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
    THEN
        SET NEW.Id_Alarme = 0;
        SET NEW.Est_Lieu_En_Alarme = 0;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
        LEAVE main_block;
    END IF;

    /* ==========================================================
       2. RECHERCHE ALARME B/H/N OUVERTE-EN COURS
       ========================================================== */
    SELECT Id_Alarme, Type
    INTO v_Id_Alarme, v_TypeAlarme
    FROM t_alarme
    WHERE Id_Lieu = NEW.Id_Lieu AND NEW.Est_Lieu_GSO = 1
      AND Type IN ('B','H','N')
      AND Date_Heure_Fin IS NULL
    LIMIT 1;	


    /* ==========================================================
       3. CAS : AUCUNE ALARME OUVERTE → CREATION
       ========================================================== */
    IF v_Id_Alarme IS NULL THEN
	
	

        /* --- ALARME BASSE --- */
        IF NEW.Est_Lieu_GSO=1
		AND NEW.Lieu_Etat = 'S'
		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
		AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf
		AND TIMESTAMPDIFF(SECOND,NEW.Date_Heure_Derniere_Reponse_Recue_OK,NEW.Derniere_Date_Heure) >= NEW.Retard_Alarme_Bas * 60
        THEN
            INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Date_Heure_Derniere_Reponse_Recue_OK,
                 NEW.Derniere_Valeur,
                 'B',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
        END IF;

        /* --- ALARME HAUTE --- */
        IF NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse_Recue_OK, NEW.Derniere_Date_Heure) >= NEW.Retard_Alarme_Haut * 60
        THEN
            INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Date_Heure_Derniere_Reponse_Recue_OK,
                 NEW.Derniere_Valeur,
                 'H',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
        END IF;
		
		/* --- ALARME NON REPONSE --- */
		IF NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60
		THEN
            INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Date_Heure_Derniere_Reponse,
                 NULL,
                 'N',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Date_Heure_Last_Update_EVT_GSO,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
			SET NEW.Derniere_Valeur = NULL;
			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
        END IF;
		
		

    /* ==========================================================
       4. CAS : ALARME OUVERTE → SUIVI / TRANSITION / FIN
       ========================================================== */
    ELSE
		
		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=0 > BAS --- */
		IF  v_TypeAlarme = 'N'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
			AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf
			AND NEW.Est_Acq_Auto_Alarme_NR = 0
		THEN
			UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;
			
			INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'B',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
            
      /* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=1 > BAS --- */
		ELSEIF  v_TypeAlarme = 'N'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
			AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf
			AND NEW.Est_Acq_Auto_Alarme_NR = 1
		THEN
			UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;
         DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;
			
			INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'B',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
			
		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=0 > HAUT --- */
		ELSEIF  v_TypeAlarme = 'N'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup
			AND NEW.Est_Acq_Auto_Alarme_NR = 0
		THEN
			UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;
			
			INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'H',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;	
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
            
		/* --- TRANSITION N, Est_Acq_Auto_Alarme_NR=1 > HAUT --- */
		ELSEIF  v_TypeAlarme = 'N'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
			AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup
			AND NEW.Est_Acq_Auto_Alarme_NR = 1
		THEN
			UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;
            DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;
			
			INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'H',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;	
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;            
		
		/* --- TRANSITION BAS → N --- */
		ELSEIF v_TypeAlarme = 'B'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60
		THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

		INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Date_Heure_Derniere_Reponse,
                 NULL,
                 'N',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Date_Heure_Last_Update_EVT_GSO,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
			SET NEW.Derniere_Valeur = NULL;
			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;

		/* --- TRANSITION HAUT → N --- */
		ELSEIF v_TypeAlarme = 'H'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) >= NEW.Retard_Non_Reponse * 60
			AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Surveillance_On, NOW()) >= NEW.Retard_Non_Reponse * 60
		THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

		INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Date_Heure_Derniere_Reponse,
                 NULL,
                 'N',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Date_Heure_Last_Update_EVT_GSO,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
			SET NEW.Derniere_Valeur = NULL;
			SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
			
		
        /* --- TRANSITION BAS → HAUT --- */
        ELSEIF v_TypeAlarme = 'B'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
           AND NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup
        THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

            INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'H',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;

        /* --- TRANSITION HAUT → BAS --- */
        ELSEIF v_TypeAlarme = 'H'
			AND NEW.Est_Lieu_GSO=1
			AND NEW.Lieu_Etat = 'S'
           AND NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf
        THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

            INSERT INTO t_alarme
                (Date_Heure_Debut, Valeur, Type,
                 Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure,Unite)
            VALUES
                (NEW.Derniere_Date_Heure,
                 NEW.Derniere_Valeur,
                 'B',
                 NEW.Id_Lieu,
                 NEW.Sonde_Numero_Serie,
                 NEW.Derniere_Date_Heure,
					  NEW.Derniere_Unite);

            SET NEW.Id_Alarme = LAST_INSERT_ID();
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
			
			/* --- ALARME TOUJOURS ACTIVE N --- */
		ELSEIF v_TypeAlarme = 'N'
		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) > NEW.Retard_Non_Reponse * 60
		THEN
		UPDATE t_alarme
		SET Valeur = NULL,
			Date_Heure_Derniere_Mesure = NEW.Date_Heure_Last_Update_EVT_GSO
		WHERE Id_Alarme = v_Id_Alarme;
		
		SET NEW.Id_Alarme = v_Id_Alarme;
		SET NEW.Derniere_Valeur=NULL;
		SET NEW.Derniere_Date_Heure = NEW.Date_Heure_Last_Update_EVT_GSO;
		SET NEW.Est_Lieu_En_Alarme = 1;
		SET NEW.Est_Lieu_En_Pre_Alarme = 0;
      SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
      SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
		LEAVE main_block;

        /* --- ALARME TOUJOURS ACTIVE B ou H --- */
        ELSEIF v_TypeAlarme IN ('B','H')
				AND (NEW.Derniere_Valeur < NEW.Tolerance_Surveillance_Inf
					OR NEW.Derniere_Valeur > NEW.Tolerance_Surveillance_Sup)
        THEN
            UPDATE t_alarme
            SET Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

            SET NEW.Id_Alarme = v_Id_Alarme;
            SET NEW.Est_Lieu_En_Alarme = 1;
            SET NEW.Est_Lieu_En_Pre_Alarme = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
            SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
            LEAVE main_block;
			
        /* --- FIN D’ALARME N, Est_Acq_Auto_Alarme_NR=0  --- */
		ELSEIF v_TypeAlarme = 'N'
		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) < NEW.Retard_Non_Reponse * 60
		AND NEW.Est_Acq_Auto_Alarme_NR=0
		THEN
		UPDATE t_alarme
		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
			Valeur = NEW.Derniere_Valeur,
        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
		WHERE Id_Alarme = v_Id_Alarme;

		SET NEW.Id_Alarme = 0;
		SET NEW.Est_Lieu_En_Alarme = 0;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
		LEAVE main_block;
		
		/* --- FIN D’ALARME N, Est_Acq_Auto_Alarme_NR=1  --- */
		ELSEIF v_TypeAlarme = 'N'
		AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) < NEW.Retard_Non_Reponse * 60
		AND NEW.Est_Acq_Auto_Alarme_NR=1
		THEN
		UPDATE t_alarme
		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
			Valeur = NEW.Derniere_Valeur,
        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
		WHERE Id_Alarme = v_Id_Alarme;
		DELETE FROM t_alarme
		WHERE Id_Alarme = v_Id_Alarme;

		SET NEW.Id_Alarme = 0;
		SET NEW.Est_Lieu_En_Alarme = 0;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
		LEAVE main_block;

/* --- FIN D’ALARME B/H --- */
	ELSEIF v_TypeAlarme IN('B','H') THEN 
		UPDATE t_alarme
		SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
        Valeur = NEW.Derniere_Valeur,
        Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
		WHERE Id_Alarme = v_Id_Alarme;

		SET NEW.Id_Alarme = 0;
		SET NEW.Est_Lieu_En_Alarme = 0;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 1;
		SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
		LEAVE main_block;
		
		
        END IF;

    END IF;
    
    IF NEW.Est_Lieu_En_Alarme = 0 THEN
    
    /* =======================================================
		5- CAS DES PRE-ALARMES (BASSE / HAUTE)
	========================================================== */

/* --- PRE-ALARME BASSE --- */
IF NEW.Est_Consigne_Inf_Pre_Alarme_Active = 1 THEN

    /* Entrée en pré-alarme basse d'un lieu en alarme terminee non acquittee */
    IF NEW.Derniere_Valeur < NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1 THEN
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=0; SET NEW.Est_Lieu_En_Pre_Alarme = 1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;
        
       /* Entrée en pré-alarme basse d'un lieu sans etat d'alarme */
    ELSEIF NEW.Derniere_Valeur < NEW.Consigne_Inf_Pre_Alarme THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 1;     

    /* Sortie de pré-alarme basse (retour zone normale) puis retour a TermineeNonAcquitee */
    ELSEIF NEW.Derniere_Valeur >= NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1 THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 0; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
        
     /* Sortie de pré-alarme basse (retour zone normale) sans retour a TermineeNonAcquitee */
    ELSEIF NEW.Derniere_Valeur >= NEW.Consigne_Inf_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0 THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 0;    
    END IF;

END IF;


/* --- PRE-ALARME HAUTE --- */
IF NEW.Est_Consigne_Sup_Pre_Alarme_Active = 1 THEN

    /* Entrée en pré-alarme haute d'un lieu en alarme terminee non acquittee */
    IF NEW.Derniere_Valeur > NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1 THEN
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=0; SET NEW.Est_Lieu_En_Pre_Alarme = 1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1;
        
       /* Entrée en pré-alarme haute d'un lieu sans etat d'alarme */
    ELSEIF NEW.Derniere_Valeur > NEW.Consigne_Sup_Pre_Alarme THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 1;     

    /* Sortie de pré-alarme haute (retour zone normale) puis retour a TermineeNonAcquitee */
    ELSEIF NEW.Derniere_Valeur <= NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 1 THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 0; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee=1; SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
        
     /* Sortie de pré-alarme haute (retour zone normale) sans retour a TermineeNonAcquitee */
    ELSEIF NEW.Derniere_Valeur <= NEW.Consigne_Sup_Pre_Alarme AND NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0 THEN
        SET NEW.Est_Lieu_En_Pre_Alarme = 0;    
    END IF;

END IF;

END IF;

END*/;;
DELIMITER ;

INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)
VALUES ('VERSION', 'SCHEMA_VERSION', '0.91.1', 'Version de schéma VigiSensys')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

SELECT 'Migration VigiSensys DB 0.91.1 terminée' AS Migration_Status;
