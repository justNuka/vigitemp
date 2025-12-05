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
import { groupsApi, sitesApi, type Group, type Site } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FolderTree } from "lucide-react";

interface FilterState {
  siteId: number | null;
  groupId: number | null;
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
          return { siteId: null, groupId: null };
        }
      }
    }
    return { siteId: null, groupId: null };
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

  const handleGroupChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      groupId: value === "all" ? null : parseInt(value, 10),
    }));
  };

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

      {/* Filtre par Groupe */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <FolderTree className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {groupsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={filters.groupId?.toString() || "all"}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les groupes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
