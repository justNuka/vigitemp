import bcrypt from "bcryptjs"
import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { username } from "better-auth/plugins"

import { createBetterAuthPocDatabase } from "@/lib/better-auth/poc/database"
import {
  resolveBetterAuthPocBusinessIdentity,
  type BetterAuthPocBusinessIdentityResolver,
} from "@/lib/better-auth/poc/vigisensys-identity"

export const BETTER_AUTH_POC_BASE_PATH = "/api/auth-v2"
export const BETTER_AUTH_POC_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24
export const BETTER_AUTH_POC_BCRYPT_ROUNDS = 10

const TRUE_VALUES = new Set(["1", "true", "yes", "on"])

export const betterAuthPocPassword = {
  hash: (password: string) => bcrypt.hash(password, BETTER_AUTH_POC_BCRYPT_ROUNDS),
  verify: ({ hash, password }: { hash: string; password: string }) => bcrypt.compare(password, hash),
}

export type CreateBetterAuthPocOptions = {
  allowSignUp?: boolean
  baseURL?: string
  databaseUrl?: string
  secret?: string
  resolveBusinessIdentity?: BetterAuthPocBusinessIdentityResolver
}

function requireBetterAuthSecret(explicitSecret?: string) {
  const secret = explicitSecret?.trim() || process.env.BETTER_AUTH_SECRET?.trim()
  if (!secret || secret.length < 32) {
    throw new Error("[better-auth-poc] BETTER_AUTH_SECRET must contain at least 32 characters")
  }
  return secret
}

function getBetterAuthBaseUrl(explicitBaseUrl?: string) {
  const baseURL = explicitBaseUrl?.trim() || process.env.BETTER_AUTH_POC_BASE_URL?.trim() || "http://localhost:3000"
  const parsed = new URL(baseURL)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error("[better-auth-poc] BETTER_AUTH_POC_BASE_URL must use http or https")
  }
  return parsed.origin
}

function getSignUpIdentityInput(body: unknown) {
  if (!body || typeof body !== "object") return null
  const candidate = body as { email?: unknown; username?: unknown }
  if (typeof candidate.email !== "string" || typeof candidate.username !== "string") return null
  return {
    email: candidate.email,
    username: candidate.username,
  }
}

function isLegacyUsernameAllowed(value: string) {
  if (!value || value.length > 64) return false
  return !/[\u0000-\u001F\u007F]/.test(value)
}

export function isBetterAuthPocEnabled() {
  const value = process.env.BETTER_AUTH_POC_ENABLED?.trim().toLowerCase()
  return value ? TRUE_VALUES.has(value) : false
}

export function createBetterAuthPoc(options: CreateBetterAuthPocOptions = {}) {
  const allowSignUp = options.allowSignUp === true
  const resolveBusinessIdentity = options.resolveBusinessIdentity ?? resolveBetterAuthPocBusinessIdentity
  const baseURL = getBetterAuthBaseUrl(options.baseURL)

  return betterAuth({
    appName: "VigiSensys Better Auth PoC",
    baseURL,
    basePath: BETTER_AUTH_POC_BASE_PATH,
    secret: requireBetterAuthSecret(options.secret),
    database: createBetterAuthPocDatabase(options.databaseUrl),
    trustedOrigins: [baseURL],
    disabledPaths: ["/is-username-available"],
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowSignUp,
      autoSignIn: false,
      password: betterAuthPocPassword,
    },
    user: {
      modelName: "t_auth_poc_user",
      additionalFields: {
        vigisensysUserId: {
          type: "number",
          required: false,
          input: false,
          returned: true,
        },
      },
    },
    session: {
      modelName: "t_auth_poc_session",
      expiresIn: BETTER_AUTH_POC_SESSION_MAX_AGE_SECONDS,
      disableSessionRefresh: true,
      cookieCache: {
        enabled: false,
      },
    },
    account: {
      modelName: "t_auth_poc_account",
      identityStrategy: "provider-id",
    },
    verification: {
      modelName: "t_auth_poc_verification",
    },
    advanced: {
      cookiePrefix: "vigisensys-auth-poc",
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!allowSignUp || ctx.path !== "/sign-up/email") return

        const input = getSignUpIdentityInput(ctx.body)
        if (!input) {
          throw new APIError("BAD_REQUEST", { message: "VigiSensys account mapping failed" })
        }

        const identity = await resolveBusinessIdentity(input)
        if (!identity || identity.login !== input.username) {
          throw new APIError("BAD_REQUEST", { message: "VigiSensys account mapping failed" })
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const identity = await resolveBusinessIdentity({
              email: user.email,
              username:
                "username" in user && typeof user.username === "string"
                  ? user.username
                  : null,
            })

            if (!identity) {
              throw new APIError("BAD_REQUEST", { message: "VigiSensys account mapping failed" })
            }

            return {
              data: {
                ...user,
                vigisensysUserId: identity.id,
              },
            }
          },
        },
      },
    },
    plugins: [
      username({
        minUsernameLength: 1,
        maxUsernameLength: 64,
        usernameValidator: isLegacyUsernameAllowed,
        usernameNormalization: false,
        displayUsername: false,
        immutableUsername: true,
      }),
    ],
  })
}

let betterAuthPocSingleton: ReturnType<typeof createBetterAuthPoc> | null = null

export function getBetterAuthPoc() {
  if (!betterAuthPocSingleton) {
    betterAuthPocSingleton = createBetterAuthPoc()
  }
  return betterAuthPocSingleton
}
