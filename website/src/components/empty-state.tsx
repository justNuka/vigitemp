import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { scaleIn } from "@/lib/motion-variants";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
      >
        <div className="p-4 rounded-full bg-muted mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} data-testid="button-empty-action">
            {action.label}
          </Button>
        )}
      </m.div>
    </LazyMotion>
  );
}
