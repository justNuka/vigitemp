import { NextResponse } from "next/server"

import {
  getVigiSensysBetterAuth,
  isBetterAuthRuntimeEnabled,
} from "@/lib/better-auth/auth"
import { log } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TRUE_VALUES = new Set(["1", "true", "yes", "on"])

function isBetterAuthPublicApiEnabled() {
  const value = process.env.BETTER_AUTH_PUBLIC_API_ENABLED?.trim().toLowerCase()
  return value ? TRUE_VALUES.has(value) : false
}

async function handle(request: Request) {
  // Le login VigiSensys reste la façade métier pendant la transition.
  // Ouvrir directement les endpoints Better Auth permettrait sinon de contourner
  // les règles CFR21, licence, audit et métadonnées machine du login applicatif.
  if (!isBetterAuthRuntimeEnabled() || !isBetterAuthPublicApiEnabled()) {
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
