-- Configuration VigiSensys - notifications Teams via Microsoft Teams Workflows webhook.
-- Remplacer WEBHOOK_URL par l'URL generee dans Teams/Workflows.
-- La valeur peut etre stockee en clair pour un demarrage rapide ; si elle est
-- sauvegardee plus tard via une API/admin VigiSensys, elle sera chiffree.

INSERT INTO t_parametre (Section, Mot_Cle, Valeur, Commentaire)
VALUES
  ('NOTIFICATIONS_TEAMS', 'ENABLED', 'false', 'Active les notifications Teams via webhook Workflows.'),
  ('NOTIFICATIONS_TEAMS', 'WEBHOOK_URL', '', 'URL du webhook Teams Workflows. Secret a proteger.'),
  ('NOTIFICATIONS_TEAMS', 'CHANNEL_LABEL', '', 'Nom lisible du canal Teams cible.'),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_TRIGGER', 'true', 'Envoie un message Teams au declenchement alarme.'),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_END', 'true', 'Envoie un message Teams a la fin alarme.'),
  ('NOTIFICATIONS_TEAMS', 'NOTIFY_ON_ACK', 'false', 'Reserve pour notification Teams a l acquittement.'),
  ('NOTIFICATIONS_TEAMS', 'TIMEOUT_MS', '5000', 'Timeout HTTP du webhook Teams en millisecondes.'),
  ('NOTIFICATIONS_TEAMS', 'DEDUPE_WINDOW_MINUTES', '10', 'Fenetre anti-doublon Teams par alarme/evenement.')
ON DUPLICATE KEY UPDATE
  Valeur = t_parametre.Valeur,
  Commentaire = VALUES(Commentaire);

-- Activation apres ajout de l URL :
-- UPDATE t_parametre SET Valeur = 'https://...' WHERE Section = 'NOTIFICATIONS_TEAMS' AND Mot_Cle = 'WEBHOOK_URL';
-- UPDATE t_parametre SET Valeur = 'true' WHERE Section = 'NOTIFICATIONS_TEAMS' AND Mot_Cle = 'ENABLED';
