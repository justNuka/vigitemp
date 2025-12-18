import { useQuery } from "@tanstack/react-query";

export interface Actionneur {
  Id_Actionneur: number;
  Num_Serie: string | null;
  Type: number | null;
  Commentaire: string | null;
  Est_Etat: boolean | null;
  Est_Archive: boolean | null;
  Id_Lieu: number | null;
}

async function fetchActionneurs(): Promise<Actionneur[]> {
  const response = await fetch("/api/actionneurs");
  if (!response.ok) {
    throw new Error("Failed to fetch actionneurs");
  }
  return response.json();
}

export function useActionneurs() {
  return useQuery({
    queryKey: ["actionneurs"],
    queryFn: fetchActionneurs,
    refetchInterval: 60000,
  });
}
