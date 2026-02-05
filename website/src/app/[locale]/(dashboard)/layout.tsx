"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { AppSidebar } from "@/components/app-sidebar"
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAutoLock } from "@/hooks/useAutoLock"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { clearAgentSession } from "@/lib/agent-session"
import { alarmsApi, authApi } from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAutoLock()

  const queryClient = useQueryClient()

  // Sidebar badge should stay reasonably fresh without stressing heavy pages.
  const alarmsQueryKey = ["alarms", "active"] as const
  const hasCachedAlarms = queryClient.getQueryData(alarmsQueryKey) !== undefined
  const { data: alarms } = useQuery({
    queryKey: alarmsQueryKey,
    queryFn: () => alarmsApi.getActive(),
    enabled: !hasCachedAlarms,
    refetchInterval: 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  })

  const { data: currentUser } = useCurrentUser()

  const activeAlarmsCount = alarms?.length ?? 0

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
      window.location.href = "/login"
    }
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar activeAlarms={activeAlarmsCount} currentUser={currentUser} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto bg-background">
            <PageTransitionWrapper className="min-h-full">{children}</PageTransitionWrapper>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
