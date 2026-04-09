"use client"

import type { FilterState } from "../_helpers/monitoring-derived"
import type { Group, Site } from "../server-filters"

import { SurveillanceFilters } from "../monitoring-filters"
import { SurveillanceViewTabs } from "./monitoring-view-tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Layers3, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

type ViewMode = "tree" | "graphs"


type Props = {
  sites: Site[]
  groups: Group[]
  viewMode: ViewMode
  onViewModeChange: (value: ViewMode) => void
  onFilterChange: (filters: FilterState) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  graphsLabel: string
  treeLabel: string
  orderToggleLabel?: string
  onToggleOrder?: () => void
  onOpenOverlay?: () => void
}

export function SurveillanceHeaderControls({
  sites,
  groups,
  viewMode,
  onViewModeChange,
  onFilterChange,
  onRefresh,
  isRefreshing = false,
  graphsLabel,
  treeLabel,
  orderToggleLabel,
  onToggleOrder,
  onOpenOverlay,
}: Props) {
  const t = useTranslations("surveillance")
  const tStatus = useTranslations("surveillanceStatus")
  const tCard = useTranslations("monitoringCard")

  const legendItems = [
    { key: "alarm_high", label: tCard("alarmTypes.high"), dotClassName: "bg-red-600" },
    { key: "alarm_low", label: tCard("alarmTypes.low"), dotClassName: "bg-blue-600" },
    { key: "warning", label: tStatus("warning"), dotClassName: "bg-amber-500" },
    { key: "pre_alarm_threshold", label: t("legend.pre_alarm_threshold"), dotClassName: "bg-amber-400 ring-1 ring-amber-600/40" },
    { key: "technical", label: t("legend.technical_alarm"), dotClassName: "bg-black" },
    { key: "ended", label: tStatus("ended"), dotClassName: "bg-violet-600" },
    { key: "ok", label: tStatus("ok"), dotClassName: "bg-sky-400" },
    { key: "inactive", label: tStatus("inactive"), dotClassName: "bg-slate-500" },
  ]

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-border/60 bg-white/85 p-3 shadow-sm dark:bg-card/95 dark:shadow-black/20">
      <SurveillanceFilters onFilterChange={onFilterChange} sites={sites} groups={groups} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {orderToggleLabel && onToggleOrder ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleOrder}
              className="gap-2 border border-primary/35 bg-primary/8 text-primary hover:bg-primary/14 dark:border-primary/40 dark:bg-primary/12 dark:text-primary-foreground"
              data-testid="button-toggle-surveillance-order"
            >
              <ArrowUpDown className="h-4 w-4" />
              {orderToggleLabel}
            </Button>
          ) : null}
          {onOpenOverlay ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenOverlay}
              className="gap-2 border-primary/35 bg-primary/8 text-primary hover:bg-primary/14 dark:border-primary/40 dark:bg-primary/12 dark:text-primary-foreground"
              data-testid="button-open-overlay-curves"
            >
              <Layers3 className="h-4 w-4" />
              {t("overlay.button")}
            </Button>
          ) : null}
          {onRefresh ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2 border-primary/35 bg-primary/8 text-primary hover:bg-primary/14 dark:border-primary/40 dark:bg-primary/12 dark:text-primary-foreground"
              disabled={isRefreshing}
              data-testid="button-refresh-surveillance"
            >
              <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              {isRefreshing ? t("refresh.loading") : t("refresh.label")}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {legendItems.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${item.dotClassName}`} aria-hidden="true" />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
