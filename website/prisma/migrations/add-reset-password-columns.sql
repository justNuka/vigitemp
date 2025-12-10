-- Add ResetPasswordToken and ResetPasswordExpires columns to t_utilisateur table
ALTER TABLE t_utilisateur 
  ADD COLUMN ResetPasswordToken VARCHAR(255) NULL,
  ADD COLUMN ResetPasswordExpires DATETIME NULL;
