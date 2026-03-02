import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"

export const GET = withAuthLogging(async (_req: NextRequest, ctx) => {
  try {
    const scope = await getUserLocationScope(ctx.user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)

    const locations = await prisma.t_lieu.findMany({
      where: applyAccessFilter(
        {
          Est_Archive: false,
          OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }],
        },
        lieuAccessFilter,
      ),
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

    const formatted = locations.map((location) => {
      const status = location.Est_Lieu_En_Alarme === 1 ? ("critical" as const) : ("warning" as const)
      const siteLabel =
        location.t_site?.Code_Site && location.t_site?.Libelle_Site
          ? `${location.t_site.Code_Site} - ${location.t_site.Libelle_Site}`
          : location.t_site?.Code_Site || location.t_site?.Libelle_Site || "Unknown"

      return {
        id: String(location.Id_Lieu),
        name: location.Nom_Lieu || "Lieu sans nom",
        status,
        value:
          location.Derniere_Valeur !== null ? parseFloat(location.Derniere_Valeur?.toString() ?? "") : null,
        unit: location.Derniere_Unite || "°C",
        lastUpdate: location.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
        location: {
          id: String(location.Id_Lieu),
          name: siteLabel,
        },
        minThreshold: location.Tolerance_Surveillance_Inf,
        maxThreshold: location.Tolerance_Surveillance_Sup,
      }
    })

    return apiOk(formatted)
  } catch (error) {
    console.error("Get tableau de bord critical sensors error:", error)
    return apiError(500, "internal_error", "Failed to fetch critical sensors")
  }
})

