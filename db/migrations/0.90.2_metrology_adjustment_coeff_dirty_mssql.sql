-- VigiSensys DB 0.90.2
-- SQL Server
--
-- Ajoute un drapeau de synchronisation des coefficients directement sur
-- t_ajustage. Ce drapeau est réservé aux parcours Ajustage / Étalonnage et
-- remplace l'utilisation de t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure
-- pour ces opérations.

IF COL_LENGTH('dbo.t_ajustage', 'Coeffs_Modifies_Depuis_Derniere_Mesure') IS NULL
BEGIN
    ALTER TABLE dbo.t_ajustage
        ADD Coeffs_Modifies_Depuis_Derniere_Mesure bit NOT NULL
            CONSTRAINT DF_t_ajustage_Coeffs_Modifies DEFAULT (0);
END;
GO
