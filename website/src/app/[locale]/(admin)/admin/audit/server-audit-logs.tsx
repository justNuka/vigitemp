"use cache";

import { cacheTag } from "next/cache";
import { loadRecentAuditLogs } from "@/lib/audit/enrich-audit-logs";

/**
 * Composant serveur pour charger les logs d'audit depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAuditLogs(limit = 100, codeFilter?: string) {
  "use cache";
  cacheTag("audit-logs");

  return loadRecentAuditLogs(limit, codeFilter);
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
