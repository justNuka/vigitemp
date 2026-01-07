import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface Group {
  Id_Groupe: number;
  Nom_Groupe: string | null;
  Numero_Regroupement: string | null;
  Est_Archive: boolean | null;
  nombre_lieux: number;
}

async function fetchGroups(regroupement?: string): Promise<Group[]> {
  const url = regroupement
    ? `/api/groupes?regroupement=${encodeURIComponent(regroupement)}`
    : "/api/groupes";

  return getJson<Group[]>(url);
}

export function useGroups(regroupement?: string) {
  return useQuery({
    queryKey: ["groups", regroupement],
    queryFn: () => fetchGroups(regroupement),
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
