import assert from "node:assert/strict"

import { NextResponse } from "next/server"

import { appendBetterAuthResponseHeaders } from "../src/lib/better-auth/response-headers"

function getCookieNames(response: NextResponse) {
  return response.headers.getSetCookie().map((cookie) => cookie.split("=", 1)[0]?.trim())
}

function buildBetterAuthHeaders(value: string, maxAge: number) {
  const headers = new Headers()
  headers.append(
    "set-cookie",
    `vigisensys-auth-v2.session_token=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`,
  )
  return headers
}

function assertLoginCookieBridge() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set("auth-token", "legacy-access", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  response.cookies.set("refresh-token", "legacy-refresh", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })

  appendBetterAuthResponseHeaders(
    response,
    buildBetterAuthHeaders("better-auth-session", 60 * 60),
  )

  const names = getCookieNames(response)
  assert.ok(names.includes("auth-token"), "legacy access cookie must be preserved")
  assert.ok(names.includes("refresh-token"), "legacy refresh cookie must be preserved")
  assert.ok(
    names.includes("vigisensys-auth-v2.session_token"),
    "Better Auth session cookie must be preserved alongside legacy cookies",
  )
}

function assertLogoutCookieBridge() {
  const response = NextResponse.json({ ok: true })

  for (const name of ["token", "auth-token", "refresh-token"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
  }

  appendBetterAuthResponseHeaders(response, buildBetterAuthHeaders("", 0))

  const names = getCookieNames(response)
  assert.ok(names.includes("token"), "legacy token deletion must be preserved")
  assert.ok(names.includes("auth-token"), "legacy access deletion must be preserved")
  assert.ok(names.includes("refresh-token"), "legacy refresh deletion must be preserved")
  assert.ok(
    names.includes("vigisensys-auth-v2.session_token"),
    "Better Auth session deletion must be preserved alongside legacy deletions",
  )
}

assertLoginCookieBridge()
assertLogoutCookieBridge()
console.log("[better-auth-cookie-bridge] PASS: legacy and Better Auth Set-Cookie headers coexist")
