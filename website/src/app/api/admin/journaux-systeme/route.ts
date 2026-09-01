import { NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"

type SystemLogEntry = {
  id: string
  dateHeure: string
  utilisateur: string
  action: string
  details?: string
}

function parseLogLine(line: string): Omit<SystemLogEntry, "id"> {
  const match = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.*)$/)

  if (!match) {
    return {
      dateHeure: "",
      utilisateur: "System",
      action: line,
      details: "",
    }
  }

  const timestamp = match[1]
  const level = match[2]
  const label = match[3]
  const rest = match[4]

  let message = rest
  let metadata: unknown = undefined

  const jsonStart = rest.lastIndexOf(" {")
  if (jsonStart !== -1) {
    const maybeJson = rest.slice(jsonStart + 1)
    try {
      metadata = JSON.parse(maybeJson)
      message = rest.slice(0, jsonStart).trimEnd()
    } catch {
      // Ignore JSON parsing errors
    }
  }

  const meta = (metadata && typeof metadata === "object" ? metadata : undefined) as
    | Record<string, unknown>
    | undefined

  const utilisateur =
    (typeof meta?.user === "string" && meta.user) ||
    (typeof meta?.username === "string" && meta.username) ||
    "System"

  const action = `[${level.toUpperCase()}] ${label} — ${message}`
  const details =
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : ""

  return { dateHeure: timestamp, utilisateur, action, details }
}

async function getLatestLogFile(logsRoot: string): Promise<string | null> {
  try {
    const monthDirs = await fs.readdir(logsRoot, { withFileTypes: true })
    const candidates: { fullPath: string; mtimeMs: number }[] = []

    for (const dirent of monthDirs) {
      if (!dirent.isDirectory()) continue

      const monthDir = path.join(logsRoot, dirent.name)
      const files = await fs.readdir(monthDir, { withFileTypes: true })
      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith(".log")) continue
        const fullPath = path.join(monthDir, file.name)
        const stat = await fs.stat(fullPath)
        candidates.push({ fullPath, mtimeMs: stat.mtimeMs })
      }
    }

    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return candidates[0]?.fullPath ?? null
  } catch {
    return null
  }
}

async function tailFile(filePath: string, maxBytes: number): Promise<string> {
  const handle = await fs.open(filePath, "r")
  try {
    const stat = await handle.stat()
    const size = stat.size
    const start = Math.max(0, size - maxBytes)
    const length = size - start
    const buffer = Buffer.alloc(length)

    await handle.read(buffer, 0, length, start)
    return buffer.toString("utf8")
  } finally {
    await handle.close()
  }
}

/**
 * GET /api/admin/journaux-systeme?page=1&limit=10
 * Retourne les logs techniques (fichiers winston) avec pagination.
 */
export const GET = withAdminLogging(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1", 10)
  const rawLimit = parseInt(searchParams.get("limit") || "10", 10)
  const limit = Math.min(Math.max(rawLimit, 1), 10)
  const skip = (page - 1) * limit

  const logsRoot = path.join(process.cwd(), "logs")
  const latestFile = await getLatestLogFile(logsRoot)

  if (!latestFile) {
    return apiOk({
      data: [],
      pagination: { page, limit, total: 0, pages: 1 },
    })
  }

  const raw = await tailFile(latestFile, 512 * 1024)
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const newestFirst = lines.slice(-500).reverse()
  const capped = newestFirst.slice(0, 50)
  const total = capped.length
  const pages = Math.max(1, Math.ceil(total / limit))

  if (skip >= total) {
    return apiOk({
      data: [],
      pagination: { page, limit, total, pages },
    })
  }

  const pageSlice = capped.slice(skip, skip + limit)
  const data: SystemLogEntry[] = pageSlice.map((line, idx) => ({
    id: `${path.basename(latestFile)}:${skip + idx + 1}`,
    ...parseLogLine(line),
  }))

  return apiOk({
    data,
    pagination: { page, limit, total, pages },
  })
})
