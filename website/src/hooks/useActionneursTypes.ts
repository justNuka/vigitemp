import { useQuery } from "@tanstack/react-query";

export interface Actionneur_Type {
  Type: number | null;
  Description: string | null;
  Gere_Relais: boolean | null;
}

async function fetchActionneursTypes(): Promise<Actionneur_Type[]> {
  const response = await fetch("/api/actionneurs/types");
  if (!response.ok) {
    throw new Error("Failed to fetch actionneur types");
  }
  return response.json();
}

export function useActionneursTypes() {
  return useQuery({
    queryKey: ["actionneur-types"],
    queryFn: fetchActionneursTypes,
  });
}
