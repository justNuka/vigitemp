import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface ActuatorType {
  Type: number | null;
  Description: string | null;
  Gere_Relais: boolean | null;
}

async function fetchActuatorTypes(): Promise<ActuatorType[]> {
  return getJson<ActuatorType[]>("/api/actionneurs/types");
}

export function useActuatorTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ["actionneur-types"],
    queryFn: fetchActuatorTypes,
    enabled,
  });
}
