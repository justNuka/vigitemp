import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { fetchIntercomparisonMediaRows, insertIntercomparisonMedium } from "@/lib/metrology-db"
import { getPermissionAliases } from "@/lib/permissions"

const READ_CODES = getPermissionAliases("METROLOGY_ACCESS")
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

export const GET = withStandardOrExpertAnyAuthorizationLogging(READ_CODES, async () => {
  try {
    const rows = await fetchIntercomparisonMediaRows()
    return apiOk(rows)
  } catch (error) {
    return apiError(500, "metrology_medium_fetch_failed", "Erreur lors de la recuperation des milieux d'inter-comparaison")
  }
})

export const POST = withStandardOrExpertAnyAuthorizationLogging(WRITE_CODES, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json()
    const data = mediumSchema.parse(body)
    const id = await insertIntercomparisonMedium({
      model: data.Model.trim(),
      reference: data.Reference.trim(),
      stabilite: data.Stabilite,
      homogeneite: data.Homogeneite,
      contenu: data.Contenu.trim(),
    })

    auditRouteCreate(req, ctx.user, {
      resource: "MilieuInterComparaison",
      resourceId: id,
      data,
      reason: `Creation milieu ${data.Model} ${data.Reference}`,
    })

    return apiOk({ Id_Milieu: id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
    }

    return apiError(500, "metrology_medium_create_failed", "Erreur lors de la creation du milieu d'inter-comparaison")
  }
})
