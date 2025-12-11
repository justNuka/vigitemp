"use client";

import { useRef, useCallback } from "react";
import { useVirtualizedPagination } from "@/hooks/use-virtualized-pagination";
import type { SensorWithLocation } from "@/lib/api";

interface MonitoringCardsGridProps {
  sensors: SensorWithLocation[];
  children?: (sensor: SensorWithLocation, index: number) => React.ReactNode;
}

/**
 * Composant de grille avec chargement virtualisé et responsif
 * - Détecte la taille de l'écran pour afficher le bon nombre de cards initialement
 * - Charge progressivement au scroll
 * - Utilise Intersection Observer pour un scroll fluide
 */
export function MonitoringCardsGridVirtualized({
  sensors,
  children,
}: MonitoringCardsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const pagination = useVirtualizedPagination({
    totalItems: sensors.length,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  });

  // Afficher seulement les cards nécessaires
  const displayedSensors = pagination.getDisplayedItems(sensors);

  return (
    <div ref={containerRef} className="w-full">
      {/* Grille des cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {displayedSensors.map((sensor, index) => (
          <div key={`${sensor.location.id}-${index}`}>
            {children ? children(sensor, index) : null}
          </div>
        ))}
      </div>

      {/* Indicateur de chargement et bouton "Charger plus" */}
      {pagination.hasMore && (
        <div
          ref={pagination.loadMoreRef}
          className="flex flex-col items-center justify-center py-8 gap-4"
        >
          {/* Affiche le nombre de cards chargées */}
          <div className="text-sm text-muted-foreground">
            Affichage {pagination.displayedCount} sur {pagination.totalItems} capteurs
          </div>

          {/* Skeleton loader en attente de chargement automatique */}
          <div className="flex gap-4">
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="h-2 w-2 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}

      {/* Message quand tout est chargé */}
      {!pagination.hasMore && sensors.length > 0 && (
        <div className="flex justify-center py-8 text-sm text-muted-foreground">
          Tous les {sensors.length} capteurs chargés
        </div>
      )}
    </div>
  );
}
