import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(
  async (_req: NextRequest, _ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const alarmId = parseInt(id, 10)

      if (Number.isNaN(alarmId)) {
        return apiError(400, "invalid_id", "Invalid alarm id")
      }

      const current = await prisma.t_alarme.findUnique({
        where: { Id_Alarme: alarmId },
        select: { Id_Lieu: true },
      })

      if (!current?.Id_Lieu) {
        return apiError(404, "alarm_not_found", "Alarm not found")
      }

      const days = 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [activeCount, histoCount] = await Promise.all([
        prisma.t_alarme.count({
          where: {
            Id_Lieu: current.Id_Lieu,
            Date_Heure_Debut: { gte: startDate },
            Est_Alarme_Vrai: true,
          },
        }),
        prisma.t_alarme_histo.count({
          where: {
            Id_Lieu: current.Id_Lieu,
            Date_Heure_Debut: { gte: startDate },
            Est_Alarme_Vrai: true,
          },
        }),
      ])

      return apiOk({
        days,
        count: activeCount + histoCount,
      })
    } catch (error) {
      log.error("alarmes/stats", "get_alarm_stats_error", { error: error });
      return apiError(500, "alarm_stats_failed", "Failed to fetch alarm stats")
    }
  }
)
