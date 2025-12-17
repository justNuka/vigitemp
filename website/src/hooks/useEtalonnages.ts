import { useQuery } from "@tanstack/react-query";

export interface Etalonnage {
  Id_Etalonnage: number;
  Date_Heure_Etalonnage: Date | null;
  Date_Validite: Date | null;
  Sonde_Numero_Serie: string | null;
  Operateur: string | null;
  Incertitude: string | null;
}

async function fetchEtalonnage(serieNum: string): Promise<Etalonnage[]> {
  const response = await fetch(`/api/sondes/etalonnages?serie=${encodeURIComponent(serieNum)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch etalonnages");
  }
  return response.json();
}

export function useEtalonnages(serieNum: string | null) {
  return useQuery({
    queryKey: ["etalonnages", serieNum],
    queryFn: () => fetchEtalonnage(serieNum!),
    enabled: !!serieNum,
    refetchInterval: 60000,
  });
}
