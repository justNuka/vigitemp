import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { NextRequest, NextResponse } from "next/server"

import { getAvatarUploadsDir } from "@/lib/avatar-storage"

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
}

function isSafeFilename(filename: string) {
  return /^[a-zA-Z0-9._-]+$/.test(filename)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const rawFilename = decodeURIComponent(filename || "")
  if (!rawFilename || !isSafeFilename(rawFilename)) {
    return NextResponse.json({ ok: false, error: "invalid_filename" }, { status: 400 })
  }

  const candidates = [
    path.join(getAvatarUploadsDir(), rawFilename),
    path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads", "avatars", rawFilename),
    path.join(/* turbopackIgnore: true */ process.cwd(), ".next", "standalone", "public", "uploads", "avatars", rawFilename),
  ]

  let avatarPath: string | null = null
  for (const candidate of candidates) {
    try {
      await access(candidate)
      avatarPath = candidate
      break
    } catch {
      // continue
    }
  }

  if (!avatarPath) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  const ext = path.extname(rawFilename).toLowerCase()
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream"
  const content = await readFile(avatarPath)

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  })
}
