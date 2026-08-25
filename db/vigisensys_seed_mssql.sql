-- =====================================================================
-- BOOTSTRAP SQL SERVER VigiSensys
-- Version produit / seed : 0.90.001
-- Cree les 3 bases et les tables absentes avant le seed/alignement.
-- Genere depuis les schemas Prisma, sans FK bloquantes pour rester idempotent.
-- =====================================================================

IF DB_ID(N'vigi_main') IS NULL
BEGIN
  CREATE DATABASE [vigi_main];
END;
GO
USE [vigi_main];
GO

GO

IF OBJECT_ID(N'dbo.t_actionneur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur] (
    [Id_Actionneur] INT IDENTITY(1,1) NOT NULL,
    [Num_Serie] VARCHAR(50) NULL,
    [Type] INT NULL,
    [Est_Etat] BIT NULL DEFAULT(0),
    [Est_Demande] BIT NULL DEFAULT(0),
    [Commentaire] VARCHAR(255) NULL,
    [Port_Serie] INT NULL,
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Est_Test] BIT NULL DEFAULT(0),
    [Libelle_Erreur] VARCHAR(50) NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Id_Worker] INT NULL DEFAULT(1),
    CONSTRAINT [PK_t_actionneur] PRIMARY KEY ([Id_Actionneur])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_alarme', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme] (
    [Id_Alarme] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(1) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Est_Alarme_Vrai] BIT NULL DEFAULT(0),
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT(0),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Date_Heure_Debut_Alarme_Vrai] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL DEFAULT(0),
    [Est_Mail_Envoye] BIT NULL,
    [Est_Mail_Fin_Envoye] BIT NOT NULL DEFAULT(0),
    [Est_Tel_Acquittee] BIT NULL,
    CONSTRAINT [PK_t_alarme] PRIMARY KEY ([Id_Alarme])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_alarme_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_histo] (
    [Id_Alarme_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Alarme] INT NOT NULL,
    [Date_Heure_Debut] DATETIME NULL,
    [Valeur] FLOAT NULL,
    [Type] VARCHAR(1) NULL,
    [Date_Heure_Fin] DATETIME NULL,
    [Est_Alarme_Vrai] BIT NULL DEFAULT(0),
    [Id_Lieu] INT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Est_Acquittee] BIT NULL DEFAULT(0),
    [Date_Heure_Derniere_Mesure] DATETIME NULL,
    [Date_Heure_Debut_Alarme_Vrai] DATETIME NULL,
    [Est_Alarme_Pour_VigiTel] BIT NULL DEFAULT(0),
    [Est_Mail_Envoye] BIT NULL,
    [Est_Tel_Acquittee] BIT NULL,
    [Date_Heure_Acquittement] DATETIME NULL,
    CONSTRAINT [PK_t_alarme_histo] PRIMARY KEY ([Id_Alarme_Histo])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_alarme_message] (
    [Id_Alarme_Message] INT IDENTITY(1,1) NOT NULL,
    [Code_Alarme_Message] VARCHAR(20) NULL,
    [Type] VARCHAR(1) NULL,
    [Texte_Message] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_t_alarme_message] PRIMARY KEY ([Id_Alarme_Message])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_alarme_message', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_alarme_message_Code_Alarme_Message' AND object_id = OBJECT_ID(N'dbo.t_alarme_message')) CREATE UNIQUE INDEX [UX_t_alarme_message_Code_Alarme_Message] ON dbo.[t_alarme_message]([Code_Alarme_Message]) WHERE [Code_Alarme_Message] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_autorisation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_autorisation] (
    [Id_Autorisation] INT IDENTITY(1,1) NOT NULL,
    [Code_Autorisation] VARCHAR(50) NULL,
    [Libelle_Autorisation] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(200) NULL,
    [A_Acces_Admin] BIT NULL DEFAULT(0),
    [A_Acces_Metrologie] BIT NULL DEFAULT(0),
    [A_Acces_Surveillance] BIT NULL DEFAULT(0),
    [A_Acces_VigiLog] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_autorisation] PRIMARY KEY ([Id_Autorisation])
  );
END;
GO
IF OBJECT_ID(N'dbo.t_milieu_inter', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_milieu_inter] (
    [Id_Milieu] INT IDENTITY(1,1) NOT NULL,
    [Model] VARCHAR(50) NULL,
    [Reference] VARCHAR(50) NULL,
    [Stabilite] FLOAT NULL,
    [Homogeneite] FLOAT NULL,
    [Contenu] VARCHAR(50) NULL,
    [Est_Reserve_MC2] BIT NULL DEFAULT(0),
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_milieu_inter] PRIMARY KEY ([Id_Milieu])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_ajustage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ajustage] (
    [Id_Ajustage] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Ajustage] DATETIME NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Coeff_X2] FLOAT NULL DEFAULT(0),
    [Coeff_X] FLOAT NULL,
    [Coeff_Constant] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Nb_Decimale] INT NULL,
    [Operateur] VARCHAR(255) NULL,
    [SE_Numero] VARCHAR(50) NULL,
    [SE_Organisme] VARCHAR(50) NULL,
    [SE_Date_Certif] DATE NULL,
    [SE_Numero_Certif] VARCHAR(50) NULL,
    [Mesure_Etalon1] FLOAT NULL,
    [Mesure_Etalon2] FLOAT NULL,
    [Valeur_Brute1] FLOAT NULL,
    [Valeur_Brute2] FLOAT NULL,
    [Ancienne_Mesure1] FLOAT NULL,
    [Ancienne_Mesure2] FLOAT NULL,
    [Nouvelle_Mesure1] FLOAT NULL,
    [Nouvelle_Mesure2] FLOAT NULL,
    [Id_Milieu] INT NULL,
    CONSTRAINT [PK_t_ajustage] PRIMARY KEY ([Id_Ajustage])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_certif', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_certif] (
    [Id_Certif] INT IDENTITY(1,1) NOT NULL,
    [Numero] VARCHAR(50) NULL,
    [Organisme] VARCHAR(50) NULL,
    [Date] DATE NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Id_PDF] INT NULL,
    CONSTRAINT [PK_t_certif] PRIMARY KEY ([Id_Certif])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_certif_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_certif_mesure] (
    [Id_Certif_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_Certif] INT NULL,
    [Numero_Ordre] INT NULL,
    [Temperature_Vraie] VARCHAR(50) NULL,
    [Temperature_Reference] VARCHAR(50) NULL,
    [Incertitude] FLOAT NULL,
    CONSTRAINT [PK_t_certif_mesure] PRIMARY KEY ([Id_Certif_Mesure])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon] (
    [Id_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Etat_Etalon] VARCHAR(1) NULL,
    [Port_Serie] VARCHAR(10) NULL,
    [Est_Sonde_Externe] BIT NULL,
    [Resolution] VARCHAR(50) NULL,
    [Incertitude] VARCHAR(50) NULL,
    [Nb_Decimale] INT NULL,
    [Coeff_A] FLOAT NULL,
    [Coeff_B] FLOAT NULL,
    [Coeff_C] FLOAT NULL,
    [Incertitude_Max] FLOAT NULL,
    [Reserve_MC2] VARCHAR(50) NULL,
    [Id_Worker] INT NULL DEFAULT(1),
    [Id_Module] INT NULL,
    CONSTRAINT [PK_t_etalon] PRIMARY KEY ([Id_Etalon])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_etalon', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_etalon_Etalon_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_etalon')) CREATE UNIQUE INDEX [UX_t_etalon_Etalon_Numero_Serie] ON dbo.[t_etalon]([Etalon_Numero_Serie]) WHERE [Etalon_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_etalonnage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalonnage] (
    [Id_Etalonnage] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Etalonnage] DATETIME NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Nom_Etalonnage] VARCHAR(255) NULL,
    [Date_Validite] DATE NULL,
    [Duree_Validite_Jours] INT NULL,
    [Valide] DATETIME NULL,
    [Operateur] VARCHAR(255) NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NULL,
    [Date_Certif] DATE NULL,
    [Organisme] VARCHAR(50) NULL,
    [Num_Certif] VARCHAR(50) NULL,
    [Unite] VARCHAR(10) NULL,
    [Incertitude] FLOAT NULL,
    [Moyenne_Etalon] FLOAT NULL,
    [Moyenne_Sonde] FLOAT NULL,
    [Repetabilite] VARCHAR(50) NULL,
    [Id_Bain] INT NULL,
    [Id_Milieu] INT NULL,
    [Err_Justesse] FLOAT NULL,
    CONSTRAINT [PK_t_etalonnage] PRIMARY KEY ([Id_Etalonnage])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_etalonnage_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalonnage_mesure] (
    [Id_Etalonnage_Mesure_Sonde] INT IDENTITY(1,1) NOT NULL,
    [Id_Etalonnage] INT NULL,
    [Numero_Ordre] INT NULL,
    [Mesure_Sonde] FLOAT NULL,
    [Mesure_Etalon] FLOAT NULL,
    CONSTRAINT [PK_t_etalonnage_mesure] PRIMARY KEY ([Id_Etalonnage_Mesure_Sonde])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_groupe] (
    [Id_Groupe] INT IDENTITY(1,1) NOT NULL,
    [Nom_Groupe] VARCHAR(64) NULL,
    [Numero_Regroupement] VARCHAR(1) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_groupe] PRIMARY KEY ([Id_Groupe])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_groupe', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_groupe_Nom_Groupe' AND object_id = OBJECT_ID(N'dbo.t_groupe')) CREATE UNIQUE INDEX [UX_t_groupe_Nom_Groupe] ON dbo.[t_groupe]([Nom_Groupe]) WHERE [Nom_Groupe] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_liaison_profil_autorisation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_profil_autorisation] (
    [Id_Profil] INT NOT NULL,
    [Id_Autorisation] INT NOT NULL,
    CONSTRAINT [PK_t_liaison_profil_autorisation] PRIMARY KEY ([Id_Profil], [Id_Autorisation])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_liaison_utilisateur_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_utilisateur_groupe] (
    [Id_Liaison_u_g] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Id_Groupe] INT NULL,
    CONSTRAINT [PK_t_liaison_utilisateur_groupe] PRIMARY KEY ([Id_Liaison_u_g])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_liaison_utilisateur_site] (
    [Id_Liaison] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Id_Site] INT NULL,
    [Date_Affectation] DATETIME NULL,
    CONSTRAINT [PK_t_liaison_utilisateur_site] PRIMARY KEY ([Id_Liaison])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_liaison_utilisateur_site', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_USER_SITE' AND object_id = OBJECT_ID(N'dbo.t_liaison_utilisateur_site')) CREATE UNIQUE INDEX [UK_USER_SITE] ON dbo.[t_liaison_utilisateur_site]([Id_Utilisateur], [Id_Site]);
GO

IF OBJECT_ID(N'dbo.t_lieu_groupe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_groupe] (
    [Id_Lieu] INT NOT NULL,
    [Id_Groupe] INT NOT NULL,
    CONSTRAINT [PK_t_lieu_groupe] PRIMARY KEY ([Id_Lieu], [Id_Groupe])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_lieu', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu] (
    [Id_Lieu] INT IDENTITY(1,1) NOT NULL,
    [Id_Site] INT NULL,
    [Nom_Lieu] VARCHAR(30) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Base] FLOAT NULL,
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Sup_Base] FLOAT NULL,
    [Tolerance_Surveillance_Sup] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Base] FLOAT NULL,
    [Est_Consigne_Sup_Active] BIT NULL DEFAULT(1),
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Consigne_Inf_Base] FLOAT NULL,
    [Tolerance_Surveillance_Inf] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Base] FLOAT NULL,
    [Est_Consigne_Inf_Active] BIT NULL DEFAULT(1),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NULL,
    [Frequence] INT NULL,
    [Lieu_Etat] VARCHAR(1) NULL,
    [Surveillance_Etat] VARCHAR(1) NULL,
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Id_Plan] INT NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Date_Creation] DATE NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Est_Tel_Actif] BIT NULL DEFAULT(0),
    [Tel_Code] VARCHAR(4) NULL,
    [Tel_Son_Lieu] VARCHAR(260) NULL,
    [Id_Actionneur] INT NULL,
    [Est_Mode_Serotheque] BIT NULL DEFAULT(0),
    [Coef_Sensibilite] INT NULL,
    [Id_PDF] INT NULL,
    [Est_DataLogger] BIT NULL DEFAULT(0),
    [EMT] FLOAT NULL,
    [EMT_Choix_Mode] INT NULL DEFAULT(1),
    [EMT_Sonde] FLOAT NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Derniere_Date_Heure] DATETIME NULL,
    [Derniere_Valeur] FLOAT NULL,
    [Derniere_Unite] VARCHAR(10) NULL,
    [Derniere_Nb_Decimal] INT NULL,
    [Est_Lieu_En_Alarme] TINYINT NULL,
    [Est_Lieu_Alarme_Terminee_Non_Acquittee] TINYINT NULL,
    [Est_Acq_Auto_Alarme_NR] BIT NOT NULL DEFAULT(0),
    [Est_Lieu_Alarme_Terminee_Non_Acquittee_T1] TINYINT NULL,
    [Est_Lieu_En_Pre_Alarme] TINYINT NULL,
    [Id_Alarme] INT NULL,
    [Lieu_Etat_N1] VARCHAR(50) NULL,
    [Derniere_Date_Etalonnage] DATE NULL,
    [Derniere_Erreur_Justesse] FLOAT NULL,
    [Derniere_Incertitude] FLOAT NULL,
    [Retard_Non_Reponse] INT NULL,
    [Date_Heure_Derniere_Reponse] DATETIME NULL,
    [Date_Heure_Derniere_Reponse_Recue_OK] DATETIME NULL,
    [Est_Correction_Ej] TINYINT NULL DEFAULT(0),
    [Derive] FLOAT NULL DEFAULT(0),
    [Est_Correction_derive] BIT NULL DEFAULT(0),
    [Derniere_Valeur_Null] INT NULL DEFAULT(0),
    [Type_Lieu] VARCHAR(20) NULL,
    [Date_Heure_Dernier_Acquittement_En_Cours] DATETIME NULL,
    [Date_Heure_Last_Update_EVT_GSO] DATETIME NULL,
    [Date_Heure_Reactivation_Alarme] DATETIME NULL,
    [Notification_Active] BIT NULL DEFAULT(1),
    [Commentaire] VARCHAR(200) NULL,
    [Infos_Modifiees_Depuis_Derniere_Mesure] BIT NOT NULL DEFAULT(1),
    [Est_Remontee_Memoire_A_Faire] BIT NOT NULL DEFAULT(0),
    [Date_Heure_Reactivation_Surveillance] DATETIME NULL,
    [Date_Heure_Surveillance_On] DATETIME NULL,
    [Date_Heure_Surveillance_Off] DATETIME NULL,
    [Derniere_Val_Rssi] VARCHAR(10) NULL,
    [Derniere_Val_Batterie] VARCHAR(10) NULL,
    [Derniere_Val_Tension] VARCHAR(10) NULL,
    [Est_Lieu_GSO] BIT NULL DEFAULT(0),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT(1),
    [Planning_Actif] BIT NOT NULL DEFAULT(0),
    [Planning_Regle_Existe] BIT NOT NULL DEFAULT(0),
    [Planning_Source_Regle_Id] INT NULL,
    [Planning_Derniere_Maj] DATETIME NULL,
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT(0),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT(0),
    CONSTRAINT [PK_t_lieu] PRIMARY KEY ([Id_Lieu])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_template] (
    [Id_Lieu_Template] INT IDENTITY(1,1) NOT NULL,
    [Nom_Template] VARCHAR(80) NOT NULL,
    [Description] VARCHAR(255) NULL,
    [Lieu_Etat] VARCHAR(1) NOT NULL DEFAULT(N'D'),
    [Frequence] INT NULL,
    [Retard_Alarme_Haut] INT NULL,
    [Retard_Alarme_Bas] INT NULL,
    [Retard_Non_Reponse] INT NULL DEFAULT(60),
    [Retard_Alarme_Changement_Consigne] INT NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Consigne_Sup] DECIMAL(10,2) NULL,
    [Consigne_Inf] DECIMAL(10,2) NULL,
    [Tolerance_Surveillance_Sup] DECIMAL(10,2) NULL,
    [Tolerance_Surveillance_Inf] DECIMAL(10,2) NULL,
    [Consigne_Sup_Pre_Alarme] DECIMAL(10,2) NULL,
    [Consigne_Inf_Pre_Alarme] DECIMAL(10,2) NULL,
    [Est_Consigne_Sup_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Inf_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Sup_Pre_Alarme_Active] BIT NOT NULL DEFAULT(0),
    [Est_Consigne_Inf_Pre_Alarme_Active] BIT NOT NULL DEFAULT(0),
    [Est_Son_Alarme_Active] BIT NOT NULL DEFAULT(1),
    [Est_Redeclenchement_Immediat] BIT NOT NULL DEFAULT(0),
    [Nb_Mesures_Temporisation_Redeclenchement] INT NULL DEFAULT(0),
    [Observations_Info] NVARCHAR(MAX) NULL,
    [Est_Archive] BIT NOT NULL DEFAULT(0),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Creation] INT NULL,
    [Id_Utilisateur_Maj] INT NULL,
    CONSTRAINT [PK_t_lieu_template] PRIMARY KEY ([Id_Lieu_Template])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_lieu_template', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_lieu_template_Nom_Template' AND object_id = OBJECT_ID(N'dbo.t_lieu_template')) CREATE UNIQUE INDEX [UX_t_lieu_template_Nom_Template] ON dbo.[t_lieu_template]([Nom_Template]) WHERE [Nom_Template] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_module', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_module] (
    [Id_Module] INT IDENTITY(1,1) NOT NULL,
    [Module_Numero_Serie] VARCHAR(50) NULL,
    [Type_Module] INT NULL,
    [Port_Serie] VARCHAR(10) NULL,
    [Position_Plan_X] BIGINT NULL,
    [Position_Plan_Y] BIGINT NULL,
    [Id_Plan] INT NULL,
    [Adresse_IP] VARCHAR(50) NULL,
    [Delai_Reseau] INT NULL,
    [Emplacement] VARCHAR(50) NULL,
    [Archive] TINYINT NULL DEFAULT(0),
    [Id_Worker] INT NULL DEFAULT(1),
    [Est_Module_GSO] BIT NOT NULL DEFAULT(0),
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    CONSTRAINT [PK_t_module] PRIMARY KEY ([Id_Module])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_module', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'Identifiant_Module' AND object_id = OBJECT_ID(N'dbo.t_module')) CREATE UNIQUE INDEX [Identifiant_Module] ON dbo.[t_module]([Type_Module], [Module_Numero_Serie]);
GO

