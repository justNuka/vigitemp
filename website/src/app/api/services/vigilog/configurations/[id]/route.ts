import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { auditRouteUpdate } from "@/lib/audit-route"
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
          Delai_Demarrage_Min: parsed.data.Delai_Demarrage_Min,
          Autorise_Arret_Bouton_Stop: parsed.data.Autorise_Arret_Bouton_Stop,
          Reinitialise_Avec_Bouton_Start: parsed.data.Reinitialise_Avec_Bouton_Start,
          Actif: parsed.data.Actif,
          Id_Utilisateur_Maj: ctx.user.userId,
          Date_Heure_Maj: new Date(),
        },
      })

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "Configuration VigiLog",
        resourceId: updated.Id_VigiLog_Configuration,
        changes: {
          action: "update",
          name: updated.Nom_Configuration,
          active: updated.Actif,
          frequencyMinutes: updated.Frequence_Min,
          alarmDelayMinutes: updated.Retard_Alarme_Min,
          startDelayMinutes: updated.Delai_Demarrage_Min,
          stopButtonEnabled: updated.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: updated.Reinitialise_Avec_Bouton_Start,
        },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Configuration VigiLog",
        resourceId: updated.Id_VigiLog_Configuration,
        before: {
          name: existing.Nom_Configuration,
          description: existing.Description_Configuration,
          target: existing.Consigne,
          lowLimitActive: existing.Limite_Basse_Active,
          lowLimit: existing.Limite_Basse,
          highLimitActive: existing.Limite_Haute_Active,
          highLimit: existing.Limite_Haute,
          frequencyMinutes: existing.Frequence_Min,
          alarmDelayMinutes: existing.Retard_Alarme_Min,
          startDelayMinutes: existing.Delai_Demarrage_Min,
          stopButtonEnabled: existing.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: existing.Reinitialise_Avec_Bouton_Start,
          active: existing.Actif,
        },
        after: {
          name: updated.Nom_Configuration,
          description: updated.Description_Configuration,
          target: updated.Consigne,
          lowLimitActive: updated.Limite_Basse_Active,
          lowLimit: updated.Limite_Basse,
          highLimitActive: updated.Limite_Haute_Active,
          highLimit: updated.Limite_Haute,
          frequencyMinutes: updated.Frequence_Min,
          alarmDelayMinutes: updated.Retard_Alarme_Min,
          startDelayMinutes: updated.Delai_Demarrage_Min,
          stopButtonEnabled: updated.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: updated.Reinitialise_Avec_Bouton_Start,
          active: updated.Actif,
        },
      })

      return apiOk({ id: updated.Id_VigiLog_Configuration })
    } catch (error) {
      log.error("services/vigilog/configurations/[id]", "vigilog_configuration_update_failed", {
        error,
      })
      return apiError(500, "vigilog_configuration_update_failed", "Erreur lors de la mise a jour de la configuration VigiLog")
    }
  },
)
