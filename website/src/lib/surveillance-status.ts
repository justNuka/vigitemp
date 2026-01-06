import type { LucideIcon } from "lucide-react"
import { AlertCircle, CheckCircle2, Power, Zap } from "lucide-react"

export type SensorStatus = "ok" | "warning" | "critical"

export type StatusCounts = {
  total: number
  ok: number
  warning: number
  critical: number
  inactive: number
}

export type StatusTheme = {
  label: string
  Icon: LucideIcon
  textClassName: string
  softBgClassName: string
  headerBgClassName: string
  headerBorderClassName: string
  badgeClassName: string
}

export function getStatusTheme(status: SensorStatus, isActive: boolean): StatusTheme {
  if (!isActive) {
    return {
      label: "Désactivée",
      Icon: Power,
      textClassName: "text-gray-500 dark:text-gray-400",
      softBgClassName: "bg-gray-100 dark:bg-gray-900",
      headerBgClassName: "bg-gray-600 dark:bg-gray-700",
      headerBorderClassName: "border-gray-700 dark:border-gray-800",
      badgeClassName: "bg-gray-100 dark:bg-gray-800",
    }
  }

  switch (status) {
    case "critical":
      return {
        label: "Critique",
        Icon: AlertCircle,
        textClassName: "text-red-700 dark:text-red-300",
        softBgClassName: "bg-red-50 dark:bg-red-950",
        headerBgClassName: "bg-red-600 dark:bg-red-700",
        headerBorderClassName: "border-red-700 dark:border-red-800",
        badgeClassName: "bg-red-600 hover:bg-red-700",
      }
    case "warning":
      return {
        label: "Pré-alarme",
        Icon: Zap,
        textClassName: "text-violet-700 dark:text-violet-300",
        softBgClassName: "bg-violet-50 dark:bg-violet-950",
        headerBgClassName: "bg-violet-600 dark:bg-violet-700",
        headerBorderClassName: "border-violet-700 dark:border-violet-800",
        badgeClassName: "bg-violet-600 hover:bg-violet-700 text-white",
      }
    case "ok":
    default:
      return {
        label: "OK",
        Icon: CheckCircle2,
        textClassName: "text-green-700 dark:text-green-300",
        softBgClassName: "bg-green-50 dark:bg-green-950",
        headerBgClassName: "bg-slate-600 dark:bg-slate-700",
        headerBorderClassName: "border-slate-700 dark:border-slate-800",
        badgeClassName: "bg-green-600 hover:bg-green-700",
      }
  }
}

export function countStatus(sensors: { status: SensorStatus; isActive: boolean }[]): StatusCounts {
  const stats: StatusCounts = { total: 0, ok: 0, warning: 0, critical: 0, inactive: 0 }
  for (const sensor of sensors) {
    stats.total++
    if (!sensor.isActive) stats.inactive++
    else if (sensor.status === "critical") stats.critical++
    else if (sensor.status === "warning") stats.warning++
    else stats.ok++
  }
  return stats
}
