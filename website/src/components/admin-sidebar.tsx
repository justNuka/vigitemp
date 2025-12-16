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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Lock,
  Bell,
  Archive,
  Settings,
  LogOut,
  Home,
  Database,
  Ticket,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { CurrentUser } from "@/lib/types";

interface SectionItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface AdminSidebarProps {
  currentUser?: CurrentUser | null;
  onLogout?: () => void;
}

export function AdminSidebar({ currentUser, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  // Section 1: Retour au dashboard classique
  const dashboardNavItems: NavItem[] = [
    { title: "Tableau de bord", href: "/", icon: Home },
  ];

  // Section 2: Gestion profils, utilisateurs, alarmes, mesures archivées
  const managementNavItems: NavItem[] = [
    { title: "Profils", href: "/admin/profils", icon: Lock },
    { title: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { title: "Alarmes", href: "/admin/alarmes", icon: Bell },
    { title: "Mesures archivées", href: "/admin/mesures-archivees", icon: Archive },
  ];

  // Section 3: Paramètres globaux, licences, sauvegardes
  const globalSettingsNavItems: NavItem[] = [
    { title: "Paramètres", href: "/admin/parametres", icon: Settings },
    { title: "Licences", href: "/admin/licences", icon: Ticket },
    { title: "Sauvegardes", href: "/admin/sauvegardes", icon: HardDrive },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-col items-center">
        <Link href="/" className="flex items-center justify-center">
          <Logo size="md" />
        </Link>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mt-2">
          Admin Panel
        </span>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="custom-scrollbar">
        {/* Section 1: Dashboard classique */}
        <SidebarGroup>
          <SidebarGroupLabel>Utilisateur</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} data-testid={`nav-${item.href.replace("/", "")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 2: Gestion */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} data-testid={`nav-${item.href.replace("/", "")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 3: Paramètres globaux */}
        <SidebarGroup>
          <SidebarGroupLabel>Système</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalSettingsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} data-testid={`nav-${item.href.replace("/", "")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
