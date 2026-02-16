import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

const SMTP_PREFIX = "enc:v1:"
const INSECURE_FALLBACK_SECRET = "your-secret-key-change-this-in-production"

function resolveSmtpKey(): Buffer {
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

export function encryptSmtpPassword(plain: string): string {
  if (!plain) return ""
  if (plain.startsWith(SMTP_PREFIX)) return plain

  const key = resolveSmtpKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${SMTP_PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`
}

export function decryptSmtpPassword(value: string): string {
  if (!value) return ""
  if (!value.startsWith(SMTP_PREFIX)) return value

  const payload = value.slice(SMTP_PREFIX.length)
  const parts = payload.split(".")
  if (parts.length !== 3) return ""

  try {
    const [ivB64, tagB64, encryptedB64] = parts
    const iv = Buffer.from(ivB64, "base64")
    const tag = Buffer.from(tagB64, "base64")
    const encrypted = Buffer.from(encryptedB64, "base64")
    const key = resolveSmtpKey()

    const decipher = createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)

    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
    return plain
  } catch {
    return ""
  }
}

export function isEncryptedSmtpPassword(value: string | null | undefined): boolean {
  return !!value && value.startsWith(SMTP_PREFIX)
}
