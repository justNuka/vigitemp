"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { MonitoringCardsGrid } from "./monitoring-cards-grid";
import { SensorsCardsGrid } from "./sensors-cards-grid";
import type { Site, Group } from "./server-filters";
import type { SensorWithLocation } from "@/lib/api";
import { useTranslations } from "next-intl";
import { usePaginatedSensors } from "./_hooks/use-paginated-sensors";
import { useSurveillanceLiveUpdates } from "./_hooks/use-surveillance-live-updates";
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

type PaginatedSensorsData = {
  pages: Array<{
    sensors: SensorWithLocation[];
    [key: string]: unknown;
  }>;
  pageParams: unknown[];
};

export function SurveillancePageClient({ initialStats, sites, groups }: Props) {
  const t = useTranslations("surveillance");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteIds: [], groupIds: [] });
  const [disabledFirst, setDisabledFirst] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isFetching, fetchNextPage, hasNextPage, refetch } = usePaginatedSensors({ limit: 100 });
  useSurveillanceLiveUpdates({ enabled: true, limit: 100 });

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )surveillance_disabled_first=([^;]*)/);
    if (!match) {
      document.cookie = "surveillance_disabled_first=1; path=/; max-age=31536000";
      setDisabledFirst(true);
      return;
    }
    setDisabledFirst(decodeURIComponent(match[1]) === "1");
  }, []);

  const handleToggleOrder = useCallback(() => {
    setDisabledFirst((current) => {
      const next = !current;
      document.cookie = `surveillance_disabled_first=${next ? "1" : "0"}; path=/; max-age=31536000`;
      return next;
    });
  }, []);

  const updateSensorsCache = useCallback(
    (
      ids: number[],
      lieuEtat: string | null | undefined,
      surveillanceDisabled: boolean,
    ) => {
      const idSet = new Set(ids.map(String));
      queryClient.setQueryData<PaginatedSensorsData>(["capteurs", "paginated", 100], (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            sensors: (page.sensors ?? []).map((sensor) => {
              if (!idSet.has(sensor.id)) return sensor;
              return {
                ...sensor,
                location: {
                  ...sensor.location,
                  lieuEtat: lieuEtat ?? sensor.location.lieuEtat,
                  surveillanceDisabled,
                },
              };
            }),
          })),
        };
      });
    },
    [queryClient],
  );

  const updateAlarmCache = useCallback(
    (ids: number[], alarmDisabled: boolean, alarmDisabledUntil: Date | null) => {
      const idSet = new Set(ids.map(String));
      queryClient.setQueryData<PaginatedSensorsData>(["capteurs", "paginated", 100], (data) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            sensors: (page.sensors ?? []).map((sensor) => {
              if (!idSet.has(sensor.id)) return sensor;
              return {
                ...sensor,
                location: {
                  ...sensor.location,
                  alarmDisabled,
                  alarmDisabledUntil,
                },
              };
            }),
          })),
        };
      });
    },
    [queryClient],
  );

  const handleSurveillanceToggle = useCallback(
    async (idLieu: number, newState: boolean) => {
      const nextEtat = newState ? "S" : "D"
      try {
        const res = await fetch(`/api/lieux/${idLieu}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Lieu_Etat: nextEtat }),
        })

        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          console.error("Surveillance toggle failed", payload ?? (await res.text()))
        } else if (payload?.ok && payload.data) {
          updateSensorsCache([idLieu], payload.data.Lieu_Etat ?? null, payload.data.Lieu_Etat === "D")
        }
      } catch (error) {
        console.error("Error toggling surveillance:", error)
      }
    },
    [updateSensorsCache],
  );

  const handleGroupSurveillanceToggle = useCallback(
    async (groupId: number, newState: boolean, durationMinutes?: number | null) => {
      try {
        const res = await fetch(`/api/groupes/${groupId}/alarm`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disabled: !newState,
            durationMinutes: newState ? null : durationMinutes ?? null,
          }),
        })

        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          console.error("Group alarm toggle failed", payload ?? (await res.text()))
        } else if (payload?.ok && payload.data?.lieuIds) {
          updateAlarmCache(
            payload.data.lieuIds,
            payload.data.alarmDisabled === true,
            payload.data.alarmDisabledUntil ? new Date(payload.data.alarmDisabledUntil) : null,
          )
        }
      } catch (error) {
        console.error("Error toggling group surveillance:", error)
      }
    },
    [updateAlarmCache],
  );

  // Important: do not auto-load all pages. The sentinel can be visible without any user scroll,
  // which causes the app to fetch *every* page (and therefore "all sensors").
  // We keep manual "Charger plus" only.

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={visibleStats.activeAlarms}
      />
      <div className="h-px bg-slate-200 dark:bg-slate-800" />
      <div className="px-4 md:px-6 py-4">
        <SurveillanceHeaderControls
          sites={sites}
          groups={groups}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
          graphsLabel={t("tabs.graphs")}
          treeLabel={t("tabs.tree")}
          orderToggleLabel={disabledFirst ? t("grid.toggle_active_first") : t("grid.toggle_disabled_first")}
          onToggleOrder={handleToggleOrder}
        />
      </div>

      {viewMode === "tree" ? (
        <>
          <MonitoringCardsGrid 
            sensors={visibleSensors}
            disabledFirst={disabledFirst}
            onSurveillanceToggle={handleSurveillanceToggle}
            onGroupSurveillanceToggle={handleGroupSurveillanceToggle}
            isLoading={isFetching && visibleSensors.length === 0}
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
            disabledFirst={disabledFirst}
            onSurveillanceToggle={handleSurveillanceToggle}
            isLoading={isFetching && visibleSensors.length === 0}
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
