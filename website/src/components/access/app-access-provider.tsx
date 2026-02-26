"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";

import { useLicense } from "@/components/license/license-provider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { stripLocalePrefix } from "@/i18n/pathnames";
import { getLicenseEdition, isExpert, isOne, isPack, isStandard } from "@/lib/license-access";
import { hasAuthorizationCode, hasPermission, type AppPermission } from "@/lib/permissions";

function isPublicRoute(pathname: string) {
  const normalized = stripLocalePrefix(pathname || "");
  return normalized === "/login" || normalized === "/connexion" || normalized === "/reset-password" || normalized === "/reinitialisation-mot-de-passe" || normalized === "/force-password-change" || normalized === "/changement-mot-de-passe-obligatoire";
}

type AppAccessContextValue = {
  loading: boolean;
  userLoading: boolean;
  licenseLoading: boolean;
  user: ReturnType<typeof useCurrentUser>["data"] | null;
  license: ReturnType<typeof useLicense>["license"];
  edition: ReturnType<typeof getLicenseEdition>;
  isPack: boolean;
  isOne: boolean;
  isStandard: boolean;
  isExpert: boolean;
  hasPermission: (permission: AppPermission) => boolean;
  hasAuthorizationCode: (...codes: string[]) => boolean;
};

const AppAccessContext = createContext<AppAccessContextValue | null>(null);

export function AppAccessProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { license, loading: licenseLoading } = useLicense();
  const { data: user, isLoading: userLoading } = useCurrentUser({ enabled: !isPublicRoute(pathname || "") });

  const edition = getLicenseEdition(license, "standard");

  const value = useMemo<AppAccessContextValue>(
    () => ({
      loading: licenseLoading || userLoading,
      userLoading,
      licenseLoading,
      user: user ?? null,
      license,
      edition,
      isPack: isPack(license),
      isOne: isOne(license),
      isStandard: isStandard(license),
      isExpert: isExpert(license),
      hasPermission: (permission) => hasPermission(user, permission),
      hasAuthorizationCode: (...codes) => hasAuthorizationCode(user, codes),
    }),
    [edition, license, licenseLoading, user, userLoading],
  );

  return <AppAccessContext.Provider value={value}>{children}</AppAccessContext.Provider>;
}

export function useAppAccess() {
  const ctx = useContext(AppAccessContext);
  if (!ctx) {
    throw new Error("useAppAccess must be used within AppAccessProvider");
  }
  return ctx;
}
