import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAdminLogging } from "@/lib/api-wrappers"
import { revalidateTag } from "next/cache"
import { apiError, apiOk } from "@/lib/api-response"

const updateUserSchema = z.object({
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  password: z.string().min(6).optional(),
  profileId: z.string().optional(),
  expiryDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  reactivate: z.boolean().optional(),
})

export const GET = withAdminLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      const user = await prisma.t_utilisateur.findUnique({
        where: { Id_Utilisateur: userId },
      })

      if (!user) {
        return apiError(404, "not_found", "User not found")
      }

      return apiOk({
        id: user.Id_Utilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.Profil_Utilisateur || "user",
        status: !user.Est_Archive ? "active" : "inactive",
      })
    } catch (error) {
      console.error("Get utilisateur error:", error)
      return apiError(500, "user_fetch_failed", "Failed to fetch user")
    }
  },
)

export const PATCH = withAdminLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const userId = parseInt(id)
      const body = await req.json()
      const data = updateUserSchema.parse(body)

      const updateData: any = {}

      if (data.password) {
        updateData.Mot_De_Passe = await bcrypt.hash(data.password, 10)
        updateData.Date_Derniere_Modification_MDP = new Date()
        updateData.Est_Mot_De_Passe_Temporaire = false
      }

      if (data.profileId) updateData.Profil_Utilisateur = data.profileId
      if (data.nom) updateData.Nom = data.nom
      if (data.prenom) updateData.Prenom = data.prenom
      if (data.email) updateData.Adresse_Email = data.email
      if (data.telephone !== undefined) updateData.Tel_Num_Mobile = data.telephone || null
      if (data.expiryDate !== undefined) updateData.Date_Validite = data.expiryDate
      if (data.reactivate) updateData.Est_Archive = false

      const user = await prisma.t_utilisateur.update({
        where: { Id_Utilisateur: userId },
        data: updateData,
      })

      const changes: any = {}
      if (data.nom) changes.nom = data.nom
      if (data.prenom) changes.prenom = data.prenom
      if (data.email) changes.email = data.email
      if (data.profileId) changes.profile = data.profileId
      if (data.password) changes.passwordChanged = true
      if (data.reactivate) changes.reactivated = true

      log.data.update("Utilisateur", userId, ctx.user.username, ctx.user.userId, ip, changes)

      revalidateTag("users-data", "default")

      return apiOk({
        id: user.Id_Utilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.Profil_Utilisateur || "user",
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input")
      }

      console.error("Update user error:", error)
      return apiError(500, "user_update_failed", "Failed to update user")
    }
  },
)

export const DELETE = withAdminLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
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

      log.data.delete(
        "Utilisateur",
        userId,
        ctx.user.username,
        ctx.user.userId,
        ip,
        `Archive de l'utilisateur ${userToDelete?.Login || userId}`,
      )

      revalidateTag("users-data", "default")

      return apiOk({ success: true })
    } catch (error) {
      console.error("Delete user error:", error)
      return apiError(500, "user_delete_failed", "Failed to delete user")
    }
  },
)