IF OBJECT_ID(N'dbo.t_module_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_module_type] (
    [Id_Module_Type] INT IDENTITY(1,1) NOT NULL,
    [Libelle_Type_Module] VARCHAR(50) NULL,
    [Libelle_Module] VARCHAR(100) NULL,
    [Est_Flag_Affiche_Plan] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_module_type] PRIMARY KEY ([Id_Module_Type])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_parametre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_parametre] (
    [Section] VARCHAR(100) NOT NULL,
    [Mot_Cle] VARCHAR(100) NOT NULL,
    [Valeur] NVARCHAR(MAX) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Champ_DATETIME] DATETIME NULL,
    CONSTRAINT [PK_t_parametre] PRIMARY KEY ([Section], [Mot_Cle])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_pdf', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_pdf] (
    [Id_PDF] INT IDENTITY(1,1) NOT NULL,
    [Nom_PDF] VARCHAR(50) NULL,
    [Contenu_PDF] VARBINARY(MAX) NULL,
    CONSTRAINT [PK_t_pdf] PRIMARY KEY ([Id_PDF])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_plan', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_plan] (
    [Id_Plan] INT IDENTITY(1,1) NOT NULL,
    [Image] VARBINARY(MAX) NULL,
    [Titre] VARCHAR(50) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_plan] PRIMARY KEY ([Id_Plan])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_plan', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_plan_Titre' AND object_id = OBJECT_ID(N'dbo.t_plan')) CREATE UNIQUE INDEX [UX_t_plan_Titre] ON dbo.[t_plan]([Titre]) WHERE [Titre] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_postes_clients] (
    [Id_Poste] INT IDENTITY(1,1) NOT NULL,
    [Nom_Machine_Connexion] VARCHAR(255) NULL,
    [Adresse_IP_Connexion] VARCHAR(50) NULL,
    [Login] VARCHAR(64) NULL,
    [Nom] VARCHAR(50) NULL,
    [Prenom] VARCHAR(50) NULL,
    [Date_Heure_Derniere_Connexion] DATETIME NULL,
    CONSTRAINT [PK_t_postes_clients] PRIMARY KEY ([Id_Poste])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_postes_clients', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_postes_clients_Nom_Machine_Connexion' AND object_id = OBJECT_ID(N'dbo.t_postes_clients')) CREATE UNIQUE INDEX [UX_t_postes_clients_Nom_Machine_Connexion] ON dbo.[t_postes_clients]([Nom_Machine_Connexion]) WHERE [Nom_Machine_Connexion] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_profil', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_profil] (
    [Id_Profil] INT IDENTITY(1,1) NOT NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(100) NULL,
    [Est_MC2] BIT NULL DEFAULT(0),
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_profil] PRIMARY KEY ([Id_Profil])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_profil', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_profil_Profil_Utilisateur' AND object_id = OBJECT_ID(N'dbo.t_profil')) CREATE UNIQUE INDEX [UX_t_profil_Profil_Utilisateur] ON dbo.[t_profil]([Profil_Utilisateur]) WHERE [Profil_Utilisateur] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_site', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_site] (
    [Id_Site] INT IDENTITY(1,1) NOT NULL,
    [Code_Site] VARCHAR(20) NULL,
    [Libelle_Site] VARCHAR(50) NULL,
    [Commentaire] VARCHAR(200) NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_site] PRIMARY KEY ([Id_Site])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde] (
    [Id_Sonde] INT IDENTITY(1,1) NOT NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Est_Sonde_GSO] BIT NOT NULL DEFAULT(0),
    [Port_Serie] VARCHAR(10) NULL,
    [Surveillance_Etat] VARCHAR(1) NULL,
    [Etat_Sonde] VARCHAR(1) NULL DEFAULT(N'D'),
    [Id_Module] INT NULL,
    [Relai_1] VARCHAR(50) NULL,
    [Relai_2] VARCHAR(50) NULL,
    [Relai_3] VARCHAR(50) NULL,
    [Relai_4] VARCHAR(50) NULL,
    [Frequence_Mesure] INT NULL,
    [Frequence_Recup] INT NULL,
    [Est_Sonde_Reformee] BIT NULL,
    [Etat_Sonde_N1] VARCHAR(1) NULL,
    [Id_Worker] INT NULL,
    [Id_Sonde_Etat] INT NULL,
    [Sonde_Offset] FLOAT NOT NULL DEFAULT(0),
    [Metrologie_en_cours] BIT NOT NULL DEFAULT(0),
    [Metrologie_cmd_envoyee] BIT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_t_sonde] PRIMARY KEY ([Id_Sonde])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_sonde', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_Sonde_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_sonde')) CREATE UNIQUE INDEX [UX_t_sonde_Sonde_Numero_Serie] ON dbo.[t_sonde]([Sonde_Numero_Serie]) WHERE [Sonde_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etat_surveillance] (
    [Id_Surveillance_Etat] INT IDENTITY(1,1) NOT NULL,
    [Surveillance_Etat] VARCHAR(1) NULL,
    [Surveillance_Etat_Libelle] VARCHAR(50) NULL,
    CONSTRAINT [PK_t_etat_surveillance] PRIMARY KEY ([Id_Surveillance_Etat])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_etat_surveillance', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_etat_surveillance_Surveillance_Etat' AND object_id = OBJECT_ID(N'dbo.t_etat_surveillance')) CREATE UNIQUE INDEX [UX_t_etat_surveillance_Surveillance_Etat] ON dbo.[t_etat_surveillance]([Surveillance_Etat]) WHERE [Surveillance_Etat] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde_type] (
    [Id_Sonde_Type] INT IDENTITY(1,1) NOT NULL,
    [Sonde_Type] VARCHAR(50) NULL,
    [Libelle_Sonde_Type] VARCHAR(50) NULL,
    [Est_Gestion_Relais] BIT NULL,
    [Est_Double_Capteur] BIT NOT NULL DEFAULT(0),
    [Famille_Sonde] VARCHAR(16) NOT NULL DEFAULT(N'CLASSIC'),
    [Unite] VARCHAR(10) NULL,
    CONSTRAINT [PK_t_sonde_type] PRIMARY KEY ([Id_Sonde_Type])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_sonde_type', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_type_Sonde_Type' AND object_id = OBJECT_ID(N'dbo.t_sonde_type')) CREATE UNIQUE INDEX [UX_t_sonde_type_Sonde_Type] ON dbo.[t_sonde_type]([Sonde_Type]) WHERE [Sonde_Type] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_utilisateur] (
    [Id_Utilisateur] INT IDENTITY(1,1) NOT NULL,
    [Login] VARCHAR(64) NULL,
    [Mot_De_Passe] VARCHAR(60) NULL,
    [Date_Validite] DATE NULL,
    [Date_Creation] DATE NULL,
    [Est_Archive] BIT NULL DEFAULT(0),
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Derniere_Connexion] DATETIME NULL,
    [Adresse_IP_Connexion] VARCHAR(15) NULL,
    [Nom_Machine_Connexion] VARCHAR(50) NULL,
    [Id_Site] INT NULL,
    [Nom] VARCHAR(50) NULL,
    [Prenom] VARCHAR(50) NULL,
    [Tel_Num_Fixe] VARCHAR(50) NULL,
    [Tel_Num_Mobile] VARCHAR(50) NULL,
    [Adresse_Email] VARCHAR(100) NULL,
    [Date_Derniere_Modification_MDP] DATETIME NULL,
    [Reset_Password_Token] VARCHAR(255) NULL,
    [Reset_Password_Expires] DATETIME NULL,
    [Est_Mot_De_Passe_Temporaire] BIT NULL DEFAULT(0),
    [Avatar_Utilisateur] VARCHAR(512) NULL,
    CONSTRAINT [PK_t_utilisateur] PRIMARY KEY ([Id_Utilisateur])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_utilisateur', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_utilisateur_Login' AND object_id = OBJECT_ID(N'dbo.t_utilisateur')) CREATE UNIQUE INDEX [UX_t_utilisateur_Login] ON dbo.[t_utilisateur]([Login]) WHERE [Login] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_notification', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification] (
    [Id_Notification] INT IDENTITY(1,1) NOT NULL,
    [Type] VARCHAR(32) NOT NULL,
    [Id_Alarme] INT NULL,
    [Titre] VARCHAR(128) NULL,
    [Message] VARCHAR(512) NOT NULL,
    [Payload_Json] NVARCHAR(MAX) NULL,
    [Priorite] INT NULL DEFAULT(0),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Est_Archive] BIT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_t_notification] PRIMARY KEY ([Id_Notification])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification_delivery] (
    [Id_Delivery] INT IDENTITY(1,1) NOT NULL,
    [Id_Notification] INT NOT NULL,
    [Id_Poste] INT NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Statut] VARCHAR(32) NOT NULL,
    [Nb_Tentatives] INT NOT NULL DEFAULT(0),
    [Derniere_Erreur] VARCHAR(255) NULL,
    [Date_Queue] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Envoi] DATETIME NULL,
    [Date_Ack_Agent] DATETIME NULL,
    [Date_Dernier_Event] DATETIME NULL,
    [Correlation_Id] VARCHAR(64) NULL,
    CONSTRAINT [PK_t_notification_delivery] PRIMARY KEY ([Id_Delivery])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_notification_delivery', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_NOTIFICATION_POSTE' AND object_id = OBJECT_ID(N'dbo.t_notification_delivery')) CREATE UNIQUE INDEX [UK_NOTIFICATION_POSTE] ON dbo.[t_notification_delivery]([Id_Notification], [Id_Poste]);
GO

IF OBJECT_ID(N'dbo.t_notification_event', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_notification_event] (
    [Id_Event] INT IDENTITY(1,1) NOT NULL,
    [Id_Delivery] INT NOT NULL,
    [Event_Type] VARCHAR(32) NOT NULL,
    [Event_Data] NVARCHAR(MAX) NULL,
    [Date_Event] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_notification_event] PRIMARY KEY ([Id_Event])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[liste_clients] (
    [Id_Client] INT IDENTITY(1,1) NOT NULL,
    [Nom] VARCHAR(100) NOT NULL,
    [Num_Compte] VARCHAR(50) NULL,
    [VigiServ_Derniere_Date_Heure] DATETIME NULL,
    [Vigitel_Derniere_Date_Heure] DATETIME NULL,
    CONSTRAINT [PK_liste_clients] PRIMARY KEY ([Id_Client])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.liste_clients', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_liste_clients_Num_Compte' AND object_id = OBJECT_ID(N'dbo.liste_clients')) CREATE UNIQUE INDEX [UX_liste_clients_Num_Compte] ON dbo.[liste_clients]([Num_Compte]) WHERE [Num_Compte] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_actionneur_type] (
    [Id_Actionneur_Type] INT IDENTITY(1,1) NOT NULL,
    [Type] INT NULL,
    [Description] VARCHAR(50) NULL,
    [Gere_Relais] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_actionneur_type] PRIMARY KEY ([Id_Actionneur_Type])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_actionneur_type', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_actionneur_type_Type' AND object_id = OBJECT_ID(N'dbo.t_actionneur_type')) CREATE UNIQUE INDEX [UX_t_actionneur_type_Type] ON dbo.[t_actionneur_type]([Type]) WHERE [Type] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_ancien_mot_de_passe', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_ancien_mot_de_passe] (
    [Id_Ancien_Mot_De_Passe] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Mot_De_Passe] VARCHAR(100) NULL,
    [Est_Premiere_Connexion] BIT NULL DEFAULT(0),
    CONSTRAINT [PK_t_ancien_mot_de_passe] PRIMARY KEY ([Id_Ancien_Mot_De_Passe])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_commentaire_acquittement_alarme', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commentaire_acquittement_alarme] (
    [Id_Commentaire] INT IDENTITY(1,1) NOT NULL,
    [Type_Commentaire] VARCHAR(50) NULL,
    [Texte] VARCHAR(255) NULL,
    CONSTRAINT [PK_t_commentaire_acquittement_alarme] PRIMARY KEY ([Id_Commentaire])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_etalon_type', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_etalon_type] (
    [Type_Etalon] VARCHAR(4) NOT NULL,
    [Nom] VARCHAR(30) NULL,
    [Descriptif] VARCHAR(100) NULL,
    [Est_Saisie_Module] BIT NULL DEFAULT(0),
    [Est_Sonde_Externe] BIT NULL DEFAULT(0),
    [Resolution] FLOAT NULL,
    CONSTRAINT [PK_t_etalon_type] PRIMARY KEY ([Type_Etalon])
  );
END;
GO
GO
IF NOT EXISTS (SELECT 1 FROM dbo.[t_etalon_type] WHERE [Type_Etalon] = N'ES') INSERT INTO dbo.[t_etalon_type] ([Type_Etalon], [Nom], [Descriptif], [Est_Saisie_Module], [Est_Sonde_Externe], [Resolution]) VALUES (N'ES', N'VigiTemp Type ES', N'Sonde talon radio type E', 1, 0, 0.05);
IF NOT EXISTS (SELECT 1 FROM dbo.[t_etalon_type] WHERE [Type_Etalon] = N'EX') INSERT INTO dbo.[t_etalon_type] ([Type_Etalon], [Nom], [Descriptif], [Est_Saisie_Module], [Est_Sonde_Externe], [Resolution]) VALUES (N'EX', N'Externe', N'Sonde externe', 1, 1, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.[t_etalon_type] WHERE [Type_Etalon] = N'SEF') INSERT INTO dbo.[t_etalon_type] ([Type_Etalon], [Nom], [Descriptif], [Est_Saisie_Module], [Est_Sonde_Externe], [Resolution]) VALUES (N'SEF', N'VigiTemp Type SEF', N'Sonde talon filaire ou filaire/radio avec prise RJ45', 1, 0, 0.02);
IF NOT EXISTS (SELECT 1 FROM dbo.[t_etalon_type] WHERE [Type_Etalon] = N'SPET') INSERT INTO dbo.[t_etalon_type] ([Type_Etalon], [Nom], [Descriptif], [Est_Saisie_Module], [Est_Sonde_Externe], [Resolution]) VALUES (N'SPET', N'Sonde etalon platine', N'Sonde etalon GSP platine', 1, 0, 0.02);
GO

IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_sonde_etat] (
    [Id_Sonde_Etat] INT IDENTITY(1,1) NOT NULL,
    [Etat_Sonde] VARCHAR(1) NULL,
    [Etat_Libelle] VARCHAR(50) NULL,
    CONSTRAINT [PK_t_sonde_etat] PRIMARY KEY ([Id_Sonde_Etat])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_sonde_etat', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_sonde_etat_Etat_Sonde' AND object_id = OBJECT_ID(N'dbo.t_sonde_etat')) CREATE UNIQUE INDEX [UX_t_sonde_etat_Etat_Sonde] ON dbo.[t_sonde_etat]([Etat_Sonde]) WHERE [Etat_Sonde] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_lieu_mail_tel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_mail_tel] (
    [Id_Mail_Tel] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NULL,
    [Ordre_Contact] INT NULL,
    [Id_Utilisateur] INT NULL,
    [Est_Via_Telephone] BIT NULL,
    [Est_Via_Email] BIT NULL,
    CONSTRAINT [PK_t_lieu_mail_tel] PRIMARY KEY ([Id_Mail_Tel])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_lieu_planning', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning] (
    [Id_Lieu_Planning] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NULL,
    [Est_Id_Jour] BIT NULL,
    [Est_Actif] BIT NULL CONSTRAINT [DF_t_lieu_planning_Est_Actif] DEFAULT(1),
    [Heure_Debut_Periode1] VARCHAR(4) NULL CONSTRAINT [DF_t_lieu_planning_Heure_Debut_Periode1] DEFAULT('0000'),
    [Heure_Fin_Periode1] VARCHAR(4) NULL CONSTRAINT [DF_t_lieu_planning_Heure_Fin_Periode1] DEFAULT('0000'),
    [Heure_Debut_Periode2] VARCHAR(4) NULL CONSTRAINT [DF_t_lieu_planning_Heure_Debut_Periode2] DEFAULT('0000'),
    [Heure_Fin_Periode2] VARCHAR(4) NULL CONSTRAINT [DF_t_lieu_planning_Heure_Fin_Periode2] DEFAULT('0000'),
    CONSTRAINT [PK_t_lieu_planning] PRIMARY KEY ([Id_Lieu_Planning])
  );
  CREATE UNIQUE INDEX [UX_t_lieu_planning_IdLieuJour] ON dbo.[t_lieu_planning]([Id_Lieu], [Est_Id_Jour]);
  CREATE INDEX [IDX_t_lieu_planning_Id_Lieu] ON dbo.[t_lieu_planning]([Id_Lieu]);
END;
GO
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_audit', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_audit] (
    [Id_Audit] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Debut_Changement] DATETIME NULL,
    [Date_Heure_Fin_Changement] DATETIME NULL,
    [Type] VARCHAR(64) NOT NULL,
    [Planning_Regle_Id] INT NULL,
    [Consigne_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Avant] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Avant] FLOAT NULL,
    [Consigne_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Sup_Apres] FLOAT NULL,
    [Tolerance_Surveillance_Inf_Apres] FLOAT NULL,
    CONSTRAINT [PK_t_lieu_planning_audit] PRIMARY KEY ([Id_Audit]),
    CONSTRAINT [CK_t_lieu_planning_audit_Type] CHECK ([Type] IN ('PLAN_APPLY'))
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_lieu_planning_regle', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_lieu_planning_regle] (
    [Id_Regle] INT IDENTITY(1,1) NOT NULL,
    [Id_Lieu] INT NOT NULL,
    [Actif] BIT NOT NULL DEFAULT(1),
    [Jour_Debut] TINYINT NOT NULL,
    [Heure_Debut] TIME NOT NULL,
    [Jour_Fin] TINYINT NOT NULL,
    [Heure_Fin] TIME NOT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Priorite] INT NOT NULL DEFAULT(0),
    [Tolerance_Sup_Calc] FLOAT NULL,
    [Tolerance_Inf_Calc] FLOAT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Maj] DATETIME NULL,
    [Retard_Alarme_Changement_Consigne] INT NULL,
    CONSTRAINT [PK_t_lieu_planning_regle] PRIMARY KEY ([Id_Regle])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_materiel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_materiel] (
    [Id_Materiel] INT IDENTITY(1,1) NOT NULL,
    [Ref_Commercial] VARCHAR(50) NOT NULL DEFAULT(''),
    [Designation] VARCHAR(100) NOT NULL DEFAULT(''),
    [Descriptif] VARCHAR(1000) NOT NULL DEFAULT(''),
    [Gamme] VARCHAR(10) NOT NULL DEFAULT(''),
    [Type] VARCHAR(10) NOT NULL DEFAULT(''),
    [Chemin_Image] VARCHAR(500) NULL,
    CONSTRAINT [PK_t_materiel] PRIMARY KEY ([Id_Materiel])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commande_materiel] (
    [Id_Commande_Materiel] INT IDENTITY(1,1) NOT NULL,
    [Reference_Commande] VARCHAR(64) NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Nom_Demandeur] VARCHAR(255) NOT NULL,
    [Email_Demandeur] VARCHAR(255) NULL,
    [Email_Commercial] VARCHAR(255) NOT NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Mode_Transmission] VARCHAR(64) NOT NULL,
    [Statut_Commande] VARCHAR(64) NOT NULL DEFAULT(N'BROUILLON'),
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Envoi] DATETIME NULL,
    [Id_Pdf] INT NULL,
    CONSTRAINT [PK_t_commande_materiel] PRIMARY KEY ([Id_Commande_Materiel]),
    CONSTRAINT [CK_t_commande_materiel_Mode_Transmission] CHECK ([Mode_Transmission] IN ('SMTP', 'MAILTO')),
    CONSTRAINT [CK_t_commande_materiel_Statut_Commande] CHECK ([Statut_Commande] IN ('BROUILLON', 'ENVOYEE', 'PREPAREE'))
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_commande_materiel', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_commande_materiel_Reference_Commande' AND object_id = OBJECT_ID(N'dbo.t_commande_materiel')) CREATE UNIQUE INDEX [UX_t_commande_materiel_Reference_Commande] ON dbo.[t_commande_materiel]([Reference_Commande]) WHERE [Reference_Commande] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_commande_materiel_ligne', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_commande_materiel_ligne] (
    [Id_Commande_Materiel_Ligne] INT IDENTITY(1,1) NOT NULL,
    [Id_Commande_Materiel] INT NOT NULL,
    [Id_Materiel] INT NOT NULL,
    [Ref_Commercial] VARCHAR(100) NOT NULL,
    [Designation] VARCHAR(255) NOT NULL,
    [Descriptif] NVARCHAR(MAX) NULL,
    [Gamme] VARCHAR(50) NULL,
    [Type] VARCHAR(50) NULL,
    [Quantite] INT NOT NULL,
    CONSTRAINT [PK_t_commande_materiel_ligne] PRIMARY KEY ([Id_Commande_Materiel_Ligne])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_configuration] (
    [Id_VigiLog_Configuration] INT IDENTITY(1,1) NOT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Description_Configuration] VARCHAR(255) NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Limite_Basse_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT(0),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT(1),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT(1),
    [Actif] BIT NOT NULL DEFAULT(1),
    [Id_Utilisateur_Creation] INT NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Maj] INT NULL,
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_configuration] PRIMARY KEY ([Id_VigiLog_Configuration])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_vigilog_configuration', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_configuration_Nom_Configuration' AND object_id = OBJECT_ID(N'dbo.t_vigilog_configuration')) CREATE UNIQUE INDEX [UX_t_vigilog_configuration_Nom_Configuration] ON dbo.[t_vigilog_configuration]([Nom_Configuration]) WHERE [Nom_Configuration] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog] (
    [Id_VigiLog] INT IDENTITY(1,1) NOT NULL,
    [Numero_Serie] VARCHAR(30) NOT NULL,
    [Modele] VARCHAR(50) NULL,
    [Libelle] VARCHAR(100) NULL,
    [Actif] BIT NOT NULL DEFAULT(1),
    [Date_Etalonnage] DATETIME NULL,
    [Date_Validite] DATE NULL,
    [Duree_Validite_Jours] INT NULL,
    [Err_Justesse] FLOAT NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Creation] INT NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Id_Utilisateur_Maj] INT NULL,
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog] PRIMARY KEY ([Id_VigiLog])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_vigilog', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.t_vigilog')) CREATE UNIQUE INDEX [UX_t_vigilog_Numero_Serie] ON dbo.[t_vigilog]([Numero_Serie]) WHERE [Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_usage_ponctuel] (
    [Id_VigiLog_Usage_Ponctuel] INT IDENTITY(1,1) NOT NULL,
    [Reference_Usage] VARCHAR(50) NOT NULL,
    [Id_VigiLog_Configuration] INT NULL,
    [Id_VigiLog] INT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Numero_Serie_VigiLog] VARCHAR(30) NOT NULL,
    [Nom_Lieu_Temporaire] VARCHAR(120) NOT NULL,
    [Statut] VARCHAR(30) NOT NULL,
    [Id_Utilisateur_Demarrage] INT NOT NULL,
    [Date_Heure_Demarrage] DATETIME NOT NULL,
    [Commentaire_Demarrage] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Arret] INT NULL,
    [Date_Heure_Arret] DATETIME NULL,
    [Commentaire_Arret] NVARCHAR(MAX) NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_usage_ponctuel] PRIMARY KEY ([Id_VigiLog_Usage_Ponctuel])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_usage_ponctuel_Reference_Usage' AND object_id = OBJECT_ID(N'dbo.t_vigilog_usage_ponctuel')) CREATE UNIQUE INDEX [UX_t_vigilog_usage_ponctuel_Reference_Usage] ON dbo.[t_vigilog_usage_ponctuel]([Reference_Usage]) WHERE [Reference_Usage] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_vigilog_tournee] (
    [Id_VigiLog_Tournee] INT IDENTITY(1,1) NOT NULL,
    [Reference_Tournee] VARCHAR(50) NOT NULL,
    [Id_VigiLog_Configuration] INT NULL,
    [Id_VigiLog] INT NULL,
    [Nom_Configuration] VARCHAR(100) NOT NULL,
    [Id_Site_Depart] INT NOT NULL,
    [Id_Site_Arrivee] INT NOT NULL,
    [Numero_Serie_VigiLog] VARCHAR(30) NOT NULL,
    [Statut] VARCHAR(30) NOT NULL,
    [Resultat_Feu] VARCHAR(10) NULL,
    [Id_Utilisateur_Depart] INT NOT NULL,
    [Date_Heure_Depart] DATETIME NOT NULL,
    [Id_Utilisateur_Arrivee] INT NULL,
    [Date_Heure_Arrivee] DATETIME NULL,
    [Consigne] DECIMAL(10,2) NULL,
    [Limite_Basse_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Basse] DECIMAL(10,2) NULL,
    [Limite_Haute_Active] BIT NOT NULL DEFAULT(0),
    [Limite_Haute] DECIMAL(10,2) NULL,
    [Frequence_Min] INT NOT NULL,
    [Retard_Alarme_Min] INT NOT NULL,
    [Delai_Demarrage_Min] INT NOT NULL DEFAULT(0),
    [Autorise_Arret_Bouton_Stop] BIT NOT NULL DEFAULT(1),
    [Reinitialise_Avec_Bouton_Start] BIT NOT NULL DEFAULT(1),
    [Nb_Mesures] INT NOT NULL DEFAULT(0),
    [Temperature_Min] DECIMAL(10,2) NULL,
    [Temperature_Moyenne] DECIMAL(10,2) NULL,
    [Temperature_Max] DECIMAL(10,2) NULL,
    [Duree_Hors_Limites_Secondes] INT NOT NULL DEFAULT(0),
    [Duree_Alarme_Secondes] INT NOT NULL DEFAULT(0),
    [Est_Depassement_Limites] BIT NOT NULL DEFAULT(0),
    [Est_Alarme] BIT NOT NULL DEFAULT(0),
    [Est_Acquittee] BIT NOT NULL DEFAULT(0),
    [Commentaire] NVARCHAR(MAX) NULL,
    [Commentaire_Acquittement] NVARCHAR(MAX) NULL,
    [Id_Utilisateur_Acquittement] INT NULL,
    [Date_Heure_Acquittement] DATETIME NULL,
    [Date_Heure_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Heure_Maj] DATETIME NULL,
    CONSTRAINT [PK_t_vigilog_tournee] PRIMARY KEY ([Id_VigiLog_Tournee])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_vigilog_tournee', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_vigilog_tournee_Reference_Tournee' AND object_id = OBJECT_ID(N'dbo.t_vigilog_tournee')) CREATE UNIQUE INDEX [UX_t_vigilog_tournee_Reference_Tournee] ON dbo.[t_vigilog_tournee]([Reference_Tournee]) WHERE [Reference_Tournee] IS NOT NULL;
