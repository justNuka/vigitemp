import { prisma } from "@/lib/prisma"
import { decryptSmtpPassword } from "@/lib/secret-crypto"
import { isSmtpConfigurationComplete, parseSmtpBoolean } from "@/lib/smtp-config-contract"

export const SMTP_SECTION = "SECURITE_EMAIL"

export const SMTP_KEYS = {
  enabled: "SMTP_ACTIVATION",
  host: "SMTP_SERVEUR",
  port: "SMTP_PORT",
  user: "SMTP_UTILISATEUR",
  password: "SMTP_MOT_DE_PASSE",
  sender: "SMTP_EXPEDITEUR",
  confirmed: "SMTP_CONFIRME",
  verificationHash: "SMTP_VERIFICATION_HASH",
  verificationExpiresAt: "SMTP_VERIFICATION_EXPIRES_AT",
  verificationAttempts: "SMTP_VERIFICATION_ATTEMPTS",
  verificationRecipient: "SMTP_VERIFICATION_RECIPIENT",
} as const

const SMTP_VERIFICATION_KEYS = [
  SMTP_KEYS.verificationHash,
  SMTP_KEYS.verificationExpiresAt,
  SMTP_KEYS.verificationAttempts,
  SMTP_KEYS.verificationRecipient,
] as const

export type SmtpConfigState = {
  enabled: boolean
  host: string
  port: number
  user: string
  password: string
  sender: string
  passwordConfigured: boolean
  configured: boolean
  confirmed: boolean
  confirmationExplicit: boolean
}

export async function getSmtpConfigState({
  includePassword = false,
}: {
  includePassword?: boolean
} = {}): Promise<SmtpConfigState> {
  const params = await prisma.t_parametre.findMany({
    where: { Section: SMTP_SECTION },
    select: { Mot_Cle: true, Valeur: true },
  })

  const values = new Map(
    params.map((param) => [param.Mot_Cle, param.Valeur ?? ""]),
  )

  const encryptedPassword = values.get(SMTP_KEYS.password) ?? ""
  const passwordConfigured = Boolean(encryptedPassword.trim())
  const port = Number.parseInt(values.get(SMTP_KEYS.port) || "587", 10)

  const config = {
    enabled: parseSmtpBoolean(values.get(SMTP_KEYS.enabled)),
    host: values.get(SMTP_KEYS.host) ?? "",
    port: Number.isFinite(port) ? port : 587,
    user: values.get(SMTP_KEYS.user) ?? "",
    password:
      includePassword && passwordConfigured
        ? decryptSmtpPassword(encryptedPassword)
        : "",
    sender: values.get(SMTP_KEYS.sender) || "noreply@vigitemp.fr",
    passwordConfigured,
  }

  const configured = isSmtpConfigurationComplete(config)
  const confirmationRaw = values.get(SMTP_KEYS.confirmed)
  const confirmationExplicit = confirmationRaw !== undefined

  // Existing installations predate SMTP_CONFIRME. Preserve their current
  // behavior until the SMTP details are modified for the first time.
  const confirmed = confirmationExplicit
    ? parseSmtpBoolean(confirmationRaw)
    : configured

  return {
    ...config,
    configured,
    confirmed,
    confirmationExplicit,
  }
}

export async function upsertSmtpParameter(
  key: string,
  value: string,
  comment?: string,
) {
  return prisma.t_parametre.upsert({
    where: {
      Section_Mot_Cle: {
        Section: SMTP_SECTION,
        Mot_Cle: key,
      },
    },
    update: {
      Valeur: value,
      ...(comment ? { Commentaire: comment } : {}),
    },
    create: {
      Section: SMTP_SECTION,
      Mot_Cle: key,
      Valeur: value,
      ...(comment ? { Commentaire: comment } : {}),
    },
  })
}

export async function setSmtpConfirmed(confirmed: boolean) {
  await upsertSmtpParameter(
    SMTP_KEYS.confirmed,
    confirmed ? "true" : "false",
    "Configuration SMTP validée par code email",
  )
}

export async function clearSmtpVerificationChallenge() {
  await prisma.t_parametre.deleteMany({
    where: {
      Section: SMTP_SECTION,
      Mot_Cle: { in: [...SMTP_VERIFICATION_KEYS] },
    },
  })
}
