"use client";

import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SensorCard } from "@/components/sensor-card";
import { LocationFilter } from "@/components/location-filter";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, RefreshCw, Activity } from "lucide-react";
import type { SensorWithLocation, Location } from "@/lib/api";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "ok" | "warning" | "critical";

interface Props {
  sensors: SensorWithLocation[];
  locations: Location[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

export function SensorsGrid({ sensors, locations, statusFilter, onStatusFilterChange }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedSiteGroup, setSelectedSiteGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const siteGroups = useMemo(() => {
    if (!locations || !Array.isArray(locations)) return [];
    const groups = new Set(locations.map((l) => l.siteGroup).filter(Boolean));
    return Array.from(groups) as string[];
  }, [locations]);

  const filteredSensors = useMemo(() => {
    if (!sensors || !Array.isArray(sensors)) return [];
    
    let filtered = sensors.filter((sensor) => {
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

    // Tri: alarmes (critical/warning) d'abord, puis OK
    filtered.sort((a, b) => {
      const statusPriority: Record<string, number> = {
        'critical': 0,
        'warning': 1,
        'ok': 2,
      };
      return (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3);
    });

    return filtered;
  }, [sensors, statusFilter, selectedLocationId, selectedSiteGroup, searchQuery]);

  // Virtualisation: calculer le nombre d'items par row selon viewMode
  const columnsPerRow = useMemo(() => {
    if (viewMode === "list") return 1;
    // Grid: on assume ~4 colonnes (sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
    // Adapté pour 4 colonnes par défaut
    return 4;
  }, [viewMode]);

  // Créer les rows virtualisées (grouper les items par columns)
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredSensors.length; i += columnsPerRow) {
      result.push(filteredSensors.slice(i, i + columnsPerRow));
    }
    return result;
  }, [filteredSensors, columnsPerRow]);

  // Virtualizer
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current?.parentElement || null,
    estimateSize: () => viewMode === "grid" ? 400 : 150, // Item height estimation
    overscan: 5, // Charger 5 items en avant/arrière pour le scroll
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <LocationFilter
          locations={locations}
          selectedLocationId={selectedLocationId}
          onLocationChange={setSelectedLocationId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          siteGroups={siteGroups}
          selectedSiteGroup={selectedSiteGroup}
          onSiteGroupChange={setSelectedSiteGroup}
        />

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Vue grille"
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="Vue liste"
            aria-pressed={viewMode === "list"}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.location.reload()} aria-label="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredSensors.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Aucun capteur trouvé"
          description="Aucun capteur ne correspond à vos critères de recherche"
          action={{
            label: "Réinitialiser les filtres",
            onClick: () => {
              onStatusFilterChange("all");
              setSelectedLocationId(null);
              setSelectedSiteGroup(null);
              setSearchQuery("");
            },
          }}
        />
      ) : (
        <>
          <div
            ref={parentRef}
            className="w-full overflow-y-auto max-h-[calc(100vh-200px)]"
          >
            <div
              style={{
                height: `${totalSize}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualItem) => {
                const row = rows[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          : "space-y-4"
                      }
                    >
                      {row.map((sensor) => (
                        <SensorCard key={sensor.id} sensor={sensor} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
            <p>
              {filteredSensors.length} capteur{filteredSensors.length > 1 ? "s" : ""}
              {filteredSensors.length !== sensors.length && (
                <> sur {sensors.length} au total</>
              )}
            </p>
          </div>
        </>
      )}
    </main>
  );
}
