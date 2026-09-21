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

export interface BackupSummary {
  storagePath: string
  logFilePath: string
  archiveCount: number
  slotCount: number
  latestRun?: BackupRecord | null
  logEntries: BackupLogEntry[]
  logLineCount: number
  logTruncated: boolean
}

export interface BackupsResponse {
  data: BackupRecord[]
  summary: BackupSummary
}
