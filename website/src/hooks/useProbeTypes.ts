import { useQuery } from "@tanstack/react-query";

export interface ProbeType {
  Sonde_Type: string;
  Libelle_Sonde_Type: string | null;
}

async function fetchProbeTypes(): Promise<ProbeType[]> {
  const response = await fetch("/api/sondes/types");
  if (!response.ok) {
    throw new Error("Failed to fetch probe types");
  }
  return response.json();
}

export function useProbeTypes() {
  return useQuery({
    queryKey: ["probeTypes"],
    queryFn: fetchProbeTypes,
  });
}
