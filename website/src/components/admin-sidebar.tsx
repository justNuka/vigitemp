"use client";

import { Link as IntlLink } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Lock,
  Bell,
  Settings,
  LogOut,
  Shield,
  FileText,
  FlaskConical,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { WEB_APP_VERSION } from "@/lib/app-version";

import { CurrentUser } from "@/lib/types";
import { useLocale } from "next-intl";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeVariant?: "default" | "destructive";
}

interface AdminSidebarProps {
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
  activeAlarms?: number;
}

export function AdminSidebar({ currentUser, onLogout, activeAlarms = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const normalizedPathname = stripLocalePrefix(pathname);
  const t = useTranslations("adminSidebar");
  const tCommon = useTranslations("common");
  const { license } = useLicense();
  const messagingEnabled = useMessagingEnabled();
  const messagingUnread = useUnreadCount();

  const getLinkComponent = (href: string) => {
    if (href === "/" || href === "/admin") {
      return IntlLink;
    }
    return IntlLink;
  };

  const dashboardNavItems: NavItem[] = [
    { title: t("dashboards.user"), href: "/", icon: LayoutDashboard },
    { title: t("dashboards.admin"), href: "/admin", icon: Shield },
  ];

  const managementNavItems: Array<NavItem & { badge?: number; badgeVariant?: "default" | "destructive" }> = [
    { title: t("management.profiles"), href: "/admin/profils", icon: Lock },
    { title: t("management.users"), href: "/admin/utilisateurs", icon: Users },
    {
      title: t("management.alarms"),
      href: "/admin/alarmes",
      icon: Bell,
      badge: activeAlarms > 0 ? activeAlarms : undefined,
      badgeVariant: "destructive",
    },
    ...(messagingEnabled
      ? [
          {
            title: t("management.messaging"),
            href: "/messages",
            icon: MessageSquare,
            badge: messagingUnread > 0 ? messagingUnread : undefined,
            badgeVariant: "destructive" as const,
          },
        ]
      : []),
    { title: t("management.audit"), href: "/admin/audit", icon: FileText },
  ];

  const metrologyNavItems: NavItem[] = isStandardOrExpert(license)
    ? [
        { title: t("metrology.calibration_import"), href: "/admin/sondes/etalonnage-import", icon: FlaskConical },
        { title: t("metrology.impact_analysis"), href: "/admin/analyse-impact", icon: TrendingUp },
      ]
    : [];

  const globalSettingsNavItems: NavItem[] = [
    { title: t("system.settings"), href: "/admin/parametres", icon: Settings },
  ];

  const isServicesActive =
    normalizedPathname === getLocalizedPathname("/services", locale as any);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-col items-center bg-linear-to-b from-sidebar-accent/30 to-transparent">
        <IntlLink href="/" className="flex items-center justify-center">
          <Logo size="xs" showText textClassName="text-sidebar-foreground" />
        </IntlLink>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mt-2">
          {t("badge")}
        </span>
        <span className="mt-2 text-[11px] font-medium text-sidebar-foreground/65">v{WEB_APP_VERSION}</span>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.dashboards")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={normalizedPathname === getLocalizedPathname(item.href, locale as any)}
                    tooltip={item.title}
                  >
                    {(() => {
                      const LinkComponent = getLinkComponent(item.href);
                      return (
                        <LinkComponent href={item.href as any} data-testid={`nav-${item.href.replace("/", "")}`}>
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge
                              variant={item.badgeVariant || "default"}
                              className={cn(
                                "ml-auto h-5 min-w-5 px-1.5 text-xs",
                                item.badgeVariant === "destructive" && "animate-pulse-subtle",
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </LinkComponent>
                      );
                    })()}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={normalizedPathname === getLocalizedPathname(item.href, locale as any)}
                    tooltip={item.title}
                  >
                    {(() => {
                      const LinkComponent = getLinkComponent(item.href);
                      return (
                        <LinkComponent href={item.href as any} data-testid={`nav-${item.href.replace("/", "")}`}>
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge
                              variant={item.badgeVariant || "default"}
                              className={cn(
                                "ml-auto h-5 min-w-5 px-1.5 text-xs",
                                item.badgeVariant === "destructive" && "animate-pulse-subtle",
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </LinkComponent>
                      );
                    })()}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {metrologyNavItems.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>{t("groups.metrology")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {metrologyNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={normalizedPathname === getLocalizedPathname(item.href, locale as any)}
                      tooltip={item.title}
                    >
                      {(() => {
                        const LinkComponent = getLinkComponent(item.href);
                        return (
                          <LinkComponent href={item.href as any} data-testid={`nav-${item.href.replace("/", "")}`}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </LinkComponent>
                        );
                      })()}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel>{t("groups.system")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalSettingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={normalizedPathname === getLocalizedPathname(item.href, locale as any)}
                    tooltip={item.title}
                  >
                    {(() => {
                      const LinkComponent = getLinkComponent(item.href);
                      return (
                        <LinkComponent href={item.href as any} data-testid={`nav-${item.href.replace("/", "")}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </LinkComponent>
                      );
                    })()}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isServicesActive}
              tooltip={t("services")}
            >
              <IntlLink href="/services" data-testid="nav-services">
                <FileText className="h-4 w-4" />
                <span>{t("services")}</span>
              </IntlLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {currentUser && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-9 w-9">
              {(() => {
                const initials = getInitialsForAvatar(currentUser.Prenom, currentUser.Nom, currentUser.Login)
                const avatarSrc = resolveAvatarSrc(currentUser.Avatar_Utilisateur, initials)
                return avatarSrc ? <AvatarImage src={avatarSrc} alt={initials} /> : null
              })()}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitialsForAvatar(currentUser.Prenom, currentUser.Nom, currentUser.Login)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{`${currentUser.Prenom || ""} ${currentUser.Nom || ""}`}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.Profil_Utilisateur || "User"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 shrink-0"
              title={tCommon("logout")}
              aria-label={tCommon("logout")}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">{tCommon("logout")}</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
