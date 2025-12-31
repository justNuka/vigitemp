import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface Probe {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Etat_Sonde: string | null;
  Etat_Libelle: string | null;
  Id_Module: number | null;
  Lieu: string | null;
}

async function fetchProbes(): Promise<Probe[]> {
  return getJson<Probe[]>("/api/sondes");
}

export function useProbes() {
  return useQuery({
    queryKey: ["probes"],
    queryFn: fetchProbes,
    refetchInterval: 60000,
  });
}
