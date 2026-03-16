import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { clearVigilogAgent, readVigilogAgent } from "@/lib/vigilog-agent"
import { normalizeOptionalText, vigilogReceiveSchema, VIGILOG_ACCESS_CODES } from "../../../_shared"
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

      const agentResponse = await readVigilogAgent()
      if (!agentResponse.res) {
        return apiError(
          503,
          "vigilog_agent_read_failed",
          agentResponse.details || "Lecture du logger impossible",
        )
      }

      const agentSerial = normalizeOptionalText(agentResponse.loggerSerial)
      if (
        agentSerial &&
        normalizeOptionalText(existing.Numero_Serie_VigiLog) &&
        agentSerial !== normalizeOptionalText(existing.Numero_Serie_VigiLog)
      ) {
        return apiError(
          409,
          "logger_mismatch",
          "Le logger detecte ne correspond pas a la tournee selectionnee",
        )
      }

      const now = new Date()
      const { analysis, updated } = await persistVigilogReception({
        tourneeId,
        arrivalUserId: ctx.user.userId,
        now,
        existingComment: existing.Commentaire,
        receiveComment: parsed.data.Commentaire,
        measures: agentResponse.measures.map((measure) => ({
          Numero_Ordre: measure.Numero_Ordre,
          Date_Heure_Mesure: new Date(measure.Date_Heure_Mesure),
          Valeur: measure.Valeur,
          Est_Marqueur: measure.Est_Marqueur,
          Details: measure.Details,
        })),
        lowActive: existing.Limite_Basse_Active,
        lowLimit: existing.Limite_Basse != null ? Number(existing.Limite_Basse) : null,
        highActive: existing.Limite_Haute_Active,
        highLimit: existing.Limite_Haute != null ? Number(existing.Limite_Haute) : null,
        frequencyMinutes: existing.Frequence_Min,
        alarmDelayMinutes: existing.Retard_Alarme_Min,
      })

      let clearSucceeded = false
      let clearDetails: string | null = null
      try {
        const clearResponse = await clearVigilogAgent()
        clearSucceeded = clearResponse.res
        clearDetails = clearResponse.details
        if (!clearResponse.res) {
          log.warn(
            "services/vigilog/tournees/[id]/receive-from-agent",
            "vigilog_tournee_clear_after_receive_failed",
            {
              tourneeId,
              loggerSerial: agentSerial || updated.Numero_Serie_VigiLog,
              details: clearResponse.details,
              step: clearResponse.step,
            },
          )
        }
      } catch (clearError) {
        log.error(
          "services/vigilog/tournees/[id]/receive-from-agent",
          "vigilog_tournee_clear_after_receive_failed",
          {
            error: clearError,
            tourneeId,
            loggerSerial: agentSerial || updated.Numero_Serie_VigiLog,
          },
        )
      }

      log.data.update(
        "Tournee VigiLog",
        updated.Id_VigiLog_Tournee,
        ctx.user.username,
        ctx.user.userId,
        getClientIp(req),
        {
          action: "receive_from_agent",
          reference: updated.Reference_Tournee,
          loggerSerial: agentSerial || updated.Numero_Serie_VigiLog,
          measurementCount: analysis.measurementCount,
          trafficLight: analysis.trafficLight,
          hasAlarm: analysis.hasAlarm,
          clearedAfterReceive: clearSucceeded,
        },
      )

      return apiOk({
        id: updated.Id_VigiLog_Tournee,
        status: updated.Statut,
        arrivalAt: updated.Date_Heure_Arrivee,
        trafficLight: updated.Resultat_Feu,
        measurementCount: updated.Nb_Mesures,
        hasAlarm: updated.Est_Alarme,
        loggerSerial: agentSerial || updated.Numero_Serie_VigiLog,
        clearedAfterReceive: clearSucceeded,
        clearDetails,
      })
    } catch (error) {
      log.error(
        "services/vigilog/tournees/[id]/receive-from-agent",
        "vigilog_tournee_receive_from_agent_failed",
        { error },
      )
      return apiError(
        503,
        "vigilog_tournee_receive_from_agent_failed",
        "Impossible de lire le logger VigiLog sur la base",
      )
    }
  },
)
