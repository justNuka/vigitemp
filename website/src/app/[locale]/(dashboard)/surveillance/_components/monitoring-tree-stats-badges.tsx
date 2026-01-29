"use client"

import { Badge } from "@/components/ui/badge"
import type { TreeStats } from "./monitoring-tree-types"
import { getStatusTheme } from "@/lib/surveillance-status"
import { useTranslations } from "next-intl"

type Props = {
  stats: TreeStats
  compact?: boolean
}

export function SurveillanceTreeStatsBadges({ stats, compact = false }: Props) {
  const tStatus = useTranslations("surveillanceStatus")
  const statusLabels = {
    inactive: tStatus("inactive"),
    critical: tStatus("critical"),
    technical: tStatus("technical"),
    warning: tStatus("warning"),
    ended: tStatus("ended"),
    ok: tStatus("ok"),
  }
  const className = compact ? "text-xs px-2 py-0" : undefined
  const criticalTheme = getStatusTheme("critical", true, statusLabels)
  const warningTheme = getStatusTheme("warning", true, statusLabels)
  const okTheme = getStatusTheme("ok", true, statusLabels)
  const inactiveTheme = getStatusTheme("ok", false, statusLabels)

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
          className={[warningTheme.badgeClassName, className].filter(Boolean).join(" ")}
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
