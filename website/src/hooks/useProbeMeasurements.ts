import { useQuery } from "@tanstack/react-query";
import { fetchJson, isUnauthorizedError } from "@/lib/http";

export interface Measurement {
  ts: string;
  value: number | null;
}

export interface ProbeMeasurementsResponse {
  mesures: Measurement[];
  derniereMaj: string;
}

export function useProbeMeasurements(probeId: number | null) {
  return useQuery<ProbeMeasurementsResponse>({
    queryKey: ["probe", probeId, "measurements"],
    queryFn: async () => {
      if (!probeId) {
        return { mesures: [], derniereMaj: new Date().toISOString() };
      }

      return fetchJson<ProbeMeasurementsResponse>(`/api/sondes/${probeId}/mesures`);
    },
    enabled: !!probeId,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30000),
    staleTime: 25000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
