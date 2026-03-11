"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { MonitoringCardsGrid } from "./monitoring-cards-grid";
import { SensorsCardsGrid } from "./sensors-cards-grid";
import type { Site, Group } from "./server-filters";
import type { SensorWithLocation } from "@/lib/api";
import { useTranslations } from "next-intl";
import { paginatedSensorsPageKey, type PaginatedResponse, usePaginatedSensors } from "./_hooks/use-paginated-sensors";
import { useSurveillanceLiveUpdates } from "./_hooks/use-surveillance-live-updates";
import { SurveillanceHeaderControls } from "./_components/monitoring-header-controls";
import { SurveillanceLoadMore } from "./_components/monitoring-load-more";
import { CurvesOverlayModal } from "./_components/curves-overlay-modal";
import { applySurveillanceFilters, computeSurveillanceStats, type FilterState } from "./_helpers/monitoring-derived";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { LocationFormDialog } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog";
import { getDefaultLocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults";
import type { LocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-types";
import { useAvailableSensors } from "@/hooks/useAvailableSensors";
import { cn } from "@/lib/utils";
import { useGroups } from "@/hooks/useGroups";
import { useModules } from "@/hooks/useModules";
import { useLocations } from "@/hooks/useLocations";
import { useSitesSimple } from "@/hooks/useSites";
import { useUsersForMailing } from "@/hooks/useUsersForMailing";
import { prefetchNextSensorsPage, updateSurveillanceStateInCache, type PaginatedSensorsData } from "./_components/page-client/surveillance-page-helpers";
import { useSurveillanceLocationEditor } from "./_components/page-client/use-surveillance-location-editor";

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
  refreshIntervalSeconds: number;
  showNullNonResponse: boolean;
}


export function SurveillancePageClient({ initialStats, sites, groups, refreshIntervalSeconds, showNullNonResponse: initialShowNullNonResponse }: Props) {
  const t = useTranslations("surveillance");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteIds: [], groupIds: [], sortMode: "status" });
  const [disabledFirst, setDisabledFirst] = useState(true);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showNullNonResponse] = useState(initialShowNullNonResponse);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: locations = [] } = useLocations();

  const locationForm = useForm<LocationFormData>({
    defaultValues: getDefaultLocationFormData(),
  });

  const {
    isEditLocationOpen,
    isLocationSaving,
    handleOpenLocationEdit,
    handleEditLocationSubmit,
    closeEditor,
  } = useSurveillanceLocationEditor({
    locations,
    form: locationForm,
    queryClient,
    t,
  });

  const watchedSensor = locationForm.watch("Sonde_Numero_Serie");
  const shouldLoadLocationFormData = isEditLocationOpen;
  const { data: formSites = [] } = useSitesSimple(shouldLoadLocationFormData);
  const { data: formGroups = [] } = useGroups(undefined, shouldLoadLocationFormData);
  const { data: availableSensors = [] } = useAvailableSensors(
    watchedSensor,
    shouldLoadLocationFormData,
  );
  const { data: modules = [] } = useModules(shouldLoadLocationFormData);
  const { data: mailingUsers = [] } = useUsersForMailing(shouldLoadLocationFormData);

  const { data, isFetching, fetchNextPage, hasNextPage, forceRefresh } = usePaginatedSensors({ limit: 50 });
  useSurveillanceLiveUpdates({ enabled: true, limit: 50 });

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

  const activeAlarmsCount = useMemo(() => {
    if (allSensors.length === 0) {
      return initialStats?.activeAlarms ?? 0;
    }

    const ids = new Set<number>();
    for (const sensor of allSensors) {
      const rawId = sensor.alarmId ?? sensor.location.alarmId ?? null;
      if (typeof rawId === "number" && Number.isFinite(rawId)) {
        ids.add(rawId);
      }
    }
    return ids.size;
  }, [allSensors, initialStats?.activeAlarms]);

  const visibleStats = computeSurveillanceStats({
    sensors: visibleSensors,
    total: paginatedData.total,
    activeAlarms: activeAlarmsCount,
  });

  const overlayLocations = useMemo(() => {
    const map = new Map<number, { id: number; name: string; site?: string | null }>();

    for (const sensor of allSensors) {
      const idLieu = Number(sensor.location.id);
      if (!Number.isFinite(idLieu)) continue;
      if (map.has(idLieu)) continue;

      map.set(idLieu, {
        id: idLieu,
        name: sensor.location.name || sensor.name,
        site: sensor.location.site || null,
      });
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSensors]);


  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Pas besoin de reset page puisque c'est du filtrage client-side
  }, []);

  const performRefresh = useCallback(
    async (silent = false) => {
      await forceRefresh();
      if (!silent) {
        toast.success(t("refresh.refreshed"));
      }
    },
    [forceRefresh, t],
  );

  const handleRefresh = useCallback(async () => {
    await performRefresh(false);
  }, [performRefresh]);


  useEffect(() => {
    const interval = Number.isFinite(refreshIntervalSeconds) ? refreshIntervalSeconds : 15;
    if (interval <= 0) return;

    const timer = window.setInterval(() => {
      void performRefresh(true);
    }, interval * 1000);

    return () => window.clearInterval(timer);
  }, [performRefresh, refreshIntervalSeconds]);

  useEffect(() => {
    const pages = data?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages || last.page >= last.totalPages) return;

    void prefetchNextSensorsPage(queryClient, last.page + 1, paginatedData.limit, paginatedSensorsPageKey);
  }, [data?.pages, paginatedData.limit, queryClient]);

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
      queryClient.setQueryData<PaginatedSensorsData>(["capteurs", "paginated", 100], (data) =>
        updateSurveillanceStateInCache(data, ids, (sensor) => ({
          ...sensor,
          location: {
            ...sensor.location,
            lieuEtat: lieuEtat ?? sensor.location.lieuEtat,
            surveillanceDisabled,
          },
        })),
      );
    },
    [queryClient],
  );

  const updateAlarmCache = useCallback(
    (ids: number[], alarmDisabled: boolean, alarmDisabledUntil: Date | null) => {
      queryClient.setQueryData<PaginatedSensorsData>(["capteurs", "paginated", 100], (data) =>
        updateSurveillanceStateInCache(data, ids, (sensor) => ({
          ...sensor,
          location: {
            ...sensor.location,
            alarmDisabled,
            alarmDisabledUntil,
          },
        })),
      );
    },
    [queryClient],
  );

  const handleSurveillanceToggle = useCallback(
    async (idLieu: number, action: "surveillance" | "alarms", newState: boolean, durationMinutes?: number | null) => {
      if (action === "surveillance") {
        const nextEtat = newState ? "S" : "D"
        try {
          const res = await fetch(`/api/lieux/${idLieu}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Lieu_Etat: nextEtat,
              surveillanceDurationMinutes: newState ? null : durationMinutes ?? null,
            }),
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
        return
      }

      try {
        const res = await fetch(`/api/lieux/${idLieu}/alarm`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disabled: !newState,
            durationMinutes: newState ? null : durationMinutes ?? null,
          }),
        })

        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          console.error("Alarm toggle failed", payload ?? (await res.text()))
        } else if (payload?.ok && payload.data) {
          updateAlarmCache(
            [idLieu],
            payload.data.Notification_Active === false,
            payload.data.Date_Heure_Reactivation_Alarme ? new Date(payload.data.Date_Heure_Reactivation_Alarme) : null,
          )
        }
      } catch (error) {
        console.error("Error toggling alarms:", error)
      }
    },
    [updateAlarmCache, updateSensorsCache],
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

      <LazyMotion features={domAnimation}>
        <m.div variants={fadeInUp} initial="hidden" animate="visible">
          {/* Stats bar */}
          <div className="px-4 md:px-6 pt-3 pb-0">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 font-medium text-muted-foreground hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default">
                {t("stats.total", { count: visibleStats.total })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                {t("stats.ok", { count: visibleStats.ok })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                {t("stats.warning", { count: visibleStats.warning })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-default">
                <span
                  className={cn("h-2 w-2 rounded-full bg-red-500", visibleStats.critical > 0 && "animate-pulse")}
                  aria-hidden="true"
                />
                {t("stats.critical", { count: visibleStats.critical })}
              </span>
            </div>
          </div>

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
              onOpenOverlay={() => setIsOverlayOpen(true)}
            />
          </div>

          {viewMode === "tree" ? (
            <>
              <MonitoringCardsGrid
                sensors={visibleSensors}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                onGroupSurveillanceToggle={handleGroupSurveillanceToggle}
                onEditLocation={handleOpenLocationEdit}
                isLoading={isFetching && visibleSensors.length === 0}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
              />
              <SurveillanceLoadMore
                sentinelRef={loadMoreRef}
                hasNextPage={!!hasNextPage}
                isFetching={isFetching}
                onLoadMore={fetchNextPage}
                label={t("load_more")}
              />
            </>
          ) : (
            <>
              <SensorsCardsGrid
                sensors={visibleSensors}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                onEditLocation={handleOpenLocationEdit}
                isLoading={isFetching && visibleSensors.length === 0}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
              />
              <SurveillanceLoadMore
                sentinelRef={loadMoreRef}
                hasNextPage={!!hasNextPage}
                isFetching={isFetching}
                onLoadMore={fetchNextPage}
                label={t("load_more")}
              />
            </>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
            <p>
              {t("footer.count", { count: visibleSensors.length })}
              {filtersActive ? t("footer.total", { total: allSensors.length }) : null}
            </p>
          </div>
        </m.div>
      </LazyMotion>

      <CurvesOverlayModal
        open={isOverlayOpen}
        onOpenChange={setIsOverlayOpen}
        locations={overlayLocations}
      />

      <LocationFormDialog
        open={isEditLocationOpen}
        mode="edit"
        form={locationForm}
        sites={formSites}
        groups={formGroups}
        availableSensors={availableSensors}
        modules={modules}
        mailingUsers={mailingUsers}
        isSubmitting={isLocationSaving}
        onCancel={closeEditor}
        onSubmit={handleEditLocationSubmit}
      />
    </>
  );
}









