import { NextRequest } from "next/server"
import { z } from "zod"

import { withAuthLogging } from "@/lib/api-wrappers"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"

const updateSensorSchema = z.object({
  moduleId: z.number().int().positive().nullable().optional(),
  sondeOffset: z.number().nullable().optional(),
})

export const PATCH = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ idSonde: string }> }) => {
    const { ip } = getRequestContext(req)

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

      const nextOffset = data.sondeOffset === undefined ? existing.Sonde_Offset : data.sondeOffset ?? 0
      const offsetChanged = Number(nextOffset ?? 0) !== Number(existing.Sonde_Offset ?? 0)

      let invalidatedEtalonnages = 0
      let invalidatedEtalonnageMeasures = 0

      const updated = await prisma.$transaction(async (tx) => {
        const updatedSensor = await tx.t_sonde.update({
          where: { Id_Sonde: id },
          data: {
            Id_Module: nextModuleId,
            Port_Serie: nextPortSerie,
            Sonde_Offset: nextOffset,
          },
        })

        if (offsetChanged && existing.Sonde_Numero_Serie) {
          await tx.t_lieu.updateMany({
            where: { Sonde_Numero_Serie: existing.Sonde_Numero_Serie },
            data: { Infos_Modifiees_Depuis_Derniere_Mesure: true },
          })

          const etalonnages = await tx.t_etalonnage.findMany({
            where: { Sonde_Numero_Serie: existing.Sonde_Numero_Serie },
            select: { Id_Etalonnage: true },
          })

          const etalonnageIds = etalonnages.map((item) => item.Id_Etalonnage)
          if (etalonnageIds.length > 0) {
            const deletedMeasures = await tx.t_etalonnage_mesure.deleteMany({
              where: { Id_Etalonnage: { in: etalonnageIds } },
            })
            const deletedEtalonnages = await tx.t_etalonnage.deleteMany({
              where: { Id_Etalonnage: { in: etalonnageIds } },
            })

            invalidatedEtalonnageMeasures = deletedMeasures.count
            invalidatedEtalonnages = deletedEtalonnages.count
          }
        }

        return updatedSensor
      })

      log.info("SENSOR_UPDATE", "Sensor updated", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        sensorId: id,
        serial: existing.Sonde_Numero_Serie,
        moduleIdBefore: existing.Id_Module,
        moduleIdAfter: updated.Id_Module,
        offsetBefore: existing.Sonde_Offset,
        offsetAfter: updated.Sonde_Offset,
        offsetChanged,
        invalidatedEtalonnages,
      })

      log.audit("CC", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: "Sonde (Modification)",
        resourceId: updated.Id_Sonde,
        changes: {
          moduleIdBefore: existing.Id_Module,
          moduleIdAfter: updated.Id_Module,
          offsetBefore: existing.Sonde_Offset,
          offsetAfter: updated.Sonde_Offset,
          offsetChanged,
          invalidatedEtalonnages,
          invalidatedEtalonnageMeasures,
        },
      })

      return apiOk({
        Id_Sonde: updated.Id_Sonde,
        Id_Module: updated.Id_Module,
        Port_Serie: updated.Port_Serie,
        invalidatedEtalonnages,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }

      log.error("SENSOR_UPDATE", "Sensor update failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "internal_error", "Erreur lors de la mise a jour de la sonde")
    }
  },
)
