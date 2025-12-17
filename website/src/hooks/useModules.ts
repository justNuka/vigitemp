import { useQuery } from "@tanstack/react-query";

export interface Module {
  Id_Module: number;
  Module_Numero_Serie: string | null;
}

async function fetchModules(): Promise<Module[]> {
  const response = await fetch("/api/modules");
  if (!response.ok) {
    throw new Error("Failed to fetch modules");
  }
  return response.json();
}

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });
}