GO

IF DB_ID(N'vigi_mesures') IS NULL
BEGIN
  CREATE DATABASE [vigi_mesures];
END;
GO
USE [vigi_mesures];
GO

IF OBJECT_ID(N'dbo.tm_graphique', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_graphique] (
    [Id_Graphique] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Id_Sonde] INT NULL,
    [Id_Lieu] INT NOT NULL DEFAULT(0),
    [Est_Valeur_Null] BIT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] TINYINT NOT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    CONSTRAINT [PK_tm_graphique] PRIMARY KEY ([Id_Graphique], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null], [Est_Etat_Alarme])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_journal', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal] (
    [Id_Serveur_BDD] INT NOT NULL,
    [Id_Journal] INT IDENTITY(1,1) NOT NULL,
    [Code_Journal] VARCHAR(50) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Nom_Utilisateur] VARCHAR(50) NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Journal] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Commentaire_Utilisateur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_journal] PRIMARY KEY ([Id_Serveur_BDD], [Id_Journal])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_journal_code', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_code] (
    [Code_Journal] VARCHAR(50) NOT NULL,
    [Commentaire] VARCHAR(200) NULL,
    CONSTRAINT [PK_tm_journal_code] PRIMARY KEY ([Code_Journal])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_compteur_id_table', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_compteur_id_table] (
    [Id_Serveur_BDD] INT NOT NULL,
    [Nom_Table] VARCHAR(100) NOT NULL,
    [Compteur_Id] INT NULL,
    CONSTRAINT [PK_tm_compteur_id_table] PRIMARY KEY ([Id_Serveur_BDD], [Nom_Table])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures] (
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Est_Valeur_Memoire] BIT NOT NULL DEFAULT(0),
    [Nb_Decimal] INT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [COM_sonde] FLOAT NULL,
    [Est_Mesure_Repeteur_GSO] FLOAT NULL CONSTRAINT [DF_tm_mesures_Est_Mesure_Repeteur_GSO] DEFAULT(0),
    [Id_Lieu] INT NOT NULL DEFAULT(0),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_Etat_Alarme] BIT NOT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    [Rssi] VARCHAR(10) NULL,
    [Tension] VARCHAR(10) NULL,
    [Planning_Regle_Existe] BIT NOT NULL DEFAULT(0),
    [Planning_Actif] BIT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_tm_mesures] PRIMARY KEY ([Id_Serveur_BDD], [Id_Mesure], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso] (
    [Id_mesures_gso] INT IDENTITY(1,1) NOT NULL,
    [id_capteur] VARCHAR(50) NOT NULL,
    [tep] FLOAT NULL,
    [unite] VARCHAR(10) NULL,
    [date_mesure] DATETIME NOT NULL,
    [trame] BINARY(8) NULL,
    [rssi] VARCHAR(10) NULL,
    [tension] VARCHAR(10) NULL,
    [COM_sonde] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_gso] PRIMARY KEY ([id_capteur], [date_mesure])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_journal_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_histo] (
    [Id_Journal_Histo] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Id_Journal] INT NOT NULL DEFAULT(0),
    [Code_Journal] VARCHAR(50) NULL,
    [Commentaire] NVARCHAR(MAX) NULL,
    [Nom_Utilisateur] VARCHAR(50) NULL,
    [Profil_Utilisateur] VARCHAR(50) NULL,
    [Date_Heure_Journal] DATETIME NULL,
    [Id_Lieu] INT NULL,
    [Commentaire_Utilisateur] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_tm_journal_histo] PRIMARY KEY ([Id_Journal_Histo], [Id_Serveur_BDD], [Id_Journal])
  );
END;
GO
IF OBJECT_ID(N'dbo.tm_mesures_ajustage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_ajustage] (
    [Id_Mesure_Ajustage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Adresse_Sonde] VARCHAR(50) NOT NULL CONSTRAINT [DF_tm_mesures_ajustage_Adresse_Sonde] DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL CONSTRAINT [DF_tm_mesures_ajustage_Est_Valeur_Null] DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_ajustage] PRIMARY KEY ([Id_Mesure_Ajustage], [Id_Serveur_BDD])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_ajustage_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_ajustage_etalon] (
    [Id_Mesure_Ajustage_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Est_Valeur_Null] TINYINT NOT NULL CONSTRAINT [DF_tm_mesures_ajustage_etalon_Est_Valeur_Null] DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_ajustage_etalon] PRIMARY KEY ([Id_Mesure_Ajustage_Etalon], [Id_Serveur_BDD])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_etalon] (
    [Id_Mesure_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL,
    [Message_Erreur] VARCHAR(50) NOT NULL DEFAULT(''),
    CONSTRAINT [PK_tm_mesures_etalon] PRIMARY KEY ([Id_Mesure_Etalon], [Id_Serveur_BDD])
  );
  CREATE INDEX [IDX_tm_mesures_etalon_Valeur_Brute] ON dbo.[tm_mesures_etalon]([Valeur_Brute]);
  CREATE INDEX [IDX_tm_mesures_etalon_Etalon_Numero_Serie] ON dbo.[tm_mesures_etalon]([Etalon_Numero_Serie]);
  CREATE INDEX [IDX_tm_mesures_etalon_Est_Valeur_Null] ON dbo.[tm_mesures_etalon]([Est_Valeur_Null]);
  CREATE INDEX [IDX_tm_mesures_etalon_Date_Heure] ON dbo.[tm_mesures_etalon]([Date_Heure]);
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_etalonnage', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_etalonnage] (
    [Id_Mesure_Etalonnage] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Sonde_Numero_serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [Numero_Ordre] INT NULL,
    [Mesure_Sonde] FLOAT NULL,
    [Mesure_Etalon] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_etalonnage] PRIMARY KEY ([Id_Mesure_Etalonnage], [Id_Serveur_BDD])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_histo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_histo] (
    [Id_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Date_Heure_Mesure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Nb_decimal] TINYINT NULL,
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Id_Lieu] INT NOT NULL DEFAULT(0),
    [Est_Valeur_Null] TINYINT NOT NULL DEFAULT(0),
    [Frequence] INT NULL,
    [Est_En_Alarme] BIT NULL DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Moyenne] FLOAT NULL,
    CONSTRAINT [PK_tm_mesures_histo] PRIMARY KEY ([Id_Mesure], [Id_Serveur_BDD], [Date_Heure_Mesure], [Id_Lieu], [Est_Valeur_Null])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test] (
    [Id_Mesure_Test] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT(0),
    [Nombre_Recu] INT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_test] PRIMARY KEY ([Id_Mesure_Test], [Id_Serveur_BDD])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.tm_mesures_test', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_tm_mesures_test_Sonde_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.tm_mesures_test')) CREATE UNIQUE INDEX [UX_tm_mesures_test_Sonde_Numero_Serie] ON dbo.[tm_mesures_test]([Sonde_Numero_Serie]) WHERE [Sonde_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_test_etalon] (
    [Id_Mesure_Test_Etalon] INT IDENTITY(1,1) NOT NULL,
    [Id_Serveur_BDD] INT NOT NULL DEFAULT(0),
    [Valeur_Brute] FLOAT NOT NULL,
    [Etalon_Numero_Serie] VARCHAR(50) NOT NULL DEFAULT(''),
    [Est_Valeur_Null] TINYINT NOT NULL,
    [Date_Heure] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Nombre_Total] INT NOT NULL DEFAULT(0),
    [Nombre_Recu] INT NOT NULL DEFAULT(0),
    CONSTRAINT [PK_tm_mesures_test_etalon] PRIMARY KEY ([Id_Mesure_Test_Etalon], [Id_Serveur_BDD])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.tm_mesures_test_etalon', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_tm_mesures_test_etalon_Etalon_Numero_Serie' AND object_id = OBJECT_ID(N'dbo.tm_mesures_test_etalon')) CREATE UNIQUE INDEX [UX_tm_mesures_test_etalon_Etalon_Numero_Serie] ON dbo.[tm_mesures_test_etalon]([Etalon_Numero_Serie]) WHERE [Etalon_Numero_Serie] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.tm_mode_degrade', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mode_degrade] (
    [Id_Mode_Degrade] INT IDENTITY(1,1) NOT NULL,
    [Id_Utilisateur] INT NULL,
    [Date_Heure_Creation] DATETIME NULL,
    [Requete_SQL] VARCHAR(500) NULL,
    [Est_Archivee] BIT NOT NULL DEFAULT(0),
    [Date_Heure_Archive] DATETIME NULL,
    CONSTRAINT [PK_tm_mode_degrade] PRIMARY KEY ([Id_Mode_Degrade])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_parametre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_parametre] (
    [Id_Parametre] INT IDENTITY(1,1) NOT NULL,
    [Cle_Parametre] VARCHAR(20) NOT NULL,
    [Valeur_Parametre] VARCHAR(50) NULL,
    [Groupe_Parametre] VARCHAR(50) NULL,
    [Commentaire_Parametre] VARCHAR(100) NULL,
    CONSTRAINT [PK_tm_parametre] PRIMARY KEY ([Id_Parametre], [Cle_Parametre])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_vigilog_mesure] (
    [Id_VigiLog_Mesure] INT IDENTITY(1,1) NOT NULL,
    [Id_VigiLog_Tournee] INT NOT NULL,
    [Numero_Ordre] INT NULL,
    [Date_Heure_Mesure] DATETIME NOT NULL,
    [Valeur] DECIMAL(10,2) NULL,
    [Est_Hors_Limites] BIT NOT NULL DEFAULT(0),
    [Est_En_Alarme] BIT NOT NULL DEFAULT(0),
    [Est_Marqueur] BIT NOT NULL DEFAULT(0),
    [Details] VARCHAR(200) NULL,
    [Date_Heure_Import] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_tm_vigilog_mesure] PRIMARY KEY ([Id_VigiLog_Mesure])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.tm_vigilog_mesure', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_tm_vigilog_mesure_unique' AND object_id = OBJECT_ID(N'dbo.tm_vigilog_mesure')) CREATE UNIQUE INDEX [UK_tm_vigilog_mesure_unique] ON dbo.[tm_vigilog_mesure]([Id_VigiLog_Tournee], [Date_Heure_Mesure], [Numero_Ordre]);
GO

IF OBJECT_ID(N'dbo.tm_journal_commentaire_libre', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_journal_commentaire_libre] (
    [Id_Commentaire_Journal] INT IDENTITY(1,1) NOT NULL,
    [Code_Journal] VARCHAR(32) NOT NULL,
    [Commentaire] NVARCHAR(MAX) NOT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Modification] DATETIME NULL,
    CONSTRAINT [PK_tm_journal_commentaire_libre] PRIMARY KEY ([Id_Commentaire_Journal])
  );
END;
GO
GO

IF DB_ID(N'vigi_chat') IS NULL
BEGIN
  CREATE DATABASE [vigi_chat];
END;
GO
USE [vigi_chat];
GO

IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_conversation] (
    [Id_Conversation] INT IDENTITY(1,1) NOT NULL,
    [Type] VARCHAR(10) NOT NULL,
    [Titre] VARCHAR(128) NULL,
    [DM_Key] VARCHAR(64) NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_conversation] PRIMARY KEY ([Id_Conversation])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_conversation', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_t_conversation_DM_Key' AND object_id = OBJECT_ID(N'dbo.t_conversation')) CREATE UNIQUE INDEX [UX_t_conversation_DM_Key] ON dbo.[t_conversation]([DM_Key]) WHERE [DM_Key] IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_conversation_participant] (
    [Id_Participant] INT IDENTITY(1,1) NOT NULL,
    [Id_Conversation] INT NOT NULL,
    [Id_Utilisateur] INT NOT NULL,
    [Last_Read_Msg_Id] INT NULL,
    [Date_Ajout] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_conversation_participant] PRIMARY KEY ([Id_Participant])
  );
END;
GO
GO
IF OBJECT_ID(N'dbo.t_conversation_participant', N'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UK_t_conversation_participant_1' AND object_id = OBJECT_ID(N'dbo.t_conversation_participant')) CREATE UNIQUE INDEX [UK_t_conversation_participant_1] ON dbo.[t_conversation_participant]([Id_Conversation], [Id_Utilisateur]);
GO

IF OBJECT_ID(N'dbo.t_message', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_message] (
    [Id_Message] INT IDENTITY(1,1) NOT NULL,
    [Id_Conversation] INT NOT NULL,
    [Sender_Id] INT NOT NULL,
    [Contenu] NVARCHAR(MAX) NOT NULL,
    [Date_Creation] DATETIME NOT NULL DEFAULT(GETDATE()),
    [Date_Modification] DATETIME NULL,
    [Date_Suppression] DATETIME NULL,
    CONSTRAINT [PK_t_message] PRIMARY KEY ([Id_Message])
  );
END;
GO
GO

IF OBJECT_ID(N'dbo.t_message_attachment', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[t_message_attachment] (
    [Id_Attachment] INT IDENTITY(1,1) NOT NULL,
    [Id_Message] INT NOT NULL,
    [File_Name] VARCHAR(255) NOT NULL,
    [File_Path] VARCHAR(512) NOT NULL,
    [File_Size] INT NOT NULL,
    [Mime_Type] VARCHAR(128) NOT NULL,
    [Date_Upload] DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT [PK_t_message_attachment] PRIMARY KEY ([Id_Attachment])
  );
END;
GO
GO

USE [vigi_main];
GO

-- Donnees minimales obligatoires main
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'Administrateurs') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'Administrateurs', NULL, 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'Consultation + Acquittement') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'Consultation + Acquittement', NULL, 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'VIGITEL') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'VIGITEL', N'', 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'ADMINistrateurs +') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'ADMINistrateurs +', N'', 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'Consultation + Acquittement + Desactivation') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'Consultation + Acquittement + Desactivation', N'', 0, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.t_profil WHERE Profil_Utilisateur = N'Test ajout') INSERT INTO dbo.t_profil (Profil_Utilisateur, Commentaire, Est_MC2, Est_Archive) VALUES (N'Test ajout', NULL, 0, 0);
GO

SET IDENTITY_INSERT dbo.t_actionneur_type ON;
MERGE dbo.t_actionneur_type AS target
USING (VALUES
  (1, 4, N'IACTX Lumineux', 1),
  (2, 5, N'IACTX Lumineux contact', 1),
  (3, 6, N'IACTX Contact', 1),
  (4, 7, N'IACTX Sonore', 1)
) AS source (Id_Actionneur_Type, Type, Description, Gere_Relais)
ON target.Id_Actionneur_Type = source.Id_Actionneur_Type
WHEN MATCHED THEN UPDATE SET Type = source.Type, Description = source.Description, Gere_Relais = source.Gere_Relais
WHEN NOT MATCHED THEN INSERT (Id_Actionneur_Type, Type, Description, Gere_Relais) VALUES (source.Id_Actionneur_Type, source.Type, source.Description, source.Gere_Relais);
SET IDENTITY_INSERT dbo.t_actionneur_type OFF;
GO

