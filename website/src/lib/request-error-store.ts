import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export type RequestErrorEntry = {
  id: string
  timestamp: string
  method: string
  path: string
  statusCode: number
  message: string
  user?: string
  userId?: number
  ip?: string
  clientTrace?: string
  queryClientId?: string
  bootId?: string
}

function getLogsDir() {
  if (process.env.VIGITEMP_LOGS_DIR) return process.env.VIGITEMP_LOGS_DIR
  if (process.env.NODE_ENV === "production") return path.join(process.cwd(), "logs")
  return path.join(process.cwd(), "..", "logs")
}

function getStorePath() {
  return process.env.VIGITEMP_REQUEST_ERRORS_PATH || path.join(getLogsDir(), "request-errors.jsonl")
}

async function ensureStoreDirectory() {
  const targetPath = getStorePath()
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  return targetPath
}

export function generateRequestErrorId() {
  return `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`
}

export async function recordRequestError(
  data: Omit<RequestErrorEntry, "id" | "timestamp"> & { id?: string; timestamp?: string },
) {
  const entry: RequestErrorEntry = {
    id: data.id || generateRequestErrorId(),
    timestamp: data.timestamp || new Date().toISOString(),
    method: data.method,
    path: data.path,
    statusCode: data.statusCode,
    message: data.message,
    user: data.user,
    userId: data.userId,
    ip: data.ip,
    clientTrace: data.clientTrace,
    queryClientId: data.queryClientId,
    bootId: data.bootId,
  }

  const targetPath = await ensureStoreDirectory()
  await fs.appendFile(targetPath, `${JSON.stringify(entry)}\n`, "utf8")
  return entry
}

export async function readRequestErrors(limit = 200): Promise<RequestErrorEntry[]> {
  const targetPath = getStorePath()
  const raw = await fs.readFile(targetPath, "utf8")
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0)
  const selected = lines.slice(-Math.max(1, Math.min(limit, 2000)))
  const parsed = selected
    .map((line) => {
      try {
        return JSON.parse(line) as RequestErrorEntry
      } catch {
        return null
      }
    })
    .filter((line): line is RequestErrorEntry => line !== null)
  return parsed.reverse()
}