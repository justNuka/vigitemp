import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { prismaChat } from "@/lib/prisma-chat"
import { log } from "@/lib/logger"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import type { JWTPayload } from "@/lib/jwt"

type RouteParams = { params: Promise<{ id: string }> }

const UPLOAD_DIR = join(process.cwd(), "uploads", "chat")
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
]

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
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

      // Fetch all attachments for messages in this conversation (non-deleted messages only)
      const attachments = await prismaChat.t_message_attachment.findMany({
        where: {
          message: {
            Id_Conversation: convId,
            Date_Suppression: null,
          },
        },
        select: {
          Id_Attachment: true,
          File_Name: true,
          Mime_Type: true,
          File_Size: true,
          Date_Upload: true,
          message: {
            select: {
              Sender_Id: true,
            },
          },
        },
        orderBy: { Date_Upload: "desc" },
      })

      if (attachments.length === 0) {
        return apiOk({ attachments: [] })
      }

      const senderIds = Array.from(new Set(attachments.map((a) => a.message.Sender_Id)))
      const dbUsers = await prisma.t_utilisateur.findMany({
        where: { Id_Utilisateur: { in: senderIds } },
        select: {
          Id_Utilisateur: true,
          Login: true,
          Prenom: true,
          Nom: true,
        },
      })

      const userNameMap = new Map<number, string>()
      for (const u of dbUsers) {
        const name = (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`)
        userNameMap.set(u.Id_Utilisateur, name)
      }

      const result = attachments.map((att) => ({
        id: att.Id_Attachment,
        fileName: att.File_Name,
        mimeType: att.Mime_Type,
        size: att.File_Size,
        uploadedAt: att.Date_Upload.toISOString(),
        senderName: userNameMap.get(att.message.Sender_Id) ?? `User ${att.message.Sender_Id}`,
      }))

      return apiOk({ attachments: result })
    } catch (error) {
      log.error("chat/conversations/attachments", "attachments_fetch_error", { error })
      return apiError(500, "attachments_fetch_failed", "Erreur lors de la recuperation des documents")
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
      if (isNaN(convId) || convId <= 0) return apiError(400, "invalid_id", "ID invalide")

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) return apiError(403, "not_participant", "Non membre")

      const formData = await req.formData()
      const file = formData.get("file")
      if (!file || !(file instanceof File)) {
        return apiError(400, "no_file", "Aucun fichier fourni")
      }

      if (file.size > MAX_SIZE) {
        return apiError(413, "file_too_large", "Fichier trop volumineux (max 20MB)")
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return apiError(415, "unsupported_type", "Type de fichier non supporté")
      }

      // Sanitize filename
      const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 200)
      const dotIndex = originalName.lastIndexOf(".")
      const ext = dotIndex !== -1 ? originalName.slice(dotIndex + 1) : ""
      const uniqueName = ext ? `${randomUUID()}.${ext}` : randomUUID()

      await mkdir(UPLOAD_DIR, { recursive: true })
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(join(UPLOAD_DIR, uniqueName), buffer)

      const attachment = await prismaChat.$transaction(async (tx) => {
        // Keep pending uploads attached to a hidden placeholder message so the FK stays valid.
        const placeholderMessage = await tx.t_message.create({
          data: {
            Id_Conversation: convId,
            Sender_Id: userId,
            Contenu: "",
            Date_Suppression: new Date(),
          },
          select: {
            Id_Message: true,
          },
        })

        return tx.t_message_attachment.create({
          data: {
            Id_Message: placeholderMessage.Id_Message,
            File_Name: originalName,
            File_Path: uniqueName,
            File_Size: file.size,
            Mime_Type: file.type,
          },
          select: {
            Id_Attachment: true,
            File_Name: true,
            Mime_Type: true,
            File_Size: true,
          },
        })
      })

      return apiOk({
        id: attachment.Id_Attachment,
        fileName: attachment.File_Name,
        mimeType: attachment.Mime_Type,
        size: attachment.File_Size,
      })
    } catch (error) {
      log.error("chat/attachments", "upload_error", { error })
      return apiError(500, "upload_failed", "Erreur lors de l'upload")
    }
  }
)
