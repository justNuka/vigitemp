"use client";

import { useLicense } from "@/components/license/license-provider";
import { isPack } from "@/lib/license-access";
import { usePathname } from "@/i18n/navigation";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Gauge, Globe, MapPin, Radio, Users, WifiCog, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();
  const locale = useLocale();
  const tDock = useTranslations("dock");
  const { license } = useLicense();

  const hideOnePlus = isPack(license);
  const normalizedPathname = stripLocalePrefix(pathname);

  const navItems = [
    { key: "sondes", icon: Gauge, href: "/admin/sondes" as const },
    { key: "modules", icon: WifiCog, href: "/admin/modules" as const },
    { key: "actionneurs", icon: Radio, href: "/admin/actionneurs" as const },
    { key: "groupes", icon: Users, href: "/admin/groupes" as const },
    { key: "lieux", icon: MapPin, href: "/admin/lieux" as const },
    { key: "sites", icon: Globe, href: "/admin/sites" as const },
    { key: "outils", icon: Wrench, href: "/admin/outils" as const },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (hideOnePlus && (item.key === "sites" || item.key === "groupes")) return false;
    return true;
  });

  return (
    <nav
      aria-label={tDock("sondes")}
      className="scroll-thin shrink-0 overflow-x-auto border-b border-border bg-card"
    >
      <ul className="mx-auto flex min-w-max items-center gap-0.5 px-4 lg:px-6">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isAdminNavItemActive(
            normalizedPathname,
            getLocalizedPathname(item.href, locale as any),
          );

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-10 items-center gap-1.5 whitespace-nowrap px-2.5 text-[13px] font-medium",
                  "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60",
                  active
                    ? "text-[hsl(var(--primary-strong))]"
                    : "text-muted-foreground hover:bg-[hsl(var(--surface-muted)/0.55)] hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{tDock(item.key as never)}</span>
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
