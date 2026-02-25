"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useEffect } from "react";

import { AdminNavDock } from "@/components/admin-nav-dock";
import { useAppAccess } from "@/components/access/app-access-provider";
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper";
import { useLicense } from "@/components/license/license-provider";
import { useAutoLock } from "@/hooks/useAutoLock";
import { usePathname, useRouter } from "@/i18n/navigation";
import { stripLocalePrefix } from "@/i18n/pathnames";
import { isOneOrPack } from "@/lib/license-access";
import type { AppPermission } from "@/lib/permissions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLock();

  const { license } = useLicense();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAppAccess();

  const normalizedPathname = stripLocalePrefix(pathname);
  const showDock = !(isOneOrPack(license) && normalizedPathname === "/admin");

  const requiredPermission: AppPermission | null =
    normalizedPathname === "/admin"
      ? "DASHBOARD_ADMIN_ACCESS"
      : normalizedPathname === "/admin/parametres"
        ? "GENERAL_SETTINGS_ACCESS"
        : null;

  const hasRouteAccess = requiredPermission ? hasPermission(requiredPermission) : true;

  useEffect(() => {
    if (accessLoading) return;
    if (!hasRouteAccess) {
      router.replace("/403");
    }
  }, [accessLoading, hasRouteAccess, router]);

  if (!hasRouteAccess) {
    return null;
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <main className="flex-1 min-h-0 overflow-y-auto bg-background">
        <PageTransitionWrapper className="min-h-full">{children}</PageTransitionWrapper>
      </main>

      {showDock ? <AdminNavDock /> : null}
    </div>
  );
}
