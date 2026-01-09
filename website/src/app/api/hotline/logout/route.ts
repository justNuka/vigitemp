import { NextRequest } from "next/server"
import { apiOk } from "@/lib/api-response"
import { clearHotlineCookieOptions, getHotlineCookieName } from "@/lib/hotline-auth"

export async function POST(req: NextRequest) {
  const response = apiOk({ success: true })
  response.cookies.set(getHotlineCookieName(), "", clearHotlineCookieOptions(req))
  return response
}
