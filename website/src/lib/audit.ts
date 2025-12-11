import { prismaMesure } from "./prisma";

/**
 * Types d'événements audit
 * Correspond aux codes dans la table ts_journal_code
 */
export const AUDIT_CODES = {
  CONNEXION: "CONNEXION",
  DECONNEXION: "DECONNEXION",
  CR: "CR", // Changement de retard d'alarme
  CS: "CS", // Changement de sonde
} as const;

export type AuditCode = typeof AUDIT_CODES[keyof typeof AUDIT_CODES];

interface CreateAuditLogParams {
  code: AuditCode;
  username: string;
  userProfile?: string;
  comment?: string;
  userComment?: string;
  idLieu?: number;
}

/**
 * Créer une entrée dans le journal d'audit
 */
export async function createAuditLog({
  code,
  username,
  userProfile = "user",
  comment,
  userComment,
  idLieu,
}: CreateAuditLogParams) {
  try {
    // Récupérer le prochain ID de journal
    const maxId = await prismaMesure.ts_journal.aggregate({
      _max: {
        IdJournal: true,
      },
      where: {
        IdServeurBDD: 0,
      },
    });

    const nextId = (maxId._max.IdJournal || 0) + 1;

    // Créer l'entrée d'audit
    await prismaMesure.ts_journal.create({
      data: {
        IdServeurBDD: 0,
        IdJournal: nextId,
        CodeJournal: code,
        NomUtilisateur: username,
        ProfilUtilisateur: userProfile,
        DateHeureJournal: new Date(),
        Commentaire: comment,
        CommentaireUtilisateur: userComment,
        IdLieu: idLieu,
      },
    });

    console.log(`[Audit] ${code} - User: ${username}`);
  } catch (error) {
    console.error("[Audit] Erreur lors de la création de l'audit:", error);
    // Ne pas faire échouer l'opération principale si l'audit échoue
  }
}

/**
 * Récupérer les logs d'audit avec pagination et filtres
 */
export async function getAuditLogs({
  page = 1,
  limit = 50,
  username,
  code,
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  username?: string;
  code?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const skip = (page - 1) * limit;

  const where: any = {
    IdServeurBDD: 0,
  };

  if (username) {
    where.NomUtilisateur = {
      contains: username,
    };
  }

  if (code) {
    where.CodeJournal = code;
  }

  if (startDate || endDate) {
    where.DateHeureJournal = {};
    if (startDate) {
      where.DateHeureJournal.gte = startDate;
    }
    if (endDate) {
      where.DateHeureJournal.lte = endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prismaMesure.ts_journal.findMany({
      where,
      orderBy: {
        DateHeureJournal: "desc",
      },
      take: limit,
      skip,
    }),
    prismaMesure.ts_journal.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
