import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

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

    const actionneursWithLieu = await Promise.all(
      actionneurs.map(async (actionneur) => {
        const lieu = await prisma.t_lieu.findFirst({
          where: { Id_Actionneur: actionneur.Id_Actionneur },
          select: { Id_Lieu: true },
        })
        return {
          ...actionneur,
          Id_Lieu: lieu?.Id_Lieu || null,
        }
      }),
    )

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
    const { type, serie, commentaire, lieuId } = body

    const actionneur = await prisma.t_actionneur.create({
      data: {
        Type: type ? parseInt(type) : undefined,
        Num_Serie: serie || null,
        Commentaire: commentaire || null,
      },
    })

    if (lieuId) {
      await prisma.t_lieu.update({
        where: { Id_Lieu: parseInt(lieuId) },
        data: { Id_Actionneur: actionneur.Id_Actionneur },
      })
    }

    return apiOk(actionneur, { status: 201 })
  } catch (error) {
    console.error("Actionneur creation error:", error)
    return apiError(500, "actionneur_create_failed", "Erreur lors de la création de l'actionneur")
  }
})
