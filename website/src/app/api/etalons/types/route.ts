import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { requireStandardOrExpertLicense } from "@/lib/license-guards"

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const guard = await requireStandardOrExpertLicense()
    if (guard) return guard

    const types = await prisma.t_etalon_type.findMany({
      select: {
        Type_Etalon: true,
        Nom: true,
        Descriptif: true,
        Resolution: true,
      },
      orderBy: {
        Type_Etalon: "asc",
      },
    })

    return apiOk(types)
  } catch (error) {
    console.error("Etalon types fetch error:", error)
    return apiError(500, "etalon_types_fetch_failed", "Erreur lors de la récupération des types d'étalons")
  }
})
