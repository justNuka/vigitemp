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

function matchesAdminPath(pathname: string, candidates: readonly string[]) {
  return candidates.some((candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`));
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLock();

  const { license } = useLicense();
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, hasAuthorizationCode, loading: accessLoading } = useAppAccess();

  const normalizedPathname = stripLocalePrefix(pathname);
  const showDock = !(isOneOrPack(license) && normalizedPathname === "/admin");

  const hasRouteAccess =
    normalizedPathname === "/admin"
      ? hasPermission("DASHBOARD_ADMIN_ACCESS")
      : matchesAdminPath(normalizedPathname, ["/admin/parametres", "/admin/sites", "/admin/groupes", "/admin/audit"])
        ? hasAuthorizationCode("PARAMETRES_GERER")
        : matchesAdminPath(normalizedPathname, ["/admin/profils", "/admin/utilisateurs"])
          ? hasAuthorizationCode("GERER_PROFIL")
          : matchesAdminPath(normalizedPathname, ["/admin/lieux", "/admin/lieux/templates"])
            ? hasPermission("LOCATION_CONFIG_ACCESS")
            : matchesAdminPath(normalizedPathname, ["/admin/sondes/etalonnage-import", "/admin/sondes/ajustage-import", "/admin/analyse-impact", "/admin/metrologie/realiser-ajustage", "/admin/metrologie/realiser-etalonnage"])
              ? hasPermission("METROLOGY_OPERATION_ACCESS")
            : matchesAdminPath(normalizedPathname, ["/admin/metrologie"])
              ? hasPermission("METROLOGY_ACCESS")
            : matchesAdminPath(normalizedPathname, ["/admin/etalons"])
              ? hasPermission("METROLOGY_ACCESS")
              : matchesAdminPath(normalizedPathname, ["/admin/modules", "/admin/actionneurs", "/admin/sondes"])
                ? hasPermission("HARDWARE_CONFIG_ACCESS")
              : matchesAdminPath(normalizedPathname, ["/admin/alarmes"])
                ? hasPermission("ALARM_ACK_ACCESS")
                : matchesAdminPath(normalizedPathname, ["/admin/outils"])
                  ? hasAuthorizationCode("PARAMETRES_GERER") ||
                    hasPermission("HARDWARE_CONFIG_ACCESS") ||
                    hasPermission("METROLOGY_OPERATION_ACCESS")
                  : matchesAdminPath(normalizedPathname, ["/admin/test"])
                    ? hasPermission("DASHBOARD_ADMIN_ACCESS")
                    : true;

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
      <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-background pb-28">
        <PageTransitionWrapper className="min-h-full">{children}</PageTransitionWrapper>
      </main>

      {showDock ? <AdminNavDock /> : null}
    </div>
  );
}
