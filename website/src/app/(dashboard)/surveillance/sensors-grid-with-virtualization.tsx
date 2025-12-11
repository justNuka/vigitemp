"use client";

import { useRef } from "react";
import { usePaginatedSensors } from "@/hooks/use-paginated-sensors";
import { useVirtualizedPagination } from "@/hooks/use-virtualized-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { SensorWithLocation } from "@/lib/api";

interface SensorsGridWithVirtualizationProps {
  siteId: number | null;
  groupIds: number[];
  children: (sensor: SensorWithLocation, index: number) => React.ReactNode;
}

/**
 * Composant complet qui combine:
 * 1. Chargement paginé des données via API (React Query)
 * 2. Virtualisation et responsive layout (hook useVirtualizedPagination)
 * 3. Automatic scroll loading avec Intersection Observer
 * 
 * Résultat: Les utilisateurs voient:
 * - Sur desktop (xl): 5 cards par rangée, ~2 rangées = 10 cards chargées initialement
 * - Sur tablet (md): 3 cards par rangée, ~2 rangées = 6 cards chargées initialement
 * - Sur mobile (sm): 2 cards par rangée, ~2 rangées = 4 cards chargées initialement
 * 
 * En scrollant, le reste se charge automatiquement
 */
export function SensorsGridWithVirtualization({
  siteId,
  groupIds,
  children,
}: SensorsGridWithVirtualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger les sensors avec pagination
  const {
    sensors,
    total,
    hasMore,
    isLoading,
    isFetching,
    error,
    loadMore,
    isLoadingMore,
  } = usePaginatedSensors({
    siteId,
    groupIds,
    limit: 24, // Charger 24 à la fois pour plus d'efficacité
  });

  // Calculer la virtualisation locale (combien afficher immédiatement)
  const virtualization = useVirtualizedPagination({
    totalItems: sensors.length,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
  });

  // Afficher seulement ce qui est visible + 1 buffer
  const displayedSensors = virtualization.getDisplayedItems(sensors);

  // Handlers pour charger plus quand nécessaire
  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      loadMore();
    }
  };

  // État de chargement initial
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-lg" />
        ))}
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-semibold">Erreur de chargement</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Pas de données
  if (sensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Aucun capteur trouvé</p>
        <p className="text-sm">Ajustez vos filtres ou chargez des données</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Grille des cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {displayedSensors.map((sensor, index) => (
          <div key={`${sensor.location.id}-${index}`}>
            {children(sensor, index)}
          </div>
        ))}
      </div>

      {/* Zone de chargement automatique */}
      {hasMore && (
        <div
          ref={virtualization.loadMoreRef}
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          {isFetching ? (
            <>
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-primary/70 animate-bounce" />
                <div
                  className="h-3 w-3 rounded-full bg-primary/50 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="h-3 w-3 rounded-full bg-primary/30 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <p className="text-sm text-muted-foreground">Chargement des capteurs...</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Affichage {displayedSensors.length} sur {total} capteurs • Scroll pour charger plus
            </p>
          )}
        </div>
      )}

      {/* Tous les data chargés */}
      {!hasMore && sensors.length > 0 && (
        <div className="flex justify-center py-8 text-sm text-muted-foreground">
          ✓ Tous les {total} capteurs chargés
        </div>
      )}
    </div>
  );
}
