
IF DB_ID(N'vigi_main') IS NULL
BEGIN
  CREATE DATABASE [vigi_main];
END;
GO
USE [vigi_main];
GO

-- =====================================================================
-- ALIGNEMENT SQL SERVER <-> SCHEMA PRISMA (Mise a jour 2026-02)
-- Script idempotent (complement de seed)
-- =====================================================================

-- t_autorisation: suppression anciens flags
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Admin') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Admin;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Metrologie') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Metrologie;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_Surveillance') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_Surveillance;
IF COL_LENGTH('dbo.t_autorisation', 'A_Acces_VigiLog') IS NOT NULL ALTER TABLE dbo.t_autorisation DROP COLUMN A_Acces_VigiLog;
GO

-- t_lieu
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Sup_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Sup_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Inf_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Consigne_Inf_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Tolerance_Surveillance_Sup_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Tolerance_Surveillance_Sup_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Tolerance_Surveillance_Inf_Base') IS NULL ALTER TABLE dbo.t_lieu ADD Tolerance_Surveillance_Inf_Base FLOAT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Planning_Actif') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Actif BIT NOT NULL CONSTRAINT DF_t_lieu_Planning_Actif DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Planning_Source_Regle_Id') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Source_Regle_Id INT NULL;
IF COL_LENGTH('dbo.t_lieu', 'Planning_Derniere_Maj') IS NULL ALTER TABLE dbo.t_lieu ADD Planning_Derniere_Maj DATETIME NULL;
IF COL_LENGTH('dbo.t_lieu', 'Est_Redeclenchement_Immediat') IS NULL ALTER TABLE dbo.t_lieu ADD Est_Redeclenchement_Immediat BIT NOT NULL CONSTRAINT DF_t_lieu_Est_Redeclenchement_Immediat DEFAULT(0);
IF COL_LENGTH('dbo.t_lieu', 'Surveillance_Etat') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Surveillance_Etat;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Sup_Corrigee') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Consigne_Sup_Corrigee;
IF COL_LENGTH('dbo.t_lieu', 'Consigne_Inf_Corrigee') IS NOT NULL ALTER TABLE dbo.t_lieu DROP COLUMN Consigne_Inf_Corrigee;
GO

-- t_module / t_parametre / t_utilisateur
IF COL_LENGTH('dbo.t_module', 'Est_Module_GSO') IS NULL ALTER TABLE dbo.t_module ADD Est_Module_GSO BIT NOT NULL CONSTRAINT DF_t_module_Est_Module_GSO DEFAULT(0);
IF COL_LENGTH('dbo.t_module', 'Port_Serie_Send_GSO') IS NULL ALTER TABLE dbo.t_module ADD Port_Serie_Send_GSO VARCHAR(10) NULL;
IF COL_LENGTH('dbo.t_parametre', 'Champ_DATETIME') IS NULL ALTER TABLE dbo.t_parametre ADD Champ_DATETIME DATETIME NULL;
IF COL_LENGTH('dbo.t_utilisateur', 'Avatar_Utilisateur') IS NULL ALTER TABLE dbo.t_utilisateur ADD Avatar_Utilisateur VARCHAR(512) NULL;
GO

