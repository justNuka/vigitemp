import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * DELETE /api/utilisateurs/[id]/sites/[siteId] - Remove site from user
 */

export const DELETE = withAdminLogging(
  async (
    req: NextRequest,
    _ctx: any,
    { params }: { params: Promise<{ id: string; siteId: string }> },
  ) => {
    try {
      const { id, siteId } = await params
      const userId = parseInt(id)
      const id_Site = parseInt(siteId)

      if (isNaN(userId) || isNaN(id_Site)) {
        return apiError(400, "invalid_id", "Invalid user ID or site ID")
      }

      const liaison = await prisma.t_liaison_utilisateur_site.findFirst({
        where: {
          Id_Utilisateur: userId,
          Id_Site: id_Site,
        },
      })

      if (!liaison) {
        return apiError(404, "not_found", "User is not assigned to this site")
      }

      await prisma.t_liaison_utilisateur_site.delete({
        where: { Id_Liaison: liaison.Id_Liaison },
      })

      return apiOk({
        message: "Site removed from user successfully",
      })
    } catch (error) {
      console.error("Remove site from user error:", error)
      return apiError(500, "user_site_remove_failed", "Failed to remove site from user")
    }
  },
)

