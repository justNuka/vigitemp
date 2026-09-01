import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAuthorizationLogging } from "@/lib/license-guards"
import { buildAuditChanges } from "@/lib/audit-route"
import { getRequestContext } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import type { HandlerContext } from "@/lib/api-wrappers"
import {
  getMonthlyStatsReportConfig,
  saveMonthlyStatsReportConfig,
  type MonthlyStatsReportConfig,
} from "@/lib/statistics/monthly-report-config"

const configSchema = z.object({
  enabled: z.boolean(),
  recipients: z.string().default(""),
  dayOfMonth: z.number().int().min(1).max(31),
  hourLocal: z.number().int().min(0).max(23),
  includeLocationSummary: z.boolean(),
  includeSettingsSummary: z.boolean(),
  includeMax: z.boolean(),
  includeMin: z.boolean(),
  includeAvg: z.boolean(),
  includeAlarmCount: z.boolean(),
  includeAlarmHighDuration: z.boolean(),
  includeAlarmLowDuration: z.boolean(),
  includeOverHighNoAlarm: z.boolean(),
  includeOverLowNoAlarm: z.boolean(),
})

export const GET = withStandardOrExpertAuthorizationLogging("PARAMETRES_GERER", async (_req: NextRequest) => {
  try {
    const config = await getMonthlyStatsReportConfig()
    return apiOk(config)
  } catch (error) {
    log.error("stats/monthly-config", "load_failed", { error })
    return apiError(500, "monthly_stats_config_load_failed", "Erreur lors du chargement de la configuration")
  }
})

export const PUT = withStandardOrExpertAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const body = await req.json()
    const parsed = configSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(400, "validation_error", "Configuration invalide", {
        details: parsed.error.issues,
      })
    }

    const payload: MonthlyStatsReportConfig = parsed.data
    const previousConfig = await getMonthlyStatsReportConfig()
    await saveMonthlyStatsReportConfig(payload)
    const { ip } = getRequestContext(req)
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      userProfile: ctx.user.profile,
      ip,
      resource: "Configuration recap mensuel",
      resourceId: "monthly-stats-report-config",
      changes: {
        action: "update",
        ...buildAuditChanges(previousConfig, payload, [
          "enabled",
          "recipients",
          "dayOfMonth",
          "hourLocal",
          "includeLocationSummary",
          "includeSettingsSummary",
          "includeMax",
          "includeMin",
          "includeAvg",
          "includeAlarmCount",
          "includeAlarmHighDuration",
          "includeAlarmLowDuration",
          "includeOverHighNoAlarm",
          "includeOverLowNoAlarm",
        ]),
      },
    })
    return apiOk({ message: "Configuration enregistrée", config: payload })
  } catch (error) {
    log.error("stats/monthly-config", "save_failed", { error })
    return apiError(500, "monthly_stats_config_save_failed", "Erreur lors de l'enregistrement de la configuration")
  }
})
