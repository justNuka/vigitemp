import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
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
  assignedUserIds: z.array(z.number()).optional(),
  estArchive: z.boolean().optional(),
})

export const GET = withAuthorizationLogging(
  "GERER_PROFIL",
  async (_req: NextRequest, _ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const profileId = parseInt(id, 10)

      if (Number.isNaN(profileId)) {
        return apiError(400, "invalid_id", "ID de profil invalide")
      }

      const profile = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
        select: {
          Id_Profil: true,
          Profil_Utilisateur: true,
          Commentaire: true,
          Est_MC2: true,
          t_liaison_profil_autorisation: {
            select: {
              t_autorisation: true,
            },
          },
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
        estArchive: false,
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
      log.error("profils", "get_profile_error", { error: error });
      return apiError(500, "profile_fetch_failed", "Echec de récupération du profil")
    }
  },
)

export const PATCH = withAuthorizationLogging(
  "GERER_PROFIL",
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
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
        select: {
          Profil_Utilisateur: true,
          Commentaire: true,
          Est_MC2: true,
          t_liaison_profil_autorisation: {
            select: {
              Id_Autorisation: true,
            },
          },
        },
      })
      if (!existing) {
        return apiError(404, "not_found", "Profil non trouvé")
      }

      const updateData: Record<string, unknown> = {}
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

      const targetProfileName = data.name ?? existing.Profil_Utilisateur
      if (data.assignedUserIds !== undefined) {
        await prisma.t_utilisateur.updateMany({
          where: { Profil_Utilisateur: existing.Profil_Utilisateur },
          data: { Profil_Utilisateur: null },
        })

        if (data.assignedUserIds.length > 0) {
          await prisma.t_utilisateur.updateMany({
            where: { Id_Utilisateur: { in: data.assignedUserIds } },
            data: { Profil_Utilisateur: targetProfileName },
          })
        }
      } else if (data.name !== undefined && data.name !== existing.Profil_Utilisateur) {
        await prisma.t_utilisateur.updateMany({
          where: { Profil_Utilisateur: existing.Profil_Utilisateur },
          data: { Profil_Utilisateur: targetProfileName },
        })
      }

      const updatedProfile = await prisma.t_profil.findUnique({
        where: { Id_Profil: profileId },
        select: {
          Id_Profil: true,
          Profil_Utilisateur: true,
          Commentaire: true,
          Est_MC2: true,
          t_liaison_profil_autorisation: {
            select: {
              Id_Autorisation: true,
              t_autorisation: {
                select: {
                  Id_Autorisation: true,
                  Code_Autorisation: true,
                  Libelle_Autorisation: true,
                },
              },
            },
          },
        },
      })

      const usersBeforeUpdate = data.assignedUserIds !== undefined
        ? await prisma.t_utilisateur.findMany({
            where: { Profil_Utilisateur: existing.Profil_Utilisateur },
            select: { Id_Utilisateur: true },
          })
        : []
      const usersAfterUpdate = await prisma.t_utilisateur.findMany({
        where: { Profil_Utilisateur: updatedProfile!.Profil_Utilisateur },
        select: { Id_Utilisateur: true },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Profil",
        resourceId: profileId,
        before: {
          Profil_Utilisateur: existing.Profil_Utilisateur,
          Commentaire: existing.Commentaire,
          Est_MC2: existing.Est_MC2,
          authorizations: existing.t_liaison_profil_autorisation?.map?.((item: any) => item.Id_Autorisation) ?? undefined,
          assignedUserIds: data.assignedUserIds !== undefined ? usersBeforeUpdate.map((user) => user.Id_Utilisateur) : undefined,
        },
        after: {
          Profil_Utilisateur: updatedProfile!.Profil_Utilisateur,
          Commentaire: updatedProfile!.Commentaire,
          Est_MC2: updatedProfile!.Est_MC2,
          authorizations: updatedProfile!.t_liaison_profil_autorisation.map((item) => item.Id_Autorisation),
          assignedUserIds: data.assignedUserIds !== undefined ? usersAfterUpdate.map((user) => user.Id_Utilisateur) : undefined,
        },
      })

      return apiOk({
        id: updatedProfile!.Id_Profil,
        name: updatedProfile!.Profil_Utilisateur,
        description: updatedProfile!.Commentaire,
        mc2: updatedProfile!.Est_MC2,
        estArchive: false,
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

      log.error("profils", "update_profile_error", { error: error });
      return apiError(500, "profile_update_failed", "Echec de mise à jour du profil")
    }
  },
)

export const DELETE = withAuthorizationLogging(
  "GERER_PROFIL",
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
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

      try {
        await prisma.t_profil.update({
          where: { Id_Profil: profileId },
          data: { Est_Archive: true },
        })
      } catch (archiveError: unknown) {
        const maybePrismaError = archiveError as { code?: string }
        if (maybePrismaError?.code === "P2022") {
          return apiError(
            409,
            "archive_unsupported",
            "Archivage indisponible: la colonne Est_Archive est absente de la table t_profil."
          )
        }
        throw archiveError
      }

      auditRouteDelete(req, ctx.user, {
        resource: "Profil",
        resourceId: profileId,
        reason: `Archivage du profil ${profile.Profil_Utilisateur}`,
        data: { Profil_Utilisateur: profile.Profil_Utilisateur, Est_Archive: true },
      })

      return apiOk({ success: true })
    } catch (error) {
      log.error("profils", "delete_profile_error", { error: error });
      return apiError(500, "profile_delete_failed", "Echec de suppression du profil")
    }
  },
)
