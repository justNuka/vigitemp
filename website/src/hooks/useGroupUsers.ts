import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface GroupUser {
  Id_Utilisateur: number;
  Nom: string | null;
  Prenom: string | null;
  Login: string | null;
}

async function fetchGroupUsers(groupId: number): Promise<GroupUser[]> {
  return getJson<GroupUser[]>(`/api/groupes/${groupId}/utilisateurs`);
}

export function useGroupUsers(groupId?: number) {
  return useQuery({
    queryKey: ["groupUsers", groupId],
    queryFn: () => fetchGroupUsers(groupId!),
    enabled: !!groupId,
  });
}
