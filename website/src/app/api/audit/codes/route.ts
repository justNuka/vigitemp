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
    const [configuredCodes, journalCodes] = await Promise.all([
      prismaMesure.tm_journal_code.findMany({
        orderBy: { Code_Journal: "asc" },
      }),
      prismaMesure.tm_journal.findMany({
        where: { Code_Journal: { not: null } },
        distinct: ["Code_Journal"],
        select: { Code_Journal: true },
      }),
    ])

    const codeMap = new Map(
      configuredCodes
        .filter((row) => Boolean(row.Code_Journal?.trim()))
        .map((row) => [row.Code_Journal!.trim(), row.Commentaire ?? null]),
    )

    for (const row of journalCodes) {
      const code = row.Code_Journal?.trim()
      if (code && !codeMap.has(code)) codeMap.set(code, null)
    }

    return apiOk(
      Array.from(codeMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([Code_Journal, Commentaire]) => ({ Code_Journal, Commentaire })),
    )
  } catch (error) {
    log.error("audit/codes", "get_audit_codes_error", { error: error });
    return apiError(500, "audit_codes_fetch_failed", "Failed to fetch audit codes")
  }
})
