import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { auditRouteCreate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  normalizeOptionalText,
  vigilogLoggerSchema,
  VIGILOG_ACCESS_CODES,
} from "../_shared"

function serializeLogger(logger: {
  Id_VigiLog: number
  Numero_Serie: string
  Modele: string | null
  Libelle: string | null
  Actif: boolean
  Date_Etalonnage: Date | null
  Date_Validite: Date | null
  Duree_Validite_Jours: number | null
  Err_Justesse: number | null
  Commentaire: string | null
  Date_Heure_Creation: Date
  Date_Heure_Maj: Date | null
}) {
  return {
    id: logger.Id_VigiLog,
    serial: logger.Numero_Serie,
    model: logger.Modele,
    label: logger.Libelle,
    active: logger.Actif,
    calibrationDate: logger.Date_Etalonnage,
    calibrationValidityDate: logger.Date_Validite,
    calibrationValidityDays: logger.Duree_Validite_Jours,
    accuracyError: logger.Err_Justesse,
    comment: logger.Commentaire,
    createdAt: logger.Date_Heure_Creation,
    updatedAt: logger.Date_Heure_Maj,
  }
}

export const GET = withAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async () => {
  try {
    const loggers = await prisma.t_vigilog.findMany({
      orderBy: [{ Actif: "desc" }, { Numero_Serie: "asc" }],
    })

    return apiOk(loggers.map(serializeLogger))
  } catch (error) {
    log.error("services/vigilog/loggers", "vigilog_loggers_fetch_failed", { error })
    return apiError(500, "vigilog_loggers_fetch_failed", "Erreur lors du chargement des VigiLog")
  }
})

export const POST = withAuthorizationLogging(
  "ACCES_METROLOGIE",
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const body = await req.json().catch(() => ({}))
      const parsed = vigilogLoggerSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "VigiLog invalide", { issues: parsed.error.issues })
      }

      const data = parsed.data
      const now = new Date()

      const existing = await prisma.t_vigilog.findUnique({
        where: { Numero_Serie: data.Numero_Serie },
      })

      if (existing) {
        return apiError(409, "serial_exists", "Un VigiLog avec ce numero de serie existe deja")
      }

      const created = await prisma.t_vigilog.create({
        data: {
          Numero_Serie: data.Numero_Serie,
          Modele: normalizeOptionalText(data.Modele),
          Libelle: normalizeOptionalText(data.Libelle),
          Actif: data.Actif,
          Date_Etalonnage: data.Date_Etalonnage ?? null,
          Date_Validite: data.Date_Validite ?? null,
          Duree_Validite_Jours: data.Duree_Validite_Jours ?? null,
          Err_Justesse: data.Err_Justesse ?? null,
          Commentaire: normalizeOptionalText(data.Commentaire),
          Id_Utilisateur_Creation: ctx.user.userId,
          Date_Heure_Creation: now,
          Id_Utilisateur_Maj: ctx.user.userId,
          Date_Heure_Maj: now,
        },
      })

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "VigiLog",
        resourceId: created.Id_VigiLog,
        changes: {
          action: "create",
          serial: created.Numero_Serie,
          model: created.Modele,
          label: created.Libelle,
          active: created.Actif,
        },
      })

      auditRouteCreate(req, ctx.user, {
        resource: "VigiLog",
        resourceId: created.Id_VigiLog,
        data: {
          serial: created.Numero_Serie,
          model: created.Modele,
          label: created.Libelle,
          active: created.Actif,
          calibrationDate: created.Date_Etalonnage,
          calibrationValidityDate: created.Date_Validite,
          calibrationValidityDays: created.Duree_Validite_Jours,
          accuracyError: created.Err_Justesse,
          comment: created.Commentaire,
        },
      })

      return apiOk(serializeLogger(created), { status: 201 })
    } catch (error) {
      log.error("services/vigilog/loggers", "vigilog_logger_create_failed", { error })
      return apiError(500, "vigilog_logger_create_failed", "Erreur lors de la creation du VigiLog")
    }
  },
)
