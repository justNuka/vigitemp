import { prismaMesure } from "@/lib/prisma";

/**
 * Écrit un événement d'audit dans la base de données mesure (table ts_journal)
 * Cette fonction est appelée en parallèle du logging fichier
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
    // Récupérer le dernier IdJournal pour l'incrémenter
    const lastJournal = await prismaMesure.ts_journal.findFirst({
      where: { IdServeurBDD: 1 },
      orderBy: { IdJournal: "desc" },
    });

    const nextId = (lastJournal?.IdJournal || 0) + 1;

    // Écrire dans ts_journal
    await prismaMesure.ts_journal.create({
      data: {
        IdServeurBDD: 1,
        IdJournal: nextId,
        CodeJournal: params.codeJournal,
        NomUtilisateur: params.username || "",
        ProfilUtilisateur: params.userProfile || "",
        DateHeureJournal: new Date(),
        IdLieu: params.lieuId || null,
        Commentaire: params.commentaire || null,
        CommentaireUtilisateur: params.commentaireUtilisateur || null,
      },
    });
  } catch (error) {
    // Ne pas bloquer l'application si l'écriture en BDD échoue
    console.error("[AUDIT DB ERROR]", error);
  }
}
