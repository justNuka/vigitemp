import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/audit/codes
 * Récupère la liste de tous les codes d'audit disponibles.
 */
export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: { Code_Journal: "asc" },
    })

    return apiOk(codes)
  } catch (error) {
    console.error("Get audit codes error:", error)
    return apiError(500, "audit_codes_fetch_failed", "Failed to fetch audit codes")
  }
})
