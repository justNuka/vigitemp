"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useLicense } from "@/components/license/license-provider";
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
import {
  MonitoringGroupToggleDialog,
  type MonitoringGroupModalState,
} from "./_components/monitoring-group-toggle-dialog";
import {
  applySurveillanceFilters,
  areSurveillanceFiltersEqual,
  computeSurveillanceStats,
  dedupeSensorsByLocation,
  type FilterState,
  type SurveillanceStatusFilter,
} from "./_helpers/monitoring-derived";
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
import { isStandardOrExpert } from "@/lib/license-access";
import type { SurveillanceTreeSiteCounter } from "@/lib/api";

type ViewMode = "tree" | "graphs";

interface Stats {
  total: number;
  disabled: number;
  ok: number;
  preAlarm: number;
  ended: number;
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

function aggregateTreeCounterStats(counters: SurveillanceTreeSiteCounter[]) {
  return counters.reduce(
    (acc, site) => {
      acc.disabled += site.stats.disabled;
      acc.ok += site.stats.ok;
      acc.preAlarm += site.stats.preAlarm;
      acc.ended += site.stats.ended;
      acc.critical += site.stats.critical;
      return acc;
    },
    { disabled: 0, ok: 0, preAlarm: 0, ended: 0, critical: 0 },
  );
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

const defaultSurveillanceFilters: FilterState = {
  siteIds: [],
  groupIds: [],
  searchTerm: "",
  sortMode: "status",
  statusFilter: "all",
};

function isValidStatusFilter(value: unknown): value is SurveillanceStatusFilter {
  return value === "all" || value === "disabled" || value === "ok" || value === "preAlarm" || value === "ended" || value === "critical";
}

function getInitialFilters(): FilterState {
  if (typeof window === "undefined") return defaultSurveillanceFilters;

  try {
    const raw = window.localStorage.getItem("surveillance_filters");
    if (!raw) return defaultSurveillanceFilters;

    const parsed = JSON.parse(raw) as Partial<FilterState> | null;
    if (!parsed) return defaultSurveillanceFilters;

    return {
      siteIds: Array.isArray(parsed.siteIds) ? parsed.siteIds.filter((id): id is number => typeof id === "number" && Number.isFinite(id)) : [],
      groupIds: Array.isArray(parsed.groupIds) ? parsed.groupIds.filter((id): id is number => typeof id === "number" && Number.isFinite(id)) : [],
      searchTerm: typeof parsed.searchTerm === "string" ? parsed.searchTerm : "",
      sortMode: parsed.sortMode === "alphabetical" ? "alphabetical" : "status",
      statusFilter: isValidStatusFilter(parsed.statusFilter) ? parsed.statusFilter : "all",
    };
  } catch {
    window.localStorage.removeItem("surveillance_filters");
    return defaultSurveillanceFilters;
  }
}


export function SurveillancePageClient({ initialStats, sites, groups, refreshIntervalSeconds, showNullNonResponse: initialShowNullNonResponse, requireActionComment }: Props) {
  const t = useTranslations("surveillance");
  const tCard = useTranslations("monitoringCard");
  const { license } = useLicense();
  const canUseCurvesOverlay = isStandardOrExpert(license);
  const [viewMode, setViewMode] = useState<ViewMode>("graphs");
  const [filters, setFilters] = useState<FilterState>(() => getInitialFilters());
  const [disabledFirst, setDisabledFirst] = useState<boolean>(() => getInitialDisabledFirst());
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showNullNonResponse] = useState(initialShowNullNonResponse);
  const [groupToggleModal, setGroupToggleModal] = useState<MonitoringGroupModalState | null>(null);
  const [groupDisableDuration, setGroupDisableDuration] = useState("60");
  const [groupActionComment, setGroupActionComment] = useState("");
  const [groupActionCommentError, setGroupActionCommentError] = useState<string | null>(null);
  const [isRangeSelectionActive, setIsRangeSelectionActive] = useState(false);
  const [openDetailModalIds, setOpenDetailModalIds] = useState<number[]>([]);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const nextAutoRefreshAtRef = useRef<number | null>(null);
  const remainingAutoRefreshMsRef = useRef<number | null>(null);
  const stableDisplayRef = useRef<{
    activeSensors: SensorWithLocation[];
    disabledSensors: SensorWithLocation[];
    activeSectionCount: number;
    disabledSectionCount: number;
    visibleStats: Stats;
  }>({
    activeSensors: [],
    disabledSensors: [],
    activeSectionCount: 0,
    disabledSectionCount: 0,
    visibleStats: initialStats,
  });
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
  const serverSearchTerm = filters.searchTerm.trim();
  const hasServerFilters =
    serverFilterSiteIds.length > 0 || serverFilterGroupIds.length > 0 || serverSearchTerm.length > 0;
  const paginatedLimit = hasServerFilters ? 500 : 50;
  const isBackgroundPaused = isEditLocationOpen || isOverlayOpen || isAcknowledgeDialogOpen || openDetailModalIds.length > 0;

  const {
    data: activeData,
    isFetching: isFetchingActive,
    isFetchingNextPage: isFetchingNextActivePage,
    fetchNextPage: fetchNextActivePage,
    hasNextPage: hasNextActivePage,
    forceRefresh: forceRefreshActive,
  } = usePaginatedSensors({
    limit: paginatedLimit,
    siteIds: serverFilterSiteIds,
    groupIds: serverFilterGroupIds,
    surveillanceDisabled: false,
    searchTerm: serverSearchTerm,
  });
  const {
    data: disabledData,
    isFetching: isFetchingDisabled,
    isFetchingNextPage: isFetchingNextDisabledPage,
    fetchNextPage: fetchNextDisabledPage,
    hasNextPage: hasNextDisabledPage,
    forceRefresh: forceRefreshDisabled,
  } = usePaginatedSensors({
    limit: paginatedLimit,
    siteIds: serverFilterSiteIds,
    groupIds: serverFilterGroupIds,
    surveillanceDisabled: true,
    searchTerm: serverSearchTerm,
  });
  useSurveillanceLiveUpdates({ enabled: !isRangeSelectionActive && !isBackgroundPaused });

  useEffect(() => {
    if (!hasServerFilters || isBackgroundPaused) return;
    if (hasNextActivePage && !isFetchingActive && !isFetchingNextActivePage) {
      void fetchNextActivePage();
    }
  }, [
    fetchNextActivePage,
    hasNextActivePage,
    hasServerFilters,
    isBackgroundPaused,
    isFetchingActive,
    isFetchingNextActivePage,
  ]);

  useEffect(() => {
    if (!hasServerFilters || isBackgroundPaused) return;
    if (hasNextDisabledPage && !isFetchingDisabled && !isFetchingNextDisabledPage) {
      void fetchNextDisabledPage();
    }
  }, [
    fetchNextDisabledPage,
    hasNextDisabledPage,
    hasServerFilters,
    isBackgroundPaused,
    isFetchingDisabled,
    isFetchingNextDisabledPage,
  ]);

  const activePaginatedData = useMemo(() => {
    const pages = activeData?.pages ?? [];
    const sensors = pages.flatMap((p) => p.sensors ?? []);
    const last = pages[pages.length - 1];

    return {
      total: last?.total ?? 0,
      page: last?.page ?? 1,
      limit: last?.limit ?? 100,
      totalPages: last?.totalPages ?? 1,
      treeCounters: pages[0]?.treeCounters ?? [],
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
      treeCounters: pages[0]?.treeCounters ?? [],
      sensors,
    };
  }, [disabledData?.pages]);

  const allSensors = useMemo(
    () => [...activePaginatedData.sensors, ...disabledPaginatedData.sensors],
    [activePaginatedData.sensors, disabledPaginatedData.sensors],
  );
  const uniqueSensors = useMemo(() => dedupeSensorsByLocation(allSensors), [allSensors]);
  const baseVisibleSensors = useMemo(
    () =>
      applySurveillanceFilters(uniqueSensors, {
        ...filters,
        siteIds: [],
        groupIds: [],
        searchTerm: "",
        statusFilter: "all",
      }),
    [filters, uniqueSensors],
  );
  const visibleSensors = useMemo(
    () =>
      applySurveillanceFilters(uniqueSensors, {
        ...filters,
        siteIds: [],
        groupIds: [],
        searchTerm: "",
      }),
    [filters, uniqueSensors],
  );
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
  const hasLocalDisplayFilter = filters.searchTerm.trim().length > 0 || filters.statusFilter !== "all";
  const activeSectionCount = hasLocalDisplayFilter ? countVisibleLocations(activeVisibleSensors) : activePaginatedData.total;
  const disabledSectionCount = hasLocalDisplayFilter ? countVisibleLocations(disabledVisibleSensors) : disabledPaginatedData.total;
  const emptyStateDescription = hasServerFilters && visibleSensors.length === 0 ? t("grid.empty_filtered") : undefined;

  const activeAlarmsCount = useMemo(() => {
    if (!hasServerFilters && filters.searchTerm.trim().length === 0) {
      return initialStats?.activeAlarms ?? 0;
    }

    if (baseVisibleSensors.length === 0) {
      return initialStats?.activeAlarms ?? 0;
    }

    const ids = new Set<number>();
    for (const sensor of baseVisibleSensors) {
      if (sensor.status !== "critical" && sensor.status !== "technical") {
        continue;
      }
      const rawId = sensor.alarmId ?? sensor.location.alarmId ?? null;
      if (typeof rawId === "number" && Number.isFinite(rawId)) {
        ids.add(rawId);
      }
    }
    return ids.size;
  }, [baseVisibleSensors, filters.searchTerm, hasServerFilters, initialStats?.activeAlarms]);

  const visibleLocationCount = useMemo(
    () => new Set(baseVisibleSensors.map((sensor) => Number(sensor.location.id ?? sensor.id)).filter((id) => Number.isFinite(id))).size,
    [baseVisibleSensors],
  );
  const totalVisibleLocationCount = useMemo(
    () => (filters.searchTerm.trim().length > 0 ? visibleLocationCount : activePaginatedData.total + disabledPaginatedData.total),
    [activePaginatedData.total, disabledPaginatedData.total, filters.searchTerm, visibleLocationCount],
  );

  const visibleStats = useMemo(() => {
    if (filters.searchTerm.trim().length > 0) {
      return computeSurveillanceStats({
        sensors: baseVisibleSensors,
        total: totalVisibleLocationCount,
        activeAlarms: activeAlarmsCount,
      });
    }

    const treeStats = aggregateTreeCounterStats([
      ...activePaginatedData.treeCounters,
      ...disabledPaginatedData.treeCounters,
    ]);

    return {
      total: totalVisibleLocationCount,
      disabled: disabledPaginatedData.total,
      ok: treeStats.ok,
      preAlarm: treeStats.preAlarm,
      ended: treeStats.ended,
      critical: treeStats.critical,
      activeAlarms: activeAlarmsCount,
    };
  }, [
    activeAlarmsCount,
    activePaginatedData.treeCounters,
    disabledPaginatedData.total,
    disabledPaginatedData.treeCounters,
    filters.searchTerm,
    totalVisibleLocationCount,
    baseVisibleSensors,
  ]);
  const isFetching = isFetchingActive || isFetchingDisabled;
  const showGridSkeleton = isFetching && visibleSensors.length === 0;

  if (!(isFetching && hasServerFilters)) {
    stableDisplayRef.current = {
      activeSensors: activeVisibleSensors,
      disabledSensors: disabledVisibleSensors,
      activeSectionCount,
      disabledSectionCount,
      visibleStats,
    };
  }

  const displayedActiveSensors = hasServerFilters && isFetching ? stableDisplayRef.current.activeSensors : activeVisibleSensors;
  const displayedDisabledSensors = hasServerFilters && isFetching ? stableDisplayRef.current.disabledSensors : disabledVisibleSensors;
  const displayedActiveSectionCount = hasServerFilters && isFetching ? stableDisplayRef.current.activeSectionCount : activeSectionCount;
  const displayedDisabledSectionCount = hasServerFilters && isFetching ? stableDisplayRef.current.disabledSectionCount : disabledSectionCount;
  const displayedVisibleStats = hasServerFilters && isFetching ? stableDisplayRef.current.visibleStats : visibleStats;

  const overlayLocations = useMemo(() => {
    const map = new Map<number, { id: number; name: string; site?: string | null }>();

    for (const sensor of uniqueSensors) {
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
  }, [uniqueSensors]);


  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters((current) => (areSurveillanceFiltersEqual(current, newFilters) ? current : newFilters));
  }, []);

