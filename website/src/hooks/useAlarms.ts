import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

type AlarmListItem = {
  id: number;
  locationName?: string;
  type: "high" | "low" | "no-response" | "temperature";
  status: "active" | "acknowledged" | "resolved";
  timestamp: string;
  resolvedAt?: string | null;
  minThreshold?: number | null;
  maxThreshold?: number | null;
  unit?: string | null;
  currentValue?: number | null;
  count30Days?: number | null;
};

export interface Alarm {
  Id_Alarme: number;
  Libelle_Lieu: string | null;
  Date_Heure_Debut: string | null;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: string | null;
  Est_Acquittee: boolean | null;
  Type: AlarmListItem["type"];
  Min_Threshold: number | null;
  Max_Threshold: number | null;
  Unite: string | null;
  Derniere_Valeur: number | null;
  Status: AlarmListItem["status"];
  Count_30_Days: number | null;
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
    Type: item.type,
    Min_Threshold: item.minThreshold ?? null,
    Max_Threshold: item.maxThreshold ?? null,
    Unite: item.unit ?? null,
    Derniere_Valeur: item.currentValue ?? null,
    Status: item.status,
    Count_30_Days: item.count30Days ?? null,
  }));

  return { data, pagination: response.pagination };
}

export function useAlarms({ page = 1, limit = 15 }: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["alarms", page, limit],
    queryFn: () => fetchAlarmsPage(page, limit),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
