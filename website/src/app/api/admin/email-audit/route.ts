import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withAuthLogging } from "@/lib/api-wrappers"
import { hasDashboardAdminAccess } from "@/lib/dashboard-admin-access"
import { getSystemEmailAudit } from "@/lib/email-audit"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(
  async (req: NextRequest, { user }) => {
    if (!hasDashboardAdminAccess(user.authorizations)) {
      return apiError(403, "forbidden", "Accès interdit")
    }

    const requestedLimit = Number(req.nextUrl.searchParams.get("limit") ?? "50")
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(100, Math.floor(requestedLimit)))
      : 50

    try {
      return apiOk(await getSystemEmailAudit(limit))
    } catch (error) {
      log.error("admin/email-audit", "email_audit_fetch_failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        500,
        "email_audit_fetch_failed",
        "Impossible de charger l'audit des emails",
      )
    }
  },
  { skipLogging: true, label: "admin/email-audit" },
)
