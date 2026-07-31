import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface Actuator {
  Id_Actionneur: number;
  Num_Serie: string | null;
  Type: number | null;
  Commentaire: string | null;
  Est_Etat: boolean | null;
  Est_Archive: boolean | null;
  Id_Lieu: number | null;
}

export type ActuatorArchiveStatus = "active" | "archived" | "all";

async function fetchActuators(status: ActuatorArchiveStatus): Promise<Actuator[]> {
  return getJson<Actuator[]>(`/api/actionneurs?status=${status}`);
}

export function useActuators(status: ActuatorArchiveStatus = "active") {
  return useQuery({
    queryKey: ["actionneurs", status],
    queryFn: () => fetchActuators(status),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
