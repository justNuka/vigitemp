import { NextRequest } from "next/server"
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
