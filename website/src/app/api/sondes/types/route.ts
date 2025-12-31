import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const types = await prisma.t_sonde_type.findMany({
      select: {
        Sonde_Type: true,
        Libelle_Sonde_Type: true,
      },
      orderBy: {
        Sonde_Type: "asc",
      },
    })

    return apiOk(types)
  } catch (error) {
    console.error("Sonde types fetch error:", error)
    return apiError(500, "internal_error", "Erreur lors de la récupération des types de sondes")
  }
})

