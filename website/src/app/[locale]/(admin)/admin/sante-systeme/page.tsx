"use client"

import {
  Activity,
  Database,
  Globe2,
  HardDrive,
  Mail,
  MessagesSquare,
  MonitorCog,
  RefreshCw,
  Server,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { PageHeader } from "@/components/page-header"
import { useAppTimezone } from "@/components/timezone-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBackups } from "@/hooks/useAdminData"
import { useSystemEmailAudit, useSystemHealth } from "@/hooks/useSystemHealth"
import { formatDbDateTime } from "@/lib/date-display"
import { formatNumber } from "@/lib/number-display"
import { getSystemHealthOverview } from "@/lib/system-health-overview"
import type { HealthState, SystemHealthOverallState } from "@/types/system-health"

import { SystemHealthStatusBadge } from "../_components/system-health-status-badge"

type Detail = {
  label: string
  value: string
}

function ServiceCard({
  icon,
  title,
  description,
  status,
  statusLabel,
  details,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: HealthState
  statusLabel: string
  details: Detail[]
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <SystemHealthStatusBadge status={status} label={statusLabel} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-start justify-between gap-4 border-t border-border/40 pt-2 first:border-t-0 first:pt-0">
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="max-w-[65%] break-words text-right font-medium">{detail.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function formatInstant(value: string | null | undefined, locale: string, timeZone: string | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone,
  }).format(parsed)
}

function EmailAuditStatusBadge({
  status,
  label,
}: {
  status: "queued" | "sending" | "sent" | "failed" | "skipped" | "unknown"
  label: string
}) {
  const className =
    status === "sent"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "failed"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : status === "queued" || status === "sending"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300"

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

function formatDuration(
  seconds: number | null | undefined,
  locale: string,
  t: ReturnType<typeof useTranslations>,
) {
  if (!Number.isFinite(seconds)) return "—"

  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0))
  const days = Math.floor(safeSeconds / 86_400)
  const hours = Math.floor((safeSeconds % 86_400) / 3_600)
  const minutes = Math.floor((safeSeconds % 3_600) / 60)

  if (days > 0) {
    return t("runtime.duration.days", {
      days: formatNumber(days, { decimals: 0, locale }),
      hours: formatNumber(hours, { decimals: 0, locale }),
    })
  }
  if (hours > 0) {
    return t("runtime.duration.hours", {
      hours: formatNumber(hours, { decimals: 0, locale }),
      minutes: formatNumber(minutes, { decimals: 0, locale }),
    })
  }
  if (minutes > 0) {
    return t("runtime.duration.minutes", {
      minutes: formatNumber(minutes, { decimals: 0, locale }),
    })
  }
  return t("runtime.duration.seconds", {
    seconds: formatNumber(safeSeconds, { decimals: 0, locale }),
  })
}

export default function SystemHealthPage() {
  const t = useTranslations("systemHealth")
  const locale = useLocale()
  const timeZone = useAppTimezone()
  const healthQuery = useSystemHealth()
  const backupsQuery = useBackups()
  const emailAuditQuery = useSystemEmailAudit(50)
  const health = healthQuery.data
  const overview = health ? getSystemHealthOverview(health) : null

  const overallStatus: SystemHealthOverallState = healthQuery.isError
    ? "error"
    : overview?.status ?? "unknown"
  const overallLabel = healthQuery.isLoading
    ? t("status.loading")
    : t(`status.${overallStatus}`)
  const serviceStatus = (status: HealthState) => t(`service_status.${status}`)

  const latestBackup = backupsQuery.data?.summary.latestRun ?? backupsQuery.data?.data?.[0] ?? null
  const backupStatus = latestBackup?.etat ?? null
  const backupStatusLabel = backupStatus
    ? t(`backup.status.${backupStatus}`)
    : backupsQuery.isError
      ? t("backup.status.unavailable")
      : t("backup.status.none")

  const isRefreshing =
    healthQuery.isFetching || backupsQuery.isFetching || emailAuditQuery.isFetching

  const refreshAll = () => {
    void Promise.all([
      healthQuery.refetch(),
      backupsQuery.refetch(),
      emailAuditQuery.refetch(),
    ])
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 p-6">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{t("summary.title")}</h2>
                  <SystemHealthStatusBadge status={overallStatus} label={overallLabel} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {overview
                    ? t("summary.available", { ok: overview.ok, total: overview.total })
                    : t("summary.unavailable")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("summary.checked_at")}: {formatInstant(health?.checkedAt, locale, timeZone)}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={refreshAll}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {t("actions.refresh")}
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">{t("services.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("services.description")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ServiceCard
              icon={<Globe2 className="h-5 w-5 text-sky-600" />}
              title={t("services.web.title")}
              description={t("services.web.description")}
              status={health?.services.web.status ?? "unknown"}
              statusLabel={serviceStatus(health?.services.web.status ?? "unknown")}
              details={[
                { label: t("labels.version"), value: health?.services.web.version ?? "—" },
              ]}
            />

            <ServiceCard
              icon={<Server className="h-5 w-5 text-indigo-600" />}
              title={t("services.server.title")}
              description={t("services.server.description")}
              status={health?.services.server.status ?? "unknown"}
              statusLabel={serviceStatus(health?.services.server.status ?? "unknown")}
              details={[
                {
                  label: t("labels.configuration"),
                  value: health?.services.server.configured ? t("labels.configured") : t("labels.not_configured"),
                },
                { label: t("labels.version"), value: health?.services.server.version ?? "—" },
              ]}
            />

            <ServiceCard
              icon={<Database className="h-5 w-5 text-emerald-600" />}
              title={t("services.db_main.title")}
              description={t("services.db_main.description")}
              status={health?.services.dbMain.status ?? "unknown"}
              statusLabel={serviceStatus(health?.services.dbMain.status ?? "unknown")}
              details={[
                {
                  label: t("labels.provider"),
                  value: health ? t(`runtime.provider.${health.runtime.databaseProvider}`) : "—",
                },
              ]}
            />

            <ServiceCard
              icon={<Database className="h-5 w-5 text-cyan-600" />}
              title={t("services.db_measure.title")}
              description={t("services.db_measure.description")}
              status={health?.services.dbMesure.status ?? "unknown"}
              statusLabel={serviceStatus(health?.services.dbMesure.status ?? "unknown")}
              details={[
                {
                  label: t("labels.provider"),
                  value: health ? t(`runtime.provider.${health.runtime.databaseProvider}`) : "—",
                },
              ]}
            />

            <ServiceCard
              icon={<MessagesSquare className="h-5 w-5 text-violet-600" />}
              title={t("services.db_chat.title")}
              description={t("services.db_chat.description")}
              status={health?.services.dbChat.status ?? "unknown"}
              statusLabel={serviceStatus(health?.services.dbChat.status ?? "unknown")}
              details={[
                {
                  label: t("labels.configuration"),
                  value: health?.services.dbChat.configured ? t("labels.configured") : t("labels.not_configured"),
                },
              ]}
            />
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MonitorCog className="h-5 w-5 text-slate-600" />
                {t("runtime.title")}
              </CardTitle>
              <CardDescription>{t("runtime.description")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                [t("runtime.hostname"), health?.runtime.hostname ?? "—"],
                [t("runtime.os"), health?.runtime.os ?? "—"],
                [t("runtime.architecture"), health?.runtime.architecture ?? "—"],
                [t("runtime.node"), health?.runtime.nodeVersion ?? "—"],
                [
                  t("runtime.web_uptime"),
                  formatDuration(health?.runtime.processUptimeSeconds, locale, t),
                ],
                [
                  t("runtime.system_uptime"),
                  formatDuration(health?.runtime.systemUptimeSeconds, locale, t),
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-1 break-words font-medium">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HardDrive className="h-5 w-5 text-violet-600" />
                    {t("backup.title")}
                  </CardTitle>
                  <CardDescription>{t("backup.description")}</CardDescription>
                </div>
                {backupStatus ? (
                  <SystemHealthStatusBadge
                    status={backupStatus === "success" ? "ok" : backupStatus === "failed" ? "error" : "unknown"}
                    label={backupStatusLabel}
                  />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{t("backup.last_run")}</div>
                  <div className="mt-1 font-medium">{backupStatusLabel}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatInstant(latestBackup?.dateHeure, locale, timeZone)}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{t("backup.archives")}</div>
                  <div className="mt-1 font-medium">
                    {backupsQuery.data
                      ? t("backup.archive_count", {
                          count: formatNumber(backupsQuery.data.summary.archiveCount, { decimals: 0, locale }),
                          slots: formatNumber(backupsQuery.data.summary.slotCount, { decimals: 0, locale }),
                        })
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/50 p-3">
                <div>
                  <div className="text-xs text-muted-foreground">{t("backup.storage_path")}</div>
                  <div className="mt-1 break-all font-mono text-xs">
                    {backupsQuery.data?.summary.storagePath ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("backup.log_path")}</div>
                  <div className="mt-1 break-all font-mono text-xs">
                    {backupsQuery.data?.summary.logFilePath ?? "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-indigo-600" />
              {t("email_audit.title")}
            </CardTitle>
            <CardDescription>
              {t("email_audit.description", {
                count: emailAuditQuery.data?.items.length ?? 0,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailAuditQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("email_audit.loading")}</p>
            ) : emailAuditQuery.isError ? (
              <p className="text-sm text-destructive">{t("email_audit.unavailable")}</p>
            ) : !emailAuditQuery.data?.items.length ? (
              <p className="text-sm text-muted-foreground">{t("email_audit.empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("email_audit.columns.date")}</TableHead>
                    <TableHead>{t("email_audit.columns.type")}</TableHead>
                    <TableHead>{t("email_audit.columns.recipient")}</TableHead>
                    <TableHead>{t("email_audit.columns.subject")}</TableHead>
                    <TableHead>{t("email_audit.columns.status")}</TableHead>
                    <TableHead className="text-right">{t("email_audit.columns.attempts")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailAuditQuery.data.items.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDbDateTime(entry.createdAt, {
                          format: "dateTimeSeconds",
                          locale,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{t(`email_audit.kind.${entry.kind}`)}</div>
                        {entry.context ? (
                          <div className="mt-1 text-xs text-muted-foreground">{entry.context}</div>
                        ) : null}
                        {entry.alarmId ? (
                          <div className="text-xs text-muted-foreground">
                            {t("email_audit.alarm_id", { id: entry.alarmId })}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-64">
                        <div className="break-all">{entry.recipient || "—"}</div>
                        {entry.ccRecipients.length > 0 ? (
                          <div className="mt-1 break-all text-xs text-muted-foreground">
                            {t("email_audit.cc")}: {entry.ccRecipients.join(", ")}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-72">
                        <div className="break-words">{entry.subject || "—"}</div>
                      </TableCell>
                      <TableCell className="max-w-72">
                        <EmailAuditStatusBadge
                          status={entry.status}
                          label={t(`email_audit.status.${entry.status}`)}
                        />
                        {entry.lastError ? (
                          <div className="mt-2 break-words text-xs text-muted-foreground">
                            {entry.lastError}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(entry.attempts, { decimals: 0, locale })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
