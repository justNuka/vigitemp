import { NextRequest } from "next/server"
import { z } from "zod"

import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { ActionneurRepository } from "@/lib/repositories/actionneur.repository"

const ACTIONNEUR_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

const createActionneurSchema = z.object({
  type: z.coerce.number().int().positive().optional(),
  serie: z.string().min(1).max(50).optional().nullable(),
  commentaire: z.string().max(255).optional().nullable(),
  lieuId: z.coerce.number().int().positive().optional().nullable(),
})

export const GET = withOneOrHigherAnyAuthorizationLogging(ACTIONNEUR_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const actionneursWithLieu = await ActionneurRepository.findAllWithLieu()
    return apiOk(actionneursWithLieu)
  } catch (error) {
    log.error("actionneurs", "actionneurs_fetch_error", { error })
    return apiError(500, "actionneurs_fetch_failed", "Erreur lors de la recuperation des actionneurs")
  }
})

export const POST = withOneOrHigherAnyAuthorizationLogging(ACTIONNEUR_ACCESS_CODES, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json()
    const parsed = createActionneurSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Donnees invalides", {
        details: parsed.error.issues,
      })
    }

    const { type, serie, commentaire, lieuId } = parsed.data
    const { ip } = getRequestContext(req)

    const actionneur = await ActionneurRepository.create({
      type,
      serie,
      commentaire,
      lieuId,
    })

    log.data.create("Actionneur", actionneur.Id_Actionneur, ctx.user.username, ctx.user.userId, ip, {
      type: actionneur.Type,
      serie: actionneur.Num_Serie,
      commentaire: actionneur.Commentaire,
      lieuId: lieuId ?? null,
    })

    auditRouteCreate(req, ctx.user, {
      resource: "Actionneur",
      resourceId: actionneur.Id_Actionneur,
      data: {
        Type: actionneur.Type,
        Num_Serie: actionneur.Num_Serie,
        Commentaire: actionneur.Commentaire,
        Id_Lieu: lieuId ?? null,
      },
      reason: `Creation actionneur ${actionneur.Num_Serie || actionneur.Id_Actionneur}`,
    })

    return apiOk(actionneur, { status: 201 })
  } catch (error) {
    log.error("actionneurs", "actionneur_creation_error", { error })
    return apiError(500, "actionneur_create_failed", "Erreur lors de la creation de l'actionneur")
  }
})
