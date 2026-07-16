-- SQL Server - base existante
USE [vigi_main];
GO

IF COL_LENGTH(N'dbo.t_alarme', N'Est_Mail_Fin_Envoye') IS NULL
BEGIN
  ALTER TABLE dbo.[t_alarme]
    ADD [Est_Mail_Fin_Envoye] BIT NOT NULL
      CONSTRAINT [DF_t_alarme_Est_Mail_Fin_Envoye] DEFAULT(0);
END;
GO
