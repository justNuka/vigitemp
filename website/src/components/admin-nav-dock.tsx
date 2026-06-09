"use client";

import type { ReactNode } from "react";
import Dock from "@/components/ui/dock";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack, isPack } from "@/lib/license-access";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Gauge, Globe, MapPin, Radio, Ruler, Users, WifiCog, Wrench } from "lucide-react";

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

  const hideStandards = isOneOrPack(license);
  const hideOnePlus = isPack(license);
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
      key: "metrologie",
      icon: <Ruler size={20} />,
      label: tDock("metrologie"),
      onClick: () => router.push("/admin/metrologie"),
      isActive:
        normalizedPathname.startsWith(getLocalizedPathname("/admin/metrologie", locale as any)) ||
        normalizedPathname === getLocalizedPathname("/admin/etalons", locale as any),
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
      key: "lieux_templates",
      icon: <Copy size={20} />,
      label: tDock("lieux_templates"),
      onClick: () => router.push("/admin/lieux/templates"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/lieux/templates", locale as any),
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

  const visibleNavItems = navItems.filter((item) => {
    if (hideStandards && item.key === "metrologie") return false;
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
