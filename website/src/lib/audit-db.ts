import { prismaMesure } from "@/lib/prisma";

/**
 * Écrit un événement d'audit dans la base de données mesure (table tm_journal)
 * Cette fonction est appelée en parallèle du logging fichier
 * 
 * Utilise la table tm_compteur_id_table pour gérer les IDs de manière thread-safe
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
    const TABLE_NAME = "tm_journal";

    // Utiliser la table de compteur pour obtenir le prochain ID de manière thread-safe
    const counter = await prismaMesure.tm_compteur_id_table.upsert({
      where: {
        Id_Serveur_BDD_Nom_Table: {
          Id_Serveur_BDD: SERVEUR_ID,
          Nom_Table: TABLE_NAME,
        },
      },
      update: {
        Compteur_Id: {
          increment: 1,
        },
      },
      create: {
        Id_Serveur_BDD: SERVEUR_ID,
        Nom_Table: TABLE_NAME,
        Compteur_Id: 1,
      },
    });

    const nextId = counter.Compteur_Id || 1;

    // Écrire dans tm_journal avec l'ID géré par le compteur
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
    // Ne pas bloquer l'application si l'écriture en BDD échoue
    console.error("[AUDIT DB ERROR]", error);
  }
}
