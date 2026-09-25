import { NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import {
  buildSecondaryCopySummary,
  getBackupLogMessage,
  isBackupErrorLine,
  isBackupProcessEndLine,
  isBackupProcessStartLine,
  isMeaningfulBackupLogLine,
  parseBackupLogStatus,
  parseBackupTimestamp,
  type ParsedBackupRun,
} from "@/lib/backup-log-parser"
import { log } from "@/lib/logger"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import { appDataPath, firstExistingPath, legacyAppDataPath } from "@/lib/vigisensys-paths"
import type { BackupLogEntry, BackupRecord, BackupsResponse } from "@/types/backup-types"

const BACKUP_SLOT_NAMES = ["J", "J-1", "J-2", "J-3", "J-4", "J-5", "J-6", "J-7"]
const MAX_BACKUP_LOG_ENTRIES = 300

async function resolveBackupRoot() {
  const configured = getCompatEnv("VIGISENSYS_BACKUP_ROOT", "VIGITEMP_BACKUP_ROOT")
  if (configured) return configured

  const nextPath = appDataPath("Backup_BDD", "BACKUP")
  const legacyPath = legacyAppDataPath("Backup_BDD", "BACKUP")
  return firstExistingPath([nextPath, legacyPath], nextPath)
}

function resolveBackupLogPath(backupRoot: string) {
  return path.join(backupRoot, "backup_bdd_vigisensys.log")
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"

  const units = ["B", "KB", "MB", "GB", "TB"]
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

function toBackupLogEntry(line: string): BackupLogEntry {
  const timestampMatch = line.match(/^\[([^\]]+)\]/)
  const timestamp = timestampMatch ? parseBackupTimestamp(timestampMatch[1]) : null
  const message = getBackupLogMessage(line)

  const level: BackupLogEntry["level"] =
    isBackupProcessStartLine(line) || isBackupProcessEndLine(line)
      ? "section"
      : isBackupErrorLine(message)
        ? "error"
        : /:\s*(?:OK|SUCCESS)\b/i.test(message)
          ? "success"
          : "info"

  return { timestamp, message, level }
}

async function readBackupLog(backupLogPath: string) {
  try {
    const rawLog = await fs.readFile(backupLogPath, "utf8")
    const meaningfulLines = rawLog
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && isMeaningfulBackupLogLine(line))
    const selectedLines = meaningfulLines.slice(-MAX_BACKUP_LOG_ENTRIES)
    const parsedStatus = parseBackupLogStatus(rawLog)

    return {
      runs: parsedStatus.runs,
      secondaryCopy: buildSecondaryCopySummary(parsedStatus),
      entries: selectedLines.map(toBackupLogEntry),
      totalLineCount: meaningfulLines.length,
      truncated: meaningfulLines.length > selectedLines.length,
    }
  } catch {
    return {
      runs: [] as ParsedBackupRun[],
      secondaryCopy: {
        configured: false,
        path: null,
        etat: "not_configured" as const,
        robocopyCode: null,
      },
      entries: [] as BackupLogEntry[],
      totalLineCount: 0,
      truncated: false,
    }
  }
}

async function readArchiveRecords(backupRoot: string): Promise<BackupRecord[]> {
  const records: BackupRecord[] = []

  for (const slotName of BACKUP_SLOT_NAMES) {
    const slotPath = path.join(backupRoot, slotName)
    try {
      const entries = await fs.readdir(slotPath, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".7z")) continue
        const fullPath = path.join(slotPath, entry.name)
        const stat = await fs.stat(fullPath)
        records.push({
          id: `${slotName}:${entry.name}`,
          etat: "success",
          dateHeure: stat.mtime.toISOString(),
          details: `${slotName} - ${entry.name} (${formatBytes(stat.size)})`,
        })
      }
    } catch {
      // Ignore missing rotation directories.
    }
  }

  return records.sort((a, b) => Date.parse(b.dateHeure) - Date.parse(a.dateHeure))
}

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const backupRoot = await resolveBackupRoot()
    const backupLogPath = resolveBackupLogPath(backupRoot)
    const [archiveRecords, backupLog] = await Promise.all([
      readArchiveRecords(backupRoot),
      readBackupLog(backupLogPath),
    ])

    const runRecords: BackupRecord[] = backupLog.runs.map((run, index) => ({
      id: `run:${index}:${run.startedAt}`,
      etat: run.primaryStatus,
      dateHeure: run.endedAt ?? run.startedAt,
      details: run.primaryDetails,
    }))

    const merged = [...archiveRecords]
    const seenKeys = new Set(
      archiveRecords.map((record) => `${record.etat}:${record.dateHeure}:${record.details}`),
    )
    for (const record of runRecords) {
      const key = `${record.etat}:${record.dateHeure}:${record.details}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      merged.push(record)
    }

    merged.sort((a, b) => Date.parse(b.dateHeure) - Date.parse(a.dateHeure))

    const response: BackupsResponse = {
      data: merged.slice(0, 50),
      summary: {
        storagePath: backupRoot,
        logFilePath: backupLogPath,
        archiveCount: archiveRecords.length,
        slotCount: BACKUP_SLOT_NAMES.length,
        latestRun: runRecords[0] ?? null,
        secondaryCopy: backupLog.secondaryCopy,
        logEntries: backupLog.entries,
        logLineCount: backupLog.totalLineCount,
        logTruncated: backupLog.truncated,
      },
    }

    return apiOk(response)
  } catch (error) {
    log.error("admin/sauvegardes", "error_fetching_backups", { error })
    return apiError(500, "internal_error", "Failed to fetch backups")
  }
})
