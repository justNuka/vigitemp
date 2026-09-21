import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { enrichAuditLogs } from "@/lib/audit/enrich-audit-logs"

export const GET = withAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const rawLimit = parseInt(searchParams.get("limit") || "100", 10)
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 1000) : 100
    const rawPage = parseInt(searchParams.get("page") || "1", 10)
    const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1
    const skip = (page - 1) * limit
    const paginated = searchParams.get("paginated") === "1"
    const codeFilter = searchParams.get("code")
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined
    const q = searchParams.get("q")?.trim() || ""

    const startDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined
    const endDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined

    const where = {
      ...(codeFilter ? { Code_Journal: codeFilter } : {}),
      ...(dateFrom || dateTo
        ? {
            Date_Heure_Journal: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { Code_Journal: { contains: q } },
              { Commentaire: { contains: q } },
              { Commentaire_Utilisateur: { contains: q } },
              { Nom_Utilisateur: { contains: q } },
              { Profil_Utilisateur: { contains: q } },
            ],
          }
        : {}),
    }

    const [logs, total] = await Promise.all([
      prismaMesure.tm_journal.findMany({
        where,
        ...(paginated ? { skip } : {}),
        take: limit,
        orderBy: { Date_Heure_Journal: "desc" },
        select: {
          Id_Journal: true,
          Date_Heure_Journal: true,
          Code_Journal: true,
          Commentaire: true,
          Nom_Utilisateur: true,
          Id_Lieu: true,
          Commentaire_Utilisateur: true,
          Profil_Utilisateur: true,
        },
      }),
      paginated ? prismaMesure.tm_journal.count({ where }) : Promise.resolve(0),
    ])

    const formatted = await enrichAuditLogs(logs)

    if (!paginated) {
      return apiOk(formatted)
    }

    return apiOk({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    })
  } catch (error) {
    log.error("audit", "get_audit_logs_error", { error: error });
    return apiError(500, "audit_fetch_failed", "Failed to fetch audit logs")
  }
})
