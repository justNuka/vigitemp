import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

export type HotlineSession = {
  username: string
  tokenType?: "access" | "refresh"
}

const HOTLINE_ACCESS_COOKIE_NAME = "hotline-auth-token"
const HOTLINE_REFRESH_COOKIE_NAME = "hotline-refresh-token"

function getHotlineSecret() {
  return process.env.HOTLINE_JWT_SECRET || process.env.JWT_SECRET || "hotline-secret-change-this"
}

function getAccessTokenTtlMinutes() {
  const raw = process.env.HOTLINE_ACCESS_TOKEN_TTL_MINUTES
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15
}

function getRefreshTokenTtlMinutes() {
  const raw = process.env.HOTLINE_REFRESH_TOKEN_TTL_MINUTES
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120
}

export function createHotlineAccessToken(payload: HotlineSession) {
  return jwt.sign(payload, getHotlineSecret(), {
    expiresIn: `${getAccessTokenTtlMinutes()}m`,
  })
}

export function createHotlineRefreshToken(payload: HotlineSession) {
  return jwt.sign({ ...payload, tokenType: "refresh" as const }, getHotlineSecret(), {
    expiresIn: `${getRefreshTokenTtlMinutes()}m`,
  })
}

export function verifyHotlineAccessToken(token: string): HotlineSession | null {
  try {
    const decoded = jwt.verify(token, getHotlineSecret()) as HotlineSession
    if (decoded?.tokenType === "refresh") return null
    return decoded
  } catch {
    return null
  }
}

export function verifyHotlineRefreshToken(token: string): HotlineSession | null {
  try {
    const decoded = jwt.verify(token, getHotlineSecret()) as HotlineSession
    if (decoded?.tokenType !== "refresh") return null
    return decoded
  } catch {
    return null
  }
}

export function getHotlineSession(req: NextRequest): HotlineSession | null {
  const token = req.cookies.get(HOTLINE_ACCESS_COOKIE_NAME)?.value
  if (!token) return null
  return verifyHotlineAccessToken(token)
}

export function getHotlineRefreshSession(req: NextRequest): HotlineSession | null {
  const token = req.cookies.get(HOTLINE_REFRESH_COOKIE_NAME)?.value
  if (!token) return null
  return verifyHotlineRefreshToken(token)
}

export function getHotlineAccessCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: getAccessTokenTtlMinutes() * 60,
  }
}

export function getHotlineRefreshCookieOptions(req: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax" as const,
    path: "/",
    maxAge: getRefreshTokenTtlMinutes() * 60,
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

export function getHotlineAccessCookieName() {
  return HOTLINE_ACCESS_COOKIE_NAME
}

export function getHotlineRefreshCookieName() {
  return HOTLINE_REFRESH_COOKIE_NAME
}