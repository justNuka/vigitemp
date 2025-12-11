"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { groupsApi, sitesApi, type Group, type Site } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FolderTree, X } from "lucide-react";

interface FilterState {
  siteId: number | null;
  groupIds: number[]; // Changed from single groupId to array
}

interface Props {
  onFilterChange: (filters: FilterState) => void;
}

const STORAGE_KEY = "surveillance_filters";

export function SurveillanceFilters({ onFilterChange }: Props) {
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

  // Charger les sites
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ["sites"],
    queryFn: () => sitesApi.getAll(),
  });

  // Charger les groupes
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupsApi.getAll(),
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
    ?.filter((g) => filters.groupIds.includes(g.id))
    .map((g) => g.name)
    .join(", ") || "Aucun sélectionné";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Filtre par Site */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {sitesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
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
        )}
      </div>

      {/* Filtre par Groupe(s) - Multi-select */}
      <div className="flex items-center gap-2 flex-1">
        <FolderTree className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {groupsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="relative w-full">
            <button
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
              onClick={() => {
                // Toggle dropdown - could be improved with a proper dropdown component
              }}
            >
              <span className="text-sm">
                {filters.groupIds.length === 0
                  ? "Tous les groupes"
                  : `${filters.groupIds.length} groupe(s) sélectionné(s)`}
              </span>
            </button>

            {/* Selected groups tags */}
            {filters.groupIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {groups
                  ?.filter((g) => filters.groupIds.includes(g.id))
                  .map((group) => (
                    <div
                      key={group.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                    >
                      <span>{group.name}</span>
                      <button
                        onClick={() => removeGroup(group.id)}
                        className="ml-1 hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Dropdown list of groups */}
            <div className="mt-2 border rounded-md p-2 bg-white max-h-48 overflow-y-auto">
              {groups?.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.groupIds.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{group.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
