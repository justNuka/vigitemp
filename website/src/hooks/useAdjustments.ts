import { useQuery } from "@tanstack/react-query";
import { fetchJson, HttpError, isUnauthorizedError } from "@/lib/http";

export interface Adjustment {
  Id_Ajustage: number;
  Date_Heure_Ajustage: Date | null;
  Sonde_Numero_Serie: string | null;
  Operateur: string | null;
  Unite: string | null;
  Nb_Decimale: number | null;
}

async function fetchAdjustments(serieNum: string): Promise<Adjustment[]> {
  return fetchJson<Adjustment[]>(
    `/api/sondes/calibrages?sonde=${encodeURIComponent(serieNum)}`,
  );
}

export function useAdjustments(serieNum: string | null) {
  return useQuery({
    queryKey: ["adjustments", serieNum],
    queryFn: () => fetchAdjustments(serieNum!),
    enabled: !!serieNum,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
