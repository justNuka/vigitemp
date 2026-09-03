import { NextRequest } from "next/server"

import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { normalizeMeasureNumber } from "@/lib/measurements"

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

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const alarmId = parseInt(id, 10)

      if (Number.isNaN(alarmId)) {
        return apiError(400, "invalid_alarm_id", "Identifiant d'alarme invalide")
      }

      const scope = await getUserLocationScope(ctx.user.userId)
      const accessFilter = buildAlarmAccessFilter(scope)
      const where = applyAccessFilter({ Id_Alarme: alarmId }, accessFilter)

      const alarm = await prisma.t_alarme.findFirst({
        where,
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
              Consigne_Sup: true,
              Consigne_Inf: true,
              Tolerance_Surveillance_Sup: true,
              Tolerance_Surveillance_Inf: true,
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
      })

      if (!alarm) {
        return apiError(404, "alarm_not_found", "Alarme introuvable")
      }

      const hasConfiguredThresholds =
        alarm.t_lieu?.Consigne_Sup !== null || alarm.t_lieu?.Consigne_Inf !== null
      const groups = (alarm.t_lieu?.t_lieu_groupe ?? [])
        .map((link) => link.t_groupe)
        .filter((group): group is NonNullable<typeof group> => Boolean(group))
        .sort((a, b) => (a.Nom_Groupe ?? "").localeCompare(b.Nom_Groupe ?? "", "fr", { sensitivity: "base", numeric: true }))

      return apiOk({
        id: alarm.Id_Alarme,
        locationId: alarm.Id_Lieu,
        siteName: alarm.t_lieu?.t_site?.Libelle_Site || null,
        groupNames: groups.map((group) => group.Nom_Groupe?.trim()).filter((name): name is string => Boolean(name)),
        locationName: alarm.t_lieu?.Nom_Lieu || null,
        sensorName: alarm.t_lieu?.Sonde_Numero_Serie || alarm.t_lieu?.Nom_Lieu || null,
        type: mapAlarmType(alarm.Type),
        currentValue: alarm.Type === "N" || alarm.Type === "M" || alarm.Type === "A" || alarm.Type === "S"
          ? null
          : normalizeMeasureNumber(alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null, 2),
        value: normalizeMeasureNumber(alarm.Valeur ?? null, 2),
        unit: alarm.Unite ?? alarm.t_lieu?.Derniere_Unite ?? null,
        minThreshold: hasConfiguredThresholds
          ? normalizeMeasureNumber(
              alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null,
              2,
            )
          : null,
        maxThreshold: hasConfiguredThresholds
          ? normalizeMeasureNumber(
              alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null,
              2,
            )
          : null,
        triggeredAt: serializeStoredDbDateTime(alarm.Date_Heure_Debut) || null,
        endedAt: serializeStoredDbDateTime(alarm.Date_Heure_Fin) || null,
      })
    } catch (error) {
      log.error("alarmes/[id]", "get_alarm_detail_failed", { error })
      return apiError(500, "alarm_detail_fetch_failed", "Erreur lors du chargement de l'alarme")
    }
  },
)
