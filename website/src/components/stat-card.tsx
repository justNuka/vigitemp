import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    card: "",
  },
  success: {
    icon: "bg-success/10 text-success",
    card: "border-l-4 border-l-success",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    card: "border-l-4 border-l-warning",
  },
  danger: {
    icon: "bg-destructive/10 text-destructive",
    card: "border-l-4 border-l-destructive",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("overflow-visible", styles.card, className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold mt-1 data-value">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs. hier
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex-shrink-0 p-3 rounded-xl",
              styles.icon
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
