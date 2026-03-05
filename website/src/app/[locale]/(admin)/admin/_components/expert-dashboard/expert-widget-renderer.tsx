import { AlertTriangle, BookOpen, Clock, Cpu, Database, Ruler, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ExpertWidgetCard } from "./expert-widget-card"
import type { Metrics, WidgetId } from "./expert-dashboard-types"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function renderExpertWidget({
  id,
  locale,
  metrics,
  accessLabel,
  t,
}: {
  id: WidgetId
  locale: string
  metrics: Metrics
  accessLabel: string
  t: Translate
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
        description={t("acknowledgments.description", { total: metrics.acknowledgmentsTotal, max: 50 })}
        value={String(metrics.acknowledgmentsTotal)}
        helper={`${t("acknowledgments.columns.date_time")}: ${metrics.latestAck}`}
        href="/admin/alarmes"
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
        helper={`${t("connected_users.columns.full_name")}: ${metrics.latestConnectedLabel}`}
        href="/admin/utilisateurs"
        hrefLabel={accessLabel}
        icon={<Users className="h-5 w-5 text-sky-600" />}
      />
    )
  }

  if (id === "systemLogs") {
    return (
      <ExpertWidgetCard
        title={t("system_logs.title")}
        description={t("system_logs.description", { count: 50, total: metrics.systemLogsTotal })}
        value={String(metrics.systemLogsTotal)}
        helper={`${t("system_logs.columns.action")}: ${metrics.latestAuditAction}`}
        href="/admin/audit"
        hrefLabel={accessLabel}
        icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
      />
    )
  }

  if (id === "backups") {
    return (
      <ExpertWidgetCard
        title={t("backup.title")}
        description={t("backup.description")}
        value={String(metrics.backupsTotal)}
        helper={`${t("backup.last.label")}: ${metrics.lastBackupLabel}`}
        href="/admin/outils"
        hrefLabel={accessLabel}
        icon={<Database className="h-5 w-5 text-violet-600" />}
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
      title={t("links.etalons.title")}
      description={t("links.etalons.description")}
      value="-"
      href="/admin/etalons"
      hrefLabel={accessLabel}
      icon={<Ruler className="h-5 w-5 text-cyan-600" />}
    />
  )
}
