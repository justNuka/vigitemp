-- Insérer l'utilisateur Elias Boez
INSERT INTO `t_utilisateur` (
  `IdUtilisateur`,
  `Login`,
  `Mot_de_passe`,
  `Prenom`,
  `Nom`,
  `Adresse_Email`,
  `ProfilUtilisateur`,
  `Archive`,
  `Date_Creation`,
  `DateDerniereModificationMDP`,
  `MotDePasseTemporaire`,
  `Date_Validite`
) VALUES (
  2,
  'EBO',
  '$2b$10$kHPjff171QoyCI2XNnJbhOOT1R0k8i980fQYg0C3osNpsvoTBYkJW',
  'Elias',
  'Boez',
  'e.boez@mc2lab.fr',
  'Administrateurs',
  FALSE,
  NOW(),
  NOW(),
  TRUE,
  NULL
);
