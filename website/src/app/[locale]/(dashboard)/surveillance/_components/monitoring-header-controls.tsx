"use client"

import type { Group, Site } from "../server-filters"

import { SurveillanceFilters } from "../monitoring-filters"
import { SurveillanceViewTabs } from "./monitoring-view-tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Layers3, Loader2, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/ui/switch"

type ViewMode = "tree" | "graphs"

type FilterState = {
  siteIds: number[]
  groupIds: number[]
}

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
  showNullNonResponse?: boolean
  onShowNullNonResponseChange?: (enabled: boolean) => void
  nonResponsePreferencesLoading?: boolean
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
  showNullNonResponse = false,
  onShowNullNonResponseChange,
  nonResponsePreferencesLoading = false,
}: Props) {
  const t = useTranslations("surveillance")
  const tStatus = useTranslations("surveillanceStatus")
  const tCard = useTranslations("monitoringCard")
  const tDetails = useTranslations("monitoringDetailsModal")

  const legendItems = [
    { key: "alarm_high", label: tCard("alarmTypes.high"), dotClassName: "bg-red-600" },
    { key: "alarm_low", label: tCard("alarmTypes.low"), dotClassName: "bg-blue-600" },
    { key: "warning", label: tStatus("warning"), dotClassName: "bg-amber-500" },
    { key: "technical", label: tStatus("technical"), dotClassName: "bg-black" },
    { key: "ended", label: tStatus("ended"), dotClassName: "bg-violet-600" },
    { key: "ok", label: tStatus("ok"), dotClassName: "bg-primary" },
    { key: "inactive", label: tStatus("inactive"), dotClassName: "bg-slate-500" },
  ]

  return (
    <div className="flex flex-col gap-4 w-full rounded-lg border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <SurveillanceFilters onFilterChange={onFilterChange} sites={sites} groups={groups} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onShowNullNonResponseChange ? (
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5">
              <Switch
                checked={showNullNonResponse}
                onCheckedChange={onShowNullNonResponseChange}
                disabled={nonResponsePreferencesLoading}
                aria-label={tDetails("chart.show_no_response")}
              />
              <span className="text-xs text-primary">{tDetails("chart.show_no_response")}</span>
              {nonResponsePreferencesLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : null}
            </div>
          ) : null}
          {orderToggleLabel && onToggleOrder ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleOrder}
              className="gap-2 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/15 dark:text-primary-foreground/90"
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
              className="gap-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/15 dark:text-primary-foreground/90"
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
              className="gap-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/15 dark:text-primary-foreground/90"
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
