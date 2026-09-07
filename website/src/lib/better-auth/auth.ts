import bcrypt from "bcryptjs"
import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { username } from "better-auth/plugins"

import { createBetterAuthDatabase } from "@/lib/better-auth/database"
import {
  resolveVigiSensysBusinessIdentity,
  type VigiSensysBusinessIdentityResolver,
} from "@/lib/better-auth/vigisensys-identity"

export const BETTER_AUTH_BASE_PATH = "/api/auth-v2"
export const BETTER_AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24
export const BETTER_AUTH_BCRYPT_ROUNDS = 10

const TRUE_VALUES = new Set(["1", "true", "yes", "on"])

export const betterAuthPassword = {
  hash: (password: string) => bcrypt.hash(password, BETTER_AUTH_BCRYPT_ROUNDS),
  verify: ({ hash, password }: { hash: string; password: string }) =>
    bcrypt.compare(password, hash),
}

export type CreateVigiSensysBetterAuthOptions = {
  allowProvisioning?: boolean
  baseURL?: string
  databaseUrl?: string
  secret?: string
  resolveBusinessIdentity?: VigiSensysBusinessIdentityResolver
}

function requireBetterAuthSecret(explicitSecret?: string) {
  const secret = explicitSecret?.trim() || process.env.BETTER_AUTH_SECRET?.trim()
  if (!secret || secret.length < 32) {
    throw new Error("[better-auth] BETTER_AUTH_SECRET must contain at least 32 characters")
  }
  return secret
}

function getBetterAuthBaseUrl(explicitBaseUrl?: string) {
  const configured =
    explicitBaseUrl?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[better-auth] BETTER_AUTH_URL is required in production")
    }
    return "http://localhost:3000"
  }

  const parsed = new URL(configured)
  if (!new Set(["http:", "https:"]).has(parsed.protocol)) {
    throw new Error("[better-auth] BETTER_AUTH_URL must use http or https")
  }
  return parsed.origin
}

function getProvisioningIdentityInput(body: unknown) {
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

export function isBetterAuthRuntimeEnabled() {
  const value = process.env.BETTER_AUTH_ENABLED?.trim().toLowerCase()
  return value ? TRUE_VALUES.has(value) : false
}

export function createVigiSensysBetterAuth(options: CreateVigiSensysBetterAuthOptions = {}) {
  const allowProvisioning = options.allowProvisioning === true
  const resolveBusinessIdentity =
    options.resolveBusinessIdentity ?? resolveVigiSensysBusinessIdentity
  const baseURL = getBetterAuthBaseUrl(options.baseURL)

  return betterAuth({
    appName: "VigiSensys",
    baseURL,
    basePath: BETTER_AUTH_BASE_PATH,
    secret: requireBetterAuthSecret(options.secret),
    database: createBetterAuthDatabase(options.databaseUrl),
    trustedOrigins: [baseURL],
    disabledPaths: ["/is-username-available"],
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowProvisioning,
      autoSignIn: false,
      password: betterAuthPassword,
    },
    user: {
      modelName: "t_auth_user",
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
      modelName: "t_auth_session",
      expiresIn: BETTER_AUTH_SESSION_MAX_AGE_SECONDS,
      disableSessionRefresh: true,
      cookieCache: {
        enabled: false,
      },
    },
    account: {
      modelName: "t_auth_account",
    },
    verification: {
      modelName: "t_auth_verification",
    },
    advanced: {
      cookiePrefix: "vigisensys-auth-v2",
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!allowProvisioning || ctx.path !== "/sign-up/email") return

        const input = getProvisioningIdentityInput(ctx.body)
        if (!input) {
          throw new APIError("BAD_REQUEST", {
            message: "VigiSensys account mapping failed",
          })
        }

        const identity = await resolveBusinessIdentity(input)
        if (!identity || identity.login !== input.username) {
          throw new APIError("BAD_REQUEST", {
            message: "VigiSensys account mapping failed",
          })
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
              throw new APIError("BAD_REQUEST", {
                message: "VigiSensys account mapping failed",
              })
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

let betterAuthSingleton: ReturnType<typeof createVigiSensysBetterAuth> | null = null

export function getVigiSensysBetterAuth() {
  if (!betterAuthSingleton) {
    betterAuthSingleton = createVigiSensysBetterAuth()
  }
  return betterAuthSingleton
}
