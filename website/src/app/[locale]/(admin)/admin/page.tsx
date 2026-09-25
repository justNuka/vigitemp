"use client"

import { useState, type ReactNode } from "react"
import { LazyMotion, domAnimation, m } from "motion/react"
import { useTranslations } from "next-intl"
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Cpu,
  DatabaseBackup,
  Globe,
  MapPin,
  Radio,
  Ruler,
  Users,
  WifiCog,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { useLicense } from "@/components/license/license-provider"
import { getLicenseEdition, isExpert, isOneOrPack } from "@/lib/license-access"
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
import { Link } from "@/i18n/navigation"
import { formatDbDateTime } from "@/lib/date-display"
import { DEFAULT_CALIBRATION_WARNING_DAYS } from "@/lib/calibration-warning-window"
import { fadeInUp, staggerContainer } from "@/lib/motion-variants"
import { cn } from "@/lib/utils"

import { AdminSystemHealthCard } from "./_components/admin-system-health-card"
import { AdminBackupLogDialog } from "./_components/admin-backup-log-dialog"
import { AdminBackupStatusSummary } from "./_components/admin-backup-status-summary"
import { AdminServiceCards } from "./_components/admin-service-cards"
import { ExpertAdminDashboard } from "./_components/expert-admin-dashboard"
import {
  AdminCardLink,
  AdminDashboardCard,
  type AdminCardTone,
} from "./_components/admin-dashboard-card"
import { AdminStatusPill } from "./_components/admin-status-pill"

type SummaryCardProps = {
  title: string
  description: string
  value?: string
  helper?: ReactNode
  href?: string
  hrefLabel?: string
  icon: LucideIcon
  tone?: AdminCardTone
  attention?: "critical" | "warning" | null
  badge?: ReactNode
  loading?: boolean
  className?: string
}

function SummaryCard({
  title,
  description,
  value,
  helper,
  href,
  hrefLabel,
  icon,
  tone = "primary",
  attention = null,
  badge,
  loading = false,
  className,
}: SummaryCardProps) {
  return (
    <AdminDashboardCard
      icon={icon}
      tone={tone}
      title={title}
      description={description}
      attention={attention}
      badge={badge}
      loading={loading}
      footer={href && hrefLabel ? <AdminCardLink href={href} label={hrefLabel} /> : undefined}
      className={className}
    >
      <p className="num text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">{value}</p>
      {helper ? <div className="mt-1 text-xs leading-4 text-muted-foreground">{helper}</div> : null}
    </AdminDashboardCard>
  )
}

const basicLinks: Array<{ key: string; href: string; icon: LucideIcon }> = [
  { key: "sondes", href: "/admin/sondes", icon: Cpu },
  { key: "modules", href: "/admin/modules", icon: WifiCog },
  { key: "actionneurs", href: "/admin/actionneurs", icon: Radio },
  { key: "groupes", href: "/admin/groupes", icon: Users },
  { key: "lieux", href: "/admin/lieux", icon: MapPin },
  { key: "sites", href: "/admin/sites", icon: Globe },
  { key: "outils", href: "/admin/outils", icon: Wrench },
]

