import { prisma } from "@/lib/prisma"
import { validateLicense } from "@/lib/license-server"
import { ACCESS_COOKIE_MAX_AGE_SECONDS } from "@/lib/jwt"

const UNLIMITED_VALUES = new Set([
  "unlimited",
  "illimite",
  "illimites",
  "illimité",
  "illimités",
  "infinite",
  "infini",
  "∞",
])

export type UserLicenseCapacity =
  | {
      allowed: true
      connectedUsers: number
      licensedMaxUsers: number | null
      effectiveMaxUsers: number | null
      unlimited: boolean
    }
  | {
      allowed: false
      reason: "license_invalid" | "user_limit_reached"
      message: string
      connectedUsers: number
      licensedMaxUsers: number | null
      effectiveMaxUsers: number | null
      unlimited: boolean
    }

export function parseLicensedUserLimit(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null

  const normalized = String(value).trim().toLowerCase()
  if (!normalized || UNLIMITED_VALUES.has(normalized)) return null

  const parsed = Number(normalized.replace(",", "."))
  if (!Number.isFinite(parsed)) return null

  const intValue = Math.trunc(parsed)
  return intValue > 0 ? intValue : null
}

export function computeEffectiveUserLimit(licensedMaxUsers: number | null): number | null {
  if (!licensedMaxUsers) return null

  return Math.ceil(licensedMaxUsers * 1.25)
}

export function getActiveUserSessionThreshold(now = new Date()): Date {
  return new Date(now.getTime() - ACCESS_COOKIE_MAX_AGE_SECONDS * 1000)
}

export async function countConnectedUsers(excludeUserId?: number, now = new Date()): Promise<number> {
  const activeSince = getActiveUserSessionThreshold(now)

  return prisma.t_utilisateur.count({
    where: {
      Est_Archive: false,
      Date_Heure_Derniere_Connexion: { gte: activeSince },
      ...(excludeUserId ? { Id_Utilisateur: { not: excludeUserId } } : {}),
    },
  })
}

export async function checkUserLicenseCapacity(
  additionalConnectedUsers = 1,
  excludeUserId?: number,
): Promise<UserLicenseCapacity> {
  const license = await validateLicense()
  const connectedUsers = await countConnectedUsers(excludeUserId)

  if (!license.ok) {
    return {
      allowed: false,
      reason: "license_invalid",
      message: "Licence invalide, connexion refusee",
      connectedUsers,
      licensedMaxUsers: null,
      effectiveMaxUsers: null,
      unlimited: false,
    }
  }

  const licensedMaxUsers = parseLicensedUserLimit(license.concurrentAccess)
  const effectiveMaxUsers = computeEffectiveUserLimit(licensedMaxUsers)

  if (!effectiveMaxUsers) {
    return {
      allowed: true,
      connectedUsers,
      licensedMaxUsers: null,
      effectiveMaxUsers: null,
      unlimited: true,
    }
  }

  const nextConnectedUsers = connectedUsers + Math.max(0, additionalConnectedUsers)
  if (nextConnectedUsers > effectiveMaxUsers) {
    return {
      allowed: false,
      reason: "user_limit_reached",
      message: `Limite utilisateurs connectes atteinte pour la licence (${connectedUsers}/${effectiveMaxUsers}, licence ${licensedMaxUsers})`,
      connectedUsers,
      licensedMaxUsers,
      effectiveMaxUsers,
      unlimited: false,
    }
  }

  return {
    allowed: true,
    connectedUsers,
    licensedMaxUsers,
    effectiveMaxUsers,
    unlimited: false,
  }
}
