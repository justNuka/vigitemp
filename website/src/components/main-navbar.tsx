"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import {
  Antenna,
  Cpu,
  Wrench,
  Zap,
  Users,
  MapPin,
  Building2,
  Copy,
  Menu,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack, isPack } from "@/lib/license-access";

const menuItems = [
  { key: "sondes", labelKey: "sondes", href: "/admin/sondes", icon: Antenna },
  { key: "modules", labelKey: "modules", href: "/admin/modules", icon: Cpu },
  { key: "etalons", labelKey: "etalons", href: "/admin/metrologie", icon: Wrench },
  { key: "actionneurs", labelKey: "actionneurs", href: "/admin/actionneurs", icon: Zap },
  { key: "groupes", labelKey: "groupes", href: "/admin/groupes", icon: Users },
  { key: "lieux", labelKey: "lieux", href: "/admin/lieux", icon: MapPin },
  { key: "lieux_templates", labelKey: "lieux_templates", href: "/admin/lieux/templates", icon: Copy },
  { key: "sites", labelKey: "sites", href: "/admin/sites", icon: Building2 },
  { key: "outils", labelKey: "outils", href: "/admin/outils", icon: Wrench },
];

export function MainNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const tDock = useTranslations("dock");
  const t = useTranslations("mainNavbar");
  const { license } = useLicense();

  const hideStandards = isOneOrPack(license);
  const hideOnePlus = isPack(license);

  const visibleMenuItems = useMemo(
    () =>
      menuItems.filter((item) => {
        if (hideStandards && item.key === "etalons") return false;
        if (hideOnePlus && (item.key === "sites" || item.key === "groupes")) return false;
        return true;
      }),
    [hideOnePlus, hideStandards],
  );

  const isActive = (href: string) => {
    if (href === "/admin/lieux") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <nav className="hidden md:flex sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2 w-full">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tDock(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{t("menu")}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="h-8 w-8 p-0">
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {isOpen && (
          <div className="mt-3 space-y-1">
            {visibleMenuItems.map((item) => {
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
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tDock(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
