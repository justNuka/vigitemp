"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { clearAgentSession } from "@/lib/agent-session";
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activer le verrouillage automatique
  useAutoLock();

  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Fetch current user
  const { data: currentUser } = useCurrentUser();

  // Check if user is admin
  useEffect(() => {
    if (currentUser) {
      const isAdmin = currentUser.authorizations?.some((auth) => auth.admin) ?? false;
      if (!isAdmin) {
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      try {
        await clearAgentSession();
      } catch {
        // Agent not installed/running: ignore
      }
      router.push("/login");
    }
  };

  if (isAuthorized === null) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden">
        <AdminSidebar
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 min-h-0 overflow-hidden bg-background">
          <PageTransitionWrapper className="h-full min-h-0">
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    </SidebarProvider>
  );
}
