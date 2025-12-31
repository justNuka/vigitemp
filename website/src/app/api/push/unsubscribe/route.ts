import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { createHash } from "node:crypto"
import { apiError, apiOk } from "@/lib/api-response"

const unsubscribeSchema = z.object({
  endpoint: z.string().min(1),
})

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthenticated", "Non authentifié")
  }

  const body = await req.json().catch(() => null)
  const validated = unsubscribeSchema.safeParse(body)
  if (!validated.success) {
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  const endpointHash = createHash("sha256").update(validated.data.endpoint, "utf8").digest("hex")

  const now = new Date()
  await prisma.t_push_subscription.updateMany({
    where: {
      Endpoint_Hash: endpointHash,
      Id_Utilisateur: user.userId,
    },
    data: {
      Est_Archive: true,
      Date_Modification: now,
    },
  })

  return apiOk({ success: true })
})
