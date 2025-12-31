import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/alarmes-actives?page=1&limit=10
 * Retourne les alarmes actives (non acquittées ou récemment ouvertes)
 */
export const GET = withAdminLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10)
    const limit = Math.min(Math.max(rawLimit, 1), 10)
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { Est_Acquittee: false, Date_Heure_Fin: null as any },
        {
          Date_Heure_Debut: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    }

    const totalCount = await prisma.t_alarme.count({ where })
    const total = Math.min(totalCount, 50)

    if (skip >= total) {
      return apiOk({
        data: [],
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      })
    }

    const activeAlarms = await prisma.t_alarme.findMany({
      where,
      include: {
        t_lieu: { select: { Id_Lieu: true, Nom_Lieu: true } },
      },
      orderBy: { Date_Heure_Debut: "desc" },
      skip,
      take: Math.min(limit, 50 - skip),
    })

    const formatted = activeAlarms.map((alarm) => ({
      id: String(alarm.Id_Alarme),
      sonde: alarm.Sonde_Numero_Serie || "Unknown",
      lieu: alarm.t_lieu?.Nom_Lieu || "Unknown",
      valeur: alarm.Valeur ? `${alarm.Valeur}` : "N/A",
      seuil: `${alarm.Type === "S" ? "Sup" : "Inf"}`,
      duree: formatDuration(alarm.Date_Heure_Debut),
      statut: alarm.Est_Acquittee ? "Acquittée" : "Active",
    }))

    return apiOk({
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    console.error("Error fetching active alarms:", error)
    return apiError(500, "internal_error", "Failed to fetch active alarms")
  }
})

function formatDuration(startDate: Date | null): string {
  if (!startDate) return "N/A"
  const now = new Date()
  const diff = now.getTime() - startDate.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}
