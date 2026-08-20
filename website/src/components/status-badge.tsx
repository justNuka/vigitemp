"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

type Status = "ok" | "warning" | "critical" | "offline";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const statusConfig: Record<Status, {
  dotClass: string;
  badgeClass: string;
}> = {
  ok: {
    dotClass: "bg-success",
    badgeClass: "bg-success/10 text-success border-success/30 hover:bg-success/20",
  },
  warning: {
    dotClass: "bg-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
  },
  critical: {
    dotClass: "bg-destructive animate-pulse-subtle",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
  },
  offline: {
    dotClass: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
};

function useStatusLabel(status: Status) {
  const tMonitoring = useTranslations("monitoringCard");
  const tStatus = useTranslations("surveillanceStatus");
  const tAlerts = useTranslations("alerts");

  if (status === "ok") return tMonitoring("status.ok");
  if (status === "warning") return tStatus("warning");
  if (status === "critical") return tStatus("critical");
  return tAlerts("offline");
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  size = "default",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ok;
  const translatedLabel = useStatusLabel(status in statusConfig ? status : "ok");
  const displayLabel = label ?? translatedLabel;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.badgeClass,
        size === "sm" && "text-xs px-1.5 py-0.5",
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {showDot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full mr-1.5",
            config.dotClass
          )}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </Badge>
  );
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const config = statusConfig[status] || statusConfig.ok;
  const label = useStatusLabel(status in statusConfig ? status : "ok");

  return (
    <span
      className={cn(
        "w-2.5 h-2.5 rounded-full",
        config.dotClass,
        className
      )}
      aria-label={label}
      role="status"
    />
  );
}
