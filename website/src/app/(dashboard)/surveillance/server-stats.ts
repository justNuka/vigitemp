import { prisma, prismaMesure } from "@/lib/prisma";

export interface DashboardStats {
  total: number;
  ok: number;
  warning: number;
  critical: number;
  activeAlarms: number;
}

/**
 * Charge les statistiques du tableau de bord (côté serveur)
 */
export async function ServerDashboardStats(): Promise<DashboardStats> {
  try {
    // Récupérer tous les lieux
    const allLocations = await prisma.t_lieu.findMany({
      select: {
        Id_Lieu: true,
      },
    });

    const totalLocations = allLocations.length;

    // Récupérer les dernières mesures pour calculer les statuts
    const measurementsByLocation = await Promise.all(
      allLocations.map(async (location) => {
        const lastMeasurement = await prismaMesure.tm_mesure.findFirst({
          where: {
            IdLieu: location.Id_Lieu,
          },
          orderBy: {
            DateHeureMesure: "desc",
          },
          select: {
            Etat_Alarme: true,
          },
        });

        return {
          idLieu: location.Id_Lieu,
          etatAlarme: lastMeasurement?.Etat_Alarme ?? 0,
        };
      })
    );

    // Compter les statuts
    const ok = measurementsByLocation.filter(
      (m) => m.etatAlarme === false || m.etatAlarme === 0
    ).length;
    const warning = 0; // Pas de statut "warning" distinct
    const critical = measurementsByLocation.filter(
      (m) => m.etatAlarme === true || m.etatAlarme === 1
    ).length;

    const activeAlarms = await prisma.t_alarme.count({
      where: {
        Alarme_Vrai: true, // État actif (alarme vraie)
      },
    });

    return {
      total: totalLocations,
      ok,
      warning,
      critical,
      activeAlarms,
    };
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    return {
      total: 0,
      ok: 0,
      warning: 0,
      critical: 0,
      activeAlarms: 0,
    };
  }
}
