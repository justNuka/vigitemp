import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { isAdminDomainCode } from "@/lib/authorization-domain"

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

export async function isAdminUser(userId: number): Promise<boolean> {
  const profil = await getUserProfile(userId)
  if (!profil) return false

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    isAdminDomainCode(liaison.t_autorisation.Code_Autorisation),
  )
}

export async function hasUserAuthorizationCode(
  userId: number,
  code: string,
): Promise<boolean> {
  const profil = await getUserProfile(userId)
  if (!profil) return false
  if (profil.Profil_Utilisateur === "Administrateurs") return true

  return profil.t_liaison_profil_autorisation.some(
    (liaison) => liaison.t_autorisation.Code_Autorisation === code,
  )
}

export async function hasUserAnyAuthorizationCode(
  userId: number,
  codes: readonly string[],
): Promise<boolean> {
  if (codes.length === 0) return false

  const profil = await getUserProfile(userId)
  if (!profil) return false
  if (profil.Profil_Utilisateur === "Administrateurs") return true

  const expected = new Set(
    codes.map((c) => c.trim().toUpperCase()).filter(Boolean),
  )
  if (expected.size === 0) return false

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    expected.has(
      (liaison.t_autorisation.Code_Autorisation || "").trim().toUpperCase(),
    ),
  )
}
