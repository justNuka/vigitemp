"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    }));
  };

  const handleGroupToggle = (groupId: number) => {
    setFilters((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId],
    }));
  };

  const removeGroup = (groupId: number) => {
    setFilters((prev) => ({
      ...prev,
      groupIds: prev.groupIds.filter((id) => id !== groupId),
    }));
  };

  const selectedGroupsNames = groups
    ?.filter((g) => Array.isArray(filters.groupIds) && filters.groupIds.includes(g.id))
    .map((g) => g.name)
    .join(", ") || "Aucun sélectionné";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtre par Site */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Select
          value={filters.siteId?.toString() || "all"}
          onValueChange={handleSiteChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sites</SelectItem>
            {sites?.map((site) => (
              <SelectItem key={site.id} value={site.id.toString()}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtre par Groupe(s) - Chips + Dropdown */}
      <div className="flex items-center gap-2 flex-1">
        <FolderTree className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="w-full space-y-2">
          {/* Affichage des groupes sélectionnés */}
          {Array.isArray(filters.groupIds) && filters.groupIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {groups
                ?.filter((g) => Array.isArray(filters.groupIds) && filters.groupIds.includes(g.id))
                .map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupToggle(group.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors"
                  >
                    {group.name}
                    <span className="ml-1">×</span>
                  </button>
                ))}
            </div>
          )}
          
          {/* Dropdown pour ajouter des groupes */}
          <Select
            value=""
            onValueChange={(value) => {
              if (value) {
                const groupId = parseInt(value, 10);
                handleGroupToggle(groupId);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                Array.isArray(filters.groupIds) && filters.groupIds.length > 0
                  ? "Ajouter d'autres groupes..."
                  : "Sélectionner des groupes..."
              } />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((group) => (
                <SelectItem 
                  key={group.id} 
                  value={group.id.toString()}
                  className={Array.isArray(filters.groupIds) && filters.groupIds.includes(group.id) ? "opacity-50" : ""}
                >
                  {Array.isArray(filters.groupIds) && filters.groupIds.includes(group.id) ? "✓ " : ""}{group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
