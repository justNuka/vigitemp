import { NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"

/**
 * DELETE /api/utilisateurs/[id]/sites/[siteId] - Remove site from user
 */

export const DELETE = withAdminLogging(
  async (
    req: NextRequest,
    ctx: any,
    { params }: { params: Promise<{ id: string; siteId: string }> },
  ) => {
    try {
      const { ip } = getRequestContext(req)
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

      log.data.update("Utilisateur", userId, ctx.user.username, ctx.user.userId, ip, {
        action: "remove_site",
        siteId: id_Site,
      })

      revalidateTag("users-data", "default")

      return apiOk({
        message: "Site removed from user successfully",
      })
    } catch (error) {
      log.error("utilisateurs/sites", "remove_site_from_user_error", { error: error });
      return apiError(500, "user_site_remove_failed", "Failed to remove site from user")
    }
  },
)
