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
            Date_Heure_Fin: acknowledgedAt,
          },
        })

        await tx.t_alarme.delete({ where: { Id_Alarme: alarmId } })

        if (current.t_lieu?.Id_Lieu) {
          const remainingActive = await tx.t_alarme.count({
            where: {
              Id_Lieu: current.t_lieu.Id_Lieu,
              Est_Acquittee: false,
              Date_Heure_Fin: null,
              Est_Alarme_Vrai: true,
            },
          })

          if (remainingActive === 0) {
            const lieu = await tx.t_lieu.findUnique({
              where: { Id_Lieu: current.t_lieu.Id_Lieu },
              select: { Est_Lieu_En_Pre_Alarme: true },
            })

            await tx.t_lieu.update({
              where: { Id_Lieu: current.t_lieu.Id_Lieu },
              data: {
                Est_Lieu_En_Alarme: 0,
                Lieu_Etat: lieu?.Est_Lieu_En_Pre_Alarme === 1 ? "P" : "O",
              },
            })
          }
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