-- t_lieu_mail_tel
IF OBJECT_ID('dbo.t_lieu_mail_tel', 'U') IS NULL AND OBJECT_ID('dbo.t_lieu_tel_num', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_lieu_tel_num', 't_lieu_mail_tel';
END;
GO
IF OBJECT_ID('dbo.t_lieu_mail_tel', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_mail_tel (
    Id_Mail_Tel INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NULL,
    Ordre_Contact INT NULL,
    Id_Utilisateur INT NULL,
    Est_Via_Telephone BIT NULL,
    Est_Via_Email BIT NULL
  );
  CREATE INDEX IDX_Id_Lieu ON dbo.t_lieu_mail_tel(Id_Lieu);
  CREATE INDEX IDX_Id_Utilisateur ON dbo.t_lieu_mail_tel(Id_Utilisateur);
END;
GO
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Id_Tel_Num') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Id_Tel_Num', 'Id_Mail_Tel', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Numero_Ordre') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Numero_Ordre', 'Ordre_Contact', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Id_Utilisation') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Id_Utilisation', 'Id_Utilisateur', 'COLUMN';
IF COL_LENGTH('dbo.t_lieu_mail_tel', 'Est_Via_Mail') IS NOT NULL EXEC sp_rename 'dbo.t_lieu_mail_tel.Est_Via_Mail', 'Est_Via_Email', 'COLUMN';
GO

-- t_ajustage / t_milieu
IF OBJECT_ID('dbo.t_ajustage', 'U') IS NULL AND OBJECT_ID('dbo.t_calibrage', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_calibrage', 't_ajustage';
END;
GO
IF OBJECT_ID('dbo.t_milieu', 'U') IS NULL AND OBJECT_ID('dbo.t_bain', 'U') IS NOT NULL
BEGIN
  EXEC sp_rename 'dbo.t_bain', 't_milieu';
END;
GO
IF OBJECT_ID('dbo.t_ajustage', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_ajustage (
    Id_Ajustage INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Date_Heure_Ajustage DATETIME NULL,
    Sonde_Numero_Serie VARCHAR(50) NULL,
    Coeff_X2 FLOAT NULL,
    Coeff_X FLOAT NULL,
    Coeff_Constant FLOAT NULL,
    Unite VARCHAR(10) NULL,
    Nb_Decimale INT NULL,
    Operateur VARCHAR(255) NULL,
    SE_Numero VARCHAR(50) NULL,
    SE_Organisme VARCHAR(50) NULL,
    SE_Date_Certif DATE NULL,
    SE_Numero_Certif VARCHAR(50) NULL,
    Mesure_Etalon1 FLOAT NULL,
    Mesure_Etalon2 FLOAT NULL,
    Valeur_Brute1 FLOAT NULL,
    Valeur_Brute2 FLOAT NULL,
    Ancienne_Mesure1 FLOAT NULL,
    Ancienne_Mesure2 FLOAT NULL,
    Nouvelle_Mesure1 FLOAT NULL,
    Nouvelle_Mesure2 FLOAT NULL,
    Id_Milieu INT NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_milieu', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_milieu (
    Id_Milieu INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Model VARCHAR(50) NULL,
    Reference VARCHAR(50) NULL,
    Stabilite FLOAT NULL,
    Homogeneite FLOAT NULL,
    Contenu VARCHAR(50) NULL,
    Est_Reserve_MC2 BIT NULL,
    Est_Archive BIT NULL
  );
END;
GO

-- t_sonde_etat
IF OBJECT_ID('dbo.t_sonde_etat', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_sonde_etat (
    Id_Sonde_Etat INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Etat_Sonde VARCHAR(1) NULL UNIQUE,
    Etat_Libelle VARCHAR(50) NULL
  );
END;
GO
IF NOT EXISTS (SELECT 1 FROM dbo.t_sonde_etat WHERE Etat_Sonde = 'D') INSERT INTO dbo.t_sonde_etat(Etat_Sonde, Etat_Libelle) VALUES ('D','DESACTIVE');
IF NOT EXISTS (SELECT 1 FROM dbo.t_sonde_etat WHERE Etat_Sonde = 'S') INSERT INTO dbo.t_sonde_etat(Etat_Sonde, Etat_Libelle) VALUES ('S','SURVEILLANCE ACTIVE');
GO

-- notifications
IF OBJECT_ID('dbo.t_notification', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification (
    Id_Notification INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Type VARCHAR(32) NOT NULL,
    Id_Alarme INT NULL,
    Titre VARCHAR(128) NULL,
    Message VARCHAR(512) NOT NULL,
    Payload_Json NVARCHAR(MAX) NULL,
    Priorite INT NULL CONSTRAINT DF_t_notification_Priorite DEFAULT(0),
    Date_Creation DATETIME NOT NULL CONSTRAINT DF_t_notification_Date DEFAULT(GETDATE()),
    Est_Archive BIT NOT NULL CONSTRAINT DF_t_notification_Archive DEFAULT(0)
  );
  CREATE INDEX IDX_Id_Alarme_Notification ON dbo.t_notification(Id_Alarme);
  CREATE INDEX IDX_Date_Creation_Notification ON dbo.t_notification(Date_Creation);
END;
GO
IF OBJECT_ID('dbo.t_notification_delivery', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification_delivery (
    Id_Delivery INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Notification INT NOT NULL,
    Id_Poste INT NOT NULL,
    Id_Utilisateur INT NULL,
    Statut VARCHAR(32) NOT NULL,
    Nb_Tentatives INT NOT NULL CONSTRAINT DF_t_notification_delivery_NbTentatives DEFAULT(0),
    Derniere_Erreur VARCHAR(255) NULL,
    Date_Queue DATETIME NOT NULL CONSTRAINT DF_t_notification_delivery_DateQueue DEFAULT(GETDATE()),
    Date_Envoi DATETIME NULL,
    Date_Ack_Agent DATETIME NULL,
    Date_Dernier_Event DATETIME NULL,
    Correlation_Id VARCHAR(64) NULL,
    CONSTRAINT UK_NOTIFICATION_POSTE UNIQUE(Id_Notification, Id_Poste)
  );
  CREATE INDEX IDX_STATUT_DELIVERY ON dbo.t_notification_delivery(Statut);
  CREATE INDEX IDX_Date_Envoi_Delivery ON dbo.t_notification_delivery(Date_Envoi);
END;
GO
IF OBJECT_ID('dbo.t_notification_event', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_notification_event (
    Id_Event INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Delivery INT NOT NULL,
    Event_Type VARCHAR(32) NOT NULL,
    Event_Data NVARCHAR(MAX) NULL,
    Date_Event DATETIME NOT NULL CONSTRAINT DF_t_notification_event_Date DEFAULT(GETDATE())
  );
  CREATE INDEX IDX_Id_Delivery_Event ON dbo.t_notification_event(Id_Delivery);
  CREATE INDEX IDX_Date_Event ON dbo.t_notification_event(Date_Event);
END;
GO

-- planning
IF OBJECT_ID('dbo.t_lieu_planning_regle', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_planning_regle (
    Id_Regle INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NOT NULL,
    Actif BIT NOT NULL CONSTRAINT DF_t_lieu_planning_regle_Actif DEFAULT(1),
    Jour_Debut TINYINT NOT NULL,
    Heure_Debut TIME NOT NULL,
    Jour_Fin TINYINT NOT NULL,
    Heure_Fin TIME NOT NULL,
    Consigne FLOAT NULL,
    Consigne_Sup FLOAT NULL,
    Consigne_Inf FLOAT NULL,
    Priorite INT NOT NULL CONSTRAINT DF_t_lieu_planning_regle_Priorite DEFAULT(0),
    Tolerance_Sup_Calc FLOAT NULL,
    Tolerance_Inf_Calc FLOAT NULL,
    Date_Creation DATETIME NOT NULL CONSTRAINT DF_t_lieu_planning_regle_DateCreation DEFAULT(GETDATE()),
    Date_Maj DATETIME NULL
  );
  CREATE INDEX IDX_Actif_Lieu ON dbo.t_lieu_planning_regle(Actif, Id_Lieu);
  CREATE INDEX IDX_Id_Lieu ON dbo.t_lieu_planning_regle(Id_Lieu);
END;
GO
IF OBJECT_ID('dbo.t_lieu_planning_audit', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_lieu_planning_audit (
    Id_Audit INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Id_Lieu INT NOT NULL,
    [Timestamp] DATETIME NOT NULL CONSTRAINT DF_t_lieu_planning_audit_Timestamp DEFAULT(GETDATE()),
    [Type] VARCHAR(32) NOT NULL,
    Planning_Regle_Id INT NULL,
    Consigne_Avant FLOAT NULL,
    Consigne_Sup_Avant FLOAT NULL,
    Consigne_Inf_Avant FLOAT NULL,
    Consigne_Apres FLOAT NULL,
    Consigne_Sup_Apres FLOAT NULL,
    Consigne_Inf_Apres FLOAT NULL
  );
  CREATE INDEX IDX_Id_Lieu_Timestamp ON dbo.t_lieu_planning_audit(Id_Lieu, [Timestamp]);
END;
GO

-- tables techniques
IF OBJECT_ID('dbo.liste_clients', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.liste_clients (
    Id_Client INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Num_Compte VARCHAR(50) NULL UNIQUE,
    VigiServ_Derniere_Date_Heure DATETIME NULL,
    Vigitel_Derniere_Date_Heure DATETIME NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_mem_gso', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_mem_gso (
    id INT NOT NULL PRIMARY KEY,
    last_sonde VARCHAR(20) NULL,
    cycle_MEM INT NULL,
    cycle_start DATETIME NULL,
    last_update DATETIME NULL
  );
END;
GO
IF OBJECT_ID('dbo.t_mem_gso_2', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.t_mem_gso_2 (
    com_port_send INT NOT NULL PRIMARY KEY,
    last_sonde VARCHAR(20) NULL,
    last_sonde_datetime DATETIME NULL,
    cycle_MEM INT NULL,
    cycle_start DATETIME NULL,
    last_update DATETIME NULL
  );
END;
GO

-- parametres recents (uppercase)
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='GENERAL' AND Mot_Cle='GLOBAL_LANGUAGE')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('GENERAL','GLOBAL_LANGUAGE','fr','Langue globale de l''application (mails et futurs modules)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SHOW_NULL_NON_RESPONSE')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SHOW_NULL_NON_RESPONSE','0','Afficher les mesures null (non-reponse) dans les graphiques');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='DASHBOARD' AND Mot_Cle='SURVEILLANCE_REFRESH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('DASHBOARD','SURVEILLANCE_REFRESH','15','Rafraichissement surveillance en secondes');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_CC_RECIPIENTS')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_CC_RECIPIENTS','','Destinataires en copie sur tous les emails');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_SEND_ACK')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_SEND_ACK','1','Activer envoi email lors acquittement alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='EMAIL_SEND_RESOLVED')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','EMAIL_SEND_RESOLVED','1','Activer envoi email lors fin alarme');
GO
