import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "100")
    const codeFilter = searchParams.get("code")

    const whereClause = codeFilter ? { Code_Journal: codeFilter } : {}

    const logs = await prismaMesure.tm_journal.findMany({
      where: whereClause,
      take: limit,
      orderBy: { Date_Heure_Journal: "desc" },
      select: {
        Id_Journal: true,
        Date_Heure_Journal: true,
        Code_Journal: true,
        Commentaire: true,
        Nom_Utilisateur: true,
        Id_Lieu: true,
      },
    })

    const formatted = logs.map((log: any) => ({
      id: log.Id_Journal,
      timestamp: log.Date_Heure_Journal?.toISOString() || new Date().toISOString(),
      userId: null,
      action: log.Code_Journal || "unknown",
      details: log.Commentaire || "",
      sensorId: log.Id_Lieu || null,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Get audit logs error:", error)
    return apiError(500, "audit_fetch_failed", "Failed to fetch audit logs")
  }
})
