import { NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import { appDataPath, firstExistingPath, legacyAppDataPath } from "@/lib/vigisensys-paths"
import type { BackupRecord, BackupsResponse } from "@/types/backup-types"

const BACKUP_SLOT_NAMES = ["J", "J-1", "J-2", "J-3", "J-4", "J-5", "J-6", "J-7"]

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

type ParsedRun = {
  startedAt: string
  endedAt: string | null
  status: BackupRecord["etat"]
  details: string
}

function parseFrenchTimestamp(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return null

  const [, day, month, year, hour, minute, second] = match
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).toISOString()
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

function summarizeRunLines(lines: string[]) {
  const dumpErrors = lines.filter((line) => /:\s*Erreur\b/i.test(line))
  const warningLine = dumpErrors[0] ?? lines.find((line) => /\bERREUR\b|\bERROR\b/i.test(line)) ?? null
  if (warningLine) return warningLine.replace(/^\[[^\]]+\]\s*/, "")

  const zipLine = lines.find((line) => /7zip .*: OK/i.test(line))
  if (zipLine) return zipLine.replace(/^\[[^\]]+\]\s*/, "")

  const dumpOkCount = lines.filter((line) => /DUMP .*: OK/i.test(line)).length
  if (dumpOkCount > 0) return `${dumpOkCount} dump(s) termines`;

  return lines[lines.length - 1]?.replace(/^\[[^\]]+\]\s*/, "") || "Execution detectee"
}

function parseBackupRuns(rawLog: string): ParsedRun[] {
  const lines = rawLog.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const runs: ParsedRun[] = []
  let currentLines: string[] = []
  let startedAt: string | null = null
  let endedAt: string | null = null

  const flushCurrentRun = () => {
    if (!startedAt || currentLines.length === 0) return

    const hasError = currentLines.some((line) => /:\s*Erreur\b/i.test(line) || /\bERREUR\b|\bERROR\b/i.test(line))
    const hasFinished = currentLines.some((line) => /## FIN PROCESS BACKUP ##/i.test(line))
    const hasZipOk = currentLines.some((line) => /7zip .*: OK/i.test(line))

    runs.push({
      startedAt,
      endedAt,
      status: hasFinished ? (hasError ? "failed" : "success") : (hasZipOk ? "success" : "in_progress"),
      details: summarizeRunLines(currentLines),
    })

    currentLines = []
    startedAt = null
    endedAt = null
  }

  for (const line of lines) {
    const timestampMatch = line.match(/^\[([^\]]+)\]/)
    const parsedTimestamp = timestampMatch ? parseFrenchTimestamp(timestampMatch[1]) : null

    if (/## DEBUT PROCESS BACKUP ##/i.test(line)) {
      flushCurrentRun()
      startedAt = parsedTimestamp
      currentLines = [line]
      endedAt = null
      continue
    }

    if (!startedAt) continue

    currentLines.push(line)
    if (/## FIN PROCESS BACKUP ##/i.test(line) && parsedTimestamp) {
      endedAt = parsedTimestamp
    }
  }

  flushCurrentRun()
  return runs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
}

async function readBackupRuns(backupLogPath: string): Promise<ParsedRun[]> {
  try {
    const rawLog = await fs.readFile(backupLogPath, "utf8")
    return parseBackupRuns(rawLog)
  } catch {
    return []
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
    const [archiveRecords, parsedRuns] = await Promise.all([
      readArchiveRecords(backupRoot),
      readBackupRuns(backupLogPath),
    ])

    const runRecords: BackupRecord[] = parsedRuns.map((run, index) => ({
      id: `run:${index}:${run.startedAt}`,
      etat: run.status,
      dateHeure: run.endedAt ?? run.startedAt,
      details: run.details,
    }))

    const merged = [...archiveRecords]
    const seenKeys = new Set(archiveRecords.map((record) => `${record.etat}:${record.dateHeure}:${record.details}`))
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
      },
    }

    return apiOk(response)
  } catch (error) {
    log.error("admin/sauvegardes", "error_fetching_backups", { error })
    return apiError(500, "internal_error", "Failed to fetch backups")
  }
})
