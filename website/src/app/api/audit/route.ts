import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "100")
    const codeFilter = searchParams.get("code")
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined

    const startDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined
    const endDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined

    const logs = await prismaMesure.tm_journal.findMany({
      where: {
        ...(codeFilter ? { Code_Journal: codeFilter } : {}),
        ...(dateFrom || dateTo
          ? {
              Date_Heure_Journal: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
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
    })

    const formatted = logs.map((entry) => ({
      id: entry.Id_Journal,
      timestamp: entry.Date_Heure_Journal?.toISOString() || new Date().toISOString(),
      userId: entry.Nom_Utilisateur || null,
      action: entry.Code_Journal || "unknown",
      details: entry.Commentaire || "",
      sensorId: entry.Id_Lieu || null,
      commentaireUtilisateur: entry.Commentaire_Utilisateur || null,
      profileUtilisateur: entry.Profil_Utilisateur || null,
    }))

    return apiOk(formatted)
  } catch (error) {
    log.error("audit", "get_audit_logs_error", { error: error });
    return apiError(500, "audit_fetch_failed", "Failed to fetch audit logs")
  }
})
