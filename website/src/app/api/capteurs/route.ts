import { NextRequest } from "next/server"
import { z } from "zod"

import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { serializePrismaStoredDbDateTime } from "@/lib/sql-provider"
import { prisma } from "@/lib/prisma"
import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { serializeDbDateTime } from "@/lib/date-display"
import { normalizeMeasureNumber } from "@/lib/measurements"

const createSensorSchema = z.object({
  name: z.string().min(1, "Name required"),
  locationId: z.number(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
})

export const GET = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const locationId = searchParams.get("locationId")
    const status = searchParams.get("status")

    const baseWhere: Record<string, unknown> = { Est_Archive: false }

    if (locationId) {
      baseWhere.Id_Site = parseInt(locationId, 10)
    }

    if (status && status !== "all") {
      if (status === "ok") {
        baseWhere.Est_Lieu_En_Alarme = 0
        baseWhere.Est_Lieu_En_Pre_Alarme = 0
      } else if (status === "warning") {
        baseWhere.Est_Lieu_En_Alarme = 0
        baseWhere.Est_Lieu_En_Pre_Alarme = 1
      } else if (status === "critical") {
        baseWhere.Est_Lieu_En_Alarme = 1
      }
    }

    const scope = await getUserLocationScope(ctx.user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)
    const where = applyAccessFilter(baseWhere, lieuAccessFilter)

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Libelle_Site: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    const formatted = locations.map((lieu) => ({
      id: lieu.Id_Lieu.toString(),
      name: lieu.Nom_Lieu || "Lieu sans nom",
      status: lieu.Est_Lieu_En_Alarme === 1 ? "critical" : lieu.Est_Lieu_En_Pre_Alarme === 1 ? "warning" : "ok",
      value: normalizeMeasureNumber(lieu.Derniere_Valeur, lieu.Derniere_Nb_Decimal ?? 2),
      unit: lieu.Derniere_Unite || "°C",
      lastUpdate:
        serializePrismaStoredDbDateTime(lieu.Derniere_Date_Heure) ||
        serializeDbDateTime(new Date()) ||
        null,
      location: {
        id: lieu.Id_Site || 0,
        name: lieu.t_site?.Libelle_Site || "Unknown",
        siteGroup: lieu.t_site?.Libelle_Site || null,
      },
      minThreshold: normalizeMeasureNumber(lieu.Tolerance_Surveillance_Inf ?? lieu.Consigne_Inf, 2),
      maxThreshold: normalizeMeasureNumber(lieu.Tolerance_Surveillance_Sup ?? lieu.Consigne_Sup, 2),
    }))

    return apiOk(formatted)
  } catch (error) {
    log.error("capteurs", "get_sensors_error", { error: error });
    return apiError(500, "internal_error", "Failed to fetch sensors")
  }
})

export const POST = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createSensorSchema.parse(body)

    const lieu = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: data.name,
        Id_Site: data.locationId,
        Consigne_Inf: data.minThreshold,
        Consigne_Sup: data.maxThreshold,
        Derniere_Unite: data.unit || "°C",
        Est_Archive: false,
        Est_Lieu_En_Pre_Alarme: 0,
        Est_Lieu_En_Alarme: 0,
      },
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Libelle_Site: true,
          },
        },
      },
    })

    log.data.create("Capteur", lieu.Id_Lieu, ctx.user.username, ctx.user.userId, ip, {
      name: data.name,
      locationId: data.locationId,
      minThreshold: data.minThreshold,
      maxThreshold: data.maxThreshold,
    })

    return apiOk(
      {
        id: lieu.Id_Lieu.toString(),
        name: lieu.Nom_Lieu,
        status: "ok",
        location: {
          id: lieu.t_site?.Id_Site || 0,
          name: lieu.t_site?.Libelle_Site || "Unknown",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "invalid_input", "Invalid input")
    }

    log.error("capteurs", "create_sensor_error", { error: error });
    return apiError(500, "internal_error", "Failed to create sensor")
  }
})

