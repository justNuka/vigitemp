import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface Actuator {
  Id_Actionneur: number;
  Num_Serie: string | null;
  Type: number | null;
  Commentaire: string | null;
  Est_Etat: boolean | null;
  Est_Archive: boolean | null;
  Id_Lieu: number | null;
}

async function fetchActuators(): Promise<Actuator[]> {
  return getJson<Actuator[]>("/api/actionneurs");
}

export function useActuators() {
  return useQuery({
    queryKey: ["actionneurs"],
    queryFn: fetchActuators,
    refetchInterval: 60000,
  });
}
