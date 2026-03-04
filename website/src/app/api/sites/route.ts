import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { log } from "@/lib/logger"
import { apiError, apiOk } from "@/lib/api-response"

const createSiteSchema = z.object({
  Code_Site: z.string().min(1, "Code site requis").max(20),
  Libelle_Site: z.string().min(1, "Libellé site requis").max(50),
  Commentaire: z.string().max(200).nullable().optional(),
})

/**
 * GET /api/sites
 * Récupère tous les sites (format complet pour la table admin, simplifié pour les selects)
 */
export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") // "admin" ou "simple" (default)

    const sites = await prisma.t_site.findMany({
      where: { Est_Archive: false },
      orderBy: { Libelle_Site: "asc" },
    })

    if (format === "admin") {
      return apiOk(sites)
    }

    const formattedSites = sites.map((site) => ({
      id: site.Id_Site,
      name:
        site.Code_Site && site.Libelle_Site
          ? `${site.Code_Site} - ${site.Libelle_Site}`
          : site.Code_Site || site.Libelle_Site || "Sans nom",
    }))

    return apiOk(formattedSites)
  } catch (error) {
    log.error("sites", "get_api_sites", { error: error });
    return apiError(500, "sites_fetch_failed", "Erreur lors de la récupération des sites")
  }
})

/**
 * POST /api/sites
 * Crée un nouveau site
 */
export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const body = await req.json()
    const validated = createSiteSchema.parse(body)

    const site = await prisma.t_site.create({
      data: {
        Code_Site: validated.Code_Site,
        Libelle_Site: validated.Libelle_Site,
        Commentaire: validated.Commentaire || null,
        Est_Archive: false,
      },
    })

    log.data.create("Site", site.Id_Site, user.username, user.userId, getClientIp(req), {
      code: site.Code_Site,
      libelle: site.Libelle_Site,
    })

    return apiOk(site, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
    }
    log.error("sites", "post_api_sites", { error: error });
    return apiError(500, "site_create_failed", "Erreur lors de la création du site")
  }
})
