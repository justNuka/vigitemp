"use client"

import { useEffect, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { MultiSelectFilter } from "@/components/multi-select-filter"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useTranslations } from 'next-intl'

import { areSurveillanceFiltersEqual, type FilterState, type SurveillanceSortMode } from "./_helpers/monitoring-derived"
import type { Group, Site } from "./server-filters"

type Props = {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  sites: Site[]
  groups: Group[]
}


function buildAllowedGroupIdSet(groups: Group[], selectedSiteIds: number[]) {
  if (selectedSiteIds.length === 0) return null
  const selected = new Set(selectedSiteIds)
  const allowed = new Set<number>()
  for (const group of groups) {
    if (group.siteIds.some((siteId) => selected.has(siteId))) {
      allowed.add(group.id)
    }
  }
  return allowed
}

export function SurveillanceFilters({ filters: controlledFilters, onFilterChange, sites, groups }: Props) {
  const t = useTranslations('surveillance.filters')
  const filters = controlledFilters
  const setFilters = (updater: FilterState | ((previous: FilterState) => FilterState)) => {
    const nextFilters = typeof updater === "function" ? updater(controlledFilters) : updater
    if (!areSurveillanceFiltersEqual(nextFilters, controlledFilters)) {
      onFilterChange(nextFilters)
    }
  }

  const allowedGroupIds = useMemo(
    () => buildAllowedGroupIdSet(groups, filters.siteIds),
    [groups, filters.siteIds],
  )

  const disabledGroupIds = useMemo(() => {
    const disabled = new Set<number>()
    for (const group of groups) {
      if (group.disabled || (allowedGroupIds && !allowedGroupIds.has(group.id))) {
        disabled.add(group.id)
      }
    }
    return disabled
  }, [allowedGroupIds, groups])

  useEffect(() => {
    const sanitizedGroupIds = controlledFilters.groupIds.filter((id) => !disabledGroupIds.has(id))
    if (sanitizedGroupIds.length === controlledFilters.groupIds.length) return

    onFilterChange({
      ...controlledFilters,
      groupIds: sanitizedGroupIds,
    })
  }, [controlledFilters, disabledGroupIds, onFilterChange])

  const hasActiveFilters =
    filters.siteIds.length > 0 ||
    filters.groupIds.length > 0 ||
    filters.searchTerm.trim().length > 0 ||
    filters.sortMode !== "status" ||
    filters.statusFilter !== "all"

  const clearFilters = () => {
    setFilters({
      siteIds: [],
      groupIds: [],
      searchTerm: "",
      sortMode: "status",
      statusFilter: "all",
    })
  }

  const handleSiteChange = (selectedIds: number[]) => {
    const normalizedSiteIds = selectedIds ?? []
    const nextAllowed = buildAllowedGroupIdSet(groups, normalizedSiteIds)

    setFilters((prev) => ({
      ...prev,
      siteIds: normalizedSiteIds,
      groupIds: prev.groupIds.filter(
        (id) => !groups.find((group) => group.id === id)?.disabled && (!nextAllowed || nextAllowed.has(id)),
      ),
    }))
  }

  return (
    <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5">
      <div className="w-40 shrink-0">
        <MultiSelectFilter
          label={t('sites.label')}
          options={sites?.map((site) => ({ id: site.id, label: site.name })) || []}
          selectedIds={filters.siteIds || []}
          onChange={(selectedIds) => handleSiteChange((selectedIds || []) as number[])}
          placeholder={t('sites.placeholder')}
          tone="primary"
          compact
          hideLabel
          dropdownMaxHeightClassName="max-h-80"
        />
      </div>

      <div className="w-40 shrink-0">
        <MultiSelectFilter
          label={t('groups.label')}
          options={
            groups?.map((group) => ({
              id: group.id,
              label: group.name,
              disabled: disabledGroupIds.has(group.id),
            })) || []
          }
          selectedIds={filters.groupIds || []}
          onChange={(selectedIds) => {
            const groupIds = (selectedIds || [])
              .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
              .filter((id): id is number => typeof id === "number" && !Number.isNaN(id))

            setFilters((prev) => ({
              ...prev,
              groupIds: groupIds.filter((id) => !disabledGroupIds.has(id)),
            }))
          }}
          placeholder={t('groups.placeholder')}
          tone="primary"
          compact
          hideLabel
          dropdownMaxHeightClassName="max-h-80"
        />
      </div>

      <div className="w-56 shrink-0">
        <Select
          value={filters.sortMode}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              sortMode: (value === 'alphabetical' ? 'alphabetical' : 'status') as SurveillanceSortMode,
            }))
          }}
        >
          <SelectTrigger
            aria-label={t('sort.label')}
            className="h-8 border-[#26A5DA]/35 bg-[#26A5DA]/8 px-3 text-[13px] text-[#0B5F86] shadow-sm transition-[background-color,border-color,color,box-shadow] duration-200 ease-out hover:border-[#26A5DA]/55 hover:bg-[#26A5DA]/14 focus:ring-2 focus:ring-[#26A5DA]/25 focus:ring-offset-0 dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-100"
          >
            <SelectValue placeholder={t('sort.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">{t('sort.options.status')}</SelectItem>
            <SelectItem value="alphabetical">{t('sort.options.alphabetical')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="group/search relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 ease-out group-focus-within/search:text-[#26A5DA]" />
        <Input
          type="search"
          value={filters.searchTerm}
          onChange={(event) => {
            const value = event.target.value
            setFilters((prev) => ({ ...prev, searchTerm: value }))
          }}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          className="h-8 border-[#26A5DA]/30 bg-[#26A5DA]/8 pl-8 pr-3 text-[13px] shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-[#26A5DA]/45 hover:bg-[#26A5DA]/10 focus-visible:border-[#26A5DA]/65 focus-visible:bg-[#26A5DA]/10 focus-visible:ring-2 focus-visible:ring-[#26A5DA]/20 focus-visible:ring-offset-0 dark:border-[#26A5DA]/40 dark:bg-[#26A5DA]/10"
        />
      </div>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 min-h-8 shrink-0 border border-[#26A5DA]/30 bg-[#26A5DA]/8 px-2.5 text-xs text-[#0B5F86] shadow-sm transition-[background-color,border-color,color] duration-200 ease-out hover:border-[#26A5DA]/50 hover:bg-[#26A5DA]/14 hover:text-[#075776] focus-visible:ring-2 focus-visible:ring-[#26A5DA]/30 dark:border-[#26A5DA]/40 dark:bg-[#26A5DA]/10 dark:text-sky-100"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5" />
          {t("actions.clear")}
        </Button>
      ) : null}
    </div>
  )
}
