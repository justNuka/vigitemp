-- Vérifier et ajouter la colonne DateDerniereModificationMDP si elle n'existe pas
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'vigitemp_ifb' 
  AND TABLE_NAME = 't_utilisateur' 
  AND COLUMN_NAME = 'DateDerniereModificationMDP';
