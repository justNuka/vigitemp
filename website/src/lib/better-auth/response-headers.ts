import type { NextResponse } from "next/server"

export function appendBetterAuthResponseHeaders(response: NextResponse, headers: Headers) {
  for (const cookie of headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie)
  }
}
