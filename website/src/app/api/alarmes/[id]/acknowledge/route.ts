import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

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

      const alarm = await prisma.t_alarme.update({
        where: { Id_Alarme: alarmId },
        data: { Est_Acquittee: true, Est_Tel_Acquittee: true },
        include: { t_lieu: { select: { Id_Lieu: true, Nom_Lieu: true } } },
      })

      log.alarm.acknowledge(
        alarm.t_lieu?.Nom_Lieu || "Unknown",
        alarm.t_lieu?.Id_Lieu || 0,
        ctx.user.username,
        ctx.user.userId,
        ip,
        comment || "Alarme acquittée",
      )

      return apiOk({
        id: alarm.Id_Alarme,
        status: "acknowledged",
        acknowledgedAt: new Date().toISOString(),
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
