import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"
import { normalizeMeasureNumber } from "@/lib/measurements"
import { prisma } from "@/lib/prisma"

function mapAlarmType(type: string | null | undefined) {
  switch ((type ?? "").trim().toUpperCase()) {
    case "H":
      return "high" as const
    case "B":
      return "low" as const
    case "N":
      return "no-response" as const
    case "M":
      return "module" as const
    case "A":
    case "S":
      return "sector" as const
    case "T":
      return "ended" as const
    default:
      return undefined
  }
}

export const GET = withAuthLogging(async (_req: NextRequest, ctx) => {
  try {
    const scope = await getUserLocationScope(ctx.user.userId)
    const accessFilter = buildAlarmAccessFilter(scope)

    const alarms = await prisma.t_alarme.findMany({
      where: applyAccessFilter({ Est_Acquittee: false }, accessFilter),
      select: {
        Id_Alarme: true,
        Id_Lieu: true,
        Type: true,
        Valeur: true,
        Unite: true,
        Date_Heure_Debut: true,
        Date_Heure_Fin: true,
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
            Sonde_Numero_Serie: true,
            Derniere_Valeur: true,
            Derniere_Unite: true,
            t_site: {
              select: { Libelle_Site: true },
            },
            t_lieu_groupe: {
              select: {
                t_groupe: {
                  select: { Id_Groupe: true, Nom_Groupe: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ Date_Heure_Debut: "desc" }, { Id_Alarme: "desc" }],
      take: 500,
    })

    return apiOk(
      alarms.map((alarm) => {
        const technicalType = ["N", "M", "A", "S"].includes((alarm.Type ?? "").trim().toUpperCase())
        const groups = (alarm.t_lieu?.t_lieu_groupe ?? [])
          .map((link) => link.t_groupe)
          .filter((group): group is NonNullable<typeof group> => Boolean(group))
          .sort((a, b) => (a.Nom_Groupe ?? "").localeCompare(b.Nom_Groupe ?? "", "fr", { sensitivity: "base", numeric: true }))

        return {
          id: alarm.Id_Alarme,
          locationId: alarm.Id_Lieu,
          type: mapAlarmType(alarm.Type),
          status: alarm.Date_Heure_Fin ? ("resolved" as const) : ("active" as const),
          timestamp: serializeStoredDbDateTime(alarm.Date_Heure_Debut) || null,
          resolvedAt: serializeStoredDbDateTime(alarm.Date_Heure_Fin) || null,
          currentValue: technicalType
            ? null
            : normalizeMeasureNumber(alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null, 2),
          unit: alarm.Unite ?? alarm.t_lieu?.Derniere_Unite ?? null,
          siteName: alarm.t_lieu?.t_site?.Libelle_Site ?? null,
          groupNames: groups.map((group) => group.Nom_Groupe?.trim()).filter((name): name is string => Boolean(name)),
          locationName: alarm.t_lieu?.Nom_Lieu ?? null,
          sensorName: alarm.t_lieu?.Sonde_Numero_Serie ?? alarm.t_lieu?.Nom_Lieu ?? null,
        }
      }),
    )
  } catch (error) {
    log.error("alarms/acknowledgement-candidates", "get_candidates_failed", { error })
    return apiError(500, "alarm_ack_candidates_failed", "Erreur lors du chargement des alarmes à acquitter")
  }
})
