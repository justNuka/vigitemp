import { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"

import { withAuthLogging } from "@/lib/api-wrappers"

import { apiError, apiOk } from "@/lib/api-response"

const alarmsQuerySchema = z.object({
  status: z.enum(["active", "acknowledged", "resolved"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
})



const NO_STORE_HEADERS: HeadersInit = {

  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",

  Pragma: "no-cache",

  Expires: "0",

}



export const GET = withAuthLogging(async (req: NextRequest, ctx) => {

  try {

    const queryParsed = alarmsQuerySchema.safeParse({
      status: req.nextUrl.searchParams.get("status") ?? undefined,
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    })
    if (!queryParsed.success) {
      return apiError(400, "invalid_params", "Paramètres invalides", {
        details: queryParsed.error.issues,
      })
    }
    const { status, page, limit } = queryParsed.data

    const baseWhere: Record<string, unknown> = {}

    if (status === "active") {

      baseWhere.Est_Acquittee = false

      baseWhere.Date_Heure_Fin = null

    }

    if (status === "acknowledged") baseWhere.Est_Acquittee = true

    if (status === "resolved") {

      baseWhere.Est_Acquittee = false

      baseWhere.Date_Heure_Fin = { not: null }

    }



    const scope = await getUserLocationScope(ctx.user.userId)

    const accessFilter = buildAlarmAccessFilter(scope)

    const where = applyAccessFilter(baseWhere, accessFilter)



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

              Est_Alarme_Vrai: true,

            },

            _count: { _all: true },

          }),

          prisma.t_alarme_histo.groupBy({

            by: ["Id_Lieu"],

            where: {

              Id_Lieu: { in: lieuIds },

              Date_Heure_Debut: { gte: startDate },

              Est_Alarme_Vrai: true,

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



    const formatted = alarms.map((alarm) => {

      const alarmType =

        alarm.Type === "H"

          ? "high"

          : alarm.Type === "B"

            ? "low"

            : alarm.Type === "N"

              ? "no-response"

              : "temperature"

      const unit = alarm.Unite?.trim() || "Unité inconnue"

      const message =

        alarm.Type === "N"

          ? "Alarme non réponse"

          : alarm.Type === "H"

            ? `Alarme haute - ${alarm.Valeur} C`

            : alarm.Type === "B"

              ? `Alarme basse - ${alarm.Valeur} C`

              : `Alarme température - ${alarm.Valeur} C`



      const hasConfiguredThresholds =

        alarm.t_lieu?.Consigne_Sup !== null || alarm.t_lieu?.Consigne_Inf !== null



      const consigneSup = hasConfiguredThresholds

        ? alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null

        : null

      const consigneInf = hasConfiguredThresholds

        ? alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null

        : null



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

        unit,

        currentValue: alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null,

        count30Days: countsByLieu.get(alarm.t_lieu?.Id_Lieu ?? 0) ?? 0,

      }

    })



    return apiOk(

      {

        data: formatted,

        pagination: {

          page,

          limit,

          total,

          pages: Math.max(1, Math.ceil(total / limit)),

        },

      },

      { headers: NO_STORE_HEADERS }

    )

  } catch (error) {

    console.error("Get alarms error:", error)

    return apiError(500, "alarms_fetch_failed", "Failed to fetch alarms")

  }

})

