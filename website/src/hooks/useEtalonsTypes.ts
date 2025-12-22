import { useQuery } from "@tanstack/react-query";

export interface EtalonType {
  Type_Etalon: string;
  Nom: string | null;
  Descriptif: string | null;
  Resolution: number | null;
}

async function fetchEtalonTypes(): Promise<EtalonType[]> {
  const response = await fetch("/api/etalons/types");
  if (!response.ok) {
    throw new Error("Failed to fetch etalon types");
  }
  return response.json();
}

export function useEtalonsTypes() {
  return useQuery({
    queryKey: ["etalon-types"],
    queryFn: fetchEtalonTypes,
  });
}
