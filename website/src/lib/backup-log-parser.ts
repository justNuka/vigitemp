import type {
  BackupRecord,
  BackupSecondaryCopyState,
  BackupSecondaryCopyStatus,
} from "@/types/backup-types"

export type ParsedBackupRun = {
  startedAt: string
  endedAt: string | null
  primaryStatus: BackupRecord["etat"]
  primaryDetails: string
  secondaryStatus: BackupSecondaryCopyState
  secondaryRobocopyCode: number | null
}

export type ParsedBackupLogStatus = {
  secondaryPath: string | null
  runs: ParsedBackupRun[]
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function parseBackupTimestamp(value: string): string | null {
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

export function isBackupErrorLine(line: string) {
  return /\bERREURS?\b|\bERRORS?\b|\bFAILED\b|\bFAILURE\b|\bECHECS?\b|\bÉCHECS?\b/i.test(line)
}

export function getBackupLogMessage(line: string) {
  const timestampMatch = line.match(/^\[[^\]]+\]\s*(.*)$/)
  const rawMessage = (timestampMatch?.[1] ?? line).trim()
  return rawMessage.replace(/^#+\s*/, "").replace(/\s*#+$/, "").trim()
}

export function isMeaningfulBackupLogLine(line: string) {
  return getBackupLogMessage(line).length > 0
}

export function isBackupProcessStartLine(line: string) {
  const normalized = normalizeForMatch(getBackupLogMessage(line)).replace(/\s+/g, " ")
  return (
    /\b(?:debut|start|begin)\b.*\bbackup\b/.test(normalized) ||
    /\bbackup\b.*\b(?:start|begin|debut)\b/.test(normalized)
  )
}

export function isBackupProcessEndLine(line: string) {
  const normalized = normalizeForMatch(getBackupLogMessage(line)).replace(/\s+/g, " ")
  return (
    /\b(?:fin|end|finish|finished)\b.*\bbackup\b/.test(normalized) ||
    /\bbackup\b.*\b(?:end|finish|finished|fin)\b/.test(normalized)
  )
}

export function isDailyArchiveSuccessLine(line: string) {
  const normalized = normalizeForMatch(line)
  if (!normalized.includes("7zip")) return false
  if (!/:\s*(?:ok|success)\b/i.test(line)) return false

  return (
    normalized.includes("dump jour") ||
    normalized.includes("daily dump") ||
    normalized.includes("day dump") ||
    normalized.includes("daily backup") ||
    normalized.includes("backup daily")
  )
}

export function extractSecondaryBackupPath(rawLog: string): string | null {
  for (const rawLine of rawLog.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const normalized = normalizeForMatch(line)
    const isSecondaryDirectoryLine =
      normalized.includes("repertoire secondaire de sauvegarde") ||
      normalized.includes("secondary backup directory") ||
      normalized.includes("secondary backup folder")

    if (!isSecondaryDirectoryLine) continue

    const quoted = line.match(/"([^"]*)"/)
    if (quoted) {
      const value = quoted[1].trim()
      return value.length > 0 ? value : null
    }

    const separatorIndex = line.indexOf(":")
    if (separatorIndex >= 0) {
      const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "")
      return value.length > 0 ? value : null
    }

    return null
  }

  return null
}

export function isSecondaryRobocopyLine(line: string) {
  const normalized = normalizeForMatch(line)
  if (!normalized.includes("robocopy")) return false

  const french =
    normalized.includes("repertoire principal") &&
    normalized.includes("repertoire secondaire")

  const english =
    normalized.includes("primary") &&
    normalized.includes("secondary")

  return french || english
}

export function extractRobocopyCode(line: string): number | null {
  const match = line.match(/(?:code|exit\s*code|return\s*code)\s*[=:]\s*(\d+)/i)
  if (!match) return null
  const code = Number.parseInt(match[1], 10)
  return Number.isFinite(code) ? code : null
}

export function getRobocopyState(code: number | null): "success" | "failed" | null {
  if (code === null) return null
  return code >= 8 ? "failed" : "success"
}

function stripTimestamp(line: string) {
  return line.replace(/^\[[^\]]+\]\s*/, "")
}

function summarizePrimaryRun(lines: string[]) {
  const firstError = lines.find(isBackupErrorLine)
  if (firstError) return stripTimestamp(firstError)

  const zipLine = lines.find(isDailyArchiveSuccessLine)
  if (zipLine) return stripTimestamp(zipLine)

  const dumpOkCount = lines.filter((line) => /DUMP\s+.*:\s*(?:OK|SUCCESS)\b/i.test(line)).length
  if (dumpOkCount > 0) return `${dumpOkCount} dump(s) termines`

  return stripTimestamp(lines[lines.length - 1] ?? "") || "Execution detectee"
}

