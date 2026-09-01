"use cache";

import { cacheTag } from "next/cache";
import { loadRecentAuditLogs } from "@/lib/audit/enrich-audit-logs";
import { prismaMesure } from "@/lib/prisma";

/**
 * Charge les logs d'audit depuis la base de données mesure
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAuditLogs(limit = 100, codeFilter?: string) {
  "use cache";
  cacheTag("audit-logs");

  return loadRecentAuditLogs(limit, codeFilter);
}

/**
 * Statistiques d'audit (total + 24h)
 */
export async function ServerAuditStats() {
  "use cache";
  cacheTag("audit-stats");

  const totalLogs = await prismaMesure.tm_journal.count();

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
