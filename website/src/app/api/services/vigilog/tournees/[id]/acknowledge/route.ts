import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withStandardOrExpertAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { normalizeOptionalText, vigilogAcknowledgeSchema, VIGILOG_ACCESS_CODES } from "../../../_shared"

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const tourneeId = Number(id)
      if (!Number.isInteger(tourneeId) || tourneeId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de tournee invalide")
      }

      const body = await req.json().catch(() => ({}))
      const parsed = vigilogAcknowledgeSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Acquittement VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const existing = await prisma.t_vigilog_tournee.findUnique({
        where: { Id_VigiLog_Tournee: tourneeId },
      })
      if (!existing) {
        return apiError(404, "not_found", "Tournee VigiLog introuvable")
      }
      if (!existing.Est_Alarme) {
        return apiError(409, "not_alarm", "Cette tournee n'est pas en alarme")
      }
      if (existing.Est_Acquittee) {
        return apiError(409, "already_acknowledged", "Cette tournee est deja acquittee")
      }

      const now = new Date()
      const updated = await prisma.t_vigilog_tournee.update({
        where: { Id_VigiLog_Tournee: tourneeId },
        data: {
          Est_Acquittee: true,
          Statut: existing.Statut === "ANALYSEE" ? "ACQUITTEE" : existing.Statut,
          Commentaire_Acquittement: normalizeOptionalText(parsed.data.Commentaire_Acquittement),
          Id_Utilisateur_Acquittement: ctx.user.userId,
          Date_Heure_Acquittement: now,
          Date_Heure_Maj: now,
        },
      })

      log.audit("ACQ", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: `Tournee VigiLog ${updated.Reference_Tournee}`,
        resourceId: updated.Id_VigiLog_Tournee,
        reason: updated.Commentaire_Acquittement || undefined,
      })

      return apiOk({
        id: updated.Id_VigiLog_Tournee,
        status: updated.Statut,
        acknowledgedAt: updated.Date_Heure_Acquittement,
      })
    } catch (error) {
      log.error("services/vigilog/tournees/[id]/acknowledge", "vigilog_tournee_ack_failed", {
        error,
      })
      return apiError(500, "vigilog_tournee_ack_failed", "Erreur lors de l'acquittement de la tournee VigiLog")
    }
  },
)

