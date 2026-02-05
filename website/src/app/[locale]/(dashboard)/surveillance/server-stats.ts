import { prisma } from "@/lib/prisma"
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
      where: { Est_Alarme_Vrai: true },
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

