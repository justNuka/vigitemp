"use client"

import { useEffect, useMemo, useState } from "react"

import { MultiSelectFilter } from "@/components/multi-select-filter"

import type { Group, Site } from "./server-filters"

type FilterState = {
  siteIds: number[]
  groupIds: number[]
}

type Props = {
  onFilterChange: (filters: FilterState) => void
  sites: Site[]
  groups: Group[]
}

const STORAGE_KEY = "surveillance_filters"

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
  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window === "undefined") return { siteIds: [], groupIds: [] }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { siteIds: [], groupIds: [] }

    try {
      const parsed = JSON.parse(saved)
      return {
        siteIds: Array.isArray(parsed.siteIds) ? parsed.siteIds : [],
        groupIds: Array.isArray(parsed.groupIds) ? parsed.groupIds : [],
      }
    } catch {
      return { siteIds: [], groupIds: [] }
    }
  })

  const allowedGroupIds = useMemo(
    () => buildAllowedGroupIdSet(groups, filters.siteIds),
    [groups, filters.siteIds],
  )

  const disabledGroupIds = useMemo(() => {
    const disabled = new Set<number>()
    if (!allowedGroupIds) return disabled
    for (const group of groups) {
      if (!allowedGroupIds.has(group.id)) disabled.add(group.id)
    }
    return disabled
  }, [allowedGroupIds, groups])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    onFilterChange(filters)
  }, [filters, onFilterChange])

  useEffect(() => {
    if (!allowedGroupIds) return
    setFilters((prev) => {
      const nextGroupIds = prev.groupIds.filter((id) => allowedGroupIds.has(id))
      if (nextGroupIds.length === prev.groupIds.length) return prev
      return { ...prev, groupIds: nextGroupIds }
    })
  }, [allowedGroupIds])

  const handleSiteChange = (selectedIds: number[]) => {
    const nextSiteIds = selectedIds || []
    const nextAllowed = buildAllowedGroupIdSet(groups, nextSiteIds)

    setFilters((prev) => ({
      ...prev,
      siteIds: nextSiteIds,
      groupIds: nextAllowed ? prev.groupIds.filter((id) => nextAllowed.has(id)) : prev.groupIds,
    }))
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <MultiSelectFilter
        label="Sites"
        options={sites?.map((site) => ({ id: site.id, label: site.name })) || []}
        selectedIds={filters.siteIds || []}
        onChange={(selectedIds) => handleSiteChange((selectedIds || []) as number[])}
        placeholder="Tous les sites"
      />

      <MultiSelectFilter
        label="Groupes"
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
        placeholder="Tous les groupes"
      />
    </div>
  )
}

