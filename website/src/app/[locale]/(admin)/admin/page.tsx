"use client"

import { useMemo } from "react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useAppTimezone } from "@/components/timezone-provider"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Cpu,
  Database,
  Globe,
  MapPin,
  Radio,
  Ruler,
  Users,
  WifiCog,
  Wrench,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { DashboardLinkCard } from "@/components/dashboard-link-card"
import { useLicense } from "@/components/license/license-provider"
import { getLicenseEdition, isExpert, isOneOrPack } from "@/lib/license-access"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useAcknowledgments,
  useActiveAlarms,
  useAlarmCount,
  useBackups,
  useConnectedUsers,
  useSystemLogs,
} from "@/hooks/useAdminData"
import { useUnassignedSensors } from "@/hooks/useSensors"

type SummaryCardProps = {
  title: string
  description: string
  value: string
  href: string
  hrefLabel: string
  icon: React.ReactNode
  badge?: React.ReactNode
  helper?: string
}

function SummaryCard({
  title,
  description,
  value,
  href,
  hrefLabel,
  icon,
  badge,
  helper,
}: SummaryCardProps) {
  return (
    <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {helper ? <p className="text-sm text-muted-foreground">{helper}</p> : null}
        <Link
          href={href as any}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const t = useTranslations("adminDashboard")
  const locale = useLocale()
  const timezone = useAppTimezone()
  const { license } = useLicense()

  const edition = getLicenseEdition(license, "standard")
  const isBasicDashboard = isOneOrPack(edition)
  const isExpertEdition = isExpert(edition)
  const hideStandards = isBasicDashboard

  const connectedUsersQuery = useConnectedUsers(1)
  const activeAlarmsQuery = useActiveAlarms(1)
  const alarmsActiveCountQuery = useAlarmCount("active")
  const alarmsResolvedCountQuery = useAlarmCount("resolved")
  const acknowledgmentsQuery = useAcknowledgments(1)
  const systemLogsQuery = useSystemLogs()
  const backupsQuery = useBackups()
  const unassignedSensorsQuery = useUnassignedSensors({ page: 1, limit: 20 })

  const accessLabel = locale === "fr" ? "Accéder à la page" : "Open page"

  const activeAlarmsTotal = activeAlarmsQuery.data?.pagination.total || 0
  const alarmsInProgressTotal = alarmsActiveCountQuery.data?.pagination.total ?? activeAlarmsTotal
  const alarmsPendingAckTotal = alarmsResolvedCountQuery.data?.pagination.total ?? 0
  const acknowledgmentsTotal = acknowledgmentsQuery.data?.pagination.total || 0
  const connectedUsersTotal = connectedUsersQuery.data?.pagination.total || 0
  const systemLogsTotal = systemLogsQuery.data?.pagination.total || 0
  const unassignedTotal = unassignedSensorsQuery.data?.pagination.total || 0
  const backupsTotal = backupsQuery.data?.length || 0

  const lastBackupDate = (backupsQuery.data as any)?.[0]?.dateHeure
  const lastBackupLabel = lastBackupDate
    ? new Date(lastBackupDate).toLocaleString(locale, { timeZone: timezone })
    : t("backup.last.none")

  const latestAck = acknowledgmentsQuery.data?.data?.[0]?.dateHeure || "-"
  const latestAuditAction = systemLogsQuery.data?.data?.[0]?.action || "-"
  const latestConnected = connectedUsersQuery.data?.data?.[0]
  const latestConnectedLabel = latestConnected
    ? `${latestConnected.prenom || ""} ${latestConnected.nom || ""}`.trim()
    : "-"

  const isInitialLoading = useMemo(() => {
    return (
      connectedUsersQuery.isLoading &&
      activeAlarmsQuery.isLoading &&
      alarmsActiveCountQuery.isLoading &&
      alarmsResolvedCountQuery.isLoading &&
      acknowledgmentsQuery.isLoading &&
      systemLogsQuery.isLoading &&
      backupsQuery.isLoading &&
      unassignedSensorsQuery.isLoading
    )
  }, [
    acknowledgmentsQuery.isLoading,
    activeAlarmsQuery.isLoading,
    alarmsActiveCountQuery.isLoading,
    alarmsResolvedCountQuery.isLoading,
    backupsQuery.isLoading,
    connectedUsersQuery.isLoading,
    systemLogsQuery.isLoading,
    unassignedSensorsQuery.isLoading,
  ])

  if (isBasicDashboard) {
    const linkCards = [
      {
        key: "sondes",
        href: `/admin/sondes`,
        icon: <Cpu className="h-5 w-5" />,
      },
      {
        key: "modules",
        href: `/admin/modules`,
        icon: <WifiCog className="h-5 w-5" />,
      },
      {
        key: "actionneurs",
        href: `/admin/actionneurs`,
        icon: <Radio className="h-5 w-5" />,
      },
      {
        key: "groupes",
        href: `/admin/groupes`,
        icon: <Users className="h-5 w-5" />,
      },
      {
        key: "lieux",
        href: `/admin/lieux`,
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        key: "sites",
        href: `/admin/sites`,
        icon: <Globe className="h-5 w-5" />,
      },
      {
        key: "outils",
        href: `/admin/outils`,
        icon: <Wrench className="h-5 w-5" />,
      },
    ]

    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t("title")} />
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {linkCards.map((card) => (
            <DashboardLinkCard
              key={card.key}
              title={t(`links.${card.key}.title`)}
              description={t(`links.${card.key}.description`)}
              href={card.href}
              icon={card.icon}
            />
          ))}
        </div>
      </div>
    )
  }


  if (isExpertEdition) {
    const expertTitle = locale === "fr" ? "Dashboard admin licence expert en construction" : "Expert admin dashboard under construction"
    const expertDescription =
      locale === "fr"
        ? "Le dashboard admin Expert sera disponible dans une prochaine version."
        : "The Expert admin dashboard will be available in a future release."

    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={expertTitle} description={expertDescription} />
        <div className="p-6">
          <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardContent className="p-6 text-sm text-muted-foreground">{expertDescription}</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t("title")} />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title={locale === "fr" ? "Alarmes" : "Alarms"}
          description={
            locale === "fr"
              ? `En cours: ${alarmsInProgressTotal} ? En attente d'acquittement: ${alarmsPendingAckTotal}`
              : `In progress: ${alarmsInProgressTotal} ? Pending acknowledgement: ${alarmsPendingAckTotal}`
          }
          value={String(alarmsInProgressTotal)}
          helper={
            locale === "fr"
              ? `Alarmes en attente d'acquittement: ${alarmsPendingAckTotal}`
              : `Alarms pending acknowledgement: ${alarmsPendingAckTotal}`
          }
          href={`/admin/alarmes`}
          hrefLabel={accessLabel}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          badge={
            alarmsPendingAckTotal > 0 ? (
              <Badge variant="destructive">{alarmsPendingAckTotal}</Badge>
            ) : undefined
          }
        />

        <SummaryCard
          title={t("acknowledgments.title")}
          description={t("acknowledgments.description", { total: acknowledgmentsTotal, max: 50 })}
          value={String(acknowledgmentsTotal)}
          helper={`${t("acknowledgments.columns.date_time")}: ${latestAck}`}
          href={`/admin/alarmes`}
          hrefLabel={accessLabel}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />

        <SummaryCard
          title={t("connected_users.title")}
          description={t("connected_users.description", { total: connectedUsersTotal, max: 50 })}
          value={String(connectedUsersTotal)}
          helper={`${t("connected_users.columns.full_name")}: ${latestConnectedLabel}`}
          href={`/admin/utilisateurs`}
          hrefLabel={accessLabel}
          icon={<Users className="h-5 w-5 text-sky-600" />}
        />

        <SummaryCard
          title={t("system_logs.title")}
          description={t("system_logs.description", { count: 50, total: systemLogsTotal })}
          value={String(systemLogsTotal)}
          helper={`${t("system_logs.columns.action")}: ${latestAuditAction}`}
          href={`/admin/audit`}
          hrefLabel={accessLabel}
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
        />

        <SummaryCard
          title={t("backup.title")}
          description={t("backup.description")}
          value={String(backupsTotal)}
          helper={`${t("backup.last.label")}: ${lastBackupLabel}`}
          href={`/admin/outils`}
          hrefLabel={accessLabel}
          icon={<Database className="h-5 w-5 text-violet-600" />}
        />

        <SummaryCard
          title={t("unassigned.title")}
          description={t("unassigned.description", { count: unassignedTotal })}
          value={String(unassignedTotal)}
          href={`/admin/sondes`}
          hrefLabel={accessLabel}
          icon={<Cpu className="h-5 w-5 text-slate-600" />}
        />

        {!hideStandards ? (
          <SummaryCard
            title={t("links.etalons.title")}
            description={t("links.etalons.description")}
            value="-"
            href={`/admin/etalons`}
            hrefLabel={accessLabel}
            icon={<Ruler className="h-5 w-5 text-cyan-600" />}
          />
        ) : null}
      </div>
    </div>
  )
}
