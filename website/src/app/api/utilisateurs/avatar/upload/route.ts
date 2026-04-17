import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"

import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { log } from "@/lib/logger"

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_MIME = new Map<string, string>([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
])

export const POST = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      log.warn("AVATAR_UPLOAD", "Admin avatar upload rejected: missing file", { user: ctx.user.username, userId: ctx.user.userId, ip })
      return apiError(400, "missing_file", "Aucun fichier image fourni")
    }

    if (!ALLOWED_MIME.has(file.type)) {
      log.warn("AVATAR_UPLOAD", "Admin avatar upload rejected: invalid type", { user: ctx.user.username, userId: ctx.user.userId, ip, fileName: file.name, mimeType: file.type })
      return apiError(400, "invalid_type", "Type de fichier non supporte")
    }

    if (file.size > MAX_FILE_SIZE) {
      log.warn("AVATAR_UPLOAD", "Admin avatar upload rejected: file too large", { user: ctx.user.username, userId: ctx.user.userId, ip, fileName: file.name, size: file.size })
      return apiError(400, "file_too_large", "Fichier trop volumineux (max 2 Mo)")
    }

    const extension = ALLOWED_MIME.get(file.type) ?? (path.extname(file.name) || ".img")
    const filename = `${ctx.user.userId}_${Date.now()}_${randomUUID().slice(0, 8)}${extension}`

    const relativeDir = path.posix.join("uploads", "avatars")
    const absoluteDir = path.join(process.cwd(), "public", relativeDir)
    await mkdir(absoluteDir, { recursive: true })

    const bytes = Buffer.from(await file.arrayBuffer())
    const absoluteFilePath = path.join(absoluteDir, filename)
    await writeFile(absoluteFilePath, bytes)

    const publicUrl = `/${relativeDir}/${filename}`

    log.info("AVATAR_UPLOAD", "Admin avatar upload completed", { user: ctx.user.username, userId: ctx.user.userId, ip, fileName: file.name, size: file.size, url: publicUrl })

    return apiOk({ url: publicUrl })
  } catch (error) {
    log.error("AVATAR_UPLOAD", "Admin avatar upload failed", { user: ctx.user.username, userId: ctx.user.userId, ip, error: error instanceof Error ? error.message : String(error) })
    return apiError(500, "avatar_upload_failed", "Erreur lors de l'envoi de l'avatar")
  }
})
