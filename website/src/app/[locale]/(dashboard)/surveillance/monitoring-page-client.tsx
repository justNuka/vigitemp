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
import { useForm, useWatch } from "react-hook-form";
import { LocationFormDialog } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog";
import { getDefaultLocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults";
import type { LocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-types";
import { useAvailableSensors } from "@/hooks/useAvailableSensors";
import { cn } from "@/lib/utils";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGroups } from "@/hooks/useGroups";
import { useModules } from "@/hooks/useModules";
import { useLocations } from "@/hooks/useLocations";
import { useSitesSimple } from "@/hooks/useSites";
import { useUsersForMailing } from "@/hooks/useUsersForMailing";
import { useLocationTemplates } from "@/hooks/useLocationTemplates";
import { prefetchNextSensorsPage, updateSurveillanceStateInCache, type PaginatedSensorsData } from "./_components/page-client/surveillance-page-helpers";
import { useSurveillanceLocationEditor } from "./_components/page-client/use-surveillance-location-editor";
import { parseDbDateTime } from "@/lib/date-display";

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
  requireActionComment: boolean;
}

const getInitialDisabledFirst = (): boolean => {
  if (typeof document === "undefined") {
    return true;
  }

  const match = document.cookie.match(/(?:^|; )surveillance_disabled_first=([^;]*)/);
  if (!match) {
    document.cookie = "surveillance_disabled_first=1; path=/; max-age=31536000";
    return true;
  }

  return decodeURIComponent(match[1]) === "1";
};