SET IDENTITY_INSERT dbo.t_module_type ON;
MERGE dbo.t_module_type AS target
USING (VALUES
  (1, N'BIN', N'Boitier filaire avec prise DB9 (port serie)', 0),
  (2, N'BIR (filaire)', N'Boitier reseau filaire avec pris RJ45 (prise reseau)', 1),
  (3, N'BTR', N'Boitier radio avec prise DB9 (port serie)', 0),
  (4, N'BIR (radio)', N'Boitier reseau radio avec prise RJ45 (port serie)', 1),
  (5, N'CORONIS', N'Boitier radio CORONIS avec prise DB9 (port serie)', 0),
  (6, N'MRH', N'Boitier MRH', 0),
  (7, N'ITR', N'Module port serie', 0),
  (8, N'IETH', N'Module ethernet', 0)
) AS source (Id_Module_Type, Libelle_Type_Module, Libelle_Module, Est_Flag_Affiche_Plan)
ON target.Id_Module_Type = source.Id_Module_Type
WHEN MATCHED THEN UPDATE SET Libelle_Type_Module = source.Libelle_Type_Module, Libelle_Module = source.Libelle_Module, Est_Flag_Affiche_Plan = source.Est_Flag_Affiche_Plan
WHEN NOT MATCHED THEN INSERT (Id_Module_Type, Libelle_Type_Module, Libelle_Module, Est_Flag_Affiche_Plan) VALUES (source.Id_Module_Type, source.Libelle_Type_Module, source.Libelle_Module, source.Est_Flag_Affiche_Plan);
SET IDENTITY_INSERT dbo.t_module_type OFF;
GO

MERGE dbo.t_etalon_type AS target
USING (VALUES
  (N'ES', N'VigiTemp Type ES', N'Sonde talon radio type E', 1, 0, 0.05),
  (N'EX', N'Externe', N'Sonde externe', 1, 1, 0),
  (N'SEF', N'VigiTemp Type SEF', N'Sonde talon filaire ou filaire/radio avec prise RJ45', 1, 0, 0.02),
  (N'SPET', N'Sonde etalon platine', N'Sonde etalon GSP platine', 1, 0, 0.02)
) AS source (Type_Etalon, Nom, Descriptif, Est_Saisie_Module, Est_Sonde_Externe, Resolution)
ON target.Type_Etalon = source.Type_Etalon
WHEN MATCHED THEN UPDATE SET Nom = source.Nom, Descriptif = source.Descriptif, Est_Saisie_Module = source.Est_Saisie_Module, Est_Sonde_Externe = source.Est_Sonde_Externe, Resolution = source.Resolution
WHEN NOT MATCHED THEN INSERT (Type_Etalon, Nom, Descriptif, Est_Saisie_Module, Est_Sonde_Externe, Resolution) VALUES (source.Type_Etalon, source.Nom, source.Descriptif, source.Est_Saisie_Module, source.Est_Sonde_Externe, source.Resolution);
GO
DECLARE @BootstrapAuth TABLE (Code NVARCHAR(50), Libelle NVARCHAR(100));
INSERT INTO @BootstrapAuth (Code, Libelle) VALUES
(N'ACCES_DASHBOARD_UTILISATEUR',N'Acces dashboard utilisateur'),
(N'ACCES_TABLEAU_BORD_UTILISATEUR',N'Acces tableau de bord utilisateur'),
(N'ACCES_DASHBOARD_USER',N'Acces dashboard user'),
(N'ACCES_SURVEILLANCE',N'Acces surveillance'),
(N'LIEU_VISUALISER',N'Visualiser les lieux'),
(N'ALARMES_GERER',N'Gerer les alarmes'),
(N'ACCES_DASHBOARD_ADMIN',N'Acces dashboard admin'),
(N'ACCES_TABLEAU_BORD_ADMIN',N'Acces tableau de bord admin'),
(N'ACCES_ADMIN',N'Acces admin'),
(N'ACCES_PARAMETRAGE_GENERAL',N'Acces parametrage general'),
(N'PARAMETRAGE_GENERAL',N'Parametrage general'),
(N'GERER_PROFIL',N'Gerer les profils'),
(N'PARAMETRES_GERER',N'Gerer les parametres'),
(N'ACQUITTER_ALARME',N'Acquitter alarme'),
(N'ACCES_ACQUITTEMENT_ALARME',N'Acces acquittement alarme'),
(N'DESACTIVER_LIEU',N'Desactiver lieu'),
(N'ACCES_DESACTIVATION_LIEU',N'Acces desactivation lieu'),
(N'LIEU_ACTIV_DESACT',N'Activer/desactiver lieu'),
(N'PARAMETRER_LIEU',N'Parametrer lieu'),
(N'ACCES_PARAMETRAGE_LIEU',N'Acces parametrage lieu'),
(N'LIEU_GERER',N'Gerer les lieux'),
(N'PARAMETRAGE_MATERIEL',N'Parametrage materiel'),
(N'ACCES_PARAMETRAGE_MATERIEL',N'Acces parametrage materiel'),
(N'ACCES_METROLOGIE',N'Acces metrologie'),
(N'ACCES_CONVERSATION',N'Acces conversation'),
(N'MODULE_CONVERSATION',N'Module conversation'),
(N'REALISER_AJUSTAGE_ETALONNAGE',N'Realiser ajustage etalonnage'),
(N'ACCES_AJUSTAGE_ETALONNAGE',N'Acces ajustage etalonnage');
INSERT INTO dbo.t_autorisation (Code_Autorisation, Libelle_Autorisation, Commentaire) SELECT Code, Libelle, Libelle FROM @BootstrapAuth a WHERE NOT EXISTS (SELECT 1 FROM dbo.t_autorisation x WHERE x.Code_Autorisation = a.Code);
GO
DECLARE @AdminProfilId INT = (SELECT TOP 1 Id_Profil FROM dbo.t_profil WHERE Profil_Utilisateur = N'Administrateurs');
INSERT INTO dbo.t_liaison_profil_autorisation (Id_Profil, Id_Autorisation) SELECT @AdminProfilId, a.Id_Autorisation FROM dbo.t_autorisation a WHERE @AdminProfilId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.t_liaison_profil_autorisation l WHERE l.Id_Profil = @AdminProfilId AND l.Id_Autorisation = a.Id_Autorisation);
GO
IF NOT EXISTS (SELECT 1 FROM dbo.t_utilisateur WHERE Login = N'admin') INSERT INTO dbo.t_utilisateur (Login, Mot_De_Passe, Est_Archive, Profil_Utilisateur, Est_Mot_De_Passe_Temporaire, Date_Creation, Date_Derniere_Modification_MDP) VALUES (N'admin', N'$2b$10$EPQPVuaZ6RX4JhMpgR8BD.44ZEuC9OsH7hRMdt2j/GO64eWJcA7.W', 0, N'Administrateurs', 1, CAST(GETDATE() AS DATE), GETDATE());
ELSE UPDATE dbo.t_utilisateur SET Mot_De_Passe = N'$2b$10$p794ptDulNuN5Md2j3Y6Ge2wEYRjaG3Er8CexJ8RkrD4er1A2AhXS', Est_Mot_De_Passe_Temporaire = 1, Profil_Utilisateur = COALESCE(Profil_Utilisateur, N'Administrateurs'), Est_Archive = 0 WHERE Login = N'admin' AND (Mot_De_Passe IS NULL OR Est_Mot_De_Passe_Temporaire = 1);
GO

USE [vigi_main];
GO

-- =====================================================================
-- ALIGNEMENT SQL SERVER <-> SCHEMA PRISMA (Mise a jour 2026-02)
-- Script idempotent (complement de seed)
-- =====================================================================

-- t_autorisation: suppression anciens flags
GO

-- t_lieu
IF OBJECT_ID('dbo.t_lieu_planning_regle', 'U') IS NOT NULL
BEGIN
  UPDATE l
  SET Planning_Regle_Existe = CASE
    WHEN EXISTS (SELECT 1 FROM dbo.t_lieu_planning_regle r WHERE r.Id_Lieu = l.Id_Lieu) THEN 1
    ELSE 0
  END
  FROM dbo.t_lieu l;
END;
GO

-- t_module / t_parametre / t_utilisateur
GO

-- t_sonde / t_sonde_type
IF OBJECT_ID('dbo.t_sonde', 'U') IS NOT NULL
BEGIN
END;
GO
IF OBJECT_ID('dbo.t_sonde_type', 'U') IS NOT NULL
BEGIN

  MERGE dbo.t_sonde_type AS target
  USING (VALUES
    (1,'E','Sonde radio relais type E',1,0,'CLASSIC'),
    (2,'G','Sonde radio relais type G',1,0,'CLASSIC'),
    (3,'H','Sonde radio relais type H',1,0,'CLASSIC'),
    (4,'I','Sonde radio de type I',0,0,'CLASSIC'),
    (5,'R','Sonde radio',0,0,'CLASSIC'),
    (6,'V','Sonde filaire',0,0,'CLASSIC'),
    (9,'SOIT','Gemsense One Temperature interne',0,0,'GSO'),
    (10,'SOIH','Gemsense One Temperature & humidite interne',0,1,'GSO'),
    (11,'SOET','Gemsense One Temperature externe',0,0,'GSO'),
    (12,'SOEH','Gemsense One Temperature & humidite externe',0,1,'GSO'),
    (13,'SPNB','Gemsense Pro Numerique blanc',0,0,'GSP'),
    (14,'SPNG','Gemsense Pro Numerique gris',0,0,'GSP'),
    (15,'SPPS','Gemsense Pro platine',0,0,'GSP'),
    (16,'SPAL','Gemsense Pro platine alimentaire',0,0,'GSP'),
    (17,'SPPC','Gemsense Pro platine contact',0,0,'GSP'),
    (18,'SPAU','Gemsense Pro platine autoclave',0,0,'GSP'),
    (19,'SPCF','Gemsense Pro platine chambre froide',0,0,'GSP'),
    (20,'SPMI','Gemsense Pro platine micro-capteur',0,0,'GSP'),
    (21,'SPCO','Gemsense Pro CO2',0,0,'GSP'),
    (22,'SPHY','Gemsense Pro hygrometrie',0,0,'GSP'),
    (23,'SPTH','Gemsense Pro thermocouple',0,0,'GSP'),
    (24,'SPDI','Gemsense Pro pression differentielle',0,0,'GSP'),
    (25,'SPAT','Gemsense Pro pression atmospherique',0,0,'GSP'),
    (26,'SPLU','Gemsense Pro lumiere',0,0,'GSP'),
    (27,'SP01','Gemsense Pro 0-1 Volt',0,0,'GSP'),
    (28,'SP42','Gemsense Pro 4-20 mA',0,0,'GSP'),
    (29,'SPOF','Gemsense Pro NO NF',0,0,'GSP'),
    (30,'SPXB','Gemsense Pro Ethernet numerique blanc',0,0,'GSP'),
    (31,'SPXG','Gemsense Pro Ethernet numerique gris',0,0,'GSP'),
    (32,'SPXP','Gemsense Pro Ethernet platine',0,0,'GSP'),
    (33,'SPFB','Gemsense Pro filaire numerique blanc',0,0,'GSP'),
    (34,'SPFG','Gemsense Pro filaire numerique gris',0,0,'GSP'),
    (35,'SPFP','Gemsense Pro filaire platine',0,0,'GSP')
  ) AS source (Id_Sonde_Type, Sonde_Type, Libelle_Sonde_Type, Est_Gestion_Relais, Est_Double_Capteur, Famille_Sonde)
  ON target.Sonde_Type = source.Sonde_Type
  WHEN MATCHED THEN
    UPDATE SET
      target.Libelle_Sonde_Type = source.Libelle_Sonde_Type,
      target.Est_Gestion_Relais = source.Est_Gestion_Relais,
      target.Est_Double_Capteur = source.Est_Double_Capteur,
      target.Famille_Sonde = source.Famille_Sonde
  WHEN NOT MATCHED BY TARGET THEN
    INSERT (Sonde_Type, Libelle_Sonde_Type, Est_Gestion_Relais, Est_Double_Capteur, Famille_Sonde)
    VALUES (source.Sonde_Type, source.Libelle_Sonde_Type, source.Est_Gestion_Relais, source.Est_Double_Capteur, source.Famille_Sonde);
END;
GO

-- templates de lieu
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
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_NOTIFY_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_NOTIFY_PERCENT','50','Seuil (%) notification batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='NOTIFICATIONS' AND Mot_Cle='GSP_BATTERY_EMAIL_PERCENT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('NOTIFICATIONS','GSP_BATTERY_EMAIL_PERCENT','25','Seuil (%) envoi email batterie faible sonde GSP');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='ENABLED')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','ENABLED','0','Activation envoi recap mensuel stats');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='RECIPIENTS')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','RECIPIENTS','','Destinataires separes par ; ou ,');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='DAY_OF_MONTH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','DAY_OF_MONTH','1','Jour du mois (1..31, replie au dernier jour du mois si necessaire)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='HOUR_LOCAL')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','HOUR_LOCAL','8','Heure locale (0..23)');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_LOCATION_SUMMARY')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_LOCATION_SUMMARY','1','Inclure lieu/site/groupe');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_SETTINGS_SUMMARY')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_SETTINGS_SUMMARY','1','Inclure consignes/tolerances/frequence/retards');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_MAX')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_MAX','1','Inclure mesure max');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_MIN')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_MIN','1','Inclure mesure min');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_AVG')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_AVG','1','Inclure moyenne');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_COUNT')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_COUNT','1','Inclure nombre alarmes');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_HIGH_DURATION')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_HIGH_DURATION','1','Inclure duree alarme haute');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_ALARM_LOW_DURATION')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_ALARM_LOW_DURATION','1','Inclure duree alarme basse');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_OVER_HIGH_NO_ALARM')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_OVER_HIGH_NO_ALARM','1','Inclure depassement haut sans alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='INCLUDE_OVER_LOW_NO_ALARM')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','INCLUDE_OVER_LOW_NO_ALARM','1','Inclure depassement bas sans alarme');
IF NOT EXISTS (SELECT 1 FROM dbo.t_parametre WHERE Section='STATISTICS_MONTHLY_REPORT' AND Mot_Cle='LAST_SENT_MONTH')
  INSERT INTO dbo.t_parametre(Section, Mot_Cle, Valeur, Commentaire) VALUES ('STATISTICS_MONTHLY_REPORT','LAST_SENT_MONTH','','Dernier mois envoye au format YYYY-MM');
GO

