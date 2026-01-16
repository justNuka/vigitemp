import { NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/utilisateurs/[id]/groupes - Get all groups assigned to user
 * POST /api/utilisateurs/[id]/groupes - Add group to user
 * DELETE /api/utilisateurs/[id]/groupes/[groupId] - Remove group from user
 */

export const GET = withAdminLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        return apiError(400, "invalid_id", "Invalid user ID")
      }

      const liaisons = await prisma.t_liaison_utilisateur_groupe.findMany({
        where: { Id_Utilisateur: userId },
        include: {
          t_groupe: true,
        },
      })

      const formattedGroups = liaisons
        .filter((liaison) => liaison.t_groupe)
        .map((liaison) => ({
          Id_Liaison: liaison.Id_Liaison_u_g,
          Id_Groupe: liaison.t_groupe!.Id_Groupe,
          Nom_Groupe: liaison.t_groupe!.Nom_Groupe,
          Numero_Regroupement: liaison.t_groupe!.Numero_Regroupement,
          Est_Archive: liaison.t_groupe!.Est_Archive,
        }))

      return apiOk(formattedGroups)
    } catch (error) {
      console.error("Get user groups error:", error)
      return apiError(500, "user_groups_fetch_failed", "Failed to fetch user groups")
    }
  },
)

export const POST = withAdminLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const userId = parseInt(id)
      const body = await req.json()
      const idGroupe = body?.Id_Groupe ?? body?.idGroupe ?? body?.groupId

      if (isNaN(userId) || !idGroupe) {
        return apiError(400, "invalid_input", "Invalid user ID or group ID")
      }

      const group = await prisma.t_groupe.findUnique({
        where: { Id_Groupe: idGroupe },
      })

      if (!group) {
        return apiError(404, "not_found", "Group not found")
      }

      const user = await prisma.t_utilisateur.findUnique({
        where: { Id_Utilisateur: userId },
      })

      if (!user) {
        return apiError(404, "not_found", "User not found")
      }

      const existingLiaison = await prisma.t_liaison_utilisateur_groupe.findFirst({
        where: {
          Id_Utilisateur: userId,
          Id_Groupe: idGroupe,
        },
      })

      if (existingLiaison) {
        return apiError(409, "conflict", "User is already assigned to this group")
      }

      const liaison = await prisma.t_liaison_utilisateur_groupe.create({
        data: {
          Id_Utilisateur: userId,
          Id_Groupe: idGroupe,
        },
      })

      revalidateTag("users-data", "default")

      return apiOk({
        message: "Group assigned to user successfully",
        group: {
          Id_Liaison: liaison.Id_Liaison_u_g,
          Id_Groupe: group.Id_Groupe,
          Nom_Groupe: group.Nom_Groupe,
          Numero_Regroupement: group.Numero_Regroupement,
        },
      })
    } catch (error) {
      console.error("Add group to user error:", error)
      return apiError(500, "user_group_assign_failed", "Failed to assign group to user")
    }
  },
)
