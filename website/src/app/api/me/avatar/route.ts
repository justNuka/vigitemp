import { NextRequest } from "next/server"
import { z } from "zod"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getUserAvatarValue, setUserAvatarValue } from "@/lib/user-avatar-db"

const schema = z.object({
  avatar: z.string().trim().max(512).nullable(),
})

export const GET = withAuthLogging(async (_req: NextRequest, ctx: any) => {
  try {
    const avatar = await getUserAvatarValue(ctx.user.userId)
    return apiOk({ avatar })
  } catch (error) {
    console.error("Get self avatar error:", error)
    return apiError(500, "avatar_fetch_failed", "Erreur lors de la lecture de l'avatar")
  }
})

export const PATCH = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    await setUserAvatarValue(ctx.user.userId, data.avatar || null)
    const avatar = await getUserAvatarValue(ctx.user.userId)

    return apiOk({ avatar })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Format avatar invalide")
    }

    console.error("Update self avatar error:", error)
    return apiError(500, "avatar_update_failed", "Erreur lors de la mise a jour de l'avatar")
  }
})
