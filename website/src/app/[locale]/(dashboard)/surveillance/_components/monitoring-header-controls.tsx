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
  filters: FilterState
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
  filters,
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

  return (
    <div className="w-full">
      <div className="flex flex-nowrap items-center gap-1.5 overflow-visible rounded-lg border border-[#26A5DA]/35 bg-[#26A5DA]/8 p-1.5 shadow-sm dark:border-[#26A5DA]/40 dark:bg-[#26A5DA]/10">
        <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
        <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-border lg:block" />
        <SurveillanceFilters filters={filters} onFilterChange={onFilterChange} sites={sites} groups={groups} />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {orderToggleLabel && onToggleOrder ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleOrder}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="button-toggle-surveillance-order"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="sr-only">{orderToggleLabel}</span>
            </Button>
          ) : null}
          {onOpenOverlay ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenOverlay}
              className="h-8 min-h-8 gap-1.5 border-border bg-card px-2.5 text-xs text-foreground shadow-sm hover:border-[hsl(var(--border-strong))] hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="button-open-overlay-curves"
            >
              <Layers3 className="h-4 w-4" />
              {t("overlay.button")}
            </Button>
          ) : null}
          {onRefresh ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              className="h-8 min-h-8 gap-1.5 border-border bg-card px-2.5 text-xs text-foreground shadow-sm hover:border-[hsl(var(--border-strong))] hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
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
