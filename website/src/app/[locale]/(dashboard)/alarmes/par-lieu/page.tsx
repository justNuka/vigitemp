import { subDays } from "date-fns"
import { connection } from "next/server"
import { getTranslations } from "next-intl/server"

import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"
import { AlarmsByLocationPageClient, type AlarmByLocationRow } from "./alarms-by-location-page-client"

async function getAlarmRowsByLocation(): Promise<AlarmByLocationRow[]> {
  const userId = await getServerAuthenticatedUserId()
  if (!userId) return []

  const { prisma } = await import("@/lib/prisma")
  const scope = await getUserLocationScope(userId)
  const alarmAccessFilter = buildAlarmAccessFilter(scope)
  const since = subDays(new Date(), 7)

  const select = {
    Id_Lieu: true,
    Type: true,
    Date_Heure_Debut: true,
    Date_Heure_Fin: true,
    Est_Acquittee: true,
    t_lieu: {
      select: {
        Nom_Lieu: true,
        t_site: {
          select: {
            Libelle_Site: true,
          },
        },
      },
    },
  } as const

  const [activeRows, historyRows] = await Promise.all([
    prisma.t_alarme.findMany({
      where: applyAccessFilter(
        {
          Id_Lieu: { not: null },
          Date_Heure_Debut: { gte: since },
        },
        alarmAccessFilter,
      ),
      select,
    }),
    prisma.t_alarme_histo.findMany({
      where: applyAccessFilter(
        {
          Id_Lieu: { not: null },
          Date_Heure_Debut: { gte: since },
        },
        alarmAccessFilter,
      ),
      select,
    }),
  ])

  const rows = [...activeRows, ...historyRows]
  const byLocation = new Map<number, AlarmByLocationRow>()

  for (const alarm of rows) {
    if (!alarm.Id_Lieu) continue

    const siteLabel = alarm.t_lieu?.t_site?.Libelle_Site?.trim()
    const siteName = siteLabel || "Site inconnu"
    const locationName = alarm.t_lieu?.Nom_Lieu?.trim() || "Lieu inconnu"

    const current =
      byLocation.get(alarm.Id_Lieu) ??
      {
        locationId: alarm.Id_Lieu,
        locationName,
        siteName,
        totalCount: 0,
        activeCount: 0,
        highCount: 0,
        lowCount: 0,
        noResponseCount: 0,
        lastTriggeredAt: null,
      }

    current.totalCount += 1

    if (!alarm.Date_Heure_Fin && !alarm.Est_Acquittee) {
      current.activeCount += 1
    }

    if (alarm.Type === "H") current.highCount += 1
    else if (alarm.Type === "B") current.lowCount += 1
    else current.noResponseCount += 1

    const alarmStartedAt = alarm.Date_Heure_Debut?.toISOString() ?? null
    if (alarmStartedAt && (!current.lastTriggeredAt || alarmStartedAt > current.lastTriggeredAt)) {
      current.lastTriggeredAt = alarmStartedAt
    }

    byLocation.set(alarm.Id_Lieu, current)
  }

  return Array.from(byLocation.values()).sort((a, b) => {
    if (a.activeCount !== b.activeCount) return b.activeCount - a.activeCount
    if (a.totalCount !== b.totalCount) return b.totalCount - a.totalCount
    return a.locationName.localeCompare(b.locationName, "fr")
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "dashboardClient" })

  return {
    title: t("trend_by_location.meta.title"),
    description: t("trend_by_location.meta.description"),
  }
}

export default async function DashboardAlarmsByLocationPage() {
  await connection()
  const rows = await getAlarmRowsByLocation()

  return <AlarmsByLocationPageClient rows={rows} />
}
