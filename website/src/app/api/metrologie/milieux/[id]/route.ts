import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import {
  archiveIntercomparisonMedium,
  fetchIntercomparisonMediumById,
  updateIntercomparisonMedium,
} from "@/lib/metrology-db"
import { getPermissionAliases } from "@/lib/permissions"

const WRITE_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const mediumSchema = z.object({
  Model: z.string().min(1, "Modele requis"),
  Reference: z.string().min(1, "Reference requise"),
  Stabilite: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }),
  Homogeneite: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
    if (value === null || value === undefined || value === "") return null
    const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
    return Number.isFinite(parsed) ? parsed : null
  }),
  Contenu: z.string().default(""),
})

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  WRITE_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params
      const id = Number.parseInt(resolvedParams.id, 10)
      if (Number.isNaN(id)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const body = await req.json()
      const data = mediumSchema.parse(body)
      const previous = await fetchIntercomparisonMediumById(id)
      if (!previous) {
        return apiError(404, "not_found", "Milieu introuvable")
      }

      await updateIntercomparisonMedium(id, {
        model: data.Model.trim(),
        reference: data.Reference.trim(),
        stabilite: data.Stabilite,
        homogeneite: data.Homogeneite,
        contenu: data.Contenu.trim(),
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "MilieuInterComparaison",
        resourceId: id,
        before: previous,
        after: data,
        reason: `Modification milieu ${data.Model} ${data.Reference}`,
      })

      return apiOk({ Id_Milieu: id })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }

      return apiError(500, "metrology_medium_update_failed", "Erreur lors de la mise a jour du milieu d'inter-comparaison")
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  WRITE_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params
      const id = Number.parseInt(resolvedParams.id, 10)
      if (Number.isNaN(id)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const previous = await fetchIntercomparisonMediumById(id)
      if (!previous) {
        return apiError(404, "not_found", "Milieu introuvable")
      }

      await archiveIntercomparisonMedium(id)
      auditRouteDelete(req, ctx.user, {
        resource: "MilieuInterComparaison",
        resourceId: id,
        data: previous,
        reason: `Archivage milieu ${String(previous.Model ?? "")} ${String(previous.Reference ?? "")}`.trim(),
      })

      return apiOk({ Id_Milieu: id })
    } catch (error) {
      return apiError(500, "metrology_medium_delete_failed", "Erreur lors de l'archivage du milieu d'inter-comparaison")
    }
  },
)
