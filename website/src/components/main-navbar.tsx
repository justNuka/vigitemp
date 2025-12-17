"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Antenna,
  Cpu,
  Wrench,
  Zap,
  Users,
  MapPin,
  Building2,
  HardDrive,
  BarChart3,
  Layout,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Sondes", href: "/admin/sondes", icon: Antenna },
  { label: "Modules", href: "/admin/modules", icon: Cpu },
  { label: "Étalons", href: "/admin/etalons", icon: Wrench },
  { label: "Actionneurs", href: "/admin/actionneurs", icon: Zap },
  { label: "Groupes", href: "/admin/groupes", icon: Users },
  { label: "Lieux", href: "/admin/lieux", icon: MapPin },
  { label: "Sites", href: "/admin/sites", icon: Building2 },
  { label: "Datalogger", href: "/admin/datalogger", icon: HardDrive },
  { label: "Outils", href: "/admin/outils", icon: Wrench },
  { label: "Plans", href: "/admin/plans", icon: Layout },
  { label: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
];

export function MainNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
          >
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