-- Parametres historiques du seed MySQL requis par les services legacy
MERGE dbo.t_parametre AS target
USING (VALUES
  (N'CFR21', N'ACTIVATION_EXPIRATION_MOT_DE_PASSE', N'true', N'Activer l''expiration des mots de passe (CFR21)'),
  (N'CFR21', N'ACTIVATION_NORME_CFR21', N'1', N'Activer la conformite CFR21 (saisie des configurations)'),
  (N'CFR21', N'EVENEMENTS', N'1', N'Activation des evenements'),
  (N'CFR21', N'JOURS_VALIDITE_MOT_DE_PASSE', N'90', NULL),
  (N'CFR21', N'MOT_DE_PASSE_PERMANENT', N'1', N'Le mot de passe ne peut pas être changé par l''utilisateur'),
  (N'CFR21', N'MOT_DE_PASSE_REUTILISABLE', N'0', N'L''utilisateur ne peut pas réutiliser un ancien mot de passe'),
  (N'CFR21', N'NOMBRE_TENTATIVES_MOT_DE_PASSE', N'3', N'Nombre de tentatives autorisées avant verrouillage du compte'),
  (N'CFR21', N'REACTIVATION_ALARME_SONORE', N'500', N'Délai de réactivation de l''alarme sonore en millisecondes'),
  (N'CFR21', N'SECURITE', N'0', N'Mode sécurité renforcé'),
  (N'CFR21', N'TEMPS_DECONNEXION_MINUTES', N'20', N'Temps d''inactivité avant deconnexion automatique en minutes'),
  (N'CFR21', N'VALIDITE_MOT_DE_PASSE_JOURS', N'90', N'Durée de validité du mot de passe en jours'),
  (N'MYSQL', N'MOT_DE_PASSE_CRYPTE', N'1', N'Le mot de passe MySQL est crypté'),
  (N'MYSQL', N'VERSION_BASE_DONNEES', N'20200201', N'Version de la base de données (utile pour les mises à jour)'),
  (N'SAUVEGARDES', N'ADRESSE_IP_MACHINE', N'', N'Adresse IP de la machine serveur'),
  (N'SAUVEGARDES', N'CONSTRUCTION_BATCH', N'', N'Script de construction batch pour les sauvegardes'),
  (N'SAUVEGARDES', N'DOSSIER_MYSQL', N'', N'Chemin du dossier d''installation MySQL'),
  (N'SAUVEGARDES', N'DOSSIER_SAUVEGARDE', N'', N'Chemin du dossier de sauvegarde'),
  (N'SAUVEGARDES', N'LISTE_FICHIERS', N'', N'Liste des fichiers de sauvegarde avec détails'),
  (N'SAUVEGARDES', N'NOM_TACHE', N'', N'Nom de la tâche planifiée de sauvegarde'),
  (N'SECURITE', N'LONGUEUR_MINIMALE_MOT_DE_PASSE', N'8', N'Nombre minimum de caractères pour un mot de passe'),
  (N'SECURITE', N'NOMBRE_MIN_CARACTERES_SPECIAUX', N'1', N'Nombre minimum de caractères spéciaux requis (!@#$%^&* etc.)'),
  (N'SECURITE', N'NOMBRE_MIN_CHIFFRES', N'1', N'Nombre minimum de chiffres requis'),
  (N'SECURITE', N'NOMBRE_MIN_LETTRES_MAJUSCULES', N'1', N'Nombre minimum de lettres majuscules requises'),
  (N'SECURITE', N'NOMBRE_MIN_LETTRES_MINUSCULES', N'1', N'Nombre minimum de lettres minuscules requises'),
  (N'SECURITE_EMAIL', N'SMTP_ACTIVATION', N'true', N'Activer l''envoi d''emails'),
  (N'SECURITE_EMAIL', N'SMTP_EXPEDITEUR', N'', N'Adresse email expediteur (doit correspondre au domaine SMTP)'),
  (N'SECURITE_EMAIL', N'SMTP_MOT_DE_PASSE', N'', N'Mot de passe SMTP'),
  (N'SECURITE_EMAIL', N'SMTP_PORT', N'587', N'Port SMTP (587 pour TLS, 465 pour SSL)'),
  (N'SECURITE_EMAIL', N'SMTP_SERVEUR', N'', N'Serveur SMTP pour l''envoi d''emails'),
  (N'SECURITE_EMAIL', N'SMTP_UTILISATEUR', N'', N'Utilisateur SMTP'),
  (N'SECURITE_MOT_DE_PASSE', N'LONGUEUR_MINIMALE', N'8', N'Longueur minimale du mot de passe'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CARACTERES_SPECIAUX', N'1', N'Nombre minimum de caracteres speciaux'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CHIFFRES', N'1', N'Nombre minimum de chiffres'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MAJUSCULES', N'1', N'Nombre minimum de majuscules'),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MINUSCULES', N'1', N'Nombre minimum de minuscules'),
  (N'STATISTIQUE', N'ENTETE_RAPPORT_UTILISATEUR_221', N'', N'En-tête du rapport utilisateur 221'),
  (N'STATISTIQUE', N'ENTETE_RAPPORT_UTILISATEUR_81', N'', N'En-tête du rapport utilisateur 81'),
  (N'STATISTIQUE', N'HEURE_RAPPORT_UTILISATEUR_221', N'', N'Heure du rapport utilisateur 221'),
  (N'STATISTIQUE', N'HEURE_RAPPORT_UTILISATEUR_81', N'', N'Heure du rapport utilisateur 81'),
  (N'STATISTIQUE', N'ORIENTATION_RAPPORT_221', N'', N'Orientation du rapport 221'),
  (N'STATISTIQUE', N'ORIENTATION_RAPPORT_81', N'', N'Orientation du rapport 81'),
  (N'VIGISERV', N'ACTIONS_PRIORITAIRES', N'0', N'Activation des actions prioritaires'),
  (N'VIGISERV', N'ACTIONS_PRIORITAIRES_DESACTIVATION', N'0', N'Desactivation des actions prioritaires (si egal à 1, les actions prioritaires n''ont pas d''effet)'),
  (N'VIGISERV', N'DATE_DERNIER_FICHIER_SAUVEGARDE', N'', N'Date du dernier fichier de sauvegarde remonte par VigiServ'),
  (N'VIGISERV', N'DELAI_ALERTE_MESURE_MINUTES', N'60', N'Delai de verification maximum avant de lancer une alerte sur la derniere mesure (en minutes)'),
  (N'VIGISERV', N'DELAI_REPONSE_SONDE_AVR_CENTIEMES_SECONDES', N'100', N'Delai maximum pour l''attente de lecture des sondes AVR en centiemes de seconde'),
  (N'VIGISERV', N'DELAI_REPONSE_SONDE_EI_CENTIEMES_SECONDES', N'150', N'Delai maximum pour l''attente de lecture des sondes EI en centiemes de seconde'),
  (N'VIGISERV', N'DELAI_SONNERIE_ALARME_MINUTES', N'2', N'Delai pour la verification si des alarmes sont presentes avant activation d''une alarme sonore (en minutes)'),
  (N'VIGISERV', N'DERNIER_MESURE_APPEL', N'SondesSurveillance', N'Derniere fonction appelee par le service VigiServ'),
  (N'VIGISERV', N'DERNIER_MESURE_APPEL_1', N'SondesSurveillance', N'Derniere fonction appelee par le service VigiServ (serveur 1)'),
  (N'VIGISERV', N'DERNIER_MESURE_APPEL_2', N'SondesSurveillance', N'Derniere fonction appelee par le service VigiServ (serveur 2)'),
  (N'VIGISERV', N'DERNIER_MESURE_APPEL_3', N'SondesSurveillance', N'Derniere fonction appelee par le service VigiServ (serveur 3)'),
  (N'VIGISERV', N'DERNIER_MESURE_DATE_HEURE', N'', N'Date heure de la derniere mesure inscrite par le service VigiServ'),
  (N'VIGISERV', N'DERNIER_MESURE_DATE_HEURE_1', N'', N'Date heure de la derniere mesure inscrite par le service VigiServ (serveur 1)'),
  (N'VIGISERV', N'DERNIER_MESURE_DATE_HEURE_2', N'', N'Date heure de la derniere mesure inscrite par le service VigiServ (serveur 2)'),
  (N'VIGISERV', N'DERNIER_MESURE_DATE_HEURE_3', N'', N'Date heure de la derniere mesure inscrite par le service VigiServ (serveur 3)'),
  (N'VIGISERV', N'DERNIER_MESURE_SONDE', N'', N'Numero de sonde de la derniere mesure inscrite par le service VigiServ'),
  (N'VIGISERV', N'DERNIER_MESURE_SONDE_1', N'', N'Numero de sonde de la derniere mesure inscrite par le service VigiServ (serveur 1)'),
  (N'VIGISERV', N'DERNIER_MESURE_SONDE_2', N'', N'Numero de sonde de la derniere mesure inscrite par le service VigiServ (serveur 2)'),
  (N'VIGISERV', N'DERNIER_MESURE_SONDE_3', N'', N'Numero de sonde de la derniere mesure inscrite par le service VigiServ (serveur 3)'),
  (N'VIGISERV', N'DIALOGUE_EN_MINUTES', N'1', N'Intervalle de dialogue avec le service VigiServ en minutes'),
  (N'VIGISERV', N'DUREE_LOGIN_SECONDES', N'60', N'Duree de validite du login (le login ne sera pas redemande dans ce delai) (en secondes)'),
  (N'VIGISERV', N'ECRAN_OFF', N'1', N'ecran eteint'),
  (N'VIGISERV', N'ENREGISTREMENT_ON', N'1', N'Activation de l''enregistrement'),
  (N'VIGISERV', N'FICHIER_EXTERNE', N'0', N'Utiliser un fichier externe'),
  (N'VIGISERV', N'FREQUENCE_NON_REPONSE_MINUTES', N'15', N'Frequence à appliquer si la derniere mesure est en erreur (en minutes)'),
  (N'VIGISERV', N'FREQUENCE_VERIFICATION_MINUTES', N'15', N'Frequence de verification en minutes'),
  (N'VIGISERV', N'MEMOIRE_OFF', N'1', N'Memoire eteinte'),
  (N'VIGISERV', N'NOM_UTILISATEUR_SERVEUR', N'', N'Nom de l''utilisateur du serveur'),
  (N'VIGISERV', N'PING_MODULE', N'1', N'Autorise ou pas le ping en cas de test d''un module reseau (0 = OFF, 1 = ON)'),
  (N'VIGISERV', N'SATURATION_SONDE_LINEAIRE', N'-40', N'Seuil de saturation d''une sonde lineaire'),
  (N'VIGISERV', N'SECONDES_ENTRE_MESURES_ETALONNAGE', N'30', N'Nombre de secondes entre chaque mesure d''etalonnage'),
  (N'VIGISERV', N'SERVEUR_ADRESSE_IP', N'', N'Adresse IP du serveur VigiServ'),
  (N'VIGISERV', N'SERVEUR_ADRESSE_IP_1', N'', N'Adresse IP du serveur VigiServ (serveur 1)'),
  (N'VIGISERV', N'SERVEUR_ADRESSE_IP_2', N'', N'Adresse IP du serveur VigiServ (serveur 2)'),
  (N'VIGISERV', N'SERVEUR_ADRESSE_IP_3', N'', N'Adresse IP du serveur VigiServ (serveur 3)'),
  (N'VIGISERV', N'SERVEUR_NOM', N'', N'Nom du serveur VigiServ'),
  (N'VIGISERV', N'SERVEUR_NOM_1', N'', N'Nom du serveur VigiServ (serveur 1)'),
  (N'VIGISERV', N'SERVEUR_NOM_2', N'', N'Nom du serveur VigiServ (serveur 2)'),
  (N'VIGISERV', N'SERVEUR_NOM_3', N'', N'Nom du serveur VigiServ (serveur 3)'),
  (N'VIGISERV', N'SERVICE_DATE_HEURE', N'', N'Date heure inscrite par le service VigiServ'),
  (N'VIGISERV', N'SERVICE_DATE_HEURE_1', N'', N'Date heure inscrite par le service VigiServ (serveur 1)'),
  (N'VIGISERV', N'SERVICE_DATE_HEURE_2', N'', N'Date heure inscrite par le service VigiServ (serveur 2)'),
  (N'VIGISERV', N'SERVICE_DATE_HEURE_3', N'', N'Date heure inscrite par le service VigiServ (serveur 3)'),
  (N'VIGISERV', N'SONDE_EN_SEUIL_BAS', N'-60', N'Seuil bas pour les sondes de type EN'),
  (N'VIGISERV', N'SONDE_EN_SEUIL_HAUT', N'100', N'Seuil haut pour les sondes de type EN'),
  (N'VIGISERV', N'SONDE_EP_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type EP'),
  (N'VIGISERV', N'SONDE_EP_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type EP'),
  (N'VIGISERV', N'SONDE_GN_SEUIL_BAS', N'-60', N'Seuil bas pour les sondes de type GN'),
  (N'VIGISERV', N'SONDE_GN_SEUIL_HAUT', N'70', N'Seuil haut pour les sondes de type GN'),
  (N'VIGISERV', N'SONDE_GP_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type GP'),
  (N'VIGISERV', N'SONDE_GP_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type GP'),
  (N'VIGISERV', N'SONDE_HN_SEUIL_BAS', N'-60', N'Seuil bas pour les sondes de type HN'),
  (N'VIGISERV', N'SONDE_HN_SEUIL_HAUT', N'100', N'Seuil haut pour les sondes de type HN'),
  (N'VIGISERV', N'SONDE_HP_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type HP'),
  (N'VIGISERV', N'SONDE_HP_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type HP'),
  (N'VIGISERV', N'SONDE_IC_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type IC'),
  (N'VIGISERV', N'SONDE_IC_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type IC'),
  (N'VIGISERV', N'SONDE_IHCQP_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type IHCQP'),
  (N'VIGISERV', N'SONDE_IHCQP_SEUIL_HAUT', N'1200', N'Seuil haut pour les sondes de type IHCQP'),
  (N'VIGISERV', N'SONDE_IH_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type IH'),
  (N'VIGISERV', N'SONDE_IH_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type IH'),
  (N'VIGISERV', N'SONDE_IN_SEUIL_BAS', N'-60', N'Seuil bas pour les sondes de type IN'),
  (N'VIGISERV', N'SONDE_IN_SEUIL_HAUT', N'80', N'Seuil haut pour les sondes de type IN'),
  (N'VIGISERV', N'SONDE_IP_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type IP'),
  (N'VIGISERV', N'SONDE_IP_SEUIL_HAUT', N'400', N'Seuil haut pour les sondes de type IP'),
  (N'VIGISERV', N'SONDE_IQ_SEUIL_BAS', N'-400', N'Seuil bas pour les sondes de type IQ'),
  (N'VIGISERV', N'SONDE_IQ_SEUIL_HAUT', N'1100', N'Seuil haut pour les sondes de type IQ'),
  (N'VIGISERV', N'TIMEOUT_PING_MILLISECONDES', N'200', N'TimeOut de la duree d''attente de la fonction Ping() en millisecondes'),
  (N'VIGISERV', N'TIMEOUT_PORT_SERIE_MILLISECONDES', N'5000', N'TimeOut de la duree d''attente de la fonction sOuvre() en millisecondes'),
  (N'VIGISURV', N'ALARME_SONORE_LIEU_NON_ACQUITE', N'0', N'Alarme sonore pour les lieux non acquittes'),
  (N'VIGISURV', N'ALERTE_SURVEILLANCE', N'0', N'Alerte de surveillance'),
  (N'VIGISURV', N'DELAI_ARRET_THREAD_CHANGEMENT_GROUPE_MILLISECONDES', N'500', N'Delai laisse à l''application pour arrêter le thread de mise à jour avant rafraîchissement pour le changement de groupe (en millisecondes)'),
  (N'VIGISURV', N'DELAI_ARRET_THREAD_DESSIN_MILLISECONDES', N'100', N'Delai laisse à l''application avant de redemarrer le thread dessin apres un changement de groupe (en millisecondes)'),
  (N'VIGISURV', N'DELAI_AVANT_ARCHIVE_JOURS', N'365', N'Nombre de jours avant archivage automatique'),
  (N'VIGISURV', N'DELAI_PAUSE_THREAD_MAJ_DESSIN_SECONDES', N'25', N'Delai en secondes de pause entre 2 mises à jour completes des dessins. Augmenter ce nombre pour dessiner moins souvent les graphes'),
  (N'VIGISURV', N'DELAI_PAUSE_THREAD_MAJ_SECONDES', N'30', N'Delai en secondes de pause entre 2 mises à jour completes des lieux. Augmenter ce nombre pour rafraîchir moins souvent'),
  (N'VIGISURV', N'DELAI_RAFRAICHISSEMENT_ADMIN_SECONDES', N'300', N'Delai de mise à jour de l''ecran d''administration en secondes'),
  (N'VIGISURV', N'DELAI_RAFRAICHISSEMENT_METROLOGIE_SECONDES', N'300', N'Delai de mise à jour de l''ecran de metrologie en secondes'),
  (N'VIGISURV', N'DELAI_VERIFICATION_ALERTES_SECONDES', N'30', N'Delai de verification des alertes en secondes'),
  (N'VIGISURV', N'DELAI_VERIFICATION_VIGISERV_MINUTES', N'60', N'Delai du message d''alarme VigiServ en minutes'),
  (N'VIGISURV', N'DELAI_VERIFICATION_VIGITEL_MINUTES', N'60', N'Delai du message d''alarme VigiTel en minutes'),
  (N'VIGISURV', N'EXPLICATIONS_TESTS', N'- Ping base VigiTemp' + NCHAR(13) + NCHAR(10) + N'  Permet de savoir si le serveur hebergeant la base de donnees VigiTemp est accessible. Un ping permet de connaître son etat de connexion au reseau.' + NCHAR(13) + NCHAR(10) + N'' + NCHAR(13) + NCHAR(10) + N'- Requête base VigiTemp' + NCHAR(13) + NCHAR(10) + N'  Une requête est executee sur la base de donnees VigiTemp afin de savoir si MySQL est bien operationnel.' + NCHAR(13) + NCHAR(10) + N'' + NCHAR(13) + NCHAR(10) + N'- Ping serveur VigiServ' + NCHAR(13) + NCHAR(10) + N'  Permet de savoir si le serveur hebergeant la base de donnees des mesures est accessible. Un ping permet de connaître son etat de connexion au reseau.' + NCHAR(13) + NCHAR(10) + N'' + NCHAR(13) + NCHAR(10) + N'- Requête serveur VigiServ' + NCHAR(13) + NCHAR(10) + N'  Une requête est executee sur la base de donnees VigiTemp afin de savoir si la base de donnees à bien ete initialisee.' + NCHAR(13) + NCHAR(10) + N'' + NCHAR(13) + NCHAR(10) + N'- Interrogation VigiServ' + NCHAR(13) + NCHAR(10) + N'  Verifie si VigiServ est actif. Le service VigiServ informe de son etat de façon reguliere en ecrivant dans la base de donnees. Si cette ecriture n''a pas ete effectuee recemment alors VigiServ est inactif.' + NCHAR(13) + NCHAR(10) + N'' + NCHAR(13) + NCHAR(10) + N'- Interrogation VigiTel' + NCHAR(13) + NCHAR(10) + N'  Verifie si VigiTel est actif. Le service VigiTel informe de son etat de façon reguliere en ecrivant dans la base de donnees. Si cette ecriture n''a pas ete effectuee recemment alors VigiTel est inactif.', N'Texte d''explication pour les tests de la fenêtre outils'),
  (N'VIGISURV', N'IDENT_VIGILOG', N'0', N'Identifiant VigiLog'),
  (N'VIGISURV', N'LANCEMENT_ROBOT_SURVEILLANCE_MINUTES', N'10', N'Lance la verification (Ping, Requêtes, Services) toutes les 10 minutes'),
  (N'VIGISURV', N'LIAISON_ARMURE', N'0', N'Liaison avec l''armoire'),
  (N'VIGISURV', N'LIAISON_ARMURE_MODE', N'1', N'Mode de liaison avec l''armoire'),
  (N'VIGISURV', N'LIAISON_ARMURE_REPERTOIRE', N'', N'Repertoire de liaison avec l''armoire'),
  (N'VIGISURV', N'MAX_VALIDITE_ETALONNAGE_JOURS', N'365', N'Nombre de jours durant lequel les etalonnages sont valides'),
  (N'VIGISURV', N'MAX_VALIDITE_SAUVEGARDE_JOURS', N'7', N'Nombre de jours durant lequel la sauvegarde est valide'),
  (N'VIGISURV', N'MOT_DE_PASSE_ETALONNAGE', N'METRO', N'Mot de passe pour les operations d''etalonnage'),
  (N'VIGISURV', N'REMONTER_HEURE_SERVEUR_LOGIN', N'0', N'Activer la remontee de l''heure du serveur au login'),
  (N'VIGISURV', N'TAUX_RAFRAICHISSEMENT_INITIALISATION_ECRAN', N'10', N'Nombre de lieux à afficher lors du chargement de l''ecran. Augmenter ce nombre pour accelerer le premier chargement'),
  (N'VIGISURV', N'TEXTE_SAUVEGARDE', N'La mise en place des sauvegardes s''effectue sur le poste serveur VigiTemp.', N'Texte d''information sur les sauvegardes'),
  (N'VIGISURV', N'VISION_SIMPLE', N'0', N'Mode vision simple'),
  (N'VIGITEL', N'ALARME_NON_REPONSE', N'0', N'Alarme de non-reponse'),
  (N'VIGITEL', N'DUREE_LOGIN_SECONDES', N'60', N'Duree de validite du login VigiTel (en secondes)'),
  (N'VIGITEL', N'EMAIL_ALARME_EXPEDITEUR', N'', N'Adresse e-mail expediteur pour les alarmes'),
  (N'VIGITEL', N'EMAIL_ALARME_MESSAGE', N'Le lieu en alarme est : %Lieu (sonde n° %NumSonde)' + NCHAR(13) + NCHAR(10) + N'Type d''alarme : %AlarmeTexteMessage' + NCHAR(13) + NCHAR(10) + N'Dernier releve : %Valeur %Unite', N'Template du message d''alarme par e-mail'),
  (N'VIGITEL', N'EMAIL_ALARME_OBJET', N'Alarme VigiTemp', N'Objet de l''e-mail d''alarme'),
  (N'VIGITEL', N'FORMAT_FICHIER_SON', N'41', N'Format du fichier son (41 = SAFTCCITT_ALaw_8kHzMono)'),
  (N'VIGITEL', N'FREQUENCE_VERIFICATION_MINUTES', N'15', N'Frequence de verification VigiTel en minutes'),
  (N'VIGITEL', N'MODE_DEBUG', N'0', N'Activer le mode debogage de VigiTel'),
  (N'VIGITEL', N'NOM_MODEM', N'', N'Nom du modem utilise'),
  (N'VIGITEL', N'SEPARATEUR_DECIMAL', N',', N'Separateur decimal (. ou ,) pour la mise en forme d''une valeur relevee'),
  (N'VIGITEL', N'SERVICE_DATE_HEURE', N'', N'Date heure inscrite par le service VigiTel'),
  (N'VIGITEL', N'SMTP_COMPTE', N'', N'Compte SMTP VigiTel'),
  (N'VIGITEL', N'SMTP_MODE_ASYNCHRONE', N'0', N'Mode asynchrone SMTP'),
  (N'VIGITEL', N'SMTP_MOT_DE_PASSE', N'', N'Mot de passe SMTP VigiTel'),
  (N'VIGITEL', N'SMTP_PORT', N'25', N'Port SMTP VigiTel'),
  (N'VIGITEL', N'SMTP_SECURISE_TSL', N'0', N'Activer la securisation TSL du SMTP'),
  (N'VIGITEL', N'SMTP_SERVEUR', N'smtp', N'Serveur SMTP VigiTel'),
  (N'VIGITEL', N'VITESSE_VOIX', N'1', N'Vitesse de la voix (de -10 à 10)'),
  (N'VIGITEL', N'VOLUME_VOIX', N'100', N'Volume de la voix (de 1 à 100)')
) AS source (Section, Mot_Cle, Valeur, Commentaire)
ON target.Section = source.Section AND target.Mot_Cle = source.Mot_Cle
WHEN NOT MATCHED THEN INSERT (Section, Mot_Cle, Valeur, Commentaire) VALUES (source.Section, source.Mot_Cle, source.Valeur, source.Commentaire);
GO
-- 154 parametres MySQL de reference

DECLARE @RecentParams TABLE (
  Section NVARCHAR(100) NOT NULL,
  Mot_Cle NVARCHAR(100) NOT NULL,
  Valeur NVARCHAR(MAX) NULL,
  Commentaire NVARCHAR(MAX) NULL
);

