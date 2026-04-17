import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { auditRouteUpdate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { clearVigilogAgent } from "@/lib/vigilog-agent"
import {
  normalizeOptionalText,
  vigilogTemporaryUsageStopSchema,
  VIGILOG_ACCESS_CODES,
} from "../../../_shared"
import { ensureVigilogTemporaryUsageTable } from "../../_table"

type ExistingUsageRow = {
  id: number
  reference: string
  status: string
  loggerSerial: string
  temporaryLocationName: string
  startComment: string | null
  stopComment: string | null
  startedAt: Date | string
  stoppedAt: Date | string | null
}

export const POST = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const hasTable = await ensureVigilogTemporaryUsageTable()
      if (!hasTable) {
        return apiError(
          503,
          "vigilog_temp_usage_table_missing",
          "La table des usages ponctuels VigiLog n'est pas disponible sur cette installation",
        )
      }

      const { id } = await routeContext.params
      const usageId = Number(id)
      if (!Number.isInteger(usageId) || usageId <= 0) {
        return apiError(400, "invalid_id", "Identifiant d'usage ponctuel invalide")
      }

      const body = await req.json().catch(() => ({}))
      const parsed = vigilogTemporaryUsageStopSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Demande d'arret d'usage ponctuel invalide", {
          issues: parsed.error.issues,
        })
      }

      const [existing] = await prisma.$queryRaw<ExistingUsageRow[]>`
        SELECT
          Id_VigiLog_Usage_Ponctuel AS id,
          Reference_Usage AS reference,
          Statut AS status,
          Numero_Serie_VigiLog AS loggerSerial,
          Nom_Lieu_Temporaire AS temporaryLocationName,
          Commentaire_Demarrage AS startComment,
          Commentaire_Arret AS stopComment,
          Date_Heure_Demarrage AS startedAt,
          Date_Heure_Arret AS stoppedAt
        FROM t_vigilog_usage_ponctuel
        WHERE Id_VigiLog_Usage_Ponctuel = ${usageId}
        LIMIT 1
      `

      if (!existing) {
        return apiError(404, "not_found", "Usage ponctuel VigiLog introuvable")
      }

      if (existing.status !== "EN_COURS") {
        return apiError(409, "invalid_status", "Cet usage ponctuel VigiLog est deja termine")
      }

      const now = new Date()
      let clearedFromAgent = false
      let clearDetails: string | null = null

      try {
        const clearResponse = await clearVigilogAgent()
        clearedFromAgent = clearResponse.res
        clearDetails = clearResponse.details
      } catch (clearError) {
        log.warn(
          "services/vigilog/usages-ponctuels/[id]/stop",
          "vigilog_temp_usage_clear_failed",
          {
            usageId,
            loggerSerial: existing.loggerSerial,
            error: clearError,
          },
        )
      }

      const updatedCount = await prisma.$executeRaw`
        UPDATE t_vigilog_usage_ponctuel
        SET
          Statut = ${"TERMINE"},
          Id_Utilisateur_Arret = ${ctx.user.userId},
          Date_Heure_Arret = ${now},
          Commentaire_Arret = ${normalizeOptionalText(parsed.data.Commentaire_Arret)},
          Date_Heure_Maj = ${now}
        WHERE Id_VigiLog_Usage_Ponctuel = ${usageId}
          AND Statut = 'EN_COURS'
      `

      if (Number(updatedCount) < 1) {
        return apiError(409, "invalid_status", "Cet usage ponctuel VigiLog n'est plus actif")
      }

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "Usage ponctuel VigiLog",
        resourceId: usageId,
        changes: {
          action: "stop",
          reference: existing.reference,
          loggerSerial: existing.loggerSerial,
          temporaryLocationName: existing.temporaryLocationName,
          status: "TERMINE",
          clearedFromAgent,
          clearDetails,
        },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Usage ponctuel VigiLog",
        resourceId: usageId,
        before: {
          status: existing.status,
          stopComment: existing.stopComment,
          stoppedAt: existing.stoppedAt,
        },
        after: {
          status: "TERMINE",
          stopComment: normalizeOptionalText(parsed.data.Commentaire_Arret),
          stoppedAt: now,
          clearedFromAgent,
        },
      })

      return apiOk({
        id: usageId,
        status: "TERMINE",
        stoppedAt: now,
        clearedFromAgent,
        clearDetails,
      })
    } catch (error) {
      log.error("services/vigilog/usages-ponctuels/[id]/stop", "vigilog_temp_usage_stop_failed", {
        error,
      })
      return apiError(500, "vigilog_temp_usage_stop_failed", "Erreur lors de l'arret de l'usage ponctuel VigiLog")
    }
  },
)
