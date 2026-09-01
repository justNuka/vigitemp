import { normalizeAvatarValue } from "@/lib/avatar-storage"

type AvatarPreset = {
  id: string
  start: string
  end: string
  assetPath: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "sky", start: "#0ea5e9", end: "#1d4ed8", assetPath: "/avatars/presets/sky.svg" },
  { id: "emerald", start: "#10b981", end: "#047857", assetPath: "/avatars/presets/emerald.svg" },
  { id: "amber", start: "#f59e0b", end: "#d97706", assetPath: "/avatars/presets/amber.svg" },
  { id: "rose", start: "#f43f5e", end: "#be123c", assetPath: "/avatars/presets/rose.svg" },
  { id: "violet", start: "#8b5cf6", end: "#6d28d9", assetPath: "/avatars/presets/violet.svg" },
  { id: "slate", start: "#64748b", end: "#334155", assetPath: "/avatars/presets/slate.svg" },
  { id: "teal", start: "#14b8a6", end: "#0f766e", assetPath: "/avatars/presets/teal.svg" },
  { id: "indigo", start: "#6366f1", end: "#4338ca", assetPath: "/avatars/presets/indigo.svg" },
]

const AVATAR_PREFIX = "preset:"

export function isAvatarPreset(value: string | null | undefined) {
  return Boolean(value && value.startsWith(AVATAR_PREFIX))
}

export function getAvatarPresetId(value: string | null | undefined) {
  if (!isAvatarPreset(value)) return null
  return value!.slice(AVATAR_PREFIX.length)
}

export function toAvatarPresetValue(presetId: string) {
  return `${AVATAR_PREFIX}${presetId}`
}

export function getInitialsForAvatar(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  login: string | null | undefined,
) {
  const first = (firstName ?? "").trim().charAt(0)
  const last = (lastName ?? "").trim().charAt(0)
  const both = `${first}${last}`.toUpperCase()
  if (both.trim().length > 0) return both.slice(0, 2)
  return (login ?? "VT").trim().toUpperCase().slice(0, 2) || "VT"
}

export function resolveAvatarSrc(
  avatarValue: string | null | undefined,
  _initials: string,
): string | null {
  if (!avatarValue) return null
  if (!isAvatarPreset(avatarValue)) return normalizeAvatarValue(avatarValue)

  const presetId = getAvatarPresetId(avatarValue)
  if (!presetId) return null

  return AVATAR_PRESETS.find((item) => item.id === presetId)?.assetPath ?? null
}
