"use client";

import { useEffect, useState } from "react";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import type { Group, Site } from "./server-filters";
import { Building2, FolderTree } from "lucide-react";

interface FilterState {
  siteId: number | null;
  groupIds: number[]; // Changed from single groupId to array
}

interface Props {
  onFilterChange: (filters: FilterState) => void;
  sites: Site[];
  groups: Group[];
}

const STORAGE_KEY = "surveillance_filters";

export function SurveillanceFilters({ onFilterChange, sites, groups }: Props) {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Charger les filtres depuis localStorage au montage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { siteId: null, groupIds: [] };
        }
      }
    }
    return { siteId: null, groupIds: [] };
  });

  // Sauvegarder dans localStorage et notifier le parent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleSiteChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      siteId: value === "all" ? null : parseInt(value, 10),
      groupIds: prev.groupIds ?? [], // Préserver les groupIds
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtre par Site */}
      <MultiSelectFilter
        label="Sites"
        options={
          sites?.map((site) => ({ id: site.id, label: site.name })) || []
        }
        selectedIds={filters.siteId ? [filters.siteId] : []}
        onChange={(selectedIds) => {
          handleSiteChange(selectedIds.length > 0 ? selectedIds[0].toString() : "all");
        }}
        placeholder="Tous les sites"
      />

      {/* Filtre par Groupe(s) */}
      <MultiSelectFilter
        label="Groupes"
        options={
          groups?.map((group) => ({ id: group.id, label: group.name })) || []
        }
        selectedIds={filters.groupIds || []}
        onChange={(selectedIds) => {
          const groupIds = selectedIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id) as number[];
          setFilters((prev) => ({
            ...prev,
            groupIds,
          }));
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...filters,
              groupIds,
            })
          );
        }}
        placeholder="Sélectionner des groupes..."
      />
    </div>
  );
}