export default function AdminDashboard() {
  const t = useTranslations("adminDashboard")
  const [isBackupLogOpen, setIsBackupLogOpen] = useState(false)
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
  const upcomingCalibrationQuery = useUpcomingCalibrationCount(!hideStandards)
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
  const upcomingCalibrationDays = upcomingCalibrationQuery.data?.days ?? DEFAULT_CALIBRATION_WARNING_DAYS

  const accessLabel = t("actions.open_page")
  const alarmsAccessLabel = `${accessLabel} (${alarmsInProgressTotal})`
  const backupSummary = backupsQuery.data?.summary ?? null

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

  const serviceRow = (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <AdminSystemHealthCard />
      <AdminServiceCards />
    </div>
  )

  if (isBasicDashboard) {
    return (
      <div className="flex min-h-full flex-col">
        <PageHeader title={t("title")} />
        <LazyMotion features={domAnimation}>
          <m.div
            className="mx-auto w-full max-w-[1680px] space-y-3 p-4 md:p-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={fadeInUp}>{serviceRow}</m.div>

            <m.div variants={fadeInUp} className="grid gap-3 xl:grid-cols-3">
              <nav
                aria-label={t("title")}
                className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)] xl:col-span-2"
              >
                <ul className="grid divide-border sm:grid-cols-2 [&>li]:border-b [&>li]:border-border sm:[&>li:nth-child(odd)]:border-r">
                  {basicLinks.map(({ key, href, icon: Icon }) => (
                    <li key={key}>
                      <Link
                        href={href as never}
                        className="group/link flex h-full items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[hsl(var(--surface-muted)/0.75)] focus-visible:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-strong))]">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-foreground">{t(`links.${key}.title`)}</span>
                          <span className="block truncate text-xs text-muted-foreground">{t(`links.${key}.description`)}</span>
                        </span>
                        <span className="text-sm text-[hsl(var(--subtle-foreground))] transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:text-[hsl(var(--primary-strong))]">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <AdminDashboardCard
                icon={DatabaseBackup}
                tone="ended"
                title={t("backup.title")}
                description={t("backup.description", { total: backupsTotal })}
                onActivate={() => setIsBackupLogOpen(true)}
                activateLabel={t("backup.log.open")}
                loading={backupsQuery.isLoading && !backupsQuery.data}
              >
                <AdminBackupStatusSummary summary={backupSummary} />
              </AdminDashboardCard>
            </m.div>
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
        <div className="mx-auto w-full max-w-[1680px] space-y-3 p-4 md:p-6">
          {serviceRow}
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
              backupSummary,
              upcomingCalibrationCount,
              upcomingCalibrationDays,
              hideStandards,
            }}
            onOpenBackupLog={() => setIsBackupLogOpen(true)}
          />
        </div>
        {backupDialog}
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t("title")} />

      <LazyMotion features={domAnimation}>
        <m.div
          className="mx-auto w-full max-w-[1680px] space-y-3 p-4 md:p-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <m.div variants={fadeInUp}>{serviceRow}</m.div>

          <m.div variants={fadeInUp} className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
            <AdminDashboardCard
              icon={AlertTriangle}
              tone="critical"
              title={t("summary.alarms_title")}
              description={t("summary.alarms_description", {
                inProgress: alarmsInProgressTotal,
                pending: alarmsPendingAckTotal,
              })}
              attention={alarmsInProgressTotal > 0 ? "critical" : null}
              badge={
                alarmsPendingAckTotal > 0 ? (
                  <AdminStatusPill tone="critical" pulse>{alarmsPendingAckTotal}</AdminStatusPill>
                ) : undefined
              }
              loading={
                (alarmsActiveCountQuery.isLoading && !alarmsActiveCountQuery.data) ||
                (alarmsResolvedCountQuery.isLoading && !alarmsResolvedCountQuery.data)
              }
              footer={<AdminCardLink href="/admin/alarmes" label={alarmsAccessLabel} />}
              className="md:col-span-2 xl:col-span-6"
            >
              <div className="flex items-end gap-3">
                <span className="num text-3xl font-semibold leading-none tracking-[-0.03em] text-[hsl(var(--status-critical))]">
                  {alarmsInProgressTotal}
                </span>
                {alarmsInProgressTotal > 0 ? (
                  <span className="alarm-beacon mb-1 h-2 w-2 rounded-full bg-[hsl(var(--status-critical))]" aria-hidden />
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md border border-[hsl(var(--status-critical)/0.18)] bg-[hsl(var(--status-critical)/0.05)] px-2.5 py-2 text-xs">
                <span className="text-muted-foreground">{t("summary.alarms_helper", { pending: alarmsPendingAckTotal })}</span>
                <span className="num rounded-full border border-[hsl(var(--status-critical)/0.25)] bg-card px-2 py-0.5 font-semibold text-[hsl(var(--status-critical))]">
                  {alarmsPendingAckTotal}
                </span>
              </div>
            </AdminDashboardCard>

            <SummaryCard
              title={t("metrology.title")}
              description={t("metrology.description", { days: upcomingCalibrationDays })}
              value={String(upcomingCalibrationCount)}
              helper={
                <span className="inline-flex items-center gap-2">
                  <span>{t("metrology.helper", { days: upcomingCalibrationDays })}</span>
                  <span className="num rounded-full border border-primary/20 bg-[hsl(var(--primary-soft))] px-2 py-0.5 font-semibold text-[hsl(var(--primary-strong))]">
                    J+{upcomingCalibrationDays}
                  </span>
                </span>
              }
              href="/admin/metrologie"
              hrefLabel={accessLabel}
              icon={Ruler}
              tone="primary"
              loading={upcomingCalibrationQuery.isLoading && !upcomingCalibrationQuery.data}
              className="xl:col-span-3"
            />

            <SummaryCard
              title={t("unassigned.title")}
              description={t("unassigned.description", { count: unassignedTotal })}
              value={String(unassignedTotal)}
              href="/admin/sondes"
              hrefLabel={accessLabel}
              icon={Cpu}
              tone={unassignedTotal > 0 ? "warning" : "neutral"}
              attention={unassignedTotal > 0 ? "warning" : null}
              loading={unassignedSensorsQuery.isLoading && !unassignedSensorsQuery.data}
              className="xl:col-span-3"
            />

            <AdminDashboardCard
              icon={DatabaseBackup}
              tone="ended"
              title={t("backup.title")}
              description={t("backup.description", { total: backupsTotal })}
              onActivate={() => setIsBackupLogOpen(true)}
              activateLabel={t("backup.log.open")}
              loading={backupsQuery.isLoading && !backupsQuery.data}
              className="md:col-span-2 xl:col-span-6 xl:row-span-2"
            >
              <AdminBackupStatusSummary summary={backupSummary} />
            </AdminDashboardCard>

            <SummaryCard
              title={t("acknowledgments.title")}
              description={t("acknowledgments.description_recent", { total: acknowledgmentsTotal, days: 7 })}
              value={String(acknowledgmentsTotal)}
              helper={`${t("acknowledgments.columns.date_time")}: ${latestAck}`}
              href="/admin/alarmes/acquittements"
              hrefLabel={accessLabel}
              icon={Clock}
              tone="warning"
              loading={acknowledgmentsQuery.isLoading && !acknowledgmentsQuery.data}
              className="xl:col-span-3"
            />

            <SummaryCard
              title={t("system_logs.title")}
              description={t("system_logs.description", { count: 50, total: systemLogsTotal })}
              value={String(systemLogsTotal)}
              helper={`${t("system_logs.columns.action")}: ${latestAuditAction}`}
              href="/admin/audit"
              hrefLabel={accessLabel}
              icon={BookOpen}
              tone="ok"
              loading={systemLogsQuery.isLoading && !systemLogsQuery.data}
              className="xl:col-span-3"
            />

            <SummaryCard
              title={t("connected_users.title")}
              description={t("connected_users.description", { total: connectedUsersTotal, max: 50 })}
              value={String(connectedUsersTotal)}
              helper={
                <div className="space-y-1">
                  <p>{t("connected_users.helper_window")}</p>
                  <p className="truncate" title={latestConnectedLabel}>
                    {t("connected_users.columns.full_name")}: {latestConnectedLabel}
                  </p>
                </div>
              }
              href="/admin/utilisateurs"
              hrefLabel={accessLabel}
              icon={Users}
              tone="primary"
              loading={connectedUsersQuery.isLoading && !connectedUsersQuery.data}
              className="md:col-span-2 xl:col-span-6"
            />
          </m.div>
        </m.div>
      </LazyMotion>

      {backupDialog}
    </div>
  )
}
