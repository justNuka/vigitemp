"use cache";

import { cacheTag } from "next/cache";
import { prismaMesure } from "@/lib/prisma";

/**
 * Composant serveur pour charger les logs d'audit depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAuditLogs(limit = 100, codeFilter?: string) {
  "use cache";
  cacheTag("audit-logs");

  const whereClause = codeFilter 
    ? { Code_Journal: codeFilter }
    : {};

  const logs = await prismaMesure.tm_journal.findMany({
    where: whereClause,
    take: limit,
    orderBy: { Date_Heure_Journal: "desc" },
    select: {
      Id_Journal: true,
      Date_Heure_Journal: true,
      Code_Journal: true,
      Commentaire: true,
      Nom_Utilisateur: true,
      Id_Lieu: true,
    },
  });

  // Transform to AuditLog format
  const formatted = logs.map((log) => ({
    id: log.Id_Journal.toString(),
    userId: log.Nom_Utilisateur || null,
    action: log.Code_Journal || "unknown",
    details: log.Commentaire || null,
    targetType: log.Id_Lieu ? "sensor" : null,
    targetId: log.Id_Lieu?.toString() || null,
    timestamp: log.Date_Heure_Journal || new Date(),
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

  const totalLogs = await prismaMesure.tm_journal.count();

  // Get logs from last 24h
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentLogs = await prismaMesure.tm_journal.count({
    where: {
      Date_Heure_Journal: {
        gte: yesterday,
      },
    },
  });

  return {
    total: totalLogs,
    last24h: recentLogs,
  };
}
