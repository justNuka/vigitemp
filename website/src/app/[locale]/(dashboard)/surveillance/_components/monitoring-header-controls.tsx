"use client"

import type { Group, Site } from "../server-filters"

import { SurveillanceFilters } from "../monitoring-filters"
import { SurveillanceViewTabs } from "./monitoring-view-tabs"

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
  graphsLabel: string
  treeLabel: string
}

export function SurveillanceHeaderControls({
  sites,
  groups,
  viewMode,
  onViewModeChange,
  onFilterChange,
  graphsLabel,
  treeLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <SurveillanceFilters onFilterChange={onFilterChange} sites={sites} groups={groups} />
      <SurveillanceViewTabs value={viewMode} onChange={onViewModeChange} graphsLabel={graphsLabel} treeLabel={treeLabel} />
    </div>
  )
}
