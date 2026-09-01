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

export type GroupArchiveStatus = "active" | "archived" | "all";

async function fetchGroups(regroupement?: string, status: GroupArchiveStatus = "active"): Promise<Group[]> {
  const normalizedRegroupement = regroupement && regroupement !== "all" ? regroupement : undefined;
  const params = new URLSearchParams({ status });
  if (normalizedRegroupement) params.set("regroupement", normalizedRegroupement);
  const url = `/api/groupes?${params.toString()}`;

  return getJson<Group[]>(url);
}

export function useGroups(
  regroupement?: string,
  enabled: boolean = true,
  status: GroupArchiveStatus = "active",
) {
  return useQuery({
    queryKey: ["groups", regroupement, status],
    queryFn: () => fetchGroups(regroupement, status),
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
