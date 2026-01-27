import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

type AlarmStatus = "active" | "acknowledged" | "resolved"

export const GET = withAuthLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") as AlarmStatus | null
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const limit = Math.max(1, Number(searchParams.get("limit") ?? "15"))

    const where: any = {}
    if (status === "active") where.Est_Acquittee = false
    if (status === "acknowledged") where.Est_Acquittee = true
    if (status === "resolved") where.Est_Acquittee = null

    const [total, alarms] = await Promise.all([
      prisma.t_alarme.count({ where }),
      prisma.t_alarme.findMany({
      where,
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
          },
        },
      },
      orderBy: { Date_Heure_Debut: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    ])

    const formatted = alarms.map((alarm: any) => ({
      id: alarm.Id_Alarme,
      sensorId: alarm.Id_Lieu || 0,
      sensorName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      locationId: alarm.Id_Lieu || 0,
      locationName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: alarm.Type === "H" ? "high" : alarm.Type === "B" ? "low" : "temperature",
      severity: alarm.Type === "H" || alarm.Type === "B" ? "critical" : "warning",
      status: alarm.Date_Heure_Fin ? "resolved" : alarm.Est_Acquittee ? "acknowledged" : "active",
      message: `Alarme ${alarm.Type === "H" ? "haute" : "basse"} - ${alarm.Valeur}°C`,
      timestamp: alarm.Date_Heure_Debut?.toISOString() || new Date().toISOString(),
      acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Debut?.toISOString() : null,
      acknowledgedBy: null,
      resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
    }))

    return apiOk({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    console.error("Get alarms error:", error)
    return apiError(500, "alarms_fetch_failed", "Failed to fetch alarms")
  }
})
