import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { getUserAvatarMap } from "@/lib/user-avatar-db"
import type { UserInfo } from "@/lib/chat-types"
import { z } from "zod"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

const TAKE = 50

async function loadAttachmentsSafe(messageIds: number[]) {
  if (messageIds.length === 0) return []

  try {
    return await prismaChat.t_message_attachment.findMany({
      where: { Id_Message: { in: messageIds } },
      select: {
        Id_Attachment: true,
        Id_Message: true,
        File_Name: true,
        Mime_Type: true,
        File_Size: true,
      },
    })
  } catch (error) {
    log.warn("chat/conversations/messages", "message_attachments_table_unavailable", { error })
    return []
  }
}

const postBodySchema = z
  .object({
    contenu: z.string().max(10000).default(""),
    attachmentIds: z.array(z.number().int().positive()).max(10).optional().default([]),
  })
  .refine((data) => data.contenu.trim().length > 0 || data.attachmentIds.length > 0, {
    message: "Message vide",
    path: ["contenu"],
  })

type RouteParams = { params: Promise<{ id: string }> }

export const GET = withAuthLogging(
  async (req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)

      if (isNaN(convId) || convId <= 0) {
        return apiError(400, "invalid_id", "ID de conversation invalide")
      }

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) {
        return apiError(403, "not_participant", "Vous n'etes pas membre de cette conversation")
      }

      const cursorParam = req.nextUrl.searchParams.get("cursor")
      const cursor = cursorParam ? parseInt(cursorParam, 10) : 0

      const messages = await prismaChat.t_message.findMany({
        where: {
          Id_Conversation: convId,
          Date_Suppression: null,
          ...(cursor > 0 ? { Id_Message: { lt: cursor } } : {}),
        },
        orderBy: { Id_Message: "desc" },
        take: TAKE,
        select: {
          Id_Message: true,
          Id_Conversation: true,
          Sender_Id: true,
          Contenu: true,
          Date_Creation: true,
          Date_Modification: true,
        },
      })

      const messageIds = messages.map((m) => m.Id_Message)
      const senderIds = Array.from(new Set(messages.map((m) => m.Sender_Id)))

      const [dbUsers, participants, attachments] = await Promise.all([
        prisma.t_utilisateur.findMany({
          where: { Id_Utilisateur: { in: senderIds } },
          select: {
            Id_Utilisateur: true,
            Login: true,
            Prenom: true,
            Nom: true,
          },
        }),
        prismaChat.t_conversation_participant.findMany({
          where: { Id_Conversation: convId },
          select: { Id_Utilisateur: true, Last_Read_Msg_Id: true },
        }),
        loadAttachmentsSafe(messageIds),
      ])

      // Group attachments by message ID
      const attachmentsByMsgId = new Map<number, typeof attachments>()
      for (const att of attachments) {
        const existing = attachmentsByMsgId.get(att.Id_Message) ?? []
        existing.push(att)
        attachmentsByMsgId.set(att.Id_Message, existing)
      }

      const avatarMap = await getUserAvatarMap(senderIds)

      const userMap = new Map<number, UserInfo>()
      for (const u of dbUsers) {
        const initials = getInitialsForAvatar(u.Prenom, u.Nom, u.Login)
        const avatarValue = avatarMap.get(u.Id_Utilisateur) ?? null
        const avatarSrc = resolveAvatarSrc(avatarValue, initials)
        userMap.set(u.Id_Utilisateur, {
          name: (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`),
          initials,
          avatarSrc,
        })
      }

      const otherParticipants = participants.filter((p) => p.Id_Utilisateur !== userId)

      const enriched = messages
        .slice()
        .reverse()
        .map((msg) => {
          const sender = userMap.get(msg.Sender_Id)
          const msgAttachments = attachmentsByMsgId.get(msg.Id_Message) ?? []
          const readByAll =
            msg.Sender_Id === userId
              ? otherParticipants.every((p) => (p.Last_Read_Msg_Id ?? 0) >= msg.Id_Message)
              : false
          return {
            id: msg.Id_Message,
            conversationId: msg.Id_Conversation,
            senderId: msg.Sender_Id,
            senderName: sender?.name ?? `User ${msg.Sender_Id}`,
            senderInitials: sender?.initials ?? "??",
            senderAvatarSrc: sender?.avatarSrc ?? null,
            content: msg.Contenu,
            createdAt: msg.Date_Creation.toISOString(),
            updatedAt: msg.Date_Modification?.toISOString() ?? null,
            readByAll,
            attachments: msgAttachments.map((att) => ({
              id: att.Id_Attachment,
              fileName: att.File_Name,
              mimeType: att.Mime_Type,
              size: att.File_Size,
            })),
          }
        })

      const nextCursor =
        messages.length === TAKE ? messages[messages.length - 1].Id_Message : undefined

      return apiOk({ messages: enriched, nextCursor })
    } catch (error) {
      log.error("chat/conversations/messages", "messages_fetch_error", { error })
      return apiError(500, "messages_fetch_failed", "Erreur lors de la recuperation des messages")
    }
  },
)

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)

      if (isNaN(convId) || convId <= 0) {
        return apiError(400, "invalid_id", "ID de conversation invalide")
      }

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) {
        return apiError(403, "not_participant", "Vous n'etes pas membre de cette conversation")
      }

      const body: unknown = await req.json()
      const parsed = postBodySchema.safeParse(body)

      if (!parsed.success) {
        return apiError(400, "validation_error", "Donnees invalides", { issues: parsed.error.issues })
      }

      const { contenu, attachmentIds } = parsed.data
      const normalizedContent = contenu.trim()

      const created = await prismaChat.$transaction(async (tx) => {
        let placeholderAttachments:
          | Array<{
              Id_Attachment: number
              Id_Message: number
            }>
          = []

        if (attachmentIds.length > 0) {
          placeholderAttachments = await tx.t_message_attachment.findMany({
            where: {
              Id_Attachment: { in: attachmentIds },
              message: {
                Id_Conversation: convId,
                Sender_Id: userId,
                Date_Suppression: { not: null },
              },
            },
            select: {
              Id_Attachment: true,
              Id_Message: true,
            },
          })

          if (placeholderAttachments.length !== attachmentIds.length) {
            throw new Error("invalid_pending_attachments")
          }
        }

        const message = await tx.t_message.create({
          data: {
            Id_Conversation: convId,
            Sender_Id: userId,
            Contenu: normalizedContent,
          },
          select: {
            Id_Message: true,
            Id_Conversation: true,
            Sender_Id: true,
            Contenu: true,
            Date_Creation: true,
            Date_Modification: true,
          },
        })

        if (placeholderAttachments.length > 0) {
          await tx.t_message_attachment.updateMany({
            where: {
              Id_Attachment: { in: placeholderAttachments.map((attachment) => attachment.Id_Attachment) },
            },
            data: { Id_Message: message.Id_Message },
          })

          await tx.t_message.deleteMany({
            where: {
              Id_Message: {
                in: Array.from(new Set(placeholderAttachments.map((attachment) => attachment.Id_Message))),
              },
            },
          })
        }

        return message
      })

      return apiOk({
        id: created.Id_Message,
        conversationId: created.Id_Conversation,
        senderId: created.Sender_Id,
        content: created.Contenu,
        createdAt: created.Date_Creation.toISOString(),
        updatedAt: created.Date_Modification?.toISOString() ?? null,
      })
    } catch (error) {
      if (error instanceof Error && error.message === "invalid_pending_attachments") {
        return apiError(400, "invalid_pending_attachments", "Pieces jointes temporaires invalides")
      }

      log.error("chat/conversations/messages", "message_send_error", { error })
      return apiError(500, "message_send_failed", "Erreur lors de l'envoi du message")
    }
  },
)
