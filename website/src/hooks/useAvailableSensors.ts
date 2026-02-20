"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchJson, isUnauthorizedError } from "@/lib/http"

export interface AvailableSensor {
  Id_Sonde: number
  Sonde_Numero_Serie: string
  Surveillance_Etat: string
  Lieu: string | null
  Sonde_Type?: string | null
  Id_Module?: number | null
}

export function useAvailableSensors(selectedSondeNumeroSerie?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["available-sensors", selectedSondeNumeroSerie ?? null],
    queryFn: async () => {
      const data = await fetchJson<any[]>("/api/sondes")
      return data.filter((sensor: any) => {
        if (!sensor?.Lieu) return true
        return selectedSondeNumeroSerie && sensor.Sonde_Numero_Serie === selectedSondeNumeroSerie
      }) as AvailableSensor[]
    },
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000),
  })
}

