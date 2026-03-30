INSERT INTO tm_journal_code (Code_Journal, Commentaire)
SELECT 'GRPH', 'Ouverture d''un graphique %1'
WHERE NOT EXISTS (
  SELECT 1 FROM tm_journal_code WHERE Code_Journal = 'GRPH'
);

INSERT INTO t_parametre (Section, Mot_Cle, Valeur, Commentaire)
SELECT 'DASHBOARD', 'AUDIT_GRAPH_OPENINGS', 'false', 'Activer l''audit trail a l''ouverture des graphiques'
WHERE NOT EXISTS (
  SELECT 1
  FROM t_parametre
  WHERE UPPER(Section) = 'DASHBOARD'
    AND UPPER(Mot_Cle) = 'AUDIT_GRAPH_OPENINGS'
);
