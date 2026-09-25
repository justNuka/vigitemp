import nodemailer from "nodemailer"
import { render } from "@react-email/components"

import SmtpVerificationEmail from "../../emails/smtp-verification"
import { getGlobalAppLanguage } from "@/lib/app-language"
import { recordSystemEmailAuditSafely } from "@/lib/email-audit"
import { prisma } from "@/lib/prisma"
import {
  clearSmtpVerificationChallenge,
  getSmtpConfigState,
  setSmtpConfirmed,
  SMTP_KEYS,
  SMTP_SECTION,
  upsertSmtpParameter,
} from "@/lib/smtp-config"
import {
  generateSmtpVerificationCode,
  getSmtpVerificationSecret,
  hashSmtpVerificationCode,
  SMTP_VERIFICATION_MAX_ATTEMPTS,
  SMTP_VERIFICATION_TTL_MINUTES,
  verifySmtpVerificationHash,
} from "@/lib/smtp-verification-code"

type VerificationFailureReason =
  | "missing"
  | "expired"
  | "invalid"
  | "too_many_attempts"

export type SmtpVerificationResult =
  | { ok: true }
  | {
      ok: false
      reason: VerificationFailureReason
      attemptsLeft?: number
    }

function normalizeRecipient(value: string) {
  return value.trim().toLowerCase()
}

function parseAttempts(value: string | null | undefined) {
  const parsed = Number.parseInt(value || "0", 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export async function requestSmtpVerification(recipientInput: string) {
  const recipient = normalizeRecipient(recipientInput)
  const config = await getSmtpConfigState({ includePassword: true })

  if (!config.enabled) {
    throw new Error("smtp_disabled")
  }

  if (!config.configured || !config.password) {
    throw new Error("smtp_configuration_incomplete")
  }

  const code = generateSmtpVerificationCode()
  const expiresAtDate = new Date(
    Date.now() + SMTP_VERIFICATION_TTL_MINUTES * 60_000,
  )
  const expiresAt = expiresAtDate.toISOString()
  const secret = getSmtpVerificationSecret()
  const hash = hashSmtpVerificationCode({
    code,
    expiresAt,
    recipient,
    secret,
  })

  await Promise.all([
    upsertSmtpParameter(SMTP_KEYS.verificationHash, hash),
    upsertSmtpParameter(SMTP_KEYS.verificationExpiresAt, expiresAt),
    upsertSmtpParameter(SMTP_KEYS.verificationAttempts, "0"),
    upsertSmtpParameter(SMTP_KEYS.verificationRecipient, recipient),
  ])

  const locale = await getGlobalAppLanguage()
  const subject =
    locale === "en"
      ? "VigiSensys - SMTP verification code"
      : "VigiSensys - Code de validation SMTP"

  try {
    const html = await render(
      SmtpVerificationEmail({
        code,
        expiresInMinutes: SMTP_VERIFICATION_TTL_MINUTES,
        locale: locale === "en" ? "en" : "fr",
      }),
    )

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    })

    await transporter.sendMail({
      from: config.sender,
      to: recipient,
      subject,
      html,
    })

    await recordSystemEmailAuditSafely({
      metadata: { kind: "smtp_verification" },
      status: "sent",
      recipient,
      ccRecipients: [],
      subject,
      attempts: 1,
    })

    return {
      recipient,
      expiresAt,
      expiresInMinutes: SMTP_VERIFICATION_TTL_MINUTES,
    }
  } catch (error) {
    await clearSmtpVerificationChallenge()

    await recordSystemEmailAuditSafely({
      metadata: { kind: "smtp_verification" },
      status: "failed",
      recipient,
      ccRecipients: [],
      subject,
      attempts: 1,
      lastError: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}

export async function confirmSmtpVerification(
  codeInput: string,
): Promise<SmtpVerificationResult> {
  const rows = await prisma.t_parametre.findMany({
    where: {
      Section: SMTP_SECTION,
      Mot_Cle: {
        in: [
          SMTP_KEYS.verificationHash,
          SMTP_KEYS.verificationExpiresAt,
          SMTP_KEYS.verificationAttempts,
          SMTP_KEYS.verificationRecipient,
        ],
      },
    },
    select: { Mot_Cle: true, Valeur: true },
  })

  const values = new Map(
    rows.map((row) => [row.Mot_Cle, row.Valeur ?? ""]),
  )

  const expectedHash = values.get(SMTP_KEYS.verificationHash) ?? ""
  const expiresAt = values.get(SMTP_KEYS.verificationExpiresAt) ?? ""
  const recipient = values.get(SMTP_KEYS.verificationRecipient) ?? ""
  const attempts = parseAttempts(
    values.get(SMTP_KEYS.verificationAttempts),
  )

  if (!expectedHash || !expiresAt || !recipient) {
    return { ok: false, reason: "missing" }
  }

  if (attempts >= SMTP_VERIFICATION_MAX_ATTEMPTS) {
    await clearSmtpVerificationChallenge()
    return { ok: false, reason: "too_many_attempts", attemptsLeft: 0 }
  }

  const expiresAtMs = Date.parse(expiresAt)
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    await clearSmtpVerificationChallenge()
    return { ok: false, reason: "expired" }
  }

  const code = codeInput.trim()
  const valid = verifySmtpVerificationHash({
    expectedHash,
    code,
    expiresAt,
    recipient,
    secret: getSmtpVerificationSecret(),
  })

  if (!valid) {
    const nextAttempts = attempts + 1
    const attemptsLeft = Math.max(
      0,
      SMTP_VERIFICATION_MAX_ATTEMPTS - nextAttempts,
    )

    if (nextAttempts >= SMTP_VERIFICATION_MAX_ATTEMPTS) {
      await clearSmtpVerificationChallenge()
      return {
        ok: false,
        reason: "too_many_attempts",
        attemptsLeft: 0,
      }
    }

    await upsertSmtpParameter(
      SMTP_KEYS.verificationAttempts,
      String(nextAttempts),
    )

    return {
      ok: false,
      reason: "invalid",
      attemptsLeft,
    }
  }

  await setSmtpConfirmed(true)
  await clearSmtpVerificationChallenge()
  return { ok: true }
}
