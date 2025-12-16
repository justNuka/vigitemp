"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentTime } from "@/hooks/use-current-time";
import { PageHeader } from "@/components/page-header";
import { SensorsGrid } from "./sensors-grid-client";
import { MonitoringCardsGrid } from "./monitoring-cards-grid";
import { SurveillanceFilters } from "./surveillance-filters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { SensorWithLocation, Location } from "@/lib/api";
import type { Site, Group } from "./server-filters";

type StatusFilter = "all" | "ok" | "warning" | "critical";
type ViewMode = "status" | "graphs";

interface FilterState {
  siteId: number | null;
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteId: null, groupIds: [] });
  const [page, setPage] = useState(1);
  const [cachedSensors, setCachedSensors] = useState<SensorWithLocation[]>([]); // ✅ Cache local
  const currentTime = useCurrentTime();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Charger les sensors paginés via API
  const { data: paginatedData, isFetching, hasNextPage, fetchNextPage, error, isError } = useQuery({
    queryKey: ["sensors", page, filters.siteId, filters.groupIds],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (filters.siteId) {
        params.append("siteId", filters.siteId.toString());
      }
      if (filters.groupIds.length > 0) {
        params.append("groupIds", filters.groupIds.join(","));
      }
      const res = await fetch(`/api/sensors/paginated?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sensors");
      return res.json() as Promise<PaginatedResponse>;
    },
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le refetch
  });

  // ✅ Maintenir le cache local synchronisé avec paginatedData
  useEffect(() => {
    if (paginatedData?.sensors && Array.isArray(paginatedData.sensors) && paginatedData.sensors.length > 0) {
      setCachedSensors(paginatedData.sensors);
    }
  }, [paginatedData?.sensors]);

  // Récupérer les sensors actuels et les locations
  // ✅ Utiliser le cache local au lieu de paginatedData
  const sensors = useMemo(() => {
    return cachedSensors.length > 0 ? cachedSensors : (paginatedData?.sensors ?? []);
  }, [cachedSensors, paginatedData?.sensors]);

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
    setPage(1); // Reset à la première page quand les filtres changent
  }, []);

  const handleSurveillanceToggle = useCallback(async (idLieu: number, newState: boolean) => {
    try {
      console.log(`Toggle surveillance for lieu ${idLieu}: ${newState ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error("Error toggling surveillance:", error);
    }
  }, []);

  // Charger la page suivante
  const handleLoadMore = () => {
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  };

  // Intersection Observer pour infinite scroll optionnel
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetching) {
        handleLoadMore();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching]);

  return (
    <>
      <PageHeader
        title="Surveillance"
        description="Suivi en temps réel des sondes et capteurs"
        activeAlarms={filteredStats.activeAlarms}
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Filtres par site/groupe */}
          <SurveillanceFilters 
            onFilterChange={handleFilterChange}
            sites={sites}
            groups={groups}
          />

          {/* Onglet Vue: Graphiques ou Status */}
          <Tabs
            value={viewMode}
            onValueChange={(v: string) => setViewMode(v as ViewMode)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="graphs">
                Graphiques
              </TabsTrigger>
              <TabsTrigger value="status">
                Statuts
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filtres par statut (uniquement en mode status) */}
          {viewMode === "status" && (
            <Tabs
              value={statusFilter}
              onValueChange={(v: string) => setStatusFilter(v as StatusFilter)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all" data-testid="tab-all">
                  Toutes ({filteredStats.total})
                </TabsTrigger>
                <TabsTrigger value="ok" data-testid="tab-ok" className="gap-1">
                  <span className="hidden sm:inline">OK</span>
                  <span className="text-success">({filteredStats.ok})</span>
                </TabsTrigger>
                <TabsTrigger value="warning" data-testid="tab-warning" className="gap-1">
                  <span className="hidden sm:inline">Attention</span>
                  <span className="text-warning">({filteredStats.warning})</span>
                </TabsTrigger>
                <TabsTrigger value="critical" data-testid="tab-critical" className="gap-1">
                  <span className="hidden sm:inline">Critique</span>
                  <span className="text-destructive">({filteredStats.critical})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </PageHeader>

      {viewMode === "status" ? (
        <>
          <SensorsGrid
            sensors={sensors}
            locations={locations}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          {/* Load More Button */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? "Chargement..." : "Charger plus"}
              </Button>
            </div>
          )}
          {!hasNextPage && page > 1 && (
            <div className="text-center py-6 text-muted-foreground">
              Toutes les sondes sont chargées
            </div>
          )}
        </>
      ) : (
        <>
          <MonitoringCardsGrid 
            sensors={sensors}
            onSurveillanceToggle={handleSurveillanceToggle}
          />
          {/* Load More Button */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? "Chargement..." : "Charger plus"}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
