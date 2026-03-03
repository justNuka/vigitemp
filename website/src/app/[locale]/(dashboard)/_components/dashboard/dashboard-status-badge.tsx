import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Translate = (key: string, values?: Record<string, string | number>) => string

export function DashboardStatusBadge({ status, t }: { status: string; t: Translate }) {
  const configs: Record<string, { label: string; className: string }> = {
    active: {
      label: t("status.active"),
      className:
        "bg-red-500/90 text-white border-transparent dark:bg-destructive/12 dark:text-destructive-foreground dark:border-destructive/30",
    },
    acknowledged: {
      label: t("status.acknowledged"),
      className:
        "bg-slate-200 text-slate-700 border-transparent dark:bg-muted dark:text-muted-foreground",
    },
    resolved: {
      label: t("status.resolved"),
      className:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-transparent dark:text-muted-foreground",
    },
  }

  const config = configs[status] || configs.active

  return <Badge className={cn("whitespace-nowrap", config.className)}>{config.label}</Badge>
}
