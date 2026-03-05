import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"

const createLocationSchema = z.object({
  name: z.string().min(1, "Name required"),
  site: z.string().optional(),
  description: z.string().optional(),
})

export const GET = withAuthLogging(async (req: NextRequest, ctx) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const site = searchParams.get("site")

    const baseWhere: Record<string, unknown> = { Est_Archive: false }

    if (site) {
      baseWhere.Id_Site = parseInt(site)
    }

    const scope = await getUserLocationScope(ctx.user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)
    const where = applyAccessFilter(baseWhere, lieuAccessFilter)

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: {
          where: { Est_Sonde_Reformee: false },
          select: {
            Id_Sonde: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    const formatted = locations.map((loc) => {
      const sensors = Array.isArray(loc.t_sonde) ? loc.t_sonde : []
      const isCritical = loc.Est_Lieu_En_Alarme === 1
      const isWarning = !isCritical && loc.Est_Lieu_En_Pre_Alarme === 1
      const status = isCritical ? "A" : isWarning ? "P" : "O"

      return {
        id: loc.Id_Lieu,
        name: loc.Nom_Lieu,
        site: loc.Id_Site || null,
        status,
        sensorCount: sensors.length,
        okSensors: status === "O" ? sensors.length : 0,
        warningSensors: status === "P" ? sensors.length : 0,
        criticalSensors: status === "A" ? sensors.length : 0,
      }
    })

    return apiOk(formatted)
  } catch (error) {
    log.error("lieux/resume", "get_locations_summary_error", { error: error });
    return apiError(500, "locations_fetch_failed", "Failed to fetch locations")
  }
})

export const POST = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createLocationSchema.parse(body)

    const location = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: data.name,
        Id_Site: data.site ? parseInt(data.site) : null,
        Est_Archive: false,
        Lieu_Etat: "S",
      },
    })

    log.data.create("Lieu", location.Id_Lieu, ctx.user.username, ctx.user.userId, ip, {
      name: data.name,
      site: data.site,
    })

    return apiOk(
      {
        id: location.Id_Lieu,
        name: location.Nom_Lieu,
        site: location.Id_Site,
        status: "O",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Invalid input")
    }

    log.error("lieux/resume", "create_location_summary_error", { error: error });
    return apiError(500, "location_create_failed", "Failed to create location")
  }
})
