import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging, getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

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

    const actionneurs = await prisma.t_actionneur.findMany({
      select: {
        Id_Actionneur: true,
        Num_Serie: true,
        Type: true,
        Commentaire: true,
        Est_Etat: true,
        Est_Archive: true,
      },
      where: {
        Est_Archive: false,
      },
      orderBy: {
        Num_Serie: "asc",
      },
    })

    // Batch lookup: one query instead of one per actionneur
    const lieux = await prisma.t_lieu.findMany({
      where: {
        Id_Actionneur: { in: actionneurs.map((a) => a.Id_Actionneur) },
      },
      select: { Id_Actionneur: true, Id_Lieu: true },
    })
    const lieuByActionneur = new Map(
      lieux.map((l) => [l.Id_Actionneur, l.Id_Lieu])
    )

    const actionneursWithLieu = actionneurs.map((a) => ({
      ...a,
      Id_Lieu: lieuByActionneur.get(a.Id_Actionneur) ?? null,
    }))

    return apiOk(actionneursWithLieu)
  } catch (error) {
    console.error("Actionneurs fetch error:", error)
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

    const actionneur = await prisma.t_actionneur.create({
      data: {
        Type: type ?? undefined,
        Num_Serie: serie || null,
        Commentaire: commentaire || null,
      },
    })

    if (lieuId) {
      await prisma.t_lieu.update({
        where: { Id_Lieu: lieuId },
        data: { Id_Actionneur: actionneur.Id_Actionneur },
      })
    }

    log.data.create("Actionneur", actionneur.Id_Actionneur, user.username, user.userId, ip, {
      type: actionneur.Type,
      serie: actionneur.Num_Serie,
      commentaire: actionneur.Commentaire,
      lieuId: lieuId ?? null,
    })

    return apiOk(actionneur, { status: 201 })
  } catch (error) {
    console.error("Actionneur creation error:", error)
    return apiError(500, "actionneur_create_failed", "Erreur lors de la création de l'actionneur")
  }
})
