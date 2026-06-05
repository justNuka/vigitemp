import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withStandardOrExpertAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { auditRouteCreate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  normalizeOptionalText,
  vigilogConfigurationSchema,
  VIGILOG_ACCESS_CODES,
  VIGILOG_CONFIG_MANAGE_CODES,
} from "../_shared"

function formatUserLabel(user: {
  Login: string | null
  Prenom: string | null
  Nom: string | null
} | null | undefined) {
  if (!user) return null
  const fullName = [user.Prenom, user.Nom].filter(Boolean).join(" ").trim()
  return fullName || user.Login || null
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async () => {
  try {
    const configurations = await prisma.t_vigilog_configuration.findMany({
      orderBy: [{ Actif: "desc" }, { Nom_Configuration: "asc" }],
      select: {
        Id_VigiLog_Configuration: true,
        Nom_Configuration: true,
        Description_Configuration: true,
        Consigne: true,
        Limite_Basse_Active: true,
        Limite_Basse: true,
        Limite_Haute_Active: true,
        Limite_Haute: true,
        Frequence_Min: true,
        Retard_Alarme_Min: true,
        Delai_Demarrage_Min: true,
        Autorise_Arret_Bouton_Stop: true,
        Reinitialise_Avec_Bouton_Start: true,
        Actif: true,
        Date_Heure_Creation: true,
        Date_Heure_Maj: true,
        t_utilisateur_t_vigilog_configuration_Id_Utilisateur_CreationTot_utilisateur: {
          select: {
            Login: true,
            Prenom: true,
            Nom: true,
          },
        },
        t_utilisateur_t_vigilog_configuration_Id_Utilisateur_MajTot_utilisateur: {
          select: {
            Login: true,
            Prenom: true,
            Nom: true,
          },
        },
      },
    })

    return apiOk(
      configurations.map((configuration) => ({
        id: configuration.Id_VigiLog_Configuration,
        name: configuration.Nom_Configuration,
        description: configuration.Description_Configuration,
        target: configuration.Consigne ? Number(configuration.Consigne) : null,
        lowLimitActive: configuration.Limite_Basse_Active,
        lowLimit: configuration.Limite_Basse ? Number(configuration.Limite_Basse) : null,
        highLimitActive: configuration.Limite_Haute_Active,
        highLimit: configuration.Limite_Haute ? Number(configuration.Limite_Haute) : null,
        frequencyMinutes: configuration.Frequence_Min,
        alarmDelayMinutes: configuration.Retard_Alarme_Min,
        startDelayMinutes: configuration.Delai_Demarrage_Min,
        stopButtonEnabled: configuration.Autorise_Arret_Bouton_Stop,
        resetWithStartEnabled: configuration.Reinitialise_Avec_Bouton_Start,
        active: configuration.Actif,
        createdAt: configuration.Date_Heure_Creation,
        updatedAt: configuration.Date_Heure_Maj,
        createdBy: formatUserLabel(
          configuration.t_utilisateur_t_vigilog_configuration_Id_Utilisateur_CreationTot_utilisateur,
        ),
        updatedBy: formatUserLabel(
          configuration.t_utilisateur_t_vigilog_configuration_Id_Utilisateur_MajTot_utilisateur,
        ),
      })),
    )
  } catch (error) {
    log.error("services/vigilog/configurations", "vigilog_configurations_fetch_failed", { error })
    return apiError(500, "vigilog_configurations_fetch_failed", "Erreur lors du chargement des configurations VigiLog")
  }
})

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  VIGILOG_CONFIG_MANAGE_CODES,
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const body = await req.json()
      const parsed = vigilogConfigurationSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Configuration VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const configuration = await prisma.t_vigilog_configuration.create({
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
          Id_Utilisateur_Creation: ctx.user.userId,
          Date_Heure_Creation: new Date(),
          Id_Utilisateur_Maj: ctx.user.userId,
          Date_Heure_Maj: new Date(),
        },
      })

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "Configuration VigiLog",
        resourceId: configuration.Id_VigiLog_Configuration,
        changes: {
          action: "create",
          name: configuration.Nom_Configuration,
          active: configuration.Actif,
          frequencyMinutes: configuration.Frequence_Min,
          alarmDelayMinutes: configuration.Retard_Alarme_Min,
          startDelayMinutes: configuration.Delai_Demarrage_Min,
          stopButtonEnabled: configuration.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: configuration.Reinitialise_Avec_Bouton_Start,
        },
      })

      auditRouteCreate(req, ctx.user, {
        resource: "Configuration VigiLog",
        resourceId: configuration.Id_VigiLog_Configuration,
        data: {
          name: configuration.Nom_Configuration,
          description: configuration.Description_Configuration,
          target: configuration.Consigne,
          lowLimitActive: configuration.Limite_Basse_Active,
          lowLimit: configuration.Limite_Basse,
          highLimitActive: configuration.Limite_Haute_Active,
          highLimit: configuration.Limite_Haute,
          frequencyMinutes: configuration.Frequence_Min,
          alarmDelayMinutes: configuration.Retard_Alarme_Min,
          startDelayMinutes: configuration.Delai_Demarrage_Min,
          stopButtonEnabled: configuration.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: configuration.Reinitialise_Avec_Bouton_Start,
          active: configuration.Actif,
        },
      })

      return apiOk({ id: configuration.Id_VigiLog_Configuration }, { status: 201 })
    } catch (error) {
      log.error("services/vigilog/configurations", "vigilog_configuration_create_failed", { error })
      return apiError(500, "vigilog_configuration_create_failed", "Erreur lors de la creation de la configuration VigiLog")
    }
  },
)

