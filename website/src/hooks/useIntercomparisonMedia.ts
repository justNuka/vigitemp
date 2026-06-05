import { useQuery } from "@tanstack/react-query"

import { getJson } from "@/lib/http"

export interface IntercomparisonMedium {
  Id_Milieu: number
  Model: string | null
  Reference: string | null
  Stabilite: number | null
  Homogeneite: number | null
  Contenu: string | null
}

async function fetchIntercomparisonMedia(): Promise<IntercomparisonMedium[]> {
  return getJson<IntercomparisonMedium[]>("/api/metrologie/milieux")
}

export function useIntercomparisonMedia(enabled: boolean = true) {
  return useQuery({
    queryKey: ["metrology-intercomparison-media"],
    queryFn: fetchIntercomparisonMedia,
    enabled,
    staleTime: 60000,
  })
}
