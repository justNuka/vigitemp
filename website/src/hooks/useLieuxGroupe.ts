import { useQuery } from "@tanstack/react-query";

export interface LieuGroupe {
  Id_Lieu: number;
  Nom_Lieu: string | null;
}

async function fetchLieuxGroupe(groupeId: number): Promise<LieuGroupe[]> {
  const response = await fetch(`/api/groupes/${groupeId}/lieux`);
  if (!response.ok) {
    throw new Error("Failed to fetch lieux");
  }
  return response.json();
}

export function useLieuxGroupe(groupeId?: number) {
  return useQuery({
    queryKey: ["lieuxGroupe", groupeId],
    queryFn: () => fetchLieuxGroupe(groupeId!),
    enabled: !!groupeId,
  });
}
