-- Mettre Ã  jour le mot de passe de l'utilisateur admin
UPDATE `t_utilisateur` 
SET `Mot_de_passe` = '',
    `MotDePasseTemporaire` = TRUE,
    `DateDerniereModificationMDP` = NOW()
WHERE `Login` = 'admin' OR `Login` = 'Admin' OR `IdUtilisateur` = 1;
