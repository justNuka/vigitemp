import { NextRequest } from "next/server"
import { z } from "zod"

import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { getUserAvatarValue, setUserAvatarValue } from "@/lib/user-avatar-db"

const schema = z.object({
  avatar: z.string().trim().max(512).nullable(),
})

export const GET = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const avatar = await getUserAvatarValue(ctx.user.userId)
    log.info("AVATAR", "Self avatar fetched", { user: ctx.user.username, userId: ctx.user.userId, ip, hasAvatar: Boolean(avatar) })
    return apiOk({ avatar })
  } catch (error) {
    log.error("AVATAR", "Self avatar fetch failed", { user: ctx.user.username, userId: ctx.user.userId, ip, error: error instanceof Error ? error.message : String(error) })
    return apiError(500, "avatar_fetch_failed", "Erreur lors de la lecture de l'avatar")
  }
})

export const PATCH = withAuthLogging(async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const updated = await setUserAvatarValue(ctx.user.userId, data.avatar || null)
    if (!updated) {
      log.warn("AVATAR", "Self avatar update rejected: avatar column unavailable or update failed", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
      })
      return apiError(500, "avatar_update_unavailable", "Impossible d'enregistrer l'avatar")
    }
    log.info("AVATAR", "Self avatar updated", { user: ctx.user.username, userId: ctx.user.userId, ip, avatarType: data.avatar ? (data.avatar.startsWith("/") ? "uploaded" : "library") : "removed" })
    const avatar = await getUserAvatarValue(ctx.user.userId)

    return apiOk({ avatar })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Format avatar invalide")
    }

    log.error("AVATAR", "Self avatar update failed", { user: ctx.user.username, userId: ctx.user.userId, ip, error: error instanceof Error ? error.message : String(error) })
    return apiError(500, "avatar_update_failed", "Erreur lors de la mise a jour de l'avatar")
  }
})
