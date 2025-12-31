import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

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

async function fetchAlarms(): Promise<Alarm[]> {
  const items = await getJson<AlarmListItem[]>("/api/alarmes");

  return (items ?? []).map((item) => ({
    Id_Alarme: item.id,
    Libelle_Lieu: item.locationName ?? null,
    Date_Heure_Debut: item.timestamp ?? null,
    Est_Alarme_Vrai: item.status === "resolved" ? false : true,
    Date_Heure_Fin: item.resolvedAt ?? null,
    Est_Acquittee: item.status === "acknowledged",
  }));
}

export function useAlarms() {
  return useQuery({
    queryKey: ["alarms"],
    queryFn: fetchAlarms,
    refetchInterval: 30000,
  });
}
