import { unstable_noStore } from "next/cache"

export interface DashboardStats {
  total: number
  ok: number
  warning: number
  critical: number
  activeAlarms: number
}

/**
 * Charge les statistiques du tableau de bord (côté serveur)
 * - `warning` = pré-alarme
 * - `critical` = alarme
 */
export async function ServerDashboardStats(): Promise<DashboardStats> {
  unstable_noStore()
  const { prisma } = await import("@/lib/prisma")

  try {
    const locations = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      select: {
        Est_Lieu_En_Alarme: true,
        Est_Lieu_En_Pre_Alarme: true,
      },
    })

    const total = locations.length
    const critical = locations.filter((l) => l.Est_Lieu_En_Alarme === 1).length
    const warning = locations.filter((l) => l.Est_Lieu_En_Alarme !== 1 && l.Est_Lieu_En_Pre_Alarme === 1).length
    const ok = total - warning - critical

    const activeAlarms = await prisma.t_alarme.count({
      where: { Est_Acquittee: false },
    })

    return {
      total,
      ok,
      warning,
      critical,
      activeAlarms,
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
    return {
      total: 0,
      ok: 0,
      warning: 0,
      critical: 0,
      activeAlarms: 0,
    }
  }
}


export async function ServerSurveillanceRefreshIntervalSeconds(): Promise<number> {
  unstable_noStore()
  const DEFAULT_SECONDS = 15

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
    console.error("Error loading surveillance refresh interval:", error)
    return DEFAULT_SECONDS
  }
}