export function SurveillancePageClient({ initialStats, sites, groups, refreshIntervalSeconds, showNullNonResponse: initialShowNullNonResponse, requireActionComment }: Props) {
  const t = useTranslations("surveillance");
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>({ siteIds: [], groupIds: [], searchTerm: "", sortMode: "status" });
  const [disabledFirst, setDisabledFirst] = useState<boolean>(() => getInitialDisabledFirst());
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showNullNonResponse] = useState(initialShowNullNonResponse);
  const [isRangeSelectionActive, setIsRangeSelectionActive] = useState(false);
  const [isModalRefreshPending, setIsModalRefreshPending] = useState(false);
  const [openDetailModalIds, setOpenDetailModalIds] = useState<number[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const performRefreshRef = useRef<(silent?: boolean) => Promise<void>>(async () => undefined);
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
    requireActionComment,
  });

  const watchedSensor = useWatch({ control: locationForm.control, name: "Sonde_Numero_Serie" });
  const shouldLoadLocationFormData = isEditLocationOpen;
  const { data: formSites = [] } = useSitesSimple(shouldLoadLocationFormData);
  const { data: formGroups = [] } = useGroups(undefined, shouldLoadLocationFormData);
  const { data: availableSensors = [] } = useAvailableSensors(
    watchedSensor,
    shouldLoadLocationFormData,
  );
  const { data: modules = [] } = useModules(shouldLoadLocationFormData);
  const { data: mailingUsers = [] } = useUsersForMailing(shouldLoadLocationFormData);
  const { data: locationTemplates = [] } = useLocationTemplates(shouldLoadLocationFormData);
  const serverFilterSiteIds = filters.siteIds;
  const serverFilterGroupIds = filters.groupIds;
  const isBackgroundPaused = isEditLocationOpen || isOverlayOpen || openDetailModalIds.length > 0;

  const {
    data: activeData,
    isFetching: isFetchingActive,
    isFetchingNextPage: isFetchingNextActivePage,
    fetchNextPage: fetchNextActivePage,
    hasNextPage: hasNextActivePage,
    forceRefresh: forceRefreshActive,
  } = usePaginatedSensors({
    limit: 50,
    siteIds: serverFilterSiteIds,
    groupIds: serverFilterGroupIds,
    surveillanceDisabled: false,
  });
  const {
    data: disabledData,
    isFetching: isFetchingDisabled,
    isFetchingNextPage: isFetchingNextDisabledPage,
    fetchNextPage: fetchNextDisabledPage,
    hasNextPage: hasNextDisabledPage,
    forceRefresh: forceRefreshDisabled,
  } = usePaginatedSensors({
    limit: 50,
    siteIds: serverFilterSiteIds,
    groupIds: serverFilterGroupIds,
    surveillanceDisabled: true,
  });
  useSurveillanceLiveUpdates({ enabled: !isRangeSelectionActive && !isBackgroundPaused });

  const activePaginatedData = useMemo(() => {
    const pages = activeData?.pages ?? [];
    const sensors = pages.flatMap((p) => p.sensors ?? []);
    const last = pages[pages.length - 1];

    return {
      total: last?.total ?? 0,
      page: last?.page ?? 1,
      limit: last?.limit ?? 100,
      totalPages: last?.totalPages ?? 1,
      sensors,
    };
  }, [activeData?.pages]);
  const disabledPaginatedData = useMemo(() => {
    const pages = disabledData?.pages ?? [];
    const sensors = pages.flatMap((p) => p.sensors ?? []);
    const last = pages[pages.length - 1];

    return {
      total: last?.total ?? 0,
      page: last?.page ?? 1,
      limit: last?.limit ?? 100,
      totalPages: last?.totalPages ?? 1,
      sensors,
    };
  }, [disabledData?.pages]);

  const allSensors = useMemo(
    () => [...activePaginatedData.sensors, ...disabledPaginatedData.sensors],
    [activePaginatedData.sensors, disabledPaginatedData.sensors],
  );
  const visibleSensors = applySurveillanceFilters(allSensors, { ...filters, siteIds: [], groupIds: [] });
  const activeVisibleSensors = useMemo(
    () => visibleSensors.filter((sensor) => !sensor.location.surveillanceDisabled),
    [visibleSensors],
  );
  const disabledVisibleSensors = useMemo(
    () => visibleSensors.filter((sensor) => sensor.location.surveillanceDisabled),
    [visibleSensors],
  );
  const countVisibleLocations = useCallback(
    (sensors: SensorWithLocation[]) =>
      new Set(sensors.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size,
    [],
  );
  const activeSectionCount = filters.searchTerm.trim().length > 0 ? countVisibleLocations(activeVisibleSensors) : activePaginatedData.total;
  const disabledSectionCount = filters.searchTerm.trim().length > 0 ? countVisibleLocations(disabledVisibleSensors) : disabledPaginatedData.total;

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

  const visibleLocationCount = useMemo(() => new Set(visibleSensors.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size, [visibleSensors]);
  const totalVisibleLocationCount = useMemo(
    () => (filters.searchTerm.trim().length > 0 ? visibleLocationCount : activePaginatedData.total + disabledPaginatedData.total),
    [activePaginatedData.total, disabledPaginatedData.total, filters.searchTerm, visibleLocationCount],
  );

  const visibleStats = computeSurveillanceStats({
    sensors: visibleSensors,
    total: totalVisibleLocationCount,
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
  }, []);

  const performRefresh = useCallback(
    async (silent = false) => {
      await Promise.all([forceRefreshActive(), forceRefreshDisabled()]);
      window.dispatchEvent(new CustomEvent("vigitemp:measurements-refresh"));
      if (!silent) {
        toast.success(t("refresh.refreshed"));
      }
    },
    [forceRefreshActive, forceRefreshDisabled, t],
  );

  const handleRefresh = useCallback(async () => {
    await performRefresh(false);
  }, [performRefresh]);

  useEffect(() => {
    performRefreshRef.current = performRefresh;
  }, [performRefresh]);


  useEffect(() => {
    const handleRangeLock = (event: Event) => {
      const customEvent = event as CustomEvent<{ active?: boolean }>;
      setIsRangeSelectionActive(customEvent.detail?.active === true);
    };

    window.addEventListener("vigitemp:surveillance-range-lock", handleRangeLock as EventListener);
    return () => window.removeEventListener("vigitemp:surveillance-range-lock", handleRangeLock as EventListener);
  }, []);

  useEffect(() => {
    const interval = Number.isFinite(refreshIntervalSeconds) ? refreshIntervalSeconds : 15;
    if (interval <= 0 || isRangeSelectionActive || isBackgroundPaused) return;

    const timer = window.setInterval(() => {
      void performRefresh(true);
    }, interval * 1000);

    return () => window.clearInterval(timer);
  }, [isBackgroundPaused, isRangeSelectionActive, performRefresh, refreshIntervalSeconds]);

  const previousBackgroundPaused = useRef(false);
  useEffect(() => {
    let refreshTimer: number | undefined;
    if (previousBackgroundPaused.current && !isBackgroundPaused) {
      refreshTimer = window.setTimeout(() => {
        setIsModalRefreshPending(true);
        void performRefreshRef.current(true).finally(() => {
          setIsModalRefreshPending(false);
        });
      }, 0);
    }
    previousBackgroundPaused.current = isBackgroundPaused;
    return () => {
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [isBackgroundPaused]);

  useEffect(() => {
    const pages = activeData?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages || last.page >= last.totalPages) return;

    void prefetchNextSensorsPage(queryClient, last.page + 1, activePaginatedData.limit, paginatedSensorsPageKey, {
      siteIds: serverFilterSiteIds,
      groupIds: serverFilterGroupIds,
      surveillanceDisabled: false,
    });
  }, [activeData?.pages, activePaginatedData.limit, queryClient, serverFilterGroupIds, serverFilterSiteIds]);

  useEffect(() => {
    const pages = disabledData?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages || last.page >= last.totalPages) return;

    void prefetchNextSensorsPage(queryClient, last.page + 1, disabledPaginatedData.limit, paginatedSensorsPageKey, {
      siteIds: serverFilterSiteIds,
      groupIds: serverFilterGroupIds,
      surveillanceDisabled: true,
    });
  }, [disabledData?.pages, disabledPaginatedData.limit, queryClient, serverFilterGroupIds, serverFilterSiteIds]);

  const handleDetailsModalStateChange = useCallback((idLieu: number, open: boolean) => {
    setOpenDetailModalIds((current) => {
      const alreadyOpen = current.includes(idLieu);
      if (open && !alreadyOpen) return [...current, idLieu];
      if (!open && alreadyOpen) return current.filter((id) => id !== idLieu);
      return current;
    });
  }, []);

  const isFetching = isFetchingActive || isFetchingDisabled;
  const showGridSkeleton = isModalRefreshPending || (isFetching && visibleSensors.length === 0);

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
      queryClient.setQueriesData<PaginatedSensorsData>({ queryKey: ["capteurs", "paginated"] }, (data) =>
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
      queryClient.setQueriesData<PaginatedSensorsData>({ queryKey: ["capteurs", "paginated"] }, (data) =>
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
    async (
      idLieu: number,
      action: "surveillance" | "alarms",
      newState: boolean,
      durationMinutes?: number | null,
      actionCommentInput?: string | null,
    ) => {
      const actionComment = typeof actionCommentInput === "string" ? actionCommentInput.trim() : ""
      if (requireActionComment && actionComment.length === 0) {
        toast.error(t("action_comment.required_error"))
        return
      }

      if (action === "surveillance") {
        const nextEtat = newState ? "S" : "D"
        try {
          const res = await fetch(`/api/lieux/${idLieu}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Lieu_Etat: nextEtat,
              surveillanceDurationMinutes: newState ? null : durationMinutes ?? null,
              Commentaire_Action: actionComment || null,
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
            commentaireAction: actionComment || null,
          }),
        })

        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          console.error("Alarm toggle failed", payload ?? (await res.text()))
        } else if (payload?.ok && payload.data) {
          updateAlarmCache(
            [idLieu],
            payload.data.Notification_Active === false,
            payload.data.Date_Heure_Reactivation_Alarme ? parseDbDateTime(payload.data.Date_Heure_Reactivation_Alarme) : null,
          )
        }
      } catch (error) {
        console.error("Error toggling alarms:", error)
      }
    },
    [requireActionComment, t, updateAlarmCache, updateSensorsCache],
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
            <TooltipProvider>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-help">
                      {t("stats.total", { count: visibleStats.total })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.total_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-help">
                      <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                      {t("stats.ok", { count: visibleStats.ok })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.ok_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-help">
                      <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                      {t("stats.warning", { count: visibleStats.warning })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.alert_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 cursor-help">
                      <span
                        className={cn("h-2 w-2 rounded-full bg-red-500", visibleStats.critical > 0 && "animate-pulse")}
                        aria-hidden="true"
                      />
                      {t("stats.critical", { count: visibleStats.critical })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.critical_locations")}</p></TooltipContent>
                </UITooltip>
              </div>
            </TooltipProvider>
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
                activeSensors={activeVisibleSensors}
                disabledSensors={disabledVisibleSensors}
                activeTotalCount={activeSectionCount}
                disabledTotalCount={disabledSectionCount}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                requireActionComment={requireActionComment}
                onEditLocation={handleOpenLocationEdit}
                onDetailsModalStateChange={handleDetailsModalStateChange}
                backgroundPaused={isBackgroundPaused}
                isLoading={showGridSkeleton}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
              />
              <SurveillanceLoadMore
                sentinelRef={loadMoreRef}
                hasNextPage={!!hasNextActivePage}
                isFetching={isFetchingNextActivePage}
                onLoadMore={() => void fetchNextActivePage()}
                label={t("load_more_active")}
              />
              <SurveillanceLoadMore
                hasNextPage={!!hasNextDisabledPage}
                isFetching={isFetchingNextDisabledPage}
                onLoadMore={() => void fetchNextDisabledPage()}
                label={t("load_more_disabled")}
              />
            </>
          ) : (
            <>
              <SensorsCardsGrid
                activeSensors={activeVisibleSensors}
                disabledSensors={disabledVisibleSensors}
                activeTotalCount={activeSectionCount}
                disabledTotalCount={disabledSectionCount}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                requireActionComment={requireActionComment}
                onEditLocation={handleOpenLocationEdit}
                onDetailsModalStateChange={handleDetailsModalStateChange}
                backgroundPaused={isBackgroundPaused}
                isLoading={showGridSkeleton}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
              />
              <SurveillanceLoadMore
                sentinelRef={loadMoreRef}
                hasNextPage={!!hasNextActivePage}
                isFetching={isFetchingNextActivePage}
                onLoadMore={() => void fetchNextActivePage()}
                label={t("load_more_active")}
              />
              <SurveillanceLoadMore
                hasNextPage={!!hasNextDisabledPage}
                isFetching={isFetchingNextDisabledPage}
                onLoadMore={() => void fetchNextDisabledPage()}
                label={t("load_more_disabled")}
              />
            </>
          )}

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
        locationTemplates={locationTemplates}
        isSubmitting={isLocationSaving}
        showActionComment
        requireActionComment={requireActionComment}
        onCancel={closeEditor}
        onSubmit={handleEditLocationSubmit}
      />
    </>
  );
}









