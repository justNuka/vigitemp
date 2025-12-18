import { useQuery } from "@tanstack/react-query";

interface Alarm {
  Id_Alarme: number;
  Libelle_Lieu: string | null;
  Date_Heure_Debut: Date | string | null;
  Est_Alarme_Vrai: boolean | null;
  Date_Heure_Fin: Date | string | null;
  Est_Acquittee: boolean | null;
}

async function fetchAlarms(): Promise<Alarm[]> {
  const response = await fetch("/api/alarmes");
  if (!response.ok) {
    throw new Error("Failed to fetch alarms");
  }
  return response.json();
}

export function useAlarms() {
  return useQuery({
    queryKey: ["alarms"],
    queryFn: fetchAlarms,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
