import { addDays, format, startOfDay, subDays } from "date-fns"
import { connection } from "next/server"
import { getTranslations } from "next-intl/server"

import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { prisma } from "@/lib/prisma"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"
import { hasUserAuthorizationCode } from "@/lib/authz"
import { loadLocationStatisticsRows } from "@/lib/statistics/location-stats"
import { AlarmsByLocationPageClient } from "./alarms-by-location-page-client"

function parseDateInput(raw: string | null, fallback: Date) {
  if (!raw) return fallback
  const candidate = new Date(`${raw}T00:00:00`)
  return Number.isNaN(candidate.getTime()) ? fallback : candidate
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

export default async function DashboardAlarmsByLocationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await connection()
  const params = await searchParams
  const userId = await getServerAuthenticatedUserId()
  if (!userId) {
    return <AlarmsByLocationPageClient rows={[]} fromDate={format(subDays(new Date(), 6), "yyyy-MM-dd")} toDate={format(new Date(), "yyyy-MM-dd")} canManageReport={false} />
  }

  const today = startOfDay(new Date())
  const defaultFrom = startOfDay(subDays(today, 6))
  const defaultTo = today
  const from = parseDateInput(typeof params.from === "string" ? params.from : null, defaultFrom)
  const to = parseDateInput(typeof params.to === "string" ? params.to : null, defaultTo)
  const normalizedFrom = from <= to ? from : to
  const normalizedTo = to >= from ? to : from
  const toExclusive = addDays(startOfDay(normalizedTo), 1)

  const scope = await getUserLocationScope(userId)
  const lieuAccessFilter = buildLieuAccessFilter(scope)
  const allowedLieux = await prisma.t_lieu.findMany({
    where: applyAccessFilter({ Est_Archive: false, Lieu_Etat: "S" }, lieuAccessFilter),
    select: { Id_Lieu: true },
  })
  const allowedIds = allowedLieux.map((l) => l.Id_Lieu)

  const rows = await loadLocationStatisticsRows({
    from: normalizedFrom,
    toExclusive,
    locationIds: allowedIds,
  })

  const canManageReport = await hasUserAuthorizationCode(userId, "GERER_PROFIL")

  return (
    <AlarmsByLocationPageClient
      rows={rows}
      fromDate={format(normalizedFrom, "yyyy-MM-dd")}
      toDate={format(normalizedTo, "yyyy-MM-dd")}
      canManageReport={canManageReport}
    />
  )
}

