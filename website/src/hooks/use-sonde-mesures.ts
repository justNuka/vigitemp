import { useQuery } from "@tanstack/react-query";

export interface Mesure {
  ts: string; // ISO timestamp
  value: number | null;
}

export interface SondeMesuresResponse {
  mesures: Mesure[];
  derniereMaj: string;
}

/**
 * Hook pour récupérer les 125 dernières mesures d'une sonde
 * 
 * Le cache est actualisé automatiquement toutes les 30 secondes
 * 
 * Usage:
 * const { mesures, isLoading, refetch } = useSondeMesures(1027);
 */
export function useSondeMesures(idSonde: number | null) {
  return useQuery<SondeMesuresResponse>({
    queryKey: ["sonde", idSonde, "mesures"],
    queryFn: async () => {
      if (!idSonde) return { mesures: [], derniereMaj: new Date().toISOString() };

      const res = await fetch(`/api/sondes/${idSonde}/mesures`);
      if (!res.ok) {
        throw new Error(`Failed to fetch mesures for sonde ${idSonde}`);
      }
      return res.json();
    },
    enabled: !!idSonde, // Seulement si idSonde est défini
    refetchInterval: 30000, // Actualise toutes les 30 secondes
    staleTime: 25000, // Les données sont considérées périmées après 25s
    gcTime: 5 * 60 * 1000, // Garde en cache pendant 5 min (ancien cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
