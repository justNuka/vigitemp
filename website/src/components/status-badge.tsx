import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Status = "ok" | "warning" | "critical";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const statusConfig = {
  ok: {
    label: "OK",
    dotClass: "bg-success",
    badgeClass: "bg-success/10 text-success border-success/30 hover:bg-success/20",
  },
  warning: {
    label: "Attention",
    dotClass: "bg-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
  },
  critical: {
    label: "Critique",
    dotClass: "bg-destructive animate-pulse-subtle",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
  },
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  size = "default",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.label;

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
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "w-2.5 h-2.5 rounded-full",
        config.dotClass,
        className
      )}
      aria-label={config.label}
      role="status"
    />
  );
}
