import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { auditRouteUpdate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { normalizeOptionalText, vigilogLoggerSchema } from "../../_shared"

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

export const PATCH = withAuthorizationLogging(
  "ACCES_METROLOGIE",
  async (req: NextRequest, ctx: HandlerContext, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const loggerId = Number(id)
      if (!Number.isInteger(loggerId) || loggerId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de VigiLog invalide")
      }

      const body = await req.json().catch(() => ({}))
      const parsed = vigilogLoggerSchema.partial().safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "VigiLog invalide", { issues: parsed.error.issues })
      }

      const existing = await prisma.t_vigilog.findUnique({
        where: { Id_VigiLog: loggerId },
      })
      if (!existing) {
        return apiError(404, "not_found", "VigiLog introuvable")
      }

      const data = parsed.data
      const now = new Date()

      const updated = await prisma.t_vigilog.update({
        where: { Id_VigiLog: loggerId },
        data: {
          Numero_Serie:
            data.Numero_Serie !== undefined ? data.Numero_Serie : undefined,
          Modele:
            Object.prototype.hasOwnProperty.call(data, "Modele")
              ? normalizeOptionalText(data.Modele)
              : undefined,
          Libelle:
            Object.prototype.hasOwnProperty.call(data, "Libelle")
              ? normalizeOptionalText(data.Libelle)
              : undefined,
          Actif: data.Actif ?? undefined,
          Date_Etalonnage:
            Object.prototype.hasOwnProperty.call(data, "Date_Etalonnage")
              ? data.Date_Etalonnage ?? null
              : undefined,
          Date_Validite:
            Object.prototype.hasOwnProperty.call(data, "Date_Validite")
              ? data.Date_Validite ?? null
              : undefined,
          Duree_Validite_Jours:
            Object.prototype.hasOwnProperty.call(data, "Duree_Validite_Jours")
              ? data.Duree_Validite_Jours ?? null
              : undefined,
          Err_Justesse:
            Object.prototype.hasOwnProperty.call(data, "Err_Justesse")
              ? data.Err_Justesse ?? null
              : undefined,
          Commentaire:
            Object.prototype.hasOwnProperty.call(data, "Commentaire")
              ? normalizeOptionalText(data.Commentaire)
              : undefined,
          Id_Utilisateur_Maj: ctx.user.userId,
          Date_Heure_Maj: now,
        },
      })

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "VigiLog",
        resourceId: updated.Id_VigiLog,
        changes: {
          action: "update",
          serial: updated.Numero_Serie,
          model: updated.Modele,
          label: updated.Libelle,
          active: updated.Actif,
        },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "VigiLog",
        resourceId: updated.Id_VigiLog,
        before: {
          serial: existing.Numero_Serie,
          model: existing.Modele,
          label: existing.Libelle,
          active: existing.Actif,
          calibrationDate: existing.Date_Etalonnage,
          calibrationValidityDate: existing.Date_Validite,
          calibrationValidityDays: existing.Duree_Validite_Jours,
          accuracyError: existing.Err_Justesse,
          comment: existing.Commentaire,
        },
        after: {
          serial: updated.Numero_Serie,
          model: updated.Modele,
          label: updated.Libelle,
          active: updated.Actif,
          calibrationDate: updated.Date_Etalonnage,
          calibrationValidityDate: updated.Date_Validite,
          calibrationValidityDays: updated.Duree_Validite_Jours,
          accuracyError: updated.Err_Justesse,
          comment: updated.Commentaire,
        },
      })

      return apiOk(serializeLogger(updated))
    } catch (error) {
      log.error("services/vigilog/loggers/[id]", "vigilog_logger_update_failed", { error })
      return apiError(500, "vigilog_logger_update_failed", "Erreur lors de la mise a jour du VigiLog")
    }
  },
)