  const handleStatusFilterToggle = useCallback((statusFilter: Exclude<SurveillanceStatusFilter, "all">) => {
    setFilters((current) => {
      const nextFilters: FilterState = {
        ...current,
        statusFilter: current.statusFilter === statusFilter ? "all" : statusFilter,
      };
      return areSurveillanceFiltersEqual(current, nextFilters) ? current : nextFilters;
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("surveillance_filters", JSON.stringify(filters));
  }, [filters]);

  const performRefresh = useCallback(
    async (silent = false) => {
      const activePagesToFetch = Math.max(activeData?.pages?.length ?? 1, 1);
      const disabledPagesToFetch = Math.max(disabledData?.pages?.length ?? 1, 1);

      await Promise.all([
        forceRefreshActive({
          fetchAllPages: hasServerFilters,
          pagesToFetch: activePagesToFetch,
        }),
        forceRefreshDisabled({
          fetchAllPages: hasServerFilters,
          pagesToFetch: disabledPagesToFetch,
        }),
      ]);
      window.dispatchEvent(new CustomEvent("vigitemp:measurements-refresh"));
      if (!silent) {
        toast.success(t("refresh.refreshed"));
      }
    },
    [activeData?.pages?.length, disabledData?.pages?.length, forceRefreshActive, forceRefreshDisabled, hasServerFilters, t],
  );

  const handleRefresh = useCallback(async () => {
    await performRefresh(false);
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
    const handleAcknowledgeDialogState = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      setIsAcknowledgeDialogOpen(customEvent.detail?.open === true);
    };

    window.addEventListener("vigitemp:alarm-acknowledge-dialog", handleAcknowledgeDialogState as EventListener);
    return () => window.removeEventListener("vigitemp:alarm-acknowledge-dialog", handleAcknowledgeDialogState as EventListener);
  }, []);

  useEffect(() => {
    const interval = Number.isFinite(refreshIntervalSeconds) ? refreshIntervalSeconds : 60;
    const intervalMs = Math.max(interval, 1) * 1000;
    let refreshTimer: number | undefined;
    let cancelled = false;

    const clearTimer = () => {
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer);
        refreshTimer = undefined;
      }
    };

    if (interval <= 0 || isRangeSelectionActive) {
      clearTimer();
      nextAutoRefreshAtRef.current = null;
      remainingAutoRefreshMsRef.current = null;
      return clearTimer;
    }

    if (isBackgroundPaused) {
      clearTimer();
      const nextRefreshAt = nextAutoRefreshAtRef.current;
      remainingAutoRefreshMsRef.current =
        nextRefreshAt == null ? intervalMs : Math.max(nextRefreshAt - Date.now(), 1000);
      return clearTimer;
    }

    const scheduleNextRefresh = (delayMs: number) => {
      clearTimer();
      nextAutoRefreshAtRef.current = Date.now() + delayMs;
      refreshTimer = window.setTimeout(() => {
        void performRefresh(true).finally(() => {
          if (!cancelled) {
            scheduleNextRefresh(intervalMs);
          }
        });
      }, delayMs);
    };

    const initialDelay = remainingAutoRefreshMsRef.current ?? intervalMs;
    remainingAutoRefreshMsRef.current = null;
    scheduleNextRefresh(initialDelay);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [isBackgroundPaused, isRangeSelectionActive, performRefresh, refreshIntervalSeconds]);

