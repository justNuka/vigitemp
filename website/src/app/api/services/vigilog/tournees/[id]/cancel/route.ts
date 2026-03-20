import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { VIGILOG_ACCESS_CODES } from "../../../_shared"

export const POST = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const tourneeId = Number(id)
      if (!Number.isInteger(tourneeId) || tourneeId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de tournee invalide")
      }

      const existing = await prisma.t_vigilog_tournee.findUnique({
        where: { Id_VigiLog_Tournee: tourneeId },
      })
      if (!existing) {
        return apiError(404, "not_found", "Tournee VigiLog introuvable")
      }
      if (existing.Statut !== "EN_ATTENTE_RECEPTION") {
        return apiError(409, "invalid_status", "Seules les tournees en attente peuvent etre annulees")
      }

      const updated = await prisma.t_vigilog_tournee.update({
        where: { Id_VigiLog_Tournee: tourneeId },
        data: {
          Statut: "ANNULEE",
          Date_Heure_Maj: new Date(),
        },
      })

      log.data.update(
        "Tournee VigiLog",
        updated.Id_VigiLog_Tournee,
        ctx.user.username,
        ctx.user.userId,
        getClientIp(req),
        {
          action: "cancel",
          reference: updated.Reference_Tournee,
          loggerSerial: updated.Numero_Serie_VigiLog,
          previousStatus: existing.Statut,
          status: updated.Statut,
        },
      )

      return apiOk({
        id: updated.Id_VigiLog_Tournee,
        status: updated.Statut,
      })
    } catch (error) {
      log.error("services/vigilog/tournees/[id]/cancel", "vigilog_tournee_cancel_failed", { error })
      return apiError(500, "vigilog_tournee_cancel_failed", "Impossible d'annuler la tournee VigiLog")
    }
  },
)