INSERT INTO @RecentParams (Section, Mot_Cle, Valeur, Commentaire) VALUES
(N'VERSION',N'SCHEMA_VERSION',N'0.90.001',N'Version produit commune des seeds MySQL et SQL Server'),
(N'GENERAL',N'TIMEZONE',N'Europe/Paris',N'Fuseau horaire par defaut'),
(N'DASHBOARD',N'AUDIT_GRAPH_OPENINGS',N'false',N'Activer l audit trail a l ouverture des graphiques'),
(N'DASHBOARD',N'ETALONNAGE_WARNING_DAYS',N'90',N'Delai alerte validite etalonnage en jours'),
(N'DASHBOARD',N'REFRESH',N'30',N'Intervalle de rafraichissement dashboard en secondes'),
(N'DASHBOARD',N'REQUIRE_ACTION_COMMENT',N'false',N'Exiger un commentaire pour les actions de surveillance'),
(N'NOTIFICATIONS',N'EMAIL',N'true',N'Activation globale des emails systeme'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_RECIPIENTS',N'',N'Emails systeme utilises en copie ou fallback selon configuration'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_FALLBACK_TO_SYSTEM',N'false',N'Envoyer aux emails systeme si aucun contact lieu n est renseigne'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_ACKNOWLEDGED',N'true',N'Envoyer les emails d acquittement'),
(N'NOTIFICATIONS',N'ALARM_EMAIL_ENDED',N'true',N'Envoyer les emails d alarme terminee'),
(N'NOTIFICATIONS_TEAMS',N'ENABLED',N'false',N'Active les notifications Teams via webhook Workflows'),
(N'NOTIFICATIONS_TEAMS',N'WEBHOOK_URL',N'',N'URL du webhook Teams Workflows. Secret a proteger'),
(N'NOTIFICATIONS_TEAMS',N'CHANNEL_LABEL',N'',N'Nom lisible du canal Teams cible'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_TRIGGER',N'true',N'Envoie un message Teams au declenchement alarme'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_END',N'true',N'Envoie un message Teams a la fin alarme'),
(N'NOTIFICATIONS_TEAMS',N'NOTIFY_ON_ACK',N'false',N'Envoie un message Teams a l acquittement'),
(N'NOTIFICATIONS_TEAMS',N'TIMEOUT_MS',N'5000',N'Timeout HTTP du webhook Teams en millisecondes'),
(N'NOTIFICATIONS_TEAMS',N'DEDUPE_WINDOW_MINUTES',N'10',N'Fenetre anti-doublon Teams par alarme/evenement'),
(N'SERVICE',N'GSO_DERNIER_DATE_HEURE',NULL,N'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures'),
(N'SERVICES',N'COMMERCIAL_CONTACT_EMAIL',N'',N'Adresse email du service commercial utilisee pour les demandes de devis materiel'),
(N'messaging',N'enabled',N'true',N'Active la messagerie interne'),
(N'TELEPHONIE',N'ENABLED',N'false',N'Activation globale de la telephonie VoIP'),
(N'TELEPHONIE',N'PROVIDER',N'none',N'Fournisseur VoIP selectionne'),
(N'TELEPHONIE',N'CALLER_ID',N'',N'Numero presente / caller ID'),
(N'TELEPHONIE',N'NOTES',N'',N'Notes d integration telephonie'),
(N'TELEPHONIE',N'TWILIO_AUTH_MODE',N'api_key',N'Mode authentification Twilio'),
(N'TELEPHONIE',N'TWILIO_ACCOUNT_SID',N'',N'Compte Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SID',N'',N'API Key SID Twilio'),
(N'TELEPHONIE',N'TWILIO_API_KEY_SECRET',N'',N'API Key Secret Twilio'),
(N'TELEPHONIE',N'TWILIO_AUTH_TOKEN',N'',N'Auth Token Twilio'),
(N'TELEPHONIE',N'TWILIO_FROM_NUMBER',N'',N'Numero expediteur Twilio'),
(N'TELEPHONIE',N'OVH_ENDPOINT',N'ovh-eu',N'Point d acces API OVH'),
(N'TELEPHONIE',N'OVH_APPLICATION_KEY',N'',N'Application Key OVH'),
(N'TELEPHONIE',N'OVH_APPLICATION_SECRET',N'',N'Application Secret OVH'),
(N'TELEPHONIE',N'OVH_CONSUMER_KEY',N'',N'Consumer Key OVH'),
(N'TELEPHONIE',N'OVH_BILLING_ACCOUNT',N'',N'Compte de facturation OVH'),
(N'TELEPHONIE',N'OVH_SERVICE_NAME',N'',N'Nom du service / ligne OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_USER_ID',N'',N'Identifiant utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_LOGIN',N'',N'Login utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'OVH_CLICK2CALL_PASSWORD',N'',N'Mot de passe utilisateur Click2Call OVH'),
(N'TELEPHONIE',N'KEYYO_CLIENT_ID',N'',N'Client ID Keyyo'),
(N'TELEPHONIE',N'KEYYO_CLIENT_SECRET',N'',N'Client Secret Keyyo'),
(N'TELEPHONIE',N'KEYYO_ACCESS_TOKEN',N'',N'Access token Keyyo'),
(N'TELEPHONIE',N'KEYYO_REFRESH_TOKEN',N'',N'Refresh token Keyyo'),
(N'TELEPHONIE',N'KEYYO_LINE_ID',N'',N'Identifiant ligne Keyyo'),
(N'TELEPHONIE',N'ASTERISK_BASE_URL',N'http://127.0.0.1:8088/ari',N'URL ARI Asterisk'),
(N'TELEPHONIE',N'ASTERISK_USERNAME',N'',N'Utilisateur Asterisk ARI'),
(N'TELEPHONIE',N'ASTERISK_PASSWORD',N'',N'Mot de passe Asterisk ARI'),
(N'TELEPHONIE',N'ASTERISK_APP_NAME',N'vigitemp',N'Nom application Asterisk ARI');

INSERT INTO dbo.t_parametre (Section, Mot_Cle, Valeur, Commentaire)
SELECT p.Section, p.Mot_Cle, p.Valeur, p.Commentaire
FROM @RecentParams p
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.t_parametre existing
  WHERE existing.Section = p.Section
    AND existing.Mot_Cle = p.Mot_Cle
);
GO

-- DONNEES COMPLEMENTAIRES (missing_data.sql)
SET IDENTITY_INSERT dbo.t_materiel ON;
MERGE dbo.t_materiel AS target
USING (VALUES
  (1, N'M-GSO-U', N'Module de réception pour sondes GemSense One USB', N'USB' + CHAR(13) + '' + CHAR(10) + 'Led d’activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSO', N'RADIO', NULL),
  (2, N'M-GSO-E', N'Module de réception pour sondes GemSense One Ethernet', N'Ethernet RJ 45' + CHAR(13) + '' + CHAR(10) + 'Led activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSO', N'RADIO', NULL),
  (3, N'GSO-IT', N'Gemsense One Température interne', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -20°C à 40°C', N'GSO', N'RADIO', NULL),
  (4, N'GSO-ITH', N'Gemsense One Température & humidité interne', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : 10°C à 40°C' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : 10%Hr à 90%Hr', N'GSO', N'RADIO', NULL),
  (5, N'GSO-ET', N'Gemsense One Température externe', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Protection : inox 316 L Ø 6 x 40 mm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -40°C à 125°C', N'GSO', N'RADIO', NULL),
  (6, N'GSO-ETH', N'Gemsense One Température & humidité externe', N'Fréquence de mesure 15 min fixe ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (700 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Piles AAA*2 (2 ans selon utilisation)' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : 10°C à 80°C' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : 10%Hr à 90%Hr', N'GSO', N'RADIO', NULL),
  (7, N'M-GSP', N'Module de réception pour sondes GemSense Pro Ethernet', N'Interface 10Base-T ou 100Base-TX' + CHAR(13) + '' + CHAR(10) + 'Connecteur RJ45' + CHAR(13) + '' + CHAR(10) + 'Led Link & activité' + CHAR(13) + '' + CHAR(10) + 'Sécurisé par mot de passe' + CHAR(13) + '' + CHAR(10) + 'CPU : DSTni-EX' + CHAR(13) + '' + CHAR(10) + 'Mémoire : 256k SRAM 512Kb flash' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSP', N'RADIO', NULL),
  (8, N'GSP-RN-BL', N'Gemsense Pro Numérique blanc', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C Câble long 3 m BLANC', N'GSP', N'RADIO', NULL),
  (9, N'GSP-RN-GR', N'Gemsense Pro Numérique gris', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C  Câble long 3 m GRIS PLAT', N'GSP', N'RADIO', NULL),
  (10, N'GSP-RP', N'Gemsense Pro platine', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'RADIO', NULL),
  (11, N'GSP-RP-ALIM', N'Gemsense Pro platine alimentaire', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L - Ø 5 mm, ' + CHAR(13) + '' + CHAR(10) + 'longueur utile : 150 mm' + CHAR(13) + '' + CHAR(10) + 'Poignée : surmoulée silicone THT 250 °C - couleur rouge brique, longueur 130 mm' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt1000 céramique DIN IEC 60751 classe B, simple en montage A' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : silicone atoxique THT 250 °C continu - Alimentaire couleur rouge brique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -50 à + 250 °C', N'GSP', N'RADIO', NULL),
  (12, N'GSP-RP-CONT', N'Gemsense Pro platine contact', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 CEI 60751 classe A, ' + CHAR(13) + '' + CHAR(10) + 'simple enroulement, élément de mesure couche mince sous rétractable PFA' + CHAR(13) + '' + CHAR(10) + 'Sous film polyester ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -80+160 °C' + CHAR(13) + '' + CHAR(10) + 'Fixation par colle silicone sur surface dégraissée' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA, section 0,09 mm², longueur 2 mètres, 3 conducteurs', N'GSP', N'RADIO', NULL),
  (13, N'GSP-RP-AU', N'Gemsense Pro platine autoclave', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L - Ø 6 x 200 mm, ' + CHAR(13) + '' + CHAR(10) + 'prolongée par câble PFA/silicone protégé par flexible inox Ø 7 mm, longueur 1,5 mètres puis gaine étanche Ø 6 x 100 mm pour passage de cloison' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, simple ou double enroulement en montage 3 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/silicone, longueur 2 mètres' + CHAR(13) + '' + CHAR(10) + 'Température maximale d''utilisation : +180 °C' + CHAR(13) + '' + CHAR(10) + 'Exécution étanche', N'GSP', N'RADIO', NULL),
  (14, N'GSP-RP-CF', N'Gemsense Pro platine chambre froide', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Capteur muni à l''extrémité d''une ogive inox diamètre 6 mm ' + CHAR(13) + '' + CHAR(10) + 'sertie sur 15 mètres de câble silicone.' + CHAR(13) + '' + CHAR(10) + 'Configuration 3 fils' + CHAR(13) + '' + CHAR(10) + 'Elément sensible Pt100 suivant NF EN 60751 classe B' + CHAR(13) + '' + CHAR(10) + 'Ogive inox diamètre 6 mm, longueur 50 mm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -50°C à + 100°C' + CHAR(13) + '' + CHAR(10) + 'Sortie sur 15 mètres de câble : Conducteurs souples 7 brins ' + CHAR(13) + '' + CHAR(10) + 'de ø 0.2 mm isolés PFA sous gaine caoutchouc de silicone. ' + CHAR(13) + '' + CHAR(10) + '2 conducteurs rouges, 1 conducteur blanc', N'GSP', N'RADIO', NULL),
  (15, N'GSP-RP-MICRO', N'Gemsense Pro platine micro-capteur', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de temperature platine' + CHAR(13) + '' + CHAR(10) + 'Capteur micro ø 2,18mm L 4,75m : -70°C à + 250°C', N'GSP', N'RADIO', NULL),
  (16, N'GSP-RQ-CO2', N'Gemsense Pro CO2', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Le capteur de dioxyde de carbone Vaisala CARBOCAP® GMP251 est une sonde intelligente et autonome.' + CHAR(13) + '' + CHAR(10) + 'La plage de température de fonctionnement va de -40 à +60 °C, ' + CHAR(13) + '' + CHAR(10) + 'et la plage de mesure est comprise entre 0 et 20 % de CO2' + CHAR(13) + '' + CHAR(10) + 'Le capteur GMP251 fait appel à la technologie unique de deuxième génération Vaisala CARBOCAP® qui offre une stabilité exceptionnelle. ' + CHAR(13) + '' + CHAR(10) + 'La durée de vie de la GMP251 est prolongée grâce à un nouveau type de source de lumière infrarouge (IR) qui remplace l''ampoule à incandescence traditionnelle. Elle bénéficie de compensations complètes de température et de pression de la mesure du COCO2 - mesure de température intégrée pour la compensation.', N'GSP', N'RADIO', NULL),
  (17, N'GSP-RQ-HYG', N'Gemsense Pro hygrométrie', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Plage de mesure de 0% à 100 %hr' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation de 10°C à +60°C' + CHAR(13) + '' + CHAR(10) + 'Capteur de diamètre 12 mm longueur 71 mm', N'GSP', N'RADIO', NULL),
  (18, N'GSP-RQ-THE', N'Gemsense Pro thermocouple', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de température' + CHAR(13) + '' + CHAR(10) + 'Capteur thermocouple J chemise (déformable) :' + CHAR(13) + '' + CHAR(10) + 'ø 3 mm longueur 50 cm' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation  : 100°C à + 1500°C' + CHAR(13) + '' + CHAR(10) + 'Sortie sur câble tresse inox 1m', N'GSP', N'RADIO', NULL),
  (19, N'GSP-RQ-PRES', N'Gemsense Pro pression différentielle', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de pression ' + CHAR(13) + '' + CHAR(10) + 'Capteur piézoélectique' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation  : 0 à 250 Pa' + CHAR(13) + '' + CHAR(10) + 'Sortie sur câble tresse inox 1m', N'GSP', N'RADIO', NULL),
  (20, N'GSP-RQ-ATMO', N'Gemsense Pro pression atmosphérique', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de pression  ' + CHAR(13) + '' + CHAR(10) + 'Capteur ratiométrique' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : atmosphère ambiante', N'GSP', N'RADIO', NULL),
  (21, N'GSP-RQ-LUM', N'Gemsense Pro lumière', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de lumière ' + CHAR(13) + '' + CHAR(10) + 'Capteur photorésistif' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : lumière ambiante', N'GSP', N'RADIO', NULL),
  (22, N'GSP-RQ-01V', N'Gemsense Pro 0-1 Volt', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de tension ' + CHAR(13) + '' + CHAR(10) + 'Entrée 0-1Volt', N'GSP', N'RADIO', NULL),
  (23, N'GSP-RQ-420MA', N'Gemsense Pro 4-20 mA', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur de courant ' + CHAR(13) + '' + CHAR(10) + 'Entrée 4-20mA', N'GSP', N'RADIO', NULL),
  (24, N'GSP-RQ-NONF', N'Gemsense Pro NO NF', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Fonction mémoire (5300 valeurs)' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (10 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Capteur TOR ' + CHAR(13) + '' + CHAR(10) + 'Entrée récuperation de contact NO ou NF' + CHAR(13) + '' + CHAR(10) + 'Domaine d''utilisation : reprise de contact', N'GSP', N'RADIO', NULL),
  (25, N'GSP-RP-ETAL', N'Gemsense Pro Etalon', N'Sonde GemSense Pro avec écran 2,9" ' + CHAR(13) + '' + CHAR(10) + 'Lecture écran sous forme de liste pour des étalonnages ' + CHAR(13) + '' + CHAR(10) + 'plus faciles' + CHAR(13) + '' + CHAR(10) + 'Batterie de secours (15 jours)' + CHAR(13) + '' + CHAR(10) + 'Gamme pro avec portée étendue' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 3,5 longueur utile 150 mm ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe 1/3DIN, ' + CHAR(13) + '' + CHAR(10) + 'en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA ' + CHAR(13) + '' + CHAR(10) + 'Résolution d’affichage : 0,01°C ' + CHAR(13) + '' + CHAR(10) + 'Résolution de mesure : 0,003°C', N'GSP', N'ETALON', NULL),
  (26, N'GSP-XN-BL', N'Gemsense Pro Ethernet numérique blanc', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', N'GSP', N'ETHERNET', NULL),
  (27, N'GSP-XN-GR', N'Gemsense Pro Ethernet numérique gris', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', N'GSP', N'ETHERNET', NULL),
  (28, N'GSP-XP', N'Gemsense Pro Ethernet platine', N'Liaison Ethernet RJ45 ' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'ETHERNET', NULL),
  (29, N'M-GSP-F', N'Module de réception pour sondes GemSense Pro Filaire', N'Ethernet RJ 45' + CHAR(13) + '' + CHAR(10) + 'Led activité' + CHAR(13) + '' + CHAR(10) + 'Alimentation sur secteur', N'GSP', N'FILAIRE', NULL),
  (30, N'M-GSP-F-ALS', N'Alimentation supplémentaire pour sondes GemSense Pro Filaire', N'', N'GSP', N'FILAIRE', NULL),
  (31, N'GSP-FN-BL', N'Gemsense Pro filaire numérique blanc', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 125°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 125 °C | Câble long 3 m BLANC', N'GSP', N'FILAIRE', NULL),
  (32, N'GSP-FN-GR', N'Gemsense Pro filaire numérique gris', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -30°C à 70°C' + CHAR(13) + '' + CHAR(10) + 'Capteur numérique Ø 6mm l, 50mm  / -30°C à 70 °C | Câble long 3 m GRIS PLAT', N'GSP', N'FILAIRE', NULL),
  (33, N'GSP-FP', N'Gemsense Pro Filaire platine', N'Bus d’alimentation de data RS485' + CHAR(13) + '' + CHAR(10) + 'Gaine de protection : acier inox 316 L, Ø 6 ' + CHAR(13) + '' + CHAR(10) + 'Température d''utilisation : -200 à 200°C' + CHAR(13) + '' + CHAR(10) + 'Sonde : Pt 100 céramique CEI 60751 classe A, en montage 4 fils' + CHAR(13) + '' + CHAR(10) + 'Câble de raccordement : PFA/PFA', N'GSP', N'FILAIRE', NULL)
) AS source (Id_Materiel, Ref_Commercial, Nom_Materiel, Descriptif, Type_Materiel, Famille_Materiel, Archive)
ON target.Id_Materiel = source.Id_Materiel
WHEN MATCHED THEN UPDATE SET Ref_Commercial = source.Ref_Commercial, Nom_Materiel = source.Nom_Materiel, Descriptif = source.Descriptif, Type_Materiel = source.Type_Materiel, Famille_Materiel = source.Famille_Materiel, Archive = source.Archive
WHEN NOT MATCHED THEN INSERT (Id_Materiel, Ref_Commercial, Nom_Materiel, Descriptif, Type_Materiel, Famille_Materiel, Archive) VALUES (source.Id_Materiel, source.Ref_Commercial, source.Nom_Materiel, source.Descriptif, source.Type_Materiel, source.Famille_Materiel, source.Archive);
SET IDENTITY_INSERT dbo.t_materiel OFF;
GO

SET IDENTITY_INSERT dbo.t_sonde_etat ON;
MERGE dbo.t_sonde_etat AS target
USING (VALUES
  (1, N'A', N'En ajustage'),
  (2, N'D', N'Surveillance désactivée'),
  (3, N'E', N'En étalonnage'),
  (4, N'S', N'Utilisée en surveillance'),
  (5, N'T', N'En test')
) AS source (Id_Sonde_Etat, Etat_Sonde, Etat_Libelle)
ON target.Id_Sonde_Etat = source.Id_Sonde_Etat
WHEN MATCHED THEN UPDATE SET Etat_Sonde = source.Etat_Sonde, Etat_Libelle = source.Etat_Libelle
WHEN NOT MATCHED THEN INSERT (Id_Sonde_Etat, Etat_Sonde, Etat_Libelle) VALUES (source.Id_Sonde_Etat, source.Etat_Sonde, source.Etat_Libelle);
SET IDENTITY_INSERT dbo.t_sonde_etat OFF;
GO

MERGE dbo.t_parametre AS target
USING (VALUES
  (N'CFR21', N'ACTIVATION_EXPIRATION_MOT_DE_PASSE', N'true', N'Activer l''expiration des mots de passe (CFR21)', NULL),
  (N'CFR21', N'ACTIVATION_NORME_CFR21', N'0', N'Activer la conformite CFR21 (saisie des configurations)', NULL),
  (N'CFR21', N'EVENEMENTS', N'1', N'Activation des evenements', NULL),
  (N'CFR21', N'JOURS_VALIDITE_MOT_DE_PASSE', N'0', NULL, NULL),
  (N'CFR21', N'MOT_DE_PASSE_PERMANENT', N'1', N'Le mot de passe ne peut pas etre change par l''utilisateur', NULL),
  (N'CFR21', N'MOT_DE_PASSE_REUTILISABLE', N'0', N'L''utilisateur ne peut pas reutiliser un ancien mot de passe', NULL),
  (N'CFR21', N'NOMBRE_TENTATIVES_MOT_DE_PASSE', N'3', N'Nombre de tentatives autorisees avant verrouillage du compte', NULL),
  (N'CFR21', N'REACTIVATION_ALARME_SONORE', N'500', N'Delai de reactivation de l''alarme sonore en millisecondes', NULL),
  (N'CFR21', N'SECURITE', N'0', N'Mode securite renforcee', NULL),
  (N'CFR21', N'TEMPS_DECONNEXION_MINUTES', N'20', N'Temps d''inactivite avant deconnexion automatique en minutes', NULL),
  (N'CFR21', N'VALIDITE_MOT_DE_PASSE_JOURS', N'90', N'Duree de validite du mot de passe en jours', NULL),
  (N'DASHBOARD', N'AUDIT_GRAPH_OPENINGS', N'false', N'Activer l''audit trail a l''ouverture des graphiques', NULL),
  (N'DASHBOARD', N'ETALONNAGE_WARNING_DAYS', N'90', NULL, NULL),
  (N'DASHBOARD', N'REFRESH', N'30', N'Intervalle de rafraichissement dashboard (secondes)', NULL),
  (N'DASHBOARD', N'REQUIRE_ACTION_COMMENT', N'false', NULL, NULL),
  (N'DASHBOARD', N'SHOW_NULL_NON_RESPONSE', N'true', N'Afficher les non-reponses (valeurs null) sur les graphes', NULL),
  (N'DASHBOARD', N'SURVEILLANCE_REFRESH', N'30', N'Delai auto de rafraichissement de la surveillance (secondes)', NULL),
  (N'GENERAL', N'TIMEZONE', N'Europe/Paris', N'Fuseau horaire par defaut', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_ACKNOWLEDGED', N'true', N'Envoyer les emails d acquittement', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_ENDED', N'true', N'Envoyer les emails d alarme terminee', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_FALLBACK_TO_SYSTEM', N'true', N'Envoyer les emails d alarme aux destinataires systeme si aucun contact mail lieu n est configure', NULL),
  (N'NOTIFICATIONS', N'ALARM_EMAIL_RECIPIENTS', N'', N'Emails en copie sur tous les emails systeme', NULL),
  (N'NOTIFICATIONS', N'EMAIL', N'true', N'Activation globale des emails systeme', NULL),
  (N'NOTIFICATIONS', N'GSP_BATTERY_EMAIL_PERCENT', N'25', N'Seuil (%) envoi email batterie faible sonde GSP', NULL),
  (N'NOTIFICATIONS', N'GSP_BATTERY_NOTIFY_PERCENT', N'50', N'Seuil (%) notification batterie faible sonde GSP', NULL),
  (N'NOTIFICATIONS_TEAMS', N'CHANNEL_LABEL', N'', N'Nom lisible du canal Teams cible.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'ENABLED', N'false', N'Active les notifications Teams via webhook Workflows.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_ACK', N'false', N'Envoie un message Teams a l acquittement.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_END', N'true', N'Envoie un message Teams a la fin alarme.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'NOTIFY_ON_TRIGGER', N'true', N'Envoie un message Teams au declenchement alarme.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'TIMEOUT_MS', N'5000', N'Timeout HTTP du webhook Teams en millisecondes.', NULL),
  (N'NOTIFICATIONS_TEAMS', N'WEBHOOK_URL', N'', N'URL du webhook Teams Workflows. Secret a proteger.', NULL),
  (N'SECURITE_EMAIL', N'SMTP_ACTIVATION', N'false', N'Activer l''envoi d''emails', NULL),
  (N'SECURITE_EMAIL', N'SMTP_EXPEDITEUR', N'', N'Adresse email expediteur (doit correspondre au domaine SMTP)', NULL),
  (N'SECURITE_EMAIL', N'SMTP_MOT_DE_PASSE', N'', N'Mot de passe SMTP', NULL),
  (N'SECURITE_EMAIL', N'SMTP_PORT', N'587', N'Port SMTP (587 pour TLS, 465 pour SSL)', NULL),
  (N'SECURITE_EMAIL', N'SMTP_SERVEUR', N'', N'Serveur SMTP pour l''envoi d''emails', NULL),
  (N'SECURITE_EMAIL', N'SMTP_UTILISATEUR', N'', N'Utilisateur SMTP', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'LONGUEUR_MINIMALE', N'4', N'Longueur minimale du mot de passe', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CARACTERES_SPECIAUX', N'0', N'Nombre minimum de caracteres speciaux', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_CHIFFRES', N'0', N'Nombre minimum de chiffres', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MAJUSCULES', N'0', N'Nombre minimum de majuscules', NULL),
  (N'SECURITE_MOT_DE_PASSE', N'MIN_LETTRES_MINUSCULES', N'0', N'Nombre minimum de minuscules', NULL),
  (N'SERVICE', N'GSO_DERNIER_DATE_HEURE', NULL, N'Date et heure de derniere mesure inscrite par la boucle GSO dans tm_mesures', NULL),
  (N'SERVICES', N'COMMERCIAL_CONTACT_EMAIL', N'', N'Adresse email du service commercial utilisee pour les demandes de devis materiel', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'DAY_OF_MONTH', N'1', N'Jour du mois (1..31, replie au dernier jour du mois si necessaire)', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'ENABLED', N'0', N'Activation envoi recap mensuel stats', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'HOUR_LOCAL', N'8', N'Heure locale (0..23)', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_COUNT', N'1', N'Inclure nombre alarmes', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_HIGH_DURATION', N'1', N'Inclure duree alarme haute', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_ALARM_LOW_DURATION', N'1', N'Inclure duree alarme basse', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_AVG', N'1', N'Inclure moyenne', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_LOCATION_SUMMARY', N'1', N'Inclure lieu/site/groupe', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_MAX', N'1', N'Inclure mesure max', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_MIN', N'1', N'Inclure mesure min', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_OVER_HIGH_NO_ALARM', N'1', N'Inclure depassement haut sans alarme', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_OVER_LOW_NO_ALARM', N'1', N'Inclure depassement bas sans alarme', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'INCLUDE_SETTINGS_SUMMARY', N'1', N'Inclure consignes/tolerances/frequence/retards', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'LAST_SENT_MONTH', N'', N'Dernier mois envoye au format YYYY-MM', NULL),
  (N'STATISTICS_MONTHLY_REPORT', N'RECIPIENTS', N'', N'Destinataires separes par ; ou ,', NULL)
) AS source (Section, Mot_Cle, Valeur, Commentaire, Champ_DATETIME)
ON target.Section = source.Section AND target.Mot_Cle = source.Mot_Cle
WHEN MATCHED THEN UPDATE SET Valeur = source.Valeur, Commentaire = source.Commentaire, Champ_DATETIME = source.Champ_DATETIME
WHEN NOT MATCHED THEN INSERT (Section, Mot_Cle, Valeur, Commentaire, Champ_DATETIME) VALUES (source.Section, source.Mot_Cle, source.Valeur, source.Commentaire, source.Champ_DATETIME);
GO

-- =====================================================================
-- NETTOYAGE AUTORISATIONS LEGACY NON UTILISEES (2026-04-13)
-- =====================================================================
IF OBJECT_ID('dbo.t_autorisation', 'U') IS NOT NULL
BEGIN
  DECLARE @CodesToRemove TABLE (code NVARCHAR(50) PRIMARY KEY);
  INSERT INTO @CodesToRemove (code) VALUES
    (N'PARAM_EDITION_STATISTIQUES'),
    (N'MATERIEL_MESURE_GERER'),
    (N'MATERIEL_MESURE_VISUALISER'),
    (N'MATERIEL_ALARME_GERER'),
    (N'APPLICATION_QUITTER_ADMIN'),
    (N'MATERIEL_METROLOGIE_GERER'),
    (N'METROLOGIE_REALISER'),
    (N'METROLOGIE_VISUALISER'),
    (N'APPLICATION_QUITTER_METRO'),
    (N'APPLICATION_QUITTER_SURV'),
    (N'APPLICATION_QUITTER_VIGILOG'),
    (N'TELE_ASSISTANCE'),
    (N'SUPERPOSITION_COURBE');

  IF OBJECT_ID('dbo.t_liaison_profil_autorisation', 'U') IS NOT NULL
  BEGIN
    DELETE l
    FROM dbo.t_liaison_profil_autorisation l
    JOIN dbo.t_autorisation a
      ON a.Id_Autorisation = l.Id_Autorisation
    JOIN @CodesToRemove c
      ON c.code = a.Code_Autorisation;
  END;

  DELETE a
  FROM dbo.t_autorisation a
  JOIN @CodesToRemove c
    ON c.code = a.Code_Autorisation;
END;
GO

-- =====================================================================
-- GSO / GSP memory recovery helpers, views and procedures
-- SQL Server Standard: execution via SQL Server Agent jobs
-- =====================================================================
USE [vigi_mesures];
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_count_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_count_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    [Missing_Data_Begin] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_count_mem_begin] DEFAULT(0),
    [Missing_Data_End] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_count_mem_end] DEFAULT(0),
    [Missing_Data_Total] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_count_mem_total] DEFAULT(0),
    [Commande_Mem] VARCHAR(50) NULL,
    [Statut] VARCHAR(20) NOT NULL CONSTRAINT [DF_tm_mesures_gso_count_mem_statut] DEFAULT('0'),
    [date_calcul] DATETIME NOT NULL CONSTRAINT [DF_tm_mesures_gso_count_mem_date_calcul] DEFAULT(GETDATE()),
    [Date_Heure_Demande_Mem] DATETIME NULL
  );
  CREATE UNIQUE INDEX [UX_tm_mesures_gso_count_mem]
    ON dbo.[tm_mesures_gso_count_mem]([GSO_SN], [Missing_Data_Begin], [Missing_Data_End], [Missing_Data_Total], [date_calcul]);
  CREATE INDEX [IDX_tm_mesures_gso_count_mem_statut] ON dbo.[tm_mesures_gso_count_mem]([Statut]);
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_commandes_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_commandes_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Port_Serie_Send_GSO] VARCHAR(10) NULL,
    [Commande_Globale_Begin] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_commandes_mem_begin] DEFAULT(0),
    [Commande_Globale_End] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_commandes_mem_end] DEFAULT(0),
    [Missing_Data_Total] FLOAT NOT NULL CONSTRAINT [DF_tm_mesures_gso_commandes_mem_total] DEFAULT(0),
    [Commande_Mem_Globale] VARCHAR(50) NULL,
    [Date_Calcul] DATETIME NOT NULL CONSTRAINT [DF_tm_mesures_gso_commandes_mem_Date_Calcul] DEFAULT(GETDATE()),
    [Statut] VARCHAR(20) NOT NULL CONSTRAINT [DF_tm_mesures_gso_commandes_mem_statut] DEFAULT('0'),
    [Date_Heure_Demande_Mem] DATETIME NULL
  );
  CREATE UNIQUE INDEX [UX_tm_mesures_gso_commandes_mem]
    ON dbo.[tm_mesures_gso_commandes_mem]([GSO_SN], [Commande_Globale_Begin], [Commande_Globale_End], [Missing_Data_Total]);
  CREATE INDEX [IDX_tm_mesures_gso_commandes_mem_statut] ON dbo.[tm_mesures_gso_commandes_mem]([Statut]);
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_build', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_build] (
    [Id_GSO_Build] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Date_Heure_Mesure] DATETIME NOT NULL CONSTRAINT [DF_tm_mesures_gso_build_Date_Heure_Mesure] DEFAULT(GETDATE()),
    [Valeur] FLOAT NULL,
    [Valeur_Brute] FLOAT NULL,
    [Est_Valeur_Memoire] BIT NOT NULL CONSTRAINT [DF_tm_mesures_gso_build_Est_Valeur_Memoire] DEFAULT(0),
    [Planning_Regle_Existe] BIT NOT NULL CONSTRAINT [DF_tm_mesures_gso_build_Planning_Regle_Existe] DEFAULT(0),
    [Planning_Actif] BIT NOT NULL CONSTRAINT [DF_tm_mesures_gso_build_Planning_Actif] DEFAULT(0),
    [Consigne] FLOAT NULL,
    [Consigne_Sup] FLOAT NULL,
    [Consigne_Inf] FLOAT NULL,
    [Unite] VARCHAR(10) NULL,
    [Sonde_Numero_Serie] VARCHAR(50) NULL,
    [Adresse_Sonde] VARCHAR(50) NULL,
    [COM_sonde] FLOAT NULL,
    [Est_Mesure_Repeteur_GSO] FLOAT NULL CONSTRAINT [DF_tm_mesures_gso_build_Est_Mesure_Repeteur_GSO] DEFAULT(0),
    [Id_Lieu] INT NOT NULL CONSTRAINT [DF_tm_mesures_gso_build_Id_Lieu] DEFAULT(0),
    [Consigne_Inf_Pre_Alarme] FLOAT NULL,
    [Consigne_Sup_Pre_Alarme] FLOAT NULL,
    [Rssi] VARCHAR(10) NULL,
    [Tension] VARCHAR(10) NULL,
    [GSO_SN] VARCHAR(50) NULL
  );
  CREATE INDEX [IDX_tm_mesures_gso_build_Date_Heure_Mesure] ON dbo.[tm_mesures_gso_build]([Date_Heure_Mesure]);
  CREATE INDEX [IDX_tm_mesures_gso_build_Id_Lieu] ON dbo.[tm_mesures_gso_build]([Id_Lieu]);
END;
GO
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_read_mem', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_read_mem] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Ecart] VARCHAR(32) NOT NULL,
    [Date_Heure_Read_Mem] DATETIME NULL
  );
  CREATE UNIQUE INDEX [UX_tm_mesures_gso_read_mem] ON dbo.[tm_mesures_gso_read_mem]([GSO_SN], [Ecart]);
  CREATE INDEX [IDX_tm_mesures_gso_read_mem_date] ON dbo.[tm_mesures_gso_read_mem]([Date_Heure_Read_Mem]);
END;
GO

IF OBJECT_ID(N'dbo.tm_mesures_gso_read_metro', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_mesures_gso_read_metro] (
    [Id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [GSO_SN] VARCHAR(32) NOT NULL,
    [Commande_metro] VARCHAR(32) NOT NULL,
    [Commande_metro_envoyee] BIT NOT NULL CONSTRAINT [DF_tm_mesures_gso_read_metro_CommandeEnvoyee] DEFAULT(0),
    [Metro_en_cours] BIT NOT NULL CONSTRAINT [DF_tm_mesures_gso_read_metro_MetroEnCours] DEFAULT(0),
    [Dernier_Date_MAJ] DATETIME NULL
  );
  CREATE UNIQUE INDEX [UX_tm_mesures_gso_read_metro] ON dbo.[tm_mesures_gso_read_metro]([GSO_SN], [Commande_metro]);
  CREATE INDEX [IDX_tm_mesures_gso_read_metro_Dernier_Date_MAJ] ON dbo.[tm_mesures_gso_read_metro]([Dernier_Date_MAJ]);
END;
GO

IF OBJECT_ID(N'dbo.tm_remontee_plage_gsp', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[tm_remontee_plage_gsp] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Id_Lieu] INT NOT NULL,
    [GSP_SN] VARCHAR(50) NOT NULL,
    [Date_Heure_Debut] DATETIME NOT NULL,
    [Date_Heure_Fin] DATETIME NOT NULL,
    [Statut] VARCHAR(20) NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Statut] DEFAULT('A_FAIRE'),
    [Date_Creation] DATETIME NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Date_Creation] DEFAULT(GETDATE()),
    [Date_Derniere_Maj] DATETIME NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Date_Derniere_Maj] DEFAULT(GETDATE()),
    [Nb_Tentatives] INT NOT NULL CONSTRAINT [DF_tm_remontee_plage_gsp_Nb_Tentatives] DEFAULT(0),
    [Derniere_Erreur] NVARCHAR(MAX) NULL
  );
  CREATE INDEX [IDX_tm_remontee_plage_gsp_lieu_sonde_statut] ON dbo.[tm_remontee_plage_gsp]([Id_Lieu], [GSP_SN], [Statut]);
  CREATE INDEX [IDX_tm_remontee_plage_gsp_debut] ON dbo.[tm_remontee_plage_gsp]([Date_Heure_Debut]);
  CREATE INDEX [IDX_tm_remontee_plage_gsp_fin] ON dbo.[tm_remontee_plage_gsp]([Date_Heure_Fin]);
END;
GO
GO

CREATE OR ALTER VIEW dbo.[v_compteur_valeurs_gso]
AS
select
  [tm_mesures].[Adresse_Sonde] AS [Adresse_Sonde],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -1, getdate())) then 1 else 0 end) AS [quart_0_4=4m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -1, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -2, getdate())) then 1 else 0 end) AS [quart_4_8=4m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -2, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -4, getdate())) then 1 else 0 end) AS [quart_8_16=8m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -4, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -8, getdate())) then 1 else 0 end) AS [quart_16_32=16m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -8, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -16, getdate())) then 1 else 0 end) AS [quart_32_64=32m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -16, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -32, getdate())) then 1 else 0 end) AS [quart_64_128=64m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -32, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -64, getdate())) then 1 else 0 end) AS [quart_128_256=128m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -64, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -128, getdate())) then 1 else 0 end) AS [quart_256_512=256m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] < dateadd(hour, -128, getdate()) and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -175, getdate())) then 1 else 0 end) AS [quart_512_700=188m],
  sum(case when ([tm_mesures].[Date_Heure_Mesure] >= dateadd(minute, -10500, getdate())) then 1 else 0 end) AS [Total]
