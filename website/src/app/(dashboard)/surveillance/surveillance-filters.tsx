"use client";

import { useEffect, useState } from "react";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import type { Group, Site } from "./server-filters";
import { Building2, FolderTree } from "lucide-react";

interface FilterState {
  siteIds: number[]; // Changed to array to support multiple sites
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
          const parsed = JSON.parse(saved);
          // Vérifier la structure et fournir les valeurs par défaut
          return {
            siteIds: Array.isArray(parsed.siteIds) ? parsed.siteIds : [],
            groupIds: Array.isArray(parsed.groupIds) ? parsed.groupIds : [],
          };
        } catch {
          return { siteIds: [], groupIds: [] };
        }
      }
    }
    return { siteIds: [], groupIds: [] };
  });

  // Sauvegarder dans localStorage et notifier le parent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleSiteChange = (selectedIds: number[]) => {
    setFilters((prev) => ({
      ...prev,
      siteIds: selectedIds || [],
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtre par Site(s) - Multi-sélection */}
      <MultiSelectFilter
        label="Sites"
        options={
          sites?.map((site) => ({ id: site.id, label: site.name })) || []
        }
        selectedIds={filters.siteIds || []}
        onChange={(selectedIds) => {
          handleSiteChange((selectedIds || []) as number[]);
        }}
        placeholder="Tous les sites"
      />

      {/* Filtre par Groupe(s) - Multi-sélection */}
      <MultiSelectFilter
        label="Groupes"
        options={
          groups?.map((group) => ({ id: group.id, label: group.name })) || []
        }
        selectedIds={filters.groupIds || []}
        onChange={(selectedIds) => {
          const groupIds = (selectedIds || []).map(id => typeof id === 'string' ? parseInt(id, 10) : id) as number[];
          setFilters((prev) => ({
            ...prev,
            groupIds: groupIds || [],
          }));
        }}
        placeholder="Sélectionner des groupes..."
      />
    </div>
  );
}
