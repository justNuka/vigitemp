import { NextRequest } from "next/server"

import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getDbNow } from "@/lib/sql-provider"

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
    const now = await getDbNow(prisma)
    return {
      ok: true,
      elapsedMs: Date.now() - start,
      value: String(now),
    }
  } catch (error) {
    return {
      ok: false,
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string; meta?: unknown })?.code,
      meta: (error as { code?: string; meta?: unknown })?.meta,
    }
  }
}

async function pingMesuresDb(): Promise<PingResult> {
  const start = Date.now()
  try {
    const now = await getDbNow(prismaMesure)
    return {
      ok: true,
      elapsedMs: Date.now() - start,
      value: String(now),
    }
  } catch (error) {
    return {
      ok: false,
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string; meta?: unknown })?.code,
      meta: (error as { code?: string; meta?: unknown })?.meta,
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
