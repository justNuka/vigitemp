"use client";

import MonitoringCard from "@/components/monitoring-card";
import type { SensorWithLocation } from "@/lib/api";
import { sortSensorsByStatus } from "./_helpers/monitoring-derived";
import { SurveillanceEmptyState } from "./_components/monitoring-empty-state";

interface SensorsCardsGridProps {
  sensors: SensorWithLocation[];
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void;
}

/**
 * SensorsCardsGrid - Grille plate de toutes les sondes
 * Affiche les mêmes cards que l'arborescence, mais sans distinction de sites/groupes
 * Les infos de site et groupe sont affichées DANS les cards
 * ✅ Trie les capteurs par status (alarmes en priorité)
 */
export function SensorsCardsGrid({ 
  sensors,
  onSurveillanceToggle 
}: SensorsCardsGridProps) {
  if (sensors.length === 0) {
    return <SurveillanceEmptyState title="Aucune sonde" />;
  }

  // ✅ Trier les capteurs: critical → warning → ok
  // Récupère les lieux en priorité dans l'affichage graphique
  const sortedSensors = sortSensorsByStatus(sensors);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {sortedSensors.map((sensor) => (
          <MonitoringCard
            key={sensor.id}
            idLieu={Number(sensor.id)}
            nomLieu={sensor.name}
            lieuType={sensor.lieuType || null}
            siteName={sensor.location.site || "Site inconnu"}
            groupName={sensor.location.groupName1 || "Sans groupe"}
            status={sensor.status}
            onSurveillanceToggle={onSurveillanceToggle}
          />
        ))}
      </div>
    </div>
  );
}
