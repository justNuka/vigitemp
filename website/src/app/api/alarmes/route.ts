import { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"

import { withAuthLogging } from "@/lib/api-wrappers"

import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { serializeDbDateTime } from "@/lib/date-display"

const alarmsQuerySchema = z.object({
  status: z.enum(["active", "acknowledged", "resolved"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(15),
  siteId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
})



const NO_STORE_HEADERS: HeadersInit = {

  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",

  Pragma: "no-cache",

  Expires: "0",

}

function isPowerAlarmType(type: string | null | undefined) {
  const normalized = type?.trim().toUpperCase()
  return normalized === "A" || normalized === "S"
}



export const GET = withAuthLogging(async (req: NextRequest, ctx) => {

  try {

    const queryParsed = alarmsQuerySchema.safeParse({
      status: req.nextUrl.searchParams.get("status") ?? undefined,
      page: req.nextUrl.searchParams.get("page") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
      siteId: req.nextUrl.searchParams.get("siteId") ?? undefined,
      locationId: req.nextUrl.searchParams.get("locationId") ?? undefined,
    })
    if (!queryParsed.success) {
      return apiError(400, "validation_error", "Paramètres invalides", {
        details: queryParsed.error.issues,
      })
    }
    const { status, page, limit, siteId, locationId } = queryParsed.data

    const baseWhere: Record<string, unknown> = {}

    if (siteId) baseWhere.Id_Lieu = undefined

    if (status === "active") {

      baseWhere.Est_Acquittee = false

      baseWhere.Date_Heure_Fin = null

    }

    if (status === "acknowledged") baseWhere.Est_Acquittee = true

    if (status === "resolved") {

      baseWhere.Est_Acquittee = false

      baseWhere.Date_Heure_Fin = { not: null }

    }

    if (locationId) {
      baseWhere.Id_Lieu = locationId
    }

    if (siteId) {
      baseWhere.t_lieu = {
        ...(typeof baseWhere.t_lieu === "object" && baseWhere.t_lieu ? (baseWhere.t_lieu as Record<string, unknown>) : {}),
        Id_Site: siteId,
      }
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

              Id_Site: true,

              Nom_Lieu: true,

              t_site: {
                select: {
                  Id_Site: true,
                  Libelle_Site: true,
                },
              },

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



    const formatted = alarms.map((alarm) => {

      const alarmType =

        alarm.Type === "H"

          ? "high"

          : alarm.Type === "B"

            ? "low"

            : alarm.Type === "N"

              ? "no-response"

              : isPowerAlarmType(alarm.Type)

                ? "sector"

                : "temperature"

      const unit = alarm.Unite?.trim() || "Unité inconnue"

      const message =

        alarm.Type === "N"

          ? "Alarme non réponse"

          : isPowerAlarmType(alarm.Type)

            ? "Alarme coupure secteur"

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

        siteId: alarm.t_lieu?.t_site?.Id_Site || alarm.t_lieu?.Id_Site || null,

        siteName: alarm.t_lieu?.t_site?.Libelle_Site || null,

        type: alarmType,

        severity:

          alarm.Type === "N" || isPowerAlarmType(alarm.Type)

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

        timestamp: serializeDbDateTime(alarm.Date_Heure_Debut) || serializeDbDateTime(new Date()) || null,

        acknowledgedAt: alarm.Est_Acquittee ? serializeDbDateTime(alarm.Date_Heure_Debut) : null,

        acknowledgedBy: null,

        resolvedAt: serializeDbDateTime(alarm.Date_Heure_Fin) || null,

        minThreshold: consigneInf,

        maxThreshold: consigneSup,

        unit,

        currentValue: alarm.Type === "N" || isPowerAlarmType(alarm.Type) ? null : (alarm.Valeur ?? alarm.t_lieu?.Derniere_Valeur ?? null),

        count30Days: countsByLieu.get(alarm.t_lieu?.Id_Lieu ?? 0) ?? 0,

      }

    })



    const [siteRows, lieuOptions] = await Promise.all([
      prisma.t_lieu.findMany({
        where: applyAccessFilter(siteId ? { Id_Site: siteId } : {}, accessFilter),
        select: {
          Id_Site: true,
          t_site: {
            select: {
              Id_Site: true,
              Libelle_Site: true,
            },
          },
        },
        orderBy: { Id_Site: "asc" },
      }),
      prisma.t_lieu.findMany({
        where: applyAccessFilter(siteId ? { Id_Site: siteId } : {}, accessFilter),
        select: { Id_Lieu: true, Nom_Lieu: true },
        orderBy: { Nom_Lieu: "asc" },
      }),
    ])

    const sitesById = new Map<number, { id: number; name: string }>()
    for (const row of siteRows) {
      const resolvedSiteId = row.t_site?.Id_Site ?? row.Id_Site ?? null
      const resolvedSiteName = row.t_site?.Libelle_Site ?? null
      if (!resolvedSiteId || !resolvedSiteName || sitesById.has(resolvedSiteId)) continue
      sitesById.set(resolvedSiteId, { id: resolvedSiteId, name: resolvedSiteName })
    }

    return apiOk(

      {

        data: formatted,

        filters: {
          sites: Array.from(sitesById.values()),
          lieux: lieuOptions
            .filter((row) => row.Id_Lieu && row.Nom_Lieu)
            .map((row) => ({ id: row.Id_Lieu, name: row.Nom_Lieu as string })),
        },

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

    log.error("alarmes", "get_alarms_error", { error: error });

    return apiError(500, "alarms_fetch_failed", "Failed to fetch alarms")

  }

})

