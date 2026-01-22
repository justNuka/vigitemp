"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson, isUnauthorizedError } from "@/lib/http"

export interface AvailableProbe {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Surveillance_Etat: string
  Lieu: string | null
  Sonde_Type?: string | null
}

export function useAvailableProbes(selectedSondeNumeroSerie?: string | null) {
  return useQuery({
    queryKey: ["available-probes", selectedSondeNumeroSerie ?? null],
    queryFn: async () => {
      const data = await fetchJson<any[]>("/api/sondes")
      return data.filter((probe: any) => {
        if (!probe?.Lieu) return true
        return selectedSondeNumeroSerie && probe.Sonde_Numero_Serie === selectedSondeNumeroSerie
      }) as AvailableProbe[]
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000),
  })
}
