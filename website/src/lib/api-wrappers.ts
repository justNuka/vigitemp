import { NextRequest, NextResponse } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { getAuthenticatedUser } from "@/lib/auth"
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  generateAccessToken,
  type JWTPayload,
} from "@/lib/jwt"
import { hasUserAnyAuthorizationCode, hasUserAuthorizationCode, isAdminUser } from "@/lib/authz"
import { apiError } from "@/lib/api-response"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

/**
 * The Next.js route context object passed as the second argument by the framework
 * for dynamic routes (e.g. /api/users/[id]).
 */
export type NextRouteContext = {
  params: Record<string, string | string[]> | Promise<Record<string, string | string[]>>
}

export type HandlerContext = {
  user: JWTPayload
}

/**
 * `...args: any[]` is intentional here: call sites destructure the third argument with
 * route-specific param shapes (e.g. `{ params: Promise<{ id: string }> }`).
 * TypeScript's contravariance rules require the ApiHandler rest params to be `any[]`
 * so that all narrowly-typed call-site handlers remain assignable to this type without
 * modifying the 40+ existing route files.
 * The `any` is confined to this single type alias and does not appear in implementations.
 */
export type ApiHandler = (req: NextRequest, ctx: HandlerContext, ...args: any[]) => Promise<NextResponse>

export function withAuthLogging(
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withLogging(async (req: NextRequest, ...args: unknown[]) => {
    const user = getAuthenticatedUser(req)
    if (!user) {
      const response = apiError(401, "unauthenticated", "Non authentifié")
      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: shouldUseSecureCookies(req),
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })
      return response
    }

    const response = await handler(req, { user }, ...args)

    // Sliding session: renew access token on authenticated API traffic.
    try {
      const renewedToken = generateAccessToken({
        userId: user.userId,
        username: user.username,
        profile: user.profile,
        authorizations: user.authorizations ?? [],
      })
      response.cookies.set("auth-token", renewedToken, {
        httpOnly: true,
        secure: shouldUseSecureCookies(req),
        sameSite: "lax",
        maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      })
    } catch {
      // Keep API response even if token refresh fails.
    }

    return response
  }, options)
}

export function withAdminLogging(
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthLogging(
    async (req: NextRequest, ctx: HandlerContext, ...args: unknown[]) => {
      const ok = await isAdminUser(ctx.user.userId)
      if (!ok) {
        return apiError(403, "forbidden", "Accès interdit")
      }

      return handler(req, ctx, ...args)
    },
    options,
  )
}

export function withAuthorizationLogging(
  requiredCode: string,
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthLogging(
    async (req: NextRequest, ctx: HandlerContext, ...args: unknown[]) => {
      const ok = await hasUserAuthorizationCode(ctx.user.userId, requiredCode)
      if (!ok) {
        return apiError(403, "forbidden", "Accès interdit")
      }

      return handler(req, ctx, ...args)
    },
    options,
  )
}

export function withAnyAuthorizationLogging(
  requiredCodes: readonly string[],
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthLogging(
    async (req: NextRequest, ctx: HandlerContext, ...args: unknown[]) => {
      const ok = await hasUserAnyAuthorizationCode(ctx.user.userId, requiredCodes)
      if (!ok) {
        return apiError(403, "forbidden", "Accès interdit")
      }

      return handler(req, ctx, ...args)
    },
    options,
  )
}
