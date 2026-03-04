import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const types = await prisma.t_actionneur_type.findMany({
      select: {
        Type: true,
        Description: true,
        Gere_Relais: true,
      },
      orderBy: {
        Type: "asc",
      },
    })

    return apiOk(types)
  } catch (error) {
    log.error("actionneurs/types", "actionneur_types_fetch_error", { error: error });
    return apiError(
      500,
      "actionneur_types_fetch_failed",
      "Erreur lors de la récupération des types d'actionneurs",
    )
  }
})
