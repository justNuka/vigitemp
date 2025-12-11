'use client';

import MonitoringCard from "@/components/monitoring-card";
import { EmptyState } from "@/components/empty-state";
import type { SensorWithLocation } from "@/lib/api";
import { Activity } from "lucide-react";

interface MonitoringCardsGridProps {
  sensors: SensorWithLocation[];
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void;
}

export function MonitoringCardsGrid({ 
  sensors,
  onSurveillanceToggle 
}: MonitoringCardsGridProps) {
  if (sensors.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Aucun lieu de surveillance"
          description="Aucune donnée disponible pour le moment."
          icon={Activity}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
        {sensors.map((sensor) => (
          <MonitoringCard
            key={sensor.id}
            idLieu={(sensor as any).IdLieu || parseInt(sensor.id)}
            nomLieu={sensor.name}
            sondeNumeroSerie={(sensor as any).SondeNumeroSerie}
            lieuEtat={(sensor as any).Lieu_Etat}
            onSurveillanceToggle={onSurveillanceToggle}
          />
        ))}
      </div>
    </div>
  );
}
