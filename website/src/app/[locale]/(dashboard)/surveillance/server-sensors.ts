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
        t_lieu_groupe: {
          include: {
            t_groupe: true,
          },
        },
      },
      orderBy: {
        Id_Lieu: "desc",
      },
    });

    // Récupérer les dernières mesures pour chaque lieu en parallèle
    const sensorsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        const groups = (location.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe)
          .filter((g): g is NonNullable<typeof g> => !!g);

        const groupIds = groups.map((g) => g.Id_Groupe);
        const groupNames = groups.map((g) => g.Nom_Groupe).filter((n): n is string => !!n);

        // Récupérer la dernière mesure
        const lastMeasurement = await prismaMesure.tm_mesures.findFirst({
          where: {
            Id_Lieu: location.Id_Lieu,
          },
          orderBy: {
            Date_Heure_Mesure: "desc",
          },
          select: {
            Valeur: true,
            Date_Heure_Mesure: true,
            Est_Etat_Alarme: true,
          },
        });

        // Déterminer le statut basé sur les alarmes
        const status: "ok" | "warning" | "critical" = 
          lastMeasurement?.Est_Etat_Alarme === true ? "critical" :
          "ok";

        return {
          id: location.Id_Lieu.toString(),
          name: location.Nom_Lieu,
          type: "temperature", // À adapter selon le type réel
          unit: "°C",
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold: 0, // À récupérer de la base
          maxThreshold: 25, // À récupérer de la base
          lastMeasurement: lastMeasurement?.Date_Heure_Mesure ?? null,
          isActive: location.Lieu_Etat === "A",
          status,
          location: {
            id: location.Id_Lieu.toString(),
            name: location.Nom_Lieu,
            description: null,
            siteGroup: null,
            isActive: location.Lieu_Etat === "A",
            siteId: location.Id_Site,
            groupIds,
            groupNames,
            groupId1: location.Id_Groupe1 ?? groupIds[0] ?? null,
            groupId2: location.Id_Groupe2 ?? groupIds[1] ?? null,
            site: location.t_site?.Libelle_Site ?? "",
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
