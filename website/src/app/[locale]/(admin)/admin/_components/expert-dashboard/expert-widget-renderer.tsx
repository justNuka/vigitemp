import { AlertTriangle, BookOpen, Clock, Cpu, Ruler, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ExpertWidgetCard } from "./expert-widget-card"
import type { Metrics, WidgetId } from "./expert-dashboard-types"

type Translate = (key: string, values?: Record<string, string | number>) => string

function formatLocalDateForQuery(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function renderExpertWidget({
  id,
  locale,
  metrics,
  accessLabel,
  t,
  onOpenBackupLog,
}: {
  id: WidgetId
  locale: string
  metrics: Metrics
  accessLabel: string
  t: Translate
  onOpenBackupLog?: () => void
}) {
  if (id === "alarms") {
    return (
      <ExpertWidgetCard
        title={t("summary.alarms_title")}
        description={t("summary.alarms_description", {
          inProgress: metrics.alarmsInProgressTotal,
          pending: metrics.alarmsPendingAckTotal,
        })}
        value={String(metrics.alarmsInProgressTotal)}
        helper={t("summary.alarms_helper", { pending: metrics.alarmsPendingAckTotal })}
        href="/admin/alarmes"
        hrefLabel={accessLabel}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        badge={metrics.alarmsPendingAckTotal > 0 ? <Badge variant="destructive">{metrics.alarmsPendingAckTotal}</Badge> : undefined}
      />
    )
  }

  if (id === "acknowledgments") {
    return (
      <ExpertWidgetCard
        title={t("acknowledgments.title")}
        description={t("acknowledgments.description_recent", { total: metrics.acknowledgmentsTotal, days: 7 })}
        value={String(metrics.acknowledgmentsTotal)}
        helper={`${t("acknowledgments.columns.date_time")}: ${metrics.latestAck}`}
        href="/admin/alarmes/acquittements"
        hrefLabel={accessLabel}
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />
    )
  }

  if (id === "connectedUsers") {
    return (
      <ExpertWidgetCard
        title={t("connected_users.title")}
        description={t("connected_users.description", { total: metrics.connectedUsersTotal, max: 50 })}
        value={String(metrics.connectedUsersTotal)}
        helper={`${t("connected_users.helper_window")}\n${t("connected_users.columns.full_name")}: ${metrics.latestConnectedLabel}`}
        href="/admin/utilisateurs"
        hrefLabel={accessLabel}
        icon={<Users className="h-5 w-5 text-sky-600" />}
      />
    )
  }

  if (id === "systemLogs") {
    const today = formatLocalDateForQuery(new Date())
    const auditHref = `/admin/audit?dateFrom=${today}&dateTo=${today}`

    return (
      <ExpertWidgetCard
        title={t("system_logs.title")}
        description={t("system_logs.description", { count: 50, total: metrics.systemLogsTotal })}
        value={String(metrics.systemLogsTotal)}
        helper={`${t("system_logs.columns.action")}: ${metrics.latestAuditAction}`}
        href={auditHref}
        hrefLabel={accessLabel}
        icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
      />
    )
  }

  if (id === "backups") {
    const backupBadge = metrics.latestBackupEtat ? (
      <Badge
        variant={
          metrics.latestBackupEtat === "success"
            ? "default"
            : metrics.latestBackupEtat === "failed"
              ? "destructive"
              : "secondary"
        }
        className={
          metrics.latestBackupEtat === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-600"
            : metrics.latestBackupEtat === "in_progress"
              ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
              : undefined
        }
      >
        {metrics.latestBackupStatus}
      </Badge>
    ) : undefined

    return (
      <ExpertWidgetCard
        title={t("backup.title")}
        description={t("backup.description", { total: metrics.backupsTotal })}
        value={metrics.latestBackupStatus}
        helper={`${t("backup.last.label")}: ${metrics.lastBackupLabel}\n${metrics.backupStoragePath}`}
        icon={<BookOpen className="h-5 w-5 text-violet-600" />}
        badge={backupBadge}
        onClick={onOpenBackupLog}
        ariaLabel={t("backup.log.open")}
      />
    )
  }

  if (id === "unassigned") {
    return (
      <ExpertWidgetCard
        title={t("unassigned.title")}
        description={t("unassigned.description", { count: metrics.unassignedTotal })}
        value={String(metrics.unassignedTotal)}
        href="/admin/sondes"
        hrefLabel={accessLabel}
        icon={<Cpu className="h-5 w-5 text-slate-600" />}
      />
    )
  }

  return (
    <ExpertWidgetCard
      title={t("metrology.title")}
      description={t("metrology.description", { days: 15 })}
      value={String(metrics.upcomingCalibrationCount)}
      helper={t("metrology.helper", { days: 15 })}
      href="/admin/metrologie"
      hrefLabel={accessLabel}
      icon={<Ruler className="h-5 w-5 text-cyan-600" />}
    />
  )
}
