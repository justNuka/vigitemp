import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const alarmId = parseInt(id, 10)

      const alarm = await prisma.t_alarme.update({
        where: { Id_Alarme: alarmId },
        data: { Date_Heure_Fin: new Date() },
        include: { t_lieu: { select: { Id_Lieu: true, Nom_Lieu: true } } },
      })

      log.audit("ALARM_RESOLVED", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: `Alarme: ${alarm.t_lieu?.Nom_Lieu || "Unknown"}`,
        resourceId: alarmId,
        changes: { resolvedAt: alarm.Date_Heure_Fin },
      })

      return apiOk({
        id: alarm.Id_Alarme,
        status: "resolved",
        resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
      })
    } catch (error) {
      console.error("Resolve alarm error:", error)
      return apiError(500, "alarm_resolve_failed", "Failed to resolve alarm")
    }
  },
)
