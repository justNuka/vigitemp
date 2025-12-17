"use client";

import { useMemo } from "react";
import { SensorCard } from "@/components/sensor-card";
import { EmptyState } from "@/components/empty-state";
import { Activity } from "lucide-react";
import type { SensorWithLocation } from "@/lib/api";

interface Props {
  sensors: SensorWithLocation[];
}

export function SensorsGridSimple({ sensors }: Props) {
  // Trier: alarmes (critical/warning) d'abord, puis OK
  const sortedSensors = useMemo(() => {
    if (!sensors || !Array.isArray(sensors)) return [];
    
    const sorted = [...sensors];
    sorted.sort((a, b) => {
      const statusPriority: Record<string, number> = {
        'critical': 0,
        'warning': 1,
        'ok': 2,
      };
      return (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3);
    });

    return sorted;
  }, [sensors]);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      {sortedSensors.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Aucun capteur trouvé"
          description="Aucun capteur n'est disponible"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedSensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
            <p>
              {sortedSensors.length} capteur{sortedSensors.length > 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </main>
  );
}
