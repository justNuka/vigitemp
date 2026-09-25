"use client";

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { stripLocalePrefix } from "@/i18n/pathnames";
import { useTranslations } from "next-intl";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BellButton } from "@/components/messaging/bell-button";
import { LazyMotion, domAnimation, m } from "motion/react";
import { useAppAccess } from "@/components/access/app-access-provider";

interface PageHeaderProps {
  title: string;
  description?: string;
  activeAlarms?: number;
  activeAlarmLocations?: number;
  activeAlarmBreakdown?: ActiveAlarmBreakdown;
  children?: React.ReactNode;
  className?: string;
}

export interface ActiveAlarmBreakdown {
  high: number;
  low: number;
  noResponse: number;
  sector: number;
  module: number;
  other: number;
}

export type { PageHeaderProps };
export function PageHeaderBase({
  title,
  description,
  activeAlarms = 0,
  children,
  className,
}: PageHeaderProps) {
  const t = useTranslations("pageHeaderBase");
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname || "");
  const isOnAlarmsPage = normalizedPath === "/alarmes";
  const messagingEnabled = useMessagingEnabled();
  const { data: currentUser } = useCurrentUser();
  const { hasPermission } = useAppAccess();
  const canAccessMessaging = messagingEnabled && hasPermission("CONVERSATION_ACCESS");

  return (
    <LazyMotion features={domAnimation}>
      <header
        className={cn(
          "sticky top-0 z-40 flex min-w-0 flex-col gap-2 overflow-x-hidden border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur supports-backdrop-filter:bg-card/88 md:px-6",
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1 shrink-0" />
          <div className="hidden h-6 w-px shrink-0 bg-border md:block" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <m.h1
                className="truncate text-lg font-semibold tracking-[-0.01em] text-foreground"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] as const }}
              >
                {title}
              </m.h1>
              {activeAlarms > 0 && !isOnAlarmsPage ? (
                <Link
                  href="/alarmes"
                  className="num inline-flex h-5 shrink-0 items-center gap-1 rounded-full border border-[hsl(var(--status-critical)/0.22)] bg-[hsl(var(--status-critical)/0.08)] px-1.5 text-[10px] font-semibold text-[hsl(var(--status-critical))] transition-colors hover:bg-[hsl(var(--status-critical)/0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  aria-label={t("active_alarms.badge", { count: activeAlarms })}
                >
                  <span aria-hidden className="alarm-blink h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-critical))]" />
                  {activeAlarms}
                </Link>
              ) : null}
            </div>
            {description ? (
              <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageSwitcher />
            {canAccessMessaging ? <BellButton currentUserId={currentUser?.id} /> : null}
            <ThemeToggle />
          </div>
        </div>

        {children && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {children}
          </div>
        )}
      </header>
    </LazyMotion>
  );
}

interface AlarmBannerProps {
  count: number;
  onDismiss?: () => void;
}

export function AlarmBanner({ count, onDismiss }: AlarmBannerProps) {
  const t = useTranslations("pageHeaderBase");
  if (count === 0) return null;

  return (
    <div
      className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between gap-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 animate-pulse" />
        <span className="font-medium text-sm">
          {t("active_alarms.banner", { count })}
        </span>
      </div>
      <Link href="/alarmes" passHref>
        <Button
          variant="outline"
          size="sm"
          className="bg-destructive-foreground/10 border-destructive-foreground/20 text-destructive-foreground hover:bg-destructive-foreground/20"
          data-testid="button-view-alarms"
        >
          {t("active_alarms.view")}
        </Button>
      </Link>
    </div>
  );
}
