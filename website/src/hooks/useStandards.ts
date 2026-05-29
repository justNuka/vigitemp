import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface Standard {
  Id_Etalon: number;
  Etalon_Numero_Serie: string | null;
  Etat_Etalon: string | null;
  Port_Serie: string | null;
  Id_Worker: number | null;
  Id_Module: number | null;
  Resolution: string | null;
  Incertitude: string | null;
  Nb_Decimale: number | null;
  Est_Archive: boolean | null;
  Date_Certif: string | null;
  Organisme: string | null;
  Num_Certif: string | null;
  Unite: string | null;
}

async function fetchStandards(): Promise<Standard[]> {
  return getJson<Standard[]>("/api/etalons");
}

export function useStandards() {
  return useQuery({
    queryKey: ["etalons"],
    queryFn: fetchStandards,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}

