import { useQuery } from "@tanstack/react-query";
import { fetchJson, isUnauthorizedError } from "@/lib/http";

export interface Measurement {
  ts: string;
  value: number | null;
}

export interface SensorMeasurementsResponse {
  mesures: Measurement[];
  derniereMaj: string;
}

export function useSensorMeasurements(sensorId: number | null) {
  return useQuery<SensorMeasurementsResponse>({
    queryKey: ["sensor", sensorId, "measurements"],
    queryFn: async () => {
      if (!sensorId) {
        return { mesures: [], derniereMaj: new Date().toISOString() };
      }

      return fetchJson<SensorMeasurementsResponse>(`/api/sondes/${sensorId}/mesures`);
    },
    enabled: !!sensorId,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30000),
    staleTime: 0,
    refetchOnMount: "always",
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

