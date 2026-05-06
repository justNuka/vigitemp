import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

const SMTP_PREFIX = "enc:smtp:v1:"
const TELEPHONY_PREFIX = "enc:telephony:v1:"
const TEAMS_PREFIX = "enc:teams:v1:"
const INSECURE_FALLBACK_SECRET = "your-secret-key-change-this-in-production"

function resolveSecretsKey(): Buffer {
  const envSecret = (process.env.SMTP_SECRET_KEY || process.env.APP_SECRET || process.env.JWT_SECRET || "").trim()
  const raw = envSecret || INSECURE_FALLBACK_SECRET

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex")
  }

  try {
    const b64 = Buffer.from(raw, "base64")
    if (b64.length === 32) return b64
  } catch {
    // ignore base64 parse failure
  }

  return createHash("sha256").update(raw, "utf8").digest()
}

function encryptWithPrefix(prefix: string, plain: string): string {
  if (!plain) return ""
  if (plain.startsWith(prefix)) return plain

  const key = resolveSecretsKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${prefix}${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`
}

function decryptWithPrefix(prefix: string, value: string): string {
  if (!value) return ""
  if (!value.startsWith(prefix)) return value

  const payload = value.slice(prefix.length)
  const parts = payload.split(".")
  if (parts.length !== 3) return ""

  try {
    const [ivB64, tagB64, encryptedB64] = parts
    const iv = Buffer.from(ivB64, "base64")
    const tag = Buffer.from(tagB64, "base64")
    const encrypted = Buffer.from(encryptedB64, "base64")
    const key = resolveSecretsKey()

    const decipher = createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
  } catch {
    return ""
  }
}

function hasPrefix(prefix: string, value: string | null | undefined): boolean {
  return !!value && value.startsWith(prefix)
}

export function encryptSmtpPassword(plain: string): string {
  return encryptWithPrefix(SMTP_PREFIX, plain)
}

export function decryptSmtpPassword(value: string): string {
  return decryptWithPrefix(SMTP_PREFIX, value)
}

export function isEncryptedSmtpPassword(value: string | null | undefined): boolean {
  return hasPrefix(SMTP_PREFIX, value)
}

export function encryptTelephonySecret(plain: string): string {
  return encryptWithPrefix(TELEPHONY_PREFIX, plain)
}

export function decryptTelephonySecret(value: string): string {
  return decryptWithPrefix(TELEPHONY_PREFIX, value)
}

export function isEncryptedTelephonySecret(value: string | null | undefined): boolean {
  return hasPrefix(TELEPHONY_PREFIX, value)
}

export function encryptTeamsSecret(plain: string): string {
  return encryptWithPrefix(TEAMS_PREFIX, plain)
}

export function decryptTeamsSecret(value: string): string {
  return decryptWithPrefix(TEAMS_PREFIX, value)
}

export function isEncryptedTeamsSecret(value: string | null | undefined): boolean {
  return hasPrefix(TEAMS_PREFIX, value)
}
