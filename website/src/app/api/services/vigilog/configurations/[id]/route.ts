import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  normalizeOptionalText,
  vigilogConfigurationSchema,
  VIGILOG_CONFIG_MANAGE_CODES,
} from "../../_shared"

export const PATCH = withAnyAuthorizationLogging(
  VIGILOG_CONFIG_MANAGE_CODES,
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const configurationId = Number(id)
      if (!Number.isInteger(configurationId) || configurationId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de configuration invalide")
      }

      const body = await req.json()
      const parsed = vigilogConfigurationSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Configuration VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const existing = await prisma.t_vigilog_configuration.findUnique({
        where: { Id_VigiLog_Configuration: configurationId },
      })
      if (!existing) {
        return apiError(404, "not_found", "Configuration VigiLog introuvable")
      }

      const updated = await prisma.t_vigilog_configuration.update({
        where: { Id_VigiLog_Configuration: configurationId },
        data: {
          Nom_Configuration: parsed.data.Nom_Configuration,
          Description_Configuration: normalizeOptionalText(parsed.data.Description_Configuration),
          Consigne: parsed.data.Consigne ?? null,
          Limite_Basse_Active: parsed.data.Limite_Basse_Active,
          Limite_Basse: parsed.data.Limite_Basse_Active ? parsed.data.Limite_Basse ?? null : null,
          Limite_Haute_Active: parsed.data.Limite_Haute_Active,
          Limite_Haute: parsed.data.Limite_Haute_Active ? parsed.data.Limite_Haute ?? null : null,
          Frequence_Min: parsed.data.Frequence_Min,
          Retard_Alarme_Min: parsed.data.Retard_Alarme_Min,
          Actif: parsed.data.Actif,
          Id_Utilisateur_Maj: ctx.user.userId,
          Date_Heure_Maj: new Date(),
        },
      })

      log.data.update(
        "Configuration VigiLog",
        updated.Id_VigiLog_Configuration,
        ctx.user.username,
        ctx.user.userId,
        getClientIp(req),
        {
          name: updated.Nom_Configuration,
          active: updated.Actif,
          frequencyMinutes: updated.Frequence_Min,
          alarmDelayMinutes: updated.Retard_Alarme_Min,
        },
      )

      return apiOk({ id: updated.Id_VigiLog_Configuration })
    } catch (error) {
      log.error("services/vigilog/configurations/[id]", "vigilog_configuration_update_failed", {
        error,
      })
      return apiError(500, "vigilog_configuration_update_failed", "Erreur lors de la mise a jour de la configuration VigiLog")
    }
  },
)
