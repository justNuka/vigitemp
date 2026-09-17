import "server-only"

import net from "net"
import os from "os"

import { WEB_APP_VERSION } from "@/lib/app-version"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { prisma, prismaMesure } from "@/lib/prisma"
import { isMssqlProvider } from "@/lib/sql-provider"
import { getCompatEnv } from "@/lib/vigisensys-compat"
import type { HealthState, SystemHealthSnapshot } from "@/types/system-health"

type HotlineServerVersionResponse = {
  ok?: boolean
  version?: string
  data?: { version?: string }
}

function resolveTimeoutMs() {
  const parsed = Number(process.env.HOTLINE_SERVER_TIMEOUT_MS)
  if (!Number.isFinite(parsed) || parsed <= 0) return 2000
  return Math.min(Math.max(Math.round(parsed), 250), 10_000)
}

async function checkTcp(host: string, port: number, timeoutMs: number) {
  return new Promise<HealthState>((resolve) => {
    const socket = new net.Socket()
    let settled = false

    const finalize = (state: HealthState) => {
      if (settled) return
      settled = true
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
    const apiKey = getCompatEnv("VIGISENSYS_HOTLINE_API_KEY", "VIGITEMP_HOTLINE_API_KEY")
    if (apiKey) {
      headers["x-vigisensys-hotline-key"] = apiKey
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

async function checkMainDb(): Promise<HealthState> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return "ok"
  } catch {
    return "error"
  }
}

async function checkMesureDb(): Promise<HealthState> {
  try {
    await prismaMesure.$queryRaw`SELECT 1`
    return "ok"
  } catch {
    return "error"
  }
}

async function checkChatDb(): Promise<{ status: HealthState; configured: boolean }> {
  const configured = Boolean(process.env.DATABASE_CHAT_URL?.trim())
  if (!configured) return { status: "unknown", configured: false }

  try {
    const { prismaChat } = await import("@/lib/prisma-chat")
    await prismaChat.$queryRaw`SELECT 1`
    return { status: "ok", configured: true }
  } catch {
    return { status: "error", configured: true }
  }
}

async function resolveHotlineConfig() {
  try {
    return await getHotlineServerConfig()
  } catch {
    return null
  }
}

export async function collectSystemHealth(): Promise<SystemHealthSnapshot> {
  const timeoutMs = resolveTimeoutMs()
  const [dbMain, dbMesure, dbChat, config] = await Promise.all([
    checkMainDb(),
    checkMesureDb(),
    checkChatDb(),
    resolveHotlineConfig(),
  ])

  let server: HealthState = "unknown"
  let serverVersion: string | null = null
  let serverConfigured = false

  if (config?.serverHost && config.serverPort) {
    serverConfigured = true
    server = await checkTcp(config.serverHost, config.serverPort, timeoutMs)
    if (server === "ok") {
      serverVersion = await fetchServerVersion(config.serverHost, config.serverPort, timeoutMs)
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    services: {
      web: {
        status: "ok",
        version: WEB_APP_VERSION,
      },
      server: {
        status: server,
        configured: serverConfigured,
        version: serverVersion,
      },
      dbMain: { status: dbMain },
      dbMesure: { status: dbMesure },
      dbChat,
    },
    runtime: {
      hostname: os.hostname(),
      os: `${os.type()} ${os.release()}`,
      architecture: process.arch,
      nodeVersion: process.version,
      processUptimeSeconds: Math.max(0, Math.round(process.uptime())),
      systemUptimeSeconds: Math.max(0, Math.round(os.uptime())),
      databaseProvider: isMssqlProvider() ? "sqlserver" : "mysql",
    },
  }
}
