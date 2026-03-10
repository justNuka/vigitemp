import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  iconClassName?: string;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    card: "",
  },
  info: {
    icon: "bg-primary text-primary",
    card: "border-l-8 border-l-primary",
  },
  success: {
    icon: "bg-success text-success",
    card: "border-l-8 border-l-success",
  },
  warning: {
    icon: "bg-warning text-warning",
    card: "border-l-8  border-l-warning",
  },
  danger: {
    icon: "bg-destructive text-destructive",
    card: "border-l-8 border-l-destructive",
  },
  muted: {
    icon: "bg-muted text-muted-foreground",
    card: "border-l-8 border-l-muted-foreground/40",
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
  contentClassName,
  titleClassName,
  valueClassName,
  iconClassName,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const resolvedIconClassName = iconClassName ?? styles.icon;

  return (
    <LazyMotion features={domAnimation}>
      <m.div variants={fadeInUp}>
        <Card className={cn("overflow-visible", styles.card, className)}>
          <CardContent className={cn("p-4 md:p-6", contentClassName)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium text-muted-foreground truncate",
                    titleClassName
                  )}
                >
                  {title}
                </p>
                <p
                  className={cn(
                    "text-2xl md:text-3xl font-bold mt-1 data-value",
                    valueClassName
                  )}
                >
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
                  "shrink-0 p-3 rounded-xl",
                  resolvedIconClassName
                )}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
