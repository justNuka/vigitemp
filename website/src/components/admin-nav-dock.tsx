"use client";

import Dock from "@/components/ui/dock";
import { useRouter, usePathname } from "next/navigation";
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

  const navItems = [
    {
      icon: <Gauge size={20} />,
      label: "Sondes",
      onClick: () => router.push("/admin/sondes"),
      isActive: pathname === "/admin/sondes",
    },
    {
      icon: <WifiCog size={20} />,
      label: "Modules",
      onClick: () => router.push("/admin/modules"),
      isActive: pathname === "/admin/modules",
    },
    {
      icon: <Ruler size={20} />,
      label: "Etalons",
      onClick: () => router.push("/admin/etalons"),
      isActive: pathname === "/admin/etalons",
    },
    {
      icon: <Radio size={20} />,
      label: "Actionneurs",
      onClick: () => router.push("/admin/actionneurs"),
      isActive: pathname === "/admin/actionneurs",
    },
    {
      icon: <Users size={20} />,
      label: "Groupes",
      onClick: () => router.push("/admin/groupes"),
      isActive: pathname === "/admin/groupes",
    },
    {
      icon: <MapPin size={20} />,
      label: "Lieux",
      onClick: () => router.push("/admin/lieux"),
      isActive: pathname === "/admin/lieux",
    },
    {
      icon: <Globe size={20} />,
      label: "Sites",
      onClick: () => router.push("/admin/sites"),
      isActive: pathname === "/admin/sites",
    },
    // {
    //   icon: <Cable size={20} />,
    //   label: "Dataloggeur",
    //   onClick: () => router.push("/admin/dataloggeur"),
    // },
    {
      icon: <Wrench size={20} />,
      label: "Outils",
      onClick: () => router.push("/admin/outils"),
      isActive: pathname.startsWith("/admin/outils"),
    },
    {
      icon: <Map size={20} />,
      label: "Plans",
      onClick: () => router.push("/admin/plans"),
      isActive: pathname === "/admin/plans",
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Statistiques",
      onClick: () => router.push("/admin/statistiques"),
      isActive: pathname === "/admin/statistiques",
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
