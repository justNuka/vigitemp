import { NextRequest } from "next/server"

import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { sendMonthlyStatsReport } from "@/lib/statistics/monthly-report-email"
import {
  getMonthlyStatsReportConfig,
  getLastSentMonth,
  parseRecipients,
  setLastSentMonth,
} from "@/lib/statistics/monthly-report-config"
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat"

function getMonthToken(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export const POST = withAuthorizationLogging("GERER_PROFIL", async (_req: NextRequest) => {
  try {
    const config = await getMonthlyStatsReportConfig()
    if (!config.enabled) {
      return apiError(400, "monthly_stats_disabled", "Le recap mensuel est desactive")
    }

    const recipients = parseRecipients(config.recipients)
    if (recipients.length === 0) {
      return apiError(400, "monthly_stats_no_recipients", "Aucun destinataire configure")
    }

    const result = await sendMonthlyStatsReport({ recipients, config, date: new Date() })
    await setLastSentMonth(result.periodMonth)

    return apiOk({
      message: "Recap mensuel envoye",
      ...result,
    })
  } catch (error) {
    log.error("stats/monthly-send", "manual_send_failed", { error })
    return apiError(500, "monthly_stats_send_failed", "Erreur lors de l'envoi du recap mensuel")
  }
})

export async function GET(req: NextRequest) {
  try {
    const headerSecret = getCompatHeader(req, "x-vigisensys-secret", "x-vigitemp-secret") ?? ""
    const allowedSecrets = [
      getCompatEnv("VIGISENSYS_STATS_REPORT_SECRET", "VIGITEMP_STATS_REPORT_SECRET") ?? "",
      getCompatEnv("VIGISENSYS_ALARM_DISPATCH_SECRET", "VIGITEMP_ALARM_DISPATCH_SECRET") ?? "",
    ].filter((value) => value.length > 0)

    if (allowedSecrets.length === 0 || !allowedSecrets.includes(headerSecret)) {
      return apiError(401, "unauthorized", "Acces non autorise")
    }

    const config = await getMonthlyStatsReportConfig()
    if (!config.enabled) {
      return apiOk({ message: "Recap mensuel desactive", sent: false })
    }

    const now = new Date()
    const day = now.getDate()
    const hour = now.getHours()
    const lastDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const effectiveDayOfMonth = Math.min(config.dayOfMonth, lastDayOfCurrentMonth)
    if (day < effectiveDayOfMonth || (day === effectiveDayOfMonth && hour < config.hourLocal)) {
      return apiOk({ message: "Pas encore l'heure d'envoi", sent: false })
    }

    const target = new Date(now)
    target.setMonth(target.getMonth() - 1)
    const targetMonth = getMonthToken(target)
    const lastSentMonth = await getLastSentMonth()
    if (lastSentMonth === targetMonth) {
      return apiOk({ message: "Recap deja envoye pour ce mois", sent: false, periodMonth: targetMonth })
    }

    const recipients = parseRecipients(config.recipients)
    if (recipients.length === 0) {
      return apiError(400, "monthly_stats_no_recipients", "Aucun destinataire configure")
    }

    const result = await sendMonthlyStatsReport({ recipients, config, date: now })
    await setLastSentMonth(result.periodMonth)

    return apiOk({ message: "Recap mensuel envoye", ...result })
  } catch (error) {
    log.error("stats/monthly-send", "scheduled_send_failed", { error })
    return apiError(500, "monthly_stats_send_failed", "Erreur lors de l'envoi programme du recap mensuel")
  }
}
