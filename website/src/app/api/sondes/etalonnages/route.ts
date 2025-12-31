import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const serieNum = searchParams.get("serie")

    if (!serieNum) {
      return apiError(400, "invalid_input", "Numéro de série requis")
    }

    const etalonnages = await prisma.t_etalonnage.findMany({
      where: { Sonde_Numero_Serie: serieNum },
      select: {
        Id_Etalonnage: true,
        Date_Heure_Etalonnage: true,
        Date_Validite: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Incertitude: true,
      },
      orderBy: { Date_Heure_Etalonnage: "desc" },
    })

    return apiOk(etalonnages)
  } catch (error) {
    console.error("Etalonnages fetch error:", error)
    return apiError(500, "internal_error", "Erreur lors de la récupération des étalonnages")
  }
})

