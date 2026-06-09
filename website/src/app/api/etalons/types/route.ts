import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const ETALON_ACCESS_CODES = getPermissionAliases("METROLOGY_ACCESS")

function formatDecimalValue(value: unknown): string | null {
  if (value == null) return null
  const numeric = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(numeric)) {
    const raw = String(value).trim()
    return raw.length > 0 ? raw : null
  }

  return numeric
    .toFixed(12)
    .replace(/\.?0+$/, "")
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(ETALON_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const types = await prisma.t_etalon_type.findMany({
      select: {
        Type_Etalon: true,
        Nom: true,
        Descriptif: true,
        Resolution: true,
        Est_Saisie_Module: true,
        Est_Sonde_Externe: true,
      },
      orderBy: {
        Type_Etalon: "asc",
      },
    })

    return apiOk(
      types.map((item) => ({
        ...item,
        Resolution: formatDecimalValue(item.Resolution),
      })),
    )
  } catch (error) {
    log.error("etalons/types", "etalon_types_fetch_error", { error })
    return apiError(500, "etalon_types_fetch_failed", "Erreur lors de la recuperation des types d'etalons")
  }
})
