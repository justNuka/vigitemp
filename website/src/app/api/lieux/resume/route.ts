import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

const createLocationSchema = z.object({
  name: z.string().min(1, "Name required"),
  site: z.string().optional(),
  description: z.string().optional(),
})

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const site = searchParams.get("site")

    const where: any = { Est_Archive: false }

    if (site) {
      where.Id_Site = parseInt(site)
    }

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: {
          where: { Est_Sonde_Reformee: false },
          select: {
            Id_Sonde: true,
            Surveillance_Etat: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    const formatted = locations.map((loc: any) => {
      const sensors = Array.isArray(loc.t_sonde) ? loc.t_sonde : []

      return {
        id: loc.Id_Lieu,
        name: loc.Nom_Lieu,
        site: loc.Id_Site || null,
        status: loc.Lieu_Etat,
        sensorCount: sensors.length,
        okSensors: sensors.filter((s: any) => s.Surveillance_Etat === "O").length,
        warningSensors: sensors.filter((s: any) => s.Surveillance_Etat === "P").length,
        criticalSensors: sensors.filter((s: any) => s.Surveillance_Etat === "A").length,
      }
    })

    return apiOk(formatted)
  } catch (error) {
    console.error("Get locations summary error:", error)
    return apiError(500, "locations_fetch_failed", "Failed to fetch locations")
  }
})

export const POST = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createLocationSchema.parse(body)

    const location = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: data.name,
        Id_Site: data.site ? parseInt(data.site) : null,
        Est_Archive: false,
        Lieu_Etat: "O",
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
        status: location.Lieu_Etat,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Invalid input")
    }

    console.error("Create location summary error:", error)
    return apiError(500, "location_create_failed", "Failed to create location")
  }
})
