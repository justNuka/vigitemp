import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface StandardType {
  Type_Etalon: string;
  Nom: string | null;
  Descriptif: string | null;
  Resolution: number | null;
  Est_Saisie_Module?: boolean | null;
  Est_Sonde_Externe?: boolean | null;
}

async function fetchStandardTypes(): Promise<StandardType[]> {
  return getJson<StandardType[]>("/api/etalons/types");
}

export function useStandardTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ["etalon-types"],
    queryFn: fetchStandardTypes,
    enabled,
  });
}
