"use cache";

import { cacheTag } from "next/cache";
import { prismaMesure } from "@/lib/prisma";

/**
 * Composant serveur pour charger les logs d'audit depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAuditLogs(limit = 100) {
  "use cache";
  cacheTag("audit-logs");

  const logs = await prismaMesure.ts_journal.findMany({
    take: limit,
    orderBy: { DateHeureJournal: "desc" },
    select: {
      IdJournal: true,
      DateHeureJournal: true,
      CodeJournal: true,
      Commentaire: true,
      NomUtilisateur: true,
      IdLieu: true,
    },
  });

  // Transform to AuditLog format
  const formatted = logs.map((log) => ({
    id: log.IdJournal.toString(),
    userId: log.NomUtilisateur || null,
    action: log.CodeJournal || "unknown",
    details: log.Commentaire || null,
    targetType: log.IdLieu ? "sensor" : null,
    targetId: log.IdLieu?.toString() || null,
    timestamp: log.DateHeureJournal || new Date(),
    ipAddress: null,
  }));

  return formatted;
}

/**
 * Composant serveur pour obtenir les statistiques d'audit
 */
export async function ServerAuditStats() {
  "use cache";
  cacheTag("audit-stats");

  const totalLogs = await prismaMesure.ts_journal.count();

  // Get logs from last 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentLogs = await prismaMesure.ts_journal.count({
    where: {
      DateHeureJournal: {
        gte: yesterday,
      },
    },
  });

  return {
    total: totalLogs,
    last24h: recentLogs,
  };
}
