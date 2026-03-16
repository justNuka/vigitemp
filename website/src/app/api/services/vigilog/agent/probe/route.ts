import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { probeVigilogAgent } from "@/lib/vigilog-agent"
import { VIGILOG_ACCESS_CODES } from "../../_shared"

export const GET = withAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const response = await probeVigilogAgent()
    if (!response.res) {
      const details = response.details || "Logger indisponible"
      const availabilityOnlyMessages = new Set([
        "Pas de logger detecte sur le dock",
        "Aucun dock logger connecte",
      ])

      if (availabilityOnlyMessages.has(details)) {
        return apiOk({
          ...response,
          registeredLogger: null,
        })
      }

      return apiError(503, "vigilog_agent_probe_failed", details)
    }
    const registeredLogger = response.loggerSerial
      ? await prisma.t_vigilog.findUnique({
          where: { Numero_Serie: response.loggerSerial },
          select: {
            Id_VigiLog: true,
            Numero_Serie: true,
            Modele: true,
            Libelle: true,
            Actif: true,
            Date_Etalonnage: true,
            Date_Validite: true,
            Duree_Validite_Jours: true,
            Err_Justesse: true,
            Commentaire: true,
            Date_Heure_Creation: true,
            Date_Heure_Maj: true,
          },
        })
      : null

    return apiOk({
      ...response,
      registeredLogger: registeredLogger
        ? {
            id: registeredLogger.Id_VigiLog,
            serial: registeredLogger.Numero_Serie,
            model: registeredLogger.Modele,
            label: registeredLogger.Libelle,
            active: registeredLogger.Actif,
            calibrationDate: registeredLogger.Date_Etalonnage,
            calibrationValidityDate: registeredLogger.Date_Validite,
            calibrationValidityDays: registeredLogger.Duree_Validite_Jours,
            accuracyError: registeredLogger.Err_Justesse,
            comment: registeredLogger.Commentaire,
            createdAt: registeredLogger.Date_Heure_Creation,
            updatedAt: registeredLogger.Date_Heure_Maj,
          }
        : null,
    })
  } catch (error) {
    log.error("services/vigilog/agent/probe", "vigilog_agent_probe_failed", { error })
    return apiError(503, "vigilog_agent_probe_failed", "Impossible de communiquer avec la base VigiLog")
  }
})
