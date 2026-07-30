"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useId, useRef, useState } from "react";
import { GlobalAppEffects } from "@/components/global-app-effects";
import { VersionChangelogModal } from "@/components/version-changelog-modal";
import { LicenseProvider } from "@/components/license/license-provider";
import { TimezoneProvider } from "@/components/timezone-provider";
import { AppAccessProvider } from "@/components/access/app-access-provider";
import { AdjustmentOperationTimer } from "@/components/metrology/adjustment-operation-timer";

let queryClientInstanceCounter = 0

const RQ_PERSIST_KEY = "vigitemp_rq_cache_v1"
const RQ_PERSIST_TTL_MS = 5 * 60 * 1000

type PersistedQueryCache = {
  v: 1
  savedAt: number
  data: {
    alarmsActive?: unknown
    sensorsPaginated100?: unknown
  }
}

function safeLoadPersistedCache(): PersistedQueryCache | null {
  if (typeof window === "undefined") return null
  if (process.env.NODE_ENV === "production") return null
  try {
    const raw = window.sessionStorage.getItem(RQ_PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedQueryCache
    if (!parsed || parsed.v !== 1) return null
    if (typeof parsed.savedAt !== "number") return null
    if (Date.now() - parsed.savedAt > RQ_PERSIST_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function safeSavePersistedCache(cache: PersistedQueryCache) {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV === "production") return
  try {
    window.sessionStorage.setItem(RQ_PERSIST_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

export function Providers({
  children,
  timezone,
}: {
  children: React.ReactNode;
  timezone?: string | null;
}) {
  const reactId = useId()
  const instanceNumberRef = useRef<number | null>(null)
  if (instanceNumberRef.current === null) {
    instanceNumberRef.current = ++queryClientInstanceCounter
  }
  const queryClientId = `qc${reactId}-${instanceNumberRef.current}`
  const [queryClient] = useState(
    () =>
      (() => {
        const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: false,
          },
        },
        })

        // Dev-only: best-effort cache restore to mitigate dev auto-refresh / reload loops.
        // We only persist a small subset of heavy queries needed by /surveillance.
        if (process.env.NODE_ENV !== "production") {
          const persisted = safeLoadPersistedCache()
          if (persisted?.data?.alarmsActive !== undefined) {
            client.setQueryData(["alarms", "active"], persisted.data.alarmsActive)
          }
          if (persisted?.data?.sensorsPaginated100 !== undefined) {
            client.setQueryData(["capteurs", "paginated", 100], persisted.data.sensorsPaginated100)
          }
        }

        return client
      })()
  );

  if (typeof window !== "undefined") {
    window.__vigitempQueryClientId = queryClientId
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    if (process.env.NODE_ENV === "production") return

    // Used to detect full reloads vs. App Router refresh/remounts.
    // Must be generated in an effect (Next PPR forbids Date.now()/crypto in render).
    const bootId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    window.__vigitempBootId = bootId
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (process.env.NODE_ENV === "production") return

    const save = () => {
      const alarmsActive = queryClient.getQueryData(["alarms", "active"])
      const sensorsPaginated100 = queryClient.getQueryData(["capteurs", "paginated", 100])

      if (alarmsActive === undefined && sensorsPaginated100 === undefined) return

      safeSavePersistedCache({
        v: 1,
        savedAt: Date.now(),
        data: {
          alarmsActive,
          sensorsPaginated100,
        },
      })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save()
    }

    const interval = window.setInterval(save, 30_000)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      save()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        storageKey="vigitemp-theme"
        enableSystem
        disableTransitionOnChange
      >
        <TimezoneProvider timezone={timezone}>
          <GlobalAppEffects />
          <VersionChangelogModal />
          <LicenseProvider>
            <AppAccessProvider>
              <AdjustmentOperationTimer />
              {children}
            </AppAccessProvider>
          </LicenseProvider>
        </TimezoneProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
