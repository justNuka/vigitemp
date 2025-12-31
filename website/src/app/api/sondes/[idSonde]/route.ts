import { NextRequest } from "next/server"
import { z } from "zod"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const updateProbeSchema = z.object({
  moduleId: z.number().int().positive().nullable().optional(),
})

export const PATCH = withAuthLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ idSonde: string }> }) => {
    try {
      const body = await req.json()
      const data = updateProbeSchema.parse(body)

      const resolvedParams = await params
      const id = parseInt(resolvedParams.idSonde, 10)

      if (Number.isNaN(id)) {
        return apiError(400, "invalid_id", "ID sonde invalide")
      }

      const existing = await prisma.t_sonde.findUnique({ where: { Id_Sonde: id } })
      if (!existing) {
        return apiError(404, "not_found", "Sonde introuvable")
      }

      const updated = await prisma.t_sonde.update({
        where: { Id_Sonde: id },
        data: {
          Id_Module: data.moduleId === undefined ? existing.Id_Module : data.moduleId,
        },
      })

      return apiOk({ Id_Sonde: updated.Id_Sonde, Id_Module: updated.Id_Module })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }

      console.error("Sonde update error:", error)
      return apiError(500, "internal_error", "Erreur lors de la mise à jour de la sonde")
    }
  },
)
