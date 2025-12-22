"use client";

import MonitoringCard from "@/components/monitoring-card";
import { EmptyState } from "@/components/empty-state";
import type { SensorWithLocation } from "@/lib/api";
import { Activity } from "lucide-react";

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

  // ✅ Trier les capteurs: critical → warning → ok
  // Récupère les lieux en priorité dans l'affichage graphique
  const sortedSensors = [...sensors].sort((a, b) => {
    const statusPriority = { critical: 0, warning: 1, ok: 2 };
    const priorityA = statusPriority[a.status] || 2;
    const priorityB = statusPriority[b.status] || 2;
    return priorityA - priorityB;
  });

  return (
    <main className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {sortedSensors.map((sensor) => (
          <MonitoringCard
            key={sensor.id}
            idLieu={parseInt(sensor.id)}
            nomLieu={sensor.name}
            sondeNumeroSerie={(sensor as any).SondeNumeroSerie}
            lieuEtat={(sensor as any).Lieu_Etat}
            lieuType={(sensor.lieuType || null) as any}
            siteName={sensor.location.site || "Site inconnu"}
            groupName={sensor.location.groupName1 || "Sans groupe"}
            status={sensor.status}
            onSurveillanceToggle={onSurveillanceToggle}
          />
        ))}
      </div>
    </main>
  );
}
