import { applyAccessFilter, buildAlarmAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"
import { log } from "@/lib/logger"
import { mapAlarmTypeCategory } from "@/lib/alarm-types"
﻿import { unstable_noStore } from "next/cache"

export interface DashboardStats {
  total: number
  disabled: number
  ok: number
  preAlarm: number
  ended: number
  critical: number
  activeAlarms: number
  activeAlarmBreakdown: {
    high: number
    low: number
    noResponse: number
    sector: number
    module: number
    other: number
  }
}

const emptyAlarmBreakdown = () => ({ high: 0, low: 0, noResponse: 0, sector: 0, module: 0, other: 0 })

/**
 * Charge les statistiques du tableau de bord (côté serveur)
 * - `warning` = pré-alarme
 * - `critical` = alarme
 */
export async function ServerDashboardStats(): Promise<DashboardStats> {
  unstable_noStore()
  const { prisma } = await import("@/lib/prisma")

  try {
    const userId = await getServerAuthenticatedUserId()
    if (!userId) {
      return {
        total: 0,
        disabled: 0,
        ok: 0,
        preAlarm: 0,
        ended: 0,
        critical: 0,
        activeAlarms: 0,
        activeAlarmBreakdown: emptyAlarmBreakdown(),
      }
    }

    const scope = await getUserLocationScope(userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)
    const alarmAccessFilter = buildAlarmAccessFilter(scope)
    const locations = await prisma.t_lieu.findMany({
      where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
      select: {
        Lieu_Etat: true,
        Est_Lieu_En_Alarme: true,
        Est_Lieu_En_Pre_Alarme: true,
        Est_Lieu_Alarme_Terminee_Non_Acquittee: true,
        Est_Lieu_Alarme_Terminee_Non_Acquittee_T1: true,
      },
    })

    const total = locations.length
    const disabled = locations.filter((l) => l.Lieu_Etat === "D").length
    const activeLocations = locations.filter((l) => l.Lieu_Etat !== "D")
    const critical = activeLocations.filter((l) => l.Est_Lieu_En_Alarme === 1).length
    const ended = activeLocations.filter(
      (l) =>
        l.Est_Lieu_En_Alarme !== 1 &&
        (l.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 || l.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1),
    ).length
    const preAlarm = activeLocations.filter(
      (l) =>
        l.Est_Lieu_En_Alarme !== 1 &&
        l.Est_Lieu_Alarme_Terminee_Non_Acquittee !== 1 &&
        l.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 !== 1 &&
        l.Est_Lieu_En_Pre_Alarme === 1,
    ).length
    const ok = activeLocations.length - preAlarm - ended - critical

    const currentAlarms = await prisma.t_alarme.findMany({
      where: applyAccessFilter(
        {
          Est_Acquittee: false,
          Date_Heure_Fin: null,
        },
        alarmAccessFilter,
      ),
      select: { Type: true },
    })
    const activeAlarmBreakdown = currentAlarms.reduce((counts, alarm) => {
      const category = mapAlarmTypeCategory(alarm.Type)
      if (category === "high") counts.high += 1
      else if (category === "low") counts.low += 1
      else if (category === "no-response") counts.noResponse += 1
      else if (category === "module") counts.module += 1
      else if (category === "sector") counts.sector += 1
      else counts.other += 1
      return counts
    }, emptyAlarmBreakdown())

    return {
      total,
      disabled,
      ok,
      preAlarm,
      ended,
      critical,
      activeAlarms: currentAlarms.length,
      activeAlarmBreakdown,
    }
  } catch (error) {
    log.error("surveillance/stats", "failed_to_load_dashboard_stats", { error })
    return {
      total: 0,
      disabled: 0,
      ok: 0,
      preAlarm: 0,
      ended: 0,
      critical: 0,
      activeAlarms: 0,
      activeAlarmBreakdown: emptyAlarmBreakdown(),
    }
  }
}


export async function ServerSurveillanceRefreshIntervalSeconds(): Promise<number> {
  unstable_noStore()
  const DEFAULT_SECONDS = 60

  try {
    const [{ prisma }, { validateLicense }, { isStandardOrExpert }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/license-server"),
      import("@/lib/license-access"),
    ])

    const license = await validateLicense()
    if (!license.ok || !isStandardOrExpert(license)) {
      return DEFAULT_SECONDS
    }

    const setting = await prisma.t_parametre.findFirst({
      where: {
        OR: [
          { Section: "dashboard", Mot_Cle: "surveillance_refresh" },
          { Section: "DASHBOARD", Mot_Cle: "SURVEILLANCE_REFRESH" },
        ],
      },
      select: { Valeur: true },
    })

    const parsed = Number.parseInt(setting?.Valeur ?? "", 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_SECONDS
    }

    return parsed
  } catch (error) {
    log.error("surveillance/stats", "failed_to_load_refresh_interval", { error })
    return DEFAULT_SECONDS
  }
}
