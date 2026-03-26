"use client";

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { stripLocalePrefix } from "@/i18n/pathnames";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BellButton } from "@/components/messaging/bell-button";
import { LazyMotion, domAnimation, m, AnimatePresence } from "motion/react";

interface PageHeaderProps {
  title: string;
  description?: string;
  activeAlarms?: number;
  children?: React.ReactNode;
  className?: string;
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

  return (
    <LazyMotion features={domAnimation}>
      <header
        className={cn(
          "sticky top-0 z-40 flex flex-col gap-4 border-b border-border/60 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6 dark:border-border dark:bg-card/95",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1" />
            <div className="hidden md:block h-7 w-px bg-border/60" />
            <div className="min-w-0">
              <m.h1
                className="text-lg md:text-xl font-semibold tracking-tight truncate"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              >
                {title}
              </m.h1>
              {description && (
                <p className="text-xs text-muted-foreground hidden sm:block truncate mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {activeAlarms > 0 && (
                <m.div
                  key="alarm-badge"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                >
                  {isOnAlarmsPage ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2 opacity-75 cursor-not-allowed"
                            data-testid="button-active-alarms"
                            disabled
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t("active_alarms.badge", { count: activeAlarms })}
                            </span>
                            <span className="sm:hidden">{activeAlarms}</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t("active_alarms.already_here")}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link href="alarmes">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2 animate-pulse-subtle"
                        data-testid="button-active-alarms"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t("active_alarms.badge", { count: activeAlarms })}
                        </span>
                        <span className="sm:hidden">{activeAlarms}</span>
                      </Button>
                    </Link>
                  )}
                </m.div>
              )}
            </AnimatePresence>
            <LanguageSwitcher />
            {messagingEnabled && (
              <BellButton currentUserId={currentUser?.id} />
            )}
            <ThemeToggle />
          </div>
        </div>

        {children && (
          <div className="flex items-center gap-2 flex-wrap">
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
      <Link href="alarmes" passHref>
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
