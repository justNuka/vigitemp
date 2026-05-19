import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { configureVigilogAgent } from "@/lib/vigilog-agent"
import { VIGILOG_ACCESS_CODES } from "../../_shared"

const schema = z.object({
  configurationId: z.coerce.number().int().min(1),
})

export const POST = withAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Configuration VigiLog invalide", {
        issues: parsed.error.issues,
      })
    }

    const configuration = await prisma.t_vigilog_configuration.findUnique({
      where: { Id_VigiLog_Configuration: parsed.data.configurationId },
    })

    if (!configuration || !configuration.Actif) {
      return apiError(
        404,
        "configuration_not_found",
        "Configuration VigiLog introuvable ou inactive",
      )
    }

    const response = await configureVigilogAgent({
      lowLimitActive: configuration.Limite_Basse_Active,
      lowLimit: configuration.Limite_Basse != null ? Number(configuration.Limite_Basse) : null,
      highLimitActive: configuration.Limite_Haute_Active,
      highLimit: configuration.Limite_Haute != null ? Number(configuration.Limite_Haute) : null,
      frequencyMinutes: configuration.Frequence_Min,
      alarmDelayMinutes: configuration.Retard_Alarme_Min,
      startDelayMinutes: configuration.Delai_Demarrage_Min,
      stopButtonEnabled: configuration.Autorise_Arret_Bouton_Stop,
      resetWithStartEnabled: configuration.Reinitialise_Avec_Bouton_Start,
      startAutomatically: false,
    })

    if (!response.res) {
      return apiError(503, "vigilog_agent_configure_failed", response.details || "Parametrage impossible")
    }

    return apiOk(response)
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : ""

    let userMessage = "Impossible de parametrer le logger VigiLog"
    if (rawMessage.includes("status 401")) {
      userMessage = "Acces refuse par l'agent local (401). Verifiez la configuration de securite de l'agent."
    } else if (rawMessage.includes("Agent unavailable")) {
      userMessage = "Agent local indisponible (port 8000). Verifiez que VigiSensys Agent est lance."
    } else if (rawMessage.trim().length > 0) {
      userMessage = rawMessage
    }

    log.error("services/vigilog/agent/configure", "vigilog_agent_configure_failed", {
      errorMessage: rawMessage || null,
      errorName: error instanceof Error ? error.name : null,
      errorStack: error instanceof Error ? error.stack : null,
    })

    return apiError(503, "vigilog_agent_configure_failed", userMessage)
  }
})
