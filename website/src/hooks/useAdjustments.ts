import { useQuery } from "@tanstack/react-query";
import { fetchJson, isUnauthorizedError } from "@/lib/http";

export interface Adjustment {
  Id_Calibrage: number;
  Date_Heure_Calibrage: Date | null;
  Sonde_Numero_Serie: string | null;
  Operateur: string | null;
  Unite: string | null;
  Nb_Decimale: number | null;
}

async function fetchAdjustments(serieNum: string): Promise<Adjustment[]> {
  return fetchJson<Adjustment[]>(
    `/api/sondes/calibrages?serie=${encodeURIComponent(serieNum)}`,
  );
}

export function useAdjustments(serieNum: string | null) {
  return useQuery({
    queryKey: ["adjustments", serieNum],
    queryFn: () => fetchAdjustments(serieNum!),
    enabled: !!serieNum,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
