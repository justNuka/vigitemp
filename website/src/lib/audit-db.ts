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
    const lastJournal = await prismaMesure.tm_journal.findFirst({
      where: { Id_Serveur_BDD: 1 },
      orderBy: { Id_Journal: "desc" },
    });

    const nextId = (lastJournal?.Id_Journal || 0) + 1;
    // Écrire dans ts_journal
    await prismaMesure.tm_journal.create({
      data: {
        Id_Serveur_BDD: 1,
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
