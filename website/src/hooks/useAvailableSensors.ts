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
  Est_Sonde_GSO?: boolean | null
  Famille_Sonde?: "CLASSIC" | "GSO" | "GSP" | string | null
}

export function useAvailableSensors(selectedSondeNumeroSerie?: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["available-sensors", selectedSondeNumeroSerie ?? null],
    queryFn: async () => {
      const [unassigned, allSensors] = await Promise.all([
        fetchJson<{ data?: any[] }>("/api/sondes/unassigned?limit=500"),
        selectedSondeNumeroSerie ? fetchJson<any[]>("/api/sondes") : Promise.resolve([]),
      ])

      const unassignedSensors = Array.isArray(unassigned?.data) ? unassigned.data : []
      const selectedSensor = selectedSondeNumeroSerie
        ? (allSensors as any[]).find((sensor) => sensor?.Sonde_Numero_Serie === selectedSondeNumeroSerie)
        : null

      const merged = [...unassignedSensors, ...(selectedSensor ? [selectedSensor] : [])]
      const bySerial = new Map<string, any>()
      for (const sensor of merged) {
        const serial = sensor?.Sonde_Numero_Serie
        if (!serial) continue
        if (!bySerial.has(serial)) bySerial.set(serial, sensor)
      }

      return Array.from(bySerial.values()) as AvailableSensor[]
    },
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60_000),
  })
}

