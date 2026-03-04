import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

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
        return apiError(400, "invalid_id", "ID groupe invalide")
      }

      const body = await req.json()
      const { nom, regroupement } = body

      const groupe = await prisma.t_groupe.findUnique({
        where: { Id_Groupe: id },
      })

      if (!groupe) {
        return apiError(404, "not_found", "Groupe non trouvé")
      }

      const updated = await prisma.t_groupe.update({
        where: { Id_Groupe: id },
        data: {
          Nom_Groupe: nom || groupe.Nom_Groupe,
          Numero_Regroupement: regroupement || groupe.Numero_Regroupement,
        },
      })

      log.data.update("Groupe", id, user.username, user.userId, getClientIp(req), {
        nom: nom || groupe.Nom_Groupe,
        regroupement: regroupement || groupe.Numero_Regroupement,
      })

      const nombre_lieux = await prisma.t_lieu.count({
        where: {
          Est_Archive: false,
          t_lieu_groupe: { some: { Id_Groupe: id } },
        },
      })

      return apiOk({
        Id_Groupe: updated.Id_Groupe,
        Nom_Groupe: updated.Nom_Groupe,
        Numero_Regroupement: updated.Numero_Regroupement,
        Est_Archive: updated.Est_Archive,
        nombre_lieux,
      })
    } catch (error) {
      log.error("groupes", "groupe_update_error", { error: error });
      return apiError(500, "groupe_update_failed", "Erreur lors de la mise à jour du groupe")
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
        return apiError(400, "invalid_id", "ID groupe invalide")
      }

      const groupe = await prisma.t_groupe.findUnique({ where: { Id_Groupe: id } })
      if (!groupe) {
        return apiError(404, "not_found", "Groupe non trouvé")
      }

      const linkedLieuxCount = await prisma.t_lieu.count({
        where: {
          Est_Archive: false,
          OR: [
            { Id_Groupe1: id },
            { Id_Groupe2: id },
            { t_lieu_groupe: { some: { Id_Groupe: id } } },
          ],
        },
      })

      const linkedUsersCount = await prisma.t_liaison_utilisateur_groupe.count({
        where: { Id_Groupe: id },
      })

      if (linkedLieuxCount > 0 || linkedUsersCount > 0) {
        return apiError(409, "has_dependencies", "Impossible d'archiver un groupe avec des éléments associés", {
          linkedLieuxCount,
          linkedUsersCount,
        })
      }

      const updated = await prisma.t_groupe.update({
        where: { Id_Groupe: id },
        data: { Est_Archive: true },
      })

      log.data.delete("Groupe", id, user.username, user.userId, getClientIp(req), `Archivage groupe ${updated.Nom_Groupe}`)

      return apiOk({
        Id_Groupe: updated.Id_Groupe,
        Nom_Groupe: updated.Nom_Groupe,
        Numero_Regroupement: updated.Numero_Regroupement,
        Est_Archive: updated.Est_Archive,
      })
    } catch (error) {
      log.error("groupes", "groupe_archive_error", { error: error });
      return apiError(500, "groupe_archive_failed", "Erreur lors de l'archivage du groupe")
    }
  },
)
