export type BackupLogEntryLevel = "info" | "success" | "error" | "section"

export interface BackupLogEntry {
  timestamp: string | null
  message: string
  level: BackupLogEntryLevel
}

export interface BackupRecord {
  id: string
  etat: "success" | "in_progress" | "failed"
  dateHeure: string
  details?: string
}

export type BackupSecondaryCopyState =
  | "success"
  | "in_progress"
  | "failed"
  | "pending"
  | "not_run"
  | "not_configured"
  | "unknown"

export interface BackupSecondaryCopyStatus {
  configured: boolean
  path: string | null
  etat: BackupSecondaryCopyState
  robocopyCode: number | null
}

export interface BackupSummary {
  storagePath: string
  logFilePath: string
  archiveCount: number
  slotCount: number
  latestRun?: BackupRecord | null
  secondaryCopy: BackupSecondaryCopyStatus
  logEntries: BackupLogEntry[]
  logLineCount: number
  logTruncated: boolean
}

export interface BackupsResponse {
  data: BackupRecord[]
  summary: BackupSummary
}
