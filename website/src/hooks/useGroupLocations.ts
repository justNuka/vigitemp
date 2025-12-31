import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface GroupLocation {
  Id_Lieu: number;
  Nom_Lieu: string | null;
}

async function fetchGroupLocations(groupId: number): Promise<GroupLocation[]> {
  return getJson<GroupLocation[]>(`/api/groupes/${groupId}/lieux`);
}

export function useGroupLocations(groupId?: number) {
  return useQuery({
    queryKey: ["groupLocations", groupId],
    queryFn: () => fetchGroupLocations(groupId!),
    enabled: !!groupId,
  });
}
