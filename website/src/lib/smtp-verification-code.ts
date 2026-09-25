import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

export const SMTP_VERIFICATION_CODE_LENGTH = 6
export const SMTP_VERIFICATION_TTL_MINUTES = 10
export const SMTP_VERIFICATION_MAX_ATTEMPTS = 5

export function generateSmtpVerificationCode() {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(SMTP_VERIFICATION_CODE_LENGTH, "0")
}

export function getSmtpVerificationSecret() {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    throw new Error("JWT_SECRET is required for SMTP verification")
  }
  return secret
}

export function hashSmtpVerificationCode({
  code,
  expiresAt,
  recipient,
  secret,
}: {
  code: string
  expiresAt: string
  recipient: string
  secret: string
}) {
  return createHmac("sha256", secret)
    .update(`${code}|${expiresAt}|${recipient.trim().toLowerCase()}`)
    .digest("hex")
}

export function verifySmtpVerificationHash({
  expectedHash,
  code,
  expiresAt,
  recipient,
  secret,
}: {
  expectedHash: string
  code: string
  expiresAt: string
  recipient: string
  secret: string
}) {
  const actualHash = hashSmtpVerificationCode({
    code,
    expiresAt,
    recipient,
    secret,
  })

  const expected = Buffer.from(expectedHash, "hex")
  const actual = Buffer.from(actualHash, "hex")

  return (
    expected.length === actual.length &&
    expected.length > 0 &&
    timingSafeEqual(expected, actual)
  )
}
