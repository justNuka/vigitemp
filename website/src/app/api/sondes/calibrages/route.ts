import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifie")

  try {
    const searchParams = req.nextUrl.searchParams
    // Backward compatible: support both ?sonde= and legacy ?serie=
    const sondeSerie = searchParams.get("sonde") ?? searchParams.get("serie")
    if (!sondeSerie) return apiError(400, "missing_param", "Parametre 'sonde' ou 'serie' requis")

    const ajustages = await prisma.t_ajustage.findMany({
      where: { Sonde_Numero_Serie: sondeSerie },
      orderBy: { Date_Heure_Ajustage: "desc" },
      take: 50,
    })

    const serialized = JSON.parse(
      JSON.stringify(ajustages, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )

    return apiOk(serialized)
  } catch (error) {
    log.error("sondes/calibrages", "get_api_sondes_calibrages", { error: error });
    return apiError(500, "ajustages_fetch_failed", "Erreur lors de la recuperation des ajustages")
  }
}
