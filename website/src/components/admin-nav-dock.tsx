"use client";

import type { ReactNode } from "react";
import Dock from "@/components/ui/dock";
import { useLicense } from "@/components/license/license-provider";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import { useLocale, useTranslations } from "next-intl";
import { Gauge, Globe, MapPin, Radio, Ruler, Users, WifiCog, Wrench } from "lucide-react";

type DockItem = {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
};

export function AdminNavDock() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tDock = useTranslations("dock");
  const { license } = useLicense();

  const edition = (license?.edition || "standard").trim().toLowerCase();
  const hideStandards = edition === "one" || edition === "pack";
  const normalizedPathname = stripLocalePrefix(pathname);

  const navItems: DockItem[] = [
    {
      key: "sondes",
      icon: <Gauge size={20} />,
      label: tDock("sondes"),
      onClick: () => router.push("/admin/sondes"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/sondes", locale as any),
    },
    {
      key: "modules",
      icon: <WifiCog size={20} />,
      label: tDock("modules"),
      onClick: () => router.push("/admin/modules"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/modules", locale as any),
    },
    {
      key: "etalons",
      icon: <Ruler size={20} />,
      label: tDock("etalons"),
      onClick: () => router.push("/admin/etalons"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/etalons", locale as any),
    },
    {
      key: "actionneurs",
      icon: <Radio size={20} />,
      label: tDock("actionneurs"),
      onClick: () => router.push("/admin/actionneurs"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/actionneurs", locale as any),
    },
    {
      key: "groupes",
      icon: <Users size={20} />,
      label: tDock("groupes"),
      onClick: () => router.push("/admin/groupes"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/groupes", locale as any),
    },
    {
      key: "lieux",
      icon: <MapPin size={20} />,
      label: tDock("lieux"),
      onClick: () => router.push("/admin/lieux"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/lieux", locale as any),
    },
    {
      key: "sites",
      icon: <Globe size={20} />,
      label: tDock("sites"),
      onClick: () => router.push("/admin/sites"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/sites", locale as any),
    },
    {
      key: "outils",
      icon: <Wrench size={20} />,
      label: tDock("outils"),
      onClick: () => router.push("/admin/outils"),
      isActive: normalizedPathname.startsWith(getLocalizedPathname("/admin/outils", locale as any)),
    },
  ];

  const visibleNavItems = hideStandards
    ? navItems.filter((item) => item.key !== "etalons")
    : navItems;

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
