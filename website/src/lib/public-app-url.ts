import type { NextRequest } from "next/server"
import { getPathname } from "@/i18n/navigation"
import type { AppLanguage } from "@/lib/app-language"

function normalizeBaseUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null
  return value.replace(/\/$/, "")
}

function getRequestOrigin(req?: NextRequest | null): string | null {
  if (!req) return null

  const forwardedProto = req.headers.get("x-forwarded-proto")
  const forwardedHost = req.headers.get("x-forwarded-host")
  if (forwardedHost) {
    return `${forwardedProto || "http"}://${forwardedHost}`.replace(/\/$/, "")
  }

  const origin = req.nextUrl?.origin ?? null
  return normalizeBaseUrl(origin)
}

export function getPublicAppUrl(req?: NextRequest | null): string {
  const configured = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL)
  if (configured) {
    return configured
  }

  const requestOrigin = getRequestOrigin(req)
  if (requestOrigin) {
    return requestOrigin
  }

  return "http://localhost:3000"
}

export function getLocalizedPublicAppUrl(
  href: string,
  locale: AppLanguage,
  req?: NextRequest | null,
  searchParams?: Record<string, string | number | boolean | null | undefined>,
): string {
  const baseUrl = getPublicAppUrl(req)
  const pathname = getPathname({ locale, href: href as never })
  const url = new URL(pathname, `${baseUrl}/`)

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === null || value === undefined) continue
    url.searchParams.set(key, String(value))
  }

  return url.toString()
}
