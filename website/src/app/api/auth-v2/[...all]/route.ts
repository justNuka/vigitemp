import { NextResponse } from "next/server"

import { getBetterAuthPoc, isBetterAuthPocEnabled } from "@/lib/better-auth/poc/auth"
import { log } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function handle(request: Request) {
  if (!isBetterAuthPocEnabled()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  try {
    return await getBetterAuthPoc().handler(request)
  } catch (error) {
    log.error("AUTH", "Better Auth PoC request failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { ok: false, error: "better_auth_poc_unavailable" },
      { status: 503 },
    )
  }
}

export { handle as GET, handle as POST }
