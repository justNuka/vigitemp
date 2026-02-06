import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface SensorType {
  Sonde_Type: string;
  Libelle_Sonde_Type: string | null;
}

async function fetchSensorTypes(): Promise<SensorType[]> {
  return getJson<SensorType[]>("/api/sondes/types");
}

export function useSensorTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ["sensorTypes"],
    queryFn: fetchSensorTypes,
    enabled,
  });
}

