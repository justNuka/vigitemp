import type { Layout } from "react-grid-layout"

export type WidgetId =
  | "alarms"
  | "acknowledgments"
  | "connectedUsers"
  | "systemLogs"
  | "backups"
  | "unassigned"
  | "etalons"

export type Metrics = {
  alarmsInProgressTotal: number
  alarmsPendingAckTotal: number
  acknowledgmentsTotal: number
  connectedUsersTotal: number
  systemLogsTotal: number
  backupsTotal: number
  unassignedTotal: number
  latestAck: string
  latestAuditAction: string
  latestConnectedLabel: string
  lastBackupLabel: string
  latestBackupStatus: string
  latestBackupEtat: "success" | "in_progress" | "failed" | null
  backupStoragePath: string
  backupLogFilePath: string
  upcomingCalibrationCount: number
  hideStandards: boolean
}

export type Props = { metrics: Metrics; onOpenBackupLog?: () => void }
export type BreakpointKey = "lg" | "md" | "sm" | "xs" | "xxs"
export type GridLayouts = Partial<Record<BreakpointKey, Layout>>

export type WidgetDefinition = {
  id: WidgetId
  w: number
  h: number
}
