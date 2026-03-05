"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { AppSidebar } from "@/components/app-sidebar"
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper"
import { useAutoLock } from "@/hooks/useAutoLock"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePathname, useRouter } from "@/i18n/navigation"
import { stripLocalePrefix } from "@/i18n/pathnames"
import { useAppAccess } from "@/components/access/app-access-provider"
import { clearAgentSession } from "@/lib/agent-session"
import { alarmsApi, authApi } from "@/lib/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useAutoLock()
  const router = useRouter()
  const pathname = usePathname()
  const normalizedPathname = stripLocalePrefix(pathname)
  const { hasPermission, loading: accessLoading } = useAppAccess()
  const hasUserDashboardAccess = hasPermission("DASHBOARD_USER_ACCESS")

  useEffect(() => {
    if (accessLoading) return
    if (normalizedPathname === "/" && !hasUserDashboardAccess) {
      router.replace("/surveillance")
    }
  }, [accessLoading, hasUserDashboardAccess, normalizedPathname, router])

  // Sidebar badge should stay reasonably fresh without stressing heavy pages.
  const alarmsQueryKey = ["alarms", "active"] as const
  const canRenderDashboardShell = !(normalizedPathname === "/" && !hasUserDashboardAccess)

  const { data: alarms } = useQuery({
    queryKey: alarmsQueryKey,
    queryFn: () => alarmsApi.getActive(),
    refetchInterval: 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    staleTime: 30_000, // 30s — fresh enough, prevents focus-triggered refetches
    retry: false,
    enabled: canRenderDashboardShell,
  })
  const { data: currentUser } = useCurrentUser({ enabled: canRenderDashboardShell })
  const activeAlarmsCount = alarms?.length ?? 0

  if (!canRenderDashboardShell) {
    return null
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      try {
        await clearAgentSession()
      } catch {
        // Agent not installed/running: ignore
      }
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar activeAlarms={activeAlarmsCount} currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-background">
          <PageTransitionWrapper className="min-h-full">{children}</PageTransitionWrapper>
        </main>
      </div>
    </div>
  )
}
