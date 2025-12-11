"use client";

import { useState, useMemo } from "react";
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
    const groups = new Set(locations.map((l) => l.siteGroup).filter(Boolean));
    return Array.from(groups) as string[];
  }, [locations]);

  const filteredSensors = useMemo(() => {
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
            title="Vue grille"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            title="Vue liste"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
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
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {filteredSensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
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
