import { NextRequest } from "next/server"
import { Prisma } from "../../../../generated/@prisma-db-main"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { requireStandardOrExpertLicense } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { buildMetrologyLookupSerials } from "@/lib/sensor-naming"
import { hasMainDbColumn } from "@/lib/db-schema"

type CalibrationRow = {
  Id_Etalonnage: number
  Date_Heure_Etalonnage: Date | null
  Sonde_Numero_Serie: string | null
  Date_Validite: Date | null
  Duree_Validite_Jours: number | null
  Valide: Date | null
  Operateur: string | null
  Unite: string | null
  Incertitude: number | null
  Err_Justesse: number | null
  Nom_Etalonnage: string | null
}

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const guard = await requireStandardOrExpertLicense()
    if (guard) return guard

    const { searchParams } = new URL(req.url)
    const serieNum = searchParams.get("serie")

    if (!serieNum) {
      return apiError(400, "invalid_input", "Numero de serie requis")
    }

    const serials = buildMetrologyLookupSerials(serieNum)
    if (serials.length === 0) {
      return apiOk([])
    }

    const hasCalibrationNameColumn = await hasMainDbColumn("t_etalonnage", "Nom_Etalonnage")
    const etalonnages = await prisma.$queryRaw<CalibrationRow[]>(Prisma.sql`
      SELECT
        Id_Etalonnage,
        Date_Heure_Etalonnage,
        Sonde_Numero_Serie,
        Date_Validite,
        Duree_Validite_Jours,
        Valide,
        Operateur,
        Unite,
        Incertitude,
        Err_Justesse,
        ${hasCalibrationNameColumn ? Prisma.raw("Nom_Etalonnage") : Prisma.raw("NULL AS Nom_Etalonnage")}
      FROM t_etalonnage
      WHERE Sonde_Numero_Serie IN (${Prisma.join(serials)})
      ORDER BY Date_Heure_Etalonnage DESC
    `)

    return apiOk(etalonnages)
  } catch (error) {
    log.error("sondes/etalonnages", "etalonnages_fetch_error", { error: error });
    return apiError(500, "internal_error", "Erreur lors de la recuperation des etalonnages")
  }
})
