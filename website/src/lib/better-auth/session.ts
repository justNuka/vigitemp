import type { NextResponse } from "next/server"

import { getVigiSensysBetterAuth, isBetterAuthRuntimeEnabled } from "@/lib/better-auth/auth"
import { appendBetterAuthResponseHeaders } from "@/lib/better-auth/response-headers"

export async function appendBetterAuthSignOutHeaders(
  response: NextResponse,
  requestHeaders: Headers,
) {
  if (!isBetterAuthRuntimeEnabled()) return false

  const result = await getVigiSensysBetterAuth().api.signOut({
    headers: requestHeaders,
    returnHeaders: true,
  })
  appendBetterAuthResponseHeaders(response, result.headers)
  return true
}
