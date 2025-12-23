"use client";

import Dock from "@/components/ui/dock";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Gauge,
  WifiCog,
  Ruler,
  Radio, // Ou Zap
  Users,
  MapPin,
  Globe,
  Wrench,
  Map,
  BarChart3,
} from "lucide-react";

export function AdminNavDock() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale;

  const href = (path: string) => (locale ? `/${locale}${path}` : path);

  const navItems = [
    {
      icon: <Gauge size={20} />,
      label: "Sondes",
      onClick: () => router.push(href("/admin/sondes")),
      isActive: pathname === href("/admin/sondes"),
    },
    {
      icon: <WifiCog size={20} />,
      label: "Modules",
      onClick: () => router.push(href("/admin/modules")),
      isActive: pathname === href("/admin/modules"),
    },
    {
      icon: <Ruler size={20} />,
      label: "Etalons",
      onClick: () => router.push(href("/admin/etalons")),
      isActive: pathname === href("/admin/etalons"),
    },
    {
      icon: <Radio size={20} />,
      label: "Actionneurs",
      onClick: () => router.push(href("/admin/actionneurs")),
      isActive: pathname === href("/admin/actionneurs"),
    },
    {
      icon: <Users size={20} />,
      label: "Groupes",
      onClick: () => router.push(href("/admin/groupes")),
      isActive: pathname === href("/admin/groupes"),
    },
    {
      icon: <MapPin size={20} />,
      label: "Lieux",
      onClick: () => router.push(href("/admin/lieux")),
      isActive: pathname === href("/admin/lieux"),
    },
    {
      icon: <Globe size={20} />,
      label: "Sites",
      onClick: () => router.push(href("/admin/sites")),
      isActive: pathname === href("/admin/sites"),
    },
    // {
    //   icon: <Cable size={20} />,
    //   label: "Dataloggeur",
    //   onClick: () => router.push("/admin/dataloggeur"),
    // },
    {
      icon: <Wrench size={20} />,
      label: "Outils",
      onClick: () => router.push(href("/admin/outils")),
      isActive: pathname.startsWith(href("/admin/outils")),
    },
    {
      icon: <Map size={20} />,
      label: "Plans",
      onClick: () => router.push(href("/admin/plans")),
      isActive: pathname === href("/admin/plans"),
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Statistiques",
      onClick: () => router.push(href("/admin/statistiques")),
      isActive: pathname === href("/admin/statistiques"),
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
