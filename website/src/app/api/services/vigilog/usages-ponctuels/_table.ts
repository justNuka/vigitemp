import { prisma } from "@/lib/prisma"

const CREATE_TEMP_USAGE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS t_vigilog_usage_ponctuel (
  Id_VigiLog_Usage_Ponctuel INT NOT NULL AUTO_INCREMENT,
  Reference_Usage VARCHAR(50) NOT NULL,
  Id_VigiLog_Configuration INT NULL,
  Id_VigiLog INT NULL,
  Nom_Configuration VARCHAR(100) NOT NULL,
  Numero_Serie_VigiLog VARCHAR(30) NOT NULL,
  Nom_Lieu_Temporaire VARCHAR(120) NOT NULL,
  Statut VARCHAR(30) NOT NULL,
  Id_Utilisateur_Demarrage INT NOT NULL,
  Date_Heure_Demarrage DATETIME NOT NULL,
  Commentaire_Demarrage TEXT NULL,
  Id_Utilisateur_Arret INT NULL,
  Date_Heure_Arret DATETIME NULL,
  Commentaire_Arret TEXT NULL,
  Date_Heure_Creation DATETIME NOT NULL,
  Date_Heure_Maj DATETIME NULL,
  PRIMARY KEY (Id_VigiLog_Usage_Ponctuel),
  UNIQUE KEY UK_t_vigilog_usage_ponctuel_reference (Reference_Usage),
  KEY IDX_t_vigilog_usage_ponctuel_statut (Statut),
  KEY IDX_t_vigilog_usage_ponctuel_logger (Numero_Serie_VigiLog),
  KEY IDX_t_vigilog_usage_ponctuel_started_by (Id_Utilisateur_Demarrage),
  KEY IDX_t_vigilog_usage_ponctuel_stopped_by (Id_Utilisateur_Arret),
  CONSTRAINT FK_t_vigilog_usage_ponctuel_configuration
    FOREIGN KEY (Id_VigiLog_Configuration)
    REFERENCES t_vigilog_configuration (Id_VigiLog_Configuration),
  CONSTRAINT FK_t_vigilog_usage_ponctuel_logger
    FOREIGN KEY (Id_VigiLog)
    REFERENCES t_vigilog (Id_VigiLog),
  CONSTRAINT FK_t_vigilog_usage_ponctuel_user_start
    FOREIGN KEY (Id_Utilisateur_Demarrage)
    REFERENCES t_utilisateur (Id_Utilisateur),
  CONSTRAINT FK_t_vigilog_usage_ponctuel_user_stop
    FOREIGN KEY (Id_Utilisateur_Arret)
    REFERENCES t_utilisateur (Id_Utilisateur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`

let ensured = false

export async function ensureVigilogTemporaryUsageTable() {
  if (ensured) return
  await prisma.$executeRawUnsafe(CREATE_TEMP_USAGE_TABLE_SQL)
  ensured = true
}
