import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { createHash } from "node:crypto"
import { apiError, apiOk } from "@/lib/api-response"

const subscribeSchema = z.object({
  endpoint: z.string().min(1),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
})

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthenticated", "Non authentifié")
  }

  const body = await req.json().catch(() => null)
  const validated = subscribeSchema.safeParse(body)
  if (!validated.success) {
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  const now = new Date()
  const endpointHash = createHash("sha256").update(validated.data.endpoint, "utf8").digest("hex")
  const expiration =
    validated.data.expirationTime === null || validated.data.expirationTime === undefined
      ? null
      : BigInt(Math.trunc(validated.data.expirationTime))

  await prisma.t_push_subscription.upsert({
    where: { Endpoint_Hash: endpointHash },
    create: {
      Id_Utilisateur: user.userId,
      Endpoint: validated.data.endpoint,
      Endpoint_Hash: endpointHash,
      Key_P256dh: validated.data.keys.p256dh,
      Key_Auth: validated.data.keys.auth,
      Expiration_Time: expiration,
      User_Agent: validated.data.userAgent ?? null,
      Date_Creation: now,
      Date_Modification: now,
      Est_Archive: false,
    },
    update: {
      Id_Utilisateur: user.userId,
      Endpoint: validated.data.endpoint,
      Key_P256dh: validated.data.keys.p256dh,
      Key_Auth: validated.data.keys.auth,
      Expiration_Time: expiration,
      User_Agent: validated.data.userAgent ?? null,
      Date_Modification: now,
      Est_Archive: false,
    },
  })

  return apiOk({ success: true })
})
