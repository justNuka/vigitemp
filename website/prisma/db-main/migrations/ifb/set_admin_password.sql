UPDATE `t_utilisateur` 
SET `Mot_de_passe` = '$2b$10$tc2Ry.GmGvb/ehj1CmNMpu4tYZ9KOZ66g5geTDlu/MflbxhsZ4RNO',
    `MotDePasseTemporaire` = TRUE,
    `DateDerniereModificationMDP` = NOW()
WHERE `Login` = 'admin' OR `Login` = 'Admin' OR `IdUtilisateur` = 1;
