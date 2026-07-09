import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

type AlarmListItem = {
  id: number;
  locationId?: number | null;
  locationName?: string;
  siteId?: number | null;
  siteName?: string | null;
  type: "high" | "low" | "no-response" | "sector" | "module" | "temperature";
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
  Id_Lieu: number | null;
  Id_Site: number | null;
  Libelle_Site: string | null;
  Libelle_Lieu: string | null;
  Date_Heure_Debut: string | null;
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

type AlarmFilterOption = { id: number; name: string };

type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters?: { sites: AlarmFilterOption[]; lieux: AlarmFilterOption[] };
  counts?: { active: number; acknowledged: number; resolved: number };
};

export async function fetchAlarmsPage(
  page: number,
  limit: number,
  status?: "active" | "acknowledged" | "resolved",
  siteId?: string,
  locationId?: string,
): Promise<Paginated<Alarm>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (siteId && siteId !== "all") params.set("siteId", siteId);
  if (locationId && locationId !== "all") params.set("locationId", locationId);

  const response = await getJson<Paginated<AlarmListItem>>(
    `/api/alarmes?${params.toString()}`,
  );

  const data = (response.data ?? []).map((item) => ({
    Id_Alarme: item.id,
    Id_Lieu: item.locationId ?? null,
    Id_Site: item.siteId ?? null,
    Libelle_Site: item.siteName ?? null,
    Libelle_Lieu: item.locationName ?? null,
    Date_Heure_Debut: item.timestamp ?? null,
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

  return {
    data,
    pagination: response.pagination,
    filters: response.filters,
    counts: response.counts,
  };
}

export function useAlarms({
  page = 1,
  limit = 15,
  status,
  siteId = "all",
  locationId = "all",
}: {
  page?: number;
  limit?: number;
  status?: "active" | "acknowledged" | "resolved";
  siteId?: string;
  locationId?: string;
} = {}) {
  return useQuery({
    queryKey: ["alarms", status ?? "all", page, limit, siteId, locationId],
    queryFn: () => fetchAlarmsPage(page, limit, status, siteId, locationId),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
