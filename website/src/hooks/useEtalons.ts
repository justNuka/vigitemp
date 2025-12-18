import { useQuery } from "@tanstack/react-query";

export interface Etalon {
  Id_Etalon: number;
  Etalon_Numero_Serie: string | null;
  Etat_Etalon: string | null;
  Port_Serie: string | null;
  Id_Serveur: number | null;
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

async function fetchEtalons(): Promise<Etalon[]> {
  const response = await fetch("/api/etalons");
  if (!response.ok) {
    throw new Error("Failed to fetch etalons");
  }
  return response.json();
}

export function useEtalons() {
  return useQuery({
    queryKey: ["etalons"],
    queryFn: fetchEtalons,
    refetchInterval: 60000,
  });
}
