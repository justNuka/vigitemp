import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const SITE_ACCESS_CODES = ["PARAMETRES_GERER"] as const

const createSiteSchema = z.object({
  Libelle_Site: z.string().min(1, "Libelle site requis").max(50),
  Commentaire: z.string().max(200).nullable().optional(),
})

/**
 * GET /api/sites
 * Recupere tous les sites (format complet pour la table admin, simplifie pour les selects)
 */
export const GET = withOneOrHigherAnyAuthorizationLogging(SITE_ACCESS_CODES, async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format")

    const sites = await prisma.t_site.findMany({
      where: { Est_Archive: false },
      orderBy: { Libelle_Site: "asc" },
    })

    if (format === "admin") {
      return apiOk(sites)
    }

    const formattedSites = sites.map((site) => ({
      id: site.Id_Site,
      name: site.Libelle_Site || "Sans nom",
    }))

    return apiOk(formattedSites)
  } catch (error) {
    log.error("sites", "sites_fetch_error", { error })
    return apiError(500, "sites_fetch_failed", "Erreur lors de la recuperation des sites")
  }
})

/**
 * POST /api/sites
 * Cree un nouveau site.
 */
export const POST = withOneOrHigherAnyAuthorizationLogging(
  SITE_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const body = await req.json()
      const validated = createSiteSchema.parse(body)

      const site = await prisma.t_site.create({
        data: {
          Libelle_Site: validated.Libelle_Site,
          Commentaire: validated.Commentaire || null,
          Est_Archive: false,
        },
      })

      log.data.create("Site", site.Id_Site, ctx.user.username, ctx.user.userId, getClientIp(req), {
        libelle: site.Libelle_Site,
      })

      auditRouteCreate(req, ctx.user, {
        resource: "Site",
        resourceId: site.Id_Site,
        data: {
          Libelle_Site: site.Libelle_Site,
          Commentaire: site.Commentaire,
          Est_Archive: site.Est_Archive,
        },
        reason: `Creation site ${site.Libelle_Site}`,
      })

      return apiOk(site, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      log.error("sites", "site_create_error", { error })
      return apiError(500, "site_create_failed", "Erreur lors de la creation du site")
    }
  },
)
