import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { sendAlarmEventEmails } from "@/lib/alarm-email"

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const alarmId = parseInt(id, 10)

      const alarm = await prisma.t_alarme.update({
        where: { Id_Alarme: alarmId },
        data: { Date_Heure_Fin: new Date() },
        include: {
          t_lieu: {
            select: {
              Id_Lieu: true,
              Nom_Lieu: true,
              Sonde_Numero_Serie: true,
              Tolerance_Surveillance_Sup: true,
              Tolerance_Surveillance_Inf: true,
              Consigne_Sup: true,
              Consigne_Inf: true,
              t_site: { select: { Libelle_Site: true } },
            },
          },
        },
      })

      log.audit("ALARM_RESOLVED", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: `Alarme: ${alarm.t_lieu?.Nom_Lieu || "Unknown"}`,
        resourceId: alarmId,
        changes: { resolvedAt: alarm.Date_Heure_Fin },
      })

      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const alarmUrl = `${baseUrl}/fr/alarmes`
        await sendAlarmEventEmails({
          eventType: "ended",
          alarmId: alarm.Id_Alarme,
          site: alarm.t_lieu?.t_site?.Libelle_Site,
          lieu: alarm.t_lieu?.Nom_Lieu || "Lieu inconnu",
          sonde: alarm.t_lieu?.Sonde_Numero_Serie,
          alarmTypeCode: alarm.Type,
          triggeredAt: alarm.Date_Heure_Debut_Alarme_Vrai ?? alarm.Date_Heure_Debut,
          endedAt: alarm.Date_Heure_Fin,
          lastValue: alarm.Valeur != null ? `${alarm.Valeur}${alarm.Unite ?? "?C"}` : undefined,
          details: "Alarme terminée",
          alarmUrl,
          idLieu: alarm.t_lieu?.Id_Lieu,
          unite: alarm.Unite,
          consigneSup: alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null,
          consigneInf: alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null,
        })
      } catch (mailError) {
        log.warn("ALARM_EMAIL", "Ended alarm email dispatch failed", {
          alarmId,
          error: mailError instanceof Error ? mailError.message : String(mailError),
        })
      }

      return apiOk({
        id: alarm.Id_Alarme,
        status: "resolved",
        resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
      })
    } catch (error) {
      log.error("alarmes/resolve", "resolve_alarm_error", { error: error });
      return apiError(500, "alarm_resolve_failed", "Failed to resolve alarm")
    }
  },
)
