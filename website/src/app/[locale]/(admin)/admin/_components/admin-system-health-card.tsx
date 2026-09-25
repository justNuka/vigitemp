"use client"

import { Activity } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminCardLink, AdminDashboardCard } from "./admin-dashboard-card"
import { AdminStatusPill, type AdminStatusTone } from "./admin-status-pill"
import { useSystemHealth } from "@/hooks/useSystemHealth"
import { getSystemHealthOverview } from "@/lib/system-health-overview"
import type { HealthState, SystemHealthOverallState } from "@/types/system-health"
import { cn } from "@/lib/utils"

const statusTone: Record<SystemHealthOverallState, AdminStatusTone> = {
  ok: "ok",
  degraded: "warning",
  error: "critical",
  unknown: "neutral",
}

export function AdminSystemHealthCard({ className }: { className?: string }) {
  const t = useTranslations("adminDashboard")
  const healthQuery = useSystemHealth()
  const overview = healthQuery.data ? getSystemHealthOverview(healthQuery.data) : null

  const status: SystemHealthOverallState = healthQuery.isError
    ? "error"
    : overview?.status ?? "unknown"

  const statusLabel = healthQuery.isLoading
    ? t("health.status.loading")
    : t(`health.status.${status}`)

  const helper = overview
    ? t("health.helper", { ok: overview.ok, total: overview.total })
    : t("health.helper_unavailable")

  const serviceStates: HealthState[] = healthQuery.data
    ? [
        healthQuery.data.services.web.status,
        healthQuery.data.services.server.status,
        healthQuery.data.services.dbMain.status,
        healthQuery.data.services.dbMesure.status,
        ...(healthQuery.data.services.dbChat.configured ? [healthQuery.data.services.dbChat.status] : []),
      ]
    : []

  return (
    <AdminDashboardCard
      icon={Activity}
      tone={status === "error" ? "critical" : status === "degraded" ? "warning" : status === "ok" ? "ok" : "neutral"}
      title={t("health.title")}
      description={t("health.description")}
      attention={status === "error" ? "critical" : status === "degraded" ? "warning" : null}
      badge={
        <AdminStatusPill tone={healthQuery.isLoading ? "loading" : statusTone[status]}>
          {statusLabel}
        </AdminStatusPill>
      }
      footer={<AdminCardLink href="/admin/sante-systeme" label={t("health.open")} />}
      loading={healthQuery.isLoading && !healthQuery.data}
      className={className}
    >
      <p
        className={cn(
          "text-lg font-semibold leading-7 tracking-[-0.01em]",
          status === "error" && "text-[hsl(var(--status-critical))]",
          status === "degraded" && "text-[hsl(var(--status-warning-text))]",
          status === "unknown" && "text-muted-foreground",
        )}
      >
        {statusLabel}
      </p>

      {serviceStates.length > 0 ? (
        <div className="mt-2">
          <div className="flex gap-1" aria-hidden>
            {serviceStates.map((serviceStatus, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  serviceStatus === "ok"
                    ? "bg-[hsl(var(--status-ok))]"
                    : serviceStatus === "error"
                      ? "bg-[hsl(var(--status-critical))]"
                      : "bg-[hsl(var(--border-strong))]",
                )}
              />
            ))}
          </div>
          <p className="num mt-1.5 text-xs text-muted-foreground">{helper}</p>
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{healthQuery.isLoading ? "" : helper}</p>
      )}
    </AdminDashboardCard>
  )
}
