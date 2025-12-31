import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/utilisateurs/[id]/sites - Get all sites assigned to user
 * POST /api/utilisateurs/[id]/sites - Add site to user
 * DELETE /api/utilisateurs/[id]/sites/[siteId] - Remove site from user
 */

export const GET = withAdminLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
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
              Code_Site: true,
              Libelle_Site: true,
              Est_Archive: true,
            },
          },
        },
        orderBy: { Date_Affectation: "desc" },
      })

      const formattedSites = sites.map((liaison) => ({
        Id_Site: liaison.t_site?.Id_Site,
        Code_Site: liaison.t_site?.Code_Site,
        Libelle_Site: liaison.t_site?.Libelle_Site,
        Est_Archive: liaison.t_site?.Est_Archive,
        Date_Affectation: liaison.Date_Affectation,
      }))

      return apiOk(formattedSites)
    } catch (error) {
      console.error("Get user sites error:", error)
      return apiError(500, "user_sites_fetch_failed", "Failed to fetch user sites")
    }
  },
)

export const POST = withAdminLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
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
              Code_Site: true,
              Libelle_Site: true,
            },
          },
        },
      })

      return apiOk({
        message: "Site assigned to user successfully",
        site: {
          id_Site: liaison.t_site?.Id_Site,
          code_Site: liaison.t_site?.Code_Site,
          libelle_Site: liaison.t_site?.Libelle_Site,
          assignedAt: liaison.Date_Affectation,
        },
      })
    } catch (error) {
      console.error("Add site to user error:", error)
      return apiError(500, "user_site_assign_failed", "Failed to assign site to user")
    }
  },
)
