import { useQuery } from "@tanstack/react-query"

import { getJson } from "@/lib/http"

export interface IntercomparisonMedium {
  Id_Milieu: number
  Model: string | null
  Reference: string | null
  Stabilite: number | null
  Homogeneite: number | null
  Contenu: string | null
  Est_Archive: boolean | number | null
}

export type IntercomparisonMediumArchiveStatus = "active" | "archived" | "all"

async function fetchIntercomparisonMedia(status: IntercomparisonMediumArchiveStatus): Promise<IntercomparisonMedium[]> {
  return getJson<IntercomparisonMedium[]>(`/api/metrologie/milieux?status=${status}`)
}

export function useIntercomparisonMedia(
  enabled: boolean = true,
  status: IntercomparisonMediumArchiveStatus = "active",
) {
  return useQuery({
    queryKey: ["metrology-intercomparison-media", status],
    queryFn: () => fetchIntercomparisonMedia(status),
    enabled,
    staleTime: 60000,
  })
}
