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
    if (status === "active") {
      where.Est_Acquittee = false
      where.Date_Heure_Fin = null
    }
    if (status === "acknowledged") where.Est_Acquittee = true
    if (status === "resolved") {
      where.Est_Acquittee = false
      where.Date_Heure_Fin = { not: null }
    }

    const [total, alarms] = await Promise.all([
      prisma.t_alarme.count({ where }),
      prisma.t_alarme.findMany({
      where,
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
            Derniere_Valeur: true,
            Derniere_Unite: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Tolerance_Surveillance_Sup: true,
            Tolerance_Surveillance_Inf: true,
          },
        },
      },
      orderBy: { Date_Heure_Debut: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    ])

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const lieuIds = Array.from(
      new Set(
        alarms
          .map((alarm) => alarm.t_lieu?.Id_Lieu)
          .filter((id): id is number => typeof id === "number" && !Number.isNaN(id))
      )
    )

    const [activeCounts, histoCounts] = lieuIds.length
      ? await Promise.all([
          prisma.t_alarme.groupBy({
            by: ["Id_Lieu"],
            where: {
              Id_Lieu: { in: lieuIds },
              Date_Heure_Debut: { gte: startDate },
            },
            _count: { _all: true },
          }),
          prisma.t_alarme_histo.groupBy({
            by: ["Id_Lieu"],
            where: {
              Id_Lieu: { in: lieuIds },
              Date_Heure_Debut: { gte: startDate },
            },
            _count: { _all: true },
          }),
        ])
      : [[], []]

    const countsByLieu = new Map<number, number>()
    for (const row of activeCounts as Array<{ Id_Lieu: number; _count: { _all: number } }>) {
      countsByLieu.set(row.Id_Lieu, row._count._all)
    }
    for (const row of histoCounts as Array<{ Id_Lieu: number; _count: { _all: number } }>) {
      const current = countsByLieu.get(row.Id_Lieu) ?? 0
      countsByLieu.set(row.Id_Lieu, current + row._count._all)
    }

    const formatted = alarms.map((alarm: any) => {
      const alarmType =
        alarm.Type === "H"
          ? "high"
          : alarm.Type === "B"
            ? "low"
            : alarm.Type === "N"
              ? "no-response"
              : "temperature"
      const message =
        alarm.Type === "N"
          ? "Alarme non réponse"
          : alarm.Type === "H"
            ? `Alarme haute - ${alarm.Valeur}°C`
            : alarm.Type === "B"
              ? `Alarme basse - ${alarm.Valeur}°C`
              : `Alarme température - ${alarm.Valeur}°C`

      const consigneSup =
        alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null
      const consigneInf =
        alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null

      return {
      id: alarm.Id_Alarme,
      sensorId: alarm.Id_Lieu || 0,
      sensorName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      locationId: alarm.Id_Lieu || 0,
      locationName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: alarmType,
      severity:
        alarm.Type === "N"
          ? "technical"
          : alarm.Type === "H" || alarm.Type === "B"
            ? "critical"
            : alarm.Type === "T"
              ? "ended"
              : "warning",
      status: alarm.Est_Acquittee
        ? "acknowledged"
        : alarm.Date_Heure_Fin
          ? "resolved"
          : "active",
      message,
      timestamp: alarm.Date_Heure_Debut?.toISOString() || new Date().toISOString(),
      acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Debut?.toISOString() : null,
      acknowledgedBy: null,
      resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
      minThreshold: consigneInf,
      maxThreshold: consigneSup,
      unit: alarm.Unite || alarm.t_lieu?.Derniere_Unite || "°C",
      currentValue: alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null,
      count30Days: countsByLieu.get(alarm.t_lieu?.Id_Lieu ?? 0) ?? 0,
    }
    })

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
