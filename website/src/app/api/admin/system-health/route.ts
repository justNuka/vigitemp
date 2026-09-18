import { apiError, apiOk } from "@/lib/api-response"
import { withAuthLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { hasDashboardAdminAccess } from "@/lib/dashboard-admin-access"
import { collectSystemHealth } from "@/lib/system-health"

export const GET = withAuthLogging(
  async (_req, { user }) => {
    // Signed claims are the normal authorization source so this endpoint remains
    // usable while diagnosing a main-DB outage. Legacy empty-claim sessions receive
    // a one-time DB fallback and are renewed with their actual authorization codes.
    if (!(await hasDashboardAdminAccess(user))) {
      return apiError(403, "forbidden", "Accès interdit")
    }

    try {
      return apiOk(await collectSystemHealth())
    } catch (error) {
      log.error("admin/system-health", "health_collection_failed", { error })
      return apiError(500, "internal_error", "Impossible de vérifier l'état du système")
    }
  },
  { skipLogging: true, label: "admin/system-health" },
)
