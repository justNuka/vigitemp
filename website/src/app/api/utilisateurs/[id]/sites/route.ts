import { NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"

/**
 * GET /api/utilisateurs/[id]/sites - Get all sites assigned to user
 * POST /api/utilisateurs/[id]/sites - Add site to user
 * DELETE /api/utilisateurs/[id]/sites/[siteId] - Remove site from user
 */

export const GET = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)
      const { id } = await params
      const userId = parseInt(id)

      if (isNaN(userId)) {
        return apiError(400, "invalid_id", "Invalid user ID")
      }

      const sites = await prisma.t_liaison_utilisateur_site.findMany({
        where: { Id_Utilisateur: userId },
        select: {
          Id_Site: true,
          Date_Affectation: true,
          t_site: {
            select: {
              Id_Site: true,
              Libelle_Site: true,
              Est_Archive: true,
            },
          },
        },
        orderBy: { Date_Affectation: "desc" },
      })

      const formattedSites = sites.map((liaison) => ({
        Id_Site: liaison.t_site?.Id_Site,
        Libelle_Site: liaison.t_site?.Libelle_Site,
        Est_Archive: liaison.t_site?.Est_Archive,
        Date_Affectation: liaison.Date_Affectation,
      }))

      return apiOk(formattedSites)
    } catch (error) {
      log.error("utilisateurs/sites", "get_user_sites_error", { error: error });
      return apiError(500, "user_sites_fetch_failed", "Failed to fetch user sites")
    }
  },
)

export const POST = withAdminLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)
      const { id } = await params
      const userId = parseInt(id)
      const body = await req.json()
      const id_Site = body?.Id_Site ?? body?.id_Site ?? body?.siteId

      if (isNaN(userId) || !id_Site) {
        return apiError(400, "invalid_input", "Invalid user ID or site ID")
      }

      const site = await prisma.t_site.findUnique({
        where: { Id_Site: id_Site },
      })

      if (!site) {
        return apiError(404, "not_found", "Site not found")
      }

      const user = await prisma.t_utilisateur.findUnique({
        where: { Id_Utilisateur: userId },
      })

      if (!user) {
        return apiError(404, "not_found", "User not found")
      }

      const existingLiaison = await prisma.t_liaison_utilisateur_site.findUnique({
        where: {
          Id_Utilisateur_Id_Site: {
            Id_Utilisateur: userId,
            Id_Site: id_Site,
          },
        },
      })

      if (existingLiaison) {
        return apiError(409, "conflict", "User is already assigned to this site")
      }

      const liaison = await prisma.t_liaison_utilisateur_site.create({
        data: {
          Id_Utilisateur: userId,
          Id_Site: id_Site,
        },
        select: {
          Id_Site: true,
          Date_Affectation: true,
          t_site: {
            select: {
              Id_Site: true,
              Libelle_Site: true,
            },
          },
        },
      })

      log.data.update("Utilisateur", userId, ctx.user.username, ctx.user.userId, ip, {
        action: "assign_site",
        siteId: id_Site,
        siteLabel: liaison.t_site?.Libelle_Site,
      })

      revalidateTag("users-data", "default")

      return apiOk({
        message: "Site assigned to user successfully",
        site: {
          id_Site: liaison.t_site?.Id_Site,
          libelle_Site: liaison.t_site?.Libelle_Site,
          assignedAt: liaison.Date_Affectation,
        },
      })
    } catch (error) {
      log.error("utilisateurs/sites", "add_site_to_user_error", { error: error });
      return apiError(500, "user_site_assign_failed", "Failed to assign site to user")
    }
  },
)