from dbo.[tm_mesures]
where [tm_mesures].[Adresse_Sonde] like '1__%'
  and [tm_mesures].[Date_Heure_Mesure] >= dateadd(hour, -175, getdate())
group by [tm_mesures].[Adresse_Sonde];
GO

USE [vigi_main];
GO

GO

USE [vigi_main];
GO

CREATE OR ALTER VIEW dbo.[v_tm_mesures_dernier]
AS
select
  [l].[Id_Lieu] AS [Id_Lieu],
  [l].[Sonde_Numero_Serie] AS [Sonde_Numero_Serie],
  [l].[Adresse_Sonde] AS [Adresse_Sonde],
  [l].[Nom_Lieu] AS [Nom_Lieu],
  [l].[Id_Alarme] AS [Id_Alarme],
  [l].[Est_Lieu_En_Alarme] AS [Alarme_en_cours],
  [m].[Valeur] AS [Dernier_Releve],
  [m].[Unite] AS [Unite],
  [m].[Date_Heure_Mesure] AS [Date_Heure_Mesure],
  [m].[COM_sonde] AS [COM_Lecture],
  [m].[Rssi] AS [Signal_Radio],
  [m].[Tension] AS [Tension_Piles],
  case when len(isnull([l].[Adresse_Sonde], '')) > 2 then left([l].[Adresse_Sonde], len([l].[Adresse_Sonde]) - 2) end AS [GSO_SN]
from [vigi_main].[dbo].[t_lieu] [l]
outer apply (
  select top 1
    [m1].[Valeur],
    [m1].[Unite],
    [m1].[Date_Heure_Mesure],
    [m1].[COM_sonde],
    [m1].[Rssi],
    [m1].[Tension]
  from [vigi_mesures].[dbo].[tm_mesures] [m1]
  where [m1].[Id_Lieu] = [l].[Id_Lieu]
  order by [m1].[Date_Heure_Mesure] desc
) [m]
where [l].[Lieu_Etat] = 'S'
  and [l].[Est_Lieu_GSO] = 1;
GO

USE [vigi_mesures];
GO

CREATE OR ALTER VIEW dbo.[v_config_lieu_planning_consignes]
AS
select
  [pl].[Id_Lieu] AS [Id_Lieu],
  [pl].[Date_Heure_Debut_Changement] AS [Date_Heure_Debut_Changement],
  [pl].[Date_Heure_Fin_Changement] AS [Date_Heure_Fin_Changement],
  [pl].[Consigne_Apres] AS [Consigne_Apres],
  [pl].[Tolerance_Surveillance_Sup_Apres] AS [Tolerance_Surveillance_Sup_Apres],
  [pl].[Tolerance_Surveillance_Inf_Apres] AS [Tolerance_Surveillance_Inf_Apres]
from [vigi_main].[dbo].[t_lieu_planning_audit] [pl];
GO

