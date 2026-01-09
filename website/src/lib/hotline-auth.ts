import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

export type HotlineSession = {
  username: string
}

const HOTLINE_COOKIE_NAME = "hotline-token"

function getHotlineSecret() {
  return process.env.HOTLINE_JWT_SECRET || process.env.JWT_SECRET || "hotline-secret-change-this"
}

function getTokenTtlHours() {
  const raw = process.env.HOTLINE_TOKEN_TTL_HOURS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8
}

export function createHotlineToken(payload: HotlineSession) {
  return jwt.sign(payload, getHotlineSecret(), {
    expiresIn: `${getTokenTtlHours()}h`,
  })
}

export function verifyHotlineToken(token: string): HotlineSession | null {
  try {
    return jwt.verify(token, getHotlineSecret()) as HotlineSession
  } catch {
    return null
  }
}

export function getHotlineSession(req: NextRequest): HotlineSession | null {
  const token = req.cookies.get(HOTLINE_COOKIE_NAME)?.value
  if (!token) return null
  return verifyHotlineToken(token)
}

export function getHotlineCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: getTokenTtlHours() * 60 * 60,
  }
}

export function clearHotlineCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}

export async function verifyHotlinePassword(
  password: string,
  passwordHash: string,
) {
  if (!passwordHash) return false
  return bcrypt.compare(password, passwordHash)
}

export function getHotlineCookieName() {
  return HOTLINE_COOKIE_NAME
}
