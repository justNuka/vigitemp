import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const ACTIONNEUR_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

export const GET = withOneOrHigherAnyAuthorizationLogging(ACTIONNEUR_ACCESS_CODES, async (_req: NextRequest) => {
  try {
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
    log.error("actionneurs/types", "actionneur_types_fetch_error", { error })
    return apiError(500, "actionneur_types_fetch_failed", "Erreur lors de la recuperation des types d'actionneurs")
  }
})
