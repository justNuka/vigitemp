import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { vigilogReceiveSchema, VIGILOG_ACCESS_CODES } from "../../../_shared"
import { persistVigilogReception } from "../../receive-helpers"

export const POST = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const tourneeId = Number(id)
      if (!Number.isInteger(tourneeId) || tourneeId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de tournee invalide")
      }

      const body = await req.json().catch(() => ({}))
      const parsed = vigilogReceiveSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Reception VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const existing = await prisma.t_vigilog_tournee.findUnique({
        where: { Id_VigiLog_Tournee: tourneeId },
      })
      if (!existing) {
        return apiError(404, "not_found", "Tournee VigiLog introuvable")
      }
      if (existing.Statut !== "EN_ATTENTE_RECEPTION") {
        return apiError(409, "invalid_status", "Cette tournee n'est pas en attente de reception")
      }

      const linkedLogger = existing.Id_VigiLog
        ? await prisma.t_vigilog.findUnique({
            where: { Id_VigiLog: existing.Id_VigiLog },
            select: { Err_Justesse: true },
          })
        : await prisma.t_vigilog.findUnique({
            where: { Numero_Serie: existing.Numero_Serie_VigiLog },
            select: { Err_Justesse: true },
          })

      const now = new Date()
      const { analysis, updated } = await persistVigilogReception({
        tourneeId,
        arrivalUserId: ctx.user.userId,
        now,
        existingComment: existing.Commentaire,
        receiveComment: parsed.data.Commentaire,
        measures: parsed.data.Mesures,
        lowActive: existing.Limite_Basse_Active,
        lowLimit: existing.Limite_Basse != null ? Number(existing.Limite_Basse) : null,
        highActive: existing.Limite_Haute_Active,
        highLimit: existing.Limite_Haute != null ? Number(existing.Limite_Haute) : null,
        frequencyMinutes: existing.Frequence_Min,
        alarmDelayMinutes: existing.Retard_Alarme_Min,
        accuracyError:
          linkedLogger?.Err_Justesse != null ? Number(linkedLogger.Err_Justesse) : null,
      })

      log.data.update(
        "Tournee VigiLog",
        updated.Id_VigiLog_Tournee,
        ctx.user.username,
        ctx.user.userId,
        getClientIp(req),
        {
          action: "receive",
          reference: updated.Reference_Tournee,
          loggerSerial: updated.Numero_Serie_VigiLog,
          measurementCount: analysis.measurementCount,
          trafficLight: analysis.trafficLight,
          hasAlarm: analysis.hasAlarm,
        },
      )

      return apiOk({
        id: updated.Id_VigiLog_Tournee,
        status: updated.Statut,
        arrivalAt: updated.Date_Heure_Arrivee,
        trafficLight: updated.Resultat_Feu,
        measurementCount: updated.Nb_Mesures,
        hasAlarm: updated.Est_Alarme,
      })
    } catch (error) {
      log.error("services/vigilog/tournees/[id]/receive", "vigilog_tournee_receive_failed", {
        error,
      })
      return apiError(500, "vigilog_tournee_receive_failed", "Erreur lors de la reception de la tournee VigiLog")
    }
  },
)
