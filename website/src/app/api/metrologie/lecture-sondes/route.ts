import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  GspCoefficientReadError,
  synchronizeGspCoefficientsFromSensors,
} from "@/lib/metrology-gsp-coefficient-sync"
import { getAdjustmentSessionForUser } from "@/lib/metrology-adjustment-session"
import {
  getCalibrationSessionForUser,
  readCalibrationStandardPreview,
} from "@/lib/metrology-calibration-session"
import { readMetrologySensorsPreview } from "@/lib/metrology-reading-preview"
import {
  ensureMetrologyReadingPreviewSession,
  stopMetrologyReadingPreviewSession,
} from "@/lib/metrology-reading-preview-session"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const schema = z.object({
  selectedSensorIds: z.array(z.number().int().positive()).min(1),
  operation: z.enum(["AJUSTAGE", "ETALONNAGE"]),
  standardId: z.number().int().positive().optional(),
  mediumId: z.number().int().positive().optional(),
})

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const input = schema.parse(await req.json())
      const activeSession = input.operation === "AJUSTAGE"
        ? await getAdjustmentSessionForUser(ctx.user.userId)
        : await getCalibrationSessionForUser(ctx.user.userId)
      if (activeSession?.status === "running") {
        return apiError(
          409,
          "metrology_operation_running",
          "La lecture seule n'est pas disponible pendant une operation en cours.",
        )
      }

      const previewSession = await ensureMetrologyReadingPreviewSession(
        ctx.user.userId,
        input.selectedSensorIds,
        input.operation,
      )
      let coefficientSync: Awaited<ReturnType<typeof synchronizeGspCoefficientsFromSensors>> = []
      if (previewSession.created) {
        try {
          coefficientSync = await synchronizeGspCoefficientsFromSensors(
            input.selectedSensorIds,
            input.operation,
          )
        } catch (error) {
          await stopMetrologyReadingPreviewSession(ctx.user.userId).catch(() => undefined)
          throw error
        }
      }

      const startedAt = new Date(previewSession.startedAt)

      const sensorPreview = await readMetrologySensorsPreview(
        input.selectedSensorIds,
        input.operation,
        startedAt,
      )
      const standardReading =
        input.operation === "ETALONNAGE" && input.standardId && input.mediumId
          ? await readCalibrationStandardPreview(input.standardId, input.mediumId)
          : null

      return apiOk({
        ...sensorPreview,
        standardReading,
        coefficientSync: { sensorIds: coefficientSync.map((item) => item.sensorId).filter((id): id is number => id != null) },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      if (error instanceof GspCoefficientReadError) {
        return apiError(400, "gsp_sensor_unreachable", error.message, { serial: error.serial })
      }
      log.error("METROLOGY_READING", "preview_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "metrology_reading_failed",
        error instanceof Error && error.message && !/prisma|sql|column|invocation|p20\d\d/i.test(error.message)
          ? error.message
          : "Impossible de lire les sondes selectionnees.",
      )
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => {
    try {
      const stopped = await stopMetrologyReadingPreviewSession(ctx.user.userId)
      return apiOk({ stopped })
    } catch (error) {
      log.error("METROLOGY_READING", "preview_stop_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "metrology_reading_stop_failed", "Impossible d'arreter la lecture simple.")
    }
  },
)
