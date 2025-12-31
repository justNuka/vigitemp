import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"

export const GET = withAuthLogging(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const siteIdsStr = searchParams.get("siteIds")
    const groupIdsStr = searchParams.get("groupIds")
    const siteIds = siteIdsStr?.split(",").map(Number).filter(Boolean) || []
    const groupIds = groupIdsStr?.split(",").map(Number).filter(Boolean) || []

    const skip = (page - 1) * limit

    const where: any = { Est_Archive: false }

    if (siteIds.length > 0) {
      where.Id_Site = { in: siteIds }
    }

    if (groupIds.length > 0) {
      where.OR = [
        { t_lieu_groupe: { some: { Id_Groupe: { in: groupIds } } } },
        { Id_Groupe1: { in: groupIds } },
        { Id_Groupe2: { in: groupIds } },
      ]
    }

    const total = await prisma.t_lieu.count({ where })

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: true,
        t_site: true,
        t_groupe1: true,
        t_groupe2: true,
        t_lieu_groupe: { include: { t_groupe: true } },
      },
      skip,
      take: limit,
      orderBy: { Id_Lieu: "desc" },
    })

    const sensorsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        const groups = (location.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe)
          .filter((g): g is NonNullable<typeof g> => !!g)

        const locationGroupIds = groups.map((g) => g.Id_Groupe)
        const groupNames = groups.map((g) => g.Nom_Groupe).filter((n): n is string => !!n)

        const lastMeasurement = await prismaMesure.tm_mesures.findFirst({
          where: { Id_Lieu: location.Id_Lieu },
          orderBy: { Date_Heure_Mesure: "desc" },
          select: { Valeur: true, Date_Heure_Mesure: true, Est_Etat_Alarme: true },
        })

        const status: "ok" | "warning" | "critical" =
          lastMeasurement?.Est_Etat_Alarme === true ? "critical" : "ok"

        return {
          id: location.Id_Lieu.toString(),
          name: location.Nom_Lieu,
          type: "temperature",
          unit: "°C",
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold: 0,
          maxThreshold: 25,
          lastMeasurement: lastMeasurement?.Date_Heure_Mesure ?? null,
          isActive: !location.Est_Archive,
          status,
          location: {
            id: location.Id_Lieu.toString(),
            name: location.Nom_Lieu,
            description: null,
            siteGroup: null,
            isActive: !location.Est_Archive,
            siteId: location.Id_Site,
            groupIds: locationGroupIds,
            groupNames,
            groupId1: location.Id_Groupe1 ?? locationGroupIds[0] ?? null,
            groupId2: location.Id_Groupe2 ?? locationGroupIds[1] ?? null,
            site: location.t_site?.Libelle_Site ?? "",
            groupName1: location.t_groupe1?.Nom_Groupe ?? null,
            groupName2: location.t_groupe2?.Nom_Groupe ?? null,
          },
        }
      }),
    )

    return apiOk({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sensors: sensorsWithMeasurements,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des capteurs paginés:", error)
    return apiError(500, "internal_error", "Erreur lors du chargement des sondes")
  }
})

