"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MainNavbar } from "@/components/main-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { alarmsApi, authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useRefreshInterval } from "@/hooks/useRefreshInterval";
import { ThemeToggle } from "@/components/theme-toggle";

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

  const activeAlarmsCount = alarms?.length ?? 0;

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
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Bar avec Theme Toggle */}
        <div className="sticky top-0 z-50 flex items-center justify-end border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
          <ThemeToggle />
        </div>

        {/* Main Navbar */}
        <MainNavbar />

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar
            activeAlarms={activeAlarmsCount}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
