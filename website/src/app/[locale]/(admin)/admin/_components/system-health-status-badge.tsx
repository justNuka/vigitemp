import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthState, SystemHealthOverallState } from "@/types/system-health"

type Status = HealthState | SystemHealthOverallState

export function SystemHealthStatusBadge({
  status,
  label,
  className,
}: {
  status: Status
  label: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "ok" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        status === "degraded" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        status === "error" &&
          "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
        status === "unknown" &&
          "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300",
        className,
      )}
    >
      {label}
    </Badge>
  )
}
