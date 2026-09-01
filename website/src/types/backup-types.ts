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
}

export interface BackupsResponse {
  data: BackupRecord[]
  summary: BackupSummary
}
