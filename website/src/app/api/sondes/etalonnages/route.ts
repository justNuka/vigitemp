import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { requireStandardOrExpertLicense } from "@/lib/license-guards"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const guard = await requireStandardOrExpertLicense()
    if (guard) return guard

    const { searchParams } = new URL(req.url)
    const serieNum = searchParams.get("serie")

    if (!serieNum) {
      return apiError(400, "invalid_input", "Numero de serie requis")
    }

    const etalonnages = await prisma.t_etalonnage.findMany({
      where: { Sonde_Numero_Serie: serieNum },
      select: {
        Id_Etalonnage: true,
        Date_Heure_Etalonnage: true,
        Date_Validite: true,
        Duree_Validite_Jours: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Unite: true,
        Incertitude: true,
        Err_Justesse: true,
      },
      orderBy: { Date_Heure_Etalonnage: "desc" },
    })

    return apiOk(etalonnages)
  } catch (error) {
    console.error("Etalonnages fetch error:", error)
    return apiError(500, "internal_error", "Erreur lors de la recuperation des etalonnages")
  }
})
