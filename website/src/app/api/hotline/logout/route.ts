import { NextRequest } from "next/server"
import { apiOk } from "@/lib/api-response"
import {
  clearHotlineCookieOptions,
  getHotlineAccessCookieName,
  getHotlineRefreshCookieName,
} from "@/lib/hotline-auth"

export async function POST(req: NextRequest) {
  const response = apiOk({ success: true })
  response.cookies.set(getHotlineAccessCookieName(), "", clearHotlineCookieOptions(req))
  response.cookies.set(getHotlineRefreshCookieName(), "", clearHotlineCookieOptions(req))
  return response
}