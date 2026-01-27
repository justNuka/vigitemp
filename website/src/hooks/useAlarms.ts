import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

type AlarmListItem = {
  id: number;
  locationName?: string;
  status: "active" | "acknowledged" | "resolved";
  timestamp: string;
  resolvedAt?: string | null;
};

export interface Alarm {
  Id_Alarme: number;
  Libelle_Lieu: string | null;
  Date_Heure_Debut: string | null;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
}

type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export async function fetchAlarmsPage(page: number, limit: number): Promise<Paginated<Alarm>> {
  const response = await getJson<Paginated<AlarmListItem>>(
    `/api/alarmes?page=${page}&limit=${limit}`,
  );

  const data = (response.data ?? []).map((item) => ({
    Id_Alarme: item.id,
    Libelle_Lieu: item.locationName ?? null,
    Date_Heure_Debut: item.timestamp ?? null,
    Est_Alarme_Vrai: item.status === "resolved" ? false : true,
    Date_Heure_Fin: item.resolvedAt ?? null,
    Est_Acquittee: item.status === "acknowledged",
  }));

  return { data, pagination: response.pagination };
}

export function useAlarms({ page = 1, limit = 15 }: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["alarms", page, limit],
    queryFn: () => fetchAlarmsPage(page, limit),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 30000),
  });
}
