import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { sendEmail, isEmailEnabled } from "@/lib/email"
import AccountCreationEmail from "../../../../emails/email-account-creation"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAdminLogging, type HandlerContext } from "@/lib/api-wrappers"
import { revalidateTag } from "next/cache"
import { apiError, apiOk } from "@/lib/api-response"
import { getUserAvatarMap, setUserAvatarValue } from "@/lib/user-avatar-db"
import { getGlobalAppLanguage } from "@/lib/app-language"

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
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
      createdAt: user.Date_Creation?.toISOString() || null,
      email: user.Adresse_Email || null,
      avatar: avatarMap.get(user.Id_Utilisateur) ?? null,
    }))

    return apiOk(formatted)
  } catch (error) {
    log.error("utilisateurs", "get_users_error", { error: error });
    return apiError(500, "users_fetch_failed", "Failed to fetch users")
  }
})

export const POST = withAdminLogging(async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createUserSchema.parse(body)

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
        Adresse_Email: data.email,
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
    if (data.email && (await isEmailEnabled())) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`
      const mailLocale = await getGlobalAppLanguage()

      try {
        await sendEmail({
          to: data.email,
          subject:
            mailLocale === "en"
              ? "Your Vigitemp account has been created"
              : "Votre compte Vigitemp a ete cree",
          react: AccountCreationEmail({
            username: data.username,
            temporaryPassword,
            loginUrl,
            firstName: data.prenom,
            lastName: data.nom,
            locale: mailLocale,
          }),
        })
        log.info("UTILISATEURS", "account_creation_email_sent", { email: data.email })
      } catch (emailError) {
        log.error("utilisateurs", "utilisateurs_api_failed_to_send_account_creation_email", { error: emailError });
      }
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
      return apiError(400, "validation_error", "Invalid input")
    }

    log.error("utilisateurs", "create_user_error", { error: error });
    return apiError(500, "user_create_failed", "Failed to create user")
  }
})
