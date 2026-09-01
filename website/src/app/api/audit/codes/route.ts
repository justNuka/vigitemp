import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

/**
 * GET /api/audit/codes
 * Récupère la liste de tous les codes d'audit disponibles.
 */
export const GET = withAuthorizationLogging("PARAMETRES_GERER", async (_req: NextRequest) => {
  try {
    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: { Code_Journal: "asc" },
    })

    return apiOk(codes)
  } catch (error) {
    log.error("audit/codes", "get_audit_codes_error", { error: error });
    return apiError(500, "audit_codes_fetch_failed", "Failed to fetch audit codes")
  }
})
