import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError, type HttpError } from "@/lib/http";

export interface Sensor {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Surveillance_Etat: string | null;
  Surveillance_Etat_Libelle: string | null;
  Id_Module: number | null;
  Sonde_Offset: number | null;
  Lieu: string | null;
  Sonde_Type?: string | null;
}

type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

async function fetchSensors(): Promise<Sensor[]> {
  return getJson<Sensor[]>("/api/sondes");
}

export function useSensors() {
  return useQuery({
    queryKey: ["sensors"],
    queryFn: fetchSensors,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}

export function useUnassignedSensors(params: { page?: number; limit?: number } = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery<Paginated<Sensor>, HttpError>({
    queryKey: ["sensors", "unassigned", page, limit],
    queryFn: async () => {
      return getJson<Paginated<Sensor>>(`/api/sondes/unassigned?page=${page}&limit=${limit}`);
    },
    placeholderData: keepPreviousData,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}

