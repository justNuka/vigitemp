import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { submitExternalStandardReading } from "@/lib/metrology-adjustment-session"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const readingSchema = z.object({ value: z.number().finite() })

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const data = readingSchema.parse(await req.json())
      const session = await submitExternalStandardReading(ctx.user.userId, data.value)
      return apiOk({ session })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Mesure etalon invalide", {
          details: error.issues,
        })
      }
      log.error("METROLOGY_ADJUSTMENT", "external_standard_reading_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "external_standard_reading_failed",
        error instanceof Error ? error.message : "Impossible d'enregistrer la mesure etalon.",
      )
    }
  },
)
