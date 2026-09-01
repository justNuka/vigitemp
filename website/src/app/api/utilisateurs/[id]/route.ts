import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { revalidateTag } from "next/cache"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { getUserAvatarValue, setUserAvatarValue } from "@/lib/user-avatar-db"

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.union([z.literal(""), z.string().email()]).optional().transform((value) => value || undefined),
  telephone: z.string().optional(),
  password: z.string().min(6).optional(),
  profileId: z.string().optional(),
  expiryDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  reactivate: z.boolean().optional(),
  avatar: z.string().trim().max(512).nullable().optional(),
})

export const GET = withAdminLogging(
  async (req: NextRequest, _ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      const user = await prisma.t_utilisateur.findUnique({
        where: { Id_Utilisateur: userId },
      })

      if (!user) {
        return apiError(404, "not_found", "User not found")
      }

      const avatarValue = await getUserAvatarValue(user.Id_Utilisateur)

      return apiOk({
        id: user.Id_Utilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.Profil_Utilisateur || "user",
        status: !user.Est_Archive ? "active" : "inactive",
        avatar: avatarValue,
      })
    } catch (error) {
      log.error("utilisateurs", "get_utilisateur_error", { error: error });
      return apiError(500, "user_fetch_failed", "Failed to fetch user")
    }
  },
)

export const PATCH = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const userId = parseInt(id)
      const body = await req.json()
      const data = updateUserSchema.parse(body)

      const existingUser = await prisma.t_utilisateur.findUnique({ where: { Id_Utilisateur: userId } })
      if (!existingUser) {
        return apiError(404, "not_found", "User not found")
      }

      const existingAvatar = await getUserAvatarValue(userId)

      const updateData: Record<string, unknown> = {}

      if (data.username && data.username !== existingUser.Login) {
        const duplicateUser = await prisma.t_utilisateur.findFirst({
          where: {
            Login: data.username,
            Id_Utilisateur: { not: userId },
          },
          select: { Id_Utilisateur: true },
        })
        if (duplicateUser) {
          return apiError(409, "username_conflict", "Un utilisateur avec ce login existe deja")
        }
        updateData.Login = data.username
      }

      if (data.password) {
        updateData.Mot_De_Passe = await bcrypt.hash(data.password, 10)
        updateData.Date_Derniere_Modification_MDP = new Date()
        updateData.Est_Mot_De_Passe_Temporaire = true
      }

      if (data.profileId) updateData.Profil_Utilisateur = data.profileId
      if (data.nom) updateData.Nom = data.nom
      if (data.prenom) updateData.Prenom = data.prenom
      if (data.email !== undefined) updateData.Adresse_Email = data.email || null
      if (data.telephone !== undefined) updateData.Tel_Num_Mobile = data.telephone || null
      if (data.expiryDate !== undefined) updateData.Date_Validite = data.expiryDate
      if (data.reactivate) updateData.Est_Archive = false

      const user = await prisma.t_utilisateur.update({
        where: { Id_Utilisateur: userId },
        data: updateData,
      })

      if (data.avatar !== undefined) {
        const avatarSaved = await setUserAvatarValue(userId, data.avatar || null)
        if (!avatarSaved) {
          return apiError(500, "avatar_update_unavailable", "Impossible d'enregistrer l'avatar")
        }
      }

      if (data.password) {
        log.modifications.changeUserPassword(user.Login ?? String(userId), userId, ctx.user.username, ctx.user.userId, ip)
      }

      if (data.reactivate) {
        log.audit("ACTU", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          userProfile: ctx.user.profile,
          ip,
          resource: `Utilisateur: ${user.Login}`,
          resourceId: userId,
        })
      }

      auditRouteUpdate(req, ctx.user, {
        resource: "Utilisateur",
        resourceId: userId,
        before: {
          Login: existingUser.Login,
          Nom: existingUser.Nom,
          Prenom: existingUser.Prenom,
          Adresse_Email: existingUser.Adresse_Email,
          Tel_Num_Mobile: existingUser.Tel_Num_Mobile,
          Profil_Utilisateur: existingUser.Profil_Utilisateur,
          Date_Validite: existingUser.Date_Validite,
          Est_Archive: existingUser.Est_Archive,
          Avatar: existingAvatar,
        },
        after: {
          Login: user.Login,
          Nom: user.Nom,
          Prenom: user.Prenom,
          Adresse_Email: user.Adresse_Email,
          Tel_Num_Mobile: user.Tel_Num_Mobile,
          Profil_Utilisateur: user.Profil_Utilisateur,
          Date_Validite: user.Date_Validite,
          Est_Archive: user.Est_Archive,
          Avatar: data.avatar !== undefined ? data.avatar || null : existingAvatar,
        },
        trackedFields: ["Login", "Nom", "Prenom", "Adresse_Email", "Tel_Num_Mobile", "Profil_Utilisateur", "Date_Validite", "Est_Archive", "Avatar"],
        reason: `Modification utilisateur ${existingUser.Login}`,
      })

      revalidateTag("users-data", "default")

      const avatarValue = await getUserAvatarValue(user.Id_Utilisateur)

      return apiOk({
        id: user.Id_Utilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.Profil_Utilisateur || "user",
        avatar: avatarValue,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input")
      }

      log.error("utilisateurs", "update_user_error", { error: error });
      return apiError(500, "user_update_failed", "Failed to update user")
    }
  },
)

export const DELETE = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const userId = parseInt(id)

      const userToDelete = await prisma.t_utilisateur.findUnique({
        where: { Id_Utilisateur: userId },
        select: { Login: true },
      })

      await prisma.t_utilisateur.update({
        where: { Id_Utilisateur: userId },
        data: { Est_Archive: true },
      })

      auditRouteDelete(req, ctx.user, {
        resource: "Utilisateur",
        resourceId: userId,
        reason: `Archive de l'utilisateur ${userToDelete?.Login || userId}`,
        data: { Login: userToDelete?.Login || userId },
      })

      revalidateTag("users-data", "default")

      return apiOk({ success: true })
    } catch (error) {
      log.error("utilisateurs", "delete_user_error", { error: error });
      return apiError(500, "user_delete_failed", "Failed to delete user")
    }
  },
)

