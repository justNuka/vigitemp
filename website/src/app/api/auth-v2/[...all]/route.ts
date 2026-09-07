import { NextResponse } from "next/server"

import {
  getVigiSensysBetterAuth,
  isBetterAuthRuntimeEnabled,
} from "@/lib/better-auth/auth"
import { log } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function handle(request: Request) {
  if (!isBetterAuthRuntimeEnabled()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  try {
    return await getVigiSensysBetterAuth().handler(request)
  } catch (error) {
    log.error("AUTH", "Better Auth request failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { ok: false, error: "better_auth_unavailable" },
      { status: 503 },
    )
  }
}

export { handle as GET, handle as POST }
