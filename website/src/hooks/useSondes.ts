import { useQuery } from "@tanstack/react-query";

export interface Sonde {
  Id_Sonde: number;
  Adresse_Sonde: string | null;
  Sonde_Numero_Serie: string | null;
  Port_Serie: string | null;
  Etat_Sonde: string | null;
  Etat_Libelle: string | null;
  Id_Module: number | null;
  Lieu: string | null;
}

async function fetchSondes(): Promise<Sonde[]> {
  const response = await fetch("/api/sondes");
  if (!response.ok) {
    throw new Error("Failed to fetch sondes");
  }
  return response.json();
}

export function useSondes() {
  return useQuery({
    queryKey: ["sondes"],
    queryFn: fetchSondes,
    refetchInterval: 60000, // Refetch every 60 seconds
  });
}
