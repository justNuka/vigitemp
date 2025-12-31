import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * DELETE /api/utilisateurs/[id]/groupes/[liaisionId] - Remove group from user
 */

export const DELETE = withAdminLogging(
  async (
    req: NextRequest,
    _ctx: any,
    { params }: { params: Promise<{ id: string; groupId: string }> },
  ) => {
    try {
      const { id, groupId } = await params
      const userId = parseInt(id)
      const parsed = parseInt(groupId)

      if (isNaN(userId) || isNaN(parsed)) {
        return apiError(400, "invalid_id", "Invalid user ID or liaison ID")
      }

      const liaison = await prisma.t_liaison_utilisateur_groupe.findUnique({
        where: { Id_Liaison_u_g: parsed },
      })

      if (liaison && liaison.Id_Utilisateur === userId) {
        await prisma.t_liaison_utilisateur_groupe.delete({
          where: { Id_Liaison_u_g: parsed },
        })
      } else {
        const deleted = await prisma.t_liaison_utilisateur_groupe.deleteMany({
          where: { Id_Utilisateur: userId, Id_Groupe: parsed },
        })

        if (deleted.count === 0) {
          return apiError(404, "not_found", "Liaison not found for this user")
        }
      }

      return apiOk({
        message: "Group removed from user successfully",
      })
    } catch (error) {
      console.error("Remove group from user error:", error)
      return apiError(500, "user_group_remove_failed", "Failed to remove group from user")
    }
  },
)

