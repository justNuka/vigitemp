import { NextRequest } from "next/server"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging, getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { ActionneurRepository } from "@/lib/repositories/actionneur.repository"

const createActionneurSchema = z.object({
  type: z.coerce.number().int().positive().optional(),
  serie: z.string().min(1).max(50).optional().nullable(),
  commentaire: z.string().max(255).optional().nullable(),
  lieuId: z.coerce.number().int().positive().optional().nullable(),
})

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const actionneursWithLieu = await ActionneurRepository.findAllWithLieu()
    return apiOk(actionneursWithLieu)
  } catch (error) {
    log.error("actionneurs", "actionneurs_fetch_error", { error: error });
    return apiError(500, "actionneurs_fetch_failed", "Erreur lors de la récupération des actionneurs")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const body = await req.json()
    const parsed = createActionneurSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Données invalides", {
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

    log.data.create("Actionneur", actionneur.Id_Actionneur, user.username, user.userId, ip, {
      type: actionneur.Type,
      serie: actionneur.Num_Serie,
      commentaire: actionneur.Commentaire,
      lieuId: lieuId ?? null,
    })

    return apiOk(actionneur, { status: 201 })
  } catch (error) {
    log.error("actionneurs", "actionneur_creation_error", { error: error });
    return apiError(500, "actionneur_create_failed", "Erreur lors de la création de l'actionneur")
  }
})
