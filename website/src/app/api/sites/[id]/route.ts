import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteUpdate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const SITE_ACCESS_CODES = ["PARAMETRES_GERER"] as const

const updateSiteSchema = z.object({
  Libelle_Site: z.string().min(1, "Libelle site requis").max(50).optional(),
  Commentaire: z.string().max(200).nullable().optional(),
  Est_Archive: z.boolean().optional(),
})

export const PATCH = withOneOrHigherAnyAuthorizationLogging(
  SITE_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const id = parseInt(idParam, 10)

      if (!id) {
        return apiError(400, "invalid_id", "ID site requis")
      }

      const body = await req.json()
      const validated = updateSiteSchema.parse(body)

      if (validated.Est_Archive) {
        const linkedLieuxCount = await prisma.t_lieu.count({
          where: {
            Id_Site: id,
            Est_Archive: false,
          },
        })

        if (linkedLieuxCount > 0) {
          return apiError(409, "has_dependencies", "Impossible d'archiver un site avec des lieux associes", {
            linkedLieuxCount,
          })
        }
      }

      const existingSite = await prisma.t_site.findUnique({
        where: { Id_Site: id },
      })

      const site = await prisma.t_site.update({
        where: { Id_Site: id },
        data: validated,
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Site",
        resourceId: id,
        before: existingSite as unknown as Record<string, unknown>,
        after: site as unknown as Record<string, unknown>,
        trackedFields: ["Libelle_Site", "Commentaire", "Est_Archive"],
        reason: `Modification site ${existingSite?.Libelle_Site || id}`,
      })

      return apiOk(site)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      log.error("sites", "site_update_error", { error })
      return apiError(500, "site_update_failed", "Erreur lors de la modification du site")
    }
  },
)
