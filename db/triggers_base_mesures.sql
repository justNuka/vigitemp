DELIMITER //
CREATE FUNCTION `GetIdServer`() RETURNS tinyint
    READS SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE IdServer INTEGER;
  
  SELECT  ValeurParametre INTO IdServer FROM   `ts_parametre` WHERE CleParametre = 'SERVER_ID';

  RETURN IdServer;
END//
DELIMITER ;

USE vigitemp_mesures_ifb;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_JOURNAL
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_JOURNAL` BEFORE INSERT ON `tm_journal` FOR EACH ROW BEGIN
  DECLARE Id_Base INTEGER(11) ;
  DECLARE Id_Temp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.Id_Serveur_BDD IS NULL OR NEW.Id_Serveur_BDD = 0 THEN

    SET NEW.Id_Serveur_BDD = Id_Base;
    
  END IF ;
  

  IF NEW.IdJournal IS NULL OR NEW.IdJournal = 0 THEN

	  SET NEW.IdJournal  = `GetCounterValue`('ts_journal');
  ELSE
      SET IdTemp = NULL;
       
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_journal' ;
      
      IF IdTemp IS NULL OR NEW.IdJournal > IdTemp THEN
                 
         SET IdTemp = NEW.IdJournal ;
         
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_journal'; 

      END IF;
           
  END IF ;
  
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESURE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESURE` BEFORE INSERT ON `ts_mesure` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  DECLARE OLDvaleur DOUBLE(22,2);
  
  SELECT `vigitemp_mesure`.`ts_mesure`.moyenne INTO OLDvaleur FROM `vigitemp_mesure`.`ts_mesure` WHERE idlieu=NEW.IDLIEU and valeurnull=0 ORDER BY idmesure DESC LIMIT 1;
    
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesure IS NULL OR NEW.IdMesure = 0 THEN

	  SET NEW.IdMesure  = `GetCounterValue`('ts_mesure');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesure' ;
      
      IF IdTemp IS NULL OR NEW.IdMesure > IdTemp THEN
         
         SET IdTemp = NEW.IdMesure ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesure'; 

      END IF;   
  END IF ;

	IF NEW.ValeurNull = 0 THEN
	
		IF OLDvaleur= null THEN
		
		SET NEW.Moyenne = NEW.Valeur;
		
		ELSE
		
			IF NEW.Frequence= 900 THEN
	
				SET NEW.Moyenne = (NEW.Valeur+OLDvaleur+OLDvaleur+OLDvaleur)/4;
	
			ELSE
	
				IF NEW.Frequence= 300 THEN
		
					SET NEW.Moyenne = (NEW.Valeur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur)/12;
				
				ELSE
				
					IF NEW.Frequence= 60 THEN
				
						SET NEW.Moyenne = (NEW.Valeur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur+OLDvaleur)/60;
				
					ELSE
				
						SET NEW.Moyenne = (NEW.Valeur+OLDvaleur)/2;
					
					END IF;
				END IF;
			END IF;
		END IF;
   END if;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESURECALIBRAGE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESURECALIBRAGE` BEFORE INSERT ON `ts_mesurecalibrage` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureCalibrage IS NULL OR NEW.IdMesureCalibrage = 0 THEN

	  SET NEW.IdMesureCalibrage  = `GetCounterValue`('ts_mesurecalibrage');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesurecalibrage' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureCalibrage > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureCalibrage ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesurecalibrage'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESURECALIBRAGEETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESURECALIBRAGEETALON` BEFORE INSERT ON `ts_mesurecalibrageetalon` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureCalibrageEtalon IS NULL OR NEW.IdMesureCalibrageEtalon = 0 THEN

	  SET NEW.IdMesureCalibrageEtalon  = `GetCounterValue`('ts_mesurecalibrageetalon');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesurecalibrageetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureCalibrageEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureCalibrageEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesurecalibrageetalon'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESUREETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESUREETALON` BEFORE INSERT ON `ts_mesureetalon` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureEtalon IS NULL OR NEW.IdMesureEtalon = 0 THEN

	  SET NEW.IdMesureEtalon  = `GetCounterValue`('ts_mesureetalon');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesureetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesureetalon'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESUREETALONNAGE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESUREETALONNAGE` BEFORE INSERT ON `ts_mesureetalonnage` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureEtalonnage IS NULL OR NEW.IdMesureEtalonnage = 0 THEN

	  SET NEW.IdMesureEtalonnage  = `GetCounterValue`('ts_mesureetalonnage');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesureetalonnage' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureEtalonnage > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureEtalonnage ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesureetalonnage'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESURETEST
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESURETEST` BEFORE INSERT ON `ts_mesuretest` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureTest IS NULL OR NEW.IdMesureTest = 0 THEN

	  SET NEW.IdMesureTest  = `GetCounterValue`('ts_mesuretest');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesuretest' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureTest > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureTest ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesuretest'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_INS_MESURETESTETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_INS_MESURETESTETALON` BEFORE INSERT ON `ts_mesuretestetalon` FOR EACH ROW BEGIN
  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
    
  IF NEW.IdServeurBDD IS NULL OR NEW.IdServeurBDD = 0 THEN

    SET NEW.IdServeurBDD = IdBase;
    
  END IF ;
  

  IF NEW.IdMesureTestEtalon IS NULL OR NEW.IdMesureTestEtalon = 0 THEN

	  SET NEW.IdMesureTestEtalon  = `GetCounterValue`('ts_mesuretestetalon');
  ELSE
      SET IdTemp = NULL;
  
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesuretestetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureTestEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureTestEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesuretestetalon'; 

      END IF;   
  END IF ;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_JOURNAL
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_JOURNAL` BEFORE UPDATE ON `ts_journal` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
 
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
    
 IF NEW.IdJournal <> OLD.IdJournal THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_journal' ;
      
      IF IdTemp IS NULL OR NEW.IdJournal > IdTemp THEN
         
         SET IdTemp = NEW.IdJournal ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_journal'; 

      END IF;
      
      
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESURE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESURE` BEFORE UPDATE ON `ts_mesure` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesure <> OLD.IdMesure THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesure' ;
      
      IF IdTemp IS NULL OR NEW.IdMesure > IdTemp THEN
         
         SET IdTemp = NEW.IdMesure ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesure'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESURECALIBRAGE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESURECALIBRAGE` BEFORE UPDATE ON `ts_mesurecalibrage` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureCalibrage <> OLD.IdMesureCalibrage THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesurecalibrage' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureCalibrage > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureCalibrage ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesurecalibrage'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESURECALIBRAGEETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESURECALIBRAGEETALON` BEFORE UPDATE ON `ts_mesurecalibrageetalon` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureCalibrageEtalon <> OLD.IdMesureCalibrageEtalon THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesurecalibrageetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureCalibrageEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureCalibrageEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesurecalibrageetalon'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESUREETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESUREETALON` BEFORE UPDATE ON `ts_mesureetalon` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureEtalon <> OLD.IdMesureEtalon THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesureetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesureetalon'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESUREETALONNAGE
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESUREETALONNAGE` BEFORE UPDATE ON `ts_mesureetalonnage` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureEtalonnage <> OLD.IdMesureEtalonnage THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesureetalonnage' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureEtalonnage > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureEtalonnage ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesureetalonnage'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESURETEST
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESURETEST` BEFORE UPDATE ON `ts_mesuretest` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureTest <> OLD.IdMesureTest THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesuretest' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureTest > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureTest ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesuretest'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Listage de la structure de déclencheur vigitemp_mesure_test. TRG_BEF_UPD_MESURETESTETALON
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `TRG_BEF_UPD_MESURETESTETALON` BEFORE UPDATE ON `ts_mesuretestetalon` FOR EACH ROW BEGIN

  DECLARE IdBase INTEGER(11) ;
  DECLARE IdTemp INTEGER(11) ;
  
  SELECT GetIdServer()  INTO IdBase;
   
 IF NEW.IdServeurBDD <> OLD.IdServeurBDD THEN
 	SET NEW.IdServeurBDD = OLD.IdServeurBDD ;
 END IF;
 
 
 IF NEW.IdMesureTestEtalon <> OLD.IdMesureTestEtalon THEN
	  SET IdTemp = NULL;
      
  	  SELECT CompteurID INTO IdTemp FROM `ts_compteur_idtable` WHERE `NomTable` = 'ts_mesuretestetalon' ;
      
      IF IdTemp IS NULL OR NEW.IdMesureTestEtalon > IdTemp THEN
         
         SET IdTemp = NEW.IdMesureTestEtalon ;
      	 
         UPDATE ts_compteur_idtable SET  CompteurID = IdTemp WHERE IdServeurBDD = IdBase AND NomTable = 'ts_mesuretestetalon'; 

      END IF;
           
  END IF ;


END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
