import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { getRequestContext, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { generateToken } from "@/lib/jwt"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
})

export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)

  try {
    const body = await req.json()
    const { username, password } = loginSchema.parse(body)

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
    console.log(`[LOGIN-DEBUG] ${username} - Password valid: ${passwordValid}`)

    if (!passwordValid) {
      log.auth.login(username, ip, false, "Invalid password")
      return apiError(401, "invalid_credentials", "Invalid credentials")
    }

    // Vérifier l'expiration du mot de passe (paramètres CFR21)
    const cfr21Params = await prisma.t_parametre.findMany({
      where: { Section: "CFR21" },
      select: { Mot_Cle: true, Valeur: true },
    })

    console.log(`[LOGIN-DEBUG] ${username} - CFR21 Params:`, cfr21Params)

    const expiryEnabled =
      cfr21Params.find((p) => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")?.Valeur ===
        "1" ||
      cfr21Params
        .find((p) => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")
        ?.Valeur?.toLowerCase() === "true"

    const expiryDays = parseInt(
      cfr21Params.find((p) => p.Mot_Cle === "VALIDITE_MOT_DE_PASSE_JOURS")?.Valeur || "90",
    )

    console.log(
      `[LOGIN-DEBUG] ${username} - Expiry enabled: ${expiryEnabled}, Expiry days: ${expiryDays}`,
    )
    console.log(
      `[LOGIN-DEBUG] ${username} - Date_Derniere_Modification_MDP: ${user.Date_Derniere_Modification_MDP}`,
    )
    console.log(
      `[LOGIN-DEBUG] ${username} - Est_Mot_De_Passe_Temporaire: ${user.Est_Mot_De_Passe_Temporaire}`,
    )

    if (expiryEnabled && expiryDays > 0 && user.Date_Derniere_Modification_MDP) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(user.Date_Derniere_Modification_MDP).getTime()) /
          (1000 * 60 * 60 * 24),
      )

      console.log(
        `[LOGIN-DEBUG] ${username} - Days since last change: ${daysSinceLastChange} (threshold: ${expiryDays})`,
      )

      if (daysSinceLastChange >= expiryDays) {
        console.log(
          `[LOGIN-DEBUG] ${username} - PASSWORD EXPIRED: ${daysSinceLastChange} >= ${expiryDays}`,
        )
        return apiError(
          403,
          "password_expired",
          `Votre mot de passe a expiré (dernière modification il y a ${daysSinceLastChange} jours). Veuillez le changer.`,
          {
          requirePasswordChange: true,
          },
        )
      }
    }

    if (user.Est_Mot_De_Passe_Temporaire) {
      console.log(`[LOGIN-DEBUG] ${username} - TEMPORARY PASSWORD DETECTED`)
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

    // Authorizations relation is not available on `t_utilisateur` in the current schema,
    // so default to an empty array here.
    const authorizations: string[] = []

    const token = generateToken({
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
    }

    const response = apiOk(userData)

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    log.auth.login(username, ip, true, undefined, {
      userId: user.Id_Utilisateur,
      userProfile: user.Profil_Utilisateur || "user",
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "invalid_input", "Invalid input")
    }

    console.error("Login error:", error)
    return apiError(500, "internal_error", "Internal server error")
  }
})