  useEffect(() => {
    const pages = activeData?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages || last.page >= last.totalPages) return;

    void prefetchNextSensorsPage(queryClient, last.page + 1, activePaginatedData.limit, paginatedSensorsPageKey, {
      siteIds: serverFilterSiteIds,
      groupIds: serverFilterGroupIds,
      surveillanceDisabled: false,
      searchTerm: serverSearchTerm,
    });
  }, [activeData?.pages, activePaginatedData.limit, queryClient, serverFilterGroupIds, serverFilterSiteIds, serverSearchTerm]);

  useEffect(() => {
    const pages = disabledData?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages || last.page >= last.totalPages) return;

    void prefetchNextSensorsPage(queryClient, last.page + 1, disabledPaginatedData.limit, paginatedSensorsPageKey, {
      siteIds: serverFilterSiteIds,
      groupIds: serverFilterGroupIds,
      surveillanceDisabled: true,
      searchTerm: serverSearchTerm,
    });
  }, [disabledData?.pages, disabledPaginatedData.limit, queryClient, serverFilterGroupIds, serverFilterSiteIds, serverSearchTerm]);

  const handleDetailsModalStateChange = useCallback((idLieu: number, open: boolean) => {
    setOpenDetailModalIds((current) => {
      const alreadyOpen = current.includes(idLieu);
      if (open && !alreadyOpen) return [...current, idLieu];
      if (!open && alreadyOpen) return current.filter((id) => id !== idLieu);
      return current;
    });
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
      surveillanceDisabledSince?: Date | null,
      surveillanceDisabledUntil?: Date | null,
      surveillanceDisabledBy?: string | null,
      surveillanceDisabledComment?: string | null,
    ) => {
      queryClient.setQueriesData<PaginatedSensorsData>({ queryKey: ["capteurs", "paginated"] }, (data) =>
        updateSurveillanceStateInCache(data, ids, (sensor) => ({
          ...sensor,
          location: {
            ...sensor.location,
            lieuEtat: lieuEtat ?? sensor.location.lieuEtat,
            surveillanceDisabled,
            surveillanceDisabledSince:
              surveillanceDisabledSince === undefined
                ? sensor.location.surveillanceDisabledSince
                : surveillanceDisabledSince,
            surveillanceDisabledUntil:
              surveillanceDisabledUntil === undefined
                ? sensor.location.surveillanceDisabledUntil
                : surveillanceDisabledUntil,
            surveillanceDisabledBy:
              surveillanceDisabledBy === undefined
                ? sensor.location.surveillanceDisabledBy
                : surveillanceDisabledBy,
            surveillanceDisabledComment:
              surveillanceDisabledComment === undefined
                ? sensor.location.surveillanceDisabledComment
                : surveillanceDisabledComment,
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

  const openGroupSurveillanceToggle = useCallback(
    (groupId: number, isCurrentlyDisabled: boolean) => {
      const groupName = groups.find((group) => group.id === groupId)?.name ?? `Groupe ${groupId}`;
      setGroupDisableDuration("60");
      setGroupActionComment("");
      setGroupActionCommentError(null);
      setGroupToggleModal({
        groupId,
        groupName,
        isActive: !isCurrentlyDisabled,
      });
    },
    [groups],
  );

  const handleGroupSurveillanceToggleConfirm = useCallback(async () => {
    if (!groupToggleModal) return;

    const normalizedActionComment = groupActionComment.trim();
    if (requireActionComment && normalizedActionComment.length === 0) {
      setGroupActionCommentError(t("action_comment.required_error"));
      return;
    }

    try {
      const disabled = groupToggleModal.isActive;
      const durationMinutes =
        disabled && groupDisableDuration !== "manual" ? Number.parseInt(groupDisableDuration, 10) : null;

      const response = await fetch(`/api/groupes/${groupToggleModal.groupId}/surveillance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disabled,
          durationMinutes: Number.isFinite(durationMinutes ?? NaN) ? durationMinutes : null,
          commentaireAction: normalizedActionComment || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error?.message || t("refresh.error"));
        return;
      }

      setGroupActionComment("");
      setGroupActionCommentError(null);
      setGroupToggleModal(null);

      if (payload?.data?.lieuIds) {
        const surveillanceDisabledSince = payload.data.surveillanceDisabledSince
          ? parseDbDateTime(payload.data.surveillanceDisabledSince)
          : null
        const surveillanceDisabledUntil = payload.data.surveillanceDisabledUntil
          ? parseDbDateTime(payload.data.surveillanceDisabledUntil)
          : null
        updateSensorsCache(
          payload.data.lieuIds as number[],
          payload.data.lieuEtat ?? (disabled ? "D" : "S"),
          Boolean(payload.data.surveillanceDisabled),
          surveillanceDisabledSince,
          surveillanceDisabledUntil,
          payload.data.surveillanceDisabledBy ?? null,
          payload.data.surveillanceDisabledComment ?? null,
        );
      }
    } catch (error) {
      console.error("Group surveillance toggle failed", error);
      setGroupToggleModal(null);
    }
  }, [groupActionComment, groupDisableDuration, groupToggleModal, requireActionComment, t, updateSensorsCache]);




  // Important: do not auto-load all pages. The sentinel can be visible without any user scroll,
  // which causes the app to fetch *every* page (and therefore "all sensors").
  // We keep manual "Charger plus" only.

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        activeAlarms={displayedVisibleStats.activeAlarms}
      />

      <LazyMotion features={domAnimation}>
        <m.div variants={fadeInUp} initial="hidden" animate="visible">
          {/* Stats bar */}
          <div className="px-4 md:px-6 pt-3 pb-0">
            <TooltipProvider>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterToggle("disabled")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-700 dark:bg-slate-500/10 dark:text-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150",
                        filters.statusFilter === "disabled" && "ring-2 ring-slate-400 ring-offset-1 dark:ring-slate-300",
                      )}
                    >
                      {t("stats.disabled", { count: displayedVisibleStats.disabled })}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.disabled_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterToggle("ok")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150",
                        filters.statusFilter === "ok" && "ring-2 ring-blue-400 ring-offset-1 dark:ring-blue-300",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                      {t("stats.ok", { count: displayedVisibleStats.ok })}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.ok_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterToggle("preAlarm")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150",
                        filters.statusFilter === "preAlarm" && "ring-2 ring-amber-400 ring-offset-1 dark:ring-amber-300",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                      {t("stats.pre_alarm", { count: displayedVisibleStats.preAlarm })}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.pre_alarm_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterToggle("ended")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150",
                        filters.statusFilter === "ended" && "ring-2 ring-violet-400 ring-offset-1 dark:ring-violet-300",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                      {t("stats.ended", { count: displayedVisibleStats.ended })}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t("stats_descriptions.ended_locations")}</p></TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleStatusFilterToggle("critical")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150",
                        filters.statusFilter === "critical" && "ring-2 ring-red-400 ring-offset-1 dark:ring-red-300",
                      )}
                    >
                      <span
                        className={cn("h-2 w-2 rounded-full bg-red-500", displayedVisibleStats.critical > 0 && "animate-pulse")}
                        aria-hidden="true"
                      />
                      {t("stats.critical", { count: displayedVisibleStats.critical })}
                    </button>
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
              filters={filters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onFilterChange={handleFilterChange}
              onRefresh={handleRefresh}
              isRefreshing={isFetching}
              graphsLabel={t("tabs.graphs")}
              treeLabel={t("tabs.tree")}
              orderToggleLabel={disabledFirst ? t("grid.toggle_active_first") : t("grid.toggle_disabled_first")}
              onToggleOrder={handleToggleOrder}
              onOpenOverlay={canUseCurvesOverlay ? () => setIsOverlayOpen(true) : undefined}
            />
          </div>

          {viewMode === "tree" ? (
            <>
              <MonitoringCardsGrid
                activeSensors={displayedActiveSensors}
                disabledSensors={displayedDisabledSensors}
                activeTotalCount={displayedActiveSectionCount}
                disabledTotalCount={displayedDisabledSectionCount}
                emptyDescription={emptyStateDescription}
                activeTreeCounters={filters.searchTerm.trim() ? [] : activePaginatedData.treeCounters}
                disabledTreeCounters={filters.searchTerm.trim() ? [] : disabledPaginatedData.treeCounters}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                onGroupSurveillanceToggle={openGroupSurveillanceToggle}
                requireActionComment={requireActionComment}
                onEditLocation={handleOpenLocationEdit}
                onDetailsModalStateChange={handleDetailsModalStateChange}
                backgroundPaused={isBackgroundPaused}
                isLoading={showGridSkeleton}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
                activeFooter={
                  <SurveillanceLoadMore
                    sentinelRef={loadMoreRef}
                    hasNextPage={!!hasNextActivePage}
                    isFetching={isFetchingNextActivePage}
                    onLoadMore={() => void fetchNextActivePage()}
                    label={t("load_more_active")}
                  />
                }
                disabledFooter={
                  <SurveillanceLoadMore
                    hasNextPage={!!hasNextDisabledPage}
                    isFetching={isFetchingNextDisabledPage}
                    onLoadMore={() => void fetchNextDisabledPage()}
                    label={t("load_more_disabled")}
                  />
                }
              />
            </>
          ) : (
            <>
              <SensorsCardsGrid
                activeSensors={displayedActiveSensors}
                disabledSensors={displayedDisabledSensors}
                activeTotalCount={displayedActiveSectionCount}
                disabledTotalCount={displayedDisabledSectionCount}
                emptyDescription={emptyStateDescription}
                disabledFirst={disabledFirst}
                onSurveillanceToggle={handleSurveillanceToggle}
                requireActionComment={requireActionComment}
                onEditLocation={handleOpenLocationEdit}
                onDetailsModalStateChange={handleDetailsModalStateChange}
                backgroundPaused={isBackgroundPaused}
                isLoading={showGridSkeleton}
                showNullNonResponse={showNullNonResponse}
                sortMode={filters.sortMode}
                activeFooter={
                  <SurveillanceLoadMore
                    sentinelRef={loadMoreRef}
                    hasNextPage={!!hasNextActivePage}
                    isFetching={isFetchingNextActivePage}
                    onLoadMore={() => void fetchNextActivePage()}
                    label={t("load_more_active")}
                  />
                }
                disabledFooter={
                  <SurveillanceLoadMore
                    hasNextPage={!!hasNextDisabledPage}
                    isFetching={isFetchingNextDisabledPage}
                    onLoadMore={() => void fetchNextDisabledPage()}
                    label={t("load_more_disabled")}
                  />
                }
              />
            </>
          )}

        </m.div>
      </LazyMotion>

      {canUseCurvesOverlay ? (
        <CurvesOverlayModal
          open={isOverlayOpen}
          onOpenChange={setIsOverlayOpen}
          locations={overlayLocations}
        />
      ) : null}

        <MonitoringGroupToggleDialog
          modal={groupToggleModal}
          disableDuration={groupDisableDuration}
        actionComment={groupActionComment}
        actionCommentError={groupActionCommentError}
        requireActionComment={requireActionComment}
        onDisableDurationChange={setGroupDisableDuration}
        onActionCommentChange={(value) => {
          setGroupActionComment(value)
          if (groupActionCommentError) {
            setGroupActionCommentError(null)
          }
        }}
        onClose={() => {
          setGroupToggleModal(null)
          setGroupActionComment("")
          setGroupActionCommentError(null)
          }}
          onConfirm={() => void handleGroupSurveillanceToggleConfirm()}
          t={(key, values) => t(key, values as Record<string, string | number>)}
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
