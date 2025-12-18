import { useQuery } from "@tanstack/react-query";

export interface Lieu {
  Id_Lieu: number;
  Nom_Lieu: string | null;
  Est_Archive: boolean | null;
}

async function fetchLieux(): Promise<Lieu[]> {
  const response = await fetch("/api/lieux");
  if (!response.ok) {
    throw new Error("Failed to fetch lieux");
  }
  return response.json();
}

export function useLieux() {
  return useQuery({
    queryKey: ["lieux"],
    queryFn: fetchLieux,
  });
}
