import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { revalidateTag } from "next/cache"

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
          include: { t_lieu: { select: { Id_Lieu: true, Nom_Lieu: true } } },
        })

        if (!current) return null

        await tx.t_alarme.update({
          where: { Id_Alarme: alarmId },
          data: {
            Est_Acquittee: true,
            Est_Tel_Acquittee: true,
          },
        })

        await tx.t_alarme.delete({ where: { Id_Alarme: alarmId } })

        if (current.t_lieu?.Id_Lieu) {
          const lieuId = current.t_lieu.Id_Lieu

          const remainingActive = await tx.t_alarme.count({
            where: {
              Id_Lieu: lieuId,
              Date_Heure_Fin: null,
              Est_Alarme_Vrai: true,
            },
          })

          const remainingEndedUnack = await tx.t_alarme.count({
            where: {
              Id_Lieu: lieuId,
              Date_Heure_Fin: { not: null },
              Est_Acquittee: false,
            },
          })

          const updateData: {
            Est_Lieu_Alarme_Terminee_Non_Acquittee: number
            Est_Lieu_En_Alarme?: number
            Est_Lieu_En_Pre_Alarme?: number
            Id_Alarme?: number
          } = {
            Est_Lieu_Alarme_Terminee_Non_Acquittee: remainingEndedUnack > 0 ? 1 : 0,
          }

          if (remainingActive === 0) {
            const lieu = await tx.t_lieu.findUnique({
              where: { Id_Lieu: lieuId },
              select: { Est_Lieu_En_Pre_Alarme: true },
            })

            updateData.Est_Lieu_En_Alarme = 0
            updateData.Est_Lieu_En_Pre_Alarme = lieu?.Est_Lieu_En_Pre_Alarme ?? 0
            updateData.Id_Alarme = 0
          }

          await tx.t_lieu.update({
            where: { Id_Lieu: lieuId },
            data: updateData,
          })
        }

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
