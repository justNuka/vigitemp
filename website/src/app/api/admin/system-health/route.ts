import { apiError, apiOk } from "@/lib/api-response"
import { withAuthLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { collectSystemHealth } from "@/lib/system-health"

const DASHBOARD_ADMIN_CODES = new Set(
  getPermissionAliases("DASHBOARD_ADMIN_ACCESS").map((code) => code.trim().toUpperCase()),
)

function hasDashboardAdminAccess(authorizations: readonly string[] | undefined) {
  return (authorizations ?? []).some((code) =>
    DASHBOARD_ADMIN_CODES.has(code.trim().toUpperCase()),
  )
}

export const GET = withAuthLogging(
  async (_req, { user }) => {
    // Deliberately authorize from the signed access-token claims instead of querying the
    // main database here. This diagnostic endpoint must remain usable when that database
    // is precisely the dependency being diagnosed.
    if (!hasDashboardAdminAccess(user.authorizations)) {
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
