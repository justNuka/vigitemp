import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { ModuleRepository } from "@/lib/repositories/module.repository"

const MODULE_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

export const GET = withOneOrHigherAnyAuthorizationLogging(MODULE_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const summary = await ModuleRepository.getWorkerSummary()
    return apiOk(summary)
  } catch (error) {
    log.error("modules/workers", "workers_fetch_error", { error })
    return apiError(500, "workers_fetch_failed", "Erreur lors de la recuperation des workers")
  }
})
