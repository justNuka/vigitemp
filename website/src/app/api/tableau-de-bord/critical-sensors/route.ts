import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const criticalLocations = await prisma.t_lieu.findMany({
      where: {
        Est_Archive: false,
        Lieu_Etat: "A",
      },
      orderBy: { Derniere_Date_Heure: "desc" },
      take: 10,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
    })

    const formatted = criticalLocations.map((location) => ({
      id: String(location.Id_Lieu),
      name: location.Nom_Lieu || "Lieu sans nom",
      status: "critical" as const,
      value:
        location.Derniere_Valeur !== null
          ? parseFloat(location.Derniere_Valeur?.toString() ?? "")
          : null,
      unit: location.Derniere_Unite || "°C",
      lastUpdate: location.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
      location: {
        id: String(location.Id_Lieu),
        name:
          location.t_site?.Code_Site && location.t_site?.Libelle_Site
            ? `${location.t_site.Code_Site} - ${location.t_site.Libelle_Site}`
            : location.t_site?.Code_Site ||
              location.t_site?.Libelle_Site ||
              "Unknown",
      },
      minThreshold: location.Consigne_Inf,
      maxThreshold: location.Consigne_Sup,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Get tableau de bord critical sensors error:", error)
    return apiError(500, "internal_error", "Failed to fetch critical sensors")
  }
})

