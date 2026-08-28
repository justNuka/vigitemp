import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  extendAdjustmentSession,
  getAdjustmentSessionForUser,
  resolveAdjustmentCalculatedCoefficientApplication,
  shouldConfirmAdjustmentStop,
  startAdjustmentSession,
  stopAdjustmentSession,
  updateAdjustmentCoefficients,
} from "@/lib/metrology-adjustment-session"
import {
  markLatestAdjustmentCoefficientRowsDirty,
  requireAdjustmentCoefficientDirtyColumn,
} from "@/lib/metrology-adjustment-coefficient-dirty"
import { applyGspMetrologyConfiguration } from "@/lib/metrology-gsp-configuration"
import { restoreGspMetrologyConfigurationOnce } from "@/lib/metrology-gsp-configuration-restore"
import { stopMetrologyReadingPreviewSession } from "@/lib/metrology-reading-preview-session"
import {
  clearMetrologySessionWatchdog,
  hasMetrologySessionWatchdog,
  scheduleMetrologySessionWatchdog,
} from "@/lib/metrology-session-watchdog"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const ADJUSTMENT_WATCHDOG_GRACE_MS = 1_000
const TERMINAL_RESULT_GRACE_MS = 60_000

const startSchema = z.object({
  selectedSensorIds: z.array(z.number().int().positive()).min(1),
  operator: z.string().default(""),
  displayDecimals: z.number().int().min(0).max(6).default(2),
  standardId: z.number().int().positive(),
  mediumId: z.number().int().positive().nullable().optional(),
  plateauDurationMinutes: z.number().int().min(1).default(30),
  plateauMaxGap: z.number().nonnegative().default(0.2),
  measurementIntervalSeconds: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(15),
})

const stopSchema = z.object({
  cancelResults: z.boolean().default(false),
})

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("extend"),
  }),
  z.object({
    action: z.literal("resolve-calculated-coefficients"),
    apply: z.boolean(),
  }),
  z.object({
    action: z.literal("update-coefficients"),
    coefficients: z
      .array(
        z.object({
          sensorId: z.number().int().positive(),
          coeffA: z.number().finite(),
          coeffB: z.number().finite(),
          coeffC: z.number().finite(),
        }),
      )
      .min(1),
  }),
])

function getSafeAdjustmentErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback

  const message = error.message?.trim() ?? ""
  if (!message) return fallback

  const lower = message.toLowerCase()
  const looksTechnical =
    message.includes("\n") ||
    lower.includes("invalid `prisma.") ||
    lower.includes("prismaclient") ||
    lower.includes("the column ") ||
    lower.includes("does not exist in the current database") ||
    lower.includes("invocation:") ||
    lower.includes("sql") ||
    lower.includes("p2022")

  if (looksTechnical) return fallback
  return message
}

function adjustmentWatchdogKey(userId: number) {
  return `adjustment:${userId}`
}

function adjustmentWatchdogDeadline(expiresAt: string) {
  return new Date(expiresAt).getTime() + ADJUSTMENT_WATCHDOG_GRACE_MS
}

function preserveStoredWallClock(value: string) {
  return value.replace(/(?:\.\d{1,3})?Z$/i, "")
}

function normalizeAdjustmentSessionDates<T extends Awaited<ReturnType<typeof getAdjustmentSessionForUser>>>(session: T): T {
  if (!session) return session
  const gsoIds = new Set(session.sensors.filter((sensor) => sensor.isGso).map((sensor) => sensor.id))
  const latestSensorReadings = Object.fromEntries(
    Object.entries(session.latestSensorReadings).map(([sensorId, reading]) => {
      if (!reading || !gsoIds.has(Number(sensorId))) return [sensorId, reading]
      return [sensorId, { ...reading, measuredAt: preserveStoredWallClock(reading.measuredAt) }]
    }),
  ) as typeof session.latestSensorReadings

  return { ...session, latestSensorReadings } as T
}

function shouldExposeAdjustmentSession(
  session: Awaited<ReturnType<typeof getAdjustmentSessionForUser>>,
) {
  if (!session) return false
  if (session.status === "running" || session.status === "idle") return true

  const lastUpdatedAt = new Date(session.lastUpdatedAt).getTime()
  if (!Number.isFinite(lastUpdatedAt)) return false

  return Date.now() - lastUpdatedAt <= TERMINAL_RESULT_GRACE_MS
}

async function getAdjustmentSessionAndRestoreTerminalGsp(userId: number) {
  const session = await getAdjustmentSessionForUser(userId)
  if (session && session.status !== "running" && session.status !== "idle") {
    const completedWithCoefficientDecision =
      session.status === "completed" &&
      session.coefficientApplication.status !== "not-applicable"

    if (!completedWithCoefficientDecision) {
      await restoreGspMetrologyConfigurationOnce(
        `adjustment:${session.id}`,
        session.sensors.map((sensor) => sensor.id),
        "AJUSTAGE",
      ).catch(() => undefined)
    }
  }
  return session
}

