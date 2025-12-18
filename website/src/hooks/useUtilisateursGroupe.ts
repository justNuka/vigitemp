import { useQuery } from "@tanstack/react-query";

export interface UtilisateurGroupe {
  Id_Utilisateur: number;
  Nom: string | null;
  Prenom: string | null;
  Login: string | null;
}

async function fetchUtilisateursGroupe(groupeId: number): Promise<UtilisateurGroupe[]> {
  const response = await fetch(`/api/groupes/${groupeId}/utilisateurs`);
  if (!response.ok) {
    throw new Error("Failed to fetch utilisateurs");
  }
  return response.json();
}

export function useUtilisateursGroupe(groupeId?: number) {
  return useQuery({
    queryKey: ["utilisateursGroupe", groupeId],
    queryFn: () => fetchUtilisateursGroupe(groupeId!),
    enabled: !!groupeId,
  });
}
