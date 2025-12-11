SELECT IdUtilisateur, Login, Prenom, Nom, Adresse_Email, ProfilUtilisateur, MotDePasseTemporaire 
FROM `t_utilisateur` 
WHERE Login = 'EBO' OR IdUtilisateur = 2;
