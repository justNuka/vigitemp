import { NextRequest } from "next/server"

import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"

type PingResult = {
  ok: boolean
  elapsedMs: number
  value?: string
  error?: string
  code?: string
  meta?: unknown
}

async function pingMainDb(): Promise<PingResult> {
  const start = Date.now()
  try {
    const rows = await prisma.$queryRaw<Array<{ now: Date | string }>>`SELECT NOW() AS now`
    return {
      ok: true,
      elapsedMs: Date.now() - start,
      value: rows?.[0]?.now ? String(rows[0].now) : "ok",
    }
  } catch (error) {
    return {
      ok: false,
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    }
  }
}

async function pingMesuresDb(): Promise<PingResult> {
  const start = Date.now()
  try {
    const rows = await prismaMesure.$queryRaw<Array<{ now: Date | string }>>`SELECT NOW() AS now`
    return {
      ok: true,
      elapsedMs: Date.now() - start,
      value: rows?.[0]?.now ? String(rows[0].now) : "ok",
    }
  } catch (error) {
    return {
      ok: false,
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    }
  }
}

export const GET = withAuthorizationLogging("GERER_PARAMETRES", async (_req: NextRequest) => {
  const [main, mesures] = await Promise.all([pingMainDb(), pingMesuresDb()])

  return apiOk({
    ok: main.ok && mesures.ok,
    main,
    mesures,
    timestamp: new Date().toISOString(),
  })
}, { label: "DEBUG_DB_PING" })
