import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { getSensorFamilyFromTypeCode } from "@/lib/sensor-naming"
import { log } from "@/lib/logger"
import { getSensorTypeValueRangesByCodes } from "@/lib/sensor-value-range"

/**
 * GET /api/sondes/unassigned?page=1&limit=20
 * Retourne les sondes non affectées à un lieu (paginées).
 */
export const GET = withAdminLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10)
    const limit = Math.min(Math.max(rawLimit, 1), 1000)
    const skip = (page - 1) * limit

    const where = {
      t_lieu: { none: { Est_Archive: false } },
      OR: [
        { Est_Sonde_Reformee: false },
        { Est_Sonde_Reformee: null },
      ],
    }

    const total = await prisma.t_sonde.count({ where })
    const pages = Math.ceil(total / limit) || 1

    if (skip >= total) {
      return apiOk({
        data: [],
        pagination: { page, limit, total, pages },
      })
    }

    const sondes = await prisma.t_sonde.findMany({
      where,
      select: {
        Id_Sonde: true,
        Adresse_Sonde: true,
        Sonde_Numero_Serie: true,
        Sonde_Type: true,
        Id_Module: true,
        Sonde_Offset: true,
        Est_Sonde_GSO: true,
      },
      orderBy: {
        Sonde_Numero_Serie: "asc",
      },
      skip,
      take: limit,
    })

    const sensorTypeByCode = await getSensorTypeValueRangesByCodes(
      sondes.map((sonde) => sonde.Sonde_Type),
    )

    const formatted = sondes.map((sonde) => {
      const sensorType = sonde.Sonde_Type
        ? sensorTypeByCode.get(sonde.Sonde_Type)
        : null

      return {
      Id_Sonde: sonde.Id_Sonde,
      Adresse_Sonde: sonde.Adresse_Sonde,
      Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
      Id_Module: sonde.Id_Module,
      Sonde_Offset: sonde.Sonde_Offset,
      Sonde_Type: sonde.Sonde_Type ?? null,
      Famille_Sonde: getSensorFamilyFromTypeCode(sonde.Sonde_Type),
      Valeur_Min: sensorType?.min ?? null,
      Valeur_Max: sensorType?.max ?? null,
      Unite_Type: sensorType?.unit ?? null,
      Est_Sonde_GSO: sonde.Est_Sonde_GSO ?? null,
      Lieu: null,
      Port_Serie: null,
      Surveillance_Etat: null,
      Surveillance_Etat_Libelle: null,
      }
    })

    return apiOk({
      data: formatted,
      pagination: { page, limit, total, pages },
    })
  } catch (error) {
    log.error("sondes/unassigned", "sondes_unassigned_fetch_error", { error: error });
    return apiError(500, "internal_error", "Erreur lors de la récupération des sondes sans lieu")
  }
})
