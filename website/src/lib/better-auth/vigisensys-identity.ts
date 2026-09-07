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

export const resolveVigiSensysBusinessIdentity: VigiSensysBusinessIdentityResolver = async ({
  email,
  username,
}) => {
  const normalizedEmail = email.trim()
  const normalizedUsername = username?.trim() ?? ""
  if (!normalizedEmail || !normalizedUsername) return null

  const users = await prisma.t_utilisateur.findMany({
    where: {
      Adresse_Email: normalizedEmail,
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
  const businessEmail = user.Adresse_Email?.trim()
  if (!login || !businessEmail) return null

  return {
    id: user.Id_Utilisateur,
    login,
    email: businessEmail,
  }
}
