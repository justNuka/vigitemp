"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson } from "@/lib/http"

export interface AvailableProbe {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Etat_Sonde: string
  Lieu: string | null
}

export function useAvailableProbes() {
  return useQuery({
    queryKey: ["available-probes"],
    queryFn: async () => {
      const data = await fetchJson<any[]>("/api/sondes")
      return data.filter((probe: any) => !probe.Lieu) as AvailableProbe[]
    },
    refetchInterval: 60_000,
  })
}

