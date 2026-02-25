import { NextRequest, NextResponse } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { getAuthenticatedUser } from "@/lib/auth"
import type { JWTPayload } from "@/lib/jwt"
import { hasUserAnyAuthorizationCode, hasUserAuthorizationCode, isAdminUser } from "@/lib/authz"
import { apiError } from "@/lib/api-response"

type HandlerContext = {
  user: JWTPayload
}

type ApiHandler = (
  req: NextRequest,
  ctx: HandlerContext,
  ...args: any[]
) => Promise<NextResponse>

export function withAuthLogging(
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withLogging(async (req: NextRequest, ...args: any[]) => {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    return handler(req, { user }, ...args)
  }, options)
}

export function withAdminLogging(
  handler: ApiHandler,
  options?: { skipLogging?: boolean; label?: string },
) {
  return withAuthLogging(
    async (req: NextRequest, ctx: HandlerContext, ...args: any[]) => {
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
    async (req: NextRequest, ctx: HandlerContext, ...args: any[]) => {
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
    async (req: NextRequest, ctx: HandlerContext, ...args: any[]) => {
      const ok = await hasUserAnyAuthorizationCode(ctx.user.userId, requiredCodes)
      if (!ok) {
        return apiError(403, "forbidden", "Acc?s interdit")
      }

      return handler(req, ctx, ...args)
    },
    options,
  )
}
