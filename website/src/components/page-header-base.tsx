import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex flex-col gap-4 border-b border-slate-200 bg-muted backdrop-blur supports-backdrop-filter:bg-muted/50 px-4 py-3 md:px-6 dark:border-border",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1" />
          <div className="hidden md:block h-7 w-0.5 bg-slate-300/70 dark:bg-border" />
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden sm:block truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeAlarms > 0 && (
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
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2 flex-wrap">
          {children}
        </div>
      )}
    </header>
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
