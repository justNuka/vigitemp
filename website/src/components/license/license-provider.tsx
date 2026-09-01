"use client"

import { createContext, useCallback, useContext, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getJson } from "@/lib/http"
import { LicenseGateLoader } from "@/components/license/license-gate-loader"

export type LicenseInfo = {
  ok: boolean
  reason: string
  licenseId?: string
  customerId?: string
  edition?: string
  maxSensors?: number | null
  concurrentAccess?: string
  options?: string[]
  issuedAtRaw?: string
  expiresAtUtc?: string | null
}

type LicenseState = {
  loading: boolean
  license: LicenseInfo | null
  refresh: () => Promise<void>
}

const LicenseContext = createContext<LicenseState | null>(null)

export function useLicense() {
  const ctx = useContext(LicenseContext)
  if (!ctx) {
    throw new Error("useLicense must be used within LicenseProvider")
  }
  return ctx
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const {
    data: license = null,
    isLoading,
    refetch,
  } = useQuery<LicenseInfo>({
    queryKey: ["license"],
    queryFn: () => getJson<LicenseInfo>("/api/license"),
    staleTime: 10 * 60_000, // 10 minutes — license changes rarely
    gcTime: 30 * 60_000,
    retry: false,
  })

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const value = useMemo(
    () => ({ loading: isLoading, license, refresh }),
    [isLoading, license, refresh]
  )

  // Show the gate only on first load (React Query: isLoading = no data + fetching)
  const showGate = isLoading && license === null

  return (
    <LicenseContext.Provider value={value}>
      {showGate && <LicenseGateLoader />}
      {children}
    </LicenseContext.Provider>
  )
}
