import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { sendEmail, isEmailEnabled } from "@/lib/email"
import AccountCreationEmail from "../../../../emails/email-account-creation"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { auditRouteCreate } from "@/lib/audit-route"
import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { revalidateTag } from "next/cache"
import { apiError, apiOk } from "@/lib/api-response"
import { getUserAvatarMap, setUserAvatarValue } from "@/lib/user-avatar-db"
import { getGlobalAppLanguage } from "@/lib/app-language"
import { canUseApplicationEmail } from "@/lib/license-email"
import { serializeDbDateTime } from "@/lib/date-display"
import { getPasswordRulesFromDb } from "@/lib/password-rules"
import { validatePassword } from "@/lib/password-validation"
import { getLocalizedPublicAppUrl } from "@/lib/public-app-url"

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(1, "Password required"),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.union([z.literal(""), z.string().email("Email invalide")]).optional().transform((value) => value || undefined),
  profileId: z.string().min(1, "Profil requis"),
  telephone: z.string().optional(),
  expiryDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  avatar: z.string().trim().max(512).nullable().optional(),
})

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const users = await prisma.t_utilisateur.findMany({
      where: { Est_Archive: false },
      orderBy: { Login: "asc" },
    })

    const avatarMap = await getUserAvatarMap(users.map((user) => user.Id_Utilisateur))

    const formatted = users.map((user) => ({
      id: user.Id_Utilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.Profil_Utilisateur || "user",
      status: !user.Est_Archive ? "active" : "inactive",
      createdAt: serializeDbDateTime(user.Date_Creation),
      email: user.Adresse_Email || null,
      avatar: avatarMap.get(user.Id_Utilisateur) ?? null,
    }))

    return apiOk(formatted)
  } catch (error) {
    log.error("utilisateurs", "get_users_error", { error: error })
    return apiError(500, "users_fetch_failed", "Failed to fetch users")
  }
})

export const POST = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createUserSchema.parse(body)

    const passwordRules = await getPasswordRulesFromDb()
    const passwordValidation = validatePassword(data.password, passwordRules)
    if (!passwordValidation.isValid) {
      return apiError(
        400,
        "password_rules_failed",
        "Le mot de passe ne respecte pas les règles de sécurité",
        { details: passwordValidation.errors },
      )
    }

    const existing = await prisma.t_utilisateur.findFirst({
      where: { Login: data.username, Est_Archive: false },
    })

    if (existing) {
      return apiError(400, "duplicate", "Username already exists")
    }

    const temporaryPassword = data.password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.t_utilisateur.create({
      data: {
        Login: data.username,
        Mot_De_Passe: hashedPassword,
        Prenom: data.prenom,
        Nom: data.nom,
        Adresse_Email: data.email || null,
        Tel_Num_Mobile: data.telephone || null,
        Profil_Utilisateur: data.profileId,
        Est_Archive: false,
        Date_Creation: new Date(),
        Date_Derniere_Modification_MDP: new Date(),
        Date_Validite: data.expiryDate || null,
        Est_Mot_De_Passe_Temporaire: true,
      },
    })

    if (data.avatar !== undefined) {
      const avatarSaved = await setUserAvatarValue(user.Id_Utilisateur, data.avatar || null)
      if (!avatarSaved) {
        return apiError(500, "avatar_update_unavailable", "Impossible d'enregistrer l'avatar")
      }
    }

    log.data.create("Utilisateur", user.Id_Utilisateur, ctx.user.username, ctx.user.userId, ip, {
      username: user.Login,
      email: user.Adresse_Email,
      profile: user.Profil_Utilisateur,
      avatar: data.avatar ?? null,
    })

    auditRouteCreate(req, ctx.user, {
      resource: "Utilisateur",
      resourceId: user.Id_Utilisateur,
      data: {
        Login: user.Login,
        Nom: user.Nom,
        Prenom: user.Prenom,
        Adresse_Email: user.Adresse_Email,
        Profil_Utilisateur: user.Profil_Utilisateur,
        Date_Validite: user.Date_Validite,
        Est_Mot_De_Passe_Temporaire: user.Est_Mot_De_Passe_Temporaire,
        Avatar: data.avatar ?? null,
      },
      reason: `Creation utilisateur ${user.Login}`,
    })

    const emailLicense = data.email ? await canUseApplicationEmail() : null
    if (data.email && emailLicense?.allowed && (await isEmailEnabled())) {
      const mailLocale = await getGlobalAppLanguage()
      const loginUrl = getLocalizedPublicAppUrl("/login", mailLocale, req)

      try {
        const delivery = await sendEmail({
          to: data.email,
          subject:
            mailLocale === "en"
              ? "Your VigiSensys account has been created"
              : "Votre compte VigiSensys a été créé",
          audit: { kind: "account_creation", context: data.username },
          react: AccountCreationEmail({
            username: data.username,
            temporaryPassword,
            loginUrl,
            firstName: data.prenom,
            lastName: data.nom,
            locale: mailLocale,
          }),
        })

        if (delivery.success) {
          log.info("UTILISATEURS", "account_creation_email_sent", { email: data.email })
        } else {
          log.error("UTILISATEURS", "account_creation_email_delivery_failed", {
            email: data.email,
            error: delivery.error ?? "unknown_email_delivery_error",
          })
        }
      } catch (emailError) {
        log.error("utilisateurs", "utilisateurs_api_failed_to_send_account_creation_email", { error: emailError })
      }
    } else if (data.email && emailLicense && !emailLicense.allowed) {
      log.info("UTILISATEURS", "account_creation_email_blocked_by_license", {
        email: data.email,
        reason: emailLicense.reason,
        edition: emailLicense.license?.edition,
      })
    }

    revalidateTag("users-data", "default")

    return apiOk(
      {
        id: user.Id_Utilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.Profil_Utilisateur || "user",
        status: "active",
        avatar: data.avatar ?? null,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }))
      return apiError(
        400,
        "validation_error",
        details[0]?.message ?? "Invalid input",
        { details },
      )
    }

    log.error("utilisateurs", "create_user_error", { error: error })
    return apiError(500, "user_create_failed", "Failed to create user")
  }
})
