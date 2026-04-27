import path from "node:path"

const DEFAULT_UPLOADS_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads")

export function getAvatarUploadsDir() {
  const uploadsRoot = process.env.VIGITEMP_UPLOADS_DIR?.trim() || DEFAULT_UPLOADS_ROOT
  return path.join(uploadsRoot, "avatars")
}

export function toAvatarApiUrl(filename: string) {
  return `/api/uploads/avatars/${encodeURIComponent(filename)}`
}

export function normalizeAvatarValue(avatarValue: string | null | undefined) {
  if (!avatarValue) return null
  if (avatarValue.startsWith("/uploads/avatars/")) {
    const filename = avatarValue.split("/").pop() ?? ""
    if (!filename) return avatarValue
    return toAvatarApiUrl(filename)
  }
  if (!avatarValue.startsWith("/") && /\.(png|jpe?g|webp)$/i.test(avatarValue)) {
    return toAvatarApiUrl(avatarValue)
  }
  return avatarValue
}
