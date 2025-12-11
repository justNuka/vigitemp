import { prisma, prismaMesure } from "@/lib/prisma";
import type { SensorWithLocation } from "@/lib/api";

/**
 * Charge tous les capteurs avec leurs dernières mesures (côté serveur)
 * Appelé une seule fois au chargement initial de la page
 */
export async function ServerSensors(): Promise<SensorWithLocation[]> {
  try {
    // Récupérer tous les lieux (locations)
    const locations = await prisma.t_lieu.findMany({
      include: {
        t_sonde: true,
        t_site: true,
      },
      orderBy: {
        IdLieu: "desc",
      },
    });

    // Récupérer les dernières mesures pour chaque lieu en parallèle
    const sensorsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        // Récupérer la dernière mesure
        const lastMeasurement = await prismaMesure.ts_mesure.findFirst({
          where: {
            IdLieu: location.IdLieu,
          },
          orderBy: {
            DateHeureMesure: "desc",
          },
          select: {
            Valeur: true,
            DateHeureMesure: true,
            Etat_Alarme: true,
          },
        });

        // Déterminer le statut basé sur les alarmes
        const status: "ok" | "warning" | "critical" = 
          lastMeasurement?.Etat_Alarme === true ? "critical" :
          "ok";

        return {
          id: location.IdLieu.toString(),
          name: location.Nom_Lieu,
          type: "temperature", // À adapter selon le type réel
          unit: "°C",
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold: 0, // À récupérer de la base
          maxThreshold: 25, // À récupérer de la base
          lastMeasurement: lastMeasurement?.DateHeureMesure ?? null,
          isActive: location.Lieu_Etat === "A",
          status,
          location: {
            id: location.IdLieu.toString(),
            name: location.Nom_Lieu,
            description: null,
            siteGroup: null,
            isActive: location.Lieu_Etat === "A",
            siteId: location.IdSite,
            groupId1: location.IdGroupe1,
            groupId2: location.IdGroupe2,
            site: location.t_site?.LibelleSite ?? "",
          },
        } as SensorWithLocation;
      })
    );

    return sensorsWithMeasurements;
  } catch (error) {
    console.error("Error loading sensors:", error);
    return [];
  }
}
