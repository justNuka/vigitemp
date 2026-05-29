import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { apiError, apiOk } from "@/lib/api-response"
import { ModuleRepository } from "@/lib/repositories/module.repository"

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifie")
    }

    const summary = await ModuleRepository.getWorkerSummary()
    return apiOk(summary)
  } catch (error) {
    log.error("modules/workers", "workers_fetch_error", { error })
    return apiError(500, "workers_fetch_failed", "Erreur lors de la recuperation des workers")
  }
})
