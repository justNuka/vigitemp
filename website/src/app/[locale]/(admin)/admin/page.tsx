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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useAcknowledgments,
  useActiveAlarms,
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

  const edition = (license?.edition || "standard").trim().toLowerCase()
  const isOne = edition === "one"
  const isPack = edition === "pack"
  const hideStandards = isOne || isPack

  const connectedUsersQuery = useConnectedUsers(1)
  const activeAlarmsQuery = useActiveAlarms(1)
  const acknowledgmentsQuery = useAcknowledgments(1)
  const systemLogsQuery = useSystemLogs()
  const backupsQuery = useBackups()
  const unassignedSensorsQuery = useUnassignedSensors({ page: 1, limit: 20 })

  const accessLabel = locale === "fr" ? "Accéder à la page" : "Open page"

  const activeAlarmsTotal = activeAlarmsQuery.data?.pagination.total || 0
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
      acknowledgmentsQuery.isLoading &&
      systemLogsQuery.isLoading &&
      backupsQuery.isLoading &&
      unassignedSensorsQuery.isLoading
    )
  }, [
    acknowledgmentsQuery.isLoading,
    activeAlarmsQuery.isLoading,
    backupsQuery.isLoading,
    connectedUsersQuery.isLoading,
    systemLogsQuery.isLoading,
    unassignedSensorsQuery.isLoading,
  ])

  if (isOne) {
    const linkCards = [
      {
        key: "sondes",
        href: `/${locale}/admin/sondes`,
        icon: <Cpu className="h-5 w-5" />,
      },
      {
        key: "modules",
        href: `/${locale}/admin/modules`,
        icon: <WifiCog className="h-5 w-5" />,
      },
      {
        key: "actionneurs",
        href: `/${locale}/admin/actionneurs`,
        icon: <Radio className="h-5 w-5" />,
      },
      {
        key: "groupes",
        href: `/${locale}/admin/groupes`,
        icon: <Users className="h-5 w-5" />,
      },
      {
        key: "lieux",
        href: `/${locale}/admin/lieux`,
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        key: "sites",
        href: `/${locale}/admin/sites`,
        icon: <Globe className="h-5 w-5" />,
      },
      {
        key: "outils",
        href: `/${locale}/admin/outils`,
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
          title={t("active_alarms.title")}
          description={t("active_alarms.description", { total: activeAlarmsTotal, max: 50 })}
          value={String(activeAlarmsTotal)}
          helper={activeAlarmsTotal > 0 ? t("updating") : undefined}
          href={`/${locale}/admin/alarmes`}
          hrefLabel={accessLabel}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          badge={
            activeAlarmsTotal > 0 ? (
              <Badge variant="destructive">{activeAlarmsTotal}</Badge>
            ) : undefined
          }
        />

        <SummaryCard
          title={t("acknowledgments.title")}
          description={t("acknowledgments.description", { total: acknowledgmentsTotal, max: 50 })}
          value={String(acknowledgmentsTotal)}
          helper={`${t("acknowledgments.columns.date_time")}: ${latestAck}`}
          href={`/${locale}/admin/alarmes`}
          hrefLabel={accessLabel}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />

        <SummaryCard
          title={t("connected_users.title")}
          description={t("connected_users.description", { total: connectedUsersTotal, max: 50 })}
          value={String(connectedUsersTotal)}
          helper={`${t("connected_users.columns.full_name")}: ${latestConnectedLabel}`}
          href={`/${locale}/admin/utilisateurs`}
          hrefLabel={accessLabel}
          icon={<Users className="h-5 w-5 text-sky-600" />}
        />

        <SummaryCard
          title={t("system_logs.title")}
          description={t("system_logs.description", { count: 50, total: systemLogsTotal })}
          value={String(systemLogsTotal)}
          helper={`${t("system_logs.columns.action")}: ${latestAuditAction}`}
          href={`/${locale}/admin/audit`}
          hrefLabel={accessLabel}
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
        />

        <SummaryCard
          title={t("backup.title")}
          description={t("backup.description")}
          value={String(backupsTotal)}
          helper={`${t("backup.last.label")}: ${lastBackupLabel}`}
          href={`/${locale}/admin/outils`}
          hrefLabel={accessLabel}
          icon={<Database className="h-5 w-5 text-violet-600" />}
        />

        <SummaryCard
          title={t("unassigned.title")}
          description={t("unassigned.description", { count: unassignedTotal })}
          value={String(unassignedTotal)}
          href={`/${locale}/admin/sondes`}
          hrefLabel={accessLabel}
          icon={<Cpu className="h-5 w-5 text-slate-600" />}
        />

        {!hideStandards ? (
          <SummaryCard
            title={t("links.etalons.title")}
            description={t("links.etalons.description")}
            value="-"
            href={`/${locale}/admin/etalons`}
            hrefLabel={accessLabel}
            icon={<Ruler className="h-5 w-5 text-cyan-600" />}
          />
        ) : null}
      </div>
    </div>
  )
}
