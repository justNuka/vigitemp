import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getAdjustmentSessionForUser } from "@/lib/metrology-adjustment-session"
import { getCalibrationSessionForUser } from "@/lib/metrology-calibration-session"
import { readMetrologySensorsPreview } from "@/lib/metrology-reading-preview"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const schema = z.object({
  selectedSensorIds: z.array(z.number().int().positive()).min(1),
  operation: z.enum(["AJUSTAGE", "ETALONNAGE"]),
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
      return apiOk(await readMetrologySensorsPreview(input.selectedSensorIds, input.operation))
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_READING", "preview_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "metrology_reading_failed", "Impossible de lire les sondes selectionnees.")
    }
  },
)