function ensureAdjustmentWatchdog(userId: number, session: Awaited<ReturnType<typeof getAdjustmentSessionForUser>>) {
  const key = adjustmentWatchdogKey(userId)

  if (!session || session.status !== "running") {
    clearMetrologySessionWatchdog(key)
    return
  }

  const deadline = adjustmentWatchdogDeadline(session.expiresAt)
  if (!Number.isFinite(deadline)) return

  if (!hasMetrologySessionWatchdog(key)) {
    scheduleMetrologySessionWatchdog(key, deadline, async () => {
      try {
        await getAdjustmentSessionAndRestoreTerminalGsp(userId)
      } catch (error) {
        log.error("METROLOGY_ADJUSTMENT", "session_watchdog_failed", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })
  }
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx) => {
    const session = await getAdjustmentSessionAndRestoreTerminalGsp(ctx.user.userId)
    ensureAdjustmentWatchdog(ctx.user.userId, session)
    const exposedSession = shouldExposeAdjustmentSession(session) ? normalizeAdjustmentSessionDates(session) : null
    return apiOk({
      session: exposedSession,
      shouldConfirmStop: exposedSession ? shouldConfirmAdjustmentStop(ctx.user.userId) : false,
    })
  },
)

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    let neutralizedSensorIds: number[] = []
    try {
      const body = await req.json()
      const data = startSchema.parse(body)
      const userId = ctx.user.userId
      await stopMetrologyReadingPreviewSession(userId)

      neutralizedSensorIds = await applyGspMetrologyConfiguration(
        data.selectedSensorIds,
        "adjustment-neutral",
        "AJUSTAGE",
      )

      const session = await startAdjustmentSession(
        ctx.user,
        {
          ...data,
          mediumId: data.mediumId ?? null,
        },
        getClientIp(req),
      )
      scheduleMetrologySessionWatchdog(
        adjustmentWatchdogKey(userId),
        adjustmentWatchdogDeadline(session.expiresAt),
        async () => {
          try {
            await getAdjustmentSessionAndRestoreTerminalGsp(userId)
          } catch (error) {
            log.error("METROLOGY_ADJUSTMENT", "session_watchdog_failed", {
              userId,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        },
      )
      return apiOk({ session: normalizeAdjustmentSessionDates(session) }, { status: 201 })
    } catch (error) {
      if (neutralizedSensorIds.length > 0) {
        await applyGspMetrologyConfiguration(neutralizedSensorIds, "normal", "AJUSTAGE").catch((restoreError) => {
          log.error("METROLOGY_GSP", "adjustment_start_econ_rollback_failed", {
            userId: ctx.user.userId,
            sensorIds: neutralizedSensorIds,
            error: restoreError instanceof Error ? restoreError.message : String(restoreError),
          })
        })
      }
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_ADJUSTMENT", "session_start_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "adjustment_start_failed",
        getSafeAdjustmentErrorMessage(error, "Impossible de demarrer l'ajustage."),
      )
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const body = await req.json().catch(() => ({}))
      const data = stopSchema.parse(body)
      clearMetrologySessionWatchdog(adjustmentWatchdogKey(ctx.user.userId))
      const session = await stopAdjustmentSession(ctx.user.userId, data.cancelResults, getClientIp(req))
      if (session) {
        await restoreGspMetrologyConfigurationOnce(
          `adjustment:${session.id}`,
          session.sensors.map((sensor) => sensor.id),
          "AJUSTAGE",
        )
      }
      return apiOk({
        session: normalizeAdjustmentSessionDates(session),
        shouldConfirmStop: shouldConfirmAdjustmentStop(ctx.user.userId),
      })
    } catch (error) {
      log.error("METROLOGY_ADJUSTMENT", "session_stop_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "adjustment_stop_failed",
        getSafeAdjustmentErrorMessage(error, "Impossible d'arreter l'ajustage."),
      )
    }
  },
)

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const body = await req.json().catch(() => ({}))
      const data = patchSchema.parse({
        ...body,
        action: body.action ?? "extend",
      })
      const userId = ctx.user.userId

      if (data.action === "resolve-calculated-coefficients") {
        const session = await resolveAdjustmentCalculatedCoefficientApplication(
          userId,
          data.apply,
          getClientIp(req),
        )
        return apiOk({ session: normalizeAdjustmentSessionDates(session) })
      }

      if (data.action === "update-coefficients") {
        await requireAdjustmentCoefficientDirtyColumn()
        const session = await updateAdjustmentCoefficients(
          userId,
          data.coefficients,
          getClientIp(req),
        )
        await markLatestAdjustmentCoefficientRowsDirty(
          session.sensors.map((sensor) => sensor.serialNumber),
        )
        return apiOk({ session: normalizeAdjustmentSessionDates(session) })
      }

      const session = await extendAdjustmentSession(userId, getClientIp(req))
      scheduleMetrologySessionWatchdog(
        adjustmentWatchdogKey(userId),
        adjustmentWatchdogDeadline(session.expiresAt),
        async () => {
          try {
            await getAdjustmentSessionAndRestoreTerminalGsp(userId)
          } catch (error) {
            log.error("METROLOGY_ADJUSTMENT", "session_watchdog_failed", {
              userId,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        },
      )
      return apiOk({ session: normalizeAdjustmentSessionDates(session) })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", {
          details: error.issues,
        })
      }
      log.error("METROLOGY_ADJUSTMENT", "session_patch_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "adjustment_patch_failed",
        getSafeAdjustmentErrorMessage(error, "Impossible de mettre à jour l'ajustage."),
      )
    }
  },
)
