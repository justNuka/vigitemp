import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  extendAdjustmentSession,
  getAdjustmentSessionForUser,
  shouldConfirmAdjustmentStop,
  startAdjustmentSession,
  stopAdjustmentSession,
} from "@/lib/metrology-adjustment-session"
import {
  clearMetrologySessionWatchdog,
  hasMetrologySessionWatchdog,
  scheduleMetrologySessionWatchdog,
} from "@/lib/metrology-session-watchdog"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const ADJUSTMENT_WATCHDOG_GRACE_MS = 1_000

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
        await getAdjustmentSessionForUser(userId)
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
    const session = await getAdjustmentSessionForUser(ctx.user.userId)
    ensureAdjustmentWatchdog(ctx.user.userId, session)
    return apiOk({
      session,
      shouldConfirmStop: shouldConfirmAdjustmentStop(ctx.user.userId),
    })
  },
)

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const body = await req.json()
      const data = startSchema.parse(body)
      const userId = ctx.user.userId
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
            await getAdjustmentSessionForUser(userId)
          } catch (error) {
            log.error("METROLOGY_ADJUSTMENT", "session_watchdog_failed", {
              userId,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        },
      )
      return apiOk({ session }, { status: 201 })
    } catch (error) {
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
      return apiOk({
        session,
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
      const userId = ctx.user.userId
      const session = await extendAdjustmentSession(userId, getClientIp(req))
      scheduleMetrologySessionWatchdog(
        adjustmentWatchdogKey(userId),
        adjustmentWatchdogDeadline(session.expiresAt),
        async () => {
          try {
            await getAdjustmentSessionForUser(userId)
          } catch (error) {
            log.error("METROLOGY_ADJUSTMENT", "session_watchdog_failed", {
              userId,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        },
      )
      return apiOk({ session })
    } catch (error) {
      log.error("METROLOGY_ADJUSTMENT", "session_extension_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "adjustment_extension_failed",
        getSafeAdjustmentErrorMessage(error, "Impossible de prolonger l'ajustage."),
      )
    }
  },
)
