-- Create t_liaison_utilisateur_site table for many-to-many relationship
-- Allows users to be assigned to multiple sites
-- This replaces the single IdSite foreign key in t_utilisateur (kept for backward compatibility)

CREATE TABLE t_liaison_utilisateur_site (
  IdLiaison INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  IdUtilisateur INT NOT NULL,
  IdSite INT NOT NULL,
  DateAffectation DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT FK_UTILISATEUR_LIAISON_SITE FOREIGN KEY (IdUtilisateur) 
    REFERENCES t_utilisateur(IdUtilisateur) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT FK_SITE_LIAISON_UTILISATEUR FOREIGN KEY (IdSite) 
    REFERENCES t_site(IdSite) ON DELETE CASCADE ON UPDATE NO ACTION,
    
  UNIQUE KEY UK_USER_SITE (IdUtilisateur, IdSite),
  INDEX IDX_IdUtilisateur (IdUtilisateur),
  INDEX IDX_IdSite (IdSite),
  INDEX IDX_DateAffectation (DateAffectation)
);

-- Add indexes for better query performance
CREATE INDEX idx_liaison_user_site_composite ON t_liaison_utilisateur_site(IdUtilisateur, IdSite);
