"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import { applySurveillanceFilters, computeSurveillanceStats, type FilterState } from "./_helpers/monitoring-derived";
import { getJson, patchJson } from "@/lib/http";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { LocationFormDialog } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog";
import { getDefaultLocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-defaults";
import { mapLocationToFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-mappers";
import type { LocationFormData } from "@/app/[locale]/(admin)/admin/lieux/_components/location-form-types";
import { useAvailableSensors } from "@/hooks/useAvailableSensors";
import { useGroups } from "@/hooks/useGroups";
import { useLocations } from "@/hooks/useLocations";
import { useSitesSimple } from "@/hooks/useSites";

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

  const { data: locations = [] } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [isLocationSaving, setIsLocationSaving] = useState(false);

  const locationForm = useForm<LocationFormData>({
    defaultValues: getDefaultLocationFormData(),
  });
  const watchedSensor = locationForm.watch("Sonde_Numero_Serie");
  const shouldLoadLocationFormData = isEditLocationOpen;
  const { data: formSites = [] } = useSitesSimple(shouldLoadLocationFormData);
  const { data: formGroups = [] } = useGroups(undefined, shouldLoadLocationFormData);
  const { data: availableSensors = [] } = useAvailableSensors(
    watchedSensor,
    shouldLoadLocationFormData,
  );

  const { data, isFetching, fetchNextPage, hasNextPage, refetch } = usePaginatedSensors({ limit: 50 });
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
    const pages = data?.pages ?? [];
    if (pages.length === 0) return;
    const last = pages[pages.length - 1];
    if (!last?.page || !last?.totalPages) return;
    if (last.page >= last.totalPages) return;

    const nextPage = last.page + 1;
    queryClient.prefetchQuery({
      queryKey: paginatedSensorsPageKey(paginatedData.limit, nextPage),
      queryFn: async () => {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(paginatedData.limit),
        });
        return getJson<PaginatedResponse>(`/api/capteurs/paginated?${params}`);
      },
      staleTime: 30 * 60 * 1000,
    });
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


  const handleOpenLocationEdit = useCallback(
    (idLieu: number) => {
      const location = locations.find((item) => item.Id_Lieu === idLieu)
      if (!location) {
        toast.error("Lieu introuvable")
        return
      }
      setSelectedLocationId(idLieu)
      locationForm.reset(mapLocationToFormData(location))
      setIsEditLocationOpen(true)
    },
    [locationForm, locations],
  )

  const handleEditLocationSubmit = useCallback(
    async (values: LocationFormData) => {
      if (!selectedLocationId) return
      setIsLocationSaving(true)
      try {
        await patchJson(`/api/lieux/${selectedLocationId}`, {
          ...values,
          Sonde_Numero_Serie: values.Sonde_Numero_Serie ? values.Sonde_Numero_Serie : null,
        })
        await queryClient.invalidateQueries({ queryKey: ["locations"] })
        await queryClient.invalidateQueries({ queryKey: ["capteurs", "paginated", 100] })
        toast.success("Lieu modifié avec succès")
        window.dispatchEvent(
          new CustomEvent("vigitemp:lieu-updated", {
            detail: { idLieu: selectedLocationId },
          }),
        )
        setIsEditLocationOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur lors de la modification du lieu")
      } finally {
        setIsLocationSaving(false)
      }
    },
    [queryClient, selectedLocationId],
  )
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
            onEditLocation={handleOpenLocationEdit}
            isLoading={isFetching && visibleSensors.length === 0}
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

      <LocationFormDialog
        open={isEditLocationOpen}
        mode="edit"
        form={locationForm}
        sites={formSites}
        groups={formGroups}
        availableSensors={availableSensors}
        isSubmitting={isLocationSaving}
        onCancel={() => setIsEditLocationOpen(false)}
        onSubmit={handleEditLocationSubmit}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
        <p>
          {t("footer.count", { count: visibleSensors.length })}
          {filtersActive ? t("footer.total", { total: allSensors.length }) : null}
        </p>
      </div>
    </>
  );
}








