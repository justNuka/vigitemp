import { NextRequest } from "next/server"
import { z } from "zod"

import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const createSensorSchema = z.object({
  name: z.string().min(1, "Name required"),
  locationId: z.number(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
})

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const locationId = searchParams.get("locationId")
    const status = searchParams.get("status")

    const where: any = { Est_Archive: false }

    if (locationId) {
      where.Id_Site = parseInt(locationId, 10)
    }

    if (status && status !== "all") {
      if (status === "ok") where.Lieu_Etat = "O"
      else if (status === "warning") where.Lieu_Etat = "P"
      else if (status === "critical") where.Lieu_Etat = "A"
    }

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    const formatted = locations.map((lieu: any) => ({
      id: lieu.Id_Lieu.toString(),
      name: lieu.Nom_Lieu || "Lieu sans nom",
      status:
        lieu.Lieu_Etat === "O"
          ? "ok"
          : lieu.Lieu_Etat === "P"
            ? "warning"
            : lieu.Lieu_Etat === "A"
              ? "critical"
              : "offline",
      value: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
      unit: lieu.Derniere_Unite || "°C",
      lastUpdate: lieu.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
      location: {
        id: lieu.Id_Site || 0,
        name:
          lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
            ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
            : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        siteGroup:
          lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
            ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
            : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || null,
      },
      minThreshold: lieu.Consigne_Inf,
      maxThreshold: lieu.Consigne_Sup,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Get sensors error:", error)
    return apiError(500, "internal_error", "Failed to fetch sensors")
  }
})

export const POST = withAuthLogging(async (req: NextRequest, ctx: any) => {
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
        Lieu_Etat: "O",
      },
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
          name:
            lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
              ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
              : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "invalid_input", "Invalid input")
    }

    console.error("Create sensor error:", error)
    return apiError(500, "internal_error", "Failed to create sensor")
  }
})

