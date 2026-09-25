"use client"

import { Activity, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSystemHealth } from "@/hooks/useSystemHealth"
import { Link } from "@/i18n/navigation"
import { getSystemHealthOverview } from "@/lib/system-health-overview"
import type { SystemHealthOverallState } from "@/types/system-health"

import { SystemHealthStatusBadge } from "./system-health-status-badge"

export function AdminSystemHealthCard() {
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

  return (
    <Card className="card-interactive flex h-full flex-col overflow-hidden border-border/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/95 dark:shadow-black/20">
      <CardHeader className="border-b border-border/50 bg-white/90 pb-2 dark:bg-card/90">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-emerald-600" />
              {t("health.title")}
            </CardTitle>
            <CardDescription className="mt-1">{t("health.description")}</CardDescription>
          </div>
          <SystemHealthStatusBadge status={status} label={statusLabel} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-2 pt-4">
        <div className="text-2xl font-bold">{statusLabel}</div>
        <p className="text-sm text-muted-foreground">{helper}</p>
        <Link
          href="/admin/sante-systeme"
          className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t("health.open")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
