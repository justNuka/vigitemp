"use client";

import { Link } from "@/i18n/navigation";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Activity,
  Bell,
  FileText,
  LogOut,
  Volume2,
  VolumeX,
  User,
  Shield,
  MessageSquare,
  Truck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALARM_AUDIO_STATE_EVENT, getAlarmAudioMuted, setAlarmAudioMuted } from "@/lib/alarm-audio";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { getLocalizedPathname, stripLocalePrefix } from "@/i18n/pathnames";
import { useLicense } from "@/components/license/license-provider";
import { isStandardOrExpert } from "@/lib/license-access";
import { formatLicenseLabel } from "@/lib/license-label";
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { hasAuthorizationCode, hasPermission } from "@/lib/permissions";
import { WEB_APP_VERSION } from "@/lib/app-version";

interface NavItem {
  href: "/" | "/surveillance" | "/alarmes" | "/messages" | "/vigilog" | "/profil" | "/admin";
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeVariant?: "default" | "destructive";
  titleKey: string;
}

const mainNavItems: NavItem[] = [
  { titleKey: "dashboard", href: "/", icon: LayoutDashboard },
  { titleKey: "monitoring", href: "/surveillance", icon: Activity },
  { titleKey: "alarms", href: "/alarmes", icon: Bell },
  { titleKey: "messaging", href: "/messages", icon: MessageSquare },
  { titleKey: "vigilog", href: "/vigilog", icon: Truck },
];

import { CurrentUser } from "@/lib/types";

const moncompteNavItems: NavItem[] = [
  { titleKey: "profile", href: "/profil", icon: User },
];

interface AppSidebarProps {
  activeAlarms?: number;
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
}

export function AppSidebar({ activeAlarms = 0, currentUser, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const locale = useLocale();
  const normalizedPathname = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return getAlarmAudioMuted();
  });
  const tSidebar = useTranslations("sidebar");
  const tGroups = useTranslations("sidebarGroups");
  const tCommon = useTranslations("common");
  const tAudio = useTranslations("audio");
  const { license } = useLicense();
  const licenseLabel = useMemo(() => formatLicenseLabel(license, tCommon), [license, tCommon]);
  const messagingEnabled = useMessagingEnabled();
  const messagingUnread = useUnreadCount();
  const canAccessDashboard = hasPermission(currentUser, "DASHBOARD_USER_ACCESS");
  const canAccessSurveillance = hasPermission(currentUser, "SURVEILLANCE_VIEW_ACCESS") || hasAuthorizationCode(currentUser, ["ACCES_SURVEILLANCE"]);
  const canAccessVigilog = isStandardOrExpert(license) && hasAuthorizationCode(currentUser, ["ACCES_VIGILOG"]);
  const canAccessMessaging = messagingEnabled && hasPermission(currentUser, "CONVERSATION_ACCESS");
  const canAccessAdmin = hasPermission(currentUser, "DASHBOARD_ADMIN_ACCESS") || hasPermission(currentUser, "GENERAL_SETTINGS_ACCESS");
  const canAccessMetrology = isStandardOrExpert(license) && hasPermission(currentUser, "METROLOGY_WORK_ACCESS");

  useEffect(() => {
    const syncMuted = () => setIsMuted(getAlarmAudioMuted());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "vigitemp:alarm-audio-muted") {
        syncMuted();
      }
    };

    window.addEventListener(ALARM_AUDIO_STATE_EVENT, syncMuted as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(ALARM_AUDIO_STATE_EVENT, syncMuted as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // On mobile, close the sidebar after navigation (better UX).
  useEffect(() => {
    if (!isMobile) return;
    setOpenMobile(false);
  }, [isMobile, pathname, setOpenMobile]);

  // Helper pour comparer pathname avec href (pathname = /fr/surveillance, href = surveillance)
  const isActive = (href: string): boolean => {
    if (href === "/") {
      return normalizedPathname === "/";
    }

    const localized = getLocalizedPathname(href, locale as any);
    return normalizedPathname === localized || normalizedPathname.startsWith(`${localized}/`);
  };

  const navItemsWithBadges = mainNavItems
    .filter((item) => item.href !== "/" || canAccessDashboard)
    .filter((item) => item.href !== "/surveillance" || canAccessSurveillance)
    .filter((item) => item.href !== "/alarmes" || canAccessSurveillance)
    .filter((item) => item.href !== "/vigilog" || canAccessVigilog)
    .filter((item) => item.href !== "/messages" || canAccessMessaging)
    .map((item) => {
      if (item.href === "/alarmes" && activeAlarms > 0) {
        return { ...item, badge: activeAlarms, badgeVariant: "destructive" as const };
      }
      if (item.href === "/messages" && messagingUnread > 0) {
        return { ...item, badge: messagingUnread, badgeVariant: "destructive" as const };
      }
      return item;
    });

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-col items-center bg-linear-to-b from-sidebar-accent/30 to-transparent">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Logo size="xs" showText textClassName="text-sidebar-foreground" />
        </Link>
        <span className="inline-flex items-center rounded-md bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-inset ring-amber-300/40 mt-2">
          {licenseLabel}
        </span>
        <span className="mt-2 text-[11px] font-medium text-sidebar-foreground/65">v{WEB_APP_VERSION}</span>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>{tGroups("navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItemsWithBadges.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={tSidebar(item.titleKey)}
                  >
                    <Link
                      href={item.href}
                      data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{tSidebar(item.titleKey)}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge
                          variant={item.badgeVariant || "default"}
                          className={cn(
                            "ml-auto h-5 min-w-5 px-1.5 text-xs",
                            item.badgeVariant === "destructive" && "animate-pulse-subtle"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {canAccessAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{tGroups("administration")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip={tSidebar("admin_dashboard_tooltip")}
                  >
                    <Link
                      href="/admin"
                      data-testid="nav-admin"
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      <span>{tSidebar("admin_dashboard")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {canAccessMetrology ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/analyse-impact")}
                      tooltip={tSidebar("impact_analysis")}
                    >
                      <Link
                        href="/admin/analyse-impact"
                        data-testid="nav-admin-impact-analysis"
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>{tSidebar("impact_analysis")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{tGroups("my_account")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moncompteNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={tSidebar(item.titleKey)}
                  >
                    <Link
                      href={item.href}
                      data-testid={`nav-${item.href.replace("/", "")}`}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{tSidebar(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{tGroups("sound_alarms")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => setAlarmAudioMuted(!isMuted)}
                data-testid="button-toggle-mute"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    {tAudio("off")}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    {tAudio("on")}
                  </>
                )}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2 space-y-2">
        <div className="flex justify-center px-2 pt-1">
          <Image
            src="/logos/Icone-MC2.svg"
            alt="MC2 logo"
            width={78}
            height={32}
            className="h-8 w-auto object-contain opacity-90"
            unoptimized
          />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/services")}
              tooltip={tSidebar("services")}
            >
              <Link
                href="/services"
                data-testid="nav-services"
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <FileText className="h-4 w-4" />
                <span>{tSidebar("services")}</span>
              </Link>
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
              <p className="text-sm font-medium truncate">
                {`${currentUser.Prenom || ""} ${currentUser.Nom || ""}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser.Profil_Utilisateur || tCommon("user")}
              </p>
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
