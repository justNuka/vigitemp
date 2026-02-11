import { useQuery } from "@tanstack/react-query";
import { fetchJson, HttpError, isUnauthorizedError } from "@/lib/http";

export interface Calibration {
  Id_Etalonnage: number;
  Date_Heure_Etalonnage: Date | null;
  Date_Validite: Date | null;
  Sonde_Numero_Serie: string | null;
  Operateur: string | null;
  Incertitude: string | null;
}

async function fetchCalibrations(serieNum: string): Promise<Calibration[]> {
  return fetchJson<Calibration[]>(
    `/api/sondes/etalonnages?serie=${encodeURIComponent(serieNum)}`,
  );
}

export function useCalibrations(serieNum: string | null) {
  return useQuery({
    queryKey: ["calibrations", serieNum],
    queryFn: () => fetchCalibrations(serieNum!),
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
