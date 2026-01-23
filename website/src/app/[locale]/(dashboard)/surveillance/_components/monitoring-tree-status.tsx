"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { getStatusTheme, type SensorStatus } from "@/lib/surveillance-status"

export function getStatusColor(
  status: SensorStatus,
  isActive: boolean,
): { bg: string; text: string; icon: ReactNode } {
  const theme = getStatusTheme(status, isActive)
  return {
    bg: theme.softBgClassName,
    text: theme.textClassName,
    icon: <theme.Icon className="w-4 h-4" />,
  }
}

export function getStatusBadge(status: SensorStatus, isActive: boolean) {
  const theme = getStatusTheme(status, isActive)
  const isCritical = status === "critical" || status === "technical"

  if (!isActive) {
    return (
      <Badge variant="outline" className={theme.badgeClassName}>
        <theme.Icon className="w-3 h-3 mr-1" /> {theme.label}
      </Badge>
    )
  }

  if (isCritical) {
    return (
      <Badge variant="destructive" className={theme.badgeClassName}>
        <theme.Icon className="w-3 h-3 mr-1" /> {theme.label}
      </Badge>
    )
  }

  return (
    <Badge className={theme.badgeClassName}>
      <theme.Icon className="w-3 h-3 mr-1" /> {theme.label}
    </Badge>
  )
}
