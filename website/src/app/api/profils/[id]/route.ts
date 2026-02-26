import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import {
  isAdminDomainCode,
  isMetrologieDomainCode,
  isSurveillanceDomainCode,
  isVigiLogDomainCode,
} from "@/lib/authorization-domain"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom du profil est requis").optional(),
  description: z.string().optional(),
  mc2: z.boolean().optional(),
  authorizations: z.array(z.number()).optional(),
})

export const GET = withAuthorizationLogging(
  "GERER_PROFIL",
  async (_req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const profileId = parseInt(id, 10)

      if (Number.isNaN(profileId)) {
        return apiError(400, "invalid_id", "ID de profil invalide")
      }

      const profile = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
        include: {
          t_liaison_profil_autorisation: { include: { t_autorisation: true } },
        },
      })

      if (!profile) {
        return apiError(404, "not_found", "Profil non trouvé")
      }

      const users = await prisma.t_utilisateur.findMany({
        where: { Profil_Utilisateur: profile.Profil_Utilisateur },
        select: { Id_Utilisateur: true, Login: true, Nom: true, Prenom: true },
      })

      return apiOk({
        id: profile.Id_Profil,
        name: profile.Profil_Utilisateur,
        description: profile.Commentaire,
        mc2: profile.Est_MC2,
        userCount: users.length,
        users: users.map((u) => ({
          id: u.Id_Utilisateur,
          username: u.Login,
          displayName: `${u.Prenom || ""} ${u.Nom || ""}`.trim() || u.Login,
        })),
        authorizations: profile.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.Id_Autorisation,
          code: liaison.t_autorisation.Code_Autorisation,
          label: liaison.t_autorisation.Libelle_Autorisation,
          description: liaison.t_autorisation.Commentaire,
          fenAdmin: isAdminDomainCode(liaison.t_autorisation.Code_Autorisation),
          fenMetrologie: isMetrologieDomainCode(liaison.t_autorisation.Code_Autorisation),
          fenSurveillance: isSurveillanceDomainCode(liaison.t_autorisation.Code_Autorisation),
          fenVigiLog: isVigiLogDomainCode(liaison.t_autorisation.Code_Autorisation),
        })),
      })
    } catch (error) {
      console.error("Get profile error:", error)
      return apiError(500, "profile_fetch_failed", "Echec de récupération du profil")
    }
  },
)

export const PATCH = withAuthorizationLogging(
  "GERER_PROFIL",
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const profileId = parseInt(id, 10)
      if (Number.isNaN(profileId)) {
        return apiError(400, "invalid_id", "ID de profil invalide")
      }

      const body = await req.json()
      const data = updateProfileSchema.parse(body)

      const existing = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
      })
      if (!existing) {
        return apiError(404, "not_found", "Profil non trouvé")
      }

      const updateData: any = {}
      if (data.name !== undefined) updateData.Profil_Utilisateur = data.name
      if (data.description !== undefined) updateData.Commentaire = data.description
      if (data.mc2 !== undefined) updateData.Est_MC2 = data.mc2

      if (Object.keys(updateData).length > 0) {
        await prisma.t_profil.update({
          where: { Id_Profil: profileId },
          data: updateData,
        })
      }

      if (data.authorizations !== undefined) {
        await prisma.t_liaison_profil_autorisation.deleteMany({
          where: { Id_Profil: profileId },
        })

        if (data.authorizations.length > 0) {
          await prisma.t_liaison_profil_autorisation.createMany({
            data: data.authorizations.map((authId) => ({
              Id_Profil: profileId,
              Id_Autorisation: authId,
            })),
          })
        }
      }

      const updatedProfile = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
        include: {
          t_liaison_profil_autorisation: { include: { t_autorisation: true } },
        },
      })

      const changes: any = {}
      if (data.name) changes.name = data.name
      if (data.description !== undefined) changes.description = data.description
      if (data.mc2 !== undefined) changes.mc2 = data.mc2
      if (data.authorizations !== undefined) {
        changes.authorizationCount = data.authorizations.length
      }

      log.data.update("Profil", profileId, ctx.user.username, ctx.user.userId, ip, changes)

      return apiOk({
        id: updatedProfile!.Id_Profil,
        name: updatedProfile!.Profil_Utilisateur,
        description: updatedProfile!.Commentaire,
        mc2: updatedProfile!.Est_MC2,
        authorizations: updatedProfile!.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.Id_Autorisation,
          code: liaison.t_autorisation.Code_Autorisation,
          label: liaison.t_autorisation.Libelle_Autorisation,
        })),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }

      console.error("Update profile error:", error)
      return apiError(500, "profile_update_failed", "Echec de mise à jour du profil")
    }
  },
)

export const DELETE = withAuthorizationLogging(
  "GERER_PROFIL",
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const profileId = parseInt(id, 10)
      if (Number.isNaN(profileId)) {
        return apiError(400, "invalid_id", "ID de profil invalide")
      }

      const profile = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
        select: { Profil_Utilisateur: true },
      })
      if (!profile) {
        return apiError(404, "not_found", "Profil non trouvé")
      }

      const usersCount = await prisma.t_utilisateur.count({
        where: { Profil_Utilisateur: profile.Profil_Utilisateur },
      })
      if (usersCount > 0) {
        return apiError(409, "has_dependencies", "Impossible d'archiver un profil utilis? par des utilisateurs", {
          linkedUsersCount: usersCount,
        })
      }

      await prisma.t_liaison_profil_autorisation.deleteMany({
        where: { Id_Profil: profileId },
      })
      await prisma.t_profil.delete({ where: { Id_Profil: profileId } })

      log.data.delete(
        "Profil",
        profileId,
        ctx.user.username,
        ctx.user.userId,
        ip,
        `Suppression du profil ${profile.Profil_Utilisateur}`,
      )

      return apiOk({ success: true })
    } catch (error) {
      console.error("Delete profile error:", error)
      return apiError(500, "profile_delete_failed", "Echec de suppression du profil")
    }
  },
)
