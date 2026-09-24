import type { User } from "@/lib/api"
import type { EditUserFormValues } from "./user-schemas"
import type { ProfileOption } from "./user-option-types"

function normalizeProfileName(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase()
}

export function resolveEditUserProfileName(
  user: User,
  profiles?: ProfileOption[],
): string {
  const current = user.role?.trim() ?? ""
  if (!current) return ""

  const exact = profiles?.find((profile) => profile.name === current)
  if (exact) return exact.name

  const normalized = normalizeProfileName(current)
  const normalizedMatch = profiles?.find(
    (profile) => normalizeProfileName(profile.name) === normalized,
  )
  return normalizedMatch?.name ?? current
}

export function getEditUserDefaults(
  user: User,
  profiles?: ProfileOption[],
): EditUserFormValues {
  return {
    username: user.username || "",
    nom: user.nom || "",
    prenom: user.prenom || "",
    email: user.email || "",
    profileId: resolveEditUserProfileName(user, profiles),
    hasExpiryDate: false,
    expiryDate: undefined,
    password: "",
    passwordConfirm: "",
    avatar: user.avatar || "",
  }
}

