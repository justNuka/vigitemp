import type { NextRequest } from "next/server"
import { getCompatEnv } from "@/lib/vigisensys-compat"

/**
 * Décide si on doit marquer les cookies `secure`.
 *
 * Problème typique : `NODE_ENV=production` + site servi en HTTP (ex: IP LAN)
 * => cookie `secure` refusé par le navigateur => boucle sur /login.
 *
 * - Si `VIGITEMP_COOKIE_SECURE` est défini, il force le comportement.
 * - Sinon on se base sur `x-forwarded-proto` (reverse proxy) puis sur l'URL.
 */
export function shouldUseSecureCookies(req: NextRequest): boolean {
  const forced = getCompatEnv("VIGISENSYS_COOKIE_SECURE", "VIGITEMP_COOKIE_SECURE")?.toLowerCase()
  if (forced === "1" || forced === "true") return true
  if (forced === "0" || forced === "false") return false

  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  if (forwardedProto) return forwardedProto === "https"

  return req.nextUrl.protocol === "https:"
}

