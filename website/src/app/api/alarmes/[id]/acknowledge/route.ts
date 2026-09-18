import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getPublicAppUrl } from "@/lib/public-app-url"
import { getRequestContext } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { revalidateTag } from "next/cache"
import { sendAlarmEventEmails } from "@/lib/alarm-email"
import { getPermissionAliases } from "@/lib/permissions"
import { buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { serializeDbDateTime } from "@/lib/date-display"
import { getDbNow, isMssqlProvider } from "@/lib/sql-provider"

const acknowledgeSchema = z.object({
  comment: z.string().optional(),
})

export const POST = withAnyAuthorizationLogging(getPermissionAliases("ALARM_ACK_ACCESS"),
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    let alarmId = 0
    let ackStep = "init"
    try {
      const { ip } = getRequestContext(req)

      ackStep = "parse_params"
      const { id } = await params
      alarmId = parseInt(id, 10)
      ackStep = "parse_body"
      const body = await req.json()
      const { comment } = acknowledgeSchema.parse(body)
      const acknowledgedAt = await getDbNow(prisma)

      const userScope = await getUserLocationScope(ctx.user.userId)
      const lieuAccessFilter = buildLieuAccessFilter(userScope)

      ackStep = "transaction"
      const alarm = await prisma.$transaction(async (tx) => {
        ackStep = "tx_find_alarm"
        const current = await tx.t_alarme.findFirst({
          where: {
            Id_Alarme: alarmId,
            ...(lieuAccessFilter ? { t_lieu: lieuAccessFilter } : {}),
          },
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

        if (!current) return null

        const lieuId = current.t_lieu?.Id_Lieu ?? null

        // Preserve persisted alarm-email queue/audit rows before deleting the alarm.
        // Older rows may still carry the FK; newer ALARM_EMAIL rows keep the
        // correlation only in Payload_Json.
        ackStep = "tx_detach_alarm_email_notifications"
        await tx.t_notification.updateMany({
          where: { Id_Alarme: alarmId, Type: "ALARM_EMAIL" },
          data: { Id_Alarme: null },
        })

        // Remove the remaining runtime notifications to avoid FK conflicts,
        // then delete the alarm (the DB trigger can populate t_alarme_histo).
        ackStep = "tx_delete_notifications"
        await tx.t_notification.deleteMany({
          where: { Id_Alarme: alarmId },
        })

        ackStep = "tx_delete_alarm"
        await tx.t_alarme.delete({
          where: { Id_Alarme: alarmId },
        })

        if (lieuId) {
          ackStep = "tx_set_skip_lieu_alarm_on"
          if (isMssqlProvider()) {
            await tx.$executeRawUnsafe(
              "EXEC sp_set_session_context @key=N'SKIP_LIEU_ALARM_LOGIC', @value=1;",
            )
          } else {
            await tx.$executeRaw`SET @SKIP_LIEU_ALARM_LOGIC = 1`
          }
          try {
            ackStep = "tx_recompute_lieu_state"
            const [nextActiveAlarm, remainingEndedUnack, lieu] = await Promise.all([
              tx.t_alarme.findFirst({
                where: {
                  Id_Lieu: lieuId,
                  Date_Heure_Fin: null,
                  Est_Acquittee: false,
                },
                orderBy: { Date_Heure_Debut: "desc" },
                select: { Id_Alarme: true },
              }),
              tx.t_alarme.count({
                where: {
                  Id_Lieu: lieuId,
                  Date_Heure_Fin: { not: null },
                  Est_Acquittee: false,
                },
              }),
              tx.t_lieu.findUnique({
                where: { Id_Lieu: lieuId },
                select: { Est_Lieu_En_Pre_Alarme: true },
              }),
            ])

            const updateData: {
              Est_Lieu_Alarme_Terminee_Non_Acquittee: number
              Est_Lieu_En_Alarme: number
              Est_Lieu_En_Pre_Alarme?: number
              Est_Lieu_Alarme_Terminee_Non_Acquittee_T1?: number
              Date_Heure_Dernier_Acquittement_En_Cours?: Date
              Id_Alarme: number
            } = {
              Est_Lieu_Alarme_Terminee_Non_Acquittee: remainingEndedUnack > 0 ? 1 : 0,
              Est_Lieu_En_Alarme: nextActiveAlarm ? 1 : 0,
              Id_Alarme: nextActiveAlarm?.Id_Alarme ?? 0,
            }

            if (current.Date_Heure_Fin === null) {
              updateData.Date_Heure_Dernier_Acquittement_En_Cours = acknowledgedAt
            } else if (lieu?.Est_Lieu_En_Pre_Alarme === 1) {
              updateData.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 = 0
            }

            if (!nextActiveAlarm) {
              updateData.Est_Lieu_En_Pre_Alarme = lieu?.Est_Lieu_En_Pre_Alarme ?? 0
            }

            ackStep = "tx_update_lieu"
            await tx.t_lieu.update({
              where: { Id_Lieu: lieuId },
              data: updateData,
            })

            ackStep = "tx_set_immediate_retrigger_flag"
            await tx.$executeRaw`UPDATE t_lieu SET Est_Redeclenchement_Immediat = 1 WHERE Id_Lieu = ${lieuId}`
          } finally {
            ackStep = "tx_set_skip_lieu_alarm_off"
            if (isMssqlProvider()) {
              await tx.$executeRawUnsafe(
                "EXEC sp_set_session_context @key=N'SKIP_LIEU_ALARM_LOGIC', @value=NULL;",
              )
            } else {
              await tx.$executeRaw`SET @SKIP_LIEU_ALARM_LOGIC = NULL`
            }
          }
        }

        return current
      })

      if (!alarm) {
        return apiError(404, "alarm_not_found", "Alarm not found")
      }

      ackStep = "post_update_histo"
      try {
        await prisma.t_alarme_histo.updateMany({
          where: { Id_Alarme: alarmId },
          data: {
            Est_Acquittee: true,
            Est_Tel_Acquittee: true,
            Date_Heure_Acquittement: acknowledgedAt,
          },
        })
      } catch (histoError) {
        log.warn("ALARM_ACK", "Post-delete history acknowledge update failed", {
          alarmId,
          error: histoError instanceof Error ? histoError.message : String(histoError),
        })
      }

      ackStep = "audit_ack"
      log.alarm.acknowledge(
        alarm.Id_Alarme,
        alarm.t_lieu?.Nom_Lieu || "Unknown",
        alarm.t_lieu?.Id_Lieu || 0,
        ctx.user.username,
        ctx.user.userId,
        ip,
        acknowledgedAt.toISOString(),
        comment || "Alarme acquittee",
      )

      ackStep = "send_mail"
      try {
        const defaultUrl = `/${"fr"}/alarmes`
        const baseUrl = getPublicAppUrl(req)
        const alarmUrl = `${baseUrl}${defaultUrl}`

        await sendAlarmEventEmails({
          eventType: "acknowledged",
          alarmId: alarm.Id_Alarme,
          site: alarm.t_lieu?.t_site?.Libelle_Site,
          lieu: alarm.t_lieu?.Nom_Lieu || "Lieu inconnu",
          sonde: alarm.t_lieu?.Sonde_Numero_Serie,
          alarmTypeCode: alarm.Type,
          triggeredAt: alarm.Date_Heure_Debut,
          endedAt: alarm.Date_Heure_Fin,
          acknowledgedAt,
          acknowledgedBy: ctx.user.username,
          lastValue: alarm.Valeur != null ? `${alarm.Valeur}${alarm.Unite ?? "°C"}` : undefined,
          details: comment || "Acquittement utilisateur",
          alarmUrl,
          idLieu: alarm.t_lieu?.Id_Lieu,
          unite: alarm.Unite,
          consigneSup:
            alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null,
          consigneInf:
            alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null,
        })
      } catch (mailError) {
        log.warn("ALARM_EMAIL", "Acknowledge email dispatch failed", {
          alarmId: alarm.Id_Alarme,
          error: mailError instanceof Error ? mailError.message : String(mailError),
        })
      }

      ackStep = "revalidate"
      revalidateTag("alarms-data", "default")
      revalidateTag("alarms-stats", "default")
      revalidateTag("dashboard-active-alarms", "default")
      revalidateTag("dashboard-stats", "default")
      revalidateTag("dashboard-critical-sensors", "default")

      return apiOk({
        id: alarm.Id_Alarme,
        status: "acknowledged",
        acknowledgedAt: serializeDbDateTime(acknowledgedAt),
        acknowledgedBy: ctx.user.username,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "invalid_input", "Invalid input")
      }

      const err = error as { code?: string; message?: string; cause?: { code?: string; originalCode?: string; message?: string } }
      const errCode = err?.code || err?.cause?.code || err?.cause?.originalCode || "unknown"
      const errMessage = err?.message || err?.cause?.message || "unknown"
      log.error("ALARM_ACK", "Acknowledge alarm failed", {
        alarmId,
        errorCode: String(errCode),
        errorMessage: String(errMessage),
        step: ackStep,
      })
      return apiError(500, "alarm_ack_failed", "Failed to acknowledge alarm")
    }
  },
)
