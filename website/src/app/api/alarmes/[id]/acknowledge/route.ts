import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { revalidateTag } from "next/cache"
import { sendAlarmEventEmails } from "@/lib/alarm-email"

const acknowledgeSchema = z.object({
  comment: z.string().optional(),
})

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const alarmId = parseInt(id, 10)
      const body = await req.json()
      const { comment } = acknowledgeSchema.parse(body)
      const acknowledgedAt = new Date()

      const alarm = await prisma.$transaction(async (tx) => {
        const current = await tx.t_alarme.findUnique({
          where: { Id_Alarme: alarmId },
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

        if (current.t_lieu?.Id_Lieu) {
          const lieuId = current.t_lieu.Id_Lieu

          const [nextActiveAlarm, remainingEndedUnack, lieu] = await Promise.all([
            tx.t_alarme.findFirst({
              where: {
                Id_Lieu: lieuId,
                Date_Heure_Fin: null,
                Est_Alarme_Vrai: true,
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
            Id_Alarme: number
          } = {
            Est_Lieu_Alarme_Terminee_Non_Acquittee: remainingEndedUnack > 0 ? 1 : 0,
            Est_Lieu_En_Alarme: nextActiveAlarm ? 1 : 0,
            Id_Alarme: nextActiveAlarm?.Id_Alarme ?? 0,
          }

          if (!nextActiveAlarm) {
            updateData.Est_Lieu_En_Pre_Alarme = lieu?.Est_Lieu_En_Pre_Alarme ?? 0
          }

          await tx.t_lieu.update({
            where: { Id_Lieu: lieuId },
            data: updateData,
          })
        }

        // Supprime d'abord les notifications liees pour eviter les conflits FK,
        // puis supprime l'alarme (le trigger DB peut alimenter t_alarme_histo).
        await tx.t_notification.deleteMany({
          where: { Id_Alarme: alarmId },
        })

        await tx.t_alarme.delete({
          where: { Id_Alarme: alarmId },
        })

        // Certains clients ont des triggers/procedures qui bloquent les UPDATE directs
        // sur t_alarme (MySQL 1442). On force donc l'etat acquitte dans l'historique.
        await tx.t_alarme_histo.updateMany({
          where: { Id_Alarme: alarmId },
          data: {
            Est_Acquittee: true,
            Est_Tel_Acquittee: true,
            Date_Heure_Acquittement: acknowledgedAt,
          },
        })

        return current
      })

      if (!alarm) {
        return apiError(404, "alarm_not_found", "Alarm not found")
      }

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

      try {
        const defaultUrl = `/${"fr"}/alarmes`
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const alarmUrl = `${baseUrl}${defaultUrl}`

        await sendAlarmEventEmails({
          eventType: "acknowledged",
          alarmId: alarm.Id_Alarme,
          site: alarm.t_lieu?.t_site?.Libelle_Site,
          lieu: alarm.t_lieu?.Nom_Lieu || "Lieu inconnu",
          sonde: alarm.t_lieu?.Sonde_Numero_Serie,
          alarmTypeCode: alarm.Type,
          triggeredAt: alarm.Date_Heure_Debut_Alarme_Vrai ?? alarm.Date_Heure_Debut,
          endedAt: alarm.Date_Heure_Fin,
          acknowledgedAt,
          acknowledgedBy: ctx.user.username,
          lastValue: alarm.Valeur != null ? `${alarm.Valeur}${alarm.Unite ?? "?C"}` : undefined,
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

      revalidateTag("alarms-data", "default")
      revalidateTag("alarms-stats", "default")
      revalidateTag("dashboard-active-alarms", "default")
      revalidateTag("dashboard-stats", "default")
      revalidateTag("dashboard-critical-sensors", "default")

      return apiOk({
        id: alarm.Id_Alarme,
        status: "acknowledged",
        acknowledgedAt: acknowledgedAt.toISOString(),
        acknowledgedBy: ctx.user.username,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "invalid_input", "Invalid input")
      }

      console.error("Acknowledge alarm error:", error)
      return apiError(500, "alarm_ack_failed", "Failed to acknowledge alarm")
    }
  },
)
