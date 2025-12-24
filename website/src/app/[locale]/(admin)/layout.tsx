"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAgentSession } from "@/lib/agent-session";

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
  const { data: currentUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.getCurrentUser(),
  });

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
      window.location.href = "/login";
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
      <div className="flex min-h-screen w-full">
        <AdminSidebar
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
