"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MultiSelectFilter } from "@/components/multi-select-filter"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Funnel, X } from "lucide-react"
import { useTranslations } from 'next-intl'

import type { FilterState, SurveillanceSortMode } from "./_helpers/monitoring-derived"
import type { Group, Site } from "./server-filters"

type Props = {
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

export function SurveillanceFilters({ onFilterChange, sites, groups }: Props) {
  const t = useTranslations('surveillance.filters')
  const [filters, setFilters] = useState<FilterState>({
    siteIds: [],
    groupIds: [],
    searchTerm: "",
    sortMode: "status",
  })

  const allowedGroupIds = useMemo(
    () => buildAllowedGroupIdSet(groups, filters.siteIds),
    [groups, filters.siteIds],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem("surveillance_filters")
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<FilterState> | null
      if (!parsed) return
      setFilters((prev) => ({
        ...prev,
        siteIds: Array.isArray(parsed.siteIds) ? parsed.siteIds : [],
        groupIds: Array.isArray(parsed.groupIds) ? parsed.groupIds : [],
        searchTerm: typeof parsed.searchTerm === "string" ? parsed.searchTerm : "",
        sortMode: parsed.sortMode === "alphabetical" ? "alphabetical" : "status",
      }))
    } catch {
      window.localStorage.removeItem("surveillance_filters")
    }
  }, [])

  const disabledGroupIds = useMemo(() => {
    const disabled = new Set<number>()
    if (!allowedGroupIds) return disabled
    for (const group of groups) {
      if (!allowedGroupIds.has(group.id)) disabled.add(group.id)
    }
    return disabled
  }, [allowedGroupIds, groups])

  useEffect(() => {
    onFilterChange(filters)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("surveillance_filters", JSON.stringify(filters))
    }
  }, [filters, onFilterChange])

  useEffect(() => {
    if (!allowedGroupIds) return
    const updateId = window.setTimeout(() => {
      setFilters((prev) => {
        const nextGroupIds = prev.groupIds.filter((id) => allowedGroupIds.has(id))
        if (nextGroupIds.length === prev.groupIds.length) return prev
        return { ...prev, groupIds: nextGroupIds }
      })
    }, 0)

    return () => {
      window.clearTimeout(updateId)
    }
  }, [allowedGroupIds])

  const hasActiveFilters =
    filters.siteIds.length > 0 ||
    filters.groupIds.length > 0 ||
    filters.searchTerm.trim().length > 0 ||
    filters.sortMode !== "status"

  const clearFilters = () => {
    setFilters({
      siteIds: [],
      groupIds: [],
      searchTerm: "",
      sortMode: "status",
    })
  }

  const handleSiteChange = (selectedIds: number[]) => {
    const normalizedSiteIds = selectedIds ?? []
    const nextAllowed = buildAllowedGroupIdSet(groups, normalizedSiteIds)

    setFilters((prev) => ({
      ...prev,
      siteIds: normalizedSiteIds,
      groupIds: nextAllowed ? prev.groupIds.filter((id) => nextAllowed.has(id)) : [],
    }))
  }

  return (
    <div className="space-y-3">
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#26A5DA]/35 bg-[#26A5DA]/8 px-3 py-2 text-sm text-[#075776] dark:border-[#26A5DA]/45 dark:bg-[#26A5DA]/12 dark:text-sky-50">
          <div className="flex items-center gap-2">
            <Funnel className="h-4 w-4" />
            <span className="font-medium">{t("status.active")}</span>
            <Badge variant="secondary" className="bg-white/70 text-[#075776] dark:bg-slate-900/40 dark:text-sky-50">
              {[
                filters.siteIds.length > 0 ? t("status.siteCount", { count: filters.siteIds.length }) : null,
                filters.groupIds.length > 0 ? t("status.groupCount", { count: filters.groupIds.length }) : null,
                filters.searchTerm.trim().length > 0 ? t("status.search") : null,
                filters.sortMode !== "status" ? t("status.sort") : null,
              ].filter(Boolean).join(" | ")}
            </Badge>
          </div>
          <Button type="button" variant="ghost" size="sm" className="gap-2 text-[#075776] hover:bg-[#26A5DA]/14 hover:text-[#075776] dark:text-sky-50 dark:hover:bg-[#26A5DA]/18" onClick={clearFilters}>
            <X className="h-4 w-4" />
            {t("actions.clear")}
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3">
        <MultiSelectFilter
          label={t('sites.label')}
          options={sites?.map((site) => ({ id: site.id, label: site.name })) || []}
          selectedIds={filters.siteIds || []}
          onChange={(selectedIds) => handleSiteChange((selectedIds || []) as number[])}
          placeholder={t('sites.placeholder')}
          tone="primary"
          dropdownMaxHeightClassName="max-h-80"
        />
      </div>

      <div className="xl:col-span-3">
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
              groupIds: allowedGroupIds ? groupIds.filter((id) => allowedGroupIds.has(id)) : groupIds,
            }))
          }}
          placeholder={t('groups.placeholder')}
          tone="primary"
          dropdownMaxHeightClassName="max-h-80"
        />
      </div>

      <div className="xl:col-span-4">
        <Input
          value={filters.searchTerm}
          onChange={(event) => {
            const value = event.target.value
            setFilters((prev) => ({ ...prev, searchTerm: value }))
          }}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          className={cn(filters.searchTerm.trim().length > 0 && "border-[#26A5DA]/60 bg-[#26A5DA]/8 focus-visible:ring-[#26A5DA]/35")}
        />
      </div>

      <div className="xl:col-span-2">
        <Select
          value={filters.sortMode}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              sortMode: (value === 'alphabetical' ? 'alphabetical' : 'status') as SurveillanceSortMode,
            }))
          }}
        >
          <SelectTrigger className={cn(filters.sortMode !== "status" && "border-[#26A5DA]/60 bg-[#26A5DA]/8 text-[#075776] dark:text-sky-50")}>
            <SelectValue placeholder={t('sort.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">{t('sort.options.status')}</SelectItem>
            <SelectItem value="alphabetical">{t('sort.options.alphabetical')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
  )
}

