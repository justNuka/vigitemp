import { useQuery } from "@tanstack/react-query";

export interface Group {
  Id_Groupe: number;
  Nom_Groupe: string;
  Est_Archive: boolean;
}

async function fetchGroups(): Promise<Group[]> {
  const response = await fetch("/api/groupes");
  if (!response.ok) throw new Error("Failed to fetch groups");
  return response.json();
}

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });
}
