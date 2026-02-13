"use client";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { alarmsApi, authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clearAgentSession } from "@/lib/agent-session";
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { isFeatureEnabled } from "@/lib/feature-flags";
export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activer le verrouillage automatique
  useAutoLock();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [agentSecretStatus, setAgentSecretStatus] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const t = useTranslations("agentSecretAlert");
  // Fetch current user
  const { data: currentUser } = useCurrentUser();
  const alarmsQueryKey = ["alarms", "active"] as const;
  const { data: alarms } = useQuery({
    queryKey: alarmsQueryKey,
    queryFn: () => alarmsApi.getActive(),
    refetchInterval: 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  });
  // NOTE: Admin check disabled for now (rights handling will be redesigned).
  useEffect(() => {
    if (currentUser) {
      setIsAuthorized(true);
    }
  }, [currentUser]);
  useEffect(() => {
    if (!currentUser) return;
    const loadStatus = async () => {
      try {
        const res = await fetch("/api/agent/secret/status", { method: "GET" });
        if (!res.ok) return;
        const payload = (await res.json()) as
          | { status: string; message: string }
          | { ok: true; data: { status: string; message: string } };
        const normalized = "ok" in payload ? payload.data : payload;
        setAgentSecretStatus(normalized);
      } catch {
        setAgentSecretStatus({
          status: "error",
          message: t("status_error"),
        });
      }
    };
    loadStatus();
  }, [currentUser, t]);
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
      <div className="flex h-dvh w-full">
        <AdminSidebar
          currentUser={currentUser}
          onLogout={handleLogout}
          activeAlarms={alarms?.length ?? 0}
        />
        <main className="flex-1 min-h-0 bg-background">
          {isFeatureEnabled("enableAgentSecretAlert") && agentSecretStatus && agentSecretStatus.status !== "ok" && (
            <div className="px-6 pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("title")}</AlertTitle>
                <AlertDescription>
                  {agentSecretStatus.message || t("status_error")}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <PageTransitionWrapper className="min-h-0">
            {children}
          </PageTransitionWrapper>
        </main>
      </div>
    </SidebarProvider>
  );
}
