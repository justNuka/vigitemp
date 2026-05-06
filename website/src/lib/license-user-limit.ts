import { prisma } from "@/lib/prisma"
import { validateLicense } from "@/lib/license-server"

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
      activeUsers: number
      licensedMaxUsers: number | null
      effectiveMaxUsers: number | null
      unlimited: boolean
    }
  | {
      allowed: false
      reason: "license_invalid" | "user_limit_reached"
      message: string
      activeUsers: number
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

export async function checkUserLicenseCapacity(additionalActiveUsers = 1): Promise<UserLicenseCapacity> {
  const license = await validateLicense()
  const activeUsers = await prisma.t_utilisateur.count({
    where: { Est_Archive: false },
  })

  if (!license.ok) {
    return {
      allowed: false,
      reason: "license_invalid",
      message: "Licence invalide, creation ou reactivation utilisateur refusee",
      activeUsers,
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
      activeUsers,
      licensedMaxUsers: null,
      effectiveMaxUsers: null,
      unlimited: true,
    }
  }

  const nextActiveUsers = activeUsers + Math.max(0, additionalActiveUsers)
  if (nextActiveUsers > effectiveMaxUsers) {
    return {
      allowed: false,
      reason: "user_limit_reached",
      message: `Limite utilisateurs atteinte pour la licence (${activeUsers}/${effectiveMaxUsers}, licence ${licensedMaxUsers})`,
      activeUsers,
      licensedMaxUsers,
      effectiveMaxUsers,
      unlimited: false,
    }
  }

  return {
    allowed: true,
    activeUsers,
    licensedMaxUsers,
    effectiveMaxUsers,
    unlimited: false,
  }
}
