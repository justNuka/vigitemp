"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AppFooter } from "@/components/app-footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authApi } from "@/lib/api";
import { useAutoLock } from "@/hooks/useAutoLock";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { clearAgentSession } from "@/lib/agent-session";
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAlarmCount } from "@/hooks/useAdminData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { toast } from "sonner";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack } from "@/lib/license-access";
import { stripLocalePrefix } from "@/i18n/pathnames";

export function AdminGroupLayoutClient({ children }: { children: React.ReactNode }) {
  useAutoLock();
  const router = useRouter();
  const pathname = usePathname();
  const { license } = useLicense();
  const normalizedPathname = stripLocalePrefix(pathname);
  const showAdminDock = !(isOneOrPack(license) && normalizedPathname === "/admin");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [agentSecretStatus, setAgentSecretStatus] = useState<{
    status: string;
    scope?: "agent" | "configuration";
    message: string;
  } | null>(null);
  const t = useTranslations("agentSecretAlert");
  const { data: currentUser } = useCurrentUser();
  const activeAlarmCountQuery = useAlarmCount("active");
  const activeAlarmsCount = activeAlarmCountQuery.data?.pagination.total ?? 0;

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
    void loadStatus();
  }, [currentUser, t]);

  useEffect(() => {
    if (!isFeatureEnabled("enableAgentSecretAlert")) return;
    if (!agentSecretStatus || agentSecretStatus.status === "ok") return;
    if (agentSecretStatus.scope !== "agent") return;

    toast.error(t("agent_popup_title"), {
      description: agentSecretStatus.message || t("status_error"),
      id: "agent-local-problem-admin",
      duration: 8000,
    });
  }, [agentSecretStatus, t]);

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
          activeAlarms={activeAlarmsCount}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-background">
          {isFeatureEnabled("enableAgentSecretAlert") &&
          agentSecretStatus &&
          agentSecretStatus.status !== "ok" &&
          agentSecretStatus.scope === "agent" ? (
            <div className="px-6 pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("agent_title")}</AlertTitle>
                <AlertDescription>
                  {agentSecretStatus.message || t("status_error")}
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
          <PageTransitionWrapper className="min-h-0">{children}</PageTransitionWrapper>
          <AppFooter />
        </main>
      </div>
    </SidebarProvider>
  );
}
