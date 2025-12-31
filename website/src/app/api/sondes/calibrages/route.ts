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

    const calibrages = await prisma.t_calibrage.findMany({
      where: { Sonde_Numero_Serie: serieNum },
      select: {
        Id_Calibrage: true,
        Date_Heure_Calibrage: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Unite: true,
        Nb_Decimale: true,
      },
      orderBy: { Date_Heure_Calibrage: "desc" },
    })

    return apiOk(calibrages)
  } catch (error) {
    console.error("Calibrages fetch error:", error)
    return apiError(500, "internal_error", "Erreur lors de la récupération des calibrages")
  }
})

