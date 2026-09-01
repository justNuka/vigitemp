import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { buildMetrologyLookupSerials } from "@/lib/sensor-naming"
import { getPermissionAliases } from "@/lib/permissions"

export const GET = withOneOrHigherAnyAuthorizationLogging(getPermissionAliases("METROLOGY_ACCESS"), async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    // Backward compatible: support both ?sonde= and legacy ?serie=
    const sondeSerie = searchParams.get("sonde") ?? searchParams.get("serie")
    if (!sondeSerie) return apiError(400, "missing_param", "Parametre 'sonde' ou 'serie' requis")
    const serials = buildMetrologyLookupSerials(sondeSerie)

    const ajustages = await prisma.t_ajustage.findMany({
      where: { Sonde_Numero_Serie: { in: serials } },
      orderBy: { Date_Heure_Ajustage: "desc" },
      take: 50,
    })

    const serialized = JSON.parse(
      JSON.stringify(ajustages, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )

    return apiOk(serialized)
  } catch (error) {
    log.error("sondes/calibrages", "calibrages_fetch_error", { error: error });
    return apiError(500, "ajustages_fetch_failed", "Erreur lors de la recuperation des ajustages")
  }
})
