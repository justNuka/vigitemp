import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface ProbeType {
  Sonde_Type: string;
  Libelle_Sonde_Type: string | null;
}

async function fetchProbeTypes(): Promise<ProbeType[]> {
  return getJson<ProbeType[]>("/api/sondes/types");
}

export function useProbeTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: ["probeTypes"],
    queryFn: fetchProbeTypes,
    enabled,
  });
}
