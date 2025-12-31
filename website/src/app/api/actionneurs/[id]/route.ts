import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const user = getAuthenticatedUser(req)
      if (!user) {
        return apiError(401, "unauthenticated", "Non authentifié")
      }

      const { id: idParam } = await params
      const id = parseInt(idParam)

      if (!id) {
        return apiError(400, "invalid_id", "ID actionneur invalide")
      }

      const body = await req.json()
      const { type, serie, commentaire, lieuId } = body

      const actionneur = await prisma.t_actionneur.findUnique({
        where: { Id_Actionneur: id },
      })

      if (!actionneur) {
        return apiError(404, "not_found", "Actionneur non trouvé")
      }

      const updated = await prisma.t_actionneur.update({
        where: { Id_Actionneur: id },
        data: {
          Type: type ? parseInt(type) : actionneur.Type,
          Num_Serie: serie || actionneur.Num_Serie,
          Commentaire: commentaire || actionneur.Commentaire,
        },
      })

      if (lieuId) {
        const newLieuId = parseInt(lieuId)

        const oldLieu = await prisma.t_lieu.findFirst({
          where: { Id_Actionneur: id },
          select: { Id_Lieu: true },
        })

        if (oldLieu && oldLieu.Id_Lieu !== newLieuId) {
          await prisma.t_lieu.update({
            where: { Id_Lieu: oldLieu.Id_Lieu },
            data: { Id_Actionneur: null },
          })

          await prisma.t_lieu.update({
            where: { Id_Lieu: newLieuId },
            data: { Id_Actionneur: id },
          })
        } else if (!oldLieu) {
          await prisma.t_lieu.update({
            where: { Id_Lieu: newLieuId },
            data: { Id_Actionneur: id },
          })
        }
      } else {
        await prisma.t_lieu.updateMany({
          where: { Id_Actionneur: id },
          data: { Id_Actionneur: null },
        })
      }

      const lieu = await prisma.t_lieu.findFirst({
        where: { Id_Actionneur: id },
        select: { Id_Lieu: true },
      })

      return apiOk({
        ...updated,
        Id_Lieu: lieu?.Id_Lieu || null,
      })
    } catch (error) {
      console.error("Actionneur update error:", error)
      return apiError(500, "actionneur_update_failed", "Erreur lors de la mise à jour de l'actionneur")
    }
  },
)

export const DELETE = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const user = getAuthenticatedUser(req)
      if (!user) {
        return apiError(401, "unauthenticated", "Non authentifié")
      }

      const { id: idParam } = await params
      const id = parseInt(idParam, 10)

      if (!id) {
        return apiError(400, "invalid_id", "ID actionneur invalide")
      }

      const actionneur = await prisma.t_actionneur.findUnique({
        where: { Id_Actionneur: id },
      })

      if (!actionneur) {
        return apiError(404, "not_found", "Actionneur non trouvé")
      }

      await prisma.t_lieu.updateMany({
        where: { Id_Actionneur: id },
        data: { Id_Actionneur: null },
      })

      const updated = await prisma.t_actionneur.update({
        where: { Id_Actionneur: id },
        data: { Est_Archive: true },
      })

      return apiOk({ Id_Actionneur: updated.Id_Actionneur, Est_Archive: updated.Est_Archive })
    } catch (error) {
      console.error("Actionneur archive error:", error)
      return apiError(500, "actionneur_archive_failed", "Erreur lors de l'archivage de l'actionneur")
    }
  },
)
