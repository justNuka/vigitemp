import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export interface Group {
  Id_Groupe: number;
  Nom_Groupe: string | null;
  Numero_Regroupement: string | null;
  Est_Archive: boolean | null;
  nombre_lieux: number;
  nombre_utilisateurs?: number;
}

async function fetchGroups(regroupement?: string): Promise<Group[]> {
  const normalizedRegroupement = regroupement && regroupement !== "all" ? regroupement : undefined;
  const url = normalizedRegroupement
    ? `/api/groupes?regroupement=${encodeURIComponent(normalizedRegroupement)}`
    : "/api/groupes";

  return getJson<Group[]>(url);
}

export function useGroups(regroupement?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["groups", regroupement],
    queryFn: () => fetchGroups(regroupement),
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
