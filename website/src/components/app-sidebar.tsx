"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Activity,
  Bell,
  Settings,
  Users,
  FileText,
  LogOut,
  Volume2,
  VolumeX,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeVariant?: "default" | "destructive";
}

const mainNavItems: NavItem[] = [
  { title: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { title: "Surveillance", href: "/surveillance", icon: Activity },
  { title: "Alarmes", href: "/alarmes", icon: Bell },
];

const auditNavItems: NavItem[] = [
  { title: "Journal d'audit", href: "/audit", icon: FileText },
];

import { CurrentUser } from "@/lib/types";

const moncompteNavItems: NavItem[] = [
  { title: "Mon profil", href: "/profil", icon: User },
];

interface AppSidebarProps {
  activeAlarms?: number;
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
}

export function AppSidebar({ activeAlarms = 0, currentUser, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.authorizations?.some((auth) => auth.admin) ?? false;

  const navItemsWithBadges = mainNavItems.map((item) => {
    if (item.href === "/alarmes" && activeAlarms > 0) {
      return { ...item, badge: activeAlarms, badgeVariant: "destructive" as const };
    }
    return item;
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-col items-center">
        <Link href="/" className="flex items-center justify-center">
          <Logo size="md" />
        </Link>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mt-2">
          Licence Light
        </span>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItemsWithBadges.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
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

        <SidebarGroup>
          <SidebarGroupLabel>Suivi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {auditNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      data-testid={`nav-${item.href.replace("/", "")}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin"}
                    tooltip="Tableau de bord administrateur"
                  >
                    <Link href="/admin" data-testid="nav-admin">
                      <Shield className="h-4 w-4" />
                      <span>Dashboard Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Mon compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moncompteNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.href}
                      data-testid={`nav-${item.href.replace("/", "")}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Alarmes sonores</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-toggle-mute"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Son désactivé
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Son activé
                  </>
                )}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        {currentUser && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {`${currentUser.Prenom || ""} ${currentUser.Nom || ""}`
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {`${currentUser.Prenom || ""} ${currentUser.Nom || ""}`}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser.Profil_Utilisateur || "User"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 flex-shrink-0"
              title="Se déconnecter"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
