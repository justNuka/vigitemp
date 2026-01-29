"use client"

import type { Group, Site } from "../server-filters"

import { SurveillanceFilters } from "../monitoring-filters"
import { SurveillanceViewTabs } from "./monitoring-view-tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

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
}: Props) {
  const t = useTranslations("surveillance")

  return (
    <div className="flex flex-col gap-4 w-full rounded-lg border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <SurveillanceFilters onFilterChange={onFilterChange} sites={sites} groups={groups} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
        <div className="flex items-center gap-2 self-start sm:self-auto">
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
    </div>
  )
}
