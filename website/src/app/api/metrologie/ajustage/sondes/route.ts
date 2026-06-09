import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest) => {
    try {
      const sondes = await prisma.t_sonde.findMany({
        where: {
          Sonde_Numero_Serie: {
            not: null,
          },
          OR: [{ Est_Sonde_Reformee: null }, { Est_Sonde_Reformee: false }],
        },
        include: {
          t_lieu: {
            where: { Est_Archive: false },
            select: {
              Id_Lieu: true,
              Nom_Lieu: true,
            },
            take: 1,
          },
        },
        orderBy: {
          Sonde_Numero_Serie: "asc",
        },
      })

      const data = sondes.map((sonde) => ({
        id: sonde.Id_Sonde,
        serialNumber: sonde.Sonde_Numero_Serie ?? "-",
        locationId: sonde.t_lieu[0]?.Id_Lieu ?? null,
        locationName: sonde.t_lieu[0]?.Nom_Lieu ?? null,
      }))

      return apiOk(data)
    } catch (error) {
      log.error("metrologie", "adjustment_sensors_fetch_error", { error })
      return apiError(500, "adjustment_sensors_fetch_failed", "Erreur lors de la recuperation des sondes")
    }
  },
)
