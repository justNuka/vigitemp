"use client";

import Dock from "@/components/ui/dock";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import {
  Gauge,
  WifiCog,
  Ruler,
  Radio, // Ou Zap
  Users,
  MapPin,
  Globe,
  Wrench,
} from "lucide-react";

export function AdminNavDock() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tDock = useTranslations("dock");
  const normalizedPathname = stripLocalePrefix(pathname);

  const navItems = [
    {
      icon: <Gauge size={20} />,
      label: tDock("sondes"),
      onClick: () => router.push("/admin/sondes"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/sondes", locale as any),
    },
    {
      icon: <WifiCog size={20} />,
      label: tDock("modules"),
      onClick: () => router.push("/admin/modules"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/modules", locale as any),
    },
    {
      icon: <Ruler size={20} />,
      label: tDock("etalons"),
      onClick: () => router.push("/admin/etalons"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/etalons", locale as any),
    },
    {
      icon: <Radio size={20} />,
      label: tDock("actionneurs"),
      onClick: () => router.push("/admin/actionneurs"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/actionneurs", locale as any),
    },
    {
      icon: <Users size={20} />,
      label: tDock("groupes"),
      onClick: () => router.push("/admin/groupes"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/groupes", locale as any),
    },
    {
      icon: <MapPin size={20} />,
      label: tDock("lieux"),
      onClick: () => router.push("/admin/lieux"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/lieux", locale as any),
    },
    {
      icon: <Globe size={20} />,
      label: tDock("sites"),
      onClick: () => router.push("/admin/sites"),
      isActive: normalizedPathname === getLocalizedPathname("/admin/sites", locale as any),
    },
    // {
    //   icon: <Cable size={20} />,
    //   label: "Dataloggeur",
    //   onClick: () => router.push("/admin/dataloggeur"),
    // },
    {
      icon: <Wrench size={20} />,
      label: tDock("outils"),
      onClick: () => router.push("/admin/outils"),
      isActive: normalizedPathname.startsWith(getLocalizedPathname("/admin/outils", locale as any)),
    },
  ];

  return (
    <Dock
      items={navItems}
      panelHeight={68}
      baseItemSize={50}
      magnification={60}
      distance={200}
      className="rounded-full shadow-lg"
    />
  );
}
