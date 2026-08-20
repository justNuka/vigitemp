import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  addCalibrationSensor,
  getCalibrationSessionForUser,
  startCalibrationSession,
  stopCalibrationSession,
} from "@/lib/metrology-calibration-session"
import {
  appendCalibrationSensorStates,
  captureCalibrationSensorStates,
  removeCalibrationSensorStateSnapshots,
  restoreCalibrationSensorStates,
  setCalibrationSensorsToCalibrationState,
} from "@/lib/metrology-calibration-sensor-state"
import { stopMetrologyReadingPreviewSession } from "@/lib/metrology-reading-preview-session"
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

const addSensorSchema = z.object({
  sensorId: z.number().int().positive(),
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

async function stopCalibrationAndRestoreSensorStates(userId: number) {
  let session: Awaited<ReturnType<typeof stopCalibrationSession>> | null = null
  let stopError: unknown = null
  let restoreError: unknown = null

  try {
    session = await stopCalibrationSession(userId)
  } catch (error) {
    stopError = error
  }

  try {
    await restoreCalibrationSensorStates(userId)
  } catch (error) {
    restoreError = error
  }

  if (stopError || restoreError) {
    log.error("METROLOGY_CALIBRATION", "session_stop_partial_failure", {
      userId,
      stopError: stopError instanceof Error ? stopError.message : stopError ? String(stopError) : null,
      restoreError: restoreError instanceof Error ? restoreError.message : restoreError ? String(restoreError) : null,
    })
    throw restoreError ?? stopError
  }

  if (!session) throw new Error("Aucune session d'etalonnage active.")
  return session
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
    const stoppedSession = await stopCalibrationAndRestoreSensorStates(userId)
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
        await stopCalibrationAndRestoreSensorStates(userId)
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
    let sensorStatesCaptured = false
    let calibrationStarted = false
    try {
      const input = startSchema.parse(await req.json())
      const userId = ctx.user.userId

      await stopMetrologyReadingPreviewSession(userId)
      await captureCalibrationSensorStates(userId, input.selectedSensorIds)
      sensorStatesCaptured = true

      const session = await startCalibrationSession(ctx.user, input)
      calibrationStarted = true
      await setCalibrationSensorsToCalibrationState(userId)

      const expiresAtMs = new Date(session.startedAt).getTime() + CALIBRATION_MAX_DURATION_MS
      scheduleMetrologySessionWatchdog(calibrationWatchdogKey(userId), expiresAtMs, async () => {
        try {
          const current = await getCalibrationSessionForUser(userId)
          if (!current || current.status !== "running") return
          await stopCalibrationAndRestoreSensorStates(userId)
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
      return apiOk({ session }, { status: 201 })
    } catch (error) {
      if (calibrationStarted) {
        await stopCalibrationAndRestoreSensorStates(ctx.user.userId).catch((stopError) => {
          log.error("METROLOGY_CALIBRATION", "session_start_rollback_failed", {
            userId: ctx.user.userId,
            error: stopError instanceof Error ? stopError.message : String(stopError),
          })
        })
      } else if (sensorStatesCaptured) {
        await restoreCalibrationSensorStates(ctx.user.userId).catch((restoreError) => {
          log.error("METROLOGY_CALIBRATION", "sensor_state_restore_failed", {
            userId: ctx.user.userId,
            error: restoreError instanceof Error ? restoreError.message : String(restoreError),
          })
        })
      }
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

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    let snapshotAdded = false
    let sensorId: number | null = null
    try {
      const input = addSensorSchema.parse(await req.json())
      sensorId = input.sensorId
      await appendCalibrationSensorStates(ctx.user.userId, [sensorId])
      snapshotAdded = true
      const session = await addCalibrationSensor(ctx.user.userId, sensorId)
      return apiOk({ session })
    } catch (error) {
      if (snapshotAdded && sensorId != null) {
        removeCalibrationSensorStateSnapshots(ctx.user.userId, [sensorId])
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_CALIBRATION", "sensor_add_failed", {
        userId: ctx.user.userId,
        sensorId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "calibration_sensor_add_failed", safeErrorMessage(error, "Impossible d'ajouter la sonde."))
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => {
    try {
      clearMetrologySessionWatchdog(calibrationWatchdogKey(ctx.user.userId))
      const session = await stopCalibrationAndRestoreSensorStates(ctx.user.userId)
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
