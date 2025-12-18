import { useQuery } from "@tanstack/react-query";

export interface Groupe {
  Id_Groupe: number;
  Nom_Groupe: string | null;
  Numero_Regroupement: string | null;
  Est_Archive: boolean | null;
  nombre_lieux: number;
}

async function fetchGroupes(regroupement?: string): Promise<Groupe[]> {
  const url = new URL("/api/groupes", window.location.origin);
  if (regroupement) {
    url.searchParams.append("regroupement", regroupement);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch groupes");
  }
  return response.json();
}

export function useGroupes(regroupement?: string) {
  return useQuery({
    queryKey: ["groupes", regroupement],
    queryFn: () => fetchGroupes(regroupement),
    refetchInterval: 60000,
  });
}
