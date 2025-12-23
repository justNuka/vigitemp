"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentTime } from "@/hooks/use-current-time";
import { PageHeader } from "@/components/page-header";
import { SensorsGrid } from "./sensors-grid-client";
import { MonitoringCardsGrid } from "./monitoring-cards-grid";
import { SensorsCardsGrid } from "./sensors-cards-grid";
import { SurveillanceFilters } from "./surveillance-filters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { SensorWithLocation, Location } from "@/lib/api";
import type { Site, Group } from "./server-filters";
import { useTranslations } from "next-intl";

type StatusFilter = "all" | "ok" | "warning" | "critical";
type ViewMode = "tree" | "graphs";

interface FilterState {
  siteIds: number[]; // Changed to array for multiple sites
  groupIds: number[];
}

interface Stats {
  total: number;
  ok: number;
  warning: number;
  critical: number;
  activeAlarms: number;
}

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sensors: SensorWithLocation[];
}

interface Props {
  initialStats: Stats;
  sites: Site[];
  groups: Group[];
}

export function SurveillancePageClient({ initialStats, sites, groups }: Props) {
  const t = useTranslations("surveillance");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteIds: [], groupIds: [] });
  const [cachedSensors, setCachedSensors] = useState<SensorWithLocation[]>([]); // ✅ Cache local
  const currentTime = useCurrentTime();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Charger TOUS les sensors une seule fois (pas de refetch on filter)
  const { data: paginatedData, isFetching, error, isError } = useQuery({
    queryKey: ["sensors-all"],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000", // Charger beaucoup d'une seule fois
      });
      const res = await fetch(`/api/sensors/paginated?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sensors");
      return res.json() as Promise<PaginatedResponse>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ Maintenir le cache local synchronisé avec paginatedData
  useEffect(() => {
    if (paginatedData?.sensors && Array.isArray(paginatedData.sensors) && paginatedData.sensors.length > 0) {
      setCachedSensors(paginatedData.sensors);
    }
  }, [paginatedData?.sensors]);

  // ✅ Filtrer les sensors EN CLIENT au lieu de les charger filtrés du serveur
  const filteredSensors = useMemo(() => {
    let result = cachedSensors.length > 0 ? cachedSensors : (paginatedData?.sensors ?? []);
    
    // Appliquer les filtres de sites
    if (filters.siteIds.length > 0) {
      result = result.filter(s => 
        s.location.siteId && filters.siteIds.includes(s.location.siteId)
      );
    }
    
    // Appliquer les filtres de groupes
    if (filters.groupIds.length > 0) {
      result = result.filter((s) => {
        const locationGroupIds =
          s.location.groupIds && s.location.groupIds.length > 0
            ? s.location.groupIds
            : [s.location.groupId1, s.location.groupId2].filter(
                (id): id is number => typeof id === "number" && !Number.isNaN(id)
              );

        return locationGroupIds.some((id) => filters.groupIds.includes(id));
      });
    }
    
    return result;
  }, [cachedSensors, paginatedData?.sensors, filters.siteIds, filters.groupIds]);

  // Récupérer les sensors actuels et les locations
  // ✅ Utiliser les filtered sensors au lieu des all sensors
  const sensors = filteredSensors;

  const locations = useMemo(() => {
    if (!Array.isArray(sensors)) return [];
    return Array.from(
      new Map(
        sensors.map((s) => [s.location.id, s.location])
      ).values()
    );
  }, [sensors]);

  // Recalculer les stats basées sur les sensors filtrés (pour cette page)
  const filteredStats = useMemo(() => {
    if (!Array.isArray(sensors)) {
      return {
        total: paginatedData?.total ?? 0,
        ok: 0,
        warning: 0,
        critical: 0,
        activeAlarms: initialStats?.activeAlarms ?? 0,
      };
    }
    const ok = sensors.filter((s) => s.status === "ok").length;
    const warning = sensors.filter((s) => s.status === "warning").length;
    const critical = sensors.filter((s) => s.status === "critical").length;

    return {
      total: paginatedData?.total ?? 0,
      ok,
      warning,
      critical,
      activeAlarms: initialStats?.activeAlarms ?? 0,
    };
  }, [sensors, paginatedData?.total, initialStats?.activeAlarms]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Pas besoin de reset page puisque c'est du filtrage client-side
  }, []);

  const handleSurveillanceToggle = useCallback(async (idLieu: number, newState: boolean) => {
    try {
      console.log(`Toggle surveillance for lieu ${idLieu}: ${newState ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error("Error toggling surveillance:", error);
    }
  }, []);

  // TODO: Implement pagination with hasNextPage and fetchNextPage
  // Charger la page suivante
  // const handleLoadMore = () => {
  //   if (hasNextPage) {
  //     setPage(p => p + 1);
  //   }
  // };

  // Intersection Observer pour infinite scroll optionnel
  // useEffect(() => {
  //   if (!loadMoreRef.current) return;

  //   const observer = new IntersectionObserver(([entry]) => {
  //     if (entry.isIntersecting && hasNextPage && !isFetching) {
  //       handleLoadMore();
  //     }
  //   });

  //   observer.observe(loadMoreRef.current);
  //   return () => observer.disconnect();
  // }, [hasNextPage, isFetching]);

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={filteredStats.activeAlarms}
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Filtres par site/groupe */}
          <SurveillanceFilters 
            onFilterChange={handleFilterChange}
            sites={sites}
            groups={groups}
          />

          {/* Onglet Vue: Graphiques ou Arborescence */}
          <Tabs
            value={viewMode}
            onValueChange={(v: string) => setViewMode(v as ViewMode)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="graphs">
                {t("tabs.graphs")}
              </TabsTrigger>
              <TabsTrigger value="tree">
                {t("tabs.tree")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </PageHeader>

      {viewMode === "tree" ? (
        <>
          <MonitoringCardsGrid 
            sensors={sensors}
            onSurveillanceToggle={handleSurveillanceToggle}
          />
        </>
      ) : (
        <>
          <SensorsCardsGrid 
            sensors={sensors}
            onSurveillanceToggle={handleSurveillanceToggle}
          />
        </>
      )}
    </>
  );
}
