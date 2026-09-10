import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  addCalibrationSensor,
  getCalibrationSessionForUser,
  startCalibrationAcquisition,
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
import {
  applyGspMetrologyConfiguration,
  GspSensorUnreachableError,
} from "@/lib/metrology-gsp-configuration"
import { restoreGspMetrologyConfigurationOnce } from "@/lib/metrology-gsp-configuration-restore"
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
  standardId: z.number().int().positive(),
  mediumId: z.number().int().positive(),
})

const patchSchema = z.union([
  z.object({ action: z.literal("start-acquisition") }),
  z.object({ sensorId: z.number().int().positive() }),
])

function safeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const message = error.message?.trim() ?? ""
  if (!message || message.includes("\n") || /prisma|sql|column|invocation|p20\d\d/i.test(message)) return fallback
  return message
}

function calibrationWatchdogKey(userId: number) {
  return `calibration:${userId}`
}

async function restoreTerminalCalibrationGspConfiguration(
  session: Awaited<ReturnType<typeof getCalibrationSessionForUser>>,
) {
  if (!session || session.status === "running") return
  await restoreGspMetrologyConfigurationOnce(
    `calibration:${session.id}`,
    session.sensors.map((sensor) => sensor.id),
    "ETALONNAGE",
  )
}

async function stopCalibrationAndRestoreSensorStates(userId: number) {
  let session: Awaited<ReturnType<typeof stopCalibrationSession>> | null = null
  let stopError: unknown = null
  let restoreError: unknown = null
  let gspRestoreError: unknown = null

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

  if (session) {
    try {
      await restoreGspMetrologyConfigurationOnce(
        `calibration:${session.id}`,
        session.sensors.map((sensor) => sensor.id),
        "ETALONNAGE",
      )
    } catch (error) {
      gspRestoreError = error
    }
  }

  if (stopError || restoreError || gspRestoreError) {
    log.error("METROLOGY_CALIBRATION", "session_stop_partial_failure", {
      userId,
      stopError: stopError instanceof Error ? stopError.message : stopError ? String(stopError) : null,
      restoreError: restoreError instanceof Error ? restoreError.message : restoreError ? String(restoreError) : null,
      gspRestoreError:
        gspRestoreError instanceof Error ? gspRestoreError.message : gspRestoreError ? String(gspRestoreError) : null,
    })
    throw gspRestoreError ?? restoreError ?? stopError
  }

  if (!session) throw new Error("Aucune session d'etalonnage active.")
  return session
}

async function ensureCalibrationExpiration(userId: number) {
  const session = await getCalibrationSessionForUser(userId)
  const key = calibrationWatchdogKey(userId)

  if (!session || session.status !== "running") {
    clearMetrologySessionWatchdog(key)
    await restoreTerminalCalibrationGspConfiguration(session).catch(() => undefined)
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
        if (!current || current.status !== "running") {
          await restoreTerminalCalibrationGspConfiguration(current).catch(() => undefined)
          return
        }
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
    let preparedGspSensorIds: number[] = []
    try {
      const input = startSchema.parse(await req.json())
      const userId = ctx.user.userId

      await stopMetrologyReadingPreviewSession(userId)
      await captureCalibrationSensorStates(userId, input.selectedSensorIds)
      sensorStatesCaptured = true

      preparedGspSensorIds = await applyGspMetrologyConfiguration(
        input.selectedSensorIds,
        "calibration-without-accuracy",
        "ETALONNAGE",
      )

      const session = await startCalibrationSession(ctx.user, input)
      calibrationStarted = true
      await setCalibrationSensorsToCalibrationState(userId)

      const expiresAtMs = new Date(session.startedAt).getTime() + CALIBRATION_MAX_DURATION_MS
      scheduleMetrologySessionWatchdog(calibrationWatchdogKey(userId), expiresAtMs, async () => {
        try {
          const current = await getCalibrationSessionForUser(userId)
          if (!current || current.status !== "running") {
            await restoreTerminalCalibrationGspConfiguration(current).catch(() => undefined)
            return
          }
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
      } else {
        if (preparedGspSensorIds.length > 0) {
          await applyGspMetrologyConfiguration(preparedGspSensorIds, "normal", "ETALONNAGE").catch((restoreError) => {
            log.error("METROLOGY_GSP", "calibration_start_econ_rollback_failed", {
              userId: ctx.user.userId,
              sensorIds: preparedGspSensorIds,
              error: restoreError instanceof Error ? restoreError.message : String(restoreError),
            })
          })
        }
        if (sensorStatesCaptured) {
          await restoreCalibrationSensorStates(ctx.user.userId).catch((restoreError) => {
            log.error("METROLOGY_CALIBRATION", "sensor_state_restore_failed", {
              userId: ctx.user.userId,
              error: restoreError instanceof Error ? restoreError.message : String(restoreError),
            })
          })
        }
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }
      if (error instanceof GspSensorUnreachableError) {
        return apiError(400, "gsp_sensor_unreachable", error.message, { serial: error.serial })
      }
      log.error("METROLOGY_CALIBRATION", "session_start_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "calibration_start_failed", safeErrorMessage(error, "Impossible de démarrer l'étalonnage."))
    }
  },
)

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    let snapshotAdded = false
    let sensorId: number | null = null
    let gspPrepared = false
    try {
      const input = patchSchema.parse(await req.json())

      if ("action" in input) {
        const session = await startCalibrationAcquisition(ctx.user.userId)
        return apiOk({ session })
      }

      sensorId = input.sensorId
      await appendCalibrationSensorStates(ctx.user.userId, [sensorId])
      snapshotAdded = true
      const preparedIds = await applyGspMetrologyConfiguration(
        [sensorId],
        "calibration-without-accuracy",
        "ETALONNAGE",
      )
      gspPrepared = preparedIds.includes(sensorId)
      const session = await addCalibrationSensor(ctx.user.userId, sensorId)
      return apiOk({ session })
    } catch (error) {
      if (gspPrepared && sensorId != null) {
        await applyGspMetrologyConfiguration([sensorId], "normal", "ETALONNAGE").catch((restoreError) => {
          log.error("METROLOGY_GSP", "calibration_sensor_add_econ_rollback_failed", {
            userId: ctx.user.userId,
            sensorId,
            error: restoreError instanceof Error ? restoreError.message : String(restoreError),
          })
        })
      }
      if (snapshotAdded && sensorId != null) {
        removeCalibrationSensorStateSnapshots(ctx.user.userId, [sensorId])
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }
      log.error("METROLOGY_CALIBRATION", "session_patch_failed", {
        userId: ctx.user.userId,
        sensorId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(400, "calibration_patch_failed", safeErrorMessage(error, "Impossible de modifier la session d'étalonnage."))
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
      return apiError(400, "calibration_stop_failed", safeErrorMessage(error, "Impossible d'arrêter l'étalonnage."))
    }
  },
)
