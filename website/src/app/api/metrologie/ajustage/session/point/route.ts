import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { startAdjustmentPointAcquisition } from "@/lib/metrology-adjustment-session"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const pointSchema = z.object({
  pointIndex: z.union([z.literal(1), z.literal(2)]),
  targetValue: z.number().finite().optional(),
})

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const body = await req.json()
      const data = pointSchema.parse(body)
      const session = await startAdjustmentPointAcquisition(
        ctx.user.userId,
        data.pointIndex,
        data.targetValue,
      )
      return apiOk({ session })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_ADJUSTMENT", "point_acquisition_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "adjustment_point_acquisition_failed", error instanceof Error ? error.message : "Impossible de lancer l'acquisition du point")
    }
  },
)
