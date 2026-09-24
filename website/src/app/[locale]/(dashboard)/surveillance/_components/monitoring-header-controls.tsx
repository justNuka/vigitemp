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
      <div className="flex flex-nowrap items-center gap-1.5 overflow-visible rounded-lg border border-border bg-card p-1.5 shadow-sm dark:bg-card">
        <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
        <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-border lg:block" />
        <SurveillanceFilters filters={filters} onFilterChange={onFilterChange} sites={sites} groups={groups} />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {orderToggleLabel && onToggleOrder ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleOrder}
              className="h-8 w-8 shrink-0 border border-[#26A5DA]/35 bg-[#26A5DA]/8 text-[#0B5F86] shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 ease-out hover:border-[#26A5DA]/55 hover:bg-[#26A5DA]/14 hover:text-[#075776] focus-visible:ring-2 focus-visible:ring-[#26A5DA]/30 dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-100"
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
              className="h-8 min-h-8 gap-1.5 border-[#26A5DA]/35 bg-[#26A5DA]/8 px-2.5 text-xs text-[#0B5F86] shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 ease-out hover:border-[#26A5DA]/55 hover:bg-[#26A5DA]/14 hover:text-[#075776] focus-visible:ring-2 focus-visible:ring-[#26A5DA]/30 dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-100"
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
              className="h-8 min-h-8 gap-1.5 border-[#26A5DA]/35 bg-[#26A5DA]/8 px-2.5 text-xs text-[#0B5F86] shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 ease-out hover:border-[#26A5DA]/55 hover:bg-[#26A5DA]/14 hover:text-[#075776] focus-visible:ring-2 focus-visible:ring-[#26A5DA]/30 dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-100"
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
