import { prisma } from "@/lib/prisma"

export type VigiSensysBusinessIdentity = {
  id: number
  login: string
  email: string
}

export type VigiSensysBusinessIdentityResolver = (input: {
  email: string
  username?: string | null
}) => Promise<VigiSensysBusinessIdentity | null>

const TECHNICAL_EMAIL_DOMAIN = "auth.invalid"

export function getTechnicalBetterAuthEmail(userId: number) {
  return `vigisensys-user-${userId}@${TECHNICAL_EMAIL_DOMAIN}`
}

export async function resolveBetterAuthEmailForBusinessUser(input: {
  userId: number
  businessEmail?: string | null
}) {
  const businessEmail = input.businessEmail?.trim().toLowerCase() ?? ""
  if (!businessEmail) return getTechnicalBetterAuthEmail(input.userId)

  const usersWithEmail = await prisma.t_utilisateur.findMany({
    where: {
      Adresse_Email: input.businessEmail?.trim(),
      Est_Archive: false,
    },
    select: { Id_Utilisateur: true },
    take: 2,
  })

  if (usersWithEmail.length === 1 && usersWithEmail[0].Id_Utilisateur === input.userId) {
    return businessEmail
  }

  return getTechnicalBetterAuthEmail(input.userId)
}

export const resolveVigiSensysBusinessIdentity: VigiSensysBusinessIdentityResolver = async ({
  email,
  username,
}) => {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username?.trim() ?? ""
  if (!normalizedEmail || !normalizedUsername) return null

  const users = await prisma.t_utilisateur.findMany({
    where: {
      Login: normalizedUsername,
      Est_Archive: false,
    },
    select: {
      Id_Utilisateur: true,
      Login: true,
      Adresse_Email: true,
    },
    take: 2,
  })

  if (users.length !== 1) return null

  const user = users[0]
  const login = user.Login?.trim()
  if (!login) return null

  const authEmail = await resolveBetterAuthEmailForBusinessUser({
    userId: user.Id_Utilisateur,
    businessEmail: user.Adresse_Email,
  })
  if (authEmail.toLowerCase() !== normalizedEmail) return null

  return {
    id: user.Id_Utilisateur,
    login,
    email: authEmail,
  }
}
