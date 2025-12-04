"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { SensorCard } from "@/components/sensor-card";
import { LocationFilter } from "@/components/location-filter";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Activity, Grid3X3, List, RefreshCw } from "lucide-react";
import { sensorsApi, locationsApi, alarmsApi } from "@/lib/api";
import type { SensorWithLocation } from "@/lib/api";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "ok" | "warning" | "critical";

export default function SurveillancePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedSiteGroup, setSelectedSiteGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sensors, isLoading: sensorsLoading, refetch } = useQuery({
    queryKey: ["sensors"],
    queryFn: () => sensorsApi.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.getAll(),
  });

  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
  });

  const activeAlarms = alarms?.filter((a) => a.status === "active") || [];

  const siteGroups = useMemo(() => {
    if (!locations) return [];
    const groups = new Set(locations.map((l) => l.siteGroup).filter(Boolean));
    return Array.from(groups) as string[];
  }, [locations]);

  const filteredSensors = useMemo(() => {
    if (!sensors) return [];
    
    return sensors.filter((sensor) => {
      if (statusFilter !== "all" && sensor.status !== statusFilter) {
        return false;
      }
      
      if (selectedLocationId && sensor.location.id !== selectedLocationId) {
        return false;
      }
      
      if (selectedSiteGroup && sensor.location.siteGroup !== selectedSiteGroup) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = sensor.name.toLowerCase().includes(query);
        const matchesLocation = sensor.location.name.toLowerCase().includes(query);
        if (!matchesName && !matchesLocation) {
          return false;
        }
      }
      
      return true;
    });
  }, [sensors, statusFilter, selectedLocationId, selectedSiteGroup, searchQuery]);

  const statusCounts = useMemo(() => {
    if (!sensors) return { ok: 0, warning: 0, critical: 0 };
    return sensors.reduce(
      (acc, s) => {
        acc[s.status]++;
        return acc;
      },
      { ok: 0, warning: 0, critical: 0 }
    );
  }, [sensors]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Surveillance"
        description="Suivi en temps réel des sondes et capteurs"
        activeAlarms={activeAlarms.length}
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v: string) => setStatusFilter(v as StatusFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all" data-testid="tab-all">
              Toutes ({sensors?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="ok" data-testid="tab-ok" className="gap-1">
              <span className="hidden sm:inline">OK</span>
              <span className="text-success">({statusCounts.ok})</span>
            </TabsTrigger>
            <TabsTrigger value="warning" data-testid="tab-warning" className="gap-1">
              <span className="hidden sm:inline">Attention</span>
              <span className="text-warning">({statusCounts.warning})</span>
            </TabsTrigger>
            <TabsTrigger value="critical" data-testid="tab-critical" className="gap-1">
              <span className="hidden sm:inline">Critique</span>
              <span className="text-destructive">({statusCounts.critical})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <LocationFilter
            locations={locations || []}
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            siteGroups={siteGroups}
            selectedSiteGroup={selectedSiteGroup}
            onSiteGroupChange={setSelectedSiteGroup}
            className="flex-1"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {sensorsLoading ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
          }>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SensorCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredSensors.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Aucune sonde trouvée"
            description={
              searchQuery || selectedLocationId || statusFilter !== "all"
                ? "Modifiez vos filtres pour voir plus de résultats"
                : "Aucune sonde n'est configurée pour le moment"
            }
            action={
              (searchQuery || selectedLocationId || statusFilter !== "all")
                ? {
                    label: "Réinitialiser les filtres",
                    onClick: () => {
                      setSearchQuery("");
                      setSelectedLocationId(null);
                      setSelectedSiteGroup(null);
                      setStatusFilter("all");
                    },
                  }
                : undefined
            }
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            }
          >
            {filteredSensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <p>
            {filteredSensors.length} sonde{filteredSensors.length > 1 ? "s" : ""} affichée
            {filteredSensors.length > 1 ? "s" : ""}
            {filteredSensors.length !== sensors?.length && (
              <> sur {sensors?.length} au total</>
            )}
          </p>
          <p className="hidden sm:block">
            Dernière mise à jour : {new Date().toLocaleTimeString("fr-FR")}
          </p>
        </div>
      </main>
    </div>
  );
}

function SensorCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}
