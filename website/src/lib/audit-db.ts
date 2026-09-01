import { prismaMesure } from "@/lib/prisma";
import { log } from "@/lib/logger";

function isSqlServerProvider() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  return provider === "mssql" || provider === "sqlserver";
}

/**
 * Ecrit un evenement d'audit dans la base de donnees mesure (table tm_journal).
 * Cette fonction est appelee en parallele du logging fichier.
 */
export async function writeAuditToDatabase(params: {
  codeJournal: string;
  username?: string;
  userProfile?: string;
  lieuId?: number;
  commentaire?: string;
  commentaireUtilisateur?: string;
}) {
  try {
    const SERVEUR_ID = 1;

    if (isSqlServerProvider()) {
      await prismaMesure.$executeRaw`
        INSERT INTO tm_journal (
          Id_Serveur_BDD,
          Code_Journal,
          Nom_Utilisateur,
          Profil_Utilisateur,
          Date_Heure_Journal,
          Id_Lieu,
          Commentaire,
          Commentaire_Utilisateur
        )
        VALUES (
          ${SERVEUR_ID},
          ${params.codeJournal},
          ${params.username || ""},
          ${params.userProfile || ""},
          ${new Date()},
          ${params.lieuId || null},
          ${params.commentaire || null},
          ${params.commentaireUtilisateur || null}
        )
      `;
      return;
    }

    const TABLE_NAME = "tm_journal";

    await prismaMesure.tm_compteur_id_table.upsert({
      where: {
        Id_Serveur_BDD_Nom_Table: {
          Id_Serveur_BDD: SERVEUR_ID,
          Nom_Table: TABLE_NAME,
        },
      },
      update: {},
      create: {
        Id_Serveur_BDD: SERVEUR_ID,
        Nom_Table: TABLE_NAME,
        Compteur_Id: 0,
      },
    });

    const counter = await prismaMesure.tm_compteur_id_table.update({
      where: {
        Id_Serveur_BDD_Nom_Table: {
          Id_Serveur_BDD: SERVEUR_ID,
          Nom_Table: TABLE_NAME,
        },
      },
      data: {
        Compteur_Id: {
          increment: 1,
        },
      },
    });

    const nextId = counter.Compteur_Id || 1;

    await prismaMesure.tm_journal.create({
      data: {
        Id_Serveur_BDD: SERVEUR_ID,
        Id_Journal: nextId,
        Code_Journal: params.codeJournal,
        Nom_Utilisateur: params.username || "",
        Profil_Utilisateur: params.userProfile || "",
        Date_Heure_Journal: new Date(),
        Id_Lieu: params.lieuId || null,
        Commentaire: params.commentaire || null,
        Commentaire_Utilisateur: params.commentaireUtilisateur || null,
      },
    });
  } catch (error) {
    log.error("audit-db", "audit_write_failed", { error });
  }
}
