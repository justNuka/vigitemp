-- MySQL - base existante
USE `vigi_main`;

ALTER TABLE `t_alarme`
  ADD COLUMN `Est_Mail_Fin_Envoye` tinyint(1) NOT NULL DEFAULT '0'
  AFTER `Est_Mail_Envoye`;
