"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { MonitoringCardsGrid } from "./monitoring-cards-grid";
import { SensorsCardsGrid } from "./sensors-cards-grid";
import type { Site, Group } from "./server-filters";
import { useTranslations } from "next-intl";
import { usePaginatedSensors } from "./_hooks/use-paginated-sensors";
import { useInfiniteScroll } from "./_hooks/use-infinite-scroll";
import { SurveillanceHeaderControls } from "./_components/monitoring-header-controls";
import { SurveillanceLoadMore } from "./_components/monitoring-load-more";
import { applySurveillanceFilters, computeSurveillanceStats, type FilterState } from "./_helpers/monitoring-derived";

type ViewMode = "tree" | "graphs";

interface Stats {
  total: number;
  ok: number;
  warning: number;
  critical: number;
  activeAlarms: number;
}

interface Props {
  initialStats: Stats;
  sites: Site[];
  groups: Group[];
}

export function SurveillancePageClient({ initialStats, sites, groups }: Props) {
  const t = useTranslations("surveillance");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteIds: [], groupIds: [] });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, fetchNextPage, hasNextPage } = usePaginatedSensors({ limit: 100 });

  const paginatedData = useMemo(() => {
    const pages = data?.pages ?? [];
    const sensors = pages.flatMap((p) => p.sensors ?? []);
    const last = pages[pages.length - 1];

    return {
      total: last?.total ?? 0,
      page: last?.page ?? 1,
      limit: last?.limit ?? 100,
      totalPages: last?.totalPages ?? 1,
      sensors,
    };
  }, [data?.pages]);

  const allSensors = paginatedData.sensors;
  const visibleSensors = applySurveillanceFilters(allSensors, filters);
  const filtersActive = filters.siteIds.length > 0 || filters.groupIds.length > 0;

  const visibleStats = computeSurveillanceStats({
    sensors: visibleSensors,
    total: paginatedData.total,
    activeAlarms: initialStats?.activeAlarms ?? 0,
  });

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

  useInfiniteScroll({
    target: loadMoreRef,
    enabled: !!hasNextPage && !isFetching,
    onLoadMore: fetchNextPage,
  });

  return (
    <>
        <PageHeader
          title={t("title")}
          description={t("description")}
          activeAlarms={visibleStats.activeAlarms}
        >
          <SurveillanceHeaderControls
            sites={sites}
            groups={groups}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterChange={handleFilterChange}
            graphsLabel={t("tabs.graphs")}
            treeLabel={t("tabs.tree")}
          />
        </PageHeader>

      {viewMode === "tree" ? (
        <>
          <MonitoringCardsGrid 
            sensors={visibleSensors}
            onSurveillanceToggle={handleSurveillanceToggle}
          />
          <SurveillanceLoadMore
            sentinelRef={loadMoreRef}
            hasNextPage={!!hasNextPage}
            isFetching={isFetching}
            onLoadMore={fetchNextPage}
            label="Charger plus"
          />
        </>
      ) : (
        <>
          <SensorsCardsGrid 
            sensors={visibleSensors}
            onSurveillanceToggle={handleSurveillanceToggle}
          />
          <SurveillanceLoadMore
            sentinelRef={loadMoreRef}
            hasNextPage={!!hasNextPage}
            isFetching={isFetching}
            onLoadMore={fetchNextPage}
            label="Charger plus"
          />
        </>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
        <p>
          {visibleSensors.length} sonde{visibleSensors.length > 1 ? "s" : ""}
          {filtersActive ? <> sur {allSensors.length} au total</> : null}
        </p>
      </div>
    </>
  );
}
