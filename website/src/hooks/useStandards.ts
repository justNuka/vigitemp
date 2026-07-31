import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface Standard {
  Id_Etalon: number;
  Etalon_Numero_Serie: string | null;
  Type_Etalon: string | null;
  Etat_Etalon: string | null;
  Port_Serie: string | null;
  Id_Worker: number | null;
  Id_Module: number | null;
  Est_Sonde_Externe: boolean | null;
  Resolution: string | null;
  Incertitude: string | null;
  Nb_Decimale: number | null;
  Est_Archive: boolean | null;
  Coeff_A: number | null;
  Coeff_B: number | null;
  Coeff_C: number | null;
  Incertitude_Max: number | null;
  Date_Certif: string | null;
  Organisme: string | null;
  Num_Certif: string | null;
  Unite: string | null;
  Pdf_Id: number | null;
  Pdf_Name: string | null;
}

export type StandardArchiveStatus = "active" | "archived" | "all";

async function fetchStandards(status: StandardArchiveStatus): Promise<Standard[]> {
  return getJson<Standard[]>(`/api/etalons?status=${status}`);
}

export function useStandards(status: StandardArchiveStatus = "active") {
  return useQuery({
    queryKey: ["etalons", status],
    queryFn: () => fetchStandards(status),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}

