"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Composant serveur pour charger les statistiques du dashboard
 * Cache automatique avec invalidation manuelle
 */
export async function ServerDashboardStats() {
  "use cache";
  cacheTag("surveillance-stats");

  const [totalSensors, warningSensors, criticalSensors, activeAlarms] =
    await Promise.all([
      prisma.t_lieu.count({ where: { Est_Archive: false } }),
      prisma.t_lieu.count({
        where: { Est_Archive: false, Est_Lieu_En_Alarme: 0, Est_Lieu_En_Pre_Alarme: 1 },
      }),
      prisma.t_lieu.count({ where: { Est_Archive: false, Est_Lieu_En_Alarme: 1 } }),
      prisma.t_alarme.count({
        where: {
          Est_Acquittee: false,
          Est_Alarme_Vrai: true,
        },
      }),
    ]);

  const okSensors = Math.max(0, totalSensors - warningSensors - criticalSensors);

  return {
    total: totalSensors,
    ok: okSensors,
    warning: warningSensors,
    critical: criticalSensors,
    activeAlarms,
  };
}
