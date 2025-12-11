"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { alarmsApi, authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useRefreshInterval } from "@/hooks/useRefreshInterval";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activer le verrouillage automatique pour toutes les pages protégées
  useAutoLock();

  // Obtenir l'intervalle de rafraîchissement depuis les paramètres
  const { refreshInterval } = useRefreshInterval();

  // Fetch active alarms count for sidebar badge
  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
    refetchInterval: refreshInterval,
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getCurrentUser(),
  });

  const activeAlarmsCount = alarms?.filter((a) => a.status === "active").length ?? 0;

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar
            activeAlarms={activeAlarmsCount}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </SidebarProvider>
  );
}
