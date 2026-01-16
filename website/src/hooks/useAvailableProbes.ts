"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson, isUnauthorizedError } from "@/lib/http"

export interface AvailableProbe {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Surveillance_Etat: string
  Lieu: string | null
}

export function useAvailableProbes() {
  return useQuery({
    queryKey: ["available-probes"],
    queryFn: async () => {
      const data = await fetchJson<any[]>("/api/sondes")
      return data.filter((probe: any) => !probe.Lieu) as AvailableProbe[]
    },
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000),
  })
}
