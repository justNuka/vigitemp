-- Add MotDePasseTemporaire column to t_utilisateur table
ALTER TABLE t_utilisateur 
  ADD COLUMN MotDePasseTemporaire BOOLEAN DEFAULT FALSE;
