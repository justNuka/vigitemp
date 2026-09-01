import { NextRequest, NextResponse } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { prismaChat } from "@/lib/prisma-chat"
import { log } from "@/lib/logger"
import { readFile } from "fs/promises"
import { join } from "path"
import type { JWTPayload } from "@/lib/jwt"

type RouteParams = { params: Promise<{ id: string }> }

const UPLOAD_DIR = join(process.cwd(), "uploads", "chat")

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const attachmentId = parseInt(idParam, 10)
      if (isNaN(attachmentId) || attachmentId <= 0) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const attachment = await prismaChat.t_message_attachment.findUnique({
        where: { Id_Attachment: attachmentId },
        select: {
          Id_Attachment: true,
          Id_Message: true,
          File_Name: true,
          File_Path: true,
          Mime_Type: true,
          File_Size: true,
          message: { select: { Id_Conversation: true } },
        },
      })

      if (!attachment) return apiError(404, "not_found", "Pièce jointe introuvable")

      // Verify user is member of the conversation
      const convId = attachment.message?.Id_Conversation
      if (!convId) return apiError(404, "not_found", "Pièce jointe orpheline")

      const isMember = await verifyParticipant(convId, ctx.user.userId)
      if (!isMember) return apiError(403, "not_participant", "Non membre")

      const filePath = join(UPLOAD_DIR, attachment.File_Path)
      const buffer = await readFile(filePath)

      const isInline =
        attachment.Mime_Type.startsWith("image/") || attachment.Mime_Type === "application/pdf"

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": attachment.Mime_Type,
          "Content-Length": String(attachment.File_Size),
          "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="${attachment.File_Name}"`,
          "Cache-Control": "private, max-age=3600",
        },
      })
    } catch (error) {
      log.error("chat/attachments/download", "download_error", { error })
      return apiError(500, "download_failed", "Erreur lors du téléchargement")
    }
  }
)
