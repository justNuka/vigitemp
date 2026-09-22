import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { validateLicense } from "@/lib/license-server"
import { apiError } from "@/lib/api-response"

export type ChatGuardResult =
  | { ok: true }
  | { ok: false; response: NextResponse }

export async function checkChatAccess(): Promise<ChatGuardResult> {
  const license = await validateLicense()

  if (!license.ok) {
    return {
      ok: false,
      response: apiError(403, "license_invalid", "Licence invalide"),
    }
  }

  const setting = await prisma.t_parametre.findFirst({
    where: { Section: "messaging", Mot_Cle: "enabled" },
    select: { Valeur: true },
  })

  const enabled = setting ? setting.Valeur === "true" : true

  if (!enabled) {
    return {
      ok: false,
      response: apiError(403, "messaging_disabled", "La messagerie est desactivee"),
    }
  }

  return { ok: true }
}

export async function verifyParticipant(conversationId: number, userId: number): Promise<boolean> {
  const participant = await prismaChat.t_conversation_participant.findUnique({
    where: {
      Id_Conversation_Id_Utilisateur: {
        Id_Conversation: conversationId,
        Id_Utilisateur: userId,
      },
    },
  })
  return participant !== null
}
