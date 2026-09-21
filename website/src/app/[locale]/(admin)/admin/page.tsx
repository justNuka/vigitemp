"use client"

import { useMemo, useState } from "react"
import { LazyMotion, domAnimation, m } from "motion/react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useAppTimezone } from "@/components/timezone-provider"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Cpu,
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
  useAuditLogs,
  useBackups,
  useConnectedUsers,
  useUpcomingCalibrationCount,
} from "@/hooks/useAdminData"
import { useUnassignedSensors } from "@/hooks/useSensors"
import { AdminSystemHealthCard } from "./_components/admin-system-health-card"
import { AdminBackupLogDialog } from "./_components/admin-backup-log-dialog"
import { AdminServiceCards } from "./_components/admin-service-cards"
import { ExpertAdminDashboard } from "./_components/expert-admin-dashboard"
import { staggerContainer, fadeInUp } from "@/lib/motion-variants"
import { formatDbDateTime } from "@/lib/date-display"

type SummaryCardProps = {
  title: string
  description: string
  value: string
  href?: string
  hrefLabel?: string
  icon: React.ReactNode
  badge?: React.ReactNode
  helper?: string
  onClick?: () => void
  ariaLabel?: string
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
  onClick,
  ariaLabel,
}: SummaryCardProps) {
  return (
    <m.div variants={fadeInUp} className="h-full">
      <Card
        className={`card-interactive flex h-full flex-col overflow-hidden border-border/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/95 dark:shadow-black/20 ${onClick ? "cursor-pointer" : ""}`}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? ariaLabel ?? title : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
      >
        <CardHeader className="border-b border-border/50 bg-white/90 pb-2 dark:bg-card/90">
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
        <CardContent className="flex flex-1 flex-col space-y-2 pt-4">
          <div className="text-3xl font-bold tabular-nums">{value}</div>
          {helper ? <p className="whitespace-pre-line break-all text-sm text-muted-foreground">{helper}</p> : null}
          {href && hrefLabel ? (
            <Link
              href={href as any}
              className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {hrefLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </m.div>
  )
}

export default function AdminDashboard() {
  const t = useTranslations("adminDashboard")
  const [isBackupLogOpen, setIsBackupLogOpen] = useState(false)
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
  const acknowledgmentsQuery = useAcknowledgments(1, 7)
  const systemLogsQuery = useAuditLogs()
  const backupsQuery = useBackups()
  const upcomingCalibrationQuery = useUpcomingCalibrationCount(15, !hideStandards)
  const unassignedSensorsQuery = useUnassignedSensors({ page: 1, limit: 20 })

  const activeAlarmsTotal = activeAlarmsQuery.data?.pagination.total || 0
  const alarmsInProgressTotal = alarmsActiveCountQuery.data?.pagination.total ?? activeAlarmsTotal
  const alarmsPendingAckTotal = alarmsResolvedCountQuery.data?.pagination.total ?? 0
  const acknowledgmentsTotal = acknowledgmentsQuery.data?.pagination.total || 0
  const connectedUsersTotal = connectedUsersQuery.data?.pagination.total || 0
  const systemLogsTotal = systemLogsQuery.data?.pagination.total || 0
  const unassignedTotal = unassignedSensorsQuery.data?.pagination.total || 0
  const backupsTotal = backupsQuery.data?.summary.archiveCount ?? 0
  const upcomingCalibrationCount = upcomingCalibrationQuery.data?.count ?? 0
  const accessLabel = t("actions.open_page")
  const alarmsAccessLabel = `${accessLabel} (${alarmsInProgressTotal})`
  const backupStoragePath = backupsQuery.data?.summary.storagePath ?? "-"
  const backupLogFilePath = backupsQuery.data?.summary.logFilePath ?? "-"
  const latestBackup = backupsQuery.data?.summary.latestRun ?? backupsQuery.data?.data?.[0]
  const lastBackupLabel = latestBackup?.dateHeure
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: timezone,
      }).format(new Date(latestBackup.dateHeure))
    : t("backup.last.none")
  const latestBackupStatus = latestBackup
    ? t(`backups.status.${latestBackup.etat}`)
    : t("backup.last.none")
  const latestBackupBadge = latestBackup ? (
    <Badge
      variant={
        latestBackup.etat === "success"
          ? "default"
          : latestBackup.etat === "failed"
            ? "destructive"
            : "secondary"
      }
      className={
        latestBackup.etat === "success"
          ? "bg-emerald-600 text-white hover:bg-emerald-600"
          : latestBackup.etat === "in_progress"
            ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
            : undefined
      }
    >
      {latestBackupStatus}
    </Badge>
  ) : undefined

  const latestAckRaw = acknowledgmentsQuery.data?.data?.[0]?.dateHeure || null
  const latestAck = latestAckRaw ? formatDbDateTime(latestAckRaw, { format: "dateTimeSeconds" }) : "-"
  const latestAuditAction = systemLogsQuery.data?.data?.[0]?.action || "-"
  const latestConnectedUsers = connectedUsersQuery.data?.data?.slice(0, 3) ?? []
  const latestConnectedLabel =
    latestConnectedUsers.length > 0
      ? latestConnectedUsers
          .map((user) => `${user.prenom || ""} ${user.nom || ""}`.trim() || user.login)
          .join(", ")
      : "-"

  const backupDialog = (
    <AdminBackupLogDialog
      open={isBackupLogOpen}
      onOpenChange={setIsBackupLogOpen}
      summary={backupsQuery.data?.summary}
    />
  )

  const isInitialLoading = useMemo(() => {
    return (
      connectedUsersQuery.isLoading &&
      activeAlarmsQuery.isLoading &&
      alarmsActiveCountQuery.isLoading &&
      alarmsResolvedCountQuery.isLoading &&
      acknowledgmentsQuery.isLoading &&
      systemLogsQuery.isLoading &&
      backupsQuery.isLoading &&
      unassignedSensorsQuery.isLoading &&
      (hideStandards || upcomingCalibrationQuery.isLoading)
    )
  }, [
    acknowledgmentsQuery.isLoading,
    activeAlarmsQuery.isLoading,
    alarmsActiveCountQuery.isLoading,
    alarmsResolvedCountQuery.isLoading,
    connectedUsersQuery.isLoading,
    systemLogsQuery.isLoading,
    backupsQuery.isLoading,
    hideStandards,
    unassignedSensorsQuery.isLoading,
    upcomingCalibrationQuery.isLoading,
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
        <LazyMotion features={domAnimation}>
          <m.div
            className="grid auto-rows-fr gap-4 p-6 md:grid-cols-2 xl:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {linkCards.map((card) => (
              <DashboardLinkCard
                key={card.key}
                title={t(`links.${card.key}.title`)}
                description={t(`links.${card.key}.description`)}
                href={card.href}
                icon={card.icon}
              />
            ))}

            <AdminSystemHealthCard />
            <AdminServiceCards />

            <SummaryCard
              title={t("backup.title")}
              description={t("backup.description", { total: backupsTotal })}
              value={latestBackupStatus}
              helper={`${t("backup.last.label")}: ${lastBackupLabel}\n${backupStoragePath}`}
              icon={<BookOpen className="h-5 w-5 text-violet-600" />}
              badge={latestBackupBadge}
              onClick={() => setIsBackupLogOpen(true)}
              ariaLabel={t("backup.log.open")}
            />
          </m.div>
        </LazyMotion>
        {backupDialog}
      </div>
    )
  }

  if (isExpertEdition) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t("title")} />
        <div className="grid auto-rows-fr gap-4 px-6 pt-6 md:grid-cols-2 xl:grid-cols-3">
          <AdminSystemHealthCard />
          <AdminServiceCards />
        </div>
        <ExpertAdminDashboard
          metrics={{
            alarmsInProgressTotal,
            alarmsPendingAckTotal,
            acknowledgmentsTotal,
            connectedUsersTotal,
            systemLogsTotal,
            backupsTotal,
            unassignedTotal,
            latestAck,
            latestAuditAction,
            latestConnectedLabel,
            lastBackupLabel,
            latestBackupStatus,
            latestBackupEtat: latestBackup?.etat ?? null,
            backupStoragePath,
            backupLogFilePath,
            upcomingCalibrationCount,
            hideStandards,
          }}
          onOpenBackupLog={() => setIsBackupLogOpen(true)}
        />
        {backupDialog}
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t("title")} />
        <div className="grid auto-rows-fr gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl h-40 animate-shimmer" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t("title")} />

      <LazyMotion features={domAnimation}>
        <m.div
          className="grid auto-rows-fr gap-4 p-6 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AdminSystemHealthCard />
          <AdminServiceCards />

          <SummaryCard
            title={t("summary.alarms_title")}
            description={t("summary.alarms_description", {
              inProgress: alarmsInProgressTotal,
              pending: alarmsPendingAckTotal,
            })}
            value={String(alarmsInProgressTotal)}
            helper={t("summary.alarms_helper", { pending: alarmsPendingAckTotal })}
            href={`/admin/alarmes`}
            hrefLabel={alarmsAccessLabel}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            badge={
              alarmsPendingAckTotal > 0 ? (
                <Badge variant="destructive">{alarmsPendingAckTotal}</Badge>
              ) : undefined
            }
          />

          <SummaryCard
            title={t("acknowledgments.title")}
            description={t("acknowledgments.description_recent", { total: acknowledgmentsTotal, days: 7 })}
            value={String(acknowledgmentsTotal)}
            helper={`${t("acknowledgments.columns.date_time")}: ${latestAck}`}
            href={`/admin/alarmes/acquittements`}
            hrefLabel={accessLabel}
            icon={<Clock className="h-5 w-5 text-amber-600" />}
          />

          <SummaryCard
            title={t("connected_users.title")}
            description={t("connected_users.description", { total: connectedUsersTotal, max: 50 })}
            value={String(connectedUsersTotal)}
            helper={`${t("connected_users.helper_window")}\n${t("connected_users.columns.full_name")}: ${latestConnectedLabel}`}
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
            description={t("backup.description", { total: backupsTotal })}
            value={latestBackupStatus}
            helper={`${t("backup.last.label")}: ${lastBackupLabel}\n${backupStoragePath}`}
            icon={<BookOpen className="h-5 w-5 text-violet-600" />}
            badge={latestBackupBadge}
            onClick={() => setIsBackupLogOpen(true)}
            ariaLabel={t("backup.log.open")}
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
              title={t("metrology.title")}
              description={t("metrology.description", { days: 15 })}
              value={String(upcomingCalibrationCount)}
              helper={t("metrology.helper", { days: 15 })}
              href={`/admin/metrologie`}
              hrefLabel={accessLabel}
              icon={<Ruler className="h-5 w-5 text-cyan-600" />}
            />
          ) : null}
        </m.div>
      </LazyMotion>
      {backupDialog}
    </div>
  )
}
