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
import {
  clearMetrologySessionWatchdog,
  hasMetrologySessionWatchdog,
  scheduleMetrologySessionWatchdog,
} from "@/lib/metrology-session-watchdog"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const CALIBRATION_MAX_DURATION_MS = 90 * 60 * 1000

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

function calibrationWatchdogKey(userId: number) {
  return `calibration:${userId}`
}

async function ensureCalibrationExpiration(userId: number) {
  const session = await getCalibrationSessionForUser(userId)
  const key = calibrationWatchdogKey(userId)

  if (!session || session.status !== "running") {
    clearMetrologySessionWatchdog(key)
    return session
  }

  const startedAtMs = new Date(session.startedAt).getTime()
  const expiresAtMs = startedAtMs + CALIBRATION_MAX_DURATION_MS

  if (!Number.isFinite(startedAtMs) || Date.now() >= expiresAtMs) {
    clearMetrologySessionWatchdog(key)
    const stoppedSession = await stopCalibrationSession(userId)
    log.warn("METROLOGY_CALIBRATION", "session_expired", {
      sessionId: session.id,
      userId,
      startedAt: session.startedAt,
      maxDurationMinutes: CALIBRATION_MAX_DURATION_MS / 60_000,
    })
    return stoppedSession
  }

  if (!hasMetrologySessionWatchdog(key)) {
    scheduleMetrologySessionWatchdog(key, expiresAtMs, async () => {
      try {
        const current = await getCalibrationSessionForUser(userId)
        if (!current || current.status !== "running") return
        await stopCalibrationSession(userId)
        log.warn("METROLOGY_CALIBRATION", "session_expired", {
          sessionId: current.id,
          userId,
          startedAt: current.startedAt,
          maxDurationMinutes: CALIBRATION_MAX_DURATION_MS / 60_000,
        })
      } catch (error) {
        log.error("METROLOGY_CALIBRATION", "session_expiration_failed", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })
  }

  return session
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => apiOk({
    session: await ensureCalibrationExpiration(ctx.user.userId),
  }),
)

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const input = startSchema.parse(await req.json())
      const session = await startCalibrationSession(ctx.user, input)
      const expiresAtMs = new Date(session.startedAt).getTime() + CALIBRATION_MAX_DURATION_MS
      scheduleMetrologySessionWatchdog(calibrationWatchdogKey(ctx.user.userId), expiresAtMs, async () => {
        try {
          const current = await getCalibrationSessionForUser(ctx.user.userId)
          if (!current || current.status !== "running") return
          await stopCalibrationSession(ctx.user.userId)
          log.warn("METROLOGY_CALIBRATION", "session_expired", {
            sessionId: current.id,
            userId: ctx.user.userId,
            startedAt: current.startedAt,
            maxDurationMinutes: CALIBRATION_MAX_DURATION_MS / 60_000,
          })
        } catch (error) {
          log.error("METROLOGY_CALIBRATION", "session_expiration_failed", {
            userId: ctx.user.userId,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      })
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
      clearMetrologySessionWatchdog(calibrationWatchdogKey(ctx.user.userId))
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
