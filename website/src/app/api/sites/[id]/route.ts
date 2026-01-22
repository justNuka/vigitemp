import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"

const updateSiteSchema = z.object({
  Libelle_Site: z.string().min(1, "Libellé site requis").max(50).optional(),
  Commentaire: z.string().max(200).nullable().optional(),
  Est_Archive: z.boolean().optional(),
})

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifié")

    try {
      const { id: idParam } = await params
      const id = parseInt(idParam)

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
          return apiError(409, "has_dependencies", "Impossible d'archiver un site avec des lieux associés", {
            linkedLieuxCount,
          })
        }
      }

      const site = await prisma.t_site.update({
        where: { Id_Site: id },
        data: validated,
      })

      return apiOk(site)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      console.error("[PATCH /api/sites/[id]]", error)
      return apiError(500, "site_update_failed", "Erreur lors de la modification du site")
    }
  },
)
