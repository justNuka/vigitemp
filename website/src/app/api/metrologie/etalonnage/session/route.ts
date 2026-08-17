import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  getCalibrationSessionForUser,
  startCalibrationSession,
  stopCalibrationSession,
} from "@/lib/metrology-calibration-session"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const startSchema = z.object({
  selectedSensorIds: z.array(z.number().int().positive()).min(1),
  operator: z.string().trim().max(100).default(""),
})

function safeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const message = error.message?.trim() ?? ""
  if (!message || message.includes("\n") || /prisma|sql|column|invocation|p20\d\d/i.test(message)) return fallback
  return message
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => apiOk({
    session: await getCalibrationSessionForUser(ctx.user.userId),
  }),
)

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const input = startSchema.parse(await req.json())
      const session = await startCalibrationSession(ctx.user, input)
      return apiOk({ session }, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_CALIBRATION", "session_start_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "calibration_start_failed", safeErrorMessage(error, "Impossible de demarrer l'etalonnage."))
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => {
    try {
      const session = await stopCalibrationSession(ctx.user.userId)
      return apiOk({ session })
    } catch (error) {
      log.error("METROLOGY_CALIBRATION", "session_stop_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "calibration_stop_failed", safeErrorMessage(error, "Impossible d'arreter l'etalonnage."))
    }
  },
)
