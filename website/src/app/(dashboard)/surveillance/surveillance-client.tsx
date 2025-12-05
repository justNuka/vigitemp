"use client";

import { useState, useMemo, useCallback } from "react";
import { useCurrentTime } from "@/hooks/use-current-time";
import { PageHeader } from "@/components/page-header";
import { SensorsGrid } from "./sensors-grid-client";
import { SurveillanceFilters } from "./surveillance-filters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SensorWithLocation, Location } from "@/lib/api";

type StatusFilter = "all" | "ok" | "warning" | "critical";

interface FilterState {
  siteId: number | null;
  groupId: number | null;
}

interface Stats {
  total: number;
  ok: number;
  warning: number;
  critical: number;
  activeAlarms: number;
}

interface Props {
  sensors: SensorWithLocation[];
  locations: Location[];
  stats: Stats;
}

export function SurveillancePageClient({ sensors, locations, stats }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<FilterState>({ siteId: null, groupId: null });
  const currentTime = useCurrentTime();

  // Filtrer les sensors selon site/groupe
  const filteredSensors = useMemo(() => {
    return sensors.filter((sensor) => {
      // Filtre par site
      if (filters.siteId !== null) {
        // Vérifier si la location du sensor correspond au site sélectionné
        const location = locations.find((loc) => loc.id === sensor.location.id);
        if (!location || (location as any).IdSite !== filters.siteId) {
          return false;
        }
      }

      // Filtre par groupe
      if (filters.groupId !== null) {
        // Vérifier si la location du sensor correspond au groupe sélectionné
        const location = locations.find((loc) => loc.id === sensor.location.id);
        if (
          !location ||
          ((location as any).IdGroupe1 !== filters.groupId &&
            (location as any).IdGroupe2 !== filters.groupId)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [sensors, locations, filters]);

  // Recalculer les stats basées sur les sensors filtrés
  const filteredStats = useMemo(() => {
    const ok = filteredSensors.filter((s) => s.status === "ok").length;
    const warning = filteredSensors.filter((s) => s.status === "warning").length;
    const critical = filteredSensors.filter((s) => s.status === "critical").length;

    return {
      total: filteredSensors.length,
      ok,
      warning,
      critical,
      activeAlarms: stats.activeAlarms, // Keep global alarm count
    };
  }, [filteredSensors, stats.activeAlarms]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      <PageHeader
        title="Surveillance"
        description="Suivi en temps réel des sondes et capteurs"
        activeAlarms={stats.activeAlarms}
      >
        <div className="flex flex-col gap-4 w-full">
          {/* Filtres par site/groupe */}
          <SurveillanceFilters onFilterChange={handleFilterChange} />

          {/* Filtres par statut */}
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
        </div>
      </PageHeader>

      <SensorsGrid
        sensors={filteredSensors}
        locations={locations}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </>
  );
}
