import { useQuery } from "@tanstack/react-query";
import type { AlarmRow } from "@/components/data-table/alarms-columns";

async function fetchAlarms(): Promise<AlarmRow[]> {
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
