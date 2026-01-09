import net from "net"
import { NextRequest } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getHotlineConfig } from "@/lib/hotline-config"
import { getHotlineSession } from "@/lib/hotline-auth"

type HealthState = "ok" | "error" | "unknown"

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

export async function GET(req: NextRequest) {
  const session = getHotlineSession(req)
  if (!session) {
    return apiError(401, "unauthenticated", "Non authentifie")
  }

  const config = await getHotlineConfig()
  const timeoutMs = process.env.HOTLINE_SERVER_TIMEOUT_MS
    ? Number(process.env.HOTLINE_SERVER_TIMEOUT_MS)
    : 2000

  const [dbMain, dbMesure] = await Promise.all([
    checkMainDb(),
    checkMesureDb(),
  ])

  let server: HealthState = "unknown"
  if (config.serverHost && config.serverPort) {
    server = await checkTcp(config.serverHost, config.serverPort, timeoutMs)
  }

  return apiOk({
    server,
    dbMain,
    dbMesure,
  })
}
