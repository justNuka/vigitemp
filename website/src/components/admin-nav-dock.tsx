"use client";

import type { ReactNode } from "react";
import Dock from "@/components/ui/dock";
import { useLicense } from "@/components/license/license-provider";
import { isPack } from "@/lib/license-access";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import { useLocale, useTranslations } from "next-intl";
import { Gauge, Globe, MapPin, Radio, Users, WifiCog, Wrench } from "lucide-react";

type DockItem = {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
};

export const ADMIN_NAV_DOCK_PATHS = [
  "/admin/sondes",
  "/admin/modules",
  "/admin/actionneurs",
  "/admin/groupes",
  "/admin/lieux",
  "/admin/sites",
  "/admin/outils",
] as const;

export function shouldShowAdminNavDock(pathname: string) {
  if (pathname === "/admin") return true;
  return ADMIN_NAV_DOCK_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isAdminNavItemActive(pathname: string, targetPathname: string) {
  return pathname === targetPathname || pathname.startsWith(`${targetPathname}/`);
}

export function AdminNavDock() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tDock = useTranslations("dock");
  const { license } = useLicense();

  const hideOnePlus = isPack(license);
  const normalizedPathname = stripLocalePrefix(pathname);

  const navItems: DockItem[] = [
    {
      key: "sondes",
      icon: <Gauge size={20} />,
      label: tDock("sondes"),
      onClick: () => router.push("/admin/sondes"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/sondes", locale as any)),
    },
    {
      key: "modules",
      icon: <WifiCog size={20} />,
      label: tDock("modules"),
      onClick: () => router.push("/admin/modules"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/modules", locale as any)),
    },
    {
      key: "actionneurs",
      icon: <Radio size={20} />,
      label: tDock("actionneurs"),
      onClick: () => router.push("/admin/actionneurs"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/actionneurs", locale as any)),
    },
    {
      key: "groupes",
      icon: <Users size={20} />,
      label: tDock("groupes"),
      onClick: () => router.push("/admin/groupes"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/groupes", locale as any)),
    },
    {
      key: "lieux",
      icon: <MapPin size={20} />,
      label: tDock("lieux"),
      onClick: () => router.push("/admin/lieux"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/lieux", locale as any)),
    },
    {
      key: "sites",
      icon: <Globe size={20} />,
      label: tDock("sites"),
      onClick: () => router.push("/admin/sites"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/sites", locale as any)),
    },
    {
      key: "outils",
      icon: <Wrench size={20} />,
      label: tDock("outils"),
      onClick: () => router.push("/admin/outils"),
      isActive: isAdminNavItemActive(normalizedPathname, getLocalizedPathname("/admin/outils", locale as any)),
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (hideOnePlus && (item.key === "sites" || item.key === "groupes")) return false;
    return true;
  });

  return (
    <Dock
      items={visibleNavItems}
      panelHeight={68}
      baseItemSize={50}
      magnification={60}
      distance={200}
      className="rounded-full shadow-lg"
    />
  );
}
