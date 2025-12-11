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

  const [totalSensors, okSensors, warningSensors, criticalSensors, activeAlarms] =
    await Promise.all([
      prisma.t_lieu.count({ where: { Archive: false } }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "O" } }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "P" } }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "A" } }),
      prisma.t_alarme.count({
        where: {
          Acquite: false,
          Alarme_Vrai: true,
        },
      }),
    ]);

  return {
    total: totalSensors,
    ok: okSensors,
    warning: warningSensors,
    critical: criticalSensors,
    activeAlarms,
  };
}