CREATE OR ALTER VIEW dbo.[v_config_lieu_sonde]
AS
SELECT
    [l].[Id_Lieu] AS [Id_Lieu],
    [l].[Sonde_Numero_Serie] AS [Sonde_Numero_Serie],
    LEFT([s].[Adresse_Sonde], LEN([s].[Adresse_Sonde]) - 2) AS [GSO_SN],
    [s].[Port_Serie] AS [Port_Serie],
    [l].[Adresse_Sonde] AS [Adresse_Sonde],
    [l].[Date_Heure_Surveillance_On] AS [Date_Heure_Surveillance_On],
    [l].[Planning_Actif] AS [Planning_Actif],
    [l].[Planning_Regle_Existe] AS [Planning_Regle_Existe],
    [l].[Consigne] AS [Consigne],
    [l].[Tolerance_Surveillance_Sup] AS [Consigne_Sup_Corr],
    [l].[Tolerance_Surveillance_Inf] AS [Consigne_Inf_Corr],
    [l].[Consigne_Sup_Pre_Alarme] AS [Consigne_Sup_Pre_Alarme],
    [l].[Consigne_Inf_Pre_Alarme] AS [Consigne_Inf_Pre_Alarme],
    [l].[Consigne_Base] AS [Consigne_Base],
    [l].[Tolerance_Surveillance_Sup_Base] AS [Tolerance_Surveillance_Sup_Base],
    [l].[Tolerance_Surveillance_Inf_Base] AS [Tolerance_Surveillance_Inf_Base],
    [l].[Retard_Alarme_Haut] AS [Retard_Haut],
    [l].[Retard_Alarme_Bas] AS [Retard_Bas],
    [s].[Sonde_Offset] AS [Sonde_Offset],
    ISNULL([aj].[Coeff_X], 1) AS [coeff_a],
    ISNULL([aj].[Coeff_Constant], 0) AS [coeff_b],
    ROUND(ISNULL(
        CASE
            WHEN [l].[Est_Correction_Ej] = 1 THEN -[l].[Derniere_Erreur_Justesse]
            ELSE 0
        END
    , 0), 2) AS [-(EJ)]
FROM [vigi_main].[dbo].[t_lieu] [l]
LEFT JOIN [vigi_main].[dbo].[t_sonde] [s]
    ON [s].[Sonde_Numero_Serie] = [l].[Sonde_Numero_Serie]
LEFT JOIN (
    SELECT
        [x].[Sonde_Numero_Serie],
        [x].[Coeff_X],
        [x].[Coeff_Constant]
    FROM (
        SELECT
            [a].[Sonde_Numero_Serie],
            [a].[Coeff_X],
            [a].[Coeff_Constant],
            ROW_NUMBER() OVER (
                PARTITION BY [a].[Sonde_Numero_Serie]
                ORDER BY [a].[Date_Heure_Ajustage] DESC
            ) AS [rn]
        FROM [vigi_main].[dbo].[t_ajustage] [a]
    ) [x]
    WHERE [x].[rn] = 1
) [aj]
    ON [aj].[Sonde_Numero_Serie] = [s].[Sonde_Numero_Serie]
WHERE
    [l].[Est_Lieu_GSO] = 1
    AND [l].[Lieu_Etat] = 'S';
GO

CREATE OR ALTER VIEW dbo.[v_config_sonde_com]
AS
SELECT
    [s].[Adresse_Sonde] AS [Adresse_Sonde],
    LEFT([s].[Adresse_Sonde], LEN([s].[Adresse_Sonde]) - 2) AS [GSO_SN],
    [s].[Etat_Sonde] AS [Etat_Sonde],
    [s].[Metrologie_en_cours] AS [Metrologie_en_cours],
    [s].[Metrologie_cmd_envoyee] AS [Metrologie_cmd_envoyee],
    [m].[Port_Serie_Send_GSO] AS [Port_Serie_Send_GSO],
    [m].[Port_Serie] AS [Port_Serie_Real],
    [s].[Sonde_Offset] AS [Sonde_Offset],
    ISNULL([aj].[Coeff_X], 1) AS [coeff_a],
    ISNULL([aj].[Coeff_Constant], 0) AS [coeff_b]
FROM [vigi_main].[dbo].[t_sonde] [s]
INNER JOIN [vigi_main].[dbo].[t_module] [m]
    ON [m].[Port_Serie] = [s].[Port_Serie]
LEFT JOIN (
    SELECT
        [x].[Sonde_Numero_Serie],
        [x].[Coeff_X],
        [x].[Coeff_Constant]
    FROM (
        SELECT
            [ta].[Sonde_Numero_Serie],
            [ta].[Coeff_X],
            [ta].[Coeff_Constant],
            ROW_NUMBER() OVER (
                PARTITION BY [ta].[Sonde_Numero_Serie]
                ORDER BY [ta].[Date_Heure_Ajustage] DESC
            ) AS [rn]
        FROM [vigi_main].[dbo].[t_ajustage] [ta]
    ) [x]
    WHERE [x].[rn] = 1
) [aj]
    ON [aj].[Sonde_Numero_Serie] = [s].[Sonde_Numero_Serie]
WHERE
    [s].[Est_Sonde_GSO] = 1;
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

USE [vigi_mesures];
GO

CREATE OR ALTER PROCEDURE dbo.[usp_EVT_CALCUL_MESURE_MEM_GSO]
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.[tm_mesures_gso_count_mem];

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
    CONCAT('$<EDDT:', CASE WHEN LEN([Adresse_Sonde]) > 2 THEN LEFT([Adresse_Sonde], LEN([Adresse_Sonde]) - 2) END, '(', MIN([numero_releve]), '-', MAX([numero_releve]), ')>') AS [Commande_Mem],
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
  DELETE FROM dbo.[tm_mesures_ajustage_etalon] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -24, GETDATE());
  DELETE FROM dbo.[tm_mesures_etalonnage] WHERE [Date_Heure_Mesure] < DATEADD(HOUR, -24, GETDATE());
  DELETE FROM dbo.[tm_mesures_gso_read_metro] WHERE [Dernier_Date_MAJ] < DATEADD(HOUR, -2, GETDATE());
END;
GO

-- =====================================================================
-- Triggers GSO convertis depuis db/triggersvigisensys.sql
-- =====================================================================
USE [vigi_main];
GO

CREATE OR ALTER TRIGGER dbo.[TRG_GSO_BEF_DEL_ALARME]
ON dbo.[t_alarme]
AFTER DELETE
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[t_alarme_histo]
  ([Id_Alarme],[Date_Heure_Debut],[Valeur],[Type],[Date_Heure_Fin],[Id_Lieu],[Sonde_Numero_Serie],[Unite],[Est_Acquittee],[Date_Heure_Derniere_Mesure],[Est_Alarme_Pour_VigiTel],[Est_Mail_Envoye],[Est_Tel_Acquittee],[Date_Heure_Acquittement])
  SELECT
    d.[Id_Alarme],
    d.[Date_Heure_Debut],
    d.[Valeur],
    d.[Type],
    d.[Date_Heure_Fin],
    d.[Id_Lieu],
    d.[Sonde_Numero_Serie],
    d.[Unite],
    d.[Est_Acquittee],
    d.[Date_Heure_Derniere_Mesure],
    d.[Est_Alarme_Pour_VigiTel],
    d.[Est_Mail_Envoye],
    d.[Est_Tel_Acquittee],
    GETDATE()
  FROM deleted d;
END;
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
          BEGIN
            UPDATE dbo.[t_alarme] SET [Date_Heure_Fin] = @Derniere_Date_Heure, [Date_Heure_Derniere_Mesure] = @Derniere_Date_Heure WHERE [Id_Alarme] = @v_Id_Alarme;
            SET @New_Id_Alarme = 0; SET @New_Est_Lieu_En_Alarme = 0; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee = 1; SET @New_Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0; SET @ApplyUpdate = 1;
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
      @Derniere_Valeur,@Tolerance_Surveillance_Inf,@Tolerance_Surveillance_Sup,@Retard_Alarme_Bas,@Retard_Alarme_Haut,@Sonde_Numero_Serie,
      @Date_Heure_Last_Update_EVT_GSO,@Derniere_Unite,@Date_Heure_Derniere_Reponse_Recue_OK,@Id_Alarme,@Est_Lieu_En_Alarme,@Est_Lieu_En_Pre_Alarme,
      @Est_Lieu_Alarme_Terminee_Non_Acquittee,@Est_Lieu_Alarme_Terminee_Non_Acquittee_T1,@Est_Consigne_Inf_Pre_Alarme_Active,@Consigne_Inf_Pre_Alarme,
      @Est_Consigne_Sup_Pre_Alarme_Active,@Consigne_Sup_Pre_Alarme;
  END

  CLOSE cur;
  DEALLOCATE cur;
END;
GO

USE [vigi_mesures];
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_GSO_CMD_MEM]
ON dbo.[tm_mesures_gso_commandes_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE c
  SET [Port_Serie_Send_GSO] = v.[Port_Serie_Send_GSO]
  FROM dbo.[tm_mesures_gso_commandes_mem] c
  JOIN inserted i
    ON i.[GSO_SN] = c.[GSO_SN]
   AND i.[Commande_Globale_Begin] = c.[Commande_Globale_Begin]
   AND i.[Commande_Globale_End] = c.[Commande_Globale_End]
  JOIN dbo.[v_config_sonde_com] v
    ON v.[GSO_SN] = i.[GSO_SN]
  WHERE c.[Port_Serie_Send_GSO] IS NULL;
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_GSO_READ_MEM]
ON dbo.[tm_mesures_gso_read_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[tm_mesures_gso_read_metro] ([GSO_SN], [Commande_metro], [Commande_metro_envoyee], [Dernier_Date_MAJ])
  SELECT i.[GSO_SN], i.[Ecart], 1, i.[Date_Heure_Read_Mem]
  FROM inserted i
  WHERE i.[Ecart] = '0-1'
    AND EXISTS (SELECT 1 FROM dbo.[v_config_sonde_com] v WHERE v.[GSO_SN] = i.[GSO_SN] AND v.[Metrologie_en_cours] = 1)
    AND NOT EXISTS (
      SELECT 1 FROM dbo.[tm_mesures_gso_read_metro] x WHERE x.[GSO_SN] = i.[GSO_SN] AND x.[Commande_metro] = i.[Ecart]
    );
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_MES_GSO]
ON dbo.[tm_mesures_gso]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.[tm_mesures_gso_build]
  ([Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[Rssi],[Tension],[COM_sonde],[Est_Mesure_Repeteur_GSO],[Id_Lieu],[Est_Valeur_Memoire],[Planning_Actif],[Planning_Regle_Existe])
  SELECT
    i.[date_mesure],
    i.[tep],
    i.[unite],
    i.[id_capteur],
    i.[rssi],
    i.[tension],
    i.[COM_sonde],
    CASE WHEN i.[trame] = 0x0000000000989680 THEN 1 ELSE 0 END,
    v.[Id_Lieu],
    CASE WHEN i.[date_mesure] <= DATEADD(MINUTE, -45, GETDATE()) THEN 1 ELSE 0 END,
    v.[Planning_Actif],
    v.[Planning_Regle_Existe]
  FROM inserted i
  JOIN dbo.[v_config_lieu_sonde] v ON v.[Adresse_Sonde] = i.[id_capteur]
  WHERE i.[trame] IN (0x0000000000000000, 0x0000000000000001, 0x0000000000989680)
    AND i.[date_mesure] >= DATEADD(HOUR, -192, GETDATE());

  INSERT INTO dbo.[tm_mesures_ajustage] ([Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde])
  SELECT i.[date_mesure], i.[tep], i.[unite], i.[id_capteur]
  FROM inserted i
  WHERE EXISTS (SELECT 1 FROM dbo.[v_config_sonde_com] v WHERE v.[Adresse_Sonde] = i.[id_capteur])
    AND i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());

  INSERT INTO dbo.[tm_mesures_etalonnage] ([Valeur],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde])
  SELECT
    ROUND((i.[tep] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0), 2),
    i.[date_mesure],
    i.[tep],
    i.[unite],
    i.[id_capteur]
  FROM inserted i
  JOIN dbo.[v_config_sonde_com] v ON v.[Adresse_Sonde] = i.[id_capteur]
  WHERE i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());

  UPDATE m
  SET [Metro_en_cours] = 1,
      [Dernier_Date_MAJ] = i.[date_mesure]
  FROM dbo.[tm_mesures_gso_read_metro] m
  JOIN inserted i
    ON m.[GSO_SN] = CASE WHEN LEN(i.[id_capteur]) > 2 THEN LEFT(i.[id_capteur], LEN(i.[id_capteur]) - 2) ELSE i.[id_capteur] END
  WHERE i.[trame] IN (0x000000000000000A, 0x000000000000006E)
    AND i.[date_mesure] >= DATEADD(HOUR, -2, GETDATE());
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_AFT_INS_MES_GSO_BUILD]
ON dbo.[tm_mesures_gso_build]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH src AS (
    SELECT
      i.[Date_Heure_Mesure],
      i.[Valeur_Brute],
      i.[Unite],
      i.[Adresse_Sonde],
      i.[COM_sonde],
      i.[Est_Mesure_Repeteur_GSO],
      i.[Id_Lieu],
      i.[Rssi],
      i.[Tension],
      i.[Est_Valeur_Memoire],
      i.[Planning_Actif],
      i.[Planning_Regle_Existe],
      v.[Sonde_Numero_Serie],
      v.[Consigne],
      v.[Consigne_Sup_Corr],
      v.[Consigne_Inf_Corr],
      v.[Consigne_Sup_Pre_Alarme],
      v.[Consigne_Inf_Pre_Alarme],
      v.[Consigne_Base],
      v.[Tolerance_Surveillance_Sup_Base],
      v.[Tolerance_Surveillance_Inf_Base],
      v.[coeff_a],
      v.[coeff_b],
      v.[Sonde_Offset],
      v.[-(EJ)] AS [NegEJ],
      p.[Consigne_Apres],
      p.[Tolerance_Surveillance_Sup_Apres],
      p.[Tolerance_Surveillance_Inf_Apres],
      ROUND((i.[Valeur_Brute] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0) + ISNULL(v.[-(EJ)], 0), 2) AS [ValeurCalc]
    FROM inserted i
    JOIN dbo.[v_config_lieu_sonde] v ON v.[Id_Lieu] = i.[Id_Lieu]
    OUTER APPLY (
      SELECT TOP 1
        pc.[Consigne_Apres],
        pc.[Tolerance_Surveillance_Sup_Apres],
        pc.[Tolerance_Surveillance_Inf_Apres]
      FROM dbo.[v_config_lieu_planning_consignes] pc
      WHERE pc.[Id_Lieu] = i.[Id_Lieu]
        AND (
          i.[Date_Heure_Mesure] BETWEEN pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement]
          OR (i.[Date_Heure_Mesure] > pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement] IS NULL)
        )
    ) p
  )
  INSERT INTO dbo.[tm_mesures]
  ([Valeur],[Sonde_Numero_Serie],[Consigne],[Consigne_Sup],[Consigne_Inf],[Consigne_Sup_Pre_Alarme],[Consigne_Inf_Pre_Alarme],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[COM_sonde],[Est_Mesure_Repeteur_GSO],[Id_Lieu],[Rssi],[Tension],[Est_Valeur_Memoire],[Planning_Actif],[Planning_Regle_Existe])
  SELECT
    s.[ValeurCalc],
    s.[Sonde_Numero_Serie],
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Consigne_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne])
      ELSE s.[Consigne]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Tolerance_Surveillance_Sup_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Sup_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Consigne_Sup_Corr])
      ELSE s.[Consigne_Sup_Corr]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Tolerance_Surveillance_Inf_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Inf_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Consigne_Inf_Corr])
      ELSE s.[Consigne_Inf_Corr]
    END,
    s.[Consigne_Sup_Pre_Alarme],
    s.[Consigne_Inf_Pre_Alarme],
    s.[Date_Heure_Mesure],
    s.[Valeur_Brute],
    s.[Unite],
    s.[Adresse_Sonde],
    s.[COM_sonde],
    s.[Est_Mesure_Repeteur_GSO],
    s.[Id_Lieu],
    s.[Rssi],
    s.[Tension],
    s.[Est_Valeur_Memoire],
    s.[Planning_Actif],
    s.[Planning_Regle_Existe]
  FROM src s;

  ;WITH src AS (
    SELECT
      i.[Date_Heure_Mesure],
      i.[Valeur_Brute],
      i.[Unite],
      i.[Adresse_Sonde],
      i.[COM_sonde],
      i.[Est_Mesure_Repeteur_GSO],
      i.[Id_Lieu],
      i.[Rssi],
      i.[Tension],
      i.[Est_Valeur_Memoire],
      i.[Planning_Actif],
      i.[Planning_Regle_Existe],
      v.[Sonde_Numero_Serie],
      v.[Consigne],
      v.[Consigne_Sup_Corr],
      v.[Consigne_Inf_Corr],
      v.[Consigne_Sup_Pre_Alarme],
      v.[Consigne_Inf_Pre_Alarme],
      v.[Consigne_Base],
      v.[Tolerance_Surveillance_Sup_Base],
      v.[Tolerance_Surveillance_Inf_Base],
      v.[coeff_a],
      v.[coeff_b],
      v.[Sonde_Offset],
      v.[-(EJ)] AS [NegEJ],
      p.[Consigne_Apres],
      p.[Tolerance_Surveillance_Sup_Apres],
      p.[Tolerance_Surveillance_Inf_Apres],
      ROUND((i.[Valeur_Brute] * v.[coeff_a]) + v.[coeff_b] + ISNULL(v.[Sonde_Offset], 0) + ISNULL(v.[-(EJ)], 0), 2) AS [ValeurCalc]
    FROM inserted i
    JOIN dbo.[v_config_lieu_sonde] v ON v.[Id_Lieu] = i.[Id_Lieu]
    OUTER APPLY (
      SELECT TOP 1
        pc.[Consigne_Apres],
        pc.[Tolerance_Surveillance_Sup_Apres],
        pc.[Tolerance_Surveillance_Inf_Apres]
      FROM dbo.[v_config_lieu_planning_consignes] pc
      WHERE pc.[Id_Lieu] = i.[Id_Lieu]
        AND (
          i.[Date_Heure_Mesure] BETWEEN pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement]
          OR (i.[Date_Heure_Mesure] > pc.[Date_Heure_Debut_Changement] AND pc.[Date_Heure_Fin_Changement] IS NULL)
        )
    ) p
  )
  INSERT INTO dbo.[tm_graphique]
  ([Valeur],[Sonde_Numero_Serie],[Consigne],[Consigne_Sup],[Consigne_Inf],[Consigne_Sup_Pre_Alarme],[Consigne_Inf_Pre_Alarme],[Date_Heure_Mesure],[Valeur_Brute],[Unite],[Adresse_Sonde],[Id_Lieu])
  SELECT
    s.[ValeurCalc],
    s.[Sonde_Numero_Serie],
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Consigne_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Consigne_Apres], s.[Consigne])
      ELSE s.[Consigne]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Tolerance_Surveillance_Sup_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Sup_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Sup_Apres], s.[Consigne_Sup_Corr])
      ELSE s.[Consigne_Sup_Corr]
    END,
    CASE
      WHEN s.[Planning_Actif] = 1 AND s.[Est_Valeur_Memoire] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Tolerance_Surveillance_Inf_Base])
      WHEN s.[Planning_Actif] = 1 THEN s.[Tolerance_Surveillance_Inf_Apres]
      WHEN s.[Est_Valeur_Memoire] = 1 AND s.[Planning_Regle_Existe] = 1 THEN COALESCE(s.[Tolerance_Surveillance_Inf_Apres], s.[Consigne_Inf_Corr])
      ELSE s.[Consigne_Inf_Corr]
    END,
    s.[Consigne_Sup_Pre_Alarme],
    s.[Consigne_Inf_Pre_Alarme],
    s.[Date_Heure_Mesure],
    s.[Valeur_Brute],
    s.[Unite],
    s.[Adresse_Sonde],
    s.[Id_Lieu]
  FROM src s;
END;
GO

CREATE OR ALTER TRIGGER dbo.[TRG_BEF_INS_GSO_COUNT]
ON dbo.[tm_mesures_gso_count_mem]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE c
  SET [Port_Serie_Send_GSO] = v.[Port_Serie_Send_GSO]
  FROM dbo.[tm_mesures_gso_count_mem] c
  JOIN inserted i
    ON i.[GSO_SN] = c.[GSO_SN]
   AND i.[Missing_Data_Begin] = c.[Missing_Data_Begin]
   AND i.[Missing_Data_End] = c.[Missing_Data_End]
  JOIN dbo.[v_config_sonde_com] v
    ON v.[GSO_SN] = i.[GSO_SN]
  WHERE c.[Port_Serie_Send_GSO] IS NULL;
END;
GO
