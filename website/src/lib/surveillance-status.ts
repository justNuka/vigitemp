import type { LucideIcon } from "lucide-react"
import { AlertCircle, AlertOctagon, CheckCircle2, PowerOff, Zap } from "lucide-react"

export type SensorStatus =
  | "ok"
  | "warning"
  | "critical"
  | "technical"
  | "ended"

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
  headerTextClassName: string
  badgeClassName: string
}

export type StatusLabels = {
  inactive: string
  critical: string
  technical: string
  warning: string
  ended: string
  ok: string
}

const DEFAULT_LABELS: StatusLabels = {
  inactive: "Désactivée",
  critical: "Critique",
  technical: "Non réponse",
  warning: "Pré-alarme",
  ended: "Alarme terminée",
  ok: "OK",
}

export function getStatusTheme(
  status: SensorStatus,
  isActive: boolean,
  labels: StatusLabels = DEFAULT_LABELS,
): StatusTheme {
  if (!isActive) {
    return {
      label: labels.inactive,
      Icon: PowerOff,
      textClassName: "text-white dark:text-gray-200",
      softBgClassName: "bg-gray-200 dark:bg-gray-900",
      headerBgClassName: "bg-slate-500 dark:bg-gray-700",
      headerBorderClassName: "border-slate-600 dark:border-gray-800",
      headerTextClassName: "text-white dark:text-white",
      badgeClassName: "bg-slate-600 dark:bg-gray-800 text-white dark:text-gray-100",
    }
  }

  switch (status) {
    case "critical":
      return {
        label: labels.critical,
        Icon: AlertOctagon,
        textClassName: "text-red-100 dark:text-white",
        softBgClassName: "bg-red-50 dark:bg-red-950",
        headerBgClassName: "bg-red-700 dark:bg-red-700",
        headerBorderClassName: "border-red-800 dark:border-red-800",
        headerTextClassName: "text-white dark:text-white",
        badgeClassName: "bg-red-700 dark:bg-red-700 text-white dark:text-white hover:bg-red-800 dark:hover:bg-red-800",
      }
    case "technical":
      return {
        label: labels.technical,
        Icon: AlertCircle,
        textClassName: "text-gray-900 dark:text-gray-100",
        softBgClassName: "bg-gray-100 dark:bg-gray-900",
        headerBgClassName: "bg-black",
        headerBorderClassName: "border-black",
        headerTextClassName: "text-white",
        badgeClassName: "bg-black text-white border border-black hover:bg-gray-900",
      }
    case "warning":
      return {
        label: labels.warning,
        Icon: Zap,
        textClassName: "text-amber-800 dark:text-amber-300",
        softBgClassName: "bg-amber-50 dark:bg-amber-950",
        headerBgClassName: "bg-amber-500 dark:bg-amber-600",
        headerBorderClassName: "border-amber-600 dark:border-amber-700",
        headerTextClassName: "text-gray-900",
        badgeClassName: "!bg-amber-500 hover:!bg-amber-600 !text-white border-amber-600",
      }
    case "ended":
      return {
        label: labels.ended,
        Icon: Zap,
        textClassName: "text-violet-700 dark:text-violet-300",
        softBgClassName: "bg-violet-50 dark:bg-violet-950",
        headerBgClassName: "bg-violet-600 dark:bg-violet-700",
        headerBorderClassName: "border-violet-700 dark:border-violet-800",
        headerTextClassName: "text-white",
        badgeClassName: "bg-violet-600 hover:bg-violet-700 text-white",
      }
    case "ok":
    default:
      return {
        label: labels.ok,
        Icon: CheckCircle2,
        textClassName: "text-blue-700 dark:text-blue-300",
        softBgClassName: "bg-blue-50 dark:bg-blue-950",
        headerBgClassName: "bg-blue-600 dark:bg-blue-700",
        headerBorderClassName: "border-blue-700 dark:border-blue-800",
        headerTextClassName: "text-white",
        badgeClassName: "bg-blue-600 hover:bg-blue-700",
      }
  }
}

export function countStatus(sensors: { status: SensorStatus; isActive: boolean }[]): StatusCounts {
  const stats: StatusCounts = { total: 0, ok: 0, warning: 0, critical: 0, inactive: 0 }
  for (const sensor of sensors) {
    stats.total++
    if (!sensor.isActive) stats.inactive++
    else if (sensor.status === "critical" || sensor.status === "technical") stats.critical++
    else if (sensor.status === "warning") stats.warning++
    else stats.ok++
  }
  return stats
}

