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
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "motion/react";
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
  activeAlarmBreakdown,
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
          "sticky top-0 z-40 flex min-w-0 flex-col gap-4 overflow-x-hidden border-b border-border/60 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6 dark:border-border dark:bg-card/95",
          className
        )}
      >
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,42rem)_minmax(0,1fr)] lg:gap-5">
          <div className="flex min-w-0 items-center gap-3 md:gap-4 lg:col-start-1 lg:row-start-1">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1" />
            <div className="hidden h-7 w-px shrink-0 bg-border/60 md:block" />
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

          <div className="col-span-2 flex min-w-0 justify-center lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <AnimatePresence>
              {activeAlarms > 0 && (
                <AlarmWeatherWidget
                  count={activeAlarms}
                  breakdown={activeAlarmBreakdown}
                  disabled={isOnAlarmsPage}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center justify-self-end gap-2 lg:col-start-3 lg:row-start-1">
            <LanguageSwitcher />
            {canAccessMessaging && (
              <BellButton currentUserId={currentUser?.id} />
            )}
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

function AlarmWeatherWidget({
  count,
  breakdown,
  disabled,
}: {
  count: number;
  breakdown?: ActiveAlarmBreakdown;
  disabled: boolean;
}) {
  const t = useTranslations("pageHeaderBase.active_alarms");
  const shouldReduceMotion = useReducedMotion();
  const categories = breakdown
    ? [
        { key: "high", count: breakdown.high, color: "bg-red-300" },
        { key: "low", count: breakdown.low, color: "bg-blue-300" },
        { key: "no_response", count: breakdown.noResponse, color: "bg-slate-950 ring-1 ring-white/30" },
        { key: "sector", count: breakdown.sector, color: "bg-amber-300" },
        { key: "module", count: breakdown.module, color: "bg-violet-300" },
        { key: "other", count: breakdown.other, color: "bg-slate-300" },
      ]
    : [];

  const content = (
    <m.div
      key="alarm-weather-widget"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        "group relative w-full max-w-[42rem] overflow-hidden rounded-2xl border border-red-300/40 bg-linear-to-r from-red-700 via-rose-600 to-orange-500 px-5 py-2.5 text-white shadow-[0_10px_28px_-15px_rgba(220,38,38,0.9)]",
        !disabled && "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_rgba(220,38,38,0.95)]",
        disabled && "cursor-default opacity-90",
      )}
      data-testid="button-active-alarms"
      aria-label={t("badge", { count })}
    >
      <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      {!shouldReduceMotion && (
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-8 w-24 -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent blur-md"
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 620, opacity: [0, 0.75, 0] }}
          transition={{ duration: 1.35, repeat: Infinity, repeatDelay: 4.2, ease: "easeInOut" }}
        />
      )}
      <div className="relative flex items-center gap-3">
        <m.div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-sm"
          animate={shouldReduceMotion ? undefined : {
            scale: [1, 1.07, 1],
            boxShadow: [
              "0 0 0 0 rgba(255,255,255,0)",
              "0 0 0 5px rgba(255,255,255,0.12)",
              "0 0 0 0 rgba(255,255,255,0)",
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <AlertTriangle className="h-5.5 w-5.5" />
        </m.div>
        <div className="min-w-[7.75rem] shrink-0 border-r border-white/25 pr-4">
          <div className="flex items-baseline gap-1.5">
            <strong className="text-3xl font-bold leading-none tabular-nums">{count}</strong>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
              {t("live")}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-white/95">{t("current")}</p>
        </div>
        <div className="hidden min-w-0 flex-1 grid-cols-6 gap-1.5 sm:grid">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.key} className="min-w-0 rounded-lg bg-black/10 px-1.5 py-1.5 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1">
                  <span className={cn("h-1.5 w-1.5 rounded-full", category.color)} />
                  <strong className="text-base leading-none tabular-nums">{category.count}</strong>
                </div>
                <span className="mt-1.5 block truncate text-[11px] font-medium leading-none text-white/85">
                  {t(`types.${category.key}`)}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-6 flex items-center justify-between rounded-lg bg-black/10 px-3 py-2 text-sm text-white/90 backdrop-blur-sm">
              <span>{t("summary")}</span>
              <span className="font-semibold">{t("view")}</span>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><div className="w-full">{content}</div></TooltipTrigger>
        <TooltipContent>{t("already_here")}</TooltipContent>
      </Tooltip>
    );
  }

  return <Link href="/alarmes" className="block w-full max-w-[42rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">{content}</Link>;
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
