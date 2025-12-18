"use client";

import Dock from "@/components/ui/dock";
import { useRouter } from "next/navigation";
import {
  Database,
  Cable,
  Zap,
  Radio,
  Users,
  FolderOpen,
  MapPin,
  Settings,
  Wrench,
  Map,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export function AdminNavDock() {
  const router = useRouter();

  const navItems = [
    {
      icon: <Database size={20} />,
      label: "Sondes",
      onClick: () => router.push("/admin/sondes"),
    },
    {
      icon: <Settings size={20} />,
      label: "Modules",
      onClick: () => router.push("/admin/modules"),
    },
    {
      icon: <Zap size={20} />,
      label: "Etalons",
      onClick: () => router.push("/admin/etalons"),
    },
    {
      icon: <Radio size={20} />,
      label: "Actionneurs",
      onClick: () => router.push("/admin/actionneurs"),
    },
    {
      icon: <Users size={20} />,
      label: "Groupes",
      onClick: () => router.push("/admin/groupes"),
    },
    {
      icon: <FolderOpen size={20} />,
      label: "Lieux",
      onClick: () => router.push("/admin/lieux"),
    },
    {
      icon: <MapPin size={20} />,
      label: "Sites",
      onClick: () => router.push("/admin/sites"),
    },
    {
      icon: <Cable size={20} />,
      label: "Dataloggeur",
      onClick: () => router.push("/admin/dataloggeur"),
    },
    {
      icon: <Wrench size={20} />,
      label: "Outils",
      onClick: () => router.push("/admin/outils"),
    },
    {
      icon: <Map size={20} />,
      label: "Plans",
      onClick: () => router.push("/admin/plans"),
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Statistiques",
      onClick: () => router.push("/admin/statistiques"),
    },
    {
      icon: <AlertTriangle size={20} />,
      label: "Alarmes",
      onClick: () => router.push("/admin/alarmes"),
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
