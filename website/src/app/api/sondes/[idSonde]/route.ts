import { NextRequest } from "next/server"
import { z } from "zod"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

const updateSensorSchema = z.object({
  moduleId: z.number().int().positive().nullable().optional(),
  sondeOffset: z.number().nullable().optional(),
})

export const PATCH = withAuthLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ idSonde: string }> }) => {
    try {
      const body = await req.json()
      const data = updateSensorSchema.parse(body)

      const resolvedParams = await params
      const id = parseInt(resolvedParams.idSonde, 10)

      if (Number.isNaN(id)) {
        return apiError(400, "invalid_id", "ID sonde invalide")
      }

      const existing = await prisma.t_sonde.findUnique({ where: { Id_Sonde: id } })
      if (!existing) {
        return apiError(404, "not_found", "Sonde introuvable")
      }

      const nextModuleId = data.moduleId === undefined ? existing.Id_Module : data.moduleId

      let nextPortSerie = existing.Port_Serie
      if (data.moduleId !== undefined) {
        if (nextModuleId === null) {
          nextPortSerie = null
        } else {
          const module = await prisma.t_module.findUnique({
            where: { Id_Module: nextModuleId },
            select: { Port_Serie: true },
          })

          if (!module) {
            return apiError(400, "invalid_module", "Module introuvable")
          }

          nextPortSerie = module.Port_Serie ?? null
        }
      }

      const updated = await prisma.t_sonde.update({
        where: { Id_Sonde: id },
        data: {
          Id_Module: nextModuleId,
          Port_Serie: nextPortSerie,
          Sonde_Offset: data.sondeOffset === undefined ? existing.Sonde_Offset : data.sondeOffset ?? 0,
        },
      })

      return apiOk({
        Id_Sonde: updated.Id_Sonde,
        Id_Module: updated.Id_Module,
        Port_Serie: updated.Port_Serie,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }

      console.error("Sonde update error:", error)
      return apiError(500, "internal_error", "Erreur lors de la mise a jour de la sonde")
    }
  },
)
