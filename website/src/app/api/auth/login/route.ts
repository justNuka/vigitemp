import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { getClientIp, getRequestContext, withLogging } from "@/lib/api-logger"
import { checkRateLimit } from "@/lib/rate-limiter"
import { apiError, apiOk } from "@/lib/api-response"
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/jwt"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { shouldUseSecureCookies } from "@/lib/cookie-security"
import { getCompatHeader } from "@/lib/vigisensys-compat"
import { checkUserLicenseCapacity } from "@/lib/license-user-limit"
import { isBetterAuthRuntimeEnabled } from "@/lib/better-auth/auth"
import { signInExistingVigiSensysUser } from "@/lib/better-auth/credentials"
import { appendBetterAuthResponseHeaders } from "@/lib/better-auth/response-headers"
import { getUserAuthorizationCodes } from "@/lib/authz"

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
  machineName: z.string().trim().min(1).optional(),
})

function normalizeIpForDb(value: string): string {
  if (!value) return value
  let ip = value
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7)
  }
  return ip.length > 15 ? ip.slice(0, 15) : ip
}

export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)
  const ipForDb = normalizeIpForDb(ip)

  const rateLimit = checkRateLimit(`login:${getClientIp(req)}`, 10, 15 * 60_000)
  if (!rateLimit.allowed) {
    return apiError(429, "too_many_requests", "Trop de tentatives. Réessayez plus tard.")
  }

  try {
    const body = await req.json()
    const { username, password, machineName } = loginSchema.parse(body)

    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Login: username,
        Est_Archive: false,
      },
    })

    if (!user) {
      log.auth.login(username, ip, false, "User not found")
      return apiError(401, "invalid_credentials", "Invalid credentials")
    }

    if (!user.Mot_De_Passe) {
      log.auth.login(username, ip, false, "No password set")
      return apiError(401, "invalid_credentials", "Invalid credentials")
    }

    const passwordValid = await bcrypt.compare(password, user.Mot_De_Passe as string)
    const isFirstLogin = user.Date_Heure_Derniere_Connexion == null

    if (!passwordValid) {
      log.auth.login(username, ip, false, "Invalid password")
      return apiError(401, "invalid_credentials", "Invalid credentials")
    }

    // Vérifier l'expiration du mot de passe (paramètres CFR21)
    const cfr21Params = await prisma.t_parametre.findMany({
      where: { Section: "CFR21" },
      select: { Mot_Cle: true, Valeur: true },
    })

    const expiryEnabled =
      cfr21Params.find((p) => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")?.Valeur ===
        "1" ||
      cfr21Params
        .find((p) => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")
        ?.Valeur?.toLowerCase() === "true"

    const expiryDays = parseInt(
      cfr21Params.find((p) => p.Mot_Cle === "VALIDITE_MOT_DE_PASSE_JOURS")?.Valeur || "90",
    )
    const passwordValidityDays = Number.isFinite(expiryDays) && expiryDays > 0 ? expiryDays : null

    let passwordExpiryWarningDays: number | null = null

    if (expiryEnabled && expiryDays > 0 && user.Date_Derniere_Modification_MDP) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(user.Date_Derniere_Modification_MDP).getTime()) /
          (1000 * 60 * 60 * 24),
      )

      if (daysSinceLastChange >= expiryDays) {
        return apiError(
          403,
          "password_expired",
          `Votre mot de passe a expiré (dernière modification il y a ${daysSinceLastChange} jours). Veuillez le changer.`,
          {
            requirePasswordChange: true,
          },
        )
      }

      const daysRemaining = expiryDays - daysSinceLastChange
      if (daysRemaining > 0 && daysRemaining <= 7) {
        passwordExpiryWarningDays = daysRemaining
      }
    }

    if (user.Est_Mot_De_Passe_Temporaire) {
      return apiError(
        403,
        "temporary_password",
        "Vous devez changer votre mot de passe temporaire avant de continuer.",
        {
          requirePasswordChange: true,
          userId: user.Id_Utilisateur,
        },
      )
    }

    const sessionCapacity = await checkUserLicenseCapacity(1, user.Id_Utilisateur)
    if (!sessionCapacity.allowed) {
      return apiError(
        403,
        sessionCapacity.reason,
        sessionCapacity.message,
        {
          connectedUsers: sessionCapacity.connectedUsers,
          licensedMaxUsers: sessionCapacity.licensedMaxUsers,
          effectiveMaxUsers: sessionCapacity.effectiveMaxUsers,
          unlimited: sessionCapacity.unlimited,
        },
      )
    }

    // Keep authorization claims in the signed tokens so diagnostic endpoints
    // can remain usable even when the main database becomes unavailable later.
    const authorizations = await getUserAuthorizationCodes(user.Id_Utilisateur)

    // La période de transition conserve les JWT pour les consommateurs pas encore migrés,
    // mais Better Auth devient la session serveur testée lorsque le runtime est activé.
    let betterAuthHeaders: Headers | null = null
    if (isBetterAuthRuntimeEnabled()) {
      const displayName =
        `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user"
      const betterAuthSignIn = await signInExistingVigiSensysUser({
        userId: user.Id_Utilisateur,
        username: user.Login || username,
        businessEmail: user.Adresse_Email,
        displayName,
        password,
        legacyPasswordHash: user.Mot_De_Passe as string,
        requestHeaders: req.headers,
      })
      betterAuthHeaders = betterAuthSignIn.headers
    }

    const token = generateAccessToken({
      userId: user.Id_Utilisateur,
      username: user.Login || "user",
      profile: user.Profil_Utilisateur || "user",
      authorizations,
    })

    const userData = {
      id: user.Id_Utilisateur,
      username: user.Login || "user",
      displayName:
        `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      profile: user.Profil_Utilisateur || "user",
      authorizations,
      token,
      passwordExpiryWarningDays,
      isFirstLogin,
      passwordExpiryEnabled: expiryEnabled,
      passwordValidityDays,
      authEngine: isBetterAuthRuntimeEnabled() ? "better-auth-transition" : "legacy",
    }

    const response = apiOk(userData)

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: shouldUseSecureCookies(req),
      sameSite: "lax",
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    })
    const refreshToken = generateRefreshToken({
      userId: user.Id_Utilisateur,
      username: user.Login || "user",
      profile: user.Profil_Utilisateur || "user",
      authorizations,
    })
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: shouldUseSecureCookies(req),
      sameSite: "lax",
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    })

    // NextResponse.cookies peut reconstruire l'en-tête Set-Cookie. Les cookies Better Auth
    // doivent donc être ajoutés après toutes les mutations de cookies legacy.
    if (betterAuthHeaders) {
      appendBetterAuthResponseHeaders(response, betterAuthHeaders)
    }

    const headerMachineName =
      getCompatHeader(req, "x-vigisensys-machine-name", "x-vigitemp-machine-name") ||
      getCompatHeader(req, "x-vigisensys-machine", "x-vigitemp-machine") ||
      undefined
    const resolvedMachineName = machineName || headerMachineName || undefined
    const now = new Date()

    log.auth.login(username, ip, true, undefined, {
      userId: user.Id_Utilisateur,
      userProfile: user.Profil_Utilisateur || "user",
      changes: {
        machineName: resolvedMachineName,
        address: ip,
        connectedAt: now.toISOString(),
        authEngine: isBetterAuthRuntimeEnabled() ? "better-auth-transition" : "legacy",
      },
    })

    try {
      await prisma.t_utilisateur.update({
        where: { Id_Utilisateur: user.Id_Utilisateur },
        data: {
          Adresse_IP_Connexion: ipForDb,
          Nom_Machine_Connexion: resolvedMachineName,
          Date_Heure_Derniere_Connexion: now,
        },
      })
    } catch (err) {
      log.warn("AUTH", "Failed to update user login metadata", {
        username,
        ip,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    try {
      let updatedClient = null as null | {
        Id_Poste: number
        Nom_Machine_Connexion: string | null
        Adresse_IP_Connexion: string | null
      }

      if (resolvedMachineName) {
        updatedClient = await prisma.t_postes_clients.upsert({
          where: { Nom_Machine_Connexion: resolvedMachineName },
          update: {
            Adresse_IP_Connexion: ipForDb,
            Login: user.Login || undefined,
            Nom: user.Nom || undefined,
            Prenom: user.Prenom || undefined,
            Date_Heure_Derniere_Connexion: now,
          },
          create: {
            Nom_Machine_Connexion: resolvedMachineName,
            Adresse_IP_Connexion: ipForDb,
            Login: user.Login || undefined,
            Nom: user.Nom || undefined,
            Prenom: user.Prenom || undefined,
            Date_Heure_Derniere_Connexion: now,
          },
        })
      } else {
        const existingClient = await prisma.t_postes_clients.findFirst({
          where: { Adresse_IP_Connexion: ipForDb },
          orderBy: { Date_Heure_Derniere_Connexion: "desc" },
          select: { Id_Poste: true, Nom_Machine_Connexion: true, Adresse_IP_Connexion: true },
        })

        if (existingClient) {
          updatedClient = await prisma.t_postes_clients.update({
            where: { Id_Poste: existingClient.Id_Poste },
            data: {
              Login: user.Login || undefined,
              Nom: user.Nom || undefined,
              Prenom: user.Prenom || undefined,
              Date_Heure_Derniere_Connexion: now,
            },
          })
        } else {
          updatedClient = await prisma.t_postes_clients.create({
            data: {
              Adresse_IP_Connexion: ipForDb,
              Login: user.Login || undefined,
              Nom: user.Nom || undefined,
              Prenom: user.Prenom || undefined,
              Date_Heure_Derniere_Connexion: now,
            },
          })
        }
      }

      void updatedClient
    } catch (err) {
      log.warn("AUTH", "Failed to update client workstation info", {
        username,
        ip,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "invalid_input", "Invalid input")
    }

    log.error("AUTH", "Login error", {
      ip,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as { code?: string; meta?: unknown })?.code,
      meta: (error as { code?: string; meta?: unknown })?.meta,
    })
    return apiError(500, "internal_error", "Internal server error")
  }
})