function resolveSecondaryStatus(
  currentLines: string[],
  secondaryPath: string | null,
  primaryStatus: BackupRecord["etat"],
  hasFinished: boolean,
): { etat: BackupSecondaryCopyState; robocopyCode: number | null } {
  if (!secondaryPath) {
    return { etat: "not_configured", robocopyCode: null }
  }

  const secondarySummaryLine = currentLines.find(isSecondaryRobocopyLine)
  if (secondarySummaryLine) {
    const robocopyCode = extractRobocopyCode(secondarySummaryLine)
    const codeState = getRobocopyState(robocopyCode)
    if (codeState) return { etat: codeState, robocopyCode }

    if (isBackupErrorLine(secondarySummaryLine)) {
      return { etat: "failed", robocopyCode: null }
    }

    if (/\bOK\b|\bSUCCESS\b/i.test(secondarySummaryLine)) {
      return { etat: "success", robocopyCode: null }
    }

    return { etat: "unknown", robocopyCode: null }
  }

  if (primaryStatus === "failed") {
    return { etat: "not_run", robocopyCode: null }
  }

  if (!hasFinished) {
    return {
      etat: primaryStatus === "success" ? "in_progress" : "pending",
      robocopyCode: null,
    }
  }

  return { etat: "unknown", robocopyCode: null }
}

export function parseBackupLogStatus(rawLog: string): ParsedBackupLogStatus {
  const secondaryPath = extractSecondaryBackupPath(rawLog)
  const lines = rawLog
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const runs: ParsedBackupRun[] = []
  let currentLines: string[] = []
  let startedAt: string | null = null
  let endedAt: string | null = null

  const flushCurrentRun = () => {
    if (!startedAt || currentLines.length === 0) return

    const hasFinished = currentLines.some(isBackupProcessEndLine)
    const zipSuccessIndex = currentLines.findIndex(isDailyArchiveSuccessLine)
    const secondaryIndex = currentLines.findIndex(isSecondaryRobocopyLine)
    const primaryStageEnd =
      zipSuccessIndex >= 0
        ? zipSuccessIndex + 1
        : secondaryIndex >= 0
          ? secondaryIndex
          : currentLines.length
    const primaryLines = currentLines.slice(0, primaryStageEnd)
    const primaryHasError = primaryLines.some(isBackupErrorLine)

    const primaryStatus: BackupRecord["etat"] =
      primaryHasError
        ? "failed"
        : zipSuccessIndex >= 0
          ? "success"
          : hasFinished
            ? "failed"
            : "in_progress"

    const secondary = resolveSecondaryStatus(
      currentLines,
      secondaryPath,
      primaryStatus,
      hasFinished,
    )

    runs.push({
      startedAt,
      endedAt,
      primaryStatus,
      primaryDetails: summarizePrimaryRun(primaryLines),
      secondaryStatus: secondary.etat,
      secondaryRobocopyCode: secondary.robocopyCode,
    })

    currentLines = []
    startedAt = null
    endedAt = null
  }

  for (const line of lines) {
    const timestampMatch = line.match(/^\[([^\]]+)\]/)
    const parsedTimestamp = timestampMatch ? parseBackupTimestamp(timestampMatch[1]) : null

    if (isBackupProcessStartLine(line)) {
      flushCurrentRun()
      startedAt = parsedTimestamp
      currentLines = [line]
      endedAt = null
      continue
    }

    if (!startedAt) continue

    currentLines.push(line)
    if (isBackupProcessEndLine(line) && parsedTimestamp) {
      endedAt = parsedTimestamp
    }
  }

  flushCurrentRun()
  runs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))

  return { secondaryPath, runs }
}

export function buildSecondaryCopySummary(
  parsed: ParsedBackupLogStatus,
): BackupSecondaryCopyStatus {
  const latestRun = parsed.runs[0]

  if (!parsed.secondaryPath) {
    return {
      configured: false,
      path: null,
      etat: "not_configured",
      robocopyCode: null,
    }
  }

  if (!latestRun) {
    return {
      configured: true,
      path: parsed.secondaryPath,
      etat: "pending",
      robocopyCode: null,
    }
  }

  return {
    configured: true,
    path: parsed.secondaryPath,
    etat: latestRun.secondaryStatus,
    robocopyCode: latestRun.secondaryRobocopyCode,
  }
}
