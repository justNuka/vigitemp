import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getPermissionAliases } from "@/lib/permissions"

const ADMIN_ACCESS_CODES = getPermissionAliases("DASHBOARD_ADMIN_ACCESS")

function normalizeCode(code: string | null | undefined): string {
  return (code ?? "").trim().toUpperCase()
}

/**
 * Cached per-request: deduplicates identical userId profile lookups within
 * a single Next.js App Router request tree (React 19 cache() scoping).
 *
 * Returns null if the user or their profile does not exist.
 */
const getUserProfile = cache(async (userId: number) => {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  })
  if (!user?.Profil_Utilisateur) return null

  return prisma.t_profil.findUnique({
    where: { Profil_Utilisateur: user.Profil_Utilisateur },
    select: {
      Profil_Utilisateur: true,
      t_liaison_profil_autorisation: {
        select: {
          Id_Autorisation: true,
          t_autorisation: {
            select: {
              Code_Autorisation: true,
            },
          },
        },
      },
    },
  })
})

function profileHasAnyAuthorization(
  profil: Awaited<ReturnType<typeof getUserProfile>>,
  codes: readonly string[],
): boolean {
  if (!profil) return false

  const expected = new Set(codes.map((code) => normalizeCode(code)).filter(Boolean))
  if (expected.size === 0) return false

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    expected.has(normalizeCode(liaison.t_autorisation.Code_Autorisation)),
  )
}

export async function getUserAuthorizationCodes(userId: number): Promise<string[]> {
  const profil = await getUserProfile(userId)
  if (!profil) return []

  return Array.from(
    new Set(
      profil.t_liaison_profil_autorisation
        .map((liaison) => normalizeCode(liaison.t_autorisation.Code_Autorisation))
        .filter(Boolean),
    ),
  )
}

export async function isAdminUser(userId: number): Promise<boolean> {
  const authorizations = await getUserAuthorizationCodes(userId)
  return authorizations.some((code) =>
    ADMIN_ACCESS_CODES.some((adminCode) => normalizeCode(adminCode) === code),
  )
}

export async function hasUserAuthorizationCode(
  userId: number,
  code: string,
): Promise<boolean> {
  const profil = await getUserProfile(userId)
  if (!profil) return false

  if (profileHasAnyAuthorization(profil, ADMIN_ACCESS_CODES)) return true

  const expected = normalizeCode(code)
  if (!expected) return false

  return profil.t_liaison_profil_autorisation.some(
    (liaison) => normalizeCode(liaison.t_autorisation.Code_Autorisation) === expected,
  )
}

export async function hasUserAnyAuthorizationCode(
  userId: number,
  codes: readonly string[],
): Promise<boolean> {
  if (codes.length === 0) return false

  const profil = await getUserProfile(userId)
  if (!profil) return false

  if (profileHasAnyAuthorization(profil, ADMIN_ACCESS_CODES)) return true

  return profileHasAnyAuthorization(profil, codes)
}
