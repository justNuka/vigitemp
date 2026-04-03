import net from "net"
import { NextRequest } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { getHotlineSession } from "@/lib/hotline-auth"
import { WEB_APP_VERSION } from "@/lib/app-version"

type HealthState = "ok" | "error" | "unknown"

type HotlineServerVersionResponse = {
  ok?: boolean
  version?: string
  data?: { version?: string }
}

async function checkTcp(host: string, port: number, timeoutMs: number) {
  return new Promise<HealthState>((resolve) => {
    const socket = new net.Socket()
    const finalize = (state: HealthState) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(state)
    }

    socket.setTimeout(timeoutMs)
    socket.once("error", () => finalize("error"))
    socket.once("timeout", () => finalize("error"))
    socket.connect(port, host, () => finalize("ok"))
  })
}

async function fetchServerVersion(host: string, port: number, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {}
    const apiKey = process.env.VIGITEMP_HOTLINE_API_KEY?.trim()
    if (apiKey) {
      headers["x-vigitemp-hotline-key"] = apiKey
    }

    const response = await fetch(`http://${host}:${port}/api/hotline/version`, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) return null
    const payload = (await response.json()) as HotlineServerVersionResponse
    return payload.data?.version || payload.version || null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function checkMainDb() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return "ok" as const
  } catch {
    return "error" as const
  }
}

async function checkMesureDb() {
  try {
    await prismaMesure.$queryRaw`SELECT 1`
    return "ok" as const
  } catch {
    return "error" as const
  }
}


async function checkChatDb(): Promise<HealthState> {
  const chatDbUrl = process.env.DATABASE_CHAT_URL?.trim()
  if (!chatDbUrl) return "unknown"

  try {
    const { prismaChat } = await import("@/lib/prisma-chat")
    await prismaChat.$queryRaw`SELECT 1`
    return "ok"
  } catch {
    return "error"
  }
}

export async function GET(req: NextRequest) {
  const session = getHotlineSession(req)
  if (!session) {
    return apiError(401, "unauthenticated", "Non authentifie")
  }

  const config = await getHotlineServerConfig()
  const timeoutMs = process.env.HOTLINE_SERVER_TIMEOUT_MS
    ? Number(process.env.HOTLINE_SERVER_TIMEOUT_MS)
    : 2000

  const [dbMain, dbMesure, dbChat] = await Promise.all([
    checkMainDb(),
    checkMesureDb(),
    checkChatDb(),
  ])

  let server: HealthState = "unknown"
  let serverVersion: string | null = null
  if (config.serverHost && config.serverPort) {
    server = await checkTcp(config.serverHost, config.serverPort, timeoutMs)
    if (server === "ok") {
      serverVersion = await fetchServerVersion(config.serverHost, config.serverPort, timeoutMs)
    }
  }

  return apiOk({
    server,
    dbMain,
    dbMesure,
    dbChat,
    webVersion: WEB_APP_VERSION,
    serverVersion,
  })
}
