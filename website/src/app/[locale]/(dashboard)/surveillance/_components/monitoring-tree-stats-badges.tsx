"use client"

import { Badge } from "@/components/ui/badge"
import type { TreeStats } from "./monitoring-tree-types"
import { getStatusTheme } from "@/lib/surveillance-status"

type Props = {
  stats: TreeStats
  compact?: boolean
}

export function SurveillanceTreeStatsBadges({ stats, compact = false }: Props) {
  const className = compact ? "text-xs px-2 py-0" : undefined
  const criticalTheme = getStatusTheme("critical", true)
  const warningTheme = getStatusTheme("warning", true)
  const okTheme = getStatusTheme("ok", true)
  const inactiveTheme = getStatusTheme("ok", false)

  return (
    <div className="flex items-center gap-2">
      {stats.critical > 0 && (
        <Badge
          variant="destructive"
          className={[criticalTheme.badgeClassName, className].filter(Boolean).join(" ")}
        >
          {stats.critical}
        </Badge>
      )}
      {stats.warning > 0 && (
        <Badge
          className={[
            warningTheme.badgeClassName,
            "!bg-violet-600 hover:!bg-violet-700 !text-white border-violet-700",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {stats.warning}
        </Badge>
      )}
      {stats.ok > 0 && (
        <Badge className={[okTheme.badgeClassName, className].filter(Boolean).join(" ")}>
          {stats.ok}
        </Badge>
      )}
      {stats.inactive > 0 && (
        <Badge
          variant="outline"
          className={[inactiveTheme.badgeClassName, className].filter(Boolean).join(" ")}
        >
          {stats.inactive}
        </Badge>
      )}
    </div>
  )
}
