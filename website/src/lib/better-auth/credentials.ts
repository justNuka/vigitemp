import bcrypt from "bcryptjs"

import { createVigiSensysBetterAuth } from "@/lib/better-auth/auth"
import { resolveBetterAuthEmailForBusinessUser } from "@/lib/better-auth/vigisensys-identity"
import { prisma } from "@/lib/prisma"

type BetterAuthUserRow = {
  id: string
  email: string
  username: string | null
}

type BetterAuthAccountRow = {
  id: string
  password: string | null
}

type SignInExistingUserInput = {
  userId: number
  username: string
  businessEmail?: string | null
  displayName: string
  password: string
  legacyPasswordHash: string
  requestHeaders?: Headers
}

let provisioningAuth: ReturnType<typeof createVigiSensysBetterAuth> | null = null

function getProvisioningAuth() {
  if (!provisioningAuth) {
    provisioningAuth = createVigiSensysBetterAuth({ allowProvisioning: true })
  }
  return provisioningAuth
}

async function findBetterAuthUser(userId: number) {
  const rows = await prisma.$queryRaw<BetterAuthUserRow[]>`
    SELECT id, email, username
    FROM t_auth_user
    WHERE vigisensysUserId = ${userId}
  `

  if (rows.length > 1) {
    throw new Error(`[better-auth] Multiple auth identities mapped to VigiSensys user ${userId}`)
  }
  return rows[0] ?? null
}

async function ensureCredentialPassword(input: {
  authUserId: string
  password: string
  legacyPasswordHash: string
}) {
  const accounts = await prisma.$queryRaw<BetterAuthAccountRow[]>`
    SELECT id, password
    FROM t_auth_account
    WHERE userId = ${input.authUserId}
      AND providerId = 'credential'
  `

  if (accounts.length !== 1) {
    throw new Error(
      `[better-auth] Expected exactly one credential account for auth user ${input.authUserId}`,
    )
  }

  const currentHash = accounts[0].password
  if (currentHash && (await bcrypt.compare(input.password, currentHash))) return

  // Pendant la période de migration, t_utilisateur reste la source de vérité du mot de passe.
  // Le hash bcrypt déjà validé est recopié tel quel : aucun mot de passe en clair n'est persisté.
  await prisma.$executeRaw`
    UPDATE t_auth_account
    SET password = ${input.legacyPasswordHash}, updatedAt = ${new Date()}
    WHERE id = ${accounts[0].id}
  `
}

export async function signInExistingVigiSensysUser(input: SignInExistingUserInput) {
  const auth = getProvisioningAuth()
  const authEmail = await resolveBetterAuthEmailForBusinessUser({
    userId: input.userId,
    businessEmail: input.businessEmail,
  })

  let authUser = await findBetterAuthUser(input.userId)

  if (!authUser) {
    await auth.api.signUpEmail({
      headers: input.requestHeaders,
      body: {
        email: authEmail,
        name: input.displayName,
        password: input.password,
        username: input.username,
      },
    })
    authUser = await findBetterAuthUser(input.userId)
    if (!authUser) {
      throw new Error(`[better-auth] Provisioning did not create auth user for ${input.userId}`)
    }
  }

  if (authUser.username !== input.username || authUser.email.toLowerCase() !== authEmail.toLowerCase()) {
    throw new Error(`[better-auth] Auth identity mismatch for VigiSensys user ${input.userId}`)
  }

  await ensureCredentialPassword({
    authUserId: authUser.id,
    password: input.password,
    legacyPasswordHash: input.legacyPasswordHash,
  })

  return auth.api.signInUsername({
    returnHeaders: true,
    headers: input.requestHeaders,
    body: {
      username: input.username,
      password: input.password,
    },
  })
}
