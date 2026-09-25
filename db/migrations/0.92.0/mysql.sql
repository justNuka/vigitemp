-- =====================================================================
-- VigiSensys - migration d'une installation existante vers DB 0.92.0
-- MySQL 8.x
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

USE `vigi_main`;

ALTER TABLE `t_alarme`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

ALTER TABLE `t_alarme_histo`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

ALTER TABLE `t_alarme_message`
  MODIFY COLUMN `Type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;

INSERT INTO `t_alarme_message`
  (`Id_Alarme_Message`, `Code_Alarme_Message`, `Type`, `Texte_Message`)
VALUES
  (20, 'CRITIQUE_BAS', 'CB', 'L''alarme a été déclenchée par un dépassement du seuil critique inférieur.'),
  (21, 'CRITIQUE_HAUT', 'CH', 'L''alarme a été déclenchée par un dépassement du seuil critique supérieur.')
ON DUPLICATE KEY UPDATE
  `Code_Alarme_Message` = VALUES(`Code_Alarme_Message`),
  `Type` = VALUES(`Type`),
  `Texte_Message` = VALUES(`Texte_Message`);

DROP TRIGGER IF EXISTS `TRG_GSO_BEF_UPD_LIEU_ALARME`;
DELIMITER ;;
/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_GSO_BEF_UPD_LIEU_ALARME` BEFORE UPDATE ON `t_lieu` FOR EACH ROW main_block: BEGIN

    DECLARE v_Id_Alarme INT DEFAULT NULL;
    DECLARE v_TypeAlarme VARCHAR(2);
    
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
      AND Type IN ('B','CB','H','CH','N')
      AND Date_Heure_Fin IS NULL
    LIMIT 1;	


    /* ==========================================================
       2b. SEUILS CRITIQUES : déclenchement immédiat
       ========================================================== */
    IF NEW.Lieu_Etat = 'S'
       AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
       AND COALESCE(NEW.Est_Seuil_Critique_Bas_Active, 0) = 1
       AND NEW.Seuil_Critique_Bas IS NOT NULL
       AND NEW.Derniere_Valeur < NEW.Seuil_Critique_Bas
    THEN
        IF v_Id_Alarme IS NOT NULL AND v_TypeAlarme IN ('B','CB') THEN
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
        END IF;

        IF v_Id_Alarme IS NOT NULL THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

            IF v_TypeAlarme = 'N' AND NEW.Est_Acq_Auto_Alarme_NR = 1 THEN
                DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;
            END IF;
        END IF;

        INSERT INTO t_alarme
            (Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure, Unite)
        VALUES
            (NEW.Derniere_Date_Heure, NEW.Derniere_Valeur, 'CB', NEW.Id_Lieu, NEW.Sonde_Numero_Serie, NEW.Derniere_Date_Heure, NEW.Derniere_Unite);

        SET NEW.Id_Alarme = LAST_INSERT_ID();
        SET NEW.Est_Lieu_En_Alarme = 1;
        SET NEW.Est_Lieu_En_Pre_Alarme = 0;
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
        LEAVE main_block;
    END IF;

    IF NEW.Lieu_Etat = 'S'
       AND TIMESTAMPDIFF(SECOND, NEW.Date_Heure_Derniere_Reponse, NOW()) <= NEW.Retard_Non_Reponse * 60
       AND COALESCE(NEW.Est_Seuil_Critique_Haut_Active, 0) = 1
       AND NEW.Seuil_Critique_Haut IS NOT NULL
       AND NEW.Derniere_Valeur > NEW.Seuil_Critique_Haut
    THEN
        IF v_Id_Alarme IS NOT NULL AND v_TypeAlarme IN ('H','CH') THEN
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
        END IF;

        IF v_Id_Alarme IS NOT NULL THEN
            UPDATE t_alarme
            SET Date_Heure_Fin = NEW.Derniere_Date_Heure,
                Valeur = NEW.Derniere_Valeur,
                Date_Heure_Derniere_Mesure = NEW.Derniere_Date_Heure
            WHERE Id_Alarme = v_Id_Alarme;

            IF v_TypeAlarme = 'N' AND NEW.Est_Acq_Auto_Alarme_NR = 1 THEN
                DELETE FROM t_alarme WHERE Id_Alarme = v_Id_Alarme;
            END IF;
        END IF;

        INSERT INTO t_alarme
            (Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Date_Heure_Derniere_Mesure, Unite)
        VALUES
            (NEW.Derniere_Date_Heure, NEW.Derniere_Valeur, 'CH', NEW.Id_Lieu, NEW.Sonde_Numero_Serie, NEW.Derniere_Date_Heure, NEW.Derniere_Unite);

        SET NEW.Id_Alarme = LAST_INSERT_ID();
        SET NEW.Est_Lieu_En_Alarme = 1;
        SET NEW.Est_Lieu_En_Pre_Alarme = 0;
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee = 0;
        SET NEW.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0;
        LEAVE main_block;
    END IF;

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
		ELSEIF v_TypeAlarme IN ('B','CB')
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
		ELSEIF v_TypeAlarme IN ('H','CH')
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
        ELSEIF v_TypeAlarme IN ('B','CB')
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
        ELSEIF v_TypeAlarme IN ('H','CH')
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
        ELSEIF v_TypeAlarme IN ('B','CB','H','CH')
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
	ELSEIF v_TypeAlarme IN ('B','CB','H','CH') THEN 
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
VALUES ('VERSION', 'SCHEMA_VERSION', '0.92.0', 'Version de schéma VigiSensys')
ON DUPLICATE KEY UPDATE
  `Valeur` = VALUES(`Valeur`),
  `Commentaire` = VALUES(`Commentaire`);

SELECT 'Migration VigiSensys DB 0.92.0 terminée' AS Migration_Status;
